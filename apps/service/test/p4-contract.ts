import { randomUUID } from 'node:crypto';
import { expect, it } from 'vitest';
import { createFoundationAssessment, createJourneyPreviewCatalog } from '@mep-ea/content/preview';
import { initializeAttempt, recordAnswer, submitAttempt, AttemptOutbox, attemptKey } from '@mep-ea/learning-runtime';
import { resolveBlueprint } from '@mep-ea/content';
import { createPlatformApi, DraftSynchronizer, type AuthSession, type DraftWrite, type CatalogPackage } from '@mep-ea/api';
import { createService } from '../src/service';
import type { ContinuityRepository } from '../src/continuity-repository';

const at = '2026-11-08T12:00:00.000Z';
const assessment = createFoundationAssessment();
const local = createJourneyPreviewCatalog();
const catalog: CatalogPackage = { schemaVersion: 1, version: 'p4-fixture', channel: 'development', ...local };
export function p4RepositoryContract(factory: () => Promise<ContinuityRepository>) {
  async function setup() {
    const repository = await factory(); const owner = randomUUID();
    const session: AuthSession = { kind: 'authenticated', learnerId: owner, tier: 'free', roles: ['learner'], accessToken: 'p4-fixture-token', expiresAt: '2026-11-09T00:00:00Z' };
    const options = { repository, catalog, allowDevelopment: true, verifier: { verify: async () => session }, now: () => Date.parse(at) };
    const service = createService(options);
    const auth = { getSession: async () => session, signOut: async () => {} };
    const api = createPlatformApi(auth, service, options.now);
    const draft = initializeAttempt(assessment, 'draft', owner, at);
    const write: DraftWrite = { schemaVersion: 1, attempt: draft, baseRevision: 0, deviceId: 'device-a' };
    return { repository, owner, service, options, api, draft, write, auth };
  }
  it('persists normalized immutable attempts, deduplicates races and derives owner-scoped continuity', async () => {
    const { api, draft, repository, owner } = await setup();
    const attempt = submitAttempt(assessment, draft, at);
    await Promise.all(Array.from({ length: 8 }, () => api.submitAttempt({ ...attempt, accessToken: 'must-not-persist' } as typeof attempt)));
    const record = await repository.find(owner, 'draft');
    expect(JSON.stringify(record)).not.toContain('must-not-persist');
    expect(record!.learningEvidence!.observations).toHaveLength(3);
    const continuity = await api.getLearningContinuity();
    expect(continuity.mastery.evidence.length).toBeGreaterThan(0);
    expect(continuity.mastery.evidence.every(e => e.tier === 'insufficient_evidence')).toBe(true);
    expect(continuity.plan.activities.length).toBeGreaterThan(0);
    expect(continuity.mastery.learnerId).toBe(owner);
    const changed = submitAttempt(assessment, recordAnswer(assessment, draft, assessment.questions[0].id, 'A', at), at);
    await expect(api.submitAttempt(changed)).rejects.toMatchObject({ status: 409 });
    expect(await repository.find('another', 'draft')).toBeNull();
  });
  it('serializes multi-device revisions, retains divergent candidates across recreation and allows explicit reconciliation', async () => {
    const { api, write, draft, options } = await setup();
    expect((await api.saveDraft(write)).revision).toBe(1);
    expect((await api.saveDraft(write)).revision).toBe(1);
    const a = recordAnswer(assessment, draft, assessment.questions[0].id, 'A', at);
    const b = recordAnswer(assessment, draft, assessment.questions[0].id, 'B', at);
    const results = await Promise.allSettled([api.saveDraft({ ...write, attempt: a, baseRevision: 1 }), api.saveDraft({ ...write, attempt: b, baseRevision: 1, deviceId: 'device-b' })]);
    expect(results.filter(r => r.status === 'fulfilled')).toHaveLength(1);
    const reopened = createPlatformApi({ getSession: async () => options.verifier.verify(), signOut: async () => {} }, createService({ ...options, repository: await factory() }), options.now);
    const state = await reopened.getDraft('draft');
    expect(state.draft!.revision).toBe(2); expect(state.conflicts).toHaveLength(1);
    expect(state.conflicts[0].candidate.attempt.answers).not.toEqual(state.draft!.attempt.answers);
    // Explicit resolution can preserve the committed first response and reconcile current answers.
    const candidate = state.conflicts[0].candidate.attempt;
    const merged = { ...candidate, firstAnswers: state.draft!.attempt.firstAnswers };
    expect((await api.saveDraft({ ...write, attempt: merged, baseRevision: 2 })).revision).toBe(3);
    expect((await api.getDraft('draft')).conflicts).toHaveLength(1);
  });
  it('freezes mutable state after completion and retains late draft conflicts', async () => {
    const { api, draft, write } = await setup();
    await api.saveDraft(write); await api.submitAttempt(submitAttempt(assessment, draft, at));
    await expect(api.saveDraft({ ...write, baseRevision: 1 })).rejects.toMatchObject({ status: 409 });
    const state = await api.getDraft('draft'); expect(state.completed).toBe(true); expect(state.draft!.revision).toBe(1); expect(state.conflicts).toHaveLength(1);
  });
  it('retains conflicts for rewritten ancestry even with the current revision, and isolates another owner', async () => {
    const { api, write, draft, repository, owner } = await setup();
    const answered = recordAnswer(assessment, draft, assessment.questions[0].id, 'A', at);
    await api.saveDraft({ ...write, attempt: answered });
    await expect(api.saveDraft({ ...write, baseRevision: 1, attempt: draft })).rejects.toMatchObject({ status: 409 });
    expect((await api.getDraft('draft')).draft!.attempt.answers).toEqual(answered.answers);
    expect((await repository.getDraft(`${owner}-other`, 'draft')).draft).toBeNull();
    expect((await repository.getDraft(`${owner}-other`, 'draft')).conflicts).toEqual([]);
  });
  it('rejects cross-owner and malformed drafts, and keeps reads owner-scoped', async () => {
    const { service, api, write } = await setup();
    await api.saveDraft(write);
    const headers = { Authorization: 'Bearer p4-fixture-token' };
    for (const [body, status] of [[{ ...write, baseRevision: -1 }, 422], [{ ...write, attempt: { ...write.attempt, learnerId: 'other' } }, 403],
      [{ ...write, attempt: { ...write.attempt, accessToken: 'strip-me' }, deviceId: '' }, 422]] as const) {
      expect((await service.send({ method: 'PUT', path: '/v1/drafts/draft', headers, body: JSON.stringify(body) })).status).toBe(status);
    }
    expect((await service.send({ method: 'GET', path: '/v1/learning-continuity', headers: {} })).status).toBe(401);
  });
  it('commits local drafts before remote delivery, retries after outage and retains conflict details without credentials', async () => {
    const { api, owner, write, draft } = await setup();
    const disk = new Map<string, string>(); const storage = { getItem: (k: string) => disk.get(k) ?? null,
      setItem: (k: string, v: string) => { disk.set(k, v); }, removeItem: (k: string) => { disk.delete(k); } };
    let online = false;
    const remote = { saveDraft: async (value: DraftWrite) => { expect(storage.getItem(attemptKey(owner, 'draft'))).not.toBeNull(); if (!online) throw new Error('offline'); return api.saveDraft(value); } };
    const sync = new DraftSynchronizer(storage, owner, 'device-a', remote);
    expect(await sync.save(draft)).toBeNull(); online = true;
    expect((await new DraftSynchronizer(storage, owner, 'device-a', remote).flush('draft'))!.revision).toBe(1);
    const other = recordAnswer(assessment, draft, assessment.questions[0].id, 'A', at);
    await api.saveDraft({ ...write, attempt: other, baseRevision: 1 });
    const divergent = recordAnswer(assessment, draft, assessment.questions[0].id, 'B', at);
    expect(await sync.save(divergent)).toBeNull();
    expect((await sync.getConflict('draft'))!.conflicts).toHaveLength(1);
    expect(JSON.stringify([...disk.values()])).not.toContain('p4-fixture-token');
    expect(JSON.parse(storage.getItem(attemptKey(owner, 'draft'))!).answers).toEqual(divergent.answers);
  });
  it('repairs projection failures through the immutable completed outbox retry', async () => {
    const { options, draft, auth } = await setup(); let unavailable = true;
    const service = createService({ ...options, repository: { ...options.repository, continuity: async (...args: Parameters<ContinuityRepository['continuity']>) => {
      if (unavailable) throw new Error('database unavailable'); return options.repository.continuity(...args);
    } } });
    const api = createPlatformApi(auth, service, options.now);
    const disk = new Map<string, string>();
    const queue = new AttemptOutbox({ getItem: k => disk.get(k) ?? null, setItem: (k, v) => { disk.set(k, v); }, removeItem: k => { disk.delete(k); } }, draft.learnerId, { push: a => api.submitAttempt(a) });
    await queue.enqueue(submitAttempt(assessment, draft, at));
    expect(await queue.flush()).toEqual({ sent: 0, pending: 1 });
    expect((await api.getAttempt('draft')).attempt.status).toBe('submitted');
    unavailable = false; expect(await queue.flush()).toEqual({ sent: 1, pending: 0 });
    expect((await api.getLearningContinuity()).mastery.evidence.length).toBeGreaterThan(0);
  });
  it('stores qualifying longitudinal tiers and recomputes expired windows after service recreation', async () => {
    const { repository, owner, options, auth } = await setup();
    const original = assessment.questions[0];
    const questions = Array.from({ length: 20 }, (_, i) => ({ ...original, id: `p4-q${i}`, familyId: `p4-family${i}` }));
    const blueprint = { ...assessment.blueprint, id: 'p4-volume', mode: 'diagnostic' as const, totalItems: 20, domainQuotas: [{ domainId: original.domainId, count: 20 }] };
    const registry = { taxonomy: local.registry.taxonomy, questions };
    const qualifyingCatalog = { ...catalog, registry, blueprints: [blueprint] };
    const compiled = resolveBlueprint(blueprint, registry, { allowDraftPreview: true });
    let attempt = initializeAttempt(compiled, 'qualifying', owner, at);
    for (const [index, question] of compiled.questions.entries()) {
      const option = index < 15 ? question.correctOptionId : question.options.find(o => o.id !== question.correctOptionId)!.id;
      attempt = recordAnswer(compiled, attempt, question.id, option, at);
    }
    const service = createService({ ...options, catalog: qualifyingCatalog });
    const api = createPlatformApi(auth, service, options.now);
    await api.submitAttempt(submitAttempt(compiled, attempt, at));
    const continuity = await api.getLearningContinuity();
    expect(continuity.mastery.evidence[0]).toMatchObject({ correct: 15, total: 20, tier: 'mastered' });
    expect(continuity.mastery.domains[0].tier).toBe('mastered');
    const saved = await repository.continuity(owner, () => continuity);
    expect(saved).toEqual(continuity);
    const future = Date.parse(at) + 31 * 86_400_000;
    const restarted = createService({ ...options, repository: await factory(), catalog: qualifyingCatalog, now: () => future,
      verifier: { verify: async () => ({ ...await auth.getSession(), expiresAt: new Date(future + 60_000).toISOString() }) } });
    const response = await restarted.send({ method: 'GET', path: '/v1/learning-continuity', headers: { Authorization: 'Bearer fixture' } });
    expect(response.status).toBe(200); expect(response.body).toMatchObject({ mastery: { evidence: [], domains: [] } });
  });
}
