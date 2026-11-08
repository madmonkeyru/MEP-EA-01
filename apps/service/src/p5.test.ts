import { describe, it, expect } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { TokenLifecycleManager, hashPassword, verifyPassword } from './auth';
import { createFileAttemptRepository } from './repository';
import { createService } from './service';
import { createLearningPreviewCatalog } from '@mep-ea/content/expansion';
import { createPlatformApi, createTokenAuthProvider, EntitlementRequired } from '@mep-ea/api';
import { resolveBlueprint, parseBlueprint } from '@mep-ea/content';
import { initializeAttempt } from '@mep-ea/learning-runtime';

describe('P5.1 & P5.2 - Identity, Session Lifecycle, and Entitlement Gating', () => {
  it('hashes passwords with salt and verifies correctly', () => {
    const pwd = 'secret-password-123';
    const hash = hashPassword(pwd);
    expect(hash).toContain(':');
    expect(verifyPassword(pwd, hash)).toBe(true);
    expect(verifyPassword('wrong-password', hash)).toBe(false);
  });

  it('TokenLifecycleManager issues verifiable tokens and rejects expired/tampered tokens', async () => {
    const manager = new TokenLifecycleManager('test-secret-key-at-least-32-chars-long-123456');
    const { token, expiresAt } = manager.issueToken({ id: 'learner-1', tier: 'free', roles: ['learner'] }, 3600);
    expect(token).toBeDefined();
    expect(new Date(expiresAt).getTime()).toBeGreaterThan(Date.now());

    const session = await manager.verify(token);
    expect(session).not.toBeNull();
    expect(session?.learnerId).toBe('learner-1');
    expect(session?.tier).toBe('free');
    expect(session?.roles).toContain('learner');

    // Tampered token
    const tampered = token.slice(0, -4) + 'abcd';
    expect(await manager.verify(tampered)).toBeNull();

    // Expired token
    const expiredResult = manager.issueToken({ id: 'learner-1', tier: 'free', roles: ['learner'] }, -10);
    expect(await manager.verify(expiredResult.token)).toBeNull();
  });

  it('FileAttemptRepository stores and retrieves UserAccounts and updates tier', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'mep-auth-test-'));
    try {
      const repo = createFileAttemptRepository(dir);
      const account = {
        id: 'u1',
        username: 'teststudent',
        passwordHash: hashPassword('pass1234'),
        tier: 'free' as const,
        roles: ['learner' as const],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await repo.create(account);

      const byUser = await repo.findByUsername('teststudent');
      expect(byUser?.id).toBe('u1');
      expect(byUser?.tier).toBe('free');

      const byId = await repo.findById('u1');
      expect(byId?.username).toBe('teststudent');

      // Update tier to premium
      const updated = await repo.updateTier('u1', 'premium');
      expect(updated?.tier).toBe('premium');
      const byUserAfter = await repo.findByUsername('teststudent');
      expect(byUserAfter?.tier).toBe('premium');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('Service supports register, login, session inspection and Pro entitlement enforcement', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'mep-service-auth-'));
    try {
      const tokenManager = new TokenLifecycleManager('test-secret-key-at-least-32-chars-long-123456');
      const repo = createFileAttemptRepository(dir);
      const catalog = createLearningPreviewCatalog();
      // Add a benchmark mode blueprint that can resolve properly against catalog.registry
      const rawBenchmark = {
        id: 'bxm-mat-mock-benchmark',
        version: catalog.blueprints[0].version,
        programId: catalog.blueprints[0].programId,
        subjectId: catalog.blueprints[0].subjectId,
        convocatoriaId: catalog.blueprints[0].convocatoriaId,
        mode: 'benchmark' as const,
        stream: 'authored' as const,
        totalItems: 30,
        timeLimitSeconds: 5400,
        domainQuotas: catalog.blueprints[0].domainQuotas,
      };
      const benchmarkBlueprint = parseBlueprint(rawBenchmark);
      const testCatalog = {
        schemaVersion: 1 as const,
        version: 'test-v1',
        channel: 'development' as const,
        registry: catalog.registry,
        blueprints: [...catalog.blueprints, benchmarkBlueprint],
      };

      const service = createService({
        catalog: testCatalog,
        allowDevelopment: true,
        repository: repo,
        verifier: tokenManager,
        tokenManager,
      });

      // 1. Register a Free learner
      const regRes = await service.send({
        method: 'POST',
        path: '/v1/auth/register',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'learner_free', password: 'password123' }),
      });
      expect(regRes.status).toBe(200);
      const regBody = regRes.body as { token: string; session: { learnerId: string; tier: string } };
      expect(regBody.session.tier).toBe('free');

      // 2. Login
      const loginRes = await service.send({
        method: 'POST',
        path: '/v1/auth/login',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'learner_free', password: 'password123' }),
      });
      expect(loginRes.status).toBe(200);
      const loginBody = loginRes.body as { token: string; session: { learnerId: string; tier: string } };
      expect(loginBody.session.learnerId).toBe(regBody.session.learnerId);

      // 3. GET /v1/auth/session
      const sessionRes = await service.send({
        method: 'GET',
        path: '/v1/auth/session',
        headers: { Authorization: `Bearer ${loginBody.token}` },
      });
      expect(sessionRes.status).toBe(200);
      expect((sessionRes.body as { tier: string }).tier).toBe('free');

      // 4. Entitlement check: Free user attempting benchmark blueprint draft or attempt returns 403
      const compiledBenchmark = resolveBlueprint(benchmarkBlueprint, catalog.registry, { allowDraftPreview: true });
      const draft = initializeAttempt(compiledBenchmark, 'test-draft-benchmark', loginBody.session.learnerId, new Date().toISOString());

      const draftRes = await service.send({
        method: 'PUT',
        path: '/v1/drafts/test-draft-benchmark',
        headers: { Authorization: `Bearer ${loginBody.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schemaVersion: 1,
          baseRevision: 0,
          deviceId: 'device-1',
          attempt: draft,
        }),
      });
      expect(draftRes.status).toBe(403);
      expect((draftRes.body as { error: string }).error).toBe('entitlement_required');
      expect((draftRes.body as { requiredTier: string }).requiredTier).toBe('premium');

      // 5. Test createPlatformApi client mapping throws EntitlementRequired
      const authProvider = createTokenAuthProvider({
        kind: 'authenticated',
        learnerId: loginBody.session.learnerId,
        tier: 'free',
        roles: ['learner'],
        accessToken: loginBody.token,
        expiresAt: new Date(Date.now() + 3600_000).toISOString(),
      });
      const client = createPlatformApi(authProvider, { send: req => service.send(req) });

      await expect(client.saveDraft({
        schemaVersion: 1,
        baseRevision: 0,
        deviceId: 'device-1',
        attempt: draft,
      })).rejects.toThrow(EntitlementRequired);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
