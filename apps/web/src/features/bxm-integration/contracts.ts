import type { BxmAuthoredItem } from '../bxm-learning/types';
import type { AssessmentItem, SessionResultExport, SessionKind } from '../bxm-assessment/types';
import type { AttemptEvent } from '../bxm-progress/domain/types';
import { isAttemptEvent } from '../bxm-progress/domain/validateAttempt';
import { BXM_OFFICIAL_EVIDENCES_FIXTURE } from '../bxm-progress/ui/evidenceCatalogFixture';
import { createPrng } from '../bxm-assessment/selectionEngine';

export function canonicalMathSubject(subjectId: string): 'matematica' {
  if (!['matematica', 'matematicas'].includes(subjectId)) throw new Error('Unsupported math subject');
  return 'matematica';
}

/** Explicit provenance normalization; no inferred review or paid-access grants. */
export function toAssessmentItem(item: BxmAuthoredItem): AssessmentItem {
  const provenance = item.provenance === 'authored_proprietary' ? 'authored' :
    item.provenance === 'authored_isomorphic_variant' ? 'generated_isomorph' : undefined;
  if (!provenance || item.reviewStatus !== 'authored_computationally_checked' ||
    !BXM_OFFICIAL_EVIDENCES_FIXTURE.some(e => e.key === item.evidenceKey && e.domain === item.domain)) {
    throw new Error(`Unsupported authored item metadata: ${item.id}`);
  }
  const letters = ['A', 'B', 'C', 'D'] as const;
  if (!letters.every(k => typeof item.options[k] === 'string') || !letters.includes(item.correctOption as typeof letters[number])) throw new Error('Invalid options');
  return {
    id: item.id, code: item.code, familyId: item.familyId, templateVersion: item.templateVersion,
    provenance, reviewStatus: 'computationally_checked', domain: item.domain,
    evidenceCode: item.evidenceCode, evidenceId: item.evidenceKey, conceptId: item.conceptId,
    cognitiveLevel: item.cognitiveLevel, difficultyTier: item.difficulty, stem: item.stem,
    options: item.options as AssessmentItem['options'], correctAnswer: item.correctOption as AssessmentItem['correctAnswer'],
    solutionSteps: item.solutionSteps, calculatorAllowed: item.calculatorAllowed,
    distractorExplanations: Object.fromEntries(Object.entries(item.distractorRationale).map(([option, explanation]) =>
      [option, { option, explanation }])) as AssessmentItem['distractorExplanations'],
  };
}

/** Deterministic presentation permutation with answer and rationale remapped together. */
export function shuffleAssessmentOptions(item: AssessmentItem, seed: number): AssessmentItem {
  const next = structuredClone(item);
  const letters = ['A', 'B', 'C', 'D'] as const;
  const source = Array.isArray(item.options) ? Object.fromEntries(item.options.map(o => [o.letter, o.text])) : item.options;
  const order = [...letters]; const random = createPrng(seed);
  for (let i = 3; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  next.options = {} as Record<typeof letters[number], string>;
  next.distractorExplanations = {} as NonNullable<AssessmentItem['distractorExplanations']>;
  letters.forEach((target, i) => {
    const original = order[i];
    (next.options as Record<string, string>)[target] = source[original];
    if (original === item.correctAnswer) next.correctAnswer = target;
    const rationale = item.distractorExplanations?.[original];
    if (rationale) next.distractorExplanations![target] = { ...rationale, option: target };
  });
  return next;
}

const kindMap: Record<SessionKind, AttemptEvent['sessionKind']> = {
  diagnostic: 'diagnostic', topic_practice: 'practice_topic', evidence_practice: 'practice_evidence',
  mastery_check: 'mastery_check', retest: 'retest', mock_exam: 'simulation_mock', micro_quiz: 'micro_quiz',
};

export function toProgressEvents(result: SessionResultExport, userId: string): AttemptEvent[] {
  if (!userId || !result.isFinalized || !Array.isArray(result.itemSnapshots)) throw new Error('Finalized session, learner, and item snapshots are required');
  if (result.programId !== 'bxm' || result.subjectId !== 'matematica' || result.specId !== '02-2026' ||
    !['completed', 'timed_out', 'abandoned'].includes(result.status) || !['study','exam'].includes(result.mode) ||
    !Number.isFinite(Date.parse(result.completedAt)) || !kindMap[result.kind]) throw new Error('Invalid result context');
  const items = new Map(result.itemSnapshots.map(i => [String(i.id), i]));
  return Object.values(result.attempts).flatMap(attempt => {
    const item = items.get(String(attempt.itemId));
    if (!item) throw new Error('Missing immutable item snapshot');
    if (!['authored', 'generated_isomorph', 'official_benchmark', 'official_past'].includes(item.provenance) ||
      !['unreviewed', 'computationally_checked', 'expert_reviewed', 'certified'].includes(item.reviewStatus)) throw new Error('Unknown snapshot provenance or review state');
    return [attempt.firstResponse, ...attempt.retries].filter(response => response?.selectedOption != null).map(response => {
      const r = response!;
      const event: AttemptEvent = {
        schemaVersion: '1.0.0', userId, programId: 'bxm', subjectId: 'matematica', specId: '02-2026',
        eventId: r.eventId, sessionId: result.sessionId, sessionKind: kindMap[result.kind], mode: result.mode,
        timestamp: r.timestamp, itemId: String(item.id), familyId: item.familyId,
        primaryEvidenceKey: item.evidenceId, conceptIds: [...new Set([...(item.linkedConceptIds || []), ...(item.conceptId ? [item.conceptId] : [])])],
        domain: item.domain, provenance: item.provenance === 'authored' ? 'authored_mastery' :
          item.provenance === 'generated_isomorph' ? 'isomorphic_generated' : item.provenance === 'official_benchmark' ? 'official_reference' : 'official_past',
        reviewStatus: item.reviewStatus === 'computationally_checked' ? 'computationally_checked' :
          item.reviewStatus === 'unreviewed' ? 'unreviewed' : 'human_reviewed',
        cognitiveLevel: item.cognitiveLevel, difficulty: item.difficultyTier,
        selectedOption: r.selectedOption!, correctAnswer: item.correctAnswer, isCorrect: r.isCorrect,
        responseIndex: r.attemptIndex, hintsUsedBeforeResponse: r.hintsUsedBeforeResponse,
        exposureFlags: r.hasSeenExplanationBefore === undefined ? undefined : {
          isBenchmarkItem: item.provenance === 'official_benchmark', hasSeenExplanationBefore: r.hasSeenExplanationBefore,
        },
        learnerReportedReason: r.learnerReportedReason, misconceptionCode: r.authoredMisconception?.misconceptionId,
        sessionStatus: result.status, sessionCompletedAt: result.completedAt,
      };
      if (!isAttemptEvent(event)) throw new Error('Invalid response event export');
      return event;
    });
  });
}
