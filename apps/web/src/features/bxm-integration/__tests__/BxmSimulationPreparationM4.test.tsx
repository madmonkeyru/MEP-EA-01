import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { BxmLearningHub } from '../BxmLearningHub';
import { BxmLearningStore } from '../learningStore';
import { SessionRunner } from '../../bxm-assessment/sessionRunner';
import { authoredPool, policyFor } from '../providers';
import type { AppRoute } from '../../../services/navigation';

describe('Milestone 4 (M4): Simulation Loop & Exam Preparation Readiness', () => {
  const userId = 'user-m4-simulation-test';

  beforeEach(() => {
    localStorage.clear();
  });

  describe('Official Reference Benchmark vs Formative Mock Distinct Semantics', () => {
    it('presents two clearly distinct assessment cards in the simulation tab', () => {
      const handleNavigate = vi.fn();
      const handleOfficialSimulation = vi.fn();
      const route: AppRoute = {
        view: 'learning',
        programId: 'bxm',
        subjectId: 'matematicas',
        convocatoriaId: '2026-c2',
        tab: 'simulation',
      };

      render(
        <BxmLearningHub
          userId={userId}
          route={route}
          onNavigate={handleNavigate}
          onOfficialSimulation={handleOfficialSimulation}
        />
      );

      // Verify header and distinct modes
      expect(screen.getByText('Simulación de Examen BXM')).toBeInTheDocument();
      expect(screen.getByText('Simulacro de práctica')).toBeInTheDocument();
      expect(screen.getByText('20 preguntas · 30 min')).toBeInTheDocument();
      expect(screen.getByText('Simulación de referencia')).toBeInTheDocument();
      expect(screen.getByText('60 preguntas · 150 min')).toBeInTheDocument();
    });

    it('displays pre-exam readiness briefing with factual mastery counts before official simulation launch', () => {
      const handleNavigate = vi.fn();
      const handleOfficialSimulation = vi.fn();
      const route: AppRoute = {
        view: 'learning',
        programId: 'bxm',
        subjectId: 'matematicas',
        convocatoriaId: '2026-c2',
        tab: 'simulation',
      };

      render(
        <BxmLearningHub
          userId={userId}
          route={route}
          onNavigate={handleNavigate}
          onOfficialSimulation={handleOfficialSimulation}
        />
      );

      const officialLaunchBtn = screen.getByRole('button', { name: /Iniciar Examen Oficial \(60 ítems\)/i });
      fireEvent.click(officialLaunchBtn);

      // Verify the Briefing Dialog appears with real conditions and no predictive score
      expect(screen.getByText(/Preparación para la simulación de referencia \(60 ítems\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Condiciones Reales del Examen MEP/i)).toBeInTheDocument();
      expect(screen.getByText(/150 minutos \(2 horas y media\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Estado de tu preparación actual/i)).toBeInTheDocument();
      expect(screen.getByText('Dominadas')).toBeInTheDocument();
      expect(screen.getByText('En progreso')).toBeInTheDocument();
      expect(screen.getByText('Necesitan práctica')).toBeInTheDocument();

      // Does not contain speculative predictive percent
      expect(screen.queryByText(/probabilidad de pasar/i)).not.toBeInTheDocument();

      // Confirm start simulation
      const startBtn = screen.getByRole('button', { name: /Comenzar Simulación Oficial/i });
      fireEvent.click(startBtn);
      expect(handleOfficialSimulation).toHaveBeenCalledTimes(1);
    });
  });

  describe('Formative Mock → Results → Plan de Nivelación → Targeted Remediation Loop', () => {
    it('generates Plan de Nivelación from mock exam errors and routes to lesson with simulation_weakness contextReason', () => {
      const store = new BxmLearningStore(userId);
      const geoItem = authoredPool.find(i => i.domain === 'geometry')!;

      // Complete a formative mock exam with an incorrect answer
      const wrong = geoItem.correctAnswer === 'A' ? 'B' : 'A';
      const runner = new SessionRunner({
        sessionId: 'm4-mock-results-test',
        items: [geoItem],
        policy: policyFor('mock_exam'),
      });
      runner.selectDraftOption(wrong);
      const result = runner.finalizeSession();
      store.complete(result);

      const handleNavigate = vi.fn();
      const route: AppRoute = {
        view: 'learning',
        programId: 'bxm',
        subjectId: 'matematicas',
        convocatoriaId: '2026-c2',
        tab: 'result',
        sessionId: result.sessionId,
      };

      render(
        <BxmLearningHub
          userId={userId}
          route={route}
          onNavigate={handleNavigate}
          onOfficialSimulation={vi.fn()}
        />
      );

      // Results view immediate answers: ¿Cómo me fue? → ¿Qué debo mejorar? → ¿Qué hago ahora?
      expect(screen.getByText(/Resultados del Simulacro: ¿Dónde estás y qué sigue\?/i)).toBeInTheDocument();
      expect(screen.getByText(/¿Cómo te fue\? → ¿Qué debes mejorar\? → ¿Qué haces ahora\?/i)).toBeInTheDocument();

      // Actionable Plan de Nivelación generated
      expect(screen.getByText(/Tu Plan Personalizado de Nivelación/i)).toBeInTheDocument();

      // Recommendation card connects to lesson
      const card = screen.getByTestId('canonical-recommendation-card');
      expect(card).toBeInTheDocument();

      const primaryBtn = card.querySelector('button.primary-button') as HTMLButtonElement;
      expect(primaryBtn).toBeTruthy();
      fireEvent.click(primaryBtn);

      // Verify it passed contextReason: 'simulation_weakness'
      expect(handleNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          tab: 'temario',
          contextReason: 'simulation_weakness',
        })
      );
    });
  });

  describe('Mi Preparación (Dashboard) as Decision Surface', () => {
    it('consumes canonical recommendation and presents dynamic next action in dashboard overview', () => {
      localStorage.setItem('mep_ea_subscription_tier', 'premium');
      const handleNavigate = vi.fn();
      const route: AppRoute = {
        view: 'learning',
        programId: 'bxm',
        subjectId: 'matematicas',
        convocatoriaId: '2026-c2',
        tab: 'progress',
      };

      render(
        <BxmLearningHub
          userId={userId}
          route={route}
          onNavigate={handleNavigate}
          onOfficialSimulation={vi.fn()}
        />
      );

      // Verify dashboard renders
      expect(screen.getByText('Tu preparación')).toBeInTheDocument();

      // The decision surface widget displays canonical recommendation
      const card = screen.getByTestId('canonical-recommendation-card');
      expect(card).toBeInTheDocument();

      // Initial user has no diagnostic yet
      expect(within(card).getByText(/Diagnóstico Inicial de 20 Preguntas/i)).toBeInTheDocument();
      const diagBtn = within(card).getByRole('button', { name: /Iniciar evaluación diagnóstica/i });
      expect(diagBtn).toBeInTheDocument();
    });
  });
});
