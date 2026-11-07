import { BxmContentService } from '../bxm-learning/services/bxmContentService';
import { BxmIsomorphicGenerator as G } from '../bxm-learning/services/bxmIsomorphicGenerator';
import { createPrng, SelectionEngine } from '../bxm-assessment/selectionEngine';
import type { AssessmentItem, AssessmentPolicy, BlueprintSelectionResult, DifficultyTier, SessionKind } from '../bxm-assessment/types';
import { shuffleAssessmentOptions, toAssessmentItem } from './contracts';

export const authoredPool = BxmContentService.getAuthoredItems().map(toAssessmentItem);
export const lessons = BxmContentService.getAllLessons();
export const sampleLessonKeys = new Set(['geometry','functions','statistics'].map(domain => lessons.find(l => l.domain === domain)!.evidenceKey));
export const inventory = Object.fromEntries([...new Set(authoredPool.map(i => i.evidenceId))].map(key => {
  const items = authoredPool.filter(i => i.evidenceId === key);
  return [key, { totalItems: items.length, tiers: [...new Set(items.map(i => i.difficultyTier))] }];
}));
export function policyFor(kind: SessionKind): AssessmentPolicy {
  const exam = ['diagnostic','mock_exam','mastery_check','retest'].includes(kind);
  return { mode: exam ? 'exam' : 'study', kind, enableTimer: exam, timeLimitMinutes: kind === 'mastery_check' ? 10 : 30,
    allowHints: !exam, allowRetries: !exam, allowImmediateFeedback: !exam, allowFormulaSheet: !exam, allowCalculator: true, maxRetriesPerItem: 3 };
}
export interface ActivityRequest { kind: SessionKind; evidenceKey?: string; difficulty?: DifficultyTier; generated?: boolean; itemCount?: number; sourceSessionId?: string; rootSessionId?: string }
export function selectActivity(request: ActivityRequest, seed: number, seenItemIds: string[] = [], seenFamilyIds: string[] = []): BlueprintSelectionResult {
  if (request.kind === 'diagnostic' || request.kind === 'mock_exam') return SelectionEngine.assembleDiagnostic(authoredPool, { seed, excludeSeenFamilyIds: seenFamilyIds });
  const count = request.kind === 'evidence_practice' || request.kind === 'topic_practice' ? request.itemCount ?? 5 : 5;
  if (!Number.isInteger(count) || count < 1 || count > 100) throw new RangeError('Practice count must be an integer from 1 to 100');
  const pool = request.generated ? generateVariants(request.evidenceKey!, seed) : authoredPool;
  const items = request.kind === 'mastery_check'
    ? SelectionEngine.assembleMasteryCheck(pool, request.evidenceKey!, count, { seed })
    : SelectionEngine.assembleEvidencePractice(pool, request.evidenceKey!, count, { seed, difficultyTier: request.difficulty, excludeSeenItemIds: seenItemIds });
  const missing = count - items.length;
  const domain = pool.find(i => i.evidenceId === request.evidenceKey)?.domain;
  return { items, isPartial: missing > 0, shortfalls: missing && domain ? [{ domain, requested: count, available: items.length, missing }] : [],
    totalRequested: count, totalSelected: items.length, seed, policyVersion: 'bxm-learning-v1', benchmarkExposed: false };
}
export function preparePresentation(items: AssessmentItem[], seed: number, exposedIds: string[]): AssessmentItem[] {
  return items.map((item, index) => ({ ...shuffleAssessmentOptions(item, seed + index), hasSeenExplanationBefore: exposedIds.includes(String(item.id)) }));
}
export function generateVariants(key: string, seed: number): AssessmentItem[] {
  const random = createPrng(seed);
  const pick = (values: number[]) => values[Math.floor(random() * values.length)];
  const nonzero = (min: number, max: number) => Array.from({ length: max-min+1 }, (_, i) => i+min).filter(Boolean);
  return Array.from({ length: 5 }, (_, index) => {
    const variantSeed = `${seed}-${index}`;
    if (key.endsWith('/geometry/A1.2')) return toAssessmentItem(G.generateCircleCanonicalItem({ h: pick(nonzero(-8,8)), k: pick(nonzero(-8,8)), r: 2+Math.floor(random()*11), seed: variantSeed }));
    if (key.endsWith('/geometry/A5.3')) return toAssessmentItem(G.generateSphereCrossSectionItem({ tripletIndex: (index + seed) % 5, seed: variantSeed }));
    if (key.endsWith('/functions/A2.4')) return toAssessmentItem(G.generateLinearEquationItem({ m: pick(nonzero(-5,5)), x1: Math.floor(random()*9)-4, y1: Math.floor(random()*13)-6, seed: variantSeed }));
    if (key.endsWith('/statistics/A3.1')) { const q1 = 20+5*Math.floor(random()*9); return toAssessmentItem(G.generateRicBoxItem({ q1, q3: q1+15+5*Math.floor(random()*7), seed: variantSeed })); }
    return undefined;
  }).filter((i): i is AssessmentItem => !!i);
}
