import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SimulationSurface } from './SimulationSurface';
import type { PlatformApi } from '@mep-ea/api';
import { EntitlementRequired } from '@mep-ea/api';
import type { Assessment } from '@mep-ea/domain';

describe('Web SimulationSurface (P6.3 & P6.4)', () => {
  const mockDiagnosticAssessment: Assessment = {
    id: 'mock-diag-id',
    blueprint: {
      id: 'p6-compiled-diagnostic:bxm:s42',
      version: '1.0.0',
      programId: 'bxm',
      subjectId: 'matematica',
      convocatoriaId: '02-2026',
      mode: 'diagnostic',
      stream: 'authored',
      totalItems: 20,
      timeLimitSeconds: 1800,
      domainQuotas: [
        { domainId: 'geometry', count: 8 },
        { domainId: 'functions', count: 8 },
        { domainId: 'statistics', count: 4 },
      ],
    },
    questions: Array.from({ length: 20 }, (_, i) => ({
      id: `q-${i + 1}`,
      version: '1.0.0',
      programId: 'bxm',
      subjectId: 'matematica',
      domainId: i < 8 ? 'geometry' : i < 16 ? 'functions' : 'statistics',
      evidenceId: `ev-${i + 1}`,
      conceptIds: [`c-${i + 1}`],
      familyId: `fam-${i + 1}`,
      cognitiveLevel: 'reproduccion',
      stream: 'authored',
      stem: `Pregunta de prueba número ${i + 1}`,
      options: [
        { id: 'A', text: 'Opción A' },
        { id: 'B', text: 'Opción B' },
        { id: 'C', text: 'Opción C' },
        { id: 'D', text: 'Opción D' },
      ],
      correctOptionId: 'A',
      requiresVisual: false,
      solution: ['Solución'],
      provenance: { source: 'test', status: 'verified' },
      publication: { status: 'published' },
    })),
  };

  const createMockApi = (overrides: Partial<PlatformApi> = {}): PlatformApi => ({
    submitAttempt: vi.fn().mockResolvedValue(undefined),
    getAttempt: vi.fn(),
    getCatalog: vi.fn(),
    getLearningContinuity: vi.fn(),
    getDraft: vi.fn(),
    saveDraft: vi.fn(),
    compileAssessment: vi.fn().mockResolvedValue(mockDiagnosticAssessment),
    register: vi.fn(),
    login: vi.fn(),
    getSession: vi.fn().mockResolvedValue({
      kind: 'authenticated',
      learnerId: 'learner-p6-test',
      tier: 'free',
      roles: ['learner'],
      accessToken: 'token',
      expiresAt: new Date(Date.now() + 3600_000).toISOString(),
    }),
    ...overrides,
  });

  it('renders 3 mode cards on initial launcher screen', () => {
    const api = createMockApi();
    render(<SimulationSurface api={api} />);

    expect(screen.getByText('Diagnóstico Curricular')).toBeDefined();
    expect(screen.getByText('Simulacro Formativo')).toBeDefined();
    expect(screen.getByText('Simulación Oficial')).toBeDefined();
  });

  it('launches a compiled diagnostic, navigates, bookmarks, and submits attempt', async () => {
    const api = createMockApi();
    const onSubmitted = vi.fn();
    render(<SimulationSurface api={api} onAttemptSubmitted={onSubmitted} />);

    // Click Iniciar diagnóstico
    const startBtn = screen.getByRole('button', { name: /Iniciar diagnóstico/i });
    fireEvent.click(startBtn);

    await waitFor(() => {
      expect(screen.getByText(/Pregunta 1 de 20/i)).toBeDefined();
    });

    // Check timer rendered
    expect(screen.getByRole('timer')).toBeDefined();

    // Answer question 1
    const optA = screen.getByText('Opción A');
    fireEvent.click(optA);

    // Bookmark question 1
    const bookmarkBtn = screen.getByRole('button', { name: /Marcar para revisión/i });
    fireEvent.click(bookmarkBtn);
    expect(screen.getByText(/Marcada para revisión/i)).toBeDefined();

    // Navigate to next question
    const nextBtn = screen.getByRole('button', { name: /Siguiente/i });
    fireEvent.click(nextBtn);
    expect(screen.getByText(/Pregunta 2 de 20/i)).toBeDefined();

    // Submit exam
    const submitBtn = screen.getByRole('button', { name: /Entregar prueba/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Prueba Entregada/i)).toBeDefined();
      expect(onSubmitted).toHaveBeenCalledTimes(1);
    });
  });

  it('shows PaywallModal when free user requests official simulation', async () => {
    const api = createMockApi({
      compileAssessment: vi.fn().mockRejectedValue(new EntitlementRequired('premium', 'Requiere Pro')),
    });
    render(<SimulationSurface api={api} />);

    const simBtn = screen.getByRole('button', { name: /Comenzar simulación/i });
    fireEvent.click(simBtn);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeDefined();
      expect(screen.getByText(/Simulación Completa de Examen MEP/i)).toBeDefined();
    });
  });
});
