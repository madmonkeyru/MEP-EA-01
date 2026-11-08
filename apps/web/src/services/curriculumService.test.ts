import { describe, it, expect } from 'vitest';
import { curriculumService } from './curriculumService';

describe('CurriculumService', () => {
  it('generates a preparation path model conforming to the official specification table', () => {
    const path = curriculumService.getPreparationPath('bxm', 'matematicas', '02-2026');
    expect(path).toBeDefined();
    if (!path) throw new Error('Expected registered specification');
    expect(path.blocks.length).toBe(3);
    expect(path.totalExamPoints).toBe(60);

    const geoBlock = path.blocks[0];
    expect(geoBlock.name).toBe('Geometría');
    expect(geoBlock.totalPoints).toBe(23);
    expect(geoBlock.affirmations.length).toBeGreaterThan(0);

    const firstAff = geoBlock.affirmations[0];
    expect(firstAff.code).toBe('A1');
    expect(firstAff.evidenceCodes).toContain('A1.1');
    expect(firstAff.availableItemsCount).toBeGreaterThan(0);
  });

  it('does not show BXM content for an unknown subject, program, module or year', () => {
    expect(curriculumService.getSpecTable('unknown')).toBeUndefined();
    expect(curriculumService.getSpecTable('bxm', 'espanol')).toBeUndefined();
    expect(curriculumService.getSpecTable('bxm', 'matematicas', '2027-c2')).toBeUndefined();
    expect(curriculumService.getSpecTable('bxm', 'matematicas', '02-2026', 'unknown')).toBeUndefined();
    expect(curriculumService.getPreparationPath('unknown')).toBeUndefined();
    expect(curriculumService.getSpecTable('bxm', 'matematicas', '2026-c2')?.programId).toBe('bxm');
    expect(curriculumService.getSpecTable('edad', 'matematicas', '2026-c2', 'EDAD_1')?.programId).toBe('edad');
  });

  it('creates a targeted checkpoint quiz practice configuration for an affirmation', () => {
    const quizConfig = curriculumService.createCheckpointQuizConfig('1. Geometría', 'A1', 4);
    expect(quizConfig).toBeDefined();
    expect(quizConfig.mode).toBe('area');
    expect(quizConfig.enableTimer).toBe(false);
    expect(quizConfig.itemIds).toBeDefined();
    expect(quizConfig.itemIds?.length).toBeGreaterThan(0);
  });
});
