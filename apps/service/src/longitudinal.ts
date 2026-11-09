import type { AttemptRecord } from '@mep-ea/api';
import type { LongitudinalLearnerMetrics } from './telemetry-repository';

/**
 * Derives longitudinal metrics from durable attempt history without creating a parallel domain model.
 */
export function deriveLongitudinalMetrics(learnerId: string, records: AttemptRecord[], nowIso?: string): LongitudinalLearnerMetrics {
  const evaluatedAt = nowIso ?? new Date().toISOString();
  if (records.length === 0) {
    return {
      learnerId,
      evaluatedAt,
      totalAttempts: 0,
      firstAttemptAt: null,
      lastAttemptAt: null,
      loopCounts: { diagnostic: 0, practice: 0, mock: 0, simulation: 0 },
      overallAccuracy: null,
      domainCoverage: {},
      habits: { averageDurationSeconds: 0, unansweredRate: 0, totalQuestionsEncountered: 0 },
      loopStage: 'diagnostic_needed',
    };
  }

  // Sort ascending by receivedAt
  const sorted = [...records].sort((a, b) => Date.parse(a.receivedAt) - Date.parse(b.receivedAt));
  const firstAttemptAt = sorted[0].receivedAt;
  const lastAttemptAt = sorted[sorted.length - 1].receivedAt;

  const loopCounts = { diagnostic: 0, practice: 0, mock: 0, simulation: 0 };
  let totalQuestions = 0;
  let totalCorrect = 0;
  let totalUnanswered = 0;
  let totalDurationSeconds = 0;
  const domainCoverage: Record<string, { total: number; correct: number; distinctFamilies: number; families: Set<string> }> = {};

  for (const record of sorted) {
    const { attempt, learningEvidence } = record;
    const mode = learningEvidence?.mode ?? (attempt.assessmentId.includes('diagnostic') ? 'diagnostic' : 'practice');

    if (mode === 'diagnostic') loopCounts.diagnostic++;
    else if (mode === 'practice') loopCounts.practice++;
    else if (mode === 'benchmark') {
      if (attempt.questionIds.length >= 60) loopCounts.simulation++;
      else loopCounts.mock++;
    }

    if (attempt.score) {
      totalQuestions += attempt.score.total;
      totalCorrect += attempt.score.correct;
      totalUnanswered += attempt.score.unanswered;
    }

    const start = Date.parse(attempt.startedAt);
    const end = Date.parse(attempt.submittedAt ?? attempt.updatedAt);
    if (!isNaN(start) && !isNaN(end) && end >= start) {
      totalDurationSeconds += Math.round((end - start) / 1000);
    }

    if (learningEvidence?.observations) {
      for (const obs of learningEvidence.observations) {
        if (!domainCoverage[obs.domainId]) {
          domainCoverage[obs.domainId] = { total: 0, correct: 0, distinctFamilies: 0, families: new Set() };
        }
        const dom = domainCoverage[obs.domainId];
        dom.total++;
        if (obs.correct) dom.correct++;
        dom.families.add(obs.familyId);
        dom.distinctFamilies = dom.families.size;
      }
    }
  }

  const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 1000) / 10 : null;
  const unansweredRate = totalQuestions > 0 ? Math.round((totalUnanswered / totalQuestions) * 1000) / 1000 : 0;
  const averageDurationSeconds = sorted.length > 0 ? Math.round(totalDurationSeconds / sorted.length) : 0;

  const cleanedDomainCoverage: Record<string, { total: number; correct: number; distinctFamilies: number }> = {};
  for (const [k, v] of Object.entries(domainCoverage)) {
    cleanedDomainCoverage[k] = { total: v.total, correct: v.correct, distinctFamilies: v.distinctFamilies };
  }

  let loopStage: LongitudinalLearnerMetrics['loopStage'] = 'diagnostic_needed';
  if (loopCounts.diagnostic === 0 && loopCounts.mock === 0 && loopCounts.simulation === 0) {
    loopStage = 'diagnostic_needed';
  } else if (loopCounts.practice > 0 && (overallAccuracy ?? 0) >= 75) {
    loopStage = 'exam_ready';
  } else if (loopCounts.practice > 0) {
    loopStage = 'ready_for_retest';
  } else {
    loopStage = 'remediation_in_progress';
  }

  return {
    learnerId,
    evaluatedAt,
    totalAttempts: sorted.length,
    firstAttemptAt,
    lastAttemptAt,
    loopCounts,
    overallAccuracy,
    domainCoverage: cleanedDomainCoverage,
    habits: {
      averageDurationSeconds,
      unansweredRate,
      totalQuestionsEncountered: totalQuestions,
    },
    loopStage,
  };
}
