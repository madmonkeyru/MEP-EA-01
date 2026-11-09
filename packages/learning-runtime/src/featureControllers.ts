/**
 * P13 Shared Feature Controllers & Surface Composition Engine
 *
 * Implements pure, platform-agnostic headless controllers for:
 * 1. Assessment / Simulation Session Controller (item navigation, answers, timer, bookmarking, auto-submit)
 * 2. Longitudinal Progress Controller (habits, domain mastery, recommendations)
 * 3. Exam Readiness Composite Controller (composing progress + diagnostic + simulation + remediation)
 */

import type { Assessment, Attempt, Answer, OptionId, Score } from '@mep-ea/domain';

export type AssessmentSessionMode = 'diagnostic' | 'mock' | 'simulation';
export type QuestionFilter = 'all' | 'pending' | 'bookmarked';

export interface AssessmentSessionState {
  mode: AssessmentSessionMode;
  assessment: Assessment;
  currentIndex: number;
  answers: Record<string, OptionId>;
  bookmarkedIds: string[];
  filter: QuestionFilter;
  startedAt: string;
  deadlineAt: string;
  remainingSeconds: number | null;
  isExpired: boolean;
  isSubmitting: boolean;
  submittedAttempt: Attempt | null;
}

export interface AssessmentSessionController {
  getState(): AssessmentSessionState;
  subscribe(listener: (state: AssessmentSessionState) => void): () => void;
  selectOption(questionId: string, optionId: OptionId): void;
  toggleBookmark(questionId: string): void;
  setCurrentIndex(index: number): void;
  setFilter(filter: QuestionFilter): void;
  tick(): void;
  submit(onSubmitAttempt: (attempt: Attempt) => Promise<void>): Promise<Attempt>;
}

export function createAssessmentSessionController(
  mode: AssessmentSessionMode,
  assessment: Assessment,
  learnerId: string,
  timeLimitMinutes?: number
): AssessmentSessionController {
  const listeners = new Set<(state: AssessmentSessionState) => void>();
  const startedAt = new Date().toISOString();
  const durationSeconds = timeLimitMinutes ? timeLimitMinutes * 60 : (
    assessment.blueprint.timeLimitSeconds > 0 ? assessment.blueprint.timeLimitSeconds : (
      mode === 'simulation' ? 150 * 60 : (mode === 'mock' ? 45 * 60 : 30 * 60)
    )
  );
  const deadlineAt = new Date(Date.now() + durationSeconds * 1000).toISOString();

  let state: AssessmentSessionState = {
    mode,
    assessment,
    currentIndex: 0,
    answers: {},
    bookmarkedIds: [],
    filter: 'all',
    startedAt,
    deadlineAt,
    remainingSeconds: durationSeconds,
    isExpired: false,
    isSubmitting: false,
    submittedAttempt: null,
  };

  const notify = () => {
    for (const l of listeners) l({ ...state });
  };

  const buildAttempt = (status: 'submitted' = 'submitted'): Attempt => {
    const total = assessment.questions.length;
    let correct = 0;
    const answeredCount = Object.keys(state.answers).length;
    const nowIso = new Date().toISOString();

    const domainTotals: Record<string, { correct: number; total: number }> = {};
    const scoreItems = assessment.questions.map(q => {
      if (!domainTotals[q.domainId]) {
        domainTotals[q.domainId] = { correct: 0, total: 0 };
      }
      domainTotals[q.domainId].total++;

      const selected = state.answers[q.id];
      const isCorrect = selected === q.correctOptionId;
      if (isCorrect) {
        correct++;
        domainTotals[q.domainId].correct++;
      }
      return {
        questionId: q.id,
        evidenceId: q.evidenceId,
        conceptIds: q.conceptIds,
        correct: Boolean(isCorrect),
        selectedOptionId: selected,
      };
    });

    const score: Score = {
      items: scoreItems,
      correct,
      total,
      unanswered: total - answeredCount,
      percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
      domains: domainTotals,
    };

    const attemptAnswers: Record<string, Answer> = {};
    for (const [qid, optId] of Object.entries(state.answers)) {
      attemptAnswers[qid] = { questionId: qid, optionId: optId, answeredAt: nowIso };
    }

    return {
      schemaVersion: 1,
      id: `attempt_${assessment.id}_${Date.now()}`,
      learnerId,
      assessmentId: assessment.id,
      assessmentVersion: assessment.blueprint.version,
      questionIds: assessment.questions.map(q => q.id),
      status,
      currentIndex: state.currentIndex,
      answers: attemptAnswers,
      firstAnswers: attemptAnswers,
      startedAt: state.startedAt,
      updatedAt: nowIso,
      deadlineAt: state.deadlineAt,
      submittedAt: nowIso,
      score,
    };
  };

  return {
    getState: () => ({ ...state }),
    subscribe: (l) => {
      listeners.add(l);
      return () => { listeners.delete(l); };
    },
    selectOption(questionId, optionId) {
      if (state.submittedAttempt || state.isSubmitting) return;
      state = {
        ...state,
        answers: { ...state.answers, [questionId]: optionId },
      };
      notify();
    },
    toggleBookmark(questionId) {
      const exists = state.bookmarkedIds.includes(questionId);
      state = {
        ...state,
        bookmarkedIds: exists
          ? state.bookmarkedIds.filter(id => id !== questionId)
          : [...state.bookmarkedIds, questionId],
      };
      notify();
    },
    setCurrentIndex(index) {
      if (index >= 0 && index < state.assessment.questions.length) {
        state = { ...state, currentIndex: index };
        notify();
      }
    },
    setFilter(filter) {
      state = { ...state, filter };
      notify();
    },
    tick() {
      if (state.submittedAttempt || state.isSubmitting || state.remainingSeconds === null) return;
      if (state.remainingSeconds <= 1) {
        state = { ...state, remainingSeconds: 0, isExpired: true };
        notify();
      } else {
        state = { ...state, remainingSeconds: state.remainingSeconds - 1 };
        notify();
      }
    },
    async submit(onSubmitAttempt) {
      if (state.submittedAttempt) return state.submittedAttempt;
      state = { ...state, isSubmitting: true };
      notify();
      try {
        const attempt = buildAttempt('submitted');
        await onSubmitAttempt(attempt);
        state = { ...state, isSubmitting: false, submittedAttempt: attempt };
        notify();
        return attempt;
      } catch (err) {
        state = { ...state, isSubmitting: false };
        notify();
        throw err;
      }
    },
  };
}

