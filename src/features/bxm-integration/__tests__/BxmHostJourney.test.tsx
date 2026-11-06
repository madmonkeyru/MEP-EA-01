import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BxmLearningHub } from '../BxmLearningHub';
import { BxmLearningStore } from '../learningStore';
import { authoredPool, policyFor } from '../providers';
import { SessionRunner } from '../../bxm-assessment/sessionRunner';
import type { AppRoute } from '../../../services/navigation';

describe('BxmLearningHub - Sprint 3 Host Journey Integration', () => {
  const userId = 'user-test-host';

  beforeEach(() => {
    localStorage.clear();
  });

  it('renders diagnostic entry and triggers activity preflight', () => {
    const handleNavigate = vi.fn();
    const handleSimulation = vi.fn();
    const route: AppRoute = {
      view: 'learning',
      programId: 'bxm',
      subjectId: 'matematicas',
      convocatoriaId: '2026-c2',
      tab: 'diagnostic'
    };

    render(
      <BxmLearningHub
        userId={userId}
        route={route}
        onNavigate={handleNavigate}
        onOfficialSimulation={handleSimulation}
      />
    );

    expect(screen.getByRole('heading', { name: 'Recomendado para ti' })).toBeInTheDocument();
    const prepBtn = screen.getByRole('button', { name: /Iniciar evaluación diagnóstica/i });
    fireEvent.click(prepBtn);

    // Preflight dialog should appear
    expect(screen.getByText(/Antes de comenzar la actividad/i)).toBeInTheDocument();
    const startBtn = screen.getByRole('button', { name: /(Comenzar actividad|Aceptar actividad limitada)/i });
    expect(startBtn).toBeInTheDocument();
  });

  it('renders recommended next step card with lesson CTA on results view', () => {
    const handleNavigate = vi.fn();
    const store = new BxmLearningStore(userId);

    // Create a real finalized session via SessionRunner
    const item = authoredPool[0]; // geometry A1.2
    const runner = new SessionRunner({
      sessionId: 'test-session-diag',
      items: [item],
      policy: policyFor('diagnostic')
    });
    // Incorrect answer
    const wrong = item.correctAnswer === 'A' ? 'B' : 'A';
    runner.selectDraftOption(wrong);
    const result = runner.finalizeSession();
    store.complete(result);

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

    expect(screen.getByText(/Recomendado para ti/i)).toBeInTheDocument();
    expect(screen.getByText(/Continúa con Geometría/i)).toBeInTheDocument();
    const studyBtn = screen.getByRole('button', { name: /Estudiar este tema en el Temario/i });
    expect(studyBtn).toBeInTheDocument();
    fireEvent.click(studyBtn);

    expect(handleNavigate).toHaveBeenCalledWith(
      expect.objectContaining({
        tab: 'temario',
        evidenceKey: item.evidenceId
      })
    );
  });

  it('preserves active in-flight session and prompts before discarding', () => {
    const store = new BxmLearningStore(userId);
    const item = authoredPool[0];
    const runner = new SessionRunner({
      sessionId: 'session-in-flight',
      items: [item],
      policy: policyFor('diagnostic')
    });
    store.saveActive(runner);

    const handleNavigate = vi.fn();
    const route: AppRoute = {
      view: 'learning',
      programId: 'bxm',
      subjectId: 'matematicas',
      convocatoriaId: '2026-c2',
      tab: 'diagnostic'
    };

    render(
      <BxmLearningHub
        userId={userId}
        route={route}
        onNavigate={handleNavigate}
        onOfficialSimulation={vi.fn()}
      />
    );

    expect(screen.getByText(/Actividad de aprendizaje guardada/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reanudar aprendizaje/i })).toBeInTheDocument();

    const discardBtn = screen.getByRole('button', { name: /Descartar actividad/i });
    fireEvent.click(discardBtn);

    expect(screen.getByText(/¿Descartar la actividad de aprendizaje\?/i)).toBeInTheDocument();
  });
});
