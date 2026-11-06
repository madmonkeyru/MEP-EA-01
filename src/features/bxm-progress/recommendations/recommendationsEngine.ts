import type {
  BxmDomain,
  DifficultyTier,
  QualifiedEvidenceInfo,
  AttemptEvent,
  LearningCompletion,
} from '../domain/types';
import type { EvidenceMasteryRecord } from '../domain/masteryEngine';
import type { CanonicalRecommendation } from '../../../types/recommendation';

export * from '../../../types/recommendation';

export type QueueItemReason =
  | 'calibration_needed' // insufficient data
  | 'weak_performance' // low accuracy (<60% or <75%)
  | 'recent_incorrect' // missed in recent session
  | 'curricular_priority' // high weight in specification
  | 'progression_next_tier'; // ready for tier 2 or 3

export interface PracticeQueueItem {
  id: string; // deterministic key e.g. "queue-{evidenceKey}-{targetDifficulty}"
  evidenceKey: string;
  domain: BxmDomain;
  rawCode: string;
  evidenceDescription?: string;
  targetDifficulty: DifficultyTier;
  reason: QueueItemReason;
  reasonLabelEs: string;
  priorityScore: number; // lower number = higher urgency
  estimatedMinutes: number;
  availablePracticeCount?: number;
  isAvailableInAuthoredInventory: boolean;
}

export interface StudyPlanStep {
  stepNumber: number;
  title: string;
  description: string;
  evidenceKey: string;
  domain: BxmDomain;
  targetDifficulty: DifficultyTier;
  recommendedActivity: 'lesson' | 'micro_quiz' | 'targeted_practice' | 'retest';
  urgency: 'high' | 'medium' | 'low';
}

export interface StructuredStudyPlan {
  planId: string;
  generatedAt: string;
  totalSteps: number;
  estimatedTotalMinutes: number;
  steps: StudyPlanStep[];
  focusSummaryEs: string;
}

export interface RetestRecommendation {
  shouldRetest: boolean;
  recommendedSessionKind: 'diagnostic' | 'simulation_mock' | 'targeted_retest' | 'practice_evidence';
  recommendedItemCount: number;
  targetEvidenceKeys: string[];
  rationaleEs: string;
}

export interface QueueGenerationOptions {
  limit?: number;
  availableInventoryByEvidence?: Record<string, { totalItems: number; tiers?: DifficultyTier[] }>;
}

export interface RecommendationEngineContext {
  evidenceRecords: EvidenceMasteryRecord[];
  events: AttemptEvent[];
  completions?: LearningCompletion[];
  hasCompletedDiagnostic?: boolean;
  availableLessons?: { evidenceKey: string; title?: string }[];
  availableInventory?: Record<string, { totalItems: number; tiers?: DifficultyTier[] }>;
  pendingRemediationEvidenceKey?: string;
}

const DOMAIN_FRIENDLY_NAMES: Record<string, string> = {
  geometry: 'Geometría',
  functions: 'Funciones y Álgebra',
  algebra: 'Funciones y Álgebra',
  statistics: 'Estadística y Probabilidad',
};

/**
 * Returns a student-friendly educational title for a domain/evidence, avoiding raw codes.
 */
export function getFriendlyDomainName(domain: string): string {
  return DOMAIN_FRIENDLY_NAMES[domain] || domain;
}

/**
 * Core canonical recommendation engine function.
 * Evaluates learner state and returns a CanonicalRecommendation { activityType, targetId, reason, priority, cta }.
 *
 * Priority order:
 * 1. New/empty learner (no diagnostic yet) -> activityType: 'diagnostic', reason: 'no_diagnostic_yet', priority: 'p0'
 * 2. Active remediation pending from recent diagnostic/simulation -> activityType: 'remediation' / 'practice', reason: 'remediation_pending', priority: 'p0'
 * 3. Diagnostic or practice weakness (<60% accuracy) -> activityType: hasLesson ? 'lesson' : 'practice', reason: 'diagnostic_weakness', priority: 'p1'
 * 4. Retest available (remediated skill ready for re-verification) -> activityType: 'retest', reason: 'retest_available', priority: 'p1'
 * 5. In-progress skill (60%-74% accuracy) -> activityType: 'practice', reason: 'general_practice', priority: 'p2'
 * 6. High mastery, simulation recommended -> activityType: 'simulation', reason: 'simulation_recommended', priority: 'p2'
 */
