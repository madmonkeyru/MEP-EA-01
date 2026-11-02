import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { App } from './App';
import { ThemeProvider } from './context/ThemeContext';
import { dataService } from './services/dataService';

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

describe('application curriculum flows', () => {
  it('restores exact active answers and reopens completed results through their URLs', async () => {
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
    fireEvent.change(screen.getByLabelText('Programa'), { target: { value: 'cico' } });
    await screen.findByRole('heading', { name: 'Matemáticas · I y II Ciclo CICO' });
    expect(screen.queryByLabelText('Nivel o parte')).not.toBeInTheDocument();
    expect(dataService.getCurrentSubprogramId()).toBeUndefined();
    expect(screen.getByLabelText('Convocatoria de referencia')).toHaveValue('2026-c1');
    expect(screen.getByText('Calculadora prohibida')).toBeInTheDocument();
  });

  it('keeps BXM practice functional and previews an unpublished convocatoria', async () => {
    mount();
    fireEvent.click(screen.getByRole('button', { name: 'Practicar Matemáticas BXM' }));
    await screen.findByRole('button', { name: 'Ensayar el examen' });
    expect(dataService.getAllItems().length).toBeGreaterThan(0);
    fireEvent.change(screen.getByLabelText('Convocatoria de referencia'), { target: { value: '2026-c1' } });
    await screen.findByRole('heading', { name: 'Banco de preguntas en preparación' });
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

