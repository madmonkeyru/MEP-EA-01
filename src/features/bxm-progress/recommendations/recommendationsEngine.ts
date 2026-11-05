import type {
  BxmDomain,
  DifficultyTier,
  QualifiedEvidenceInfo,
} from '../domain/types';
import type { EvidenceMasteryRecord } from '../domain/masteryEngine';

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
  availableInventoryByEvidence?: Record<string, { totalItems: number; tiers: DifficultyTier[] }>;
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
    const isAvailable = invInfo ? invInfo.totalItems > 0 : true;

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
        targetDifficulty: rec.recommendedDifficultyTier,
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
        targetDifficulty: rec.recommendedDifficultyTier,
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
        targetDifficulty: rec.recommendedDifficultyTier,
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
        targetDifficulty: rec.recommendedDifficultyTier,
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
  queueCandidates.sort((a, b) => {
    if (a.priorityScore !== b.priorityScore) {
      return a.priorityScore - b.priorityScore;
    }
    return a.evidenceKey.localeCompare(b.evidenceKey);
  });

  return queueCandidates.slice(0, limit);
}

/**
 * Builds an actionable ordered study plan based on weak and in-progress evidences.
 */
export function generateStructuredStudyPlan(
  evidenceRecords: EvidenceMasteryRecord[],
  _evidenceCatalog?: QualifiedEvidenceInfo[]
): StructuredStudyPlan {
  const steps: StudyPlanStep[] = [];
  const weakRecords = evidenceRecords.filter(
    (r) => r.status === 'needs_reinforcement' || r.status === 'in_progress'
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
      recommendedActivity: isCritical ? 'lesson' : 'targeted_practice',
      urgency: isCritical ? 'high' : 'medium',
    });
  });

  if (steps.length > 0) {
    steps.push({
      stepNumber: steps.length + 1,
      title: 'Comprobación de retención y retest',
      description: 'Realizar una prueba de 10 a 15 preguntas sobre las evidencias repasadas.',
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
      ? 'No se identifican debilidades críticas en el conjunto evaluado. Continúa con simulacros completos.'
      : `Plan enfocado en ${selected.length} indicadores prioritarios para alcanzar el umbral de dominio MEP.`;

  return {
    planId: `plan-${Date.now()}`,
    generatedAt: new Date().toISOString(),
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

  return {
    shouldRetest: true,
    recommendedSessionKind: 'simulation_mock',
    recommendedItemCount: 20,
    targetEvidenceKeys: mastered.slice(0, 5).map((r) => r.evidenceKey),
    rationaleEs: 'Has consolidado un buen nivel formativo. Se recomienda un simulacro para medir retención integral.',
  };
}