export function deriveCanonicalRecommendation(
  context: RecommendationEngineContext
): CanonicalRecommendation {
  const {
    evidenceRecords,
    events,
    hasCompletedDiagnostic = false,
    availableLessons = [],
    availableInventory = {},
    pendingRemediationEvidenceKey,
  } = context;

  const hasEvents = events.length > 0;
  const hasDiagnostic = hasCompletedDiagnostic || events.some(e => e.sessionKind === 'diagnostic');

  // Case 1: Empty / new learner without diagnostic
  if (!hasEvents && !hasDiagnostic) {
    return {
      activityType: 'diagnostic',
      targetId: 'bxm-diagnostic-02-2026',
      reason: 'no_diagnostic_yet',
      priority: 'p0',
      title: 'Diagnóstico Inicial de 20 Preguntas',
      description: 'Evalúa tu nivel de partida en Geometría, Funciones y Estadística para diseñar tu plan de nivelación personalizado.',
      cta: {
        label: 'Iniciar evaluación diagnóstica',
        action: 'diagnostic',
        targetId: 'bxm-diagnostic-02-2026',
        secondaryLabel: 'Explorar el Temario',
        secondaryAction: 'lesson',
      },
      estimatedMinutes: 30,
    };
  }

  // Case 2: Specific pending remediation evidence
  if (pendingRemediationEvidenceKey) {
    const rec = evidenceRecords.find(r => r.evidenceKey === pendingRemediationEvidenceKey);
    const domainName = rec ? getFriendlyDomainName(rec.domain) : 'Matemáticas';
    const code = rec?.rawCode || pendingRemediationEvidenceKey.split('/').pop() || '';
    const hasLesson = availableLessons.some(l => l.evidenceKey === pendingRemediationEvidenceKey);

    return {
      activityType: hasLesson ? 'lesson' : 'practice',
      targetId: pendingRemediationEvidenceKey,
      reason: 'diagnostic_weakness',
      priority: 'p0',
      title: `Reforzar: Evidencia ${code} (${domainName})`,
      description: rec?.description
        ? `${rec.description}. Concentra tu práctica para superar los errores detectados.`
        : `Refuerza los conceptos prioritarios identificados en tu última evaluación de ${domainName}.`,
      domainLabel: domainName,
      currentAccuracyPercentage: rec?.accuracyPercentage,
      statusLabel: rec?.statusLabelEs || 'Requiere refuerzo',
      cta: {
        label: hasLesson ? 'Estudiar este tema en el Temario' : 'Practicar esta habilidad',
        action: hasLesson ? 'lesson' : 'practice',
        targetId: pendingRemediationEvidenceKey,
        secondaryLabel: hasLesson ? 'Practicar directamente' : undefined,
        secondaryAction: hasLesson ? 'practice' : undefined,
        secondaryTargetId: hasLesson ? pendingRemediationEvidenceKey : undefined,
      },
      estimatedMinutes: 15,
    };
  }

  // Case 3: Identify critical weaknesses (<60% accuracy or needs_reinforcement, OR measured with errors)
  const weakRecords = evidenceRecords.filter(r => r.status === 'needs_reinforcement' || (r.totalQualifyingCount > 0 && r.accuracyPercentage < 60));
  if (weakRecords.length > 0) {
    // Sort by lowest accuracy first, then by available inventory
    const sortedWeak = [...weakRecords].sort((a, b) => {
      const invA = (availableInventory[a.evidenceKey]?.totalItems || 0) > 0 ? 1 : 0;
      const invB = (availableInventory[b.evidenceKey]?.totalItems || 0) > 0 ? 1 : 0;
      if (invA !== invB) return invB - invA;
      return a.accuracyExactRatio - b.accuracyExactRatio;
    });

    const target = sortedWeak[0];
    const domainName = getFriendlyDomainName(target.domain);
    const hasLesson = availableLessons.some(l => l.evidenceKey === target.evidenceKey);

    return {
      activityType: hasLesson ? 'lesson' : 'practice',
      targetId: target.evidenceKey,
      reason: 'diagnostic_weakness',
      priority: 'p1',
      title: `Reforzar: Evidencia ${target.rawCode || target.evidenceKey} (${domainName})`,
      description: target.description
        ? `${target.description}. Tu diagnóstico detectó una oportunidad de mejora aquí.`
        : `Tu diagnóstico detectó una oportunidad de mejora en ${domainName}.`,
      domainLabel: domainName,
      currentAccuracyPercentage: target.accuracyPercentage,
      statusLabel: target.statusLabelEs,
      cta: {
        label: hasLesson ? 'Estudiar este tema en el Temario' : 'Practicar esta habilidad',
        action: hasLesson ? 'lesson' : 'practice',
        targetId: target.evidenceKey,
        secondaryLabel: hasLesson ? 'Practicar directamente' : undefined,
        secondaryAction: hasLesson ? 'practice' : undefined,
        secondaryTargetId: hasLesson ? target.evidenceKey : undefined,
      },
      estimatedMinutes: 15,
    };
  }

  // Case 4: In-progress skills (60%-74%)
  const inProgressRecords = evidenceRecords.filter(r => r.status === 'in_progress');
  if (inProgressRecords.length > 0) {
    const target = inProgressRecords[0];
    const domainName = getFriendlyDomainName(target.domain);
    const hasLesson = availableLessons.some(l => l.evidenceKey === target.evidenceKey);

    return {
      activityType: 'practice',
      targetId: target.evidenceKey,
      reason: 'general_practice',
      priority: 'p2',
      title: `Consolidar Dominio: ${domainName}`,
      description: target.description
        ? `${target.description}. Estás cerca del dominio (75%). Continúa con práctica guiada.`
        : `Estás cerca del umbral de dominio en ${domainName}.`,
      domainLabel: domainName,
      currentAccuracyPercentage: target.accuracyPercentage,
      statusLabel: target.statusLabelEs,
      cta: {
        label: 'Practicar para alcanzar dominio',
        action: 'practice',
        targetId: target.evidenceKey,
        secondaryLabel: hasLesson ? 'Repasar lección' : undefined,
        secondaryAction: hasLesson ? 'lesson' : undefined,
        secondaryTargetId: hasLesson ? target.evidenceKey : undefined,
      },
      estimatedMinutes: 15,
    };
  }

  // Case 5: Mastered skills or calibration needed -> simulation or next practice
  const masteredRecords = evidenceRecords.filter(r => r.status === 'mastered');
  if (masteredRecords.length >= 3) {
    return {
      activityType: 'simulation',
      targetId: 'formative-mock',
      reason: 'simulation_recommended',
      priority: 'p2',
      title: 'Comprobar Preparación con Simulacro Formativo',
      description: 'Has consolidado tus habilidades prioritarias. Realiza un simulacro para medir retención integral en condiciones de examen.',
      cta: {
        label: 'Iniciar Simulacro Formativo',
        action: 'simulation',
        targetId: 'formative-mock',
        secondaryLabel: 'Ver examen oficial de referencia',
        secondaryAction: 'simulation',
        secondaryTargetId: 'official-reference',
      },
      estimatedMinutes: 45,
    };
  }

  // Default fallback: general practice on first available lesson or evidence
  const fallbackKey = availableLessons[0]?.evidenceKey || evidenceRecords[0]?.evidenceKey || 'geometry/A1.1';
  const fallbackDomain = evidenceRecords[0]?.domain || 'geometry';
  const fallbackDomainName = getFriendlyDomainName(fallbackDomain);

  return {
    activityType: 'practice',
    targetId: fallbackKey,
    reason: 'general_practice',
    priority: 'p3',
    title: `Práctica de Habilidades: ${fallbackDomainName}`,
    description: 'Continúa resolviendo ejercicios para calibrar tu dominio y fortalecer tu preparación.',
    domainLabel: fallbackDomainName,
    cta: {
      label: 'Continuar práctica',
      action: 'practice',
      targetId: fallbackKey,
      secondaryLabel: 'Explorar temario',
      secondaryAction: 'lesson',
      secondaryTargetId: fallbackKey,
    },
    estimatedMinutes: 15,
  };
}

