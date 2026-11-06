import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BxmLearningHub } from '../BxmLearningHub';
import { BxmLearningStore } from '../learningStore';
import { authoredPool, policyFor } from '../providers';
import { SessionRunner } from '../../bxm-assessment/sessionRunner';
import type { AppRoute } from '../../../services/navigation';

describe('BxmLearningHub - Sprint 4 Simulation Loop Integration', () => {
  const userId = 'user-test-sim';

  beforeEach(() => {
    localStorage.clear();
  });

  it('renders simulation tab with both Formativo de Autor and Oficial de Referencia options', () => {
    const handleNavigate = vi.fn();
    const handleSimulation = vi.fn();
    const route: AppRoute = {
      view: 'learning',
      programId: 'bxm',
      subjectId: 'matematicas',
      convocatoriaId: '2026-c2',
      tab: 'simulation'
    };

    render(
      <BxmLearningHub
        userId={userId}
        route={route}
        onNavigate={handleNavigate}
        onOfficialSimulation={handleSimulation}
      />
    );

    expect(screen.getByText('Simulación de Examen BXM')).toBeInTheDocument();
    expect(screen.getByText('Simulacro Formativo de Autor')).toBeInTheDocument();
    expect(screen.getByText('Examen Oficial de Referencia')).toBeInTheDocument();

    const officialBtn = screen.getByRole('button', { name: /Iniciar Examen Oficial/i });
    fireEvent.click(officialBtn);
    // Opens briefing dialog
    expect(screen.getByText(/Preparación para el Examen Oficial de Referencia/i)).toBeInTheDocument();
    const startOfficialBtn = screen.getByRole('button', { name: /Comenzar Simulación Oficial/i });
    fireEvent.click(startOfficialBtn);
    expect(handleSimulation).toHaveBeenCalledTimes(1);
  });

  it('renders Plan de Nivelación after completing a mock exam with weak areas', () => {
    const store = new BxmLearningStore(userId);
    const item = authoredPool[0]; // Geometry A1.2
    const runner = new SessionRunner({
      sessionId: 'test-session-mock',
      items: [item],
      policy: policyFor('mock_exam')
    });
    // Record incorrect response
    const wrong = item.correctAnswer === 'A' ? 'B' : 'A';
    runner.selectDraftOption(wrong);
    const result = runner.finalizeSession();
    store.complete(result);

    const handleNavigate = vi.fn();
    const route: AppRoute = {
      view: 'learning',
      programId: 'bxm',
      subjectId: 'matematicas',
      convocatoriaId: '2026-c2',
      tab: 'result',
      sessionId: result.sessionId
    };

    render(
      <BxmLearningHub
        userId={userId}
        route={route}
        onNavigate={handleNavigate}
        onOfficialSimulation={vi.fn()}
      />
    );

    expect(screen.getByText(/Tu Plan Personalizado de Nivelación/i)).toBeInTheDocument();
    expect(screen.getByText(/Ruta de Refuerzo Prioritaria/i)).toBeInTheDocument();
    expect(screen.getByText(/Plan de Nivelación/i)).toBeInTheDocument();
  });

  it('renders Retest Recovery and Mastery Update Card after a successful retest', () => {
    const store = new BxmLearningStore(userId);
    const item = authoredPool[0];
    const runner = new SessionRunner({
      sessionId: 'test-session-retest',
      items: [item],
      policy: policyFor('retest')
    });
    // Record correct response
    runner.selectDraftOption(item.correctAnswer);
    const result = runner.finalizeSession();
    store.complete(result);

    const handleNavigate = vi.fn();
    const route: AppRoute = {
      view: 'learning',
      programId: 'bxm',
      subjectId: 'matematicas',
      convocatoriaId: '2026-c2',
      tab: 'result',
      sessionId: result.sessionId
    };

    render(
      <BxmLearningHub
        userId={userId}
        route={route}
        onNavigate={handleNavigate}
        onOfficialSimulation={vi.fn()}
      />
    );

    expect(screen.getByText(/Resultado del Retest · Recuperación de Evidencia/i)).toBeInTheDocument();
    expect(screen.getByText(/¡Evidencia Recuperada con Éxito!/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ver mi preparación actualizada/i })).toBeInTheDocument();
  });
});
