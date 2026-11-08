import type { Attempt } from '@mep-ea/domain';
import type { AttemptRecord, DraftState, DraftWrite, DraftWriteResult, LearningContinuity } from '@mep-ea/api';
import { createHash } from 'node:crypto';
import { canonical, type AttemptRepository } from './service';

export interface ContinuityRepository extends AttemptRepository {
  /** Serialize snapshot derivation per learner so concurrent writes never regress the saved projection. */
  continuity(learnerId: string, derive: (records: AttemptRecord[]) => LearningContinuity): Promise<LearningContinuity>;
  getDraft(learnerId: string, attemptId: string): Promise<DraftState>;
  writeDraft(write: DraftWrite, receivedAt: string): Promise<DraftWriteResult>;
}
export function emptyDraftState(completed = false): DraftState { return { schemaVersion: 1, draft: null, conflicts: [], completed }; }
function extendsDraft(previous: Attempt, next: Attempt): boolean {
  return previous.assessmentId === next.assessmentId && previous.assessmentVersion === next.assessmentVersion &&
    previous.startedAt === next.startedAt && previous.deadlineAt === next.deadlineAt &&
    canonical(previous.questionIds) === canonical(next.questionIds) && Date.parse(next.updatedAt) >= Date.parse(previous.updatedAt) &&
    Object.entries(previous.firstAnswers ?? previous.answers).every(([id, answer]) => canonical((next.firstAnswers ?? next.answers)[id]) === canonical(answer));
}
/** Exact retries are accepted. Stale or invalid ancestry is retained, never overwritten or silently merged. */
export function reviseDraft(state: DraftState, write: DraftWrite, receivedAt: string): DraftWriteResult {
  const current = state.draft;
  if (!state.completed && current && canonical(current.attempt) === canonical(write.attempt)) return { accepted: true, record: current };
  if (!state.completed && write.baseRevision === (current?.revision ?? 0) && (!current || extendsDraft(current.attempt, write.attempt))) {
    const record = { schemaVersion: 1 as const, revision: (current?.revision ?? 0) + 1, attempt: write.attempt, deviceId: write.deviceId, receivedAt };
    state.draft = record; return { accepted: true, record };
  }
  const id = createHash('sha256').update(canonical(write)).digest('hex');
  if (!state.conflicts.some(c => c.id === id)) state.conflicts.push({ id, candidate: write, currentRevision: current?.revision ?? 0, receivedAt });
  return { accepted: false, state };
}
