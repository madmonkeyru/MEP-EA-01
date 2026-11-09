import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createService } from './service';
import { createFileAttemptRepository } from './repository';
import { TokenLifecycleManager } from './auth';
import { createLearningPreviewCatalog } from '@mep-ea/content/expansion';
import { initializeAttempt, submitAttempt, recordAnswer } from '@mep-ea/learning-runtime';
import { resolveBlueprint } from '@mep-ea/content';
import { deriveLongitudinalMetrics } from './longitudinal';

describe('P8.3: Longitudinal Learner Analytics Engine & API', () => {
  let tempDir: string;
  let service: ReturnType<typeof createService>;
  let tokenManager: TokenLifecycleManager;
  let authToken: string;
  let learnerId: string;
  let catalogPackage: any;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'p8-longitudinal-test-'));
    const repository = createFileAttemptRepository(tempDir);
    tokenManager = new TokenLifecycleManager('test-secret-key-at-least-32-chars-long-123456');
    const catalog = createLearningPreviewCatalog();
    catalogPackage = {
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
      body: JSON.stringify({ username: 'longitudinal_learner', password: 'password123', tier: 'premium' }),
    });
    authToken = (regRes.body as any).token;
    learnerId = (regRes.body as any).session.learnerId;
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('returns baseline empty metrics for learner with zero attempts', async () => {
    const res = await service.send({
      method: 'GET',
      path: '/v1/learners/me/progress/longitudinal',
      headers: { Authorization: `Bearer ${authToken}` },
    });

    expect(res.status).toBe(200);
    const metrics = (res.body as any).metrics;
    expect(metrics.learnerId).toBe(learnerId);
    expect(metrics.totalAttempts).toBe(0);
    expect(metrics.loopStage).toBe('diagnostic_needed');
    expect(metrics.overallAccuracy).toBeNull();
  });

  it('calculates longitudinal metrics across diagnostic -> practice -> simulation loop', async () => {
    const assessment = resolveBlueprint(catalogPackage.blueprints[0], catalogPackage.registry, { allowDraftPreview: true });
    const now = new Date().toISOString();

    const att1 = initializeAttempt(assessment, 'att_diag_1', learnerId, now);
    const answered1 = recordAnswer(assessment, att1, assessment.questions[0].id, 'A', now);
    const submitted1 = submitAttempt(assessment, answered1, now);

    const submitRes = await service.send({
      method: 'PUT',
      path: '/v1/attempts/att_diag_1',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `${learnerId}:att_diag_1`,
      },
      body: JSON.stringify(submitted1),
    });
    expect(submitRes.status).toBe(200);

    const res = await service.send({
      method: 'GET',
      path: '/v1/learners/me/progress/longitudinal',
      headers: { Authorization: `Bearer ${authToken}` },
    });

    expect(res.status).toBe(200);
    const metrics = (res.body as any).metrics;
    expect(metrics.totalAttempts).toBe(1);
    expect(metrics.loopCounts.diagnostic).toBe(1);
    expect(metrics.loopStage).toBe('remediation_in_progress');
    expect(metrics.habits.totalQuestionsEncountered).toBe(assessment.questions.length);
  });

  it('deriveLongitudinalMetrics aggregates habits and domain coverage cleanly', () => {
    const metrics = deriveLongitudinalMetrics('learner_mock', []);
    expect(metrics.totalAttempts).toBe(0);
    expect(metrics.habits.unansweredRate).toBe(0);
  });
});
