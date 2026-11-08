import type { Assessment, Attempt, OptionId, Score } from '@mep-ea/domain';
import { ensure, integer, object, text, timestamp } from '@mep-ea/validation';
import { attemptKey, type PersistenceAdapter } from './persistence';
export * from './persistence';
export * from './journey';

export function initializeAttempt(assessment: Assessment, id: string, learnerId: string, now: string): Attempt {
  text(id, 'attempt.id'); text(learnerId, 'attempt.learnerId'); timestamp(now, 'now');
  ensure(assessment.questions.length === assessment.blueprint.totalItems && assessment.questions.length > 0, 'assessment', 'invalid item count');
  return { schemaVersion: 1, id, learnerId, assessmentId: assessment.id, assessmentVersion: assessment.blueprint.version,
    questionIds: assessment.questions.map(q => q.id), status: 'in_progress', currentIndex: 0, answers: {}, startedAt: now, updatedAt: now,
    deadlineAt: new Date(Date.parse(now) + assessment.blueprint.timeLimitSeconds * 1000).toISOString() };
}
function matches(assessment: Assessment, attempt: Attempt) {
  ensure(attempt.assessmentId === assessment.id && attempt.assessmentVersion === assessment.blueprint.version &&
    JSON.stringify(attempt.questionIds) === JSON.stringify(assessment.questions.map(q => q.id)), 'attempt', 'assessment content changed');
}
function mutable(attempt: Attempt, now: string) {
  timestamp(now, 'now'); ensure(attempt.status === 'in_progress', 'attempt', 'already submitted');
  ensure(Date.parse(now) >= Date.parse(attempt.updatedAt), 'now', 'clock moved backwards');
}
export function recordAnswer(assessment: Assessment, attempt: Attempt, questionId: string, optionId: OptionId, now: string): Attempt {
  matches(assessment, attempt); mutable(attempt, now);
  ensure(Date.parse(now) < Date.parse(attempt.deadlineAt), 'attempt', 'time limit reached; submit to score');
  const question = assessment.questions.find(q => q.id === questionId);
  ensure(question?.options.some(o => o.id === optionId), 'answer', 'unknown question or option');
  return { ...attempt, updatedAt: now, answers: { ...attempt.answers, [questionId]: { questionId, optionId, answeredAt: now } } };
}
export function navigate(assessment: Assessment, attempt: Attempt, index: number, now: string): Attempt {
  matches(assessment, attempt); mutable(attempt, now); integer(index, 'index');
  ensure(index < assessment.questions.length, 'index', 'out of range');
  return { ...attempt, currentIndex: index, updatedAt: now };
}
export function scoreAttempt(assessment: Assessment, attempt: Attempt): Score {
  matches(assessment, attempt);
  const domains: Score['domains'] = {}; let correct = 0; let unanswered = 0;
  for (const q of assessment.questions) {
    const answer = attempt.answers[q.id];
    if (!answer) unanswered++;
    const hit = answer?.optionId === q.correctOptionId ? 1 : 0; correct += hit;
    const domain = domains[q.domainId] ??= { correct: 0, total: 0 }; domain.correct += hit; domain.total++;
  }
  const items = assessment.questions.map(q => ({ questionId: q.id, evidenceId: q.evidenceId, conceptIds: [...q.conceptIds],
    correct: attempt.answers[q.id]?.optionId === q.correctOptionId,
    ...(attempt.answers[q.id] ? { selectedOptionId: attempt.answers[q.id].optionId } : {}) }));
  return { correct, total: assessment.questions.length, unanswered, percentage: correct * 100 / assessment.questions.length, domains, items };
}
export function submitAttempt(assessment: Assessment, attempt: Attempt, now: string): Attempt {
  matches(assessment, attempt);
  if (attempt.status === 'submitted') return attempt;
  mutable(attempt, now);
  return { ...attempt, status: 'submitted', updatedAt: now, submittedAt: now, score: scoreAttempt(assessment, attempt) };
}
/** Validate untrusted stored state and recompute scores rather than trusting persisted totals. */
export function restoreAttempt(assessment: Assessment, raw: unknown, learnerId: string, attemptId: string): Attempt {
  const v = object(raw, 'attempt');
  ensure(v.schemaVersion === 1, 'attempt.schemaVersion', 'unsupported state version');
  ensure(v.id === attemptId && v.learnerId === learnerId, 'attempt', 'identity mismatch');
  const initialized = initializeAttempt(assessment, attemptId, learnerId, timestamp(v.startedAt, 'attempt.startedAt'));
  ensure(v.assessmentId === initialized.assessmentId && v.assessmentVersion === initialized.assessmentVersion &&
    JSON.stringify(v.questionIds) === JSON.stringify(initialized.questionIds), 'attempt', 'assessment content changed');
  ensure(v.deadlineAt === initialized.deadlineAt, 'attempt.deadlineAt', 'invalid deadline');
  const updatedAt = timestamp(v.updatedAt, 'attempt.updatedAt');
  ensure(Date.parse(updatedAt) >= Date.parse(initialized.startedAt), 'attempt.updatedAt', 'before start');
  const currentIndex = integer(v.currentIndex, 'attempt.currentIndex'); ensure(currentIndex < assessment.questions.length, 'attempt.currentIndex', 'out of range');
  ensure(v.status === 'in_progress' || v.status === 'submitted', 'attempt.status', 'invalid state');
  const answers: Attempt['answers'] = {};
  for (const [id, rawAnswer] of Object.entries(object(v.answers, 'attempt.answers'))) {
    const a = object(rawAnswer, 'answer'); const question = assessment.questions.find(q => q.id === id);
    ensure(a.questionId === id && question?.options.some(o => o.id === a.optionId), 'answer', 'unknown question or option');
    const answeredAt = timestamp(a.answeredAt, 'answer.answeredAt');
    ensure(Date.parse(answeredAt) >= Date.parse(initialized.startedAt) && Date.parse(answeredAt) <= Date.parse(updatedAt) && Date.parse(answeredAt) < Date.parse(initialized.deadlineAt), 'answer.answeredAt', 'outside attempt window');
    answers[id] = { questionId: id, optionId: a.optionId as OptionId, answeredAt };
  }
  const attempt: Attempt = { ...initialized, updatedAt, currentIndex, answers, status: v.status };
  if (v.status === 'submitted') {
    const submittedAt = timestamp(v.submittedAt, 'attempt.submittedAt');
    ensure(submittedAt === updatedAt, 'attempt.submittedAt', 'inconsistent submission timestamp');
    attempt.submittedAt = submittedAt; attempt.score = scoreAttempt(assessment, attempt);
  } else ensure(v.score === undefined && v.submittedAt === undefined, 'attempt', 'in-progress state cannot have a result');
  return attempt;
}

