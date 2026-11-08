import { describe, expect, it } from 'vitest';
import { createJourneyPreviewCatalog } from '@mep-ea/content/preview';
import { LearnerJourney, diagnose, type StringStorage, type JourneyState } from './index';
const catalog = createJourneyPreviewCatalog();
function fixture() {
  const data = new Map<string, string>(); let fail = false; let clock = '2026-11-08T12:00:00.000Z'; let id = 0;
  const storage: StringStorage = { getItem: async k => data.get(k) ?? null,
    setItem: async (k, v) => { if (fail) throw Error('storage unavailable'); data.set(k, v); }, removeItem: async k => { data.delete(k); } };
  const create = () => new LearnerJourney(catalog, storage, 'learner', () => clock, () => `attempt-${++id}`);
  return { data, create, fail: (v: boolean) => { fail = v; }, clock: (v: string) => { clock = v; } };
}
describe('P1 learner vertical slice', () => {
  it('selects canonical content, resumes answers/navigation, diagnoses, remediates and reopens results', async () => {
    const f = fixture(); const journey = f.create(); expect(await journey.resume()).toBeNull();
    const initial = await journey.start(catalog.blueprints[0].id);
    await journey.answer(initial.assessment.questions[0].id, initial.assessment.questions[0].correctOptionId);
    await journey.goTo(1);
    const reopened = f.create(); const resumed = (await reopened.resume())!;
    expect(resumed.attempt.currentIndex).toBe(1); expect(Object.keys(resumed.attempt.answers)).toHaveLength(1);
    const submitted = await reopened.submit(); const result = reopened.result(submitted);
    expect(submitted.attempt.score).toMatchObject({ correct: 1, total: 3, unanswered: 2 });
    expect(submitted.attempt.score?.items.filter(i => !i.correct)).toHaveLength(2);
    expect(result.diagnostic.domains.map(d => d.tier)).toEqual(['strong', 'needs_practice', 'needs_practice']);
    expect(result.plan.activities).toHaveLength(2); expect(result.plan.activities.every(a => a.steps.length > 0)).toBe(true);
    const final = f.create(); expect(final.result((await final.resume())!)).toEqual(result);
    await expect(final.answer(initial.assessment.questions[0].id, 'B')).rejects.toThrow('submitted');
    const retry = await final.start(catalog.blueprints[0].id);
    expect(retry.attempt.id).not.toBe(initial.attempt.id); expect(retry.attempt.answers).toEqual({});
    expect([...f.data.keys()].filter(k => k.includes(':attempts:'))).toHaveLength(2);
  });
  it('produces no weak concepts for a perfect score and rejects a premature diagnosis', async () => {
    const f = fixture(); const journey = f.create(); let state = await journey.start(catalog.blueprints[0].id);
    expect(() => diagnose(state.assessment, state.attempt)).toThrow('submission');
    for (const q of state.assessment.questions) await journey.answer(q.id, q.correctOptionId);
    state = await journey.submit(); expect(journey.result(state).plan).toMatchObject({ conceptIds: [], activities: [], nextStep: 'reassess' });
  });
  it('submits an expired assessment on reopening and rejects further answers', async () => {
    const f = fixture(); const journey = f.create(); const state = await journey.start(catalog.blueprints[0].id);
    f.clock(state.attempt.deadlineAt); const reopened = f.create();
    expect((await reopened.resume())?.attempt.status).toBe('submitted');
    await expect(reopened.answer(state.assessment.questions[0].id, 'A')).rejects.toThrow('submitted');
  });
  it('preserves the last journey when storage fails and reports corrupt pointers', async () => {
    const f = fixture(); const journey = f.create(); const first = await journey.start(catalog.blueprints[0].id);
    f.fail(true); await expect(journey.start(catalog.blueprints[0].id)).rejects.toThrow('storage');
    f.fail(false); expect((await f.create().resume())?.attempt.id).toBe(first.attempt.id);
    const key = [...f.data.keys()].find(k => k.includes(':journey:'))!; f.data.set(key, '{bad');
    await expect(f.create().resume()).rejects.toThrow();
  });
  it('uses identical results through synchronous Web and asynchronous native storage', async () => {
    const results = [];
    for (const asynchronous of [false, true]) {
      const data = new Map<string, string>(); const storage: StringStorage = {
        getItem: k => asynchronous ? Promise.resolve(data.get(k) ?? null) : data.get(k) ?? null,
        setItem: (k, v) => { data.set(k, v); return asynchronous ? Promise.resolve() : undefined; }, removeItem: k => { data.delete(k); },
      };
      const create = () => new LearnerJourney(catalog, storage, 'same', () => '2026-11-08T12:00:00.000Z', () => 'same');
      const journey = create(); await journey.start(catalog.blueprints[0].id); await journey.submit();
      const reopened = create(); results.push(reopened.result(await reopened.resume() as JourneyState));
    }
    expect(results[0]).toEqual(results[1]);
  });
});
