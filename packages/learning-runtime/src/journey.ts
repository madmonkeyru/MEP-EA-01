import type { Assessment, AssessmentBlueprint, Attempt, Diagnostic, RemediationPlan } from '@mep-ea/domain';
import { resolveBlueprint, type ContentRegistry } from '@mep-ea/content';
import { ensure } from '@mep-ea/validation';
import { AssessmentSession, scoreAttempt } from './index';
import { attemptKey, createLocalAdapter, type StringStorage } from './persistence';
import type { AttemptOutbox } from './sync';

export interface JourneyCatalog { registry: ContentRegistry; blueprints: AssessmentBlueprint[]; allowDraftPreview?: boolean }
export interface JourneyState { assessment: Assessment; attempt: Attempt }
export function diagnose(assessment: Assessment, attempt: Attempt): Diagnostic {
  ensure(attempt.status === 'submitted', 'diagnostic', 'submission required');
  const score = scoreAttempt(assessment, attempt);
  return { attemptId: attempt.id, generatedAt: attempt.submittedAt!, provisional: true,
    weakEvidenceIds: [...new Set(score.items.filter(i => !i.correct).map(i => i.evidenceId))],
    domains: Object.entries(score.domains).map(([domainId, d]) => ({ domainId, ...d,
      tier: d.correct / d.total >= .75 ? 'strong' : d.correct / d.total >= .6 ? 'developing' : 'needs_practice' })) };
}
export function remediate(assessment: Assessment, attempt: Attempt, diagnostic: Diagnostic): RemediationPlan {
  ensure(diagnostic.attemptId === attempt.id && attempt.status === 'submitted', 'remediation', 'submitted diagnostic required');
  const questions = assessment.questions.filter(q => diagnostic.weakEvidenceIds.includes(q.evidenceId));
  const conceptIds = [...new Set(questions.flatMap(q => q.conceptIds))];
  return { learnerId: attempt.learnerId, conceptIds, reason: 'diagnostic_weakness', nextStep: conceptIds.length ? 'practice' : 'reassess',
    activities: conceptIds.map(conceptId => {
      const q = questions.find(item => item.conceptIds.includes(conceptId))!;
      return { conceptId, questionId: q.id, title: q.stem, steps: [...q.solution] };
    }) };
}
/** One durable active pointer per local learner. Attempts remain immutable history on restart. */
export class LearnerJourney {
  private session: AssessmentSession | null = null;
  private key: string;
  constructor(readonly catalog: JourneyCatalog, private storage: StringStorage, private learnerId: string,
    private now: () => string = () => new Date().toISOString(), private newId: () => string = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    private outbox?: AttemptOutbox) {
    this.key = `mep-ea:v1:journey:${encodeURIComponent(learnerId)}`;
  }
  private compile(blueprintId: string) {
    const blueprint = this.catalog.blueprints.find(b => b.id === blueprintId);
    ensure(blueprint, 'journey', 'unknown assessment');
    return resolveBlueprint(blueprint, this.catalog.registry, { allowDraftPreview: this.catalog.allowDraftPreview });
  }
  private create(assessment: Assessment, id: string) {
    return new AssessmentSession(assessment, createLocalAdapter(this.storage), this.learnerId, id, this.now);
  }
  async resume(): Promise<JourneyState | null> {
    const raw = await this.storage.getItem(this.key);
    if (raw === null) return null;
    const pointer = JSON.parse(raw);
    ensure(pointer.schemaVersion === 1 && typeof pointer.blueprintId === 'string' && typeof pointer.attemptId === 'string', 'journey', 'invalid saved journey');
    ensure(await this.storage.getItem(attemptKey(this.learnerId, pointer.attemptId)) !== null, 'journey', 'saved attempt is missing');
    const assessment = this.compile(pointer.blueprintId);
    const session = this.create(assessment, pointer.attemptId);
    const attempt = await session.open(); this.session = session;
    if (attempt.status === 'submitted') await this.queue(attempt);
    return this.expire({ assessment, attempt });
  }
  async start(blueprintId: string): Promise<JourneyState> {
    // Do not replace the recovery pointer until a previously completed attempt is queued.
    const previous = this.session?.snapshot;
    if (previous?.status === 'submitted') await this.outbox?.enqueue(previous);
    const assessment = this.compile(blueprintId); const id = this.newId();
    const session = this.create(assessment, id); const attempt = await session.open();
    await this.storage.setItem(this.key, JSON.stringify({ schemaVersion: 1, blueprintId, attemptId: id }));
    this.session = session; return { assessment, attempt };
  }
  private active() { ensure(this.session, 'journey', 'start or resume first'); return this.session; }
  async expire(state: JourneyState): Promise<JourneyState> {
    return state.attempt.status === 'in_progress' && Date.parse(this.now()) >= Date.parse(state.attempt.deadlineAt)
      ? { assessment: state.assessment, attempt: await this.submitLocal() } : state;
  }
  async answer(questionId: string, optionId: Parameters<AssessmentSession['answer']>[1]) {
    const s = this.active(); return { assessment: s.assessment, attempt: await s.answer(questionId, optionId) };
  }
  async goTo(index: number) { const s = this.active(); return { assessment: s.assessment, attempt: await s.goTo(index) }; }
  private async queue(attempt: Attempt) {
    // Local result is already durable. Resume repairs an interrupted/failed outbox enqueue.
    try { await this.outbox?.enqueue(attempt); } catch { /* local learning remains available */ }
  }
  private async submitLocal() { const attempt = await this.active().submit(); await this.queue(attempt); return attempt; }
  async synchronize() {
    const attempt = this.session?.snapshot;
    if (attempt?.status === 'submitted') await this.outbox?.enqueue(attempt);
    return this.outbox?.flush() ?? { sent: 0, pending: 0 };
  }
  async submit() { const s = this.active(); return { assessment: s.assessment, attempt: await this.submitLocal() }; }
  result(state: JourneyState) {
    const diagnostic = diagnose(state.assessment, state.attempt);
    return { diagnostic, plan: remediate(state.assessment, state.attempt, diagnostic) };
  }
}
