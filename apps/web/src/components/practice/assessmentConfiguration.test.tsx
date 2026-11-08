import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EvaluationModulesWidget } from './EvaluationModulesWidget';
import { BxmLearningHub } from '../../features/bxm-integration/BxmLearningHub';
import { BxmLearningStore } from '../../features/bxm-integration/learningStore';
import { authoredPool, selectActivity } from '../../features/bxm-integration/providers';
import { BXM_OFFICIAL_EVIDENCES_FIXTURE as catalog } from '../../features/bxm-progress/ui/evidenceCatalogFixture';
import { dataService } from '../../services/dataService';
import { subscriptionService } from '../../services/subscriptionService';

beforeEach(async () => {
  localStorage.clear();
  subscriptionService.setTier('premium');
  await dataService.setProgram('bxm', undefined, '2026-c2', 'matematicas');
});
afterEach(() => { cleanup(); localStorage.clear(); subscriptionService.setTier('free'); });

function guided() {
  return render(<BxmLearningHub userId="ux07" route={{ view: 'learning', programId: 'bxm', subjectId: 'matematicas', convocatoriaId: '2026-c2', tab: 'practice' }} onNavigate={vi.fn()} onOfficialSimulation={vi.fn()} />);
}
function chooseGuidedPractice(count = 2) {
  const key = authoredPool.find(item => item.difficultyTier === 1 && authoredPool.filter(other => other.evidenceId === item.evidenceId && other.difficultyTier === 1).length >= 2)!.evidenceId;
  fireEvent.change(screen.getByLabelText('Habilidad'), { target: { value: key } });
  fireEvent.change(screen.getByLabelText('Dificultad de práctica'), { target: { value: '1' } });
  fireEvent.change(screen.getByLabelText('Cantidad de preguntas'), { target: { value: 'custom' } });
  fireEvent.change(screen.getByLabelText('Preguntas personalizadas'), { target: { value: String(count) } });
  return key;
}

