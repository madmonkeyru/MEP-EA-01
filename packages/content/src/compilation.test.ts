import { describe, expect, it } from 'vitest';
import { createLearningPreviewCatalog } from './expansion';
import { compileAssessment, createRng, deterministicShuffle, loadOfficialReferenceQuestions } from './compilation';

describe('P6 Compilation Engine', () => {
  const catalog = createLearningPreviewCatalog();

  it('generates reproducible sequences with seeded RNG', () => {
    const rng1 = createRng(42);
    const rng2 = createRng(42);
    const seq1 = [rng1(), rng1(), rng1()];
    const seq2 = [rng2(), rng2(), rng2()];
    expect(seq1).toEqual(seq2);

    const list = [1, 2, 3, 4, 5, 6, 7, 8];
    const shuf1 = deterministicShuffle(list, createRng(100));
    const shuf2 = deterministicShuffle(list, createRng(100));
    expect(shuf1).toEqual(shuf2);
  });

  it('compiles a 20-item diagnostic deterministically from authored items', () => {
    const a1 = compileAssessment({ programId: 'bxm', subjectId: 'matematica', mode: 'diagnostic', seed: 12345 }, catalog.registry, { allowDraftPreview: true });
    const a2 = compileAssessment({ programId: 'bxm', subjectId: 'matematica', mode: 'diagnostic', seed: 12345 }, catalog.registry, { allowDraftPreview: true });

    expect(a1.id).toBe(a2.id);
    expect(a1.questions.length).toBe(20);
    expect(a1.blueprint.totalItems).toBe(20);
    expect(a1.blueprint.timeLimitSeconds).toBe(1800); // 30 minutes
    expect(a1.questions.map(q => q.id)).toEqual(a2.questions.map(q => q.id));

    // Verify domain quotas: 8 geometry, 8 functions, 4 statistics
    const geo = a1.questions.filter(q => q.domainId === 'geometry');
    const func = a1.questions.filter(q => q.domainId === 'functions');
    const stat = a1.questions.filter(q => q.domainId === 'statistics');
    expect(geo.length).toBe(8);
    expect(func.length).toBe(8);
    expect(stat.length).toBe(4);

    // Verify all questions belong strictly to the authored stream
    expect(a1.questions.every(q => q.stream === 'authored')).toBe(true);
  });

  it('compiles a 20-item formative mock with 45 minutes timing', () => {
    const mock = compileAssessment({ programId: 'bxm', subjectId: 'matematica', mode: 'mock', seed: 999 }, catalog.registry, { allowDraftPreview: true });
    expect(mock.questions.length).toBe(20);
    expect(mock.blueprint.timeLimitSeconds).toBe(2700); // 45 minutes
    expect(mock.questions.every(q => q.stream === 'authored')).toBe(true);
  });

  it('strictly isolates official reference stream items from diagnostic & mock pools', () => {
    // Inject an official reference item into registry questions to test poison defense
    const poisonRegistry = {
      ...catalog.registry,
      questions: [
        ...catalog.registry.questions,
        {
          ...catalog.registry.questions[0]!,
          id: 'official-poison-1',
          stream: 'official_reference' as const,
        },
      ],
    };

    const compiled = compileAssessment({ programId: 'bxm', subjectId: 'matematica', mode: 'diagnostic', seed: 42 }, poisonRegistry, { allowDraftPreview: true });
    expect(compiled.questions.some(q => q.id === 'official-poison-1')).toBe(false);
    expect(compiled.questions.every(q => q.stream === 'authored')).toBe(true);
  });

  it('compiles 60-item official simulation from official reference stream', () => {
    const sim = compileAssessment({ programId: 'bxm', subjectId: 'matematica', mode: 'simulation' }, catalog.registry);
    expect(sim.questions.length).toBe(60);
    expect(sim.blueprint.totalItems).toBe(60);
    expect(sim.blueprint.mode).toBe('benchmark');
    expect(sim.blueprint.stream).toBe('official_reference');
    expect(sim.blueprint.timeLimitSeconds).toBe(150 * 60);

    const geo = sim.questions.filter(q => q.domainId === 'geometry');
    const func = sim.questions.filter(q => q.domainId === 'functions');
    const stat = sim.questions.filter(q => q.domainId === 'statistics');
    expect(geo.length).toBe(23);
    expect(func.length).toBe(25);
    expect(stat.length).toBe(12);

    expect(sim.questions.every(q => q.stream === 'official_reference')).toBe(true);
    expect(loadOfficialReferenceQuestions().length).toBe(60);
  });

  it('rejects unsupported modes or programs', () => {
    expect(() => compileAssessment({ programId: 'bxm', subjectId: 'matematica', mode: 'unknown' as any }, catalog.registry)).toThrow('invalid mode');
    expect(() => compileAssessment({ programId: 'edad' as any, subjectId: 'matematica', mode: 'diagnostic' }, catalog.registry)).toThrow('program edad not found in taxonomy');
  });
});
