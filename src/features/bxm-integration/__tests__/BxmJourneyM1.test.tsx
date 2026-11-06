import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BxmLearningHub } from '../BxmLearningHub';
import { BxmLearningStore } from '../learningStore';
import { authoredPool, policyFor } from '../providers';
import { SessionRunner } from '../../bxm-assessment/sessionRunner';
import { deriveCanonicalRecommendation } from '../../bxm-progress/recommendations/recommendationsEngine';
import type { EvidenceMasteryRecord } from '../../bxm-progress/domain/masteryEngine';
import type { AppRoute } from '../../../services/navigation';

describe('M1 - Product Journey Foundation & Canonical Recommendations', () => {
  const userId = 'user-m1-journey-test';

  beforeEach(() => {
    localStorage.clear();
  });

  describe('deriveCanonicalRecommendation Domain Engine', () => {
    it('returns P0 diagnostic recommendation for a new/empty learner', () => {
      const rec = deriveCanonicalRecommendation({
        evidenceRecords: [],
        events: [],
        hasCompletedDiagnostic: false,
      });

      expect(rec.activityType).toBe('diagnostic');
      expect(rec.reason).toBe('no_diagnostic_yet');
      expect(rec.priority).toBe('p0');
      expect(rec.cta.action).toBe('diagnostic');
      expect(rec.cta.label).toMatch(/Iniciar evaluación diagnóstica/i);
    });

    it('returns P0 remediation recommendation when pendingRemediationEvidenceKey is provided', () => {
      const sampleRecord: EvidenceMasteryRecord = {
        evidenceKey: 'bxm/matematica/02-2026/geometry/A1.2',
        domain: 'geometry',
        rawCode: 'A1.2',
        description: 'Determinar la posición relativa de una recta respecto a una circunferencia',
        status: 'needs_reinforcement',
        statusLabelEs: 'Requiere refuerzo',
        correctCount: 1,
        totalQualifyingCount: 4,
        accuracyPercentage: 25,
        accuracyExactRatio: 0.25,
        qualifyingFamiliesCount: 3,
        minRequiredFamilies: 5,
        sampleSizeLabel: '3/5 familias',
        recommendedDifficultyTier: 1,
        observedDifficulties: { 1: { correct: 1, total: 4 }, 2: { correct: 0, total: 0 }, 3: { correct: 0, total: 0 } },
      };

      const rec = deriveCanonicalRecommendation({
        evidenceRecords: [sampleRecord],
        events: [
          {
            schemaVersion: '1.0.0',
            userId,
            programId: 'bxm',
            subjectId: 'matematica',
            specId: '02-2026',
            eventId: 'ev-1',
            sessionId: 'sess-1',
            sessionKind: 'diagnostic',
            mode: 'exam',
            timestamp: new Date().toISOString(),
            itemId: 'item-1',
            primaryEvidenceKey: sampleRecord.evidenceKey,
            conceptIds: ['c1'],
            domain: 'geometry',
            provenance: 'authored_mastery',
            reviewStatus: 'computationally_checked',
            cognitiveLevel: 'conexion',
            difficulty: 1,
            selectedOption: 'B',
            correctAnswer: 'A',
            isCorrect: false,
            hintsUsedBeforeResponse: 0,
            responseIndex: 0,
            sessionStatus: 'completed',
            sessionCompletedAt: new Date().toISOString(),
          },
        ],
        pendingRemediationEvidenceKey: sampleRecord.evidenceKey,
        availableLessons: [{ evidenceKey: sampleRecord.evidenceKey }],
      });

      expect(rec.reason).toBe('diagnostic_weakness');
      expect(rec.priority).toBe('p0');
      expect(rec.cta.action).toBe('lesson');
      expect(rec.cta.label).toMatch(/Estudiar este tema en el Temario/i);
    });

    it('recommends simulation when at least 3 skills are mastered', () => {
      const makeMastered = (code: string): EvidenceMasteryRecord => ({
        evidenceKey: `bxm/matematica/02-2026/geometry/${code}`,
        domain: 'geometry',
        rawCode: code,
        description: `Habilidad ${code}`,
        status: 'mastered',
        statusLabelEs: 'Dominada',
        correctCount: 5,
        totalQualifyingCount: 6,
        accuracyPercentage: 83,
        accuracyExactRatio: 0.83,
        qualifyingFamiliesCount: 5,
        minRequiredFamilies: 5,
        sampleSizeLabel: '5/5 familias',
        recommendedDifficultyTier: 2,
        observedDifficulties: { 1: { correct: 5, total: 6 }, 2: { correct: 0, total: 0 }, 3: { correct: 0, total: 0 } },
      });

      const rec = deriveCanonicalRecommendation({
        evidenceRecords: [makeMastered('A1.1'), makeMastered('A1.2'), makeMastered('A1.3')],
        events: [
          {
            schemaVersion: '1.0.0',
            userId,
            programId: 'bxm',
            subjectId: 'matematica',
            specId: '02-2026',
            eventId: 'ev-1',
            sessionId: 'sess-1',
            sessionKind: 'diagnostic',
            mode: 'exam',
            timestamp: new Date().toISOString(),
            itemId: 'item-1',
            primaryEvidenceKey: 'bxm/matematica/02-2026/geometry/A1.1',
            conceptIds: ['c1'],
            domain: 'geometry',
            provenance: 'authored_mastery',
            reviewStatus: 'computationally_checked',
            cognitiveLevel: 'conexion',
            difficulty: 1,
            selectedOption: 'A',
            correctAnswer: 'A',
            isCorrect: true,
            hintsUsedBeforeResponse: 0,
            responseIndex: 0,
            sessionStatus: 'completed',
            sessionCompletedAt: new Date().toISOString(),
          },
        ],
      });

      expect(rec.activityType).toBe('simulation');
      expect(rec.reason).toBe('simulation_recommended');
      expect(rec.cta.action).toBe('simulation');
      expect(rec.cta.label).toMatch(/Iniciar Simulacro Formativo/i);
    });
  });

  describe('BxmLearningHub M1 Integration', () => {
    it('renders empty learner state on Inicio with canonical recommendation card', () => {
      const handleNavigate = vi.fn();
      const route: AppRoute = {
        view: 'learning',
        programId: 'bxm',
        subjectId: 'matematicas',
        convocatoriaId: '2026-c2',
        tab: 'inicio',
      };

      render(
        <BxmLearningHub
          userId={userId}
          route={route}
          onNavigate={handleNavigate}
          onOfficialSimulation={vi.fn()}
        />
      );

      // Verify header and canonical 4-pillar navigation
      expect(screen.getByRole('navigation', { name: /Aprendizaje BXM/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^Inicio$/i })).toHaveAttribute('aria-current', 'page');

      // Verify canonical recommendation card in empty state
      const card = screen.getByTestId('canonical-recommendation-card');
      expect(card).toBeInTheDocument();
      expect(card).toHaveAttribute('data-activity-type', 'diagnostic');
      expect(card).toHaveAttribute('data-reason', 'no_diagnostic_yet');

      // Primary CTA is derived from recommendation engine
      const startDiagBtn = screen.getByRole('button', { name: /Iniciar evaluación diagnóstica/i });
      expect(startDiagBtn).toBeInTheDocument();
    });

    it('clicking recommendation CTA opens activity preflight dialog without conflicting entry points', () => {
      const route: AppRoute = {
        view: 'learning',
        programId: 'bxm',
        subjectId: 'matematicas',
        convocatoriaId: '2026-c2',
        tab: 'inicio',
      };

      render(
        <BxmLearningHub
          userId={userId}
          route={route}
          onNavigate={vi.fn()}
          onOfficialSimulation={vi.fn()}
        />
      );

      const startDiagBtn = screen.getByRole('button', { name: /Iniciar evaluación diagnóstica/i });
      fireEvent.click(startDiagBtn);

      // Preflight dialog appears
      expect(screen.getByText(/Antes de comenzar la actividad/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /(Comenzar actividad|Aceptar actividad limitada)/i })).toBeInTheDocument();
    });

    it('learner with diagnostic results displays updated recommendation and progress metrics', () => {
      const store = new BxmLearningStore(userId);
      const item = authoredPool[0]; // Geometry item
      const runner = new SessionRunner({
        sessionId: 'diag-session-m1',
        items: [item],
        policy: policyFor('diagnostic'),
      });

      // Incorrect response to create weakness
      const wrong = item.correctAnswer === 'A' ? 'B' : 'A';
      runner.selectDraftOption(wrong);
      const result = runner.finalizeSession();
      store.complete(result);

      const route: AppRoute = {
        view: 'learning',
        programId: 'bxm',
        subjectId: 'matematicas',
        convocatoriaId: '2026-c2',
        tab: 'inicio',
      };

      render(
        <BxmLearningHub
          userId={userId}
          route={route}
          onNavigate={vi.fn()}
          onOfficialSimulation={vi.fn()}
        />
      );

      // Verify that progress summary counts are visible
      expect(screen.getByText(/En refuerzo/i)).toBeInTheDocument();
      expect(screen.getByText(/Última actividad/i)).toBeInTheDocument();
      expect(screen.getByText(/Evaluación diagnóstica/i)).toBeInTheDocument();

      // Recommendation card is derived from the weakness: directs to lesson when available for this evidence
      const card = screen.getByTestId('canonical-recommendation-card');
      expect(card).toBeInTheDocument();
      expect(card).toHaveAttribute('data-activity-type', 'lesson');
      expect(card).toHaveAttribute('data-reason', 'diagnostic_weakness');
    });
  });
});