describe('UX-07 assessment adapters', () => {
  it('legacy: starts the custom count and selected difficulty shown in the summary', () => {
    const start = vi.fn();
    render(<EvaluationModulesWidget onStartPractice={start} onStartSimulation={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Dificultad'), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText('Cantidad de preguntas'), { target: { value: 'custom' } });
    fireEvent.change(screen.getByLabelText('Preguntas personalizadas'), { target: { value: '7' } });
    const available = dataService.getAllItems().filter(item => item.area_id === 'geometry' && item.difficulty_tier === 3).length;
    expect(screen.getByRole('status')).toHaveTextContent(`Este intento tendrá ${Math.min(7, available)}`);
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar práctica' }));
    expect(start).toHaveBeenCalledWith(expect.objectContaining({ difficultyTier: 3, itemCount: Math.min(7, available) }));
  });

  it('legacy: diagnostic and reference simulation retain fixed policies after editing practice', () => {
    const start = vi.fn(), simulation = vi.fn();
    render(<EvaluationModulesWidget onStartPractice={start} onStartSimulation={simulation} />);
    fireEvent.change(screen.getByLabelText('Cantidad de preguntas'), { target: { value: '30' } });
    fireEvent.click(screen.getByRole('button', { name: 'Diagnóstico Rápido' }));
    expect(screen.queryByLabelText('Cantidad de preguntas')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar Diagnóstico (8 ítems)' }));
    expect(start).toHaveBeenCalledWith(expect.objectContaining({ mode: 'diagnostic', itemCount: 8, difficultyTier: undefined }));
    fireEvent.click(screen.getByRole('button', { name: 'Ensayar el examen' }));
    fireEvent.click(screen.getByRole('button', { name: 'Preparar simulación' }));
    const briefing = screen.getByRole('dialog', { name: 'Antes de comenzar' });
    expect(within(briefing).getByRole('status')).toHaveTextContent('60 preguntas');
    fireEvent.click(within(briefing).getByRole('button', { name: 'Cancelar' }));
    expect(simulation).not.toHaveBeenCalled();
  });

  it('guided: summary, confirmation and saved session agree on scope, difficulty and count', () => {
    guided();
    const key = chooseGuidedPractice();
    expect(screen.getByRole('status')).toHaveTextContent('2 preguntas');
    fireEvent.click(screen.getByRole('button', { name: 'Preparar práctica' }));
    let briefing = screen.getByRole('dialog', { name: 'Antes de comenzar la actividad' });
    expect(within(briefing).getByRole('status')).toHaveTextContent('2 preguntas');
    fireEvent.click(within(briefing).getByRole('button', { name: 'Cancelar' }));
    expect(screen.getByLabelText('Preguntas personalizadas')).toHaveValue(2);
    fireEvent.click(screen.getByRole('button', { name: 'Preparar práctica' }));
    briefing = screen.getByRole('dialog', { name: 'Antes de comenzar la actividad' });
    fireEvent.click(within(briefing).getByRole('button', { name: 'Comenzar actividad' }));
    const saved = new BxmLearningStore('ux07').getActive()!;
    expect(saved.items).toHaveLength(2);
    expect(saved.items.every(item => item.evidenceId === key && item.difficultyTier === 1)).toBe(true);
    expect(saved.policy.mode).toBe('study');
    expect(saved.deadline).toBeUndefined();
    expect(new BxmLearningStore('different-profile').getActive()).toBeUndefined();
  });

  it('guided: discloses inventory shortfall and requires explicit acceptance', () => {
    guided();
    chooseGuidedPractice(100);
    expect(screen.getByRole('status')).toHaveTextContent('de 100 solicitadas (ajustado)');
    fireEvent.click(screen.getByRole('button', { name: 'Preparar práctica' }));
    const briefing = screen.getByRole('dialog', { name: 'Antes de comenzar la actividad' });
    expect(within(briefing).getByText(/Cobertura limitada/)).toBeInTheDocument();
    expect(new BxmLearningStore('ux07').getActive()).toBeUndefined();
    fireEvent.click(within(briefing).getByRole('button', { name: 'Aceptar actividad limitada' }));
    const saved = new BxmLearningStore('ux07').getActive()!;
    expect(saved.items.length).toBeGreaterThan(0);
    expect(saved.items.length).toBeLessThan(100);
  });

  it('guided: rechecks capabilities when confirming a prepared activity', () => {
    guided(); chooseGuidedPractice();
    fireEvent.click(screen.getByRole('button', { name: 'Preparar práctica' }));
    act(() => subscriptionService.setTier('free'));
    fireEvent.click(screen.getByRole('button', { name: 'Comenzar actividad' }));
    expect(screen.getByRole('dialog', { name: /Función de Preparación Pro/ })).toBeInTheDocument();
    expect(new BxmLearningStore('ux07').getActive()).toBeUndefined();
  });

  it('guided: validates custom counts without changing diagnostic and retest blueprints', () => {
    const key = authoredPool[0].evidenceId;
    expect(() => selectActivity({ kind: 'evidence_practice', evidenceKey: key, itemCount: -1 }, 1)).toThrow(RangeError);
    expect(() => selectActivity({ kind: 'evidence_practice', evidenceKey: key, itemCount: 1.5 }, 1)).toThrow(RangeError);
    expect(selectActivity({ kind: 'diagnostic', itemCount: 1 }, 1).totalRequested).toBe(20);
    expect(selectActivity({ kind: 'retest', evidenceKey: key, itemCount: 1 }, 1).totalRequested).toBe(5);
  });

  it('guided: explains an empty selection and prevents starting an empty session', () => {
    guided();
    const key = catalog.find(evidence => !authoredPool.some(item => item.evidenceId === evidence.key && item.difficultyTier === 3))!.key;
    fireEvent.change(screen.getByLabelText('Habilidad'), { target: { value: key } });
    fireEvent.change(screen.getByLabelText('Dificultad de práctica'), { target: { value: '3' } });
    expect(screen.getByText('No hay preguntas disponibles. Cambia el alcance o la dificultad.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Preparar práctica' })).toBeDisabled();
    expect(new BxmLearningStore('ux07').getActive()).toBeUndefined();
  });
});
