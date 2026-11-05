import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BxmMicroQuiz } from '../bxm-learning/components/BxmMicroQuiz';
import { BxmIsomorphicGenerator as G } from '../bxm-learning/services/bxmIsomorphicGenerator';
import { SessionRunner } from '../bxm-assessment/sessionRunner';
import { SelectionEngine } from '../bxm-assessment/selectionEngine';
import { sampleAuthoredItems } from '../bxm-assessment/fixtures/sampleItems';
import { toAssessmentItem, toProgressEvents, canonicalMathSubject, shuffleAssessmentOptions } from './contracts';
import { BXM_OFFICIAL_EVIDENCES_FIXTURE as catalog } from '../bxm-progress/ui/evidenceCatalogFixture';
import { BxmProgressStorage, createMemoryStorageAdapter, PROGRESS_EVENTS_KEY } from '../bxm-progress/storage/progressStorage';
import { qualifyAttemptObservation } from '../bxm-progress/domain/qualifyingObservation';
import { computeEvidenceMasteryRecords } from '../bxm-progress/domain/masteryEngine';
import { generateSevenDayReport } from '../bxm-progress/analytics/analyticsEngine';
import spec from '../../../content/programs/bxm/matematica/specs/02-2026.json';
import pack from '../../../content/bxm-mvp-learning/authored-items-pack.json';
import type { BxmAuthoredItem } from '../bxm-learning/types';
import type { AssessmentPolicy } from '../bxm-assessment/types';

const now = new Date('2026-11-05T18:00:00Z');
const policy: AssessmentPolicy = { mode: 'study', kind: 'evidence_practice', enableTimer: false,
  allowHints: true, allowRetries: true, allowImmediateFeedback: true, allowFormulaSheet: true, allowCalculator: true };
const item = () => toAssessmentItem(pack.items[0] as unknown as BxmAuthoredItem);
function answered() {
  const runner = new SessionRunner({ items: [item()], policy, clock: { now: () => now.getTime() } });
  runner.selectDraftOption('B'); runner.verifyStudyAnswer();
  runner.selectDraftOption('A'); runner.verifyStudyAnswer();
  return toProgressEvents(runner.finalizeSession(), 'alice');
}

