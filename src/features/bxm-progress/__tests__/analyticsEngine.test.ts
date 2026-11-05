import { describe, it, expect } from 'vitest';
import type { AttemptEvent } from '../domain/types';
import {
  generateSevenDayReport,
  calculateActivityStreak,
  formatDateInTimeZone,
} from '../analytics/analyticsEngine';

describe('BXM Progress - Analytics, 7-Day Reports & Streaks', () => {
  const refDateUtc = new Date('2026-03-15T15:00:00Z'); // 9:00 AM Costa Rica (UTC-6)
  const timeZone = 'America/Costa_Rica';

  function makeEvent(timestampIso: string, isCorrect = true, itemId = 'item-1'): AttemptEvent {
    return {
      schemaVersion: '1.0.0',
      eventId: `ev-${Math.random().toString(36).substring(2, 9)}`,
      sessionId: 'sess-1',
      sessionKind: 'practice_evidence',
      mode: 'study',
      timestamp: timestampIso,
      itemId,
      primaryEvidenceKey: 'bxm/matematica/02-2026/geometry/A1.1',
      domain: 'geometry',
      provenance: 'authored_mastery',
      cognitiveLevel: 'reproduccion',
      difficulty: 1,
      selectedOption: isCorrect ? 'A' : 'B',
      correctAnswer: 'A',
      isCorrect,
      sessionStatus: 'completed', sessionCompletedAt: timestampIso,
      responseIndex: 0,
      hintsUsedBeforeResponse: 0,
    };
  }

  describe('Timezone formatting', () => {
    it('accurately converts UTC to Costa Rica date boundaries', () => {
      // 2026-03-15T03:00:00Z is 2026-03-14 21:00 in Costa Rica (UTC-6)
      const d = new Date('2026-03-15T03:00:00Z');
      expect(formatDateInTimeZone(d, timeZone)).toBe('2026-03-14');
    });
  });

  describe('generateSevenDayReport', () => {
    it('correctly aggregates events into 7 calendar days', () => {
      const evToday = makeEvent('2026-03-15T14:00:00Z', true, 'item-1');
      const evYesterday = makeEvent('2026-03-14T14:00:00Z', false, 'item-2');
      const evOld = makeEvent('2026-02-01T14:00:00Z', true, 'item-3');

      const report = generateSevenDayReport([evToday, evYesterday, evOld], refDateUtc, timeZone);

      expect(report.days.length).toBe(7);
      expect(report.windowEndDateIso).toBe('2026-03-15');
      expect(report.windowStartDateIso).toBe('2026-03-09');
      expect(report.totalResponseEvents).toBe(2);
      expect(report.totalUniqueQuestions).toBe(2);
      expect(report.overallAccuracyPercentage).toBe(50); // 1 of 2
    });

    it('calculates percentage point comparison with prior week when prior events exist', () => {
      // Current week: 1 event, correct (100%)
      const evCurrent = makeEvent('2026-03-15T14:00:00Z', true);
      // Prior week (2026-03-05): 2 events, 1 correct (50%)
      const evPrior1 = makeEvent('2026-03-05T14:00:00Z', true);
      const evPrior2 = makeEvent('2026-03-05T15:00:00Z', false);

      const report = generateSevenDayReport([evCurrent, evPrior1, evPrior2], refDateUtc, timeZone);

      expect(report.comparisonWithPriorWeek).toBeDefined();
      expect(report.comparisonWithPriorWeek?.priorAccuracyPercentage).toBe(50);
      expect(report.comparisonWithPriorWeek?.accuracyDeltaPercentagePoints).toBe(50); // +50 pts
    });
  });

  describe('calculateActivityStreak', () => {
    it('returns streak of 1 if active today only', () => {
      const ev = makeEvent('2026-03-15T14:00:00Z');
      const streak = calculateActivityStreak([ev], refDateUtc, timeZone);

      expect(streak.currentStreakDays).toBe(1);
      expect(streak.isActiveToday).toBe(true);
    });

    it('preserves yesterday streak if not yet active today', () => {
      const evYesterday = makeEvent('2026-03-14T14:00:00Z');
      const streak = calculateActivityStreak([evYesterday], refDateUtc, timeZone);

      expect(streak.currentStreakDays).toBe(1);
      expect(streak.isActiveToday).toBe(false);
    });

    it('calculates multi-day consecutive streak', () => {
      const events = [
        makeEvent('2026-03-15T14:00:00Z'),
        makeEvent('2026-03-14T14:00:00Z'),
        makeEvent('2026-03-13T14:00:00Z'),
      ];

      const streak = calculateActivityStreak(events, refDateUtc, timeZone);
      expect(streak.currentStreakDays).toBe(3);
      expect(streak.longestStreakDays).toBe(3);
    });

    it('resets streak to 0 if inactive today and yesterday', () => {
      const evOld = makeEvent('2026-03-10T14:00:00Z');
      const streak = calculateActivityStreak([evOld], refDateUtc, timeZone);

      expect(streak.currentStreakDays).toBe(0);
      expect(streak.longestStreakDays).toBe(1);
    });
  });
});
