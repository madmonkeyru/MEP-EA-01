import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createService } from './service';
import { createFileAttemptRepository } from './repository';
import { TokenLifecycleManager } from './auth';
import { createLearningPreviewCatalog } from '@mep-ea/content/expansion';
import { createTelemetryEvent, sanitizeTelemetryPayload } from '@mep-ea/analytics';
import { sanitizeLogContext } from './logger';

describe('P8.7 & P8.8: Security Audit & Operational Performance Benchmarks', () => {
  let tempDir: string;
  let service: ReturnType<typeof createService>;
  let tokenManager: TokenLifecycleManager;
  let authToken: string;
  let catalogPackage: any;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'p8-bench-test-'));
    const repository = createFileAttemptRepository(tempDir);
    tokenManager = new TokenLifecycleManager('test-secret-key-at-least-32-chars-long-123456');
    const catalog = createLearningPreviewCatalog();
    catalogPackage = {
      schemaVersion: 1 as const,
      version: 'p8-bench-v1',
      channel: 'development' as const,
      registry: catalog.registry,
      blueprints: catalog.blueprints,
    };

    service = createService({
      verifier: tokenManager,
      repository,
      catalog: catalogPackage,
      tokenManager,
      allowDevelopment: true,
    });

    const regRes = await service.send({
      method: 'POST',
      path: '/v1/auth/register',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'perf_learner', password: 'password123', tier: 'premium' }),
    });
    authToken = (regRes.body as any).token;
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('P8.8 Security: verifies zero PII, passwords, or tokens leak into telemetry or logs', () => {
    const sensitivePayload = {
      userPassword: 'plaintext-secret',
      tokenString: 'bearer-token-12345',
      userEmail: 'student@domain.cr',
      cedulaId: '1-0234-0567',
      authBearer: 'Bearer eyJhbGciOi...',
      safeInteraction: 'option_clicked',
      nested: {
        rawPassword: 'nested-pass',
        counter: 10,
      },
    };

    const sanitizedTelemetry = sanitizeTelemetryPayload(sensitivePayload as any);
    const sanitizedLogs = sanitizeLogContext(sensitivePayload as any);

    const serializedTelemetry = JSON.stringify(sanitizedTelemetry);
    const serializedLogs = JSON.stringify(sanitizedLogs);

    expect(serializedTelemetry).not.toContain('plaintext-secret');
    expect(serializedTelemetry).not.toContain('bearer-token-12345');
    expect(serializedTelemetry).not.toContain('student@domain.cr');
    expect(serializedTelemetry).not.toContain('1-0234-0567');
    expect(serializedTelemetry).not.toContain('nested-pass');

    expect(serializedLogs).not.toContain('plaintext-secret');
    expect(serializedLogs).not.toContain('bearer-token-12345');
    expect(serializedLogs).not.toContain('student@domain.cr');
    expect(serializedLogs).not.toContain('1-0234-0567');
    expect(serializedLogs).not.toContain('nested-pass');

    expect(sanitizedTelemetry.safeInteraction).toBe('option_clicked');
    expect(sanitizedTelemetry.nested.counter).toBe(10);
  });

  it('P8.7 Performance: measures latency of compilation and telemetry batch ingestion', async () => {
    const startComp = performance.now();
    const compRes = await service.send({
      method: 'POST',
      path: '/v1/assessments/compile',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ programId: 'bxm', subjectId: 'matematica', mode: 'diagnostic' }),
    });
    const compDurationMs = performance.now() - startComp;

    expect(compRes.status).toBe(200);
    expect(compDurationMs).toBeLessThan(100);

    const events = Array.from({ length: 100 }, (_, i) =>
      createTelemetryEvent({
        name: 'question_answered',
        platform: 'web',
        anonymousSessionId: 'sess_bench',
        payload: { questionId: `q_${i}`, index: i },
        idempotencyKey: `idemp_${i}_${Date.now()}`,
      })
    );

    const startIngest = performance.now();
    const ingestRes = await service.send({
      method: 'POST',
      path: '/v1/telemetry/events',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ events }),
    });
    const ingestDurationMs = performance.now() - startIngest;

    expect(ingestRes.status).toBe(200);
    expect((ingestRes.body as any).accepted).toBe(100);
    expect(ingestDurationMs).toBeLessThan(250);
  });
});