/**
 * Builds a deterministic personal practice queue following CONSOLIDATED DECISIONS v1 Section 7:
 *
 * 1. Evidences with insufficient data receive explicit calibration recommendations first,
 *    separate from demonstrated weaknesses.
 * 2. Among sufficiently measured evidences, prioritize weakest first-response accuracy,
 *    then known curricular weight, recent incorrect performance, and appropriate recommended difficulty.
 * 3. Break ties with stable evidence keys.
 */
export function generatePersonalPracticeQueue(
  evidenceRecords: EvidenceMasteryRecord[],
  evidenceCatalog: QualifiedEvidenceInfo[],
  options: QueueGenerationOptions = {}
): PracticeQueueItem[] {
  const limit = options.limit ?? 10;
  const inventory = options.availableInventoryByEvidence ?? {};

  const evidenceMap = new Map<string, QualifiedEvidenceInfo>();
  for (const info of evidenceCatalog) {
    evidenceMap.set(info.key, info);
  }

  const queueCandidates: PracticeQueueItem[] = [];

  for (const rec of evidenceRecords) {
    const info = evidenceMap.get(rec.evidenceKey);
    const officialWeight = info?.weightOfficialPercent ?? 1.0;
    const invInfo = inventory[rec.evidenceKey];
    const isAvailable = !!invInfo && invInfo.totalItems > 0;
    const targetDifficulty = invInfo?.tiers?.length && !invInfo.tiers.includes(rec.recommendedDifficultyTier)
      ? [...invInfo.tiers].sort()[0] : rec.recommendedDifficultyTier;

    // 1. Insufficient data: Calibration needed
    if (rec.status === 'insufficient_data') {
      // Prioritize by official weight and remaining families needed
      const remainingToCalibrate = Math.max(1, rec.minRequiredFamilies - rec.qualifyingFamiliesCount);
      // Priority formula: 1000 - (weight * 10) + remainingToCalibrate
      const priorityScore = 1000 - officialWeight * 10 + remainingToCalibrate;

      queueCandidates.push({
        id: `queue-${rec.evidenceKey}-${rec.recommendedDifficultyTier}`,
        evidenceKey: rec.evidenceKey,
        domain: rec.domain,
        rawCode: rec.rawCode,
        evidenceDescription: rec.description,
        targetDifficulty,
        reason: 'calibration_needed',
        reasonLabelEs: `Calibración formativa: ${rec.sampleSizeLabel}`,
        priorityScore,
        estimatedMinutes: 8,
        availablePracticeCount: invInfo?.totalItems,
        isAvailableInAuthoredInventory: isAvailable,
      });
      continue;
    }

    // 2. Sufficiently measured evidences
    if (rec.status === 'needs_reinforcement') {
      // Accuracy < 60%
      // Priority formula: 2000 + (accuracyExactRatio * 1000) - (officialWeight * 10)
      const priorityScore = 2000 + rec.accuracyExactRatio * 1000 - officialWeight * 10;

      queueCandidates.push({
        id: `queue-${rec.evidenceKey}-${rec.recommendedDifficultyTier}`,
        evidenceKey: rec.evidenceKey,
        domain: rec.domain,
        rawCode: rec.rawCode,
        evidenceDescription: rec.description,
        targetDifficulty,
        reason: 'weak_performance',
        reasonLabelEs: `Refuerzo prioritario (${rec.accuracyPercentage}% de precisión)`,
        priorityScore,
        estimatedMinutes: 10,
        availablePracticeCount: invInfo?.totalItems,
        isAvailableInAuthoredInventory: isAvailable,
      });
      continue;
    }

    if (rec.status === 'in_progress') {
      // Accuracy 60% - 74%
      const priorityScore = 3000 + rec.accuracyExactRatio * 1000 - officialWeight * 10;

      queueCandidates.push({
        id: `queue-${rec.evidenceKey}-${rec.recommendedDifficultyTier}`,
        evidenceKey: rec.evidenceKey,
        domain: rec.domain,
        rawCode: rec.rawCode,
        evidenceDescription: rec.description,
        targetDifficulty,
        reason: 'weak_performance',
        reasonLabelEs: `Alineación hacia dominio (${rec.accuracyPercentage}%)`,
        priorityScore,
        estimatedMinutes: 10,
        availablePracticeCount: invInfo?.totalItems,
        isAvailableInAuthoredInventory: isAvailable,
      });
      continue;
    }

    if (rec.status === 'mastered' && rec.recommendedDifficultyTier > 1) {
      // Mastered at lower tier, candidate for higher difficulty tier challenge
      const priorityScore = 4000 - rec.recommendedDifficultyTier * 50;

      queueCandidates.push({
        id: `queue-${rec.evidenceKey}-${rec.recommendedDifficultyTier}`,
        evidenceKey: rec.evidenceKey,
        domain: rec.domain,
        rawCode: rec.rawCode,
        evidenceDescription: rec.description,
        targetDifficulty,
        reason: 'progression_next_tier',
        reasonLabelEs: `Desafío avanzado: Nivel ${rec.recommendedDifficultyTier}`,
        priorityScore,
        estimatedMinutes: 12,
        availablePracticeCount: invInfo?.totalItems,
        isAvailableInAuthoredInventory: isAvailable,
      });
    }
  }

  // Stable sort by priority score ascending, then by evidenceKey ascending
  const records = new Map(evidenceRecords.map(r => [r.evidenceKey, r]));
  queueCandidates.sort((a, b) => {
    const availability = Number(b.isAvailableInAuthoredInventory) - Number(a.isAvailableInAuthoredInventory);
    if (availability) return availability;
    const ar = records.get(a.evidenceKey)!; const br = records.get(b.evidenceKey)!;
    const calibration = Number(br.status === 'insufficient_data') - Number(ar.status === 'insufficient_data');
    if (calibration) return calibration;
    if (ar.status !== 'insufficient_data' && ar.accuracyExactRatio !== br.accuracyExactRatio) return ar.accuracyExactRatio - br.accuracyExactRatio;
    const weight = (evidenceMap.get(b.evidenceKey)?.weightOfficialPercent ?? 0) - (evidenceMap.get(a.evidenceKey)?.weightOfficialPercent ?? 0);
    if (weight) return weight;
    const recent = (Date.parse(br.lastIncorrectAt || '') || 0) - (Date.parse(ar.lastIncorrectAt || '') || 0);
    return (Number.isFinite(recent) ? recent : 0) || a.evidenceKey.localeCompare(b.evidenceKey);
  });

  return queueCandidates.slice(0, limit);
}

