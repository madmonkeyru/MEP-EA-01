import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { cleanup, configure, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { App } from './App';
import { ThemeProvider } from './context/ThemeContext';
import { dataService } from './services/dataService';
import { storageService } from './services/storageService';
import { subscriptionService } from './services/subscriptionService';

configure({ asyncUtilTimeout: 5000 });
vi.setConfig({ testTimeout: 15000 });

// Transform lazy screens before testing their navigation and interactions.
beforeAll(async () => {
  await Promise.all([
    import('./components/pages/LandingPage'),
    import('./components/pages/ExamReviewPage'),
    import('./components/test/TestShell'),
    import('./components/results/ResultsPage'),
    import('./components/knowledge/OfficialCalendar'),
    import('./components/onboarding/HelperPage'),
    import('./components/onboarding/ReadinessWizard'),
  ]);
}, 60000);

afterEach(async () => {
  cleanup();
  localStorage.clear();
  window.history.replaceState(null, '', '/');
  await dataService.setProgram('bxm', undefined, '2026-c2');
});

function mount(hash = '#/') {
  window.history.replaceState(null, '', hash);
  return render(<ThemeProvider><App /></ThemeProvider>);
}

/**
 * Legacy POC Regression & Compatibility Test Suite
 *
 * Retention Reason: Retained under P10.16 Gate 15 as an isolated regression suite
 * ensuring backwards-compatibility of legacy calculation algorithms, onboarding
 * evaluation rules, and legacy resource catalog metadata while production traffic
 * is strictly routed through FoundationApp.
 */
describe('Legacy POC Regression Suite (Compatibility Only)', () => {
  it('gates legacy practice for free learners without creating a session', async () => {
    subscriptionService.setTier('free');
    mount('#/programas/bxm/matematicas?convocatoria=2026-c2');
    fireEvent.click(await screen.findByRole('button', { name: 'Iniciar práctica' }));
    expect(screen.getByRole('dialog', { name: 'Práctica Pro' })).toBeInTheDocument();
    expect(storageService.getActiveSession()).toBeNull();
  });

  it('opens the simulation configuration directly and restores it on reload', async () => {
    const hash = '#/programas/bxm/matematicas?convocatoria=2026-c2&seccion=simulation';
    const view = mount(hash);
    await screen.findByRole('button', { name: 'Preparar simulación' });
    expect(screen.getByRole('tab', { name: 'Simulaciones' })).toHaveAttribute('aria-selected', 'true');
    view.unmount();
    mount(hash);
    await screen.findByRole('button', { name: 'Preparar simulación' });
    expect(screen.getByRole('button', { name: 'Ensayar el examen' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('does not offer a sample as a complete simulation', async () => {
    mount('#/programas/edad/matematicas?nivel=EDAD_2&convocatoria=2026-c2&seccion=simulation');
    await screen.findByText(/No hay una simulación completa disponible/);
    expect(screen.queryByRole('button', { name: 'Iniciar muestra' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Preparar simulación' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Práctica' }));
    await screen.findByRole('button', { name: 'Iniciar muestra' });
  });
  it('does not refocus the page heading when switching subject hub tabs', async () => {
    mount('#/programas/bxm/matematicas?convocatoria=2026-c2');
    await screen.findByRole('tab', { name: 'Práctica' });
    const heading = screen.getByRole('heading', { name: 'Tu espacio de Matemáticas BXM' });
    await waitFor(() => expect(heading).toHaveFocus());
    const focusHeading = vi.spyOn(heading, 'focus');

    for (const name of ['Recursos', 'Temario Digital', 'Ruta de estudio', 'Mi progreso', 'Práctica']) {
      const tab = screen.getByRole('tab', { name });
      fireEvent.click(tab);
      await waitFor(() => expect(tab).toHaveAttribute('aria-selected', 'true'));
      expect(focusHeading).not.toHaveBeenCalled();
    }
  });

  it('finds a curriculum evidence and opens its linked lesson', async () => {
    mount('#/programas/bxm/matematicas?convocatoria=2026-c2&seccion=resources&recurso=specs');
    const search = await screen.findByRole('searchbox', { name: 'Buscar en el temario' });
    fireEvent.change(search, { target: { value: 'geometria A1.2' } });
    expect(screen.getByRole('heading', { name: 'Evidencia A1.2' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Evidencia A1.1' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Ver explicación y ejemplo de circunferencia' }));
    await screen.findByRole('heading', { name: 'Del centro y el radio a la ecuación' });
  });

  it('starts only questions in the requested difficulty tier and uses the preview count', async () => {
    subscriptionService.setTier('premium');
    mount('#/programas/bxm/matematicas?convocatoria=2026-c2');
    await screen.findByRole('button', { name: 'Iniciar práctica' });
    fireEvent.change(screen.getByLabelText('Dificultad'), { target: { value: '3' } });
    const eligible = dataService.getAllItems().filter(item => item.area_id === 'geometry' && item.difficulty_tier === 3).length;
    expect(eligible).toBeGreaterThan(0);
    const count = Math.min(10, eligible);
    expect(screen.getByRole('status')).toHaveTextContent(`${eligible} preguntas en banco. Este intento tendrá ${count}`);
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar práctica' }));
    await screen.findByRole('heading', { name: `Pregunta 1 de ${count}` });
    const attempt = storageService.getActiveSession();
    expect(attempt?.items?.every(item => item.difficulty_tier === 3)).toBe(true);
    expect(attempt?.items).toHaveLength(count);
  });

  it('starts the released I & II Ciclo exam from the public catalogue', async () => {
    mount('#/programas/i_ii_ciclo/matematicas?convocatoria=2026-c2');
    expect(await screen.findByText(/60 preguntas · Referencia gratuita/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Preparar simulación' }));
    const dialog = screen.getByRole('dialog', { name: 'Antes de comenzar' });
    expect(within(dialog).getByText(/180 minutos · Calculadora prohibida/)).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Iniciar simulación' }));
    await screen.findByRole('heading', { name: 'Pregunta 1 de 60' });
    const attempt = storageService.getActiveSession();
    expect(attempt?.items).toHaveLength(60);
    expect(attempt?.items?.every(item => item.id > 0)).toBe(true);
    expect(attempt?.config.reviewDraft).toBeUndefined();
    expect(attempt?.deadline).toBe(Date.parse(attempt?.startTime ?? '') + 180 * 60_000);
  });

  it('recovers the timed review draft and keeps its results separate from public samples', async () => {
    subscriptionService.setTier('premium');
    const review = '#/programas/i_ii_ciclo/matematicas?convocatoria=2026-c2&seccion=review';
    const view = mount(review);
    fireEvent.click(await screen.findByRole('button', { name: 'Iniciar examen de revisión' }));
    await screen.findByRole('heading', { name: 'Pregunta 1 de 60' });
    expect(screen.getByText(/Calculadora prohibida/)).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('radio')[0]);
    const testUrl = window.location.hash;
    view.unmount();
    mount(testUrl);
    await screen.findByRole('heading', { name: 'Pregunta 1 de 60' });
    expect(screen.getAllByRole('radio')[0]).toBeChecked();
    fireEvent.click(screen.getByRole('button', { name: 'Finalizar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sí, entregar' }));
    await screen.findByRole('heading', { name: /Tu resultado:/ });
    expect(screen.getByText('Medidas', { exact: true })).toBeInTheDocument();
    expect(screen.getAllByText('Números', { exact: true }).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: 'Pregunta 1, incorrecta' }));
    fireEvent.click(screen.getByRole('button', { name: 'Ver solución paso a paso' }));
    expect(screen.getByText(/Ítem original en revisión/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Volver a la vista general' }));
    fireEvent.click(screen.getByRole('button', { name: 'Pregunta 54, sin responder' }));
    expect(screen.getByRole('columnheader', { name: 'Préstamos' })).toBeInTheDocument();
    const reviewSession = JSON.parse(localStorage.getItem('mep_ea_attempts')!)[0].session;
    expect(reviewSession.deadline - Date.parse(reviewSession.startTime)).toBe(180 * 60_000);
    expect(reviewSession.passingScore).toBe(65);
    fireEvent.click(screen.getByRole('button', { name: 'Practicar 60 preguntas por reforzar' }));
    await screen.findByRole('heading', { name: 'Pregunta 1 de 60' });
    expect(screen.getByText(/Calculadora prohibida/)).toBeInTheDocument();
    cleanup();
    mount('#/programas/i_ii_ciclo/matematicas?convocatoria=2026-c2&seccion=progress');
    await screen.findByText('Aún no hay intentos en esta asignatura.');
    expect(screen.queryByRole('link', { name: 'Revisar resultado' })).not.toBeInTheDocument();
  });

  it('launches only the selected level’s sample', async () => {
    subscriptionService.setTier('premium');
    mount('#/programas/edad/matematicas?convocatoria=2026-c2&nivel=EDAD_2');
    await screen.findByRole('heading', { name: 'Muestra interactiva' });
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar muestra' }));
    await screen.findByRole('heading', { name: 'Pregunta 1 de 2' });
    expect(window.location.hash).toContain('nivel=EDAD_2');
  });

  it('filters the official calendar by convocatoria and links to the revised EDAD schedules', async () => {
    mount('#/calendario?programa=edad&convocatoria=2026-c2');
    const calendar = within(await screen.findByRole('region', { name: 'Calendario oficial de Educación Abierta' }));
    expect(calendar.getByRole('heading', { name: /Inscripción.*Prueba 1/ })).toBeInTheDocument();
    expect(calendar.getByRole('heading', { name: /Inscripción.*Prueba 2/ })).toBeInTheDocument();
    expect(calendar.getAllByRole('link', { name: 'Fuente DGEC' }).some(link =>
      link.getAttribute('href')?.includes('V.2-PRUEBA-2-CALENDARIO-CONVOC-02-2026.pdf'))).toBe(true);
    fireEvent.change(calendar.getByLabelText('Convocatoria'), { target: { value: '2026-c1' } });
    expect(calendar.queryByRole('heading', { name: /Resultados/ })).not.toBeInTheDocument();
  });

  it('restores exact active answers and reopens completed results through their URLs', async () => {
    subscriptionService.setTier('premium');
    let view = mount('#/programas/bxm/matematicas?convocatoria=2026-c2');
    fireEvent.click(await screen.findByRole('button', { name: 'Iniciar práctica' }));
    await screen.findByRole('heading', { name: 'Pregunta 1 de 10' });
    fireEvent.click(screen.getAllByRole('radio')[0]);
    const activeUrl = window.location.hash;
    expect(activeUrl).toContain('pantalla=prueba');
    view.unmount();
    view = mount(activeUrl);
    await screen.findByRole('heading', { name: 'Pregunta 1 de 10' });
    expect(screen.getAllByRole('radio')[0]).toBeChecked();
    fireEvent.click(screen.getByRole('button', { name: 'Finalizar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sí, entregar' }));
    await screen.findByRole('heading', { name: /Tu resultado:/ });
    const resultUrl = window.location.hash;
    expect(resultUrl).toContain('pantalla=resultado');
    view.unmount();
    mount(resultUrl);
    await screen.findByRole('heading', { name: /Tu resultado:/ });
    expect(JSON.parse(localStorage.getItem('mep_ea_attempts')!)).toHaveLength(1);
  });
  it('keeps onboarding optional and resumes it after browsing resources', async () => {
    mount();
    expect(screen.queryByRole('heading', { name: '¿Para qué se está preparando?' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Practicar Matemáticas BXM' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir guía y recursos' }));
    await screen.findByRole('heading', { name: 'Guía y recursos' });
    fireEvent.click(screen.getByRole('button', { name: 'Comenzar guía opcional' }));
    await screen.findByRole('heading', { name: '¿Para qué se está preparando?' });
    fireEvent.click(screen.getByRole('radio', { name: /No estoy seguro/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));
    await screen.findByRole('heading', { name: '¿A cuáles programas puede optar?' });
    fireEvent.click(screen.getByRole('button', { name: 'Ver recursos sin responder' }));
    await screen.findByRole('heading', { name: 'Guía y recursos' });
    fireEvent.click(screen.getByRole('button', { name: 'Continuar mi guía' }));
    await screen.findByRole('heading', { name: '¿A cuáles programas puede optar?' });
    fireEvent.click(screen.getByRole('button', { name: 'Omitir guía' }));
    await screen.findByRole('heading', { name: 'Programas de Educación Abierta' });
    expect(window.location.hash).toBe('#/programas');
  });

  it.each(dataService.getPrograms())('navigates entry → programs → $id → subject → program', async program => {
    mount();
    fireEvent.click(screen.getByRole('button', { name: 'Explorar programas' }));
    await screen.findByRole('heading', { name: 'Programas de Educación Abierta' });
    fireEvent.click(screen.getByRole('link', { name: new RegExp(program.name.replace(/[()]/g, '\\$&')) }));
    await screen.findByRole('heading', { name: 'Elige una asignatura' });
    const subjects = screen.getByRole('region', { name: 'Asignaturas del programa' });
    expect(within(subjects).getAllByRole('link')).toHaveLength(program.subjects.length);
    fireEvent.click(within(subjects).getByRole('link', { name: /Español/ }));
    await screen.findByRole('heading', { name: `Español · ${program.name}` });
    expect(window.location.hash).toContain(`/programas/${program.id}/espanol`);
    expect(dataService.getCurrentSubjectId()).toBe('espanol');
    expect(dataService.getAllItems()).toEqual([]);
    expect(screen.getByRole('button', { name: 'Consultar materiales oficiales' })).toBeEnabled();
    fireEvent.click(screen.getByRole('tab', { name: 'Recursos' }));
    await screen.findByRole('heading', { name: 'Materiales oficiales en PDF' });
    fireEvent.click(screen.getByRole('link', { name: 'Ver asignaturas del programa' }));
    await screen.findByRole('heading', { name: 'Elige una asignatura' });
  });

  it('restores a direct EDAD route, changes its context, and clears the module when switching to CICO', async () => {
    mount('#/programas/edad/matematicas?nivel=EDAD_2&convocatoria=2026-c1');
    await screen.findByRole('heading', { name: 'Matemáticas · EDAD' });
    expect(screen.getByLabelText('Nivel o parte')).toHaveValue('EDAD_2');
    fireEvent.change(screen.getByLabelText('Nivel o parte'), { target: { value: 'EDAD_1' } });
    await waitFor(() => expect(dataService.getCurrentSubprogramId()).toBe('EDAD_1'));
    await screen.findByRole('heading', { name: 'Matemáticas · EDAD' });
    fireEvent.click(screen.getByRole('button', { name: 'Perfil' }));
    fireEvent.change(screen.getByLabelText('Programa'), { target: { value: 'i_ii_ciclo' } });
    await screen.findByRole('heading', { name: 'Matemáticas · I y II Ciclo' });
    expect(screen.queryByLabelText('Nivel o parte')).not.toBeInTheDocument();
    expect(dataService.getCurrentSubprogramId()).toBeUndefined();
    expect(screen.getByLabelText('Convocatoria de referencia')).toHaveValue('2026-c1');
    expect(screen.getByText('Calculadora prohibida')).toBeInTheDocument();
  });

  it('keeps BXM practice functional and labels the 01-2026 review simulation', async () => {
    mount();
    fireEvent.click(screen.getByRole('button', { name: 'Practicar Matemáticas BXM' }));
    await screen.findByRole('button', { name: 'Ensayar el examen' });
    expect(dataService.getAllItems().length).toBeGreaterThan(0);
    fireEvent.change(screen.getByLabelText('Convocatoria de referencia'), { target: { value: '2026-c1' } });
    await screen.findByRole('heading', { name: 'Simulación completa' });
    expect(screen.getByRole('button', { name: 'Consultar materiales oficiales' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Practicar Matemáticas BXM' }));
    await screen.findByRole('button', { name: 'Ensayar el examen' });
    expect(dataService.getCurrentConvocatoriaId()).toBe('2026-c2');
    fireEvent.click(screen.getByRole('button', { name: 'Ensayar el examen' }));
    fireEvent.click(screen.getByRole('button', { name: 'Preparar simulación' }));
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar simulación' }));
    await screen.findByText('Pregunta 1 de 60');
    expect(screen.queryByTitle('Cambiar programa oficial MEP')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Finalizar'));
    fireEvent.click(screen.getByText('Sí, entregar'));
    await screen.findByText('Repetir estas preguntas');
    fireEvent.click(screen.getByText('Repetir estas preguntas'));
    await screen.findByText('Pregunta 1 de 60');
    fireEvent.click(screen.getByText('Finalizar'));
    fireEvent.click(screen.getByText('Sí, entregar'));
    await screen.findByText('Elegir otra práctica');
    fireEvent.click(screen.getByText('Elegir otra práctica'));
    await screen.findByRole('button', { name: 'Ensayar el examen' });
  });
});
