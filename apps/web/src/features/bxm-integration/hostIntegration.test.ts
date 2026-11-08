import { describe, expect, it } from 'vitest';
import { SessionRunner } from '../bxm-assessment/sessionRunner';
import { BxmLearningStore, learningKey } from './learningStore';
import { authoredPool, policyFor, preparePresentation, selectActivity } from './providers';
import { createMemoryStorageAdapter, PROGRESS_EVENTS_KEY } from '../bxm-progress/storage/progressStorage';
import { generateSevenDayReport, calculateActivityStreak } from '../bxm-progress/analytics/analyticsEngine';
import { readRoute, routeHash } from '../../services/navigation';

describe('BXM production host contracts', () => {
  it('round-trips learning routes, evidence keys, saved sessions and subject aliases', () => {
    const route = { view: 'learning' as const, programId: 'bxm', subjectId: 'matematicas', convocatoriaId: '2026-c2', tab: 'assessment', sessionId: 'saved-one', evidenceKey: authoredPool[0].evidenceId };
    expect(readRoute(routeHash(route))).toMatchObject(route);
    expect(readRoute('#/programas/bxm/matematica?pantalla=aprendizaje').view).toBe('learning');
    expect(readRoute('#/programas/edad/matematicas?pantalla=aprendizaje').view).toBe('hub');
    expect(readRoute('#/programas/bxm/matematicas?convocatoria=2026-c1&pantalla=aprendizaje').view).toBe('hub');
  });
  it('resumes exam drafts with the same deadline, flags and shuffled option mapping', () => {
    let time = Date.parse('2026-11-05T15:00:00Z');
    const items = preparePresentation(authoredPool.slice(0, 3), 99, []);
    const runner = new SessionRunner({ sessionId: 'saved-exam', items, policy: policyFor('diagnostic'), clock: { now: () => time } });
    runner.selectDraftOption('C'); runner.toggleReviewFlag(); runner.setCurrentIndex(1);
    const snapshot = JSON.parse(JSON.stringify(runner.snapshot()));
    time += 10 * 60_000;
    const restored = SessionRunner.restore(snapshot, { now: () => time });
    expect(restored.deadline).toBe(runner.deadline);
    expect(restored.items).toEqual(items);
    expect(restored.getCurrentIndex()).toBe(1);
    expect(restored.getItemState(items[0].id)).toMatchObject({ draftOption: 'C', flaggedForReview: true });
    time += 21 * 60_000;
    expect(restored.checkTimeout()).toBe(true);
    expect(restored.finalizeSession().status).toBe('timed_out');
  });
  it('resumes a study response without losing hints, retries or event identity', () => {
    const runner = new SessionRunner({ sessionId: 'saved-study', items: [{ ...authoredPool[0], hints: ['Una pista'] }], policy: policyFor('evidence_practice') });
    const wrong = runner.items[0].correctAnswer === 'A' ? 'B' : 'A';
    runner.selectDraftOption(wrong); runner.verifyStudyAnswer();
    runner.revealHint(); runner.selectDraftOption(runner.items[0].correctAnswer); runner.verifyStudyAnswer();
    const original = runner.getAllItemStates()[0];
    const restored = SessionRunner.restore(JSON.parse(JSON.stringify(runner.snapshot())));
    expect(restored.getAllItemStates()[0]).toEqual(original);
    restored.selectDraftOption(wrong); restored.verifyStudyAnswer();
    expect(restored.getAllItemStates()[0].retryAttempts.at(-1)?.eventId).toBe('saved-study-evt-3');
    expect(restored.getAllItemStates()[0].firstResponse?.isCorrect).toBe(false);
  });
  it('keeps learner journals isolated and rejects malformed saved records without overwriting', () => {
    const memory = createMemoryStorageAdapter();
    const alice = new BxmLearningStore('alice', memory);
    const runner = new SessionRunner({ items: authoredPool.slice(0, 2), policy: policyFor('diagnostic') });
    expect(alice.saveActive(runner)).toBe(true);
    expect(new BxmLearningStore('bob', memory).getActive()).toBeUndefined();
    expect(new BxmLearningStore('alice', memory).getActive()?.sessionId).toBe(runner.sessionId);
    const broken = createMemoryStorageAdapter({ [learningKey('alice')]: '{invalid' });
    const store = new BxmLearningStore('alice', broken);
    expect(store.saveActive(runner)).toBe(false);
    expect(broken.getItem(learningKey('alice'))).toBe('{invalid');
  });
  it('recovers an interrupted result-to-progress write idempotently', () => {
    const memory = createMemoryStorageAdapter(); let outage = true;
    const adapter = { ...memory, setItem: (key: string, value: string) => {
      if (outage && key.startsWith(PROGRESS_EVENTS_KEY)) throw new Error('quota');
      memory.setItem(key, value);
    } };
    const store = new BxmLearningStore('alice', adapter);
    const runner = new SessionRunner({ items: authoredPool.slice(0, 2), policy: policyFor('diagnostic') });
    runner.selectDraftOption('A');
    const result = runner.finalizeSession();
    expect(store.complete(result)).toBe(false);
    expect(new BxmLearningStore('alice', memory).getResults()).toHaveLength(1);
    outage = false;
    const recovered = new BxmLearningStore('alice', adapter);
    expect(recovered.reconcile()).toBe(true);
    expect(recovered.reconcile()).toBe(true);
    expect(recovered.progress.getEvents()).toHaveLength(1);
    expect(recovered.getCompletions()).toHaveLength(1);
  });
  it('counts an unanswered completion separately from activity streaks', () => {
    const now = new Date('2026-11-05T15:00:00Z');
    const store = new BxmLearningStore('alice', createMemoryStorageAdapter());
    const runner = new SessionRunner({ items: authoredPool.slice(0, 2), policy: policyFor('diagnostic'), clock: { now: () => now.getTime() } });
    store.complete(runner.finalizeSession());
    const completions = store.getCompletions();
    expect(generateSevenDayReport([], now, 'America/Costa_Rica', completions).totalCompletedSessions).toBe(1);
    expect(calculateActivityStreak([], now, 'America/Costa_Rica', completions).currentStreakDays).toBe(0);
    expect(store.progress.getEvents()).toHaveLength(0);
  });
  it('keeps quiz retries as activity rather than five independent mastery observations', () => {
    const now = new Date('2026-11-05T15:00:00Z');
    const store = new BxmLearningStore('alice', createMemoryStorageAdapter());
    for (let i = 0; i < 3; i++) store.recordActivity({ eventId: `quiz-session-evt-${i+1}`, quizId: 'quiz-one', evidenceKey: authoredPool[0].evidenceId,
      responseIndex: i, selectedOption: 'A', isCorrect: true, timestamp: now.toISOString() });
    expect(store.getActivities()).toHaveLength(3);
    expect(store.getCompletions()).toHaveLength(1);
    expect(calculateActivityStreak([], now, 'America/Costa_Rica', store.getCompletions()).currentStreakDays).toBe(1);
    expect(store.progress.getEvents()).toHaveLength(0);
  });
  it('returns inventory shortfalls for acceptance and never mixes in official questions', () => {
    const selection = selectActivity({ kind: 'evidence_practice', evidenceKey: authoredPool[0].evidenceId }, 55);
    expect(selection.isPartial).toBe(true);
    expect(selection.totalSelected).toBeLessThan(selection.totalRequested);
    expect(selection.items.every(i => i.provenance === 'authored')).toBe(true);
  });
});