/**
 * Builds an actionable ordered study plan based on weak and in-progress evidences.
 */
export function generateStructuredStudyPlan(
  evidenceRecords: EvidenceMasteryRecord[],
  _evidenceCatalog?: QualifiedEvidenceInfo[],
  options: { availableInventoryByEvidence?: Record<string, { totalItems: number }>; availableLessonKeys?: string[]; now?: Date } = {}
): StructuredStudyPlan {
  const steps: StudyPlanStep[] = [];
  const weakRecords = evidenceRecords.filter(
    (r) => (r.status === 'needs_reinforcement' || r.status === 'in_progress' || r.status === 'insufficient_data') &&
      ((options.availableInventoryByEvidence?.[r.evidenceKey]?.totalItems ?? 0) > 0 || options.availableLessonKeys?.includes(r.evidenceKey))
  );

  // Sort: needs_reinforcement first (by lowest accuracy), then in_progress
  weakRecords.sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === 'needs_reinforcement' ? -1 : 1;
    }
    return a.accuracyExactRatio - b.accuracyExactRatio;
  });

  const selected = weakRecords.slice(0, 5);

  selected.forEach((rec, idx) => {
    const isCritical = rec.status === 'needs_reinforcement';
    steps.push({
      stepNumber: idx + 1,
      title: `Refuerzo de ${rec.rawCode}: ${rec.description || rec.evidenceKey}`,
      description: isCritical
        ? `Revisar lección teórica, fórmulas clave y completar práctica guiada (precisión actual: ${rec.accuracyPercentage}%).`
        : `Consolidar dominio resolviendo micro-quiz y práctica de nivel ${rec.recommendedDifficultyTier}.`,
      evidenceKey: rec.evidenceKey,
      domain: rec.domain,
      targetDifficulty: rec.recommendedDifficultyTier,
      recommendedActivity: options.availableLessonKeys?.includes(rec.evidenceKey) ? 'lesson' : 'targeted_practice',
      urgency: isCritical ? 'high' : 'medium',
    });
  });

  const retestInventory = selected.reduce((count, rec) => count + (options.availableInventoryByEvidence?.[rec.evidenceKey]?.totalItems ?? 0), 0);
  if (steps.length > 0 && retestInventory >= 5) {
    steps.push({
      stepNumber: steps.length + 1,
      title: 'Comprobación de retención y retest',
      description: `Realizar una prueba de hasta ${Math.min(10, retestInventory)} preguntas disponibles sobre las evidencias repasadas.`,
      evidenceKey: steps[0].evidenceKey,
      domain: steps[0].domain,
      targetDifficulty: 2,
      recommendedActivity: 'retest',
      urgency: 'medium',
    });
  }

  const totalMinutes = steps.length * 15;
  const focusSummary =
    steps.length === 0
      ? 'No hay actividades disponibles para este plan. Consulta la cobertura y reúne más datos antes de valorar el dominio.'
      : `Plan enfocado en ${selected.length} indicadores prioritarios para alcanzar el umbral formativo interno.`;

  return {
    planId: `plan-${(options.now || new Date()).toISOString()}`,
    generatedAt: (options.now || new Date()).toISOString(),
    totalSteps: steps.length,
    estimatedTotalMinutes: totalMinutes,
    steps,
    focusSummaryEs: focusSummary,
  };
}

