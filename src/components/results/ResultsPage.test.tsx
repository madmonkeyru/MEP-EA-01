import { StrictMode } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { TestSession } from '../../types';
import { ResultsPage } from './ResultsPage';
import { createSession } from '../../services/learningSession';
import { storageService } from '../../services/storageService';
afterEach(() => { cleanup(); localStorage.clear(); });
describe('results and durable review', () => {
  it('renders Plan de Nivelación and Telemetry Dashboard when session is in diagnostic mode', () => {
    const session: TestSession = {
      ...createSession({ mode: 'diagnostic', itemCount: 2, enableTimer: false, timerDurationMinutes: 0 }),
      isCompleted: true,
      responses: {
        1: { itemId: 1, selectedOption: 'B', timeSpentSeconds: 30 },
      },
    };

    render(
      <ResultsPage
        session={session}
        onRetry={vi.fn()}
        onNewTest={vi.fn()}
        onGoHome={vi.fn()}
      />
    );

    expect(screen.getByText(/Tu Plan Personalizado de Nivelación/i)).toBeInTheDocument();
    expect(screen.getByText(/Métricas de Trayectoria del Estudiante/i)).toBeInTheDocument();
    expect(screen.getByText(/Embudo de Nivelación y Diagnóstico/i)).toBeInTheDocument();
  });

  it('separates unanswered from incorrect and saves a result only once under StrictMode', () => {
    const session = { ...createSession({ mode: 'simulation', itemCount: 2, enableTimer: false, timerDurationMinutes: 30 }), isCompleted: true };
    session.responses[session.itemIds[0]] = { itemId: session.itemIds[0], selectedOption: session.items![0].correct_answer };
    render(<StrictMode><ResultsPage session={session} onRetry={vi.fn()} onNewTest={vi.fn()} onGoHome={vi.fn()} /></StrictMode>);
    expect(screen.getByRole('heading', { name: 'Tu resultado: 50%' })).toBeInTheDocument();
    expect(screen.getByText(/1 Correctas · 0 Incorrectas · 1 Sin responder/)).toBeInTheDocument();
    expect(storageService.getAttempts()).toHaveLength(1);
    expect(storageService.getResult(session.sessionId)?.items).toHaveLength(2);
    fireEvent.change(screen.getByLabelText('Filtrar revisión'), { target: { value: 'pending' } });
    fireEvent.click(screen.getByRole('button', { name: /Pregunta 2, sin responder/ }));
    expect(screen.getByText('Pregunta 2 de 2')).toBeInTheDocument();
    expect(screen.queryByText('Explicación de apoyo')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Ver solución paso a paso' }));
    expect(screen.getByText('Explicación de apoyo')).toBeInTheDocument();
  });
  it('does not expose another local profile result or mix contextual history', () => {
    const session = { ...createSession({ mode: 'area', programId: 'bxm', subjectId: 'matematicas', itemCount: 1, enableTimer: false, timerDurationMinutes: 30 }), userId: 'other', isCompleted: true };
    storageService.saveResult(session);
    expect(storageService.getResult(session.sessionId, 'guest')).toBeNull();
    expect(storageService.getContextAttempts({ programId: 'bxm' }, 'guest')).toHaveLength(0);
  });
});