/** Serialized application commands persist before publishing state. Failed writes leave state intact. */
export class AssessmentSession {
  private state: Attempt | null = null;
  private pending: Promise<unknown> = Promise.resolve();
  constructor(readonly assessment: Assessment, private persistence: PersistenceAdapter,
    private learnerId: string, private attemptId: string, private now: () => string = () => new Date().toISOString()) {}
  get snapshot(): Attempt | null { return this.state ? JSON.parse(JSON.stringify(this.state)) as Attempt : null; }
  private enqueue<T>(action: () => Promise<T>): Promise<T> {
    const result = this.pending.then(action); this.pending = result.catch(() => undefined); return result;
  }
  private async commit(next: Attempt) {
    await this.persistence.save(attemptKey(this.learnerId, this.attemptId), next); this.state = next; return this.snapshot!;
  }
  open(): Promise<Attempt> { return this.enqueue(async () => {
    const raw = await this.persistence.load(attemptKey(this.learnerId, this.attemptId));
    return this.commit(raw === null ? initializeAttempt(this.assessment, this.attemptId, this.learnerId, this.now()) : restoreAttempt(this.assessment, raw, this.learnerId, this.attemptId));
  }); }
  private active(): Attempt { ensure(this.state, 'session', 'open session first'); return this.state; }
  answer(questionId: string, optionId: OptionId) { return this.enqueue(() => this.commit(recordAnswer(this.assessment, this.active(), questionId, optionId, this.now()))); }
  goTo(index: number) { return this.enqueue(() => this.commit(navigate(this.assessment, this.active(), index, this.now()))); }
  submit() { return this.enqueue(() => this.commit(submitAttempt(this.assessment, this.active(), this.now()))); }
}
