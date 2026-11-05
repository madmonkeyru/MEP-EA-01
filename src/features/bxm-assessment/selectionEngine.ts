import benchmarkAliases from './benchmarkAliases.json';
/**
 * Selection Engine and Blueprint Generator for BXM Mathematics 02-2026
 * Agent B - Exclusive Ownership (`src/features/bxm-assessment/`)
 *
 * Requirements:
 * - Deterministic pseudo-random seed generator (PRNG: Mulberry32).
 * - Stable sorting of items before selection.
 * - Blueprint: Standard 20 items (8 Geo, 8 Functions, 4 Stats).
 * - Soft marginal targets: 8 Reproducción, 8 Conexión, 4 Reflexión; 8 Basic, 8 Intermediate, 4 Advanced.
 * - Pool exclusion: STRICTLY exclude 2026-c2 official benchmark items.
 * - Authored provenance requirement: default pool only accepts authored/generated_isomorph items with proper review.
 * - allowOfficialFallback default = false.
 * - Shortfall reporting: relax soft targets first, report explicit shortfall if domain cannot be filled, do NOT duplicate items or overfill from other domains.
 */

import type {
  AssessmentItem,
  BlueprintSelectionResult,
  ItemSelectionShortfall,
  StandardDomainArea,
  CognitiveLevel,
  DifficultyTier,
} from './types';

export const SELECTION_POLICY_VERSION = 'bxm-diag-v1.1';

/**
 * Deterministic pseudo-random number generator (Mulberry32).
 */
