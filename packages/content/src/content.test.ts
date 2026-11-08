import { describe, expect, it } from 'vitest';
import raw from './representative.json';
import { loadRegistry, parseBlueprint, parseQuestion, parseTaxonomy, parseVisual, resolveBlueprint } from './index';
import { createFoundationAssessment } from './preview';
import source from '../../../content/bxm-mvp-learning/authored-items-pack.json';

describe('canonical content boundary', () => {
  it('loads three existing authored items, retains provenance and resolves domain quotas', () => {
    const assessment = createFoundationAssessment();
    expect(assessment.questions.map(q => q.domainId)).toEqual(['geometry', 'functions', 'statistics']);
    expect(assessment.questions.every(q => q.publication.status === 'draft')).toBe(true);
    expect(assessment.questions.every(q => q.provenance.source.startsWith('content/bxm-mvp-learning'))).toBe(true);
    for (const item of assessment.questions) {
      const original = source.items.find(q => q.id === item.id)!;
      expect(item.stem).toBe(original.stem);
      expect(item.options.map(o => o.text)).toEqual(Object.values(original.options));
      expect(item.correctOptionId).toBe(original.correctOption);
    }
  });
  it('blocks preview drafts by default', () => {
    expect(() => resolveBlueprint(parseBlueprint(raw.blueprint), loadRegistry(raw.taxonomy, raw.questions))).toThrow('insufficient');
  });
  it('resolves reviewed published content without a preview bypass', () => {
    const registry = loadRegistry(raw.taxonomy, raw.questions.map(q => ({ ...q,
      publication: { status: 'published', signoff: { reviewerId: 'test-reviewer', reviewedAt: '2026-11-08T12:00:00Z', gates: ['A', 'B', 'C', 'D'] } },
    })));
    expect(resolveBlueprint(parseBlueprint(raw.blueprint), registry).questions).toHaveLength(3);
  });
  it.each([
    { ...raw.questions[0], options: raw.questions[0].options.slice(0, 3) },
    { ...raw.questions[0], options: Array(4).fill(raw.questions[0].options[0]) },
    { ...raw.questions[0], correctOptionId: 'Z' },
    { ...raw.questions[0], requiresVisual: true },
    { ...raw.questions[0], conceptIds: [] },
    { ...raw.questions[0], stem: '$unclosed' },
    { ...raw.questions[0], publication: { status: 'published' } },
  ])('rejects invalid schema / incomplete gates', value => { expect(() => parseQuestion(value)).toThrow(); });
  it('requires verified source provenance even with a signoff', () => {
    expect(() => parseQuestion({ ...raw.questions[0], provenance: { source: 'historical', status: 'source_unverified' },
      publication: { status: 'published', signoff: { reviewerId: 'reviewer', reviewedAt: '2026-11-08T12:00:00Z', gates: ['A', 'B', 'C', 'D'] } } })).toThrow('Gate D');
  });
  it('enforces stream isolation and available quotas', () => {
    expect(() => parseBlueprint({ ...raw.blueprint, stream: 'official_reference' })).toThrow('benchmarks');
    const registry = loadRegistry(raw.taxonomy, raw.questions.map(q => ({ ...q, stream: 'official_reference' })));
    expect(() => resolveBlueprint(parseBlueprint(raw.blueprint), registry, { allowDraftPreview: true })).toThrow('insufficient');
    expect(() => parseBlueprint({ ...raw.blueprint, totalItems: 60 })).toThrow('quotas');
  });
  it('rejects invalid taxonomy links and prerequisite cycles', () => {
    expect(() => loadRegistry(raw.taxonomy, [{ ...raw.questions[0], evidenceId: 'missing' }])).toThrow('evidence');
    const taxonomy = structuredClone(raw.taxonomy);
    taxonomy.concepts[0].prerequisiteIds = [taxonomy.concepts[1].id] as never[];
    taxonomy.concepts[1].prerequisiteIds = [taxonomy.concepts[0].id] as never[];
    expect(() => parseTaxonomy(taxonomy)).toThrow('cyclic');
  });
  it('validates declarative visuals', () => {
    expect(parseVisual({ kind: 'circle', alt: 'Circle', center: [3, -4], radius: 5 }).kind).toBe('circle');
    expect(() => parseVisual({ kind: 'circle', alt: '', center: [0, 0], radius: -1 })).toThrow();
    expect(() => parseVisual({ kind: 'coordinate-plane', alt: 'Plane', xRange: [2, 1], yRange: [0, 1], points: [] })).toThrow('bounds');
  });
  it('pins item revisions into the resolved assessment identity', () => {
    const registry = loadRegistry(raw.taxonomy, raw.questions.map(q => ({ ...q, version: 'next' })));
    expect(resolveBlueprint(parseBlueprint(raw.blueprint), registry, { allowDraftPreview: true }).id).not.toBe(createFoundationAssessment().id);
  });
});
