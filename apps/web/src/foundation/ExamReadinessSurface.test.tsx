import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExamReadinessSurface } from './ExamReadinessSurface';
import type { LongitudinalMetricsResponse } from '@mep-ea/api';

describe('P13 ExamReadinessSurface Composite Experience (Web)', () => {
  const dummyMetrics: LongitudinalMetricsResponse['metrics'] = {
    learnerId: 'test_learner',
    evaluatedAt: new Date().toISOString(),
    totalAttempts: 3,
    firstAttemptAt: null,
    lastAttemptAt: null,
    loopCounts: { diagnostic: 1, practice: 1, mock: 1, simulation: 0 },
    overallAccuracy: 65,
    domainCoverage: {
      geometria: { total: 10, correct: 7, distinctFamilies: 3 },
      funciones: { total: 10, correct: 6, distinctFamilies: 2 },
    },
    habits: { averageDurationSeconds: 120, unansweredRate: 0.05, totalQuestionsEncountered: 20 },
    loopStage: 'remediation_in_progress',
  };

  it('renders readiness score, stage badge and thematic breakdown', () => {
    const handleDiagnostic = vi.fn();
    const handlePractice = vi.fn();
    const handleSimulation = vi.fn();

    render(
      <ExamReadinessSurface
        metrics={dummyMetrics}
        priorityWeakness={{ evidenceKey: 'Circunferencia' }}
        onNavigateToDiagnostic={handleDiagnostic}
        onNavigateToPractice={handlePractice}
        onNavigateToSimulation={handleSimulation}
      />
    );

    expect(screen.getByText('Centro de Preparación para el Examen')).toBeDefined();
    expect(screen.getByText('Listo para Simulación')).toBeDefined();
    expect(screen.getByText('65%')).toBeDefined();
    expect(screen.getByText('Geometria')).toBeDefined();
    expect(screen.getByText('Funciones')).toBeDefined();

    // Click CTA
    const ctaButton = screen.getByRole('button', { name: /Iniciar Simulación de Examen/i });
    fireEvent.click(ctaButton);
    expect(handleSimulation).toHaveBeenCalledTimes(1);
  });
});
