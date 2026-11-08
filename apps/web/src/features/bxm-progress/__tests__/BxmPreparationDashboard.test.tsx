import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { BxmPreparationDashboard } from '../ui/BxmPreparationDashboard';
import { createCapabilityProvider } from '../capabilities/capabilityModel';
import type { AttemptEvent } from '../domain/types';

describe('BXM Progress - BxmPreparationDashboard UI Component', () => {
  const refDate = new Date('2026-03-15T12:00:00Z');

  function makeEvent(overrides: Partial<AttemptEvent> = {}): AttemptEvent {
    return {
      schemaVersion: '1.0.0',
      eventId: `ev-${Math.random().toString(36).substring(2, 9)}`,
      sessionId: 'sess-1',
      sessionKind: 'practice_evidence',
      mode: 'study',
      timestamp: '2026-03-14T10:00:00Z',
      itemId: 'item-1',
      familyId: 'family-1',
      primaryEvidenceKey: 'bxm/matematica/02-2026/geometry/A1.1',
      domain: 'geometry',
      provenance: 'authored_mastery',
      cognitiveLevel: 'reproduccion',
      difficulty: 1,
      selectedOption: overrides.isCorrect === false ? 'B' : 'A',
      correctAnswer: 'A',
      isCorrect: true,
      responseIndex: 0,
      hintsUsedBeforeResponse: 0,
      reviewStatus: 'computationally_checked',
      exposureFlags: { isBenchmarkItem: false, hasSeenExplanationBefore: false },
      ...overrides,
    };
  }

  it('renders clean empty state with mandatory disclaimer and zero values', () => {
    render(<BxmPreparationDashboard events={[]} referenceDateUtc={refDate} capabilityProvider={createCapabilityProvider('premium')} />);

    expect(screen.getByText('Tu preparación')).toBeDefined();
    expect(
      screen.getByText(/Indicador formativo interno de avance; no constituye una predicción ni garantía/)
    ).toBeDefined();
    expect(screen.getAllByText('0%').length).toBeGreaterThan(0);
    expect(screen.getByText('0 / 71')).toBeDefined();
  });

  it('renders populated metrics and tab navigation', () => {
    const events: AttemptEvent[] = [];
    for (let i = 1; i <= 5; i++) {
      events.push(makeEvent({ familyId: `fam-${i}`, isCorrect: true }));
    }

    render(
      <BxmPreparationDashboard
        events={events}
        referenceDateUtc={refDate}
        capabilityProvider={createCapabilityProvider('premium')}
      />
    );

    // Precisión observada 100% appears in stat cards
    expect(screen.getAllByText('100%').length).toBeGreaterThan(0);

    // Switch to Evidences tab
    const evidencesTab = screen.getByRole('button', { name: /Dominio por Evidencia/i });
    fireEvent.click(evidencesTab);

    // A1.1 appears across domains (geometry, functions, statistics) in fixture
    expect(screen.getByRole('columnheader', { name: 'Habilidad' })).toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'Código' })).not.toBeInTheDocument();
    expect(screen.getByText('Dominado')).toBeDefined();
  });

  it('shows gating prompt when accessed by Free tier user', () => {
    const onUpgradeMock = vi.fn();

    render(
      <BxmPreparationDashboard
        events={[]}
        referenceDateUtc={refDate}
        capabilityProvider={createCapabilityProvider('free')}
        onOpenUpgradeModal={onUpgradeMock}
      />
    );

    expect(screen.getByText('Seguimiento detallado con Pro')).toBeDefined();
    const upgradeBtns = screen.getAllByRole('button', { name: /Desbloquear Premium|Ver Planes de Suscripción/i });
    fireEvent.click(upgradeBtns[0]);
    expect(onUpgradeMock).toHaveBeenCalled();
  });
});
