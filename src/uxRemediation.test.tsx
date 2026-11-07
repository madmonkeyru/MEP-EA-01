import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, configure, fireEvent, render, screen, within } from '@testing-library/react';
import { App } from './App';
import { ThemeProvider } from './context/ThemeContext';
import { dataService } from './services/dataService';
import { storageService } from './services/storageService';
import { createSession } from './services/learningSession';
import { routeHash } from './services/navigation';
import { BxmLearningStore } from './features/bxm-integration/learningStore';
import { SessionRunner } from './features/bxm-assessment/sessionRunner';
import { authoredPool, lessons, policyFor } from './features/bxm-integration/providers';
import { BXM_OFFICIAL_EVIDENCES_FIXTURE as catalog } from './features/bxm-progress/ui/evidenceCatalogFixture';
import { subscriptionService } from './services/subscriptionService';

configure({ asyncUtilTimeout: 7000 });
vi.setConfig({ testTimeout: 30000 });
beforeEach(async () => { localStorage.clear(); subscriptionService.setTier('premium'); await dataService.setProgram('bxm', undefined, '2026-c2', 'matematicas'); });
afterEach(() => { cleanup(); localStorage.clear(); subscriptionService.setTier('free'); window.history.replaceState(null, '', '/'); });
function mount(hash: string) {
  window.history.replaceState(null, '', hash);
  return render(<ThemeProvider><App /></ThemeProvider>);
}
async function deliverLegacy() {
  fireEvent.click(screen.getByRole('button', { name: 'Finalizar' }));
  fireEvent.click(screen.getByRole('button', { name: 'Sí, entregar' }));
  await screen.findByRole('heading', { name: /Tu resultado:/ });
}
function confirmGuided() {
  const dialog = screen.getByRole('dialog', { name: 'Antes de comenzar la actividad' });
  fireEvent.click(within(dialog).getByRole('button', { name: /^(Comenzar actividad|Aceptar actividad limitada)$/ }));
}

