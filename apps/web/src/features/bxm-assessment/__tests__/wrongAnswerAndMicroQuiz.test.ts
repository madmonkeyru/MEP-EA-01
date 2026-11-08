import { describe, it, expect } from 'vitest';
import { WrongAnswerClassifier } from '../wrongAnswerClassifier';
import { MicroQuizEngine } from '../microQuizEngine';
import { sampleAuthoredItems } from '../fixtures/sampleItems';

describe('WrongAnswerClassifier & MicroQuizEngine (Agent B)', () => {
  it('uses supplied authored distractor explanation and misconception when available', () => {
    const itemWithDistractor = sampleAuthoredItems[0]; // has distractor for option 'B'
    const analysis = WrongAnswerClassifier.analyze(itemWithDistractor, 'B');

    expect(analysis.hasAuthoredMisconception).toBe(true);
    expect(analysis.misconceptionSource).toBe('authored_distractor');
    expect(analysis.misconceptionId).toBe('sign_inversion_center');
    expect(analysis.explanationText).toContain('signos');
  });

  it('invites and classifies learner-reported reasons when distractor is absent, without guessing', () => {
    const itemWithoutDistractor = sampleAuthoredItems[1]; // No distractorExplanations
    const analysis = WrongAnswerClassifier.analyze(
      itemWithoutDistractor,
      'A',
      'algebraic_manipulation'
    );

    expect(analysis.hasAuthoredMisconception).toBe(false);
    expect(analysis.misconceptionSource).toBe('learner_reported');
    expect(analysis.learnerReportedReason).toBe('algebraic_manipulation');
    expect(analysis.label).toBe('Despeje o álgebra');
  });

  it('marks unclassified when no distractor exists and learner skips or reports unknown', () => {
    const itemWithoutDistractor = sampleAuthoredItems[1];
    const analysis = WrongAnswerClassifier.analyze(itemWithoutDistractor, 'A', 'unknown');

    expect(analysis.hasAuthoredMisconception).toBe(false);
    expect(analysis.misconceptionSource).toBe('unclassified');
    expect(analysis.learnerReportedReason).toBe('unknown');
  });

  it('throws an error if attempting to analyze a correct answer as a wrong answer', () => {
    const item = sampleAuthoredItems[0]; // Correct is 'A'
    expect(() => WrongAnswerClassifier.analyze(item, 'A')).toThrow();
  });

  it('executes micro-quiz session and returns summary with wrong answer breakdown', () => {
    const quizItems = sampleAuthoredItems.slice(0, 2);
    const engine = new MicroQuizEngine('quiz-circunferencia', quizItems);

    // Item 1: submit 'B' (wrong)
    const res1 = engine.submitAnswer(quizItems[0].id, 'B');
    expect(res1?.isCorrect).toBe(false);
    expect(res1?.wrongAnswerAnalysis?.hasAuthoredMisconception).toBe(true);

    // Item 2: submit 'B' (correct)
    const res2 = engine.submitAnswer(quizItems[1].id, 'B');
    expect(res2?.isCorrect).toBe(true);

    const summary = engine.getSummary();
    expect(summary.totalItems).toBe(2);
    expect(summary.score).toBe(1);
    expect(summary.firstResponseScorePercentage).toBe(50);
    expect(summary.allCorrect).toBe(false);
    expect(summary.itemResults[0].wrongAnswerAnalysis?.misconceptionId).toBe('sign_inversion_center');
  });
});
