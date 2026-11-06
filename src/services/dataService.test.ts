import { describe, it, expect } from 'vitest';
import { dataService } from './dataService';
import publication from '../../content/qbe/manifests/publication_report.json';
import { prepareItems } from './learningSession';

describe('DataService', () => {
  it('publishes each verified QBE item once and keeps blocked identities unreachable', () => {
    const all = dataService.getAllItems();
    const released = all.filter(item => item.source_question_id);
    expect(released.length).toBe(publication.summary.enabled);
    expect(new Set(all.map(item => item.id)).size).toBe(all.length);
    for (const decision of publication.questions) {
      const id = publication.runtime_id_map[decision.id as keyof typeof publication.runtime_id_map];
      expect(Boolean(dataService.getItemById(id))).toBe(decision.enabled);
      if (decision.enabled) {
        const item = dataService.getItemById(id)!;
        expect(item.source_question_id).toBe(decision.id);
        expect(Object.keys(item.options)).toContain(item.correct_answer);
        expect(item.solution_steps.length).toBeGreaterThan(0);
      }
    }
    for (const set of dataService.getSets().filter(set => set.id.startsWith('qbe-'))) {
      const items = prepareItems({ mode: 'random_practice', setId: set.id, itemCount: 'all',
        enableTimer: false, timerDurationMinutes: 30 });
      expect(items.length).toBe(set.total_items);
      expect(items.every(item => item.set_id === set.id)).toBe(true);
    }
  });
  it('loads all atomic items across domains', () => {
    const items = dataService.getAllItems();
    expect(items.length).toBeGreaterThanOrEqual(232);
    expect(items.find((i) => i.id === 1)).toBeDefined();
    expect(items.find((i) => i.id === 170)).toBeDefined();
    expect(items.find((i) => i.id === 201)).toBeDefined(); // First solid item
  });

  it('manages legacy sets correctly for backwards compatibility', () => {
    const sets = dataService.getSets().filter(set => !set.id.startsWith('qbe-'));
    expect(sets.length).toBe(5);
    expect(sets[0].id).toBe('set_1');
    expect(sets[0].total_items).toBe(60);
    expect(sets[1].id).toBe('set_2');
    expect(sets[1].total_items).toBe(70);
    expect(sets[2].id).toBe('set_3');
    expect(sets[2].total_items).toBe(20);
    expect(sets[3].id).toBe('set_4');
    expect(sets[3].total_items).toBe(20);
    expect(sets[4].id).toBe('set_5');
    expect(sets[4].total_items).toBe(30);

    const set1Items = dataService.getItemsBySet('set_1');
    expect(set1Items.length).toBe(60);

    const set3Items = dataService.getItemsBySet('set_3');
    expect(set3Items.length).toBe(20);

    const set5Items = dataService.getItemsBySet('set_5');
    expect(set5Items.length).toBe(30);

    const legacyItems = dataService.getLegacySetItems();
    expect(legacyItems.length).toBe(200);
  });

  it('loads groups correctly from groups.json', () => {
    const group = dataService.getGroupById('g_fuel_price');
    expect(group).toBeDefined();
    expect(group?.items).toContain(53);
    expect(group?.items).toContain(54);
  });

  it('resolves blueprints dynamically for convocatoria simulations', () => {
    const bpC2 = dataService.getConvocatoriaBlueprint('2026-c2');
    expect(bpC2).toBeDefined();
    expect(bpC2?.convocatoriaId).toBe('2026-c2');
    expect(bpC2?.totalItems).toBe(60);

    const bpC1 = dataService.getConvocatoriaBlueprint('2026-c1');
    expect(bpC1).toBeDefined();
    expect(bpC1?.convocatoriaId).toBe('2026-c1');
    expect(bpC1?.totalItems).toBe(60);

    const simulationItems = dataService.getSimulationItems('2026-c2');
    expect(simulationItems.length).toBe(60);
    expect(simulationItems[0].code).toBe('item-geo-001');
  });

  it('filters items by area and set correctly', () => {
    const set1Geometry = dataService.getItemsByArea('geometry', 'set_1');
    expect(set1Geometry.length).toBe(23);

    const set1Functions = dataService.getItemsByArea('functions', 'set_1');
    expect(set1Functions.length).toBe(25);

    const set1Stats = dataService.getItemsByArea('statistics', 'set_1');
    expect(set1Stats.length).toBe(12);

    const allGeometry = dataService.getItemsByArea('geometry');
    expect(allGeometry.length).toBeGreaterThanOrEqual(124);

    const allFunctions = dataService.getItemsByArea('functions');
    expect(allFunctions.length).toBeGreaterThanOrEqual(65);

    const allStats = dataService.getItemsByArea('statistics');
    expect(allStats.length).toBeGreaterThanOrEqual(43);
  });

  it('retrieves unique topics by area', () => {
    const geometryTopics = dataService.getTopicsByArea('geometry');
    expect(geometryTopics.length).toBeGreaterThan(0);
    expect(geometryTopics).toContain('Circunferencia');
  });
});
