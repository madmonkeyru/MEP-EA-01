import { describe, it, expect, vi } from 'vitest';
import type { Assessment, OptionId } from '@mep-ea/domain';
import {
  createAssessmentSessionController,
  deriveExamReadiness,
} from './featureControllers';

const dummyAssessment: Assessment = {
  id: 'assessment_math_diag_1',
  blueprint: {
    id: 'bp_1',
    version: '1.0.0',
    programId: 'bxm',
    subjectId: 'matematica',
    convocatoriaId: '02-2026',
    mode: 'diagnostic',
    stream: 'authored',
    totalItems: 2,
    timeLimitSeconds: 1800,
    domainQuotas: [{ domainId: 'geometria', count: 2 }],
  },
  questions: [
    {
      id: 'q1',
      version: '1.0.0',
      evidenceId: 'ev1',
      conceptIds: ['c1'],
      domainId: 'geometria',
      difficulty: 'medium',
      cognitiveLevel: 'comprension',
      stem: '¿Cuál es el radio?',
      options: [
        { id: 'A' as OptionId, text: '2' },
        { id: 'B' as OptionId, text: '4' },
      ],
      correctOptionId: 'A' as OptionId,
      explanation: 'Explicación',
    },
    {
      id: 'q2',
      version: '1.0.0',
      evidenceId: 'ev2',
      conceptIds: ['c2'],
      domainId: 'geometria',
      difficulty: 'hard',
      cognitiveLevel: 'aplicacion',
      stem: '¿Cuál es el centro?',
      options: [
        { id: 'A' as OptionId, text: '(0,0)' },
        { id: 'B' as OptionId, text: '(1,1)' },
      ],
      correctOptionId: 'B' as OptionId,
      explanation: 'Explicación centro',
    },
  ],
};

describe('P13 Shared Feature Controllers & Composition Engine', () => {
  it('AssessmentSessionController manages state, answers, bookmarks and ticking', () => {
    const controller = createAssessmentSessionController('diagnostic', dummyAssessment, 'learner_test', 30);
    const initial = controller.getState();
    expect(initial.currentIndex).toBe(0);
    expect(initial.remainingSeconds).toBe(1800);
    expect(initial.isSubmitting).toBe(false);

    // Select option
    controller.selectOption('q1', 'A' as OptionId);
    expect(controller.getState().answers['q1']).toBe('A');

    // Toggle bookmark
    controller.toggleBookmark('q1');
    expect(controller.getState().bookmarkedIds).toContain('q1');
    controller.toggleBookmark('q1');
    expect(controller.getState().bookmarkedIds).not.toContain('q1');

    // Navigation
    controller.setCurrentIndex(1);
    expect(controller.getState().currentIndex).toBe(1);

    // Tick
    controller.tick();
    expect(controller.getState().remainingSeconds).toBe(1799);
  });

  it('AssessmentSessionController submits attempt and computes score deterministically', async () => {
    const controller = createAssessmentSessionController('diagnostic', dummyAssessment, 'learner_test', 30);
    controller.selectOption('q1', 'A' as OptionId); // Correct
    controller.selectOption('q2', 'A' as OptionId); // Incorrect (correctOptionId is B)

    const submitSpy = vi.fn().mockResolvedValue(undefined);
    const attempt = await controller.submit(submitSpy);

    expect(submitSpy).toHaveBeenCalledTimes(1);
    expect(attempt.score?.total).toBe(2);
    expect(attempt.score?.correct).toBe(1);
    expect(attempt.score?.percentage).toBe(50);
    expect(attempt.score?.unanswered).toBe(0);
    expect(controller.getState().submittedAttempt).toBe(attempt);
  });

  it('deriveExamReadiness composes progress, diagnostic, and remediation into readiness stage', () => {
    // Stage 1: New learner
    const r1 = deriveExamReadiness('l1', {
      totalAttempts: 0,
      overallAccuracy: null,
      loopCounts: { diagnostic: 0, practice: 0, mock: 0, simulation: 0 },
    });
    expect(r1.readinessStage).toBe('diagnostic_needed');
    expect(r1.recommendedAction.type).toBe('diagnostic');

    // Stage 2: Remediation
    const r2 = deriveExamReadiness('l1', {
      totalAttempts: 2,
      overallAccuracy: 50,
      loopCounts: { diagnostic: 1, practice: 1, mock: 0, simulation: 0 },
      domainCoverage: { geometria: { total: 10, correct: 5, distinctFamilies: 2 } },
    }, { evidenceKey: 'Circunferencia' });
    expect(r2.readinessStage).toBe('remediation_in_progress');
    expect(r2.recommendedAction.type).toBe('practice');
    expect(r2.domainStrengths[0].masteryTier).toBe('needs_practice');

    // Stage 3: Ready for simulation
    const r3 = deriveExamReadiness('l1', {
      totalAttempts: 5,
      overallAccuracy: 75,
      loopCounts: { diagnostic: 1, practice: 3, mock: 1, simulation: 0 },
    });
    expect(r3.readinessStage).toBe('ready_for_simulation');
    expect(r3.recommendedAction.type).toBe('simulation');

    // Stage 4: Exam ready
    const r4 = deriveExamReadiness('l1', {
      totalAttempts: 8,
      overallAccuracy: 85,
      loopCounts: { diagnostic: 1, practice: 4, mock: 1, simulation: 2 },
    });
    expect(r4.readinessStage).toBe('exam_ready');
  });
});
