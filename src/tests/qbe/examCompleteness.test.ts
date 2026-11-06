import { describe, it, expect } from 'vitest';
import { ExamCompletenessValidator } from '../../services/qbe/examCompletenessValidator';
import type { ConvocatoriaManifest, Item } from '../../types';

describe('M5.3: Exam Completeness Enforcement', () => {
  const createMockItem = (id: string, overrides?: Partial<Item>): Item => {
    return {
      id: 1,
      code: id,
      stem: 'Stem for ' + id,
      solution_steps: ['Paso 1'],
      explanation: 'Explicación',
      key_rule: 'Regla clave',
      set_id: 'set_1',
      area: 'Geometría',
      area_id: 'geometry',
      topic: 'Circunferencia',
      evidence_id: 'A1.1',
      calculator_allowed: true,
      cognitive_level: 'reproduccion',
      difficulty: 'basic',
      text: 'Stem for ' + id,
      options: [
        { letter: 'A', text: 'Option A' },
        { letter: 'B', text: 'Option B' },
        { letter: 'C', text: 'Option C' },
        { letter: 'D', text: 'Option D' },
      ],
      correct_answer: 'A',
      spec: {
        block: '1. Geometría',
        affirmation: 'A1',
        evidence: 'A1.1',
      },
      ...overrides,
    };
  };

  const createMockBlueprint = (itemCount = 60, overrides?: Partial<ConvocatoriaManifest>): ConvocatoriaManifest => {
    const itemIds = Array.from({ length: itemCount }, (_, i) => `item-mock-${String(i + 1).padStart(3, '0')}`);
    return {
      schemaVersion: '1.0',
      convocatoriaId: '2026-c2',
      coverage: 'complete',
      freeReference: true,
      year: 2026,
      cycle: 2,
      programId: 'bxm',
      subjectId: 'matematica',
      title: 'Prueba Oficial BXM 2026-c2',
      description: 'Simulacro oficial de 60 preguntas.',
      passingScore: 70,
      calculatorAllowed: true,
      timeLimitMinutes: 150,
      totalItems: itemCount,
      sections: [
        {
          id: 'sec-1',
          name: 'Sección Única',
          itemRange: [1, itemCount],
          totalItems: itemCount,
          itemIds: [...itemIds],
        },
      ],
      itemPool: [...itemIds],
      ...overrides,
    };
  };

  it('passes gate for a complete, 60-item official BXM exam with all items resolved', () => {
    const blueprint = createMockBlueprint(60);
    const itemsMap = new Map<string, Item>();
    blueprint.itemPool.forEach((id) => {
      itemsMap.set(id, createMockItem(id));
    });

    const report = ExamCompletenessValidator.validateBlueprint(blueprint, itemsMap);
    expect(report.passed_gate).toBe(true);
    expect(report.is_officially_complete).toBe(true);
    expect(report.expected_items).toBe(60);
    expect(report.actual_items_found).toBe(60);
    expect(report.missing_item_ids).toHaveLength(0);
    expect(report.duplicate_item_ids).toHaveLength(0);
  });

  it('fails gate as BLOCKER if an item in the blueprint cannot be found in the repository', () => {
    const blueprint = createMockBlueprint(60);
    const itemsMap = new Map<string, Item>();
    // Leave one item missing
    blueprint.itemPool.slice(0, 59).forEach((id) => {
      itemsMap.set(id, createMockItem(id));
    });

    const report = ExamCompletenessValidator.validateBlueprint(blueprint, itemsMap);
    expect(report.passed_gate).toBe(false);
    expect(report.is_officially_complete).toBe(false);
    expect(report.missing_item_ids).toContain('item-mock-060');
    expect(report.issues.some((i) => i.code === 'MISSING_BLUEPRINT_ITEMS')).toBe(true);
  });

  it('fails gate as BLOCKER if BXM official reference contains other than 60 items', () => {
    const blueprint = createMockBlueprint(50); // Only 50 items declared
    const itemsMap = new Map<string, Item>();
    blueprint.itemPool.forEach((id) => {
      itemsMap.set(id, createMockItem(id));
    });

    const report = ExamCompletenessValidator.validateBlueprint(blueprint, itemsMap);
    expect(report.passed_gate).toBe(false);
    expect(report.issues.some((i) => i.code === 'INVALID_BXM_TOTAL_ITEMS')).toBe(true);
  });

  it('fails gate as BLOCKER if blueprint contains duplicate item IDs', () => {
    const blueprint = createMockBlueprint(60);
    blueprint.itemPool[59] = blueprint.itemPool[0]; // duplicate item 1
    const itemsMap = new Map<string, Item>();
    blueprint.itemPool.forEach((id) => {
      itemsMap.set(id, createMockItem(id));
    });

    const report = ExamCompletenessValidator.validateBlueprint(blueprint, itemsMap);
    expect(report.passed_gate).toBe(false);
    expect(report.duplicate_item_ids).toContain(blueprint.itemPool[0]);
    expect(report.issues.some((i) => i.code === 'DUPLICATE_BLUEPRINT_ITEM_IDS')).toBe(true);
  });

  it('marks sample or partial blueprints explicitly and raises a non-complete warning', () => {
    const sampleBlueprint = createMockBlueprint(2, {
      coverage: 'sample',
      programId: 'iii_ciclo',
      totalItems: 2,
      sections: [
        {
          id: 's1',
          name: 'Muestra',
          itemRange: [1, 2],
          totalItems: 2,
          itemIds: ['sample-1', 'sample-2'],
        },
      ],
      itemPool: ['sample-1', 'sample-2'],
    });

    const itemsMap = new Map<string, Item>();
    itemsMap.set('sample-1', createMockItem('sample-1'));
    itemsMap.set('sample-2', createMockItem('sample-2'));

    const report = ExamCompletenessValidator.validateBlueprint(sampleBlueprint, itemsMap);
    expect(report.coverage_declared).toBe('sample');
    expect(report.is_officially_complete).toBe(false);
    expect(report.issues.some((i) => i.code === 'NON_COMPLETE_COVERAGE_DECLARED')).toBe(true);
  });
});
