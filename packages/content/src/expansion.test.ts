import { describe, expect, it } from 'vitest';
import { createLearningPreviewCatalog } from './expansion';
import { parseBlueprint, resolveBlueprint } from './index';
import { LearnerJourney } from '@mep-ea/learning-runtime';
import source from '../../../content/bxm-mvp-learning/evidence-catalog.json';
import authored from '../../../content/bxm-mvp-learning/authored-items-pack.json';
import lessons from '../../../content/bxm-mvp-learning/lessons-pack.json';

describe('P2 learning expansion', () => {
  it('loads the complete canonical evidence catalog without fabricating scaffolded lessons', () => {
    const catalog = createLearningPreviewCatalog();
    expect(catalog.nodes.map(n => n.key)).toEqual(source.evidences.map(e => e.key));
    expect(catalog.nodes).toHaveLength(71);
    expect(catalog.lessons).toHaveLength(4);
    const scaffolded = catalog.nodes.filter(n => n.status === 'scaffolded_available_soon');
    expect(scaffolded).toHaveLength(67);
    expect(scaffolded.every(n => n.lesson === null)).toBe(true);
    for (const lesson of catalog.lessons) {
      expect(catalog.nodes.find(n => n.key === lesson.evidenceKey)?.lesson?.id).toBe(lesson.id);
      const { publication, ...asset } = lesson;
      expect(publication.status).toBe('draft');
      expect(asset).toEqual(lessons.lessons.find(l => l.id === lesson.id));
    }
  });
  it('preserves all 30 authored items, provenance and exact evidence/concept relationships', () => {
    const catalog = createLearningPreviewCatalog();
    expect(catalog.registry.questions).toHaveLength(30);
    for (const item of authored.items) {
      const q = catalog.registry.questions.find(q => q.id === item.id)!;
      expect(q.stem).toBe(item.stem); expect(q.solution).toEqual(item.solutionSteps);
      expect(q.correctOptionId).toBe(item.correctOption); expect(q.familyId).toBe(item.familyId);
      expect(q.provenance.status).toBe(item.reviewStatus); expect(q.publication).toEqual({ status: 'draft' });
      expect(q.stream).toBe('authored'); expect(q.evidenceId).toBe(item.evidenceKey);
      expect(catalog.nodes.find(n => n.key === q.evidenceId)?.conceptIds).toContain(item.conceptId);
    }
    expect(() => resolveBlueprint(catalog.blueprints[0], catalog.registry)).toThrow('insufficient');
  });
  it('isolates official references even when draft preview is enabled', () => {
    const catalog = createLearningPreviewCatalog();
    const official = { ...catalog.registry.questions[0], id: 'official-poison', stream: 'official_reference' as const };
    const assessment = resolveBlueprint(catalog.blueprints[0], { ...catalog.registry, questions: [official, ...catalog.registry.questions] }, { allowDraftPreview: true });
    expect(assessment.questions).toHaveLength(30);
    expect(assessment.questions.every(q => q.stream === 'authored')).toBe(true);
    expect(() => resolveBlueprint({ ...catalog.blueprints[0], stream: 'official_reference' }, catalog.registry, { allowDraftPreview: true })).toThrow('reserved for benchmarks');
  });
  it('rejects invalid evidence filters and never fills a targeted quota from neighboring evidence', () => {
    const catalog = createLearningPreviewCatalog();
    const practice = catalog.blueprints.find(b => b.mode === 'practice')!;
    expect(() => parseBlueprint({ ...practice, evidenceIds: [] })).toThrow('cannot be empty');
    expect(() => parseBlueprint({ ...practice, evidenceIds: ['same', 'same'] })).toThrow();
    expect(() => resolveBlueprint({ ...practice, evidenceIds: ['unknown'] }, catalog.registry, { allowDraftPreview: true })).toThrow('unknown evidence');
    expect(() => resolveBlueprint({ ...practice, totalItems: 30, domainQuotas: [{ domainId: 'geometry', count: 30 }] }, catalog.registry, { allowDraftPreview: true })).toThrow('insufficient');
  });
  it('compiles every practice using only the chosen evidence and resumes through async storage', async () => {
    const catalog = createLearningPreviewCatalog(); const values = new Map<string, string>();
    const storage = { getItem: async (key: string) => values.get(key) ?? null,
      setItem: async (key: string, value: string) => { values.set(key, value); }, removeItem: async (key: string) => { values.delete(key); } };
    let id = 0; const journey = new LearnerJourney(catalog, storage, 'p2-test', undefined, () => `p2-${id++}`);
    for (const node of catalog.nodes) {
      if (!node.practiceBlueprintId) { expect(node.practiceItemIds).toEqual([]); continue; }
      const state = await journey.start(node.practiceBlueprintId);
      expect(state.assessment.questions.map(q => q.id).sort()).toEqual([...node.practiceItemIds].sort());
      expect(state.assessment.questions.every(q => q.evidenceId === node.key)).toBe(true);
      const q = state.assessment.questions[0]; await journey.answer(q.id, q.correctOptionId);
      const reopened = new LearnerJourney(catalog, storage, 'p2-test');
      expect((await reopened.resume())?.attempt.answers[q.id].optionId).toBe(q.correctOptionId);
      const submitted = await reopened.submit();
      expect(submitted.attempt.score?.correct).toBe(1);
      expect(reopened.result(submitted).diagnostic.provisional).toBe(true);
    }
  });
});
