import { beforeEach, describe, expect, it, vi } from 'vitest';
import { calculatorRule, createSession, isExam, prepareItems, scopeKey, validSession } from './learningSession';
import { dataService } from './dataService';
import { storageService } from './storageService';
beforeEach(async () => { localStorage.clear(); await dataService.setProgram('bxm', undefined, '2026-c2'); });
describe('student-visible assembly contract', () => {
  it('returns exact requested items, real concept matches and the published weighting', () => {
    const base = { mode: 'area' as const, itemCount: 10, enableTimer: false, timerDurationMinutes: 30 };
    const requested = [1, 3, 9];
    expect(prepareItems({ ...base, itemIds: requested }).map(item => item.id)).toEqual(requested);
    const weighted = prepareItems({ ...base, mode: 'dynamic_mock', itemCount: 60 });
    expect(weighted).toHaveLength(60);
    expect(['geometry', 'functions', 'statistics'].map(area => weighted.filter(item => item.area_id === area).length)).toEqual([23, 25, 12]);
    const candidate = dataService.getAllItems().find(item => item.concept_id || item.linked_concepts?.length);
    if (candidate) {
      const concept = candidate.concept_id || candidate.linked_concepts![0];
      const items = prepareItems({ ...base, mode: 'concept_drilldown', conceptId: concept });
      expect(items.length).toBeGreaterThan(0);
      expect(items.every(item => item.concept_id === concept || item.linked_concepts?.includes(concept))).toBe(true);
    }
    expect(prepareItems({ ...base, mode: 'concept_drilldown', conceptId: 'missing-concept' })).toEqual([]);
    expect(isExam({ ...base, mode: 'dynamic_mock' })).toBe(true);
    const original = [{ ...dataService.getItemById(1)!, stem: 'Enunciado de una versión anterior' }];
    expect(createSession({ ...base, itemIds: [1] }, original, []).items?.[0].stem).toBe('Enunciado de una versión anterior');
  });
  it('validates exact ordered snapshots and ownership instead of equal question counts', () => {
    const session = createSession({ mode: 'area', itemCount: 5, enableTimer: false, timerDurationMinutes: 30 });
    expect(validSession(session, 'guest')).toBe(true);
    expect(validSession(session, 'another-profile')).toBe(false);
    expect(validSession({ ...session, itemIds: [...session.itemIds].reverse() }, 'guest')).toBe(false);
    expect(scopeKey(session.config)).not.toBe(scopeKey({ ...session.config, topic: 'another-topic' }));
    expect(validSession({ ...session, version: undefined }, 'guest')).toBe(false);
    expect(validSession({ ...session, responses: undefined as never }, 'guest')).toBe(false);
    expect(validSession({ ...session, currentResponseIndex: 1000 }, 'guest')).toBe(false);
  });
  it('handles corrupted and full storage without breaking answering', () => {
    localStorage.setItem('mep_ea_attempts', '{bad json');
    expect(storageService.getAttempts()).toEqual([]);
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('Quota exceeded'); });
    expect(storageService.saveActiveSession(createSession({ mode: 'simulation', itemCount: 1, enableTimer: false, timerDurationMinutes: 30 }))).toBe(false);
    expect(storageService.lastError).toMatch(/No se pudo guardar/);
    spy.mockRestore();
  });
  it('uses the same subject-and-level calculator rules everywhere', () => {
    expect(calculatorRule('iii_ciclo', 'matematicas', 'III_CICLO_7')).toBe('Calculadora prohibida');
    expect(calculatorRule('iii_ciclo', 'matematicas', 'III_CICLO_9')).toMatch(/sencilla/);
    expect(calculatorRule('iii_ciclo')).toMatch(/depende/);
    expect(calculatorRule('cico', 'matematicas')).toBe('Calculadora prohibida');
  });
  it('keeps saved attempts separate when switching local profiles', () => {
    const original = createSession({ mode: 'area', itemCount: 1, enableTimer: false, timerDurationMinutes: 30 });
    const other = { ...original, sessionId: 'other-session', userId: 'other-profile' };
    storageService.saveActiveSession(original);
    storageService.saveActiveSession(other);
    expect(storageService.getActiveSession('guest')?.sessionId).toBe(original.sessionId);
    expect(storageService.getActiveSession('other-profile')?.sessionId).toBe('other-session');
  });
});
