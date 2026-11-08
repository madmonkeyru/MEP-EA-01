import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DigitalTemarioView } from './DigitalTemarioView';
import { subscriptionService } from '../../services/subscriptionService';

describe('DigitalTemarioView', () => {
  beforeEach(() => {
    subscriptionService.setTier('free');
  });

  it('renders lessons across official domains and filters by area', () => {
    render(<DigitalTemarioView onStartQuiz={vi.fn()} />);

    expect(screen.getByText(/Temario Digital Interactivo · BXM Matemáticas/)).toBeInTheDocument();
    expect(screen.getByText('Ecuación de la Circunferencia')).toBeInTheDocument();

    // Filter by Álgebra
    fireEvent.click(screen.getByRole('button', { name: 'Álgebra' }));
    expect(screen.getByText('Función Inversa y Criterio Algebraico')).toBeInTheDocument();
    expect(screen.queryByText('Ecuación de la Circunferencia')).not.toBeInTheDocument();
  });

  it('allows starting free preview micro-quiz', () => {
    const onStartQuiz = vi.fn();
    render(<DigitalTemarioView onStartQuiz={onStartQuiz} />);

    // First lesson (Circunferencia) is preview: true
    const startQuizBtn = screen.getByRole('button', { name: /Iniciar Micro-Quiz de Comprobación/i });
    fireEvent.click(startQuizBtn);

    expect(onStartQuiz).toHaveBeenCalledWith(expect.objectContaining({
      mode: 'area',
      title: 'Comprobación: Ecuación de la Circunferencia',
    }));
  });

  it('gates locked premium lessons and presents upgrade paywall for free users', () => {
    const onStartQuiz = vi.fn();
    render(<DigitalTemarioView onStartQuiz={onStartQuiz} />);

    // Click on locked lesson (Rectas Secantes)
    const lockedLessonTrigger = screen.getByRole('button', { name: /Rectas Secantes, Tangentes y Exteriores/i });
    fireEvent.click(lockedLessonTrigger);

    const unlockBtn = screen.getByRole('button', { name: /Desbloquear Quiz con Plan Pro/i });
    fireEvent.click(unlockBtn);

    // Paywall modal opens
    expect(screen.getByRole('dialog', { name: /Lección: Rectas Secantes, Tangentes y Exteriores/i })).toBeInTheDocument();
    expect(onStartQuiz).not.toHaveBeenCalled();
  });
});
