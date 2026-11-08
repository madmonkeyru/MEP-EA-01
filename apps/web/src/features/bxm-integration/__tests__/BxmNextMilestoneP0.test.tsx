import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BxmLearningHub } from '../BxmLearningHub';
import { BxmLearningStore } from '../learningStore';
import { authoredPool, policyFor } from '../providers';
import { SessionRunner } from '../../bxm-assessment/sessionRunner';
import type { AppRoute } from '../../../services/navigation';

describe('BxmLearningHub - Next Milestone P0 UX Improvements', () => {
  const userId = 'user-p0-ux-test';

  beforeEach(() => {
    localStorage.clear();
  });

  it('renders 4 learner-intent pillars in primary navigation: Inicio, Aprender, Practicar, Simular', () => {
    const handleNavigate = vi.fn();
    const route: AppRoute = {
      view: 'learning',
      programId: 'bxm',
      subjectId: 'matematicas',
      convocatoriaId: '2026-c2',
      tab: 'diagnostic',
    };

    render(
      <BxmLearningHub
        userId={userId}
        route={route}
        onNavigate={handleNavigate}
        onOfficialSimulation={vi.fn()}
      />
    );

    const nav = screen.getByRole('navigation', { name: /Aprendizaje BXM/i });
    expect(nav).toBeInTheDocument();

    const inicioBtn = screen.getByRole('button', { name: /^Inicio$/i });
    const aprenderBtn = screen.getByRole('button', { name: /^Aprender$/i });
    const practicarBtn = screen.getByRole('button', { name: /^Practicar$/i });
    const simularBtn = screen.getByRole('button', { name: /^Simular$/i });
    const prepBtn = screen.getByRole('button', { name: /Mi preparación/i });

    expect(inicioBtn).toBeInTheDocument();
    expect(aprenderBtn).toBeInTheDocument();
    expect(practicarBtn).toBeInTheDocument();
    expect(simularBtn).toBeInTheDocument();
    expect(prepBtn).toBeInTheDocument();

    // Clicking 'Aprender' navigates to temario
    fireEvent.click(aprenderBtn);
    expect(handleNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ tab: 'temario' })
    );

    // Clicking 'Practicar' navigates to practice
    fireEvent.click(practicarBtn);
    expect(handleNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ tab: 'practice' })
    );

    // Clicking 'Simular' navigates to simulation
    fireEvent.click(simularBtn);
    expect(handleNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ tab: 'simulation' })
    );
  });

  it('displays study session time options (15 min, 30 min, 45-60 min) on Inicio dashboard', () => {
    const route: AppRoute = {
      view: 'learning',
      programId: 'bxm',
      subjectId: 'matematicas',
      convocatoriaId: '2026-c2',
      tab: 'diagnostic',
    };

    render(
      <BxmLearningHub
        userId={userId}
        route={route}
        onNavigate={vi.fn()}
        onOfficialSimulation={vi.fn()}
      />
    );

    expect(screen.getByText('¿Cuánto tiempo tienes para estudiar hoy?')).toBeInTheDocument();
    expect(screen.getByText('15 min')).toBeInTheDocument();
    expect(screen.getByText('30 min')).toBeInTheDocument();
    expect(screen.getByText('45-60 min')).toBeInTheDocument();
  });

  it('results launchpad categorizes mastered vs reinforcement skills in student language', () => {
    const store = new BxmLearningStore(userId);
    const item = authoredPool[0]; // Geometry item
    const runner = new SessionRunner({
      sessionId: 'diag-session-categorize',
      items: [item],
      policy: policyFor('diagnostic'),
    });

    // Make an incorrect answer to test 'Necesitas reforzar'
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
      sessionId: result.sessionId,
    };

    render(
      <BxmLearningHub
        userId={userId}
        route={route}
        onNavigate={vi.fn()}
        onOfficialSimulation={vi.fn()}
      />
    );

    expect(screen.getByText(/Tu diagnóstico: ¿dónde estás y qué sigue\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Fortalezas en este intento/i)).toBeInTheDocument();
    expect(screen.getByText(/Necesitas reforzar/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Recomendado para ti' })).toBeInTheDocument();
  });
});