describe('BXM handoff repair regressions', () => {
  it('derives exactly the canonical evidence keys and descriptions', () => {
    const expected = spec.blocks.flatMap(b => b.affirmations.flatMap(a => a.evidences.map(e => [`bxm/matematica/02-2026/${b.areaId}/${e.code}`, e.desc])));
    expect(catalog.map(e => [e.key, e.description])).toEqual(expected);
    expect(catalog).toHaveLength(71);
    expect(canonicalMathSubject('matematicas')).toBe('matematica');
    expect(() => canonicalMathSubject('other')).toThrow();
  });
  it('preserves an unassisted wrong answer before an exposed correct retry', () => {
    const events = answered();
    expect(events.map(e => e.isCorrect)).toEqual([false, true]);
    expect(events.map(e => e.responseIndex)).toEqual([0, 1]);
    expect(qualifyAttemptObservation(events[0], now).eligible).toBe(true);
    expect(qualifyAttemptObservation(events[1], now).eligible).toBe(false);
  });
  it('rejects missing eligibility metadata rather than treating it as unassisted', () => {
    const event = answered()[0];
    for (const key of ['responseIndex', 'hintsUsedBeforeResponse', 'reviewStatus', 'exposureFlags']) {
      const malformed = { ...event }; delete (malformed as unknown as Record<string, unknown>)[key];
      expect(qualifyAttemptObservation(malformed, now).eligible).toBe(false);
    }
    for (const patch of [{ familyId: 4 }, { exposureFlags: null }, { conceptIds: [4] }]) {
      expect(qualifyAttemptObservation({ ...event, ...patch } as never, now).eligible).toBe(false);
    }
  });
  it('partitions profiles, deduplicates replay, and preserves malformed stored objects', () => {
    const memory = createMemoryStorageAdapter({ [PROGRESS_EVENTS_KEY]: JSON.stringify([{ bad: true }]) });
    const alice = new BxmProgressStorage(memory, { userId: 'alice' });
    const bob = new BxmProgressStorage(memory, { userId: 'bob' });
    const events = answered();
    expect(alice.recordEvents(events)).toBe(true);
    expect(alice.recordEvents(events)).toBe(true);
    expect(alice.getEvents()).toHaveLength(2);
    expect(bob.getEvents()).toHaveLength(0);
    expect(bob.recordEvents(events)).toBe(false);
    const guest = new BxmProgressStorage(memory);
    expect(guest.getEvents()).toHaveLength(0);
    expect(guest.recordEvents([])).toBe(true);
    expect(JSON.parse(memory.getItem(PROGRESS_EVENTS_KEY)!)).toEqual([{ bad: true }]);
  });
  it('reports storage failure and never overwrites unreadable data', () => {
    const memory = createMemoryStorageAdapter({ [PROGRESS_EVENTS_KEY]: '{broken' });
    const storage = new BxmProgressStorage(memory);
    expect(storage.recordEvents([])).toBe(false);
    expect(memory.getItem(PROGRESS_EVENTS_KEY)).toBe('{broken');
    const unavailable = new BxmProgressStorage({ ...memory, setItem: () => { throw new Error('quota'); } }, { userId: 'alice' });
    expect(unavailable.recordEvents(answered())).toBe(false);
    expect(unavailable.lastError).not.toBe('');
  });
  it('enforces retry limits and suppresses disabled study feedback', () => {
    const runner = new SessionRunner({ items: [item()], policy: { ...policy, allowRetries: false, allowImmediateFeedback: false } });
    runner.selectDraftOption('B'); expect(runner.verifyStudyAnswer()).toBeNull();
    runner.selectDraftOption('A'); expect(runner.verifyStudyAnswer()).toBeNull();
    const attempt = Object.values(runner.finalizeSession().attempts)[0];
    expect(attempt.firstResponse?.isCorrect).toBe(false); expect(attempt.retries).toHaveLength(0);
  });
  it('finalizes at the deadline even on direct submit, retaining a stable result snapshot', () => {
    let time = now.getTime();
    const runner = new SessionRunner({ items: [item()], policy: { ...policy, mode: 'exam', enableTimer: true, timeLimitMinutes: 1 }, clock: { now: () => time } });
    runner.selectDraftOption('A'); time += 60001;
    const first = runner.finalizeSession();
    expect(first.status).toBe('timed_out');
    first.itemSnapshots[0].correctAnswer = 'B';
    expect(runner.finalizeSession().itemSnapshots[0].correctAnswer).toBe('A');
    expect(runner.finalizeSession().firstResponseCorrectCount).toBe(1);
  });
  it('excludes unreviewed/protected items and rejects inconsistent diagnostic totals', () => {
    expect(SelectionEngine.filterPool([{ ...item(), reviewStatus: 'unreviewed' }]).eligiblePool).toHaveLength(0);
    expect(SelectionEngine.filterPool([{ ...item(), code: 'item-geo-001' }]).eligiblePool).toHaveLength(0);
    expect(() => SelectionEngine.assembleDiagnostic(sampleAuthoredItems, { totalItems: 2 })).toThrow();
    const selected = SelectionEngine.assembleDiagnostic(sampleAuthoredItems, { seed: 45 });
    expect(selected.items).toHaveLength(20);
    expect(SelectionEngine.assembleDiagnostic([...sampleAuthoredItems].reverse(), { seed: 45 }).items.map(i => i.id)).toEqual(selected.items.map(i => i.id));
  });
  it('preserves correctness and distractor association under option permutations', () => {
    const original = item();
    for (let seed = 0; seed < 20; seed++) {
      const shuffled = shuffleAssessmentOptions(original, seed);
      expect((shuffled.options as Record<string, string>)[shuffled.correctAnswer]).toBe((original.options as Record<string, string>)[original.correctAnswer]);
    }
  });
  it('rejects degenerate generator inputs and assigns identity to parameters', () => {
    expect(() => G.generateCircleCanonicalItem({ h: 0, k: 0, r: 1 })).toThrow();
    expect(() => G.generateLinearEquationItem({ m: 0, x1: 0, y1: 2 })).toThrow();
    expect(() => G.generateRicBoxItem({ q1: 0, q3: 10 })).toThrow();
    expect(G.generateCircleCanonicalItem({ h: 2, k: 3, r: 4 }).id).not.toBe(G.generateCircleCanonicalItem({ h: 5, k: 6, r: 7 }).id);
  });
  it('keeps all generated choices distinct across the declared parameter grids', () => {
    for (let h = -8; h <= 8; h++) for (let k = -8; k <= 8; k++) for (let r = 2; r <= 12; r++) {
      if (h && k) expect(new Set(Object.values(G.generateCircleCanonicalItem({ h, k, r }).options)).size).toBe(4);
    }
    for (let m = -5; m <= 5; m++) for (let x1 = -4; x1 <= 4; x1++) for (let y1 = -6; y1 <= 6; y1++) {
      if (m) expect(new Set(Object.values(G.generateLinearEquationItem({ m, x1, y1 }).options)).size).toBe(4);
    }
    for (let q1 = 20; q1 <= 60; q1 += 5) for (let ric = 15; ric <= 45; ric += 5) {
      const generated = G.generateRicBoxItem({ q1, q3: q1 + ric });
      expect(generated.options[generated.correctOption]).toBe(`$${ric}$`);
      expect(new Set(Object.values(generated.options)).size).toBe(4);
    }
    for (let tripletIndex = 0; tripletIndex < 5; tripletIndex++) {
      const generated = G.generateSphereCrossSectionItem({ tripletIndex });
      const { R, d, r } = generated.generatedParams!;
      expect(Number(r) ** 2 + Number(d) ** 2).toBe(Number(R) ** 2);
    }
  });
  it('requires five independent families and preserves lower-tier progress when a family advances', () => {
    const base = answered()[0];
    const lower = Array.from({ length: 5 }, (_, i) => ({ ...base, eventId: `low-${i}`, familyId: `family-${i}`, isCorrect: true, selectedOption: 'A' }));
    const higher = lower.map(e => ({ ...e, eventId: e.eventId + '-advanced', difficulty: 2 as const, timestamp: '2026-11-05T17:00:00Z' }));
    const summary = computeEvidenceMasteryRecords(catalog, [...lower, ...higher], now).find(e => e.evidenceKey === base.primaryEvidenceKey)!;
    expect(summary.qualifyingFamiliesCount).toBe(5);
    expect(summary.recommendedDifficultyTier).toBe(3);
  });
  it('counts completion metadata rather than every session with a response', () => {
    const events = answered();
    const open = { ...events[0], sessionId: 'open', eventId: 'open-response', sessionStatus: undefined, sessionCompletedAt: undefined };
    expect(generateSevenDayReport([...events, open], now).totalCompletedSessions).toBe(1);
    expect(generateSevenDayReport([...events, open], now).firstResponseCount).toBe(2);
  });
  it('uses assessment-owned retries in lesson checks and renders mathematical notation', () => {
    const responses: Array<{ responseIndex: number }> = [];
    render(<BxmMicroQuiz evidenceKey={catalog[0].key} quiz={{ id: 'repair-check', question: '$2+2$', options: { A: '$4$', B: '$5$', C: '$6$', D: '$7$' }, correctOption: 'A', explanation: '$2+2=4$' }} onAnswered={e => responses.push(e)} />);
    expect(document.querySelector('.katex')).not.toBeNull();
    fireEvent.click(screen.getAllByRole('button')[0]); fireEvent.click(screen.getByText('Comprobar respuesta'));
    fireEvent.click(screen.getByText('Reintentar pregunta'));
    fireEvent.click(screen.getAllByRole('button')[0]); fireEvent.click(screen.getByText('Comprobar respuesta'));
    expect(responses.map(e => e.responseIndex)).toEqual([0, 1]);
  });
});
