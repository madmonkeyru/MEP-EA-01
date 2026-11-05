import type {
  AttemptEvent,
  BxmDomain,
  CognitiveLevel,
  DifficultyTier,
  MasteryStatus,
  QualifiedEvidenceInfo,
} from './types';
import { qualifyAttemptObservation } from './qualifyingObservation';

export interface EvidenceMasteryRecord {
  evidenceKey: string;
  domain: BxmDomain;
  rawCode: string;
  description?: string;
  qualifyingFamiliesCount: number; // Distinct families sampled in window
  minRequiredFamilies: number; // Baseline floor is 5
  correctCount: number;
  totalQualifyingCount: number;
  accuracyExactRatio: number; // correctCount / totalQualifyingCount
  accuracyPercentage: number; // rounded for display
  status: MasteryStatus;
  statusLabelEs: string;
  sampleSizeLabel: string; // e.g. "3/5 familias evaluadas (datos insuficientes)"
  lastAttemptAt?: string;
  lastIncorrectAt?: string;
  recommendedDifficultyTier: DifficultyTier;
  observedDifficulties: Record<DifficultyTier, { correct: number; total: number }>;
}

export interface DomainMasterySummary {
  domain: BxmDomain;
  labelEs: string;
  totalAssignedEvidences: number;
  measuredEvidencesCount: number; // Evidences with at least 1 attempt
  sufficientlySampledEvidencesCount: number; // Evidences with >= 5 families
  masteredCount: number;
  inProgressCount: number;
  needsReinforcementCount: number;
  insufficientDataCount: number;
  totalQualifyingResponses: number;
  correctQualifyingResponses: number;
  overallAccuracyExactRatio: number;
  overallAccuracyPercentage: number;
}

export interface CognitivePerformanceSummary {
  cognitiveLevel: CognitiveLevel;
  labelEs: string;
  correctCount: number;
  totalCount: number;
  accuracyExactRatio: number;
  accuracyPercentage: number;
}

export interface DifficultyPerformanceSummary {
  difficulty: DifficultyTier;
  labelEs: string;
  correctCount: number;
  totalCount: number;
  accuracyExactRatio: number;
  accuracyPercentage: number;
}

export interface ReadinessOverview {
  totalSpecEvidences: 71;
  measuredEvidencesCount: number; // at least 1 attempt
  sufficientlySampledEvidencesCount: number; // >= 5 families
  masteredEvidencesCount: number;
  inProgressEvidencesCount: number;
  needsReinforcementEvidencesCount: number;
  insufficientDataEvidencesCount: number;
  overallAuthoredAccuracyExactRatio: number;
  overallAuthoredAccuracyPercentage: number;
  totalAuthoredQualifyingResponses: number;
  totalBenchmarkAttemptsCount: number;
  totalAllResponsesCount: number;
  disclaimerEs: string;
}

export const FORMATIVE_READINESS_DISCLAIMER =
  'Indicador formativo interno de avance; no constituye una predicción ni garantía del resultado oficial ante el MEP.';

export const MIN_QUALIFYING_FAMILIES = 5;

const DOMAIN_LABELS: Record<BxmDomain, string> = {
  geometry: 'Geometría',
  functions: 'Relaciones y Álgebra',
  statistics: 'Estadística y Probabilidad',
};

const COGNITIVE_LABELS: Record<CognitiveLevel, string> = {
  reproduccion: 'Reproducción',
  conexion: 'Conexión',
  reflexion: 'Reflexión',
};

const DIFFICULTY_LABELS: Record<DifficultyTier, string> = {
  1: 'Nivel 1 (Básico)',
  2: 'Nivel 2 (Intermedio)',
  3: 'Nivel 3 (Avanzado)',
};

/**
 * Groups events by evidence key, then groups by template family (or itemId if no family)
 * selecting strictly the MOST RECENT qualifying observation per independent family within the 30-day window.
 */
