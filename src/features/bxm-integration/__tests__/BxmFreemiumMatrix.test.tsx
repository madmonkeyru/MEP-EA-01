import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BxmLearningHub } from '../BxmLearningHub';
import { subscriptionService } from '../../../services/subscriptionService';
import { createCapabilityProvider } from '../../bxm-progress/capabilities/capabilityModel';
import type { AppRoute } from '../../../services/navigation';

describe('BxmLearningHub - Sprint 5 Freemium Matrix', () => {
  const userId = 'user-freemium-test';

  beforeEach(() => {
    localStorage.clear();
    subscriptionService.setTier('free');
  });

  it('golden rule: missing or corrupted tier resolves strictly to free capabilities', () => {
    const unknownProvider = createCapabilityProvider(undefined as any);
    expect(unknownProvider.getTier()).toBe('free');
    expect(unknownProvider.canAccess('official_reference_benchmark')).toBe(true);
    expect(unknownProvider.canAccess('initial_diagnostic_and_basic_results')).toBe(true);
    expect(unknownProvider.canAccess('sample_complete_lesson_per_domain')).toBe(true);
    expect(unknownProvider.canAccess('isomorphic_practice_drills')).toBe(false);
    expect(unknownProvider.canAccess('configurable_mock_sessions')).toBe(false);
    expect(unknownProvider.canAccess('longitudinal_mastery_dashboard')).toBe(false);

    const corruptProvider = createCapabilityProvider('corrupted_tier_value' as any);
    expect(corruptProvider.getTier()).toBe('free');
    expect(corruptProvider.canAccess('isomorphic_practice_drills')).toBe(false);
  });

  it('allows free access to diagnostic and official simulation without paywall', () => {
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

    // Official simulation button
    const officialBtn = screen.getByRole('button', { name: /Examen oficial de referencia/i });
    fireEvent.click(officialBtn);
    expect(handleSimulation).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/Planes de Estudio Pro/i)).not.toBeInTheDocument();

    // Diagnostic preparation button
    const diagBtn = screen.getByRole('button', { name: /Preparar diagnóstico/i });
    fireEvent.click(diagBtn);
    expect(screen.getByText(/Antes de comenzar la actividad/i)).toBeInTheDocument();
  });

  it('opens PaywallModal when a free user attempts to launch isomorphic practice variants', () => {
    const route: AppRoute = {
      view: 'learning',
      programId: 'bxm',
      subjectId: 'matematicas',
      convocatoriaId: '2026-c2',
      tab: 'practice'
    };

    render(
      <BxmLearningHub
        userId={userId}
        route={route}
        onNavigate={vi.fn()}
        onOfficialSimulation={vi.fn()}
      />
    );

    const variantBtn = screen.getByRole('button', { name: /Practicar variantes/i });
    fireEvent.click(variantBtn);

    // Paywall modal dialog should open
    expect(screen.getByRole('dialog', { name: /Función de Preparación Pro/i })).toBeInTheDocument();
  });

  it('opens PaywallModal when a free user attempts to launch formative mock exam from simulation tab', () => {
    const route: AppRoute = {
      view: 'learning',
      programId: 'bxm',
      subjectId: 'matematicas',
      convocatoriaId: '2026-c2',
      tab: 'simulation'
    };

    render(
      <BxmLearningHub
        userId={userId}
        route={route}
        onNavigate={vi.fn()}
        onOfficialSimulation={vi.fn()}
      />
    );

    const mockBtn = screen.getByRole('button', { name: /Iniciar Simulacro Formativo/i });
    fireEvent.click(mockBtn);

    // Paywall modal should open
    expect(screen.getByRole('dialog', { name: /Función de Preparación Pro/i })).toBeInTheDocument();
  });

  it('allows premium user full access to mock exam preflight and isomorphic variants without paywall', () => {
    subscriptionService.setTier('premium');

    const route: AppRoute = {
      view: 'learning',
      programId: 'bxm',
      subjectId: 'matematicas',
      convocatoriaId: '2026-c2',
      tab: 'simulation'
    };

    render(
      <BxmLearningHub
        userId={userId}
        route={route}
        onNavigate={vi.fn()}
        onOfficialSimulation={vi.fn()}
      />
    );

    const mockBtn = screen.getByRole('button', { name: /Iniciar Simulacro Formativo/i });
    fireEvent.click(mockBtn);

    // No paywall, goes directly to preflight dialog
    expect(screen.queryByRole('dialog', { name: /Función de Preparación Pro/i })).not.toBeInTheDocument();
    expect(screen.getByText(/Antes de comenzar la actividad/i)).toBeInTheDocument();
  });
});
