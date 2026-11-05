import { describe, it, expect } from 'vitest';
import type { EvidenceMasteryRecord } from '../domain/masteryEngine';
import {
  generatePersonalPracticeQueue,
  generateStructuredStudyPlan,
  evaluateRetestRecommendation,
} from '../recommendations/recommendationsEngine';
import { BXM_OFFICIAL_EVIDENCES_FIXTURE } from '../ui/evidenceCatalogFixture';

describe('BXM Progress - Recommendations & Personal Queue', () => {
  function makeMasteryRecord(overrides: Partial<EvidenceMasteryRecord> = {}): EvidenceMasteryRecord {
    return {
      evidenceKey: 'bxm/matematica/02-2026/geometry/A1.1',
      domain: 'geometry',
      rawCode: 'A1.1',
      qualifyingFamiliesCount: 5,
      minRequiredFamilies: 5,
      correctCount: 4,
      totalQualifyingCount: 5,
      accuracyExactRatio: 0.8,
      accuracyPercentage: 80,
      status: 'mastered',
      statusLabelEs: 'Dominado',
      sampleSizeLabel: '5 familias evaluadas',
      recommendedDifficultyTier: 1,
      observedDifficulties: {
        1: { correct: 4, total: 5 },
        2: { correct: 0, total: 0 },
        3: { correct: 0, total: 0 },
      },
      ...overrides,
    };
  }

  describe('generatePersonalPracticeQueue', () => {
    it('prioritizes insufficient data calibration before weaknesses', () => {
      const recNeedsCalibration = makeMasteryRecord({
        evidenceKey: 'bxm/matematica/02-2026/geometry/A1.2',
        rawCode: 'A1.2',
        status: 'insufficient_data',
        qualifyingFamiliesCount: 1,
        accuracyExactRatio: 0.0,
      });

      const recWeak = makeMasteryRecord({
        evidenceKey: 'bxm/matematica/02-2026/geometry/A1.1',
        rawCode: 'A1.1',
        status: 'needs_reinforcement',
        qualifyingFamiliesCount: 5,
        correctCount: 1,
        totalQualifyingCount: 5,
        accuracyExactRatio: 0.2,
        accuracyPercentage: 20,
      });

      const queue = generatePersonalPracticeQueue(
        [recWeak, recNeedsCalibration],
        BXM_OFFICIAL_EVIDENCES_FIXTURE
      );

      expect(queue.length).toBeGreaterThan(0);
      // Calibration candidate has priorityScore in 1000s, weakness in 2000s
      expect(queue[0].evidenceKey).toBe(recNeedsCalibration.evidenceKey);
      expect(queue[0].reason).toBe('calibration_needed');
    });

    it('prioritizes lowest accuracy among sufficiently measured weak records', () => {
      const recWeak1 = makeMasteryRecord({
        evidenceKey: 'bxm/matematica/02-2026/geometry/A1.1',
        rawCode: 'A1.1',
        status: 'needs_reinforcement',
        accuracyExactRatio: 0.4,
        accuracyPercentage: 40,
      });

      const recWeak2 = makeMasteryRecord({
        evidenceKey: 'bxm/matematica/02-2026/geometry/A1.2',
        rawCode: 'A1.2',
        status: 'needs_reinforcement',
        accuracyExactRatio: 0.2, // lower accuracy = higher urgency
        accuracyPercentage: 20,
      });

      const queue = generatePersonalPracticeQueue(
        [recWeak1, recWeak2],
        BXM_OFFICIAL_EVIDENCES_FIXTURE
      );

      expect(queue[0].evidenceKey).toBe(recWeak2.evidenceKey);
    });

    it('breaks ties deterministically with stable evidence keys', () => {
      const rec1 = makeMasteryRecord({
        evidenceKey: 'bxm/matematica/02-2026/geometry/A1.2',
        rawCode: 'A1.2',
        status: 'needs_reinforcement',
        accuracyExactRatio: 0.5,
      });
      const rec2 = makeMasteryRecord({
        evidenceKey: 'bxm/matematica/02-2026/geometry/A1.1',
        rawCode: 'A1.1',
        status: 'needs_reinforcement',
        accuracyExactRatio: 0.5,
      });

      const queue = generatePersonalPracticeQueue([rec1, rec2], BXM_OFFICIAL_EVIDENCES_FIXTURE);

      // A1.1 precedes A1.2 alphabetically when scores tie
      expect(queue[0].evidenceKey).toBe(rec2.evidenceKey);
    });
  });

  describe('generateStructuredStudyPlan', () => {
    it('creates ordered steps focusing on critical weaknesses first', () => {
      const recWeak = makeMasteryRecord({
        evidenceKey: 'bxm/matematica/02-2026/geometry/A1.1',
        rawCode: 'A1.1',
        status: 'needs_reinforcement',
        accuracyPercentage: 30,
      });
      const recInProgress = makeMasteryRecord({
        evidenceKey: 'bxm/matematica/02-2026/geometry/A1.2',
        rawCode: 'A1.2',
        status: 'in_progress',
        accuracyPercentage: 65,
      });

      const plan = generateStructuredStudyPlan([recInProgress, recWeak], BXM_OFFICIAL_EVIDENCES_FIXTURE, { availableLessonKeys: [recWeak.evidenceKey, recInProgress.evidenceKey], availableInventoryByEvidence: { [recWeak.evidenceKey]: { totalItems: 10 }, [recInProgress.evidenceKey]: { totalItems: 10 } } });

      expect(plan.steps.length).toBeGreaterThan(0);
      expect(plan.steps[0].evidenceKey).toBe(recWeak.evidenceKey);
      expect(plan.steps[0].urgency).toBe('high');
      expect(plan.steps[plan.steps.length - 1].recommendedActivity).toBe('retest');
    });
  });

  describe('evaluateRetestRecommendation', () => {
    it('advises more practice when fewer than 10 responses have been completed', () => {
      const rec = makeMasteryRecord({ status: 'needs_reinforcement' });
      const res = evaluateRetestRecommendation([rec], 5);

      expect(res.shouldRetest).toBe(false);
      expect(res.recommendedSessionKind).toBe('practice_evidence');
    });

    it('recommends targeted retest when weak areas exist and responses >= 10', () => {
      const rec = makeMasteryRecord({ status: 'needs_reinforcement' });
      const res = evaluateRetestRecommendation([rec], 15);

      expect(res.shouldRetest).toBe(true);
      expect(res.recommendedSessionKind).toBe('targeted_retest');
      expect(res.targetEvidenceKeys).toContain(rec.evidenceKey);
    });
  });
});