export function aggregateQualifyingObservationsByFamily(
  events: AttemptEvent[],
  nowUtc: Date,
  windowDays = 30
): Map<string, AttemptEvent[]> {
  const qualifyingEvents = events.filter((ev) => {
    const q = qualifyAttemptObservation(ev, nowUtc, windowDays);
    return q.eligible;
  });

  // Group by evidence -> Map of familyId -> most recent event
  const evidenceMap = new Map<string, Map<string, AttemptEvent>>();

  for (const ev of qualifyingEvents) {
    const evKey = ev.primaryEvidenceKey;
    if (!evidenceMap.has(evKey)) {
      evidenceMap.set(evKey, new Map());
    }

    const familyKey = ev.familyId && ev.familyId.trim().length > 0 ? ev.familyId : `item:${ev.itemId}`;
    const familyMap = evidenceMap.get(evKey)!;

    const existing = familyMap.get(familyKey);
    if (!existing || new Date(ev.timestamp).getTime() > new Date(existing.timestamp).getTime()) {
      familyMap.set(familyKey, ev);
    }
  }

  // Convert to evidence -> list of most recent events per family
  const result = new Map<string, AttemptEvent[]>();
  evidenceMap.forEach((familyMap, evKey) => {
    result.set(evKey, Array.from(familyMap.values()));
  });

  return result;
}

/**
 * Computes evidence mastery records for all known evidences.
 */
export function computeEvidenceMasteryRecords(
  allEvidences: QualifiedEvidenceInfo[],
  events: AttemptEvent[],
  nowUtc: Date,
  windowDays = 30
): EvidenceMasteryRecord[] {
  const observationsByEvidence = aggregateQualifyingObservationsByFamily(events, nowUtc, windowDays);

  return allEvidences.map((evInfo) => {
    const observations = observationsByEvidence.get(evInfo.key) || [];
    const qualifyingFamiliesCount = observations.length;
    let correctCount = 0;

    const observedDifficulties: Record<DifficultyTier, { correct: number; total: number }> = {
      1: { correct: 0, total: 0 },
      2: { correct: 0, total: 0 },
      3: { correct: 0, total: 0 },
    };

    let lastAttemptTime = 0;
    let lastAttemptIso: string | undefined;

    for (const obs of observations) {
      if (obs.isCorrect) correctCount++;
      const diff = obs.difficulty || 1;
      observedDifficulties[diff].total++;
      if (obs.isCorrect) observedDifficulties[diff].correct++;

      const t = new Date(obs.timestamp).getTime();
      if (t > lastAttemptTime) {
        lastAttemptTime = t;
        lastAttemptIso = obs.timestamp;
      }
    }

    const totalQualifyingCount = qualifyingFamiliesCount;
    const accuracyExactRatio = totalQualifyingCount > 0 ? correctCount / totalQualifyingCount : 0;
    const accuracyPercentage = Math.round(accuracyExactRatio * 100);

    let status: MasteryStatus = 'insufficient_data';
    let statusLabelEs = 'Datos insuficientes';

    if (qualifyingFamiliesCount >= MIN_QUALIFYING_FAMILIES) {
      if (accuracyExactRatio >= 0.75) {
        status = 'mastered';
        statusLabelEs = 'Dominado';
      } else if (accuracyExactRatio >= 0.6) {
        status = 'in_progress';
        statusLabelEs = 'En progreso';
      } else {
        status = 'needs_reinforcement';
        statusLabelEs = 'Requiere refuerzo';
      }
    }

    const sampleSizeLabel =
      qualifyingFamiliesCount >= MIN_QUALIFYING_FAMILIES
        ? `${qualifyingFamiliesCount} familias evaluadas`
        : `${qualifyingFamiliesCount}/${MIN_QUALIFYING_FAMILIES} familias para calibrar`;

    // Progression recommendation rule from CONSOLIDATED DECISIONS:
    // Recommend tier 2 after at least 5 qualifying families at tier 1 with >= 75% accuracy;
    // recommend tier 3 after at least 5 qualifying families at tier 2 with >= 75% accuracy.
    let recommendedDifficultyTier: DifficultyTier = 1;
    const tierObservation = (tier: DifficultyTier) => aggregateQualifyingObservationsByFamily(
      events.filter(e => e.difficulty === tier), nowUtc, windowDays,
    ).get(evInfo.key) || [];
    const tier1 = tierObservation(1);
    const tier2 = tierObservation(2);
    if (tier1.length >= 5 && tier1.filter(e => e.isCorrect).length / tier1.length >= 0.75) recommendedDifficultyTier = 2;
    if (tier2.length >= 5 && tier2.filter(e => e.isCorrect).length / tier2.length >= 0.75) recommendedDifficultyTier = 3;

    return {
      evidenceKey: evInfo.key,
      domain: evInfo.domain,
      rawCode: evInfo.rawCode,
      description: evInfo.description,
      qualifyingFamiliesCount,
      minRequiredFamilies: MIN_QUALIFYING_FAMILIES,
      correctCount,
      totalQualifyingCount,
      accuracyExactRatio,
      accuracyPercentage,
      status,
      statusLabelEs,
      sampleSizeLabel,
      lastAttemptAt: lastAttemptIso,
      lastIncorrectAt: events.filter(e => e.primaryEvidenceKey === evInfo.key && !e.isCorrect && qualifyAttemptObservation(e, nowUtc, windowDays).eligible)
        .map(e => e.timestamp).sort().at(-1),
      recommendedDifficultyTier,
      observedDifficulties,
    };
  });
}

