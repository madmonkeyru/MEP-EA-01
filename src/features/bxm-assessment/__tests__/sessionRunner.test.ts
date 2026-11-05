import { describe, it, expect } from 'vitest';
import { SessionRunner } from '../sessionRunner';
import { sampleAuthoredItems } from '../fixtures/sampleItems';
import type { AssessmentPolicy, ClockProvider } from '../types';

class MockClock implements ClockProvider {
  private currentTime: number;
  constructor(start: number = 1700000000000) {
    this.currentTime = start;
  }
  public now(): number {
    return this.currentTime;
  }
  public advance(ms: number) {
    this.currentTime += ms;
  }
}

describe('SessionRunner (Agent B)', () => {
  it('suppresses immediate feedback and hints in Exam Mode', () => {
    const policy: AssessmentPolicy = {
      mode: 'exam',
      kind: 'diagnostic',
      enableTimer: true,
      timeLimitMinutes: 30,
      allowHints: false,
      allowRetries: false,
      allowImmediateFeedback: false,
      allowFormulaSheet: true,
      allowCalculator: true,
    };

    const runner = new SessionRunner({
      sessionId: 'exam-001',
      items: sampleAuthoredItems.slice(0, 3),
      policy,
    });

    expect(runner.isExamMode()).toBe(true);

    // Revealing hint should return null in exam mode
    const hintRes = runner.revealHint(sampleAuthoredItems[0].id);
    expect(hintRes.hint).toBeNull();
    expect(hintRes.count).toBe(0);

    // Verifying answer should return null in exam mode
    runner.selectDraftOption('A', sampleAuthoredItems[0].id);
    const verifyRes = runner.verifyStudyAnswer(sampleAuthoredItems[0].id);
    expect(verifyRes).toBeNull();
  });

  it('records draft answer changes as edits, not retries in Exam Mode, evaluating on final submit', () => {
    const policy: AssessmentPolicy = {
      mode: 'exam',
      kind: 'mock_exam',
      enableTimer: false,
      allowHints: false,
      allowRetries: false,
      allowImmediateFeedback: false,
      allowFormulaSheet: true,
      allowCalculator: true,
    };

    const runner = new SessionRunner({
      items: sampleAuthoredItems.slice(0, 2),
      policy,
    });

    const item1 = sampleAuthoredItems[0];
    // Select wrong option first
    runner.selectDraftOption('B', item1.id);
    expect(runner.getItemState(item1.id)?.draftOption).toBe('B');

    // Change mind and select correct option 'A'
    runner.selectDraftOption('A', item1.id);
    expect(runner.getItemState(item1.id)?.draftOption).toBe('A');

    // Finalize
    const results = runner.finalizeSession('completed');
    expect(results.firstResponseCorrectCount).toBe(1); // Item 1 correct, Item 2 unanswered
    expect(results.attempts[item1.id].firstResponse?.attemptIndex).toBe(0);
    expect(results.attempts[item1.id].firstResponse?.selectedOption).toBe('A');
    expect(results.attempts[item1.id].retries.length).toBe(0); // No retries created
    expect(results.totalUnanswered).toBe(1);
  });

  it('handles timeouts deterministically using injected clock and prevents duplicate submissions', () => {
    const clock = new MockClock(1000000);
    const policy: AssessmentPolicy = {
      mode: 'exam',
      kind: 'diagnostic',
      enableTimer: true,
      timeLimitMinutes: 10, // 600,000 ms -> deadline 1,600,000
      allowHints: false,
      allowRetries: false,
      allowImmediateFeedback: false,
      allowFormulaSheet: true,
      allowCalculator: true,
    };

    const runner = new SessionRunner({
      items: sampleAuthoredItems.slice(0, 2),
      policy,
      clock,
    });

    expect(runner.checkTimeout()).toBe(false);
    expect(runner.isFinished()).toBe(false);

    // Advance clock past deadline
    clock.advance(600001);
    expect(runner.checkTimeout()).toBe(true);
    expect(runner.isFinished()).toBe(true);

    const firstResult = runner.exportResults();
    expect(firstResult.status).toBe('timed_out');

    // Double submission is idempotent
    const secondResult = runner.finalizeSession('completed');
    expect(secondResult.status).toBe('timed_out'); // Retains original timed_out status
    expect(secondResult.completedAt).toBe(firstResult.completedAt);
  });

  it('preserves first response in Study Mode while recording retries and hint counts', () => {
    const policy: AssessmentPolicy = {
      mode: 'study',
      kind: 'topic_practice',
      enableTimer: false,
      allowHints: true,
      allowRetries: true,
      allowImmediateFeedback: true,
      allowFormulaSheet: true,
      allowCalculator: true,
    };

    const runner = new SessionRunner({
      items: sampleAuthoredItems.slice(0, 2),
      policy,
    });

    const item = sampleAuthoredItems[0]; // Correct is 'A'

    // First attempt: answer 'B' without hint
    runner.selectDraftOption('B', item.id);
    const att1 = runner.verifyStudyAnswer(item.id);
    expect(att1?.isCorrect).toBe(false);
    expect(att1?.attemptEvent.attemptIndex).toBe(0);
    expect(att1?.attemptEvent.isUnassisted).toBe(true);
    expect(att1?.attemptEvent.hintsUsedBeforeResponse).toBe(0);

    // Reveal 1 hint
    runner.revealHint(item.id);

    // Retry: answer 'A'
    runner.selectDraftOption('A', item.id);
    const att2 = runner.verifyStudyAnswer(item.id);
    expect(att2?.isCorrect).toBe(true);
    expect(att2?.attemptEvent.attemptIndex).toBe(1);
    expect(att2?.attemptEvent.isUnassisted).toBe(false);
    expect(att2?.attemptEvent.hintsUsedBeforeResponse).toBe(1);

    const exported = runner.finalizeSession('completed');
    const itemAttempt = exported.attempts[item.id];

    // First response is preserved as 'B' (incorrect)
    expect(itemAttempt.firstResponse?.selectedOption).toBe('B');
    expect(itemAttempt.firstResponse?.isCorrect).toBe(false);
    // Retries contains attempt 2
    expect(itemAttempt.retries.length).toBe(1);
    expect(itemAttempt.retries[0].selectedOption).toBe('A');
    expect(itemAttempt.retries[0].isCorrect).toBe(true);
    expect(itemAttempt.finalCorrect).toBe(true);
  });

  it('computes accurate domain, cognitive, difficulty, and evidence breakdowns', () => {
    const policy: AssessmentPolicy = {
      mode: 'exam',
      kind: 'diagnostic',
      enableTimer: false,
      allowHints: false,
      allowRetries: false,
      allowImmediateFeedback: false,
      allowFormulaSheet: true,
      allowCalculator: true,
    };

    // Use 20 sample items (8 Geo, 8 Alg, 4 Est)
    const runner = new SessionRunner({
      items: sampleAuthoredItems,
      policy,
    });

    // Answer first 4 geometry items correctly ('A', 'B', 'B', 'C')
    runner.selectDraftOption('A', sampleAuthoredItems[0].id); // Correct: A
    runner.selectDraftOption('B', sampleAuthoredItems[1].id); // Correct: B
    runner.selectDraftOption('B', sampleAuthoredItems[2].id); // Correct: B
    runner.selectDraftOption('A', sampleAuthoredItems[3].id); // Correct is C -> wrong

    const result = runner.finalizeSession('completed');

    expect(result.totalActualItems).toBe(20);
    expect(result.totalAnswered).toBe(4);
    expect(result.totalUnanswered).toBe(16);
    expect(result.firstResponseCorrectCount).toBe(3);
    expect(result.firstResponseScorePercentage).toBe(15); // 3 / 20 = 15.0%

    // Geometry breakdown: 4 answered, 3 correct out of 8 total
    expect(result.domainBreakdowns.geometry.totalItems).toBe(8);
    expect(result.domainBreakdowns.geometry.answeredCount).toBe(4);
    expect(result.domainBreakdowns.geometry.correctFirstResponseCount).toBe(3);
    expect(result.domainBreakdowns.geometry.scorePercentage).toBe(37.5);

    // Functions breakdown: 0 answered, 8 total
    expect(result.domainBreakdowns.functions.totalItems).toBe(8);
    expect(result.domainBreakdowns.functions.answeredCount).toBe(0);
    expect(result.domainBreakdowns.functions.correctFirstResponseCount).toBe(0);
    expect(result.domainBreakdowns.functions.scorePercentage).toBe(0);
  });
});