/**
 * P13 Composite Surface Contract: Exam Readiness
 * Composes longitudinal progress, diagnostic evaluation, simulation readiness,
 * and next recommended pedagogical action into a unified model.
 */
export interface ExamReadinessOverview {
  learnerId: string;
  totalAttempts: number;
  overallAccuracy: number | null;
  readinessStage: 'diagnostic_needed' | 'remediation_in_progress' | 'ready_for_simulation' | 'exam_ready';
  readinessScore: number; // 0 - 100
  loopCounts: { diagnostic: number; practice: number; mock: number; simulation: number };
  recommendedAction: {
    type: 'diagnostic' | 'practice' | 'simulation' | 'review';
    titleEs: string;
    descriptionEs: string;
    ctaEs: string;
    evidenceKey?: string;
  };
  domainStrengths: Array<{ domainId: string; nameEs: string; masteryTier: 'strong' | 'developing' | 'needs_practice' }>;
}

export function deriveExamReadiness(
  learnerId: string,
  metrics: {
    totalAttempts: number;
    overallAccuracy: number | null;
    loopCounts: { diagnostic: number; practice: number; mock: number; simulation: number };
    domainCoverage?: Record<string, { total: number; correct: number; distinctFamilies: number }>;
  },
  priorityWeakness?: { evidenceKey?: string; domainName?: string }
): ExamReadinessOverview {
  const { totalAttempts, overallAccuracy, loopCounts } = metrics;
  const accuracy = overallAccuracy ?? 0;

  let readinessStage: ExamReadinessOverview['readinessStage'] = 'diagnostic_needed';
  let readinessScore = 10;
  let recommendedAction: ExamReadinessOverview['recommendedAction'] = {
    type: 'diagnostic',
    titleEs: 'Diagnóstico Inicial Requerido',
    descriptionEs: 'Realiza el diagnóstico guiado (20 ítems) para identificar tus fortalezas y vacíos curriculares.',
    ctaEs: 'Comenzar Diagnóstico',
  };

  if (loopCounts.diagnostic > 0 || totalAttempts > 0) {
    if (loopCounts.simulation >= 1 && accuracy >= 70) {
      readinessStage = 'exam_ready';
      readinessScore = Math.min(100, Math.round(50 + accuracy * 0.5));
      recommendedAction = {
        type: 'simulation',
        titleEs: '¡Preparación Consolidada!',
        descriptionEs: 'Has completado simulaciones con alto rendimiento. Mantén el ritmo con simulaciones completas periódicas.',
        ctaEs: 'Realizar Simulación Oficial',
      };
    } else if (accuracy >= 65 && (loopCounts.practice >= 2 || loopCounts.mock >= 1)) {
      readinessStage = 'ready_for_simulation';
      readinessScore = Math.min(85, Math.round(40 + accuracy * 0.45));
      recommendedAction = {
        type: 'simulation',
        titleEs: 'Listo para Simulación Oficial',
        descriptionEs: 'Tus fundamentos son sólidos. Pon a prueba tus condiciones de examen en la simulación cronometrada de 60 ítems.',
        ctaEs: 'Iniciar Simulación de Examen',
      };
    } else {
      readinessStage = 'remediation_in_progress';
      readinessScore = Math.min(60, Math.max(25, Math.round(accuracy * 0.6)));
      recommendedAction = {
        type: 'practice',
        titleEs: priorityWeakness?.evidenceKey ? `Reforzar: ${priorityWeakness.evidenceKey}` : 'Nivelación en Progreso',
        descriptionEs: 'Practica los ítems y revisa los pasos pedagógicos para cerrar las brechas detectadas.',
        ctaEs: 'Ir a Práctica Focalizada',
        evidenceKey: priorityWeakness?.evidenceKey,
      };
    }
  }

  const domainStrengths: ExamReadinessOverview['domainStrengths'] = [];
  if (metrics.domainCoverage) {
    for (const [dId, cov] of Object.entries(metrics.domainCoverage)) {
      const rate = cov.total > 0 ? (cov.correct / cov.total) * 100 : 0;
      const tier = rate >= 75 ? 'strong' : (rate >= 60 ? 'developing' : 'needs_practice');
      domainStrengths.push({
        domainId: dId,
        nameEs: dId.charAt(0).toUpperCase() + dId.slice(1),
        masteryTier: tier,
      });
    }
  }

  return {
    learnerId,
    totalAttempts,
    overallAccuracy,
    readinessStage,
    readinessScore,
    loopCounts,
    recommendedAction,
    domainStrengths,
  };
}
