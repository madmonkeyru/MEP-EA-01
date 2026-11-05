import { describe, it, expect } from 'vitest';
import type { AttemptEvent } from '../domain/types';
import { qualifyAttemptObservation } from '../domain/qualifyingObservation';
import {
  computeEvidenceMasteryRecords,
  computeCognitivePerformance,
  computeDifficultyPerformance,
  computeReadinessOverview,
} from '../domain/masteryEngine';
import { BXM_OFFICIAL_EVIDENCES_FIXTURE } from '../ui/evidenceCatalogFixture';

describe('BXM Progress - Domain & Measurement Policy', () => {
  const refDate = new Date('2026-03-15T12:00:00Z');

  function makeEvent(overrides: Partial<AttemptEvent> = {}): AttemptEvent {
    return {
      schemaVersion: '1.0.0',
      eventId: `ev-${Math.random().toString(36).substring(2, 9)}`,
      sessionId: 'sess-1',
      sessionKind: 'practice_evidence',
      mode: 'study',
      timestamp: '2026-03-14T10:00:00Z',
      itemId: 'item-1',
      familyId: 'family-1',
      primaryEvidenceKey: 'bxm/matematica/02-2026/geometry/A1.1',
      domain: 'geometry',
      provenance: 'authored_mastery',
      reviewStatus: 'computationally_checked',
      cognitiveLevel: 'reproduccion',
      difficulty: 1,
      selectedOption: 'A',
      correctAnswer: 'A',
      isCorrect: true,
      responseIndex: 0,
      hintsUsedBeforeResponse: 0,
      ...overrides,
    };
  }

  describe('qualifyAttemptObservation', () => {
    it('accepts unassisted first responses within window', () => {
      const ev = makeEvent();
      const res = qualifyAttemptObservation(ev, refDate);
      expect(res.eligible).toBe(true);
    });

    it('rejects retries (responseIndex > 0)', () => {
      const ev = makeEvent({ responseIndex: 1 });
      const res = qualifyAttemptObservation(ev, refDate);
      expect(res.eligible).toBe(false);
      expect(res.reason).toBe('retry_after_first');
    });

    it('rejects responses where hints were used before answering', () => {
      const ev = makeEvent({ hintsUsedBeforeResponse: 1 });
      const res = qualifyAttemptObservation(ev, refDate);
      expect(res.eligible).toBe(false);
      expect(res.reason).toBe('hint_used');
    });

    it('rejects official benchmark items from authored mastery', () => {
      const ev = makeEvent({ provenance: 'official_reference' });
      const res = qualifyAttemptObservation(ev, refDate);
      expect(res.eligible).toBe(false);
      expect(res.reason).toBe('benchmark_item');
    });

    it('rejects legacy unknown records with missing eligibility metadata', () => {
      const ev = makeEvent({ provenance: 'legacy_unknown' });
      const res = qualifyAttemptObservation(ev, refDate);
      expect(res.eligible).toBe(false);
      expect(res.reason).toBe('legacy_unknown');
    });

    it('rejects events outside the 30-day window', () => {
      const oldEvent = makeEvent({ timestamp: '2026-01-01T00:00:00Z' });
      const res = qualifyAttemptObservation(oldEvent, refDate, 30);
      expect(res.eligible).toBe(false);
      expect(res.reason).toBe('window_expired');
    });
  });

  describe('Mastery thresholds and Template Family Collapsing', () => {
    it('collapses multiple attempts from the same template family to the most recent observation', () => {
      const ev1 = makeEvent({
        familyId: 'fam-circ-1',
        timestamp: '2026-03-10T10:00:00Z',
        isCorrect: false,
      });
      const ev2 = makeEvent({
        familyId: 'fam-circ-1',
        timestamp: '2026-03-12T10:00:00Z',
        isCorrect: true, // more recent
      });

      const records = computeEvidenceMasteryRecords(BXM_OFFICIAL_EVIDENCES_FIXTURE, [ev1, ev2], refDate);
      const a11 = records.find((r) => r.rawCode === 'A1.1')!;

      expect(a11.qualifyingFamiliesCount).toBe(1);
      expect(a11.correctCount).toBe(1); // the most recent one was correct
      expect(a11.status).toBe('insufficient_data'); // 1 < 5 min required
      expect(a11.sampleSizeLabel).toContain('1/5 familias para calibrar');
    });

    it('classifies as insufficient_data when fewer than 5 qualifying families are observed', () => {
      const events: AttemptEvent[] = [];
      for (let i = 1; i <= 4; i++) {
        events.push(makeEvent({ familyId: `fam-${i}`, isCorrect: true }));
      }

      const records = computeEvidenceMasteryRecords(BXM_OFFICIAL_EVIDENCES_FIXTURE, events, refDate);
      const a11 = records.find((r) => r.rawCode === 'A1.1')!;

      expect(a11.qualifyingFamiliesCount).toBe(4);
      expect(a11.status).toBe('insufficient_data');
    });

    it('classifies as mastered when >= 5 families and accuracy >= 75%', () => {
      const events: AttemptEvent[] = [];
      // 4 correct out of 5 = 80% >= 75%
      for (let i = 1; i <= 5; i++) {
        events.push(makeEvent({ familyId: `fam-${i}`, isCorrect: i <= 4 }));
      }

      const records = computeEvidenceMasteryRecords(BXM_OFFICIAL_EVIDENCES_FIXTURE, events, refDate);
      const a11 = records.find((r) => r.rawCode === 'A1.1')!;

      expect(a11.qualifyingFamiliesCount).toBe(5);
      expect(a11.accuracyPercentage).toBe(80);
      expect(a11.status).toBe('mastered');
      expect(a11.statusLabelEs).toBe('Dominado');
    });

    it('classifies as in_progress when >= 5 families and 60% <= accuracy < 75%', () => {
      const events: AttemptEvent[] = [];
      // 3 correct out of 5 = 60%
      for (let i = 1; i <= 5; i++) {
        events.push(makeEvent({ familyId: `fam-${i}`, isCorrect: i <= 3 }));
      }

      const records = computeEvidenceMasteryRecords(BXM_OFFICIAL_EVIDENCES_FIXTURE, events, refDate);
      const a11 = records.find((r) => r.rawCode === 'A1.1')!;

      expect(a11.accuracyPercentage).toBe(60);
      expect(a11.status).toBe('in_progress');
      expect(a11.statusLabelEs).toBe('En progreso');
    });

    it('classifies as needs_reinforcement when >= 5 families and accuracy < 60%', () => {
      const events: AttemptEvent[] = [];
      // 2 correct out of 5 = 40% < 60%
      for (let i = 1; i <= 5; i++) {
        events.push(makeEvent({ familyId: `fam-${i}`, isCorrect: i <= 2 }));
      }

      const records = computeEvidenceMasteryRecords(BXM_OFFICIAL_EVIDENCES_FIXTURE, events, refDate);
      const a11 = records.find((r) => r.rawCode === 'A1.1')!;

      expect(a11.accuracyPercentage).toBe(40);
      expect(a11.status).toBe('needs_reinforcement');
      expect(a11.statusLabelEs).toBe('Requiere refuerzo');
    });
  });

  describe('Progression policy recommendations', () => {
    it('recommends tier 2 after 5 qualifying tier 1 families with >= 75% accuracy', () => {
      const events: AttemptEvent[] = [];
      for (let i = 1; i <= 5; i++) {
        events.push(makeEvent({ familyId: `fam-${i}`, difficulty: 1, isCorrect: true }));
      }

      const records = computeEvidenceMasteryRecords(BXM_OFFICIAL_EVIDENCES_FIXTURE, events, refDate);
      const a11 = records.find((r) => r.rawCode === 'A1.1')!;

      expect(a11.recommendedDifficultyTier).toBe(2);
    });
  });

  describe('Cognitive & Difficulty Breakdowns', () => {
    it('computes exact cognitive level breakdown with sample counts', () => {
      const events = [
        makeEvent({ cognitiveLevel: 'reproduccion', isCorrect: true }),
        makeEvent({ cognitiveLevel: 'reproduccion', isCorrect: false }),
        makeEvent({ cognitiveLevel: 'conexion', isCorrect: true }),
        makeEvent({ cognitiveLevel: 'reflexion', isCorrect: false }),
      ];

      const summary = computeCognitivePerformance(events, refDate);
      const rep = summary.find((c) => c.cognitiveLevel === 'reproduccion')!;
      const con = summary.find((c) => c.cognitiveLevel === 'conexion')!;
      const ref = summary.find((c) => c.cognitiveLevel === 'reflexion')!;

      expect(rep.totalCount).toBe(2);
      expect(rep.correctCount).toBe(1);
      expect(rep.accuracyPercentage).toBe(50);

      expect(con.totalCount).toBe(1);
      expect(con.accuracyPercentage).toBe(100);

      expect(ref.totalCount).toBe(1);
      expect(ref.accuracyPercentage).toBe(0);
    });

    it('computes exact difficulty tier breakdown', () => {
      const events = [
        makeEvent({ difficulty: 1, isCorrect: true }),
        makeEvent({ difficulty: 2, isCorrect: true }),
        makeEvent({ difficulty: 2, isCorrect: false }),
      ];

      const diffSummary = computeDifficultyPerformance(events, refDate);
      const tier1 = diffSummary.find((d) => d.difficulty === 1)!;
      const tier2 = diffSummary.find((d) => d.difficulty === 2)!;

      expect(tier1.totalCount).toBe(1);
      expect(tier1.accuracyPercentage).toBe(100);

      expect(tier2.totalCount).toBe(2);
      expect(tier2.accuracyPercentage).toBe(50);
    });
  });

  describe('Readiness Overview & Disclaimer', () => {
    it('provides transparent counts and mandatory MEP disclaimer text', () => {
      const events = [makeEvent({ isCorrect: true })];
      const records = computeEvidenceMasteryRecords(BXM_OFFICIAL_EVIDENCES_FIXTURE, events, refDate);
      const overview = computeReadinessOverview(records, events, refDate);

      expect(overview.totalSpecEvidences).toBe(71);
      expect(overview.disclaimerEs).toContain(
        'Indicador formativo interno de avance; no constituye una predicción ni garantía del resultado oficial ante el MEP.'
      );
    });
  });
});
