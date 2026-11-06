import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { classifyStudentMastery } from '../../bxm-progress/domain/masteryTiers';
import { buildPedagogicalFeedback } from '../../bxm-assessment/pedagogicalFeedbackBuilder';
import { sampleAuthoredItems } from '../../bxm-assessment/fixtures/sampleItems';
import { StudentMasteryBadge } from '../../../components/common/StudentMasteryBadge';
import { BxmLearningHub } from '../BxmLearningHub';
import { BxmLearningStore } from '../learningStore';
import { SessionRunner } from '../../bxm-assessment/sessionRunner';
import { authoredPool, policyFor } from '../providers';
import type { AppRoute } from '../../../services/navigation';

describe('Milestone 3 (M3): Assessment → Remediation Loop', () => {
  const userId = 'user-m3-test';

  beforeEach(() => {
    localStorage.clear();
  });

  describe('Centralized Mastery Tier Classifier', () => {
    it('classifies percentage according to standard thresholds without exposing raw formulas', () => {
      // >= 75% -> Dominada (🟢)
      const mastered = classifyStudentMastery(85);
      expect(mastered.tier).toBe('mastered');
      expect(mastered.label).toBe('Dominada');
      expect(mastered.badgeEmoji).toBe('🟢');

      // 60-74% -> En progreso (🟡)
      const inProgress = classifyStudentMastery(65);
      expect(inProgress.tier).toBe('in_progress');
      expect(inProgress.label).toBe('En progreso');
      expect(inProgress.badgeEmoji).toBe('🟡');

      // < 60% -> Necesita práctica (🔴)
      const needsPractice = classifyStudentMastery(45);
      expect(needsPractice.tier).toBe('needs_practice');
      expect(needsPractice.label).toBe('Necesita práctica');
      expect(needsPractice.badgeEmoji).toBe('🔴');
    });

    it('respects configurable thresholds when calibrated', () => {
      const customConfig = { masteredThreshold: 80, inProgressThreshold: 50 };
      const res = classifyStudentMastery(75, customConfig);
      expect(res.tier).toBe('in_progress');
    });
  });

  describe('Pedagogical Feedback Fallback Hierarchy', () => {
    it('uses authored distractor rationale when available', () => {
      const itemWithDistractor = sampleAuthoredItems[0]; // has distractor for option B
      const feedback = buildPedagogicalFeedback(itemWithDistractor, 'B', false);

      expect(feedback.correctness).toBe(false);
      expect(feedback.selectedAnswer).toBe('B');
      expect(feedback.correctAnswer).toBe(itemWithDistractor.correctAnswer);
      expect(feedback.misconception).toBeDefined();
      expect(feedback.explanation).toContain(itemWithDistractor.distractorExplanations!['B'].explanation);
    });

    it('falls back to solution steps and keyRule when distractor rationale is not authored', () => {
      const itemWithoutDistractor = sampleAuthoredItems[1]; // No distractorExplanations
      const wrong = itemWithoutDistractor.correctAnswer === 'A' ? 'B' : 'A';
      const feedback = buildPedagogicalFeedback(itemWithoutDistractor, wrong, false);

      expect(feedback.correctness).toBe(false);
      expect(feedback.misconception).toBeUndefined(); // Never invents an unevidenced misconception
      expect(feedback.explanation).toBeDefined();
      expect(feedback.explanation.length).toBeGreaterThan(0);
    });

    it('formats correct answer feedback with complete solution steps', () => {
      const item = sampleAuthoredItems[0];
      const feedback = buildPedagogicalFeedback(item, item.correctAnswer, true);

      expect(feedback.correctness).toBe(true);
      expect(feedback.explanation).toContain(item.solutionSteps![0]);
    });
  });

  describe('StudentMasteryBadge Component', () => {
    it('renders accessible label and badge pill', () => {
      render(<StudentMasteryBadge percentage={80} />);
      expect(screen.getByLabelText(/Nivel de dominio: Dominada/i)).toBeInTheDocument();
      expect(screen.getByText('Dominada')).toBeInTheDocument();
      expect(screen.getByText('(80%)')).toBeInTheDocument();
    });
  });

  describe('Diagnostic Results Action Surface', () => {
    it('launches lesson with diagnostic_weakness contextReason when weak evidence has authored lesson', () => {
      const store = new BxmLearningStore(userId);
      const geoItem = authoredPool.find(i => i.domain === 'geometry')!;

      // Simulate a diagnostic session with an incorrect response in Geometry
      const wrong = geoItem.correctAnswer === 'A' ? 'B' : 'A';
      const runner = new SessionRunner({
        sessionId: 'm3-diag-action-test',
        items: [geoItem],
        policy: policyFor('diagnostic'),
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

      // Verify Results Action Surface contains Strengths, Opportunities, and Next Step
      expect(screen.getByText(/Tu diagnóstico: ¿dónde estás y qué sigue\?/i)).toBeInTheDocument();
      expect(screen.getByText(/Necesitas reforzar/i)).toBeInTheDocument();
      expect(screen.getByText(/Recomendado para ti/i)).toBeInTheDocument();

      // Click primary action on the recommendation card
      const card = screen.getByTestId('canonical-recommendation-card');
      const primaryBtn = card.querySelector('button.primary-button') as HTMLButtonElement;
      expect(primaryBtn).toBeTruthy();
      fireEvent.click(primaryBtn);

      // Verify routing passed contextReason: 'diagnostic_weakness'
      expect(handleNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          tab: 'temario',
          contextReason: 'diagnostic_weakness',
        })
      );
    });
  });
});
