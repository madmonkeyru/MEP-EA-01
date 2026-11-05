import type { AttemptEvent } from './types';
import { BXM_OFFICIAL_EVIDENCES_FIXTURE } from '../ui/evidenceCatalogFixture';

const keys = new Set(BXM_OFFICIAL_EVIDENCES_FIXTURE.map(e => e.key));
const kinds = new Set(['diagnostic', 'practice_topic', 'practice_evidence', 'simulation_benchmark', 'simulation_mock', 'micro_quiz', 'mastery_check', 'retest']);
const provenances = new Set(['authored_mastery', 'isomorphic_generated', 'official_reference', 'official_past', 'legacy_unknown']);
const option = (v: unknown) => typeof v === 'string' && /^[ABCD]$/.test(v);

/** Unknown assistance/review may remain in history but must not enter mastery. */
export function isAttemptEvent(value: unknown): value is AttemptEvent {
  if (!value || typeof value !== 'object') return false;
  const e = value as AttemptEvent;
  return e.schemaVersion === '1.0.0' &&
    ['eventId', 'sessionId', 'itemId'].every(k => typeof e[k as keyof AttemptEvent] === 'string' && String(e[k as keyof AttemptEvent]).length > 0) &&
    kinds.has(e.sessionKind) && ['study', 'exam'].includes(e.mode) && provenances.has(e.provenance) &&
    typeof e.timestamp === 'string' && Number.isFinite(Date.parse(e.timestamp)) &&
    keys.has(e.primaryEvidenceKey) && e.primaryEvidenceKey.split('/')[3] === e.domain &&
    (e.familyId === undefined || (typeof e.familyId === 'string' && e.familyId.trim().length > 0)) &&
    (e.conceptIds === undefined || (Array.isArray(e.conceptIds) && e.conceptIds.every(id => typeof id === 'string'))) &&
    (e.secondaryEvidenceKeys === undefined || (Array.isArray(e.secondaryEvidenceKeys) && e.secondaryEvidenceKeys.every(key => keys.has(key)))) &&
    ['reproduccion', 'conexion', 'reflexion'].includes(e.cognitiveLevel) && [1, 2, 3].includes(e.difficulty) &&
    option(e.selectedOption) && option(e.correctAnswer) && typeof e.isCorrect === 'boolean' &&
    e.isCorrect === (e.selectedOption === e.correctAnswer) &&
    Number.isInteger(e.responseIndex) && e.responseIndex >= 0 &&
    Number.isInteger(e.hintsUsedBeforeResponse) && e.hintsUsedBeforeResponse >= 0 &&
    (e.userId === undefined || (typeof e.userId === 'string' && e.userId.length > 0)) &&
    (e.programId === undefined || e.programId === 'bxm') &&
    (e.subjectId === undefined || e.subjectId === 'matematica') &&
    (e.specId === undefined || e.specId === '02-2026') &&
    (e.reviewStatus === undefined || ['unreviewed', 'computationally_checked', 'human_reviewed'].includes(e.reviewStatus)) &&
    (e.exposureFlags === undefined || (!!e.exposureFlags && typeof e.exposureFlags === 'object' && typeof e.exposureFlags.isBenchmarkItem === 'boolean' && typeof e.exposureFlags.hasSeenExplanationBefore === 'boolean')) &&
    (e.sessionStatus === undefined || ['completed', 'timed_out', 'abandoned'].includes(e.sessionStatus)) &&
    (e.sessionCompletedAt === undefined || Number.isFinite(Date.parse(e.sessionCompletedAt)));
}
