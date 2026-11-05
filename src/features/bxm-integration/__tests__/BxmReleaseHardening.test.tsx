import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BxmLearningHub } from '../BxmLearningHub';
import { BxmLearningStore } from '../learningStore';
import { authoredPool, policyFor } from '../providers';
import { SessionRunner } from '../../bxm-assessment/sessionRunner';
import { subscriptionService } from '../../../services/subscriptionService';
import type { AppRoute } from '../../../services/navigation';

describe('BxmReleaseHardening - Canonical Learner Journey & Safety Gates', () => {
  const userId = 'user-release-cert';

  beforeEach(() => {
    localStorage.clear();
    subscriptionService.setTier('premium'); // Test full journey capabilities
  });

  it('certifies the complete learner lifecycle without attempt duplication or corrupted state', () => {
    const handleNavigate = vi.fn();
    const handleSimulation = vi.fn();
    const store = new BxmLearningStore(userId);

    // 1. Initial State: Diagnostic Entry
    const diagRoute: AppRoute = {
      view: 'learning',
      programId: 'bxm',
      subjectId: 'matematicas',
      convocatoriaId: '2026-c2',
      tab: 'diagnostic'
    };

    const { unmount } = render(
      <BxmLearningHub
        userId={userId}
        route={diagRoute}
        onNavigate={handleNavigate}
        onOfficialSimulation={handleSimulation}
      />
    );

    expect(screen.getByText(/¿Qué necesitas repasar\?/i)).toBeInTheDocument();
    unmount();

    // 2. Diagnostic Execution & Finalization: Weakness in Geometry A1.2 (Exam mode requires finalizing drafts)
    const geoItem = authoredPool.find(i => i.evidenceId.includes('geometry')) || authoredPool[0];
    const diagRunner = new SessionRunner({
      sessionId: 'diag-session-001',
      items: [geoItem],
      policy: policyFor('diagnostic')
    });
    const wrongOpt = geoItem.correctAnswer === 'A' ? 'B' : 'A';
    diagRunner.selectDraftOption(wrongOpt);
    const diagResult = diagRunner.finalizeSession();
    expect(diagResult.attempts[String(geoItem.id)].firstResponse).not.toBeNull();
    expect(store.complete(diagResult)).toBe(true);

    // 3. Results View: Recommendation Card appears with direct CTA to Temario
    const resultRoute: AppRoute = {
      view: 'learning',
      programId: 'bxm',
      subjectId: 'matematicas',
      convocatoriaId: '2026-c2',
      tab: 'result',
      sessionId: diagResult.sessionId
    };

    const { unmount: unmountResult } = render(
      <BxmLearningHub
        userId={userId}
        route={resultRoute}
        onNavigate={handleNavigate}
        onOfficialSimulation={handleSimulation}
      />
    );

    expect(screen.getByText(/Tu siguiente paso recomendado/i)).toBeInTheDocument();
    const studyBtn = screen.getByRole('button', { name: /Estudiar este tema en el Temario/i });
    expect(studyBtn).toBeInTheDocument();
    fireEvent.click(studyBtn);

    expect(handleNavigate).toHaveBeenCalledWith(
      expect.objectContaining({
        tab: 'temario',
        evidenceKey: geoItem.evidenceId
      })
    );
    unmountResult();

    // 4. Practice Execution & Finalization: High score on target evidence (Study mode uses verifyStudyAnswer)
    const practiceRunner = new SessionRunner({
      sessionId: 'practice-session-001',
      items: [geoItem],
      policy: policyFor('evidence_practice')
    });
    practiceRunner.selectDraftOption(geoItem.correctAnswer);
    practiceRunner.verifyStudyAnswer();
    const practiceResult = practiceRunner.finalizeSession();
    expect(store.complete(practiceResult)).toBe(true);

    // Verify progress events recorded without duplicate event IDs
    const events = store.progress.getEvents();
    const eventIds = events.map(e => e.eventId);
    expect(new Set(eventIds).size).toBe(eventIds.length);
    expect(events.length).toBeGreaterThanOrEqual(2);

    // 5. Simulation Tab: Distinction between Mock Exam and Official Benchmark
    const simRoute: AppRoute = {
      view: 'learning',
      programId: 'bxm',
      subjectId: 'matematicas',
      convocatoriaId: '2026-c2',
      tab: 'simulation'
    };

    render(
      <BxmLearningHub
        userId={userId}
        route={simRoute}
        onNavigate={handleNavigate}
        onOfficialSimulation={handleSimulation}
      />
    );

    expect(screen.getByText('Simulacro Formativo de Autor')).toBeInTheDocument();
    expect(screen.getByText('Examen Oficial de Referencia')).toBeInTheDocument();
  });
});