describe('UX-09 complete result → remediation → retest journeys', () => {
  it('guided: preserves the source result through a reloaded lesson before starting targeted practice', async () => {
    const item = authoredPool.find(candidate => lessons.some(lesson => lesson.evidenceKey === candidate.evidenceId))!;
    const root = new SessionRunner({ sessionId: 'ux09-lesson-origin', items: [item], policy: policyFor('diagnostic') }).finalizeSession();
    new BxmLearningStore('guest').complete(root);
    let view = mount(routeHash({ view: 'learning', programId: 'bxm', subjectId: 'matematicas', convocatoriaId: '2026-c2', tab: 'result', sessionId: root.sessionId }));
    fireEvent.click(await screen.findByText(/Estudiar este tema en el Temario/, { selector: 'button' }));
    await screen.findByText('Practicar esta habilidad', { selector: 'button' });
    const lessonUrl = window.location.hash;
    expect(lessonUrl).toContain('origen=ux09-lesson-origin');
    view.unmount(); view = mount(lessonUrl);
    fireEvent.click(await screen.findByText('Practicar esta habilidad', { selector: 'button' }));
    confirmGuided();
    await screen.findByText('Finalizar sesión', { selector: 'button' });
    expect(new BxmLearningStore('guest').getActive()?.policy.learningContext).toEqual({ sourceSessionId: root.sessionId, rootSessionId: root.sessionId, evidenceKey: item.evidenceId });
    view.unmount();
  });

  it('legacy: targets the clicked area, restores the retest, suppresses help, and compares the same root questions', async () => {
    const items = ['geometry', 'functions'].map(area => dataService.getAllItems().find(item => item.area_id === area)!);
    const root = { ...createSession({ mode: 'area', programId: 'bxm', subjectId: 'matematicas', convocatoriaId: '2026-c2', itemIds: items.map(item => item.id), itemCount: 2, enableTimer: false, timerDurationMinutes: 0 }), isCompleted: true, completedAt: new Date().toISOString() };
    storageService.saveResult(root);
    let view = mount(routeHash({ view: 'results', programId: 'bxm', subjectId: 'matematicas', convocatoriaId: '2026-c2', sessionId: root.sessionId }));
    fireEvent.click(await screen.findByRole('button', { name: 'Practicar Geometría' }));
    await screen.findByRole('heading', { name: 'Pregunta 1 de 1' });
    let active = storageService.getActiveSession()!;
    expect(active.itemIds).toEqual([items[0].id]);
    expect(active.config.remediation?.rootSessionId).toBe(root.sessionId);
    fireEvent.click(screen.getAllByRole('radio').find(radio => (radio as HTMLInputElement).value === active.items![0].correct_answer)!);
    await deliverLegacy();
    fireEvent.click(screen.getByRole('button', { name: 'Comprobar sin ayudas' }));
    await screen.findByRole('heading', { name: 'Pregunta 1 de 1' });
    active = storageService.getActiveSession()!;
    expect(active.config.remediation?.stage).toBe('retest');
    expect(screen.queryByRole('button', { name: 'Fórmulas' })).not.toBeInTheDocument();
    expect(active.itemIds).toEqual([items[0].id]);
    fireEvent.click(screen.getAllByRole('radio').find(radio => (radio as HTMLInputElement).value === active.items![0].correct_answer)!);
    expect(screen.queryByRole('button', { name: 'Verificar respuesta y ver explicación' })).not.toBeInTheDocument();
    const url = window.location.hash;
    view.unmount(); view = mount(url);
    await screen.findByRole('heading', { name: 'Pregunta 1 de 1' });
    expect(screen.getAllByRole('radio').some(radio => (radio as HTMLInputElement).checked)).toBe(true);
    await deliverLegacy();
    expect(screen.getByText(/En las mismas 1 preguntas: 0\/1 correctas antes del refuerzo → 1\/1/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver resultado de origen' })).toHaveAttribute('href', expect.stringContaining(root.sessionId));
    expect(storageService.getAttempts()).toHaveLength(3);
    expect(storageService.getResult(root.sessionId, 'another-profile')).toBeNull();
    expect(new BxmLearningStore('guest').getResults()).toHaveLength(0);
    view.unmount();
  });

  it('guided: the clicked plan skill survives practice, reload and retest without falsely certifying mastery', async () => {
    const items = ['geometry', 'functions'].map(domain => authoredPool.find(item => item.domain === domain)!);
    const rootRunner = new SessionRunner({ sessionId: 'ux09-guided-root', items, policy: policyFor('diagnostic') });
    const root = rootRunner.finalizeSession();
    new BxmLearningStore('guest').complete(root);
    const key = items[1].evidenceId;
    let view = mount(routeHash({ view: 'learning', programId: 'bxm', subjectId: 'matematicas', convocatoriaId: '2026-c2', tab: 'result', sessionId: root.sessionId }));
    fireEvent.click(await screen.findByRole('button', { name: `Practicar: ${catalog.find(item => item.key === key)!.description}` }));
    confirmGuided();
    await screen.findByRole('button', { name: 'Finalizar sesión' });
    let active = new BxmLearningStore('guest').getActive()!;
    expect(active.items.every(item => item.evidenceId === key)).toBe(true);
    expect(active.policy.learningContext?.rootSessionId).toBe(root.sessionId);
    for (let index = 0; index < active.items.length; index++) {
      fireEvent.click(screen.getByRole('button', { name: `Opción ${active.items[index].correctAnswer}` }));
      fireEvent.click(screen.getByRole('button', { name: 'Verificar respuesta' }));
      if (index < active.items.length - 1) fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    }
    fireEvent.click(screen.getByRole('button', { name: 'Finalizar sesión' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Comprobar mi avance sin ayudas' }));
    confirmGuided();
    await screen.findByRole('button', { name: 'Entregar examen' });
    active = new BxmLearningStore('guest').getActive()!;
    expect(active.items.every(item => item.evidenceId === key)).toBe(true);
    expect(active.policy.kind).toBe('retest');
    expect(active.policy.learningContext?.rootSessionId).toBe(root.sessionId);
    expect(screen.queryByRole('button', { name: 'Verificar respuesta' })).not.toBeInTheDocument();
    const url = window.location.hash;
    view.unmount(); view = mount(url);
    await screen.findByRole('button', { name: 'Entregar examen' });
    for (let index = 0; index < active.items.length; index++) {
      fireEvent.click(screen.getByRole('button', { name: `Opción ${active.items[index].correctAnswer}` }));
      if (index < active.items.length - 1) fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    }
    fireEvent.click(screen.getByRole('button', { name: 'Entregar examen' }));
    await screen.findByText(/Un resultado aislado no certifica dominio/);
    expect(screen.getByRole('button', { name: 'Ver resultado de origen' })).toBeInTheDocument();
    const store = new BxmLearningStore('guest');
    expect(store.getResults()).toHaveLength(3);
    expect(store.getResults()[0].learningContext?.evidenceKey).toBe(key);
    expect(store.getResults()[0].firstResponseScorePercentage).toBe(100);
    expect(new BxmLearningStore('another-profile').getResults()).toHaveLength(0);
    expect(storageService.getAttempts()).toHaveLength(0);
    view.unmount();
  });
});
