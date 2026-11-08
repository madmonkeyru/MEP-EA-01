import { describe, it, expect } from 'vitest';
import { createCapabilityProvider } from '../capabilities/capabilityModel';

describe('BXM Progress - Capabilities & Presentation Gating', () => {
  describe('Free tier capabilities', () => {
    const freeProvider = createCapabilityProvider('free');

    it('permits official reference benchmark, specs, diagnostic, sample lessons, and current-session explanations', () => {
      expect(freeProvider.canAccess('official_reference_benchmark')).toBe(true);
      expect(freeProvider.canAccess('official_specifications_and_resources')).toBe(true);
      expect(freeProvider.canAccess('initial_diagnostic_and_basic_results')).toBe(true);
      expect(freeProvider.canAccess('sample_complete_lesson_per_domain')).toBe(true);
      expect(freeProvider.canAccess('current_session_explanation')).toBe(true);
    });

    it('gates longitudinal dashboard, practice queue, and weekly reports with clear Spanish reasons', () => {
      const decisionDashboard = freeProvider.evaluate('longitudinal_mastery_dashboard');
      expect(decisionDashboard.allowed).toBe(false);
      expect(decisionDashboard.reasonEs).toContain('requiere suscripción');

      const decisionQueue = freeProvider.evaluate('personalized_practice_queue');
      expect(decisionQueue.allowed).toBe(false);

      const decisionReports = freeProvider.evaluate('weekly_progress_reports_and_streaks');
      expect(decisionReports.allowed).toBe(false);
    });
  });

  describe('Premium tier capabilities', () => {
    const premiumProvider = createCapabilityProvider('premium');

    it('permits all advanced capabilities without restriction', () => {
      expect(premiumProvider.canAccess('longitudinal_mastery_dashboard')).toBe(true);
      expect(premiumProvider.canAccess('personalized_practice_queue')).toBe(true);
      expect(premiumProvider.canAccess('structured_study_plans')).toBe(true);
      expect(premiumProvider.canAccess('weekly_progress_reports_and_streaks')).toBe(true);
      expect(premiumProvider.canAccess('isomorphic_practice_drills')).toBe(true);
      expect(premiumProvider.canAccess('configurable_mock_sessions')).toBe(true);
    });
  });
});
