import { describe, expect, it } from 'vitest';
import { createFoundationAssessment } from '@mep-ea/content/preview';
import { AssessmentSession, attemptKey, createLocalAdapter, createMemoryAdapter, initializeAttempt, navigate, recordAnswer, restoreAttempt, scoreAttempt, submitAttempt } from './index';

const assessment = createFoundationAssessment();
const start = '2026-11-08T12:00:00.000Z';
const next = '2026-11-08T12:00:01.000Z';
const initial = () => initializeAttempt(assessment, 'attempt', 'learner', start);
describe('platform-independent assessment lifecycle', () => {
  it('initializes, answers, navigates, persists, resumes and deterministically submits', async () => {
    const persistence = createMemoryAdapter();
    const session = new AssessmentSession(assessment, persistence, 'learner', 'attempt', () => start);
    await session.open();
    await session.answer(assessment.questions[0].id, 'A'); await session.goTo(1);
    const resumed = new AssessmentSession(assessment, persistence, 'learner', 'attempt', () => next);
    expect((await resumed.open()).currentIndex).toBe(1);
    await resumed.answer(assessment.questions[1].id, 'B');
    const result = await resumed.submit();
    expect(result.score).toMatchObject({ correct: 1, total: 3, unanswered: 1 });
    expect(result.score).toEqual(scoreAttempt(assessment, result));
    expect(await resumed.submit()).toEqual(result);
    const final = new AssessmentSession(assessment, persistence, 'learner', 'attempt', () => next);
    expect((await final.open()).score).toEqual(result.score);
    await expect(final.answer(assessment.questions[0].id, 'B')).rejects.toThrow('submitted');
  });
  it('isolates learner keys and validates stored identity', async () => {
    const storage = createMemoryAdapter();
    await storage.save(attemptKey('learner', 'attempt'), initial());
    expect(await storage.load(attemptKey('other', 'attempt'))).toBeNull();
    expect(() => restoreAttempt(assessment, initial(), 'other', 'attempt')).toThrow('identity');
  });
  it('rejects corrupt, stale or impossible persisted state and recomputes submitted scores', () => {
    for (const changes of [{ schemaVersion: 2 }, { currentIndex: -1 }, { assessmentId: 'changed' }, { deadlineAt: next },
      { answers: { missing: { questionId: 'missing', optionId: 'A', answeredAt: next } } }, { score: { correct: 999 } }]) {
      expect(() => restoreAttempt(assessment, { ...initial(), ...changes }, 'learner', 'attempt')).toThrow();
    }
    const submitted = submitAttempt(assessment, initial(), next);
    expect(restoreAttempt(assessment, { ...submitted, score: { correct: 999 } }, 'learner', 'attempt').score?.correct).toBe(0);
  });
  it('rejects invalid answers, navigation, late answers and backwards time', () => {
    expect(() => recordAnswer(assessment, initial(), 'missing', 'A', next)).toThrow();
    expect(() => navigate(assessment, initial(), 3, next)).toThrow();
    expect(() => recordAnswer(assessment, initial(), assessment.questions[0].id, 'A', initial().deadlineAt)).toThrow('time limit');
    expect(() => recordAnswer(assessment, initial(), assessment.questions[0].id, 'A', '2026-11-08T11:00:00Z')).toThrow('backwards');
    expect(submitAttempt(assessment, initial(), initial().deadlineAt).score?.unanswered).toBe(3);
  });
  it('serializes rapid commands and survives a failed write without advancing state', async () => {
    const base = createMemoryAdapter(); let fail = false;
    const session = new AssessmentSession(assessment, { ...base, save: async (key, value) => { if (fail) throw new Error('quota'); await base.save(key, value); } }, 'learner', 'attempt', () => start);
    await session.open(); fail = true;
    await expect(session.answer(assessment.questions[0].id, 'A')).rejects.toThrow('quota');
    expect(session.snapshot?.answers).toEqual({}); fail = false;
    await Promise.all([session.answer(assessment.questions[0].id, 'A'), session.answer(assessment.questions[1].id, 'B'), session.goTo(2)]);
    expect(Object.keys(session.snapshot!.answers)).toHaveLength(2);
    expect(session.snapshot?.currentIndex).toBe(2);
    const snapshot = session.snapshot!; snapshot.currentIndex = 0;
    expect(session.snapshot?.currentIndex).toBe(2);
  });
  it('uses the same JSON storage port with sync Web and async native storage', async () => {
    for (const asyncStorage of [false, true]) {
      const data = new Map<string, string>();
      const adapter = createLocalAdapter({ getItem: key => asyncStorage ? Promise.resolve(data.get(key) ?? null) : data.get(key) ?? null,
        setItem: (key, value) => { data.set(key, value); return asyncStorage ? Promise.resolve() : undefined; }, removeItem: key => { data.delete(key); } });
      const session = new AssessmentSession(assessment, adapter, 'learner', 'attempt', () => start);
      await session.open(); await session.answer(assessment.questions[2].id, 'A');
      expect((await new AssessmentSession(assessment, adapter, 'learner', 'attempt', () => start).open()).answers[assessment.questions[2].id].optionId).toBe('A');
    }
  });
  it('reports corrupt JSON and unavailable local storage', async () => {
    const adapter = createLocalAdapter({ getItem: () => '{broken', setItem() {}, removeItem() {} });
    await expect(new AssessmentSession(assessment, adapter, 'learner', 'attempt').open()).rejects.toThrow();
  });
});
