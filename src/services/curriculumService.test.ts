import { describe, it, expect } from 'vitest';
import { curriculumService } from './curriculumService';

describe('CurriculumService', () => {
  it('generates a preparation path model conforming to the official specification table', () => {
    const path = curriculumService.getPreparationPath('bxm', 'matematicas', '02-2026');
    expect(path).toBeDefined();
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

  it('creates a targeted checkpoint quiz practice configuration for an affirmation', () => {
    const quizConfig = curriculumService.createCheckpointQuizConfig('1. Geometría', 'A1', 4);
    expect(quizConfig).toBeDefined();
    expect(quizConfig.mode).toBe('area');
    expect(quizConfig.enableTimer).toBe(false);
    expect(quizConfig.itemIds).toBeDefined();
    expect(quizConfig.itemIds?.length).toBeGreaterThan(0);
  });
});
