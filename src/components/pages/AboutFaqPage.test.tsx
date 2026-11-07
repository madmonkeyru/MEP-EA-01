import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AboutFaqPage } from './AboutFaqPage';

describe('AboutFaqPage', () => {
  it('renders the platform hero, mission statement and legal disclaimer', () => {
    render(<AboutFaqPage />);
    expect(screen.getByRole('heading', { level: 1, name: /Acerca de MEP-EA-01 y Preguntas Frecuentes/i })).toBeInTheDocument();
    expect(screen.getByText(/Alineación Curricular Oficial 02-2026/i)).toBeInTheDocument();
    expect(screen.getByText(/Deslinde de Responsabilidad e Independencia Institucional/i)).toBeInTheDocument();
  });

  it('renders the 4 official open education programs with their rules', () => {
    render(<AboutFaqPage />);
    expect(screen.getByText(/Bachillerato por Madurez Suficiente \(BXM\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Educación Diversificada a Distancia \(EDAD\)/i)).toBeInTheDocument();
    expect(screen.getByText(/III Ciclo de la Educación General Básica \(EGBA\)/i)).toBeInTheDocument();
    expect(screen.getByText(/I y II Ciclo de la EGB Abierta \(CICO\)/i)).toBeInTheDocument();
  });

  it('filters questions by keyword search', () => {
    render(<AboutFaqPage />);
    const searchInput = screen.getByRole('searchbox', { name: /Buscar en preguntas frecuentes/i });

    // Initial item count check
    expect(screen.getByText(/¿Se permite el uso de calculadora en los exámenes de Matemáticas\?/i)).toBeInTheDocument();

    // Search for "calculadora"
    fireEvent.change(searchInput, { target: { value: 'calculadora' } });
    expect(screen.getByText(/¿Se permite el uso de calculadora en los exámenes de Matemáticas\?/i)).toBeInTheDocument();

    // Questions not matching shouldn't be visible
    expect(screen.queryByText(/Si cursé estudios en el extranjero/i)).not.toBeInTheDocument();

    // Clear search
    const clearButton = screen.getByRole('button', { name: /Borrar búsqueda/i });
    fireEvent.click(clearButton);
    expect(screen.getByText(/Si cursé estudios en el extranjero/i)).toBeInTheDocument();
  });

  it('filters questions by category tabs', () => {
    render(<AboutFaqPage />);
    const rulesTab = screen.getByRole('tab', { name: 'Reglas de Examen' });
    fireEvent.click(rulesTab);

    expect(screen.getByText(/¿Cuál es la nota mínima para aprobar un examen\?/i)).toBeInTheDocument();
    expect(screen.queryByText(/¿Qué es MEP-EA-01 y cuál es su objetivo\?/i)).not.toBeInTheDocument();
  });

  it('toggles accordion items and expands/collapses all', () => {
    render(<AboutFaqPage />);
    const questionButton = screen.getByRole('button', { name: /¿Qué es MEP-EA-01 y cuál es su objetivo\?/i });
    const answerPanel = document.getElementById(questionButton.getAttribute('aria-controls')!);

    // Initially collapsed
    expect(questionButton).toHaveAttribute('aria-expanded', 'false');
    expect(answerPanel).toHaveAttribute('hidden');

    // Click to expand
    fireEvent.click(questionButton);
    expect(questionButton).toHaveAttribute('aria-expanded', 'true');
    expect(answerPanel).not.toHaveAttribute('hidden');
    expect(screen.getByText(/MEP-EA-01 es una plataforma web independiente/i)).toBeInTheDocument();

    // Click "Colapsar"
    fireEvent.click(screen.getByRole('button', { name: 'Colapsar' }));
    expect(questionButton).toHaveAttribute('aria-expanded', 'false');

    // Click "Expandir todo"
    fireEvent.click(screen.getByRole('button', { name: 'Expandir todo' }));
    expect(questionButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('shows an empty state when search query matches nothing', () => {
    render(<AboutFaqPage />);
    const searchInput = screen.getByRole('searchbox', { name: /Buscar en preguntas frecuentes/i });
    fireEvent.change(searchInput, { target: { value: 'palabrainexistentexyz123' } });

    expect(screen.getByText(/No se encontraron preguntas coincidentes/i)).toBeInTheDocument();

    const resetButton = screen.getByRole('button', { name: /Restablecer filtros/i });
    fireEvent.click(resetButton);
    expect(screen.getByText(/¿Qué es MEP-EA-01 y cuál es su objetivo\?/i)).toBeInTheDocument();
  });

  it('handles navigation via onNavigate callback when provided', () => {
    const onNavigateMock = vi.fn();
    render(<AboutFaqPage onNavigate={onNavigateMock} />);

    // Expand the specs question
    const specsQuestion = screen.getByRole('button', { name: /¿Las preguntas del simulador coinciden con las de la prueba real\?/i });
    fireEvent.click(specsQuestion);

    const internalLink = screen.getByRole('link', { name: /Consultar Tabla de Especificaciones BXM/i });
    fireEvent.click(internalLink);

    expect(onNavigateMock).toHaveBeenCalledWith(expect.objectContaining({
      view: 'hub',
      programId: 'bxm',
      subjectId: 'matematicas',
      resourceTab: 'specs',
    }));
  });
});
