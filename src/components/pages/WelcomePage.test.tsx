import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WelcomePage } from './WelcomePage';

describe('WelcomePage', () => {
  it('renders hero banner, quick MVP access, program cards, and regulations', () => {
    const onSelectProgram = vi.fn();
    const onEnterMvpMath = vi.fn();

    render(
      <WelcomePage
        onSelectProgram={onSelectProgram}
        onEnterMvpMath={onEnterMvpMath}
      />
    );

    // Hero title
    expect(
      screen.getByText('Encuentra tu programa de estudio')
    ).toBeInTheDocument();

    // Prominent quick entry card for MVP
    expect(
      screen.getByText('Matemáticas BXM (Convocatoria 02-2026)')
    ).toBeInTheDocument();

    const enterMvpButton = screen.getByRole('button', {
      name: /^Practicar$/i,
    });
    expect(enterMvpButton).toBeInTheDocument();
    fireEvent.click(enterMvpButton);
    expect(onEnterMvpMath).toHaveBeenCalledTimes(1);

    // Programs overview
    expect(screen.getByText('Programas de Educación Abierta')).toBeInTheDocument();
    expect(screen.getAllByText(/Bachillerato por Madurez Suficiente/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Bachillerato a distancia/i)).toBeInTheDocument();

    // Informational regulations banner
    expect(
      screen.getByText('Estructura y reglas de referencia curricular')
    ).toBeInTheDocument();
    expect(screen.getByText('Notas de Aprobación')).toBeInTheDocument();
    expect(screen.getByText('Directriz de Calculadoras')).toBeInTheDocument();
  });

  it('triggers onSelectProgram when a program card is clicked', () => {
    const onSelectProgram = vi.fn();
    const onEnterMvpMath = vi.fn();

    render(
      <WelcomePage
        onSelectProgram={onSelectProgram}
        onEnterMvpMath={onEnterMvpMath}
      />
    );

    const edadCard = screen.getByText(/Bachillerato a distancia/i).closest('a');
    expect(edadCard).toBeInTheDocument();

    if (edadCard) {
      fireEvent.click(edadCard);
      expect(onSelectProgram).toHaveBeenCalledWith('edad');
    }
  });

  it('keeps program cards free of repeated acronym and goal labels', () => {
    render(
      <WelcomePage
        onSelectProgram={vi.fn()}
        onEnterMvpMath={vi.fn()}
      />
    );

    const carousel = within(screen.getByRole('region', { name: 'Programas disponibles' }));
    const bxmCard = carousel.getByRole('link', { name: /Bachillerato por Madurez Suficiente/ });

    expect(within(bxmCard).getByRole('heading', { name: 'Bachillerato por Madurez Suficiente (BXM)' })).toBeInTheDocument();
    expect(within(bxmCard).queryByText('BXM', { exact: true })).not.toBeInTheDocument();
    expect(within(bxmCard).getByText('Una prueba por asignatura.')).toBeInTheDocument();
    expect(carousel.queryByText(/^Meta:/)).not.toBeInTheDocument();
    expect(carousel.queryByText('PDF y estructura')).not.toBeInTheDocument();
  });
});
