import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SpecsTable } from './SpecsTable';
import { TermsDictionary } from './TermsDictionary';
import { FormulasSheet } from './FormulasSheet';
import { ResourceLibraryPage } from './ResourceLibraryPage';

describe('Resource Library Components', () => {
  it('renders SpecsTable with blocks and point totals', () => {
    render(<SpecsTable />);
    expect(screen.getByText(/Tabla de especificaciones/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Geometría/i).length).toBeGreaterThan(0);
  });

  it('triggers onStartPracticeByItems when practice button is clicked in SpecsTable', () => {
    const handleStartPractice = vi.fn();
    render(<SpecsTable onStartPracticeByItems={handleStartPractice} />);

    const practiceButtons = screen.getAllByTitle(/Practicar todos los ítems/i);
    expect(practiceButtons.length).toBeGreaterThan(0);
    fireEvent.click(practiceButtons[0]);

    expect(handleStartPractice).toHaveBeenCalled();
  });

  it('renders TermsDictionary and filters by search query', () => {
    render(<TermsDictionary />);
    expect(screen.getByText(/Diccionario de Términos/i)).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/Buscar concepto/i);
    fireEvent.change(searchInput, { target: { value: 'Circunferencia' } });

    expect(screen.getByText(/Lugar geométrico de todos los puntos/i)).toBeInTheDocument();
  });

  it('renders FormulasSheet and toggles filter', () => {
    render(<FormulasSheet />);
    expect(screen.getByText(/Fórmulas y simbología de apoyo/i)).toBeInTheDocument();

    const geomFilterBtn = screen.getByRole('button', { name: /Geometría/i });
    fireEvent.click(geomFilterBtn);

    expect(screen.getByText(/Ecuación Ordinaria de la Circunferencia/i)).toBeInTheDocument();
  });

  it('renders ResourceLibraryPage and switches tabs', () => {
    const handleGoHome = vi.fn();
    render(<ResourceLibraryPage onGoHome={handleGoHome} />);

    expect(screen.getByText(/Biblioteca de recursos/i)).toBeInTheDocument();

    const termsTab = screen.getByRole('tab', { name: /Diccionario/i });
    fireEvent.click(termsTab);

    expect(screen.getByText(/Diccionario de términos y conceptos matemáticos/i)).toBeInTheDocument();
  });
});