/**
 * Computes domain-level summaries across evidences and qualifying observations.
 */
export function computeDomainMasterySummaries(
  evidenceRecords: EvidenceMasteryRecord[]
): Record<BxmDomain, DomainMasterySummary> {
  const domains: BxmDomain[] = ['geometry', 'functions', 'statistics'];

  const initDomain = (d: BxmDomain): DomainMasterySummary => ({
    domain: d,
    labelEs: DOMAIN_LABELS[d],
    totalAssignedEvidences: 0,
    measuredEvidencesCount: 0,
    sufficientlySampledEvidencesCount: 0,
    masteredCount: 0,
    inProgressCount: 0,
    needsReinforcementCount: 0,
    insufficientDataCount: 0,
    totalQualifyingResponses: 0,
    correctQualifyingResponses: 0,
    overallAccuracyExactRatio: 0,
    overallAccuracyPercentage: 0,
  });

  const result: Record<BxmDomain, DomainMasterySummary> = {
    geometry: initDomain('geometry'),
    functions: initDomain('functions'),
    statistics: initDomain('statistics'),
  };

  for (const rec of evidenceRecords) {
    const d = result[rec.domain];
    d.totalAssignedEvidences++;

    if (rec.qualifyingFamiliesCount > 0) {
      d.measuredEvidencesCount++;
      d.totalQualifyingResponses += rec.totalQualifyingCount;
      d.correctQualifyingResponses += rec.correctCount;
    }

    if (rec.qualifyingFamiliesCount >= MIN_QUALIFYING_FAMILIES) {
      d.sufficientlySampledEvidencesCount++;
      if (rec.status === 'mastered') d.masteredCount++;
      else if (rec.status === 'in_progress') d.inProgressCount++;
      else if (rec.status === 'needs_reinforcement') d.needsReinforcementCount++;
    } else {
      d.insufficientDataCount++;
    }
  }

  for (const d of domains) {
    const dom = result[d];
    dom.overallAccuracyExactRatio =
      dom.totalQualifyingResponses > 0 ? dom.correctQualifyingResponses / dom.totalQualifyingResponses : 0;
    dom.overallAccuracyPercentage = Math.round(dom.overallAccuracyExactRatio * 100);
  }

  return result;
}

/**
 * Computes cognitive level performance breakdown with exact sample sizes.
 */
export function computeCognitivePerformance(
  events: AttemptEvent[],
  nowUtc: Date,
  windowDays = 30
): CognitivePerformanceSummary[] {
  const qualifying = events.filter((ev) => qualifyAttemptObservation(ev, nowUtc, windowDays).eligible);

  const levels: CognitiveLevel[] = ['reproduccion', 'conexion', 'reflexion'];
  const counts: Record<CognitiveLevel, { correct: number; total: number }> = {
    reproduccion: { correct: 0, total: 0 },
    conexion: { correct: 0, total: 0 },
    reflexion: { correct: 0, total: 0 },
  };

  for (const ev of qualifying) {
    const lvl = ev.cognitiveLevel || 'reproduccion';
    if (counts[lvl]) {
      counts[lvl].total++;
      if (ev.isCorrect) counts[lvl].correct++;
    }
  }

  return levels.map((lvl) => {
    const data = counts[lvl];
    const ratio = data.total > 0 ? data.correct / data.total : 0;
    return {
      cognitiveLevel: lvl,
      labelEs: COGNITIVE_LABELS[lvl],
      correctCount: data.correct,
      totalCount: data.total,
      accuracyExactRatio: ratio,
      accuracyPercentage: Math.round(ratio * 100),
    };
  });
}

