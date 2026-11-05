import { describe, it, expect } from 'vitest';
import { SelectionEngine } from '../selectionEngine';
import { sampleAuthoredItems } from '../fixtures/sampleItems';
import type { AssessmentItem } from '../types';

describe('SelectionEngine (Agent B)', () => {
  it('deterministically selects the same items given the same seed and pool', () => {
    const res1 = SelectionEngine.assembleDiagnostic(sampleAuthoredItems, { seed: 12345 });
    const res2 = SelectionEngine.assembleDiagnostic(sampleAuthoredItems, { seed: 12345 });

    expect(res1.items.length).toBe(res2.items.length);
    expect(res1.items.map((i) => i.id)).toEqual(res2.items.map((i) => i.id));
    expect(res1.seed).toBe(12345);
    expect(res1.policyVersion).toBe('bxm-diag-v1.1');
  });

  it('generates different order/selection when seed varies', () => {
    const resA = SelectionEngine.assembleDiagnostic(sampleAuthoredItems, { seed: 111 });
    const resB = SelectionEngine.assembleDiagnostic(sampleAuthoredItems, { seed: 999 });

    expect(resA.items.map((i) => i.id)).not.toEqual(resB.items.map((i) => i.id));
  });

  it('strictly excludes official benchmark items from diagnostic by default', () => {
    const contaminatedPool: AssessmentItem[] = [
      ...sampleAuthoredItems,
      {
        id: 'bench-001',
        code: 'item-geo-001',
        provenance: 'official_benchmark',
        reviewStatus: 'certified',
        domain: 'geometry',
        evidenceCode: 'A1.2',
        evidenceId: 'bxm/matematica/02-2026/geometry/A1.2',
        cognitiveLevel: 'reproduccion',
        difficultyTier: 1,
        stem: 'Official benchmark item stem',
        options: { A: '1', B: '2', C: '3', D: '4' },
        correctAnswer: 'A',
      },
      {
        id: 'past-001',
        code: 'item-alg-001',
        provenance: 'official_past',
        reviewStatus: 'certified',
        domain: 'functions',
        evidenceCode: 'B1.1',
        evidenceId: 'bxm/matematica/02-2026/functions/B1.1',
        cognitiveLevel: 'reproduccion',
        difficultyTier: 1,
        stem: 'Past official item',
        options: { A: '1', B: '2', C: '3', D: '4' },
        correctAnswer: 'A',
      },
    ];

    const result = SelectionEngine.assembleDiagnostic(contaminatedPool, {
      seed: 42,
      excludeBenchmarkItemCodes: ['item-geo-001'],
      allowOfficialFallback: false,
    });

    const selectedCodes = result.items.map((i) => i.code || i.id);
    expect(selectedCodes).not.toContain('item-geo-001');
    expect(selectedCodes).not.toContain('item-alg-001');
  });

  it('detects shortfalls when pool does not have sufficient items for a domain', () => {
    // Only pass geometry items, requesting 8 geo, 8 funcs, 4 stats
    const geoOnlyPool = sampleAuthoredItems.filter((i) => i.domain === 'geometry');

    const result = SelectionEngine.assembleDiagnostic(geoOnlyPool, { seed: 123 });

    expect(result.isPartial).toBe(true);
    expect(result.items.length).toBe(8);
    expect(result.shortfalls).toEqual([
      { domain: 'functions', requested: 8, available: 0, missing: 8 },
      { domain: 'statistics', requested: 4, available: 0, missing: 4 },
    ]);
  });

  it('assembles evidence practice prioritizing unseen items without duplicating', () => {
    const practice = SelectionEngine.assembleEvidencePractice(
      sampleAuthoredItems,
      'bxm/matematica/02-2026/geometry/A1.2',
      2,
      { seed: 777, excludeSeenItemIds: ['auth-geo-001'] }
    );

    expect(practice.length).toBe(2);
    expect(practice[0].id).toBe('auth-geo-002');
    expect(practice.map((p) => p.evidenceCode)).toEqual(['A1.2', 'A1.2']);
  });

  it('assembles mastery check favoring higher difficulty tiers', () => {
    const mastery = SelectionEngine.assembleMasteryCheck(
      sampleAuthoredItems,
      'bxm/matematica/02-2026/geometry/A2.2',
      2
    );

    expect(mastery.length).toBe(2);
    expect(mastery.every((m) => m.difficultyTier >= 2)).toBe(true);
  });
});