/**
 * Determines whether the learner is due for a diagnostic or simulation retest.
 */
export function evaluateRetestRecommendation(
  evidenceRecords: EvidenceMasteryRecord[],
  totalResponsesInAuthoredPractice: number
): RetestRecommendation {
  const needsReinforcement = evidenceRecords.filter((r) => r.status === 'needs_reinforcement');
  const inProgress = evidenceRecords.filter((r) => r.status === 'in_progress');
  const mastered = evidenceRecords.filter((r) => r.status === 'mastered');

  if (totalResponsesInAuthoredPractice < 10) {
    return {
      shouldRetest: false,
      recommendedSessionKind: 'practice_evidence',
      recommendedItemCount: 10,
      targetEvidenceKeys: [],
      rationaleEs: 'Completa al menos 10 ejercicios de práctica guiada antes de realizar un retest.',
    };
  }

  if (needsReinforcement.length > 0) {
    const targets = needsReinforcement.slice(0, 3).map((r) => r.evidenceKey);
    return {
      shouldRetest: true,
      recommendedSessionKind: 'targeted_retest',
      recommendedItemCount: 10,
      targetEvidenceKeys: targets,
      rationaleEs: `Tienes ${needsReinforcement.length} evidencias que requieren refuerzo. Un retest de 10 ítems validará tu asimilación.`,
    };
  }

  if (inProgress.length > 2) {
    const targets = inProgress.slice(0, 4).map((r) => r.evidenceKey);
    return {
      shouldRetest: true,
      recommendedSessionKind: 'targeted_retest',
      recommendedItemCount: 12,
      targetEvidenceKeys: targets,
      rationaleEs: 'Varios indicadores están cerca del dominio (60% - 74%). Comprueba tu avance con una prueba breve.',
    };
  }

  if (mastered.length === 0) return { shouldRetest: false, recommendedSessionKind: 'practice_evidence', recommendedItemCount: 5, targetEvidenceKeys: [], rationaleEs: 'Faltan familias independientes para valorar el avance. Completa práctica disponible para calibrar.' };

  return {
    shouldRetest: true,
    recommendedSessionKind: 'simulation_mock',
    recommendedItemCount: 20,
    targetEvidenceKeys: mastered.slice(0, 5).map((r) => r.evidenceKey),
    rationaleEs: 'Has consolidado un buen nivel formativo. Se recomienda un simulacro para medir retención integral.',
  };
}
