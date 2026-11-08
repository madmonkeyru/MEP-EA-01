import { describe, expect, it } from 'vitest';
import { createService } from './service';
import { createLearningPreviewCatalog } from '@mep-ea/content/expansion';
import { createFileAttemptRepository } from './repository';
import { TokenLifecycleManager } from './auth';
import type { AttemptRecord } from '@mep-ea/api';
import type { Attempt } from '@mep-ea/domain';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

describe('P6 Service Assessment Compilation & Entitlement', () => {
  const catalog = {
    schemaVersion: 1 as const,
    version: '1.0.0',
    channel: 'development' as const,
    packVersion: '1.0.0',
    publishedAt: '2026-11-08T00:00:00.000Z',
    ...createLearningPreviewCatalog(),
  };

  const tokenManager = new TokenLifecycleManager('test-p6-secret-with-sufficient-entropy-for-hmac-sha256');
  const tempDir = mkdtempSync(join(tmpdir(), 'mep-ea-p6-test-'));
  const repository = createFileAttemptRepository(tempDir);

  const service = createService({
    verifier: tokenManager,
    repository,
    catalog,
    tokenManager,
    allowDevelopment: true,
  });

  it('allows authenticated free learner to compile 20-item diagnostic and formative mock', async () => {
    // Register free learner
    const regRes = await service.send({
      method: 'POST',
      path: '/v1/auth/register',
      headers: {},
      body: JSON.stringify({ username: 'free_learner_p6', password: 'password123', tier: 'free' }),
    });
    expect(regRes.status).toBe(200);
    const token = (regRes.body as any).token;

    // Compile diagnostic
    const diagRes = await service.send({
      method: 'POST',
      path: '/v1/assessments/compile',
      headers: { authorization: `Bearer ${token}` },
      body: JSON.stringify({ programId: 'bxm', subjectId: 'matematica', mode: 'diagnostic', seed: 42 }),
    });
    expect(diagRes.status).toBe(200);
    const diagAssessment = (diagRes.body as any).assessment;
    expect(diagAssessment.blueprint.totalItems).toBe(20);
    expect(diagAssessment.blueprint.mode).toBe('diagnostic');
    expect(diagAssessment.questions.length).toBe(20);
    expect(diagAssessment.questions.every((q: any) => q.stream === 'authored')).toBe(true);

    // Compile formative mock
    const mockRes = await service.send({
      method: 'POST',
      path: '/v1/assessments/compile',
      headers: { authorization: `Bearer ${token}` },
      body: JSON.stringify({ programId: 'bxm', subjectId: 'matematica', mode: 'mock', seed: 42 }),
    });
    expect(mockRes.status).toBe(200);
    const mockAssessment = (mockRes.body as any).assessment;
    expect(mockAssessment.blueprint.totalItems).toBe(20);
    expect(mockAssessment.questions.length).toBe(20);
  });

  it('enforces Pro entitlement on 60-item official simulation for free learner', async () => {
    const regRes = await service.send({
      method: 'POST',
      path: '/v1/auth/register',
      headers: {},
      body: JSON.stringify({ username: 'free_denied_p6', password: 'password123', tier: 'free' }),
    });
    const token = (regRes.body as any).token;

    const simRes = await service.send({
      method: 'POST',
      path: '/v1/assessments/compile',
      headers: { authorization: `Bearer ${token}` },
      body: JSON.stringify({ programId: 'bxm', subjectId: 'matematica', mode: 'simulation' }),
    });

    expect(simRes.status).toBe(403);
    expect((simRes.body as any).error).toBe('entitlement_required');
    expect((simRes.body as any).requiredTier).toBe('premium');
    expect((simRes.body as any).reasonEs).toContain('requiere una suscripción Pro');
  });

  it('allows Pro learner to compile 60-item official simulation and submit attempt', async () => {
    // Register pro learner
    const regRes = await service.send({
      method: 'POST',
      path: '/v1/auth/register',
      headers: {},
      body: JSON.stringify({ username: 'pro_learner_p6', password: 'password123', tier: 'premium' }),
    });
    expect(regRes.status).toBe(200);
    const token = (regRes.body as any).token;
    const learnerId = (regRes.body as any).session.learnerId;

    // Compile simulation
    const simRes = await service.send({
      method: 'POST',
      path: '/v1/assessments/compile',
      headers: { authorization: `Bearer ${token}` },
      body: JSON.stringify({ programId: 'bxm', subjectId: 'matematica', mode: 'simulation' }),
    });

    expect(simRes.status).toBe(200);
    const assessment = (simRes.body as any).assessment;
    expect(assessment.blueprint.totalItems).toBe(60);
    expect(assessment.questions.length).toBe(60);
    expect(assessment.questions.every((q: any) => q.stream === 'official_reference')).toBe(true);

    // Submit attempt on compiled simulation
    const attemptId = `attempt_sim_${Date.now()}`;
    const attempt: Attempt = {
      schemaVersion: 1,
      id: attemptId,
      learnerId,
      assessmentId: assessment.id,
      assessmentVersion: assessment.blueprint.version,
      questionIds: assessment.questions.map((q: any) => q.id),
      status: 'submitted',
      currentIndex: 0,
      answers: {
        [assessment.questions[0].id]: {
          questionId: assessment.questions[0].id,
          optionId: assessment.questions[0].correctOptionId,
          answeredAt: new Date().toISOString(),
        },
      },
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      deadlineAt: new Date(Date.now() + 150 * 60 * 1000).toISOString(),
    };

    const submitRes = await service.send({
      method: 'PUT',
      path: `/v1/attempts/${attemptId}`,
      headers: {
        authorization: `Bearer ${token}`,
        'idempotency-key': `${learnerId}:${attemptId}`,
      },
      body: JSON.stringify(attempt),
    });

    expect(submitRes.status).toBe(200);
    const storedRecord = submitRes.body as AttemptRecord;
    expect(storedRecord.attempt.score?.correct).toBe(1);
    expect(storedRecord.attempt.score?.total).toBe(60);

    rmSync(tempDir, { recursive: true, force: true });
  });
});
