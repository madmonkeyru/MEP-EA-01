import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createService } from './service';
import { createFileAttemptRepository } from './repository';
import { TokenLifecycleManager } from './auth';
import { createLearningPreviewCatalog } from '@mep-ea/content/expansion';
import type { TelemetryEvent } from '@mep-ea/analytics';
import { createTelemetryEvent } from '@mep-ea/analytics';
import { initializeAttempt } from '@mep-ea/learning-runtime';

describe('P8 Telemetry Ingestion & Operational Diagnostics Endpoints', () => {
  let tempDir: string;
  let service: ReturnType<typeof createService>;
  let tokenManager: TokenLifecycleManager;
  let authToken: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'p8-service-test-'));
    const repository = createFileAttemptRepository(tempDir);
    tokenManager = new TokenLifecycleManager('test-secret-key-at-least-32-chars-long-123456');
    const catalog = createLearningPreviewCatalog();
    const catalogPackage = {
      schemaVersion: 1 as const,
      version: 'p8-preview-v1',
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
      body: JSON.stringify({ username: 'p8_learner', password: 'password123', tier: 'premium' }),
    });
    authToken = (regRes.body as any).token;
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('responds with operational health probe at /health', async () => {
    const res = await service.send({
      method: 'GET',
      path: '/health',
      headers: {},
    });
    expect(res.status).toBe(200);
    expect((res.body as any).status).toBe('healthy');
    expect((res.body as any).uptimeSeconds).toBeGreaterThanOrEqual(0);
  });

  it('provides operational system diagnostics at /v1/diagnostics', async () => {
    const res = await service.send({
      method: 'GET',
      path: '/v1/diagnostics',
      headers: {},
    });
    expect(res.status).toBe(200);
    const body = res.body as any;
    expect(body.status).toBe('healthy');
    expect(body.storage.type).toBe('file_memory');
    expect(body.metrics.requestsTotal).toBeGreaterThan(0);
  });

  it('ingests telemetry events batch via POST /v1/telemetry/events', async () => {
    const event1: TelemetryEvent = createTelemetryEvent({
      name: 'lesson_opened',
      platform: 'web',
      anonymousSessionId: 'sess_anon_1',
      payload: { evidenceId: 'bxm/matematica/02-2026/geometry/A1.1' },
      idempotencyKey: 'key_lesson_1',
    });
    const event2: TelemetryEvent = createTelemetryEvent({
      name: 'mock_started',
      platform: 'web',
      anonymousSessionId: 'sess_anon_1',
      payload: { attemptId: 'att_mock_1', questionCount: 20 },
      idempotencyKey: 'key_mock_1',
    });

    const res = await service.send({
      method: 'POST',
      path: '/v1/telemetry/events',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ events: [event1, event2] }),
    });

    expect(res.status).toBe(200);
    const body = res.body as any;
    expect(body.accepted).toBe(2);
    expect(body.duplicate).toBe(0);

    const dupRes = await service.send({
      method: 'POST',
      path: '/v1/telemetry/events',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ events: [event1] }),
    });
    expect((dupRes.body as any).accepted).toBe(0);
    expect((dupRes.body as any).duplicate).toBe(1);
  });

  it('tracks sync conflicts observability metric when draft conflict occurs', async () => {
    const assessmentRes = await service.send({
      method: 'POST',
      path: '/v1/assessments/compile',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ programId: 'bxm', subjectId: 'matematica', mode: 'diagnostic' }),
    });
    const assessment = (assessmentRes.body as any).assessment;

    const sessionRes = await service.send({
      method: 'GET',
      path: '/v1/auth/session',
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const learnerId = (sessionRes.body as any).learnerId;

    const nowIso = new Date().toISOString();
    const initialized = initializeAttempt(assessment, 'draft_conflict_att', learnerId, nowIso);
    const baseDraft = {
      schemaVersion: 1 as const,
      attempt: initialized,
      baseRevision: 0,
      deviceId: 'device-A',
    };

    const write1 = await service.send({
      method: 'PUT',
      path: '/v1/drafts/draft_conflict_att',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(baseDraft),
    });
    expect(write1.status).toBe(200);

    const divergentAttempt = {
      ...initialized,
      currentIndex: 1,
      updatedAt: new Date(Date.now() + 1000).toISOString(),
    };
    const writeConflict = await service.send({
      method: 'PUT',
      path: '/v1/drafts/draft_conflict_att',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...baseDraft, attempt: divergentAttempt, deviceId: 'device-B' }),
    });
    expect(writeConflict.status).toBe(409);

    const diagRes = await service.send({
      method: 'GET',
      path: '/v1/diagnostics',
      headers: {},
    });
    expect((diagRes.body as any).metrics.syncConflictsTotal).toBe(1);
  });
});