/**
 * Computes difficulty tier performance breakdown with exact sample sizes.
 */
export function computeDifficultyPerformance(
  events: AttemptEvent[],
  nowUtc: Date,
  windowDays = 30
): DifficultyPerformanceSummary[] {
  const qualifying = events.filter((ev) => qualifyAttemptObservation(ev, nowUtc, windowDays).eligible);

  const tiers: DifficultyTier[] = [1, 2, 3];
  const counts: Record<DifficultyTier, { correct: number; total: number }> = {
    1: { correct: 0, total: 0 },
    2: { correct: 0, total: 0 },
    3: { correct: 0, total: 0 },
  };

  for (const ev of qualifying) {
    const diff = ev.difficulty || 1;
    if (counts[diff]) {
      counts[diff].total++;
      if (ev.isCorrect) counts[diff].correct++;
    }
  }

  return tiers.map((diff) => {
    const data = counts[diff];
    const ratio = data.total > 0 ? data.correct / data.total : 0;
    return {
      difficulty: diff,
      labelEs: DIFFICULTY_LABELS[diff],
      correctCount: data.correct,
      totalCount: data.total,
      accuracyExactRatio: ratio,
      accuracyPercentage: Math.round(ratio * 100),
    };
  });
}

/**
 * Computes high-level Formative Readiness Overview.
 * Transparently presents observed counts and exact ratios rather than an unvalidated composite percentage.
 */
export function computeReadinessOverview(
  evidenceRecords: EvidenceMasteryRecord[],
  allEvents: AttemptEvent[],
  nowUtc: Date,
  windowDays = 30
): ReadinessOverview {
  let measuredCount = 0;
  let sufficientlySampledCount = 0;
  let masteredCount = 0;
  let inProgressCount = 0;
  let needsReinforcementCount = 0;
  let insufficientDataCount = 0;

  for (const rec of evidenceRecords) {
    if (rec.qualifyingFamiliesCount > 0) measuredCount++;
    if (rec.qualifyingFamiliesCount >= MIN_QUALIFYING_FAMILIES) {
      sufficientlySampledCount++;
      if (rec.status === 'mastered') masteredCount++;
      else if (rec.status === 'in_progress') inProgressCount++;
      else if (rec.status === 'needs_reinforcement') needsReinforcementCount++;
    } else {
      insufficientDataCount++;
    }
  }

  const qualifyingEvents = allEvents.filter((ev) => qualifyAttemptObservation(ev, nowUtc, windowDays).eligible);
  const correctAuthored = qualifyingEvents.filter((ev) => ev.isCorrect).length;
  const ratio = qualifyingEvents.length > 0 ? correctAuthored / qualifyingEvents.length : 0;

  const benchmarkCount = allEvents.filter(
    (ev) => ev.provenance === 'official_reference' || ev.exposureFlags?.isBenchmarkItem
  ).length;

  return {
    totalSpecEvidences: 71,
    measuredEvidencesCount: measuredCount,
    sufficientlySampledEvidencesCount: sufficientlySampledCount,
    masteredEvidencesCount: masteredCount,
    inProgressEvidencesCount: inProgressCount,
    needsReinforcementEvidencesCount: needsReinforcementCount,
    insufficientDataEvidencesCount: insufficientDataCount,
    overallAuthoredAccuracyExactRatio: ratio,
    overallAuthoredAccuracyPercentage: Math.round(ratio * 100),
    totalAuthoredQualifyingResponses: qualifyingEvents.length,
    totalBenchmarkAttemptsCount: benchmarkCount,
    totalAllResponsesCount: allEvents.length,
    disclaimerEs: FORMATIVE_READINESS_DISCLAIMER,
  };
}
