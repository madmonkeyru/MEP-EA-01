import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DynamicMilestoneBanner } from './DynamicMilestoneBanner';
import { ProgramSchedulesOverview } from './ProgramSchedulesOverview';

describe('DynamicMilestoneBanner & ProgramSchedulesOverview', () => {
  it('renders BXM math milestones with Costa Rica timezone note and links', () => {
    render(
      <DynamicMilestoneBanner
        programId="bxm"
        convocatoriaId="2026-c2"
        subjectFilter="Matemáticas"
      />
    );

    expect(screen.getByText(/Hitos y Fechas Oficiales MEP/)).toBeInTheDocument();
    expect(screen.getByText(/Matrícula/)).toBeInTheDocument();
    expect(screen.getByText(/Sedes/)).toBeInTheDocument();
    expect(screen.getByText(/Examen Matemáticas/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Aviso DGEC/i })).toHaveAttribute('href', expect.stringContaining('pdf'));
  });

  it('renders multiprogram schedule overview comparing programs', () => {
    render(<ProgramSchedulesOverview />);

    expect(screen.getByText('Cronograma Oficial de Pruebas y Matrícula')).toBeInTheDocument();
    expect(screen.getByText(/Bachillerato por Madurez Suficiente/)).toBeInTheDocument();
    expect(screen.getByText(/Educación Diversificada a Distancia/)).toBeInTheDocument();
    expect(screen.getByText(/III Ciclo/)).toBeInTheDocument();
    expect(screen.getByText(/I y II Ciclo/)).toBeInTheDocument();
  });
});