export function createPrng(seed: number): () => number {
  let s = Math.floor(seed) >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Stable sort items by their canonical ID/code string to avoid insertion-order nondeterminism.
 */
export function sortItemsStably(items: AssessmentItem[]): AssessmentItem[] {
  return [...items].sort((a, b) => {
    const keyA = String(a.code || a.id);
    const keyB = String(b.code || b.id);
    return keyA.localeCompare(keyB);
  });
}

export interface DiagnosticBlueprintConfig {
  totalItems?: number; // Default 20
  domainDistribution?: Record<StandardDomainArea, number>; // Default { geometry: 8, functions: 8, statistics: 4 }
  cognitiveTargets?: Record<CognitiveLevel, number>; // Soft targets { reproduccion: 8, conexion: 8, reflexion: 4 }
  difficultyTargets?: Record<DifficultyTier, number>; // Soft targets { 1: 8, 2: 8, 3: 4 }
  seed?: number;
  allowOfficialFallback?: boolean; // Default false
  excludeBenchmarkItemCodes?: string[]; // Codes to strictly exclude (e.g. 2026-c2 benchmark)
  excludeSeenFamilyIds?: string[]; // Avoid repeat families for retests/practice
}

export class SelectionEngine {
  /**
   * Filter and validate candidate item pool:
   * - Exclude benchmark items.
   * - Verify provenance: authored or generated_isomorph by default unless allowOfficialFallback is true.
   */
  public static filterPool(
    pool: AssessmentItem[],
    options: {
      allowOfficialFallback?: boolean;
      excludeBenchmarkItemCodes?: Set<string>;
    } = {}
  ): { eligiblePool: AssessmentItem[]; benchmarkExposed: boolean } {
    const allowFallback = !!options.allowOfficialFallback;
    const benchmarkSet = options.excludeBenchmarkItemCodes || new Set<string>();

    let benchmarkExposed = false;

    const eligible = pool.filter((item) => {
      const code = String(item.code || item.id);
      if (!['computationally_checked', 'expert_reviewed', 'certified'].includes(item.reviewStatus)) return false;
      // Strictly exclude official benchmark
      if (benchmarkSet.has(code) || benchmarkSet.has(String(item.id)) || benchmarkAliases.includes(code) || benchmarkAliases.includes(String(item.id)) || item.provenance === 'official_benchmark') {
        return false;
      }

      if (item.provenance === 'authored' || item.provenance === 'generated_isomorph') {
        return true;
      }

      if (item.provenance === 'official_past') {
        if (allowFallback) {
          benchmarkExposed = true;
          return true;
        }
        return false;
      }

      return false;
    });

    return {
      eligiblePool: sortItemsStably(eligible),
      benchmarkExposed,
    };
  }

  /**
   * Assemble a standard BXM Diagnostic assessment session.
   */
  public static assembleDiagnostic(
    rawPool: AssessmentItem[],
    config: DiagnosticBlueprintConfig = {}
  ): BlueprintSelectionResult {
    const seed = config.seed ?? 123456789;
    const prng = createPrng(seed);

    const targetDomains: Record<StandardDomainArea, number> = config.domainDistribution || {
      geometry: 8,
      functions: 8,
      statistics: 4,
    };

    const targetTotal = config.totalItems ?? (targetDomains.geometry + targetDomains.functions + targetDomains.statistics);

    const benchmarkSet = new Set(config.excludeBenchmarkItemCodes || []);
    const { eligiblePool } = this.filterPool(rawPool, {
      allowOfficialFallback: config.allowOfficialFallback ?? false,
      excludeBenchmarkItemCodes: benchmarkSet,
    });

    const domainTotal = Object.values(targetDomains).reduce((a, b) => a + b, 0);
    if (!Object.values(targetDomains).every(n => Number.isInteger(n) && n >= 0) || targetTotal !== domainTotal) {
      throw new RangeError('Diagnostic total must equal the sum of domain quotas');
    }
    const cognitiveTargets = config.cognitiveTargets ?? { reproduccion: 8, conexion: 8, reflexion: 4 };
    const difficultyTargets = config.difficultyTargets ?? { 1: 8, 2: 8, 3: 4 };
    for (const targets of [cognitiveTargets, difficultyTargets]) {
      if (!Object.values(targets).every(n => Number.isFinite(n) && n >= 0)) throw new RangeError('Invalid marginal targets');
    }
    const selected: AssessmentItem[] = [];
    const remaining = { ...targetDomains };
    const candidates = [...eligiblePool];
    const randomRank = new Map(candidates.map(item => [item, prng()]));
    const usedIds = new Set<string>();
    const usedFamilies = new Set(config.excludeSeenFamilyIds ?? []);
    const cognitiveCounts = { reproduccion: 0, conexion: 0, reflexion: 0 };
    const difficultyCounts = { 1: 0, 2: 0, 3: 0 };
    while (selected.length < targetTotal) {
      const available = candidates.filter(i => remaining[i.domain] > 0 && !usedIds.has(String(i.id)));
      if (available.length === 0) break;
      const rank = (i: AssessmentItem) => {
        const family = i.familyId || `item:${i.id}`;
        // Global marginal deficits, not per-domain quotas. Family diversity is preferred.
        return (usedFamilies.has(family) ? -1000 : 0) +
          Math.max(0, cognitiveTargets[i.cognitiveLevel] - cognitiveCounts[i.cognitiveLevel]) +
          Math.max(0, difficultyTargets[i.difficultyTier] - difficultyCounts[i.difficultyTier]);
      };
      available.sort((a, b) => rank(b) - rank(a) || randomRank.get(a)! - randomRank.get(b)!);
      const item = available[0];
      selected.push(item);
      usedIds.add(String(item.id));
      usedFamilies.add(item.familyId || `item:${item.id}`);
      remaining[item.domain]--;
      cognitiveCounts[item.cognitiveLevel]++;
      difficultyCounts[item.difficultyTier]++;
    }
    const shortfalls: ItemSelectionShortfall[] = (['geometry', 'functions', 'statistics'] as const)
      .filter(domain => remaining[domain] > 0)
      .map(domain => ({ domain, requested: targetDomains[domain], available: targetDomains[domain] - remaining[domain], missing: remaining[domain] }));
    return {
      items: selected, shortfalls, isPartial: shortfalls.length > 0, policyVersion: SELECTION_POLICY_VERSION,
      seed, totalRequested: targetTotal, totalSelected: selected.length,
      benchmarkExposed: selected.some(i => i.provenance === 'official_past'),
    };
  }

  /**
   * Assemble a Targeted Evidence Practice session.
   */
  public static assembleEvidencePractice(
    rawPool: AssessmentItem[],
    evidenceId: string,
    requestedCount: number = 5,
    options: {
      seed?: number;
      difficultyTier?: DifficultyTier;
      excludeSeenItemIds?: Array<string | number>;
    } = {}
  ): AssessmentItem[] {
    if (!Number.isInteger(requestedCount) || requestedCount < 0) throw new RangeError('Invalid practice count');
    const seed = options.seed ?? Date.now();
    const prng = createPrng(seed);

    const { eligiblePool } = this.filterPool(rawPool, { allowOfficialFallback: false });
    const seenSet = new Set(options.excludeSeenItemIds || []);

    let candidates = eligiblePool.filter((item) => item.evidenceId === evidenceId);

    if (options.difficultyTier) {
      candidates = candidates.filter((item) => item.difficultyTier === options.difficultyTier);
    }

    // Shuffle deterministically
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(prng() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }

    // Prioritize unseen
    const unseen = candidates.filter((item) => !seenSet.has(item.id));
    const seen = candidates.filter((item) => seenSet.has(item.id));

    const result = [...unseen, ...seen].slice(0, requestedCount);
    return result;
  }

  /**
   * Assemble a Mastery Check session for a specific evidence or topic.
   * Typically 3-5 challenging questions (Tier 2/3) from distinct families.
   */
  public static assembleMasteryCheck(
    rawPool: AssessmentItem[],
    evidenceId: string,
    count: number = 3,
    options: { seed?: number } = {}
  ): AssessmentItem[] {
    const seed = options.seed ?? 99999;
    const prng = createPrng(seed);

    const { eligiblePool } = this.filterPool(rawPool, { allowOfficialFallback: false });
    const candidates = eligiblePool.filter((item) => item.evidenceId === evidenceId);

    // Prefer difficulty tier 2 or 3 for mastery verification
    const highTier = candidates.filter((i) => i.difficultyTier >= 2);
    const poolToUse = highTier.length >= count ? highTier : candidates;

    // Stable sort & deterministic shuffle
    const shuffled = [...poolToUse];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(prng() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const selected: AssessmentItem[] = [];
    const usedFamilies = new Set<string>();

    for (const item of shuffled) {
      if (selected.length >= count) break;
      if (item.familyId && usedFamilies.has(item.familyId)) continue;
      selected.push(item);
      if (item.familyId) usedFamilies.add(item.familyId);
    }

    // Fallback if distinct families not sufficient
    if (selected.length < count) {
      for (const item of shuffled) {
        if (selected.length >= count) break;
        if (!selected.some((s) => s.id === item.id)) {
          selected.push(item);
        }
      }
    }

    return selected;
  }
}
