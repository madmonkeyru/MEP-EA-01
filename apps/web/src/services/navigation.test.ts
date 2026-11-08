import { describe, expect, it } from 'vitest';
import { readRoute, routeHash } from './navigation';
import { dataService } from './dataService';

describe('program navigation', () => {
  it('parses about and faq routes and generates canonical hash', () => {
    expect(readRoute('#/acerca')).toEqual({ view: 'about' });
    expect(readRoute('#/faq')).toEqual({ view: 'about' });
    expect(routeHash({ view: 'about' })).toBe('#/acerca');
  });

  it('round trips persisted test/result routes and resource tabs', () => {
    for (const view of ['test', 'results'] as const) {
      expect(readRoute(routeHash({ view, programId: 'bxm', subjectId: 'matematicas', sessionId: 'saved-123', convocatoriaId: '2026-c2' }))).toMatchObject({ view, sessionId: 'saved-123', subjectId: 'matematicas' });
    }
    expect(readRoute('#/programas/bxm/matematicas?seccion=resources&recurso=terms')).toMatchObject({ tab: 'resources', resourceTab: 'terms' });
    expect(readRoute('#/programas/bxm/matematicas?seccion=bad').tab).toBeUndefined();
  });
  it('preserves each learning destination when reloading or navigating back', () => {
    for (const tab of ['inicio', 'temario', 'practice', 'simulation']) {
      expect(readRoute(routeHash({ view: 'learning', programId: 'bxm', subjectId: 'matematicas', convocatoriaId: '2026-c2', tab }))).toMatchObject({ view: 'learning', tab });
    }
  });
  it('round trips every subject route and validates level context', () => {
    for (const program of dataService.getPrograms()) {
      for (const subject of program.subjects) {
        const parsed = readRoute(routeHash({ view: 'hub', programId: program.id, subjectId: subject.id }));
        expect(parsed).toMatchObject({ view: 'hub', programId: program.id, subjectId: subject.id, convocatoriaId: '2026-c2' });
      }
    }
    expect(readRoute('#/programas/edad/espanol?nivel=III_CICLO_9')).toMatchObject({ moduleId: 'EDAD_1' });
    expect(readRoute('#/programas/cico/espanol?nivel=EDAD_2').moduleId).toBeUndefined();
  });
  it('recovers invalid programs and subjects', () => {
    expect(readRoute('#/programas/missing')).toEqual({ view: 'welcome' });
    expect(readRoute('#/programas/bxm/missing').view).toBe('framework');
    expect(readRoute('#/programas/bxm/espanol/extra').view).toBe('welcome');
  });
  it('clears questions when switching to unpublished subject content', async () => {
    await dataService.setProgram('bxm');
    expect(dataService.getAllItems().length).toBeGreaterThan(0);
    await dataService.loadSubject('bxm', 'espanol');
    expect(dataService.getAllItems()).toEqual([]);
    expect(dataService.getSets()).toEqual([]);
    expect(dataService.getItemsBySet('set_1')).toEqual([]);
    await dataService.setProgram('cico');
    expect(dataService.getAllItems()).toEqual([]);
    await dataService.setProgram('bxm', undefined, '2026-c2');
  });
});
