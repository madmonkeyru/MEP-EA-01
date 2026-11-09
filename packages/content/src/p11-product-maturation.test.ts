import { describe, it, expect } from 'vitest';
import { createMultiSubjectCatalog } from './multiSubjectCatalog';
import { createTokenAuthProvider, createLocalPlatformApi, type StorageAdapter } from '@mep-ea/api';
import type { Attempt } from '@mep-ea/domain';

describe('P11 Product Maturation & Generalized Experience', () => {
  const memory = new Map<string, string>();
  const storage: StorageAdapter = {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => { memory.set(key, value); },
  };

  const catalog = createMultiSubjectCatalog();
  const auth = createTokenAuthProvider({ kind: 'anonymous', learnerId: 'learner-p11', tier: 'premium' });
  const api = createLocalPlatformApi(auth, catalog, storage);

  it('P11.1 & P11.9: compiles assessments dynamically for multiple subjects without branching hacks', async () => {
    // 1. Compile BXM Matemática Diagnostic
    const mathAssessment = await api.compileAssessment({
      programId: 'bxm',
      subjectId: 'matematica',
      mode: 'diagnostic',
    });
    expect(mathAssessment.questions.length).toBe(20);
    expect(mathAssessment.blueprint.subjectId).toBe('matematica');

    // 2. Compile BXM Educación Cívica Diagnostic
    const civicaAssessment = await api.compileAssessment({
      programId: 'bxm',
      subjectId: 'civica',
      mode: 'diagnostic',
    });
    expect(civicaAssessment.questions.length).toBe(12);
    expect(civicaAssessment.blueprint.subjectId).toBe('civica');
  });

  it('P11.2 & P11.3: completes closed learning loop and derives longitudinal habits on Mi Progreso', async () => {
    // 1. Initial metrics should reflect zero attempts
    const initialMetrics = await api.getLongitudinalMetrics();
    expect(initialMetrics.totalAttempts).toBe(0);
    expect(initialMetrics.loopStage).toBe('diagnostic_needed');

    // 2. Compile and submit an assessment
    const mathAssessment = await api.compileAssessment({
      programId: 'bxm',
      subjectId: 'matematica',
      mode: 'diagnostic',
    });

    const now = new Date().toISOString();
    const deadlineAt = new Date(Date.parse(now) + mathAssessment.blueprint.timeLimitSeconds * 1000).toISOString();
    const attempt: Attempt = {
      schemaVersion: 1,
      id: `att_p11_${Date.now()}`,
      learnerId: 'learner-p11',
      assessmentId: mathAssessment.id,
      assessmentVersion: mathAssessment.blueprint.version,
      questionIds: mathAssessment.questions.map(q => q.id),
      status: 'submitted',
      currentIndex: 0,
      answers: {
        [mathAssessment.questions[0].id]: {
          questionId: mathAssessment.questions[0].id,
          optionId: mathAssessment.questions[0].correctOptionId,
          answeredAt: now,
        },
      },
      startedAt: now,
      updatedAt: now,
      submittedAt: now,
      deadlineAt,
    };

    await api.submitAttempt(attempt);

    // 3. Continuity reflects learning continuity and prioritized remediation plan
    const continuity = await api.getLearningContinuity();
    expect(continuity.plan.activities.length).toBeGreaterThanOrEqual(1);

    // 4. Longitudinal metrics reflect attempt and habit accumulation
    const updatedMetrics = await api.getLongitudinalMetrics();
    expect(updatedMetrics.totalAttempts).toBe(1);
    expect(updatedMetrics.loopCounts.diagnostic).toBe(1);
    expect(updatedMetrics.habits.totalQuestionsEncountered).toBe(20);
    expect(updatedMetrics.loopStage).toBe('remediation_in_progress');
  });
});
