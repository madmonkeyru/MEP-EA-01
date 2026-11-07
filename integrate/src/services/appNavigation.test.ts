import { describe, expect, it } from 'vitest';
import { appNavigation } from './appNavigation';
import { readRoute } from './navigation';

describe('application destinations', () => {
  it('preserves the selected level and convocatoria without carrying an attempt into another section', () => {
    const links = appNavigation({ view: 'results', programId: 'edad', subjectId: 'matematicas', moduleId: 'EDAD_2', convocatoriaId: '2026-c1', sessionId: 'old' });
    for (const label of ['Práctica', 'Simulaciones', 'Progreso']) {
      expect(readRoute(links.find(link => link.label === label)!.href)).toMatchObject({ view: 'hub', programId: 'edad', subjectId: 'matematicas', moduleId: 'EDAD_2', convocatoriaId: '2026-c1' });
      expect(readRoute(links.find(link => link.label === label)!.href).sessionId).toBeUndefined();
    }
    expect(readRoute(links.find(link => link.label === 'Calendario')!.href)).toMatchObject({ programId: 'edad', convocatoriaId: '2026-c1' });
  });
  it('includes FAQ and About destination in global navigation', () => {
    const destinations = appNavigation({ view: 'about' });
    const aboutDest = destinations.find(d => d.label === 'FAQ y Acerca de');
    expect(aboutDest).toBeDefined();
    expect(aboutDest?.href).toBe('#/acerca');
    expect(aboutDest?.active).toBe(true);
  });

  it('keeps guided learning destinations in the guided flow and drops evidence-specific state', () => {
    const links = appNavigation({ view: 'learning', programId: 'bxm', subjectId: 'matematicas', convocatoriaId: '2026-c2', tab: 'simulation', evidenceKey: 'A1.1', sessionId: 'old' });
    expect(links.filter(link => link.active).map(link => link.label)).toEqual(['Simulaciones']);
    expect(readRoute(links.find(link => link.label === 'Simulaciones')!.href)).toMatchObject({ view: 'learning', tab: 'simulation' });
    expect(readRoute(links.find(link => link.label === 'Práctica')!.href).evidenceKey).toBeUndefined();
  });
  it('marks one destination current and does not invent a subject on the entry page', () => {
    expect(appNavigation({ view: 'landing' }).map(link => link.label)).not.toContain('Práctica');
    const links = appNavigation({ view: 'hub', programId: 'bxm', subjectId: 'matematicas', tab: 'progress' });
    expect(links.filter(link => link.active).map(link => link.label)).toEqual(['Progreso']);
  });
});
