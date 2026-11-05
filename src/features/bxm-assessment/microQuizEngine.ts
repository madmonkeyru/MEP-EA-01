/**
 * Micro-Quiz Scoring and Session Adapter
 * Agent B - Exclusive Ownership (`src/features/bxm-assessment/`)
 *
 * Provides a lightweight session runner for embedded Digital Temario micro-quizzes,
 * designed to be consumed by Agent A via injected callbacks without importing unmerged code.
 */

import type {
  AssessmentItem,
  AssessmentPolicy,
  ClockProvider,
  LearnerReportedReason,
  OptionLetter,
  ResponseAttemptEvent,
} from './types';
import { SessionRunner, SystemClock } from './sessionRunner';
import { WrongAnswerClassifier, type WrongAnswerAnalysis } from './wrongAnswerClassifier';

export interface MicroQuizItemResult {
  itemId: string | number;
  selectedOption: OptionLetter;
  isCorrect: boolean;
  firstAttemptCorrect: boolean;
  attemptCount: number;
  hintsUsed: number;
  wrongAnswerAnalysis?: WrongAnswerAnalysis;
}

export interface MicroQuizSubmissionSummary {
  quizId: string;
  totalItems: number;
  score: number;
  firstResponseScorePercentage: number;
  allCorrect: boolean;
  itemResults: MicroQuizItemResult[];
}

export class MicroQuizEngine {
  private runner: SessionRunner;
  private quizId: string;

  constructor(
    quizId: string,
    items: AssessmentItem[],
    options: { clock?: ClockProvider } = {}
  ) {
    this.quizId = quizId;
    const policy: AssessmentPolicy = {
      mode: 'study',
      kind: 'micro_quiz',
      enableTimer: false,
      allowHints: true,
      allowRetries: true,
      allowImmediateFeedback: true,
      allowFormulaSheet: true,
      allowCalculator: true,
      maxRetriesPerItem: 3,
    };

    this.runner = new SessionRunner({
      sessionId: `microquiz-${quizId}`,
      items,
      policy,
      clock: options.clock || new SystemClock(),
    });
  }

  public getItems(): AssessmentItem[] {
    return this.runner.items;
  }

  public getCurrentIndex(): number {
    return this.runner.getCurrentIndex();
  }

  public setCurrentIndex(index: number): void {
    this.runner.setCurrentIndex(index);
  }

  public revealHint(itemId?: string | number): { hint: string | null; count: number } {
    return this.runner.revealHint(itemId);
  }

  public submitAnswer(
    itemId: string | number,
    option: OptionLetter,
    reportedReason?: LearnerReportedReason
  ): {
    isCorrect: boolean;
    attemptEvent: ResponseAttemptEvent;
    wrongAnswerAnalysis?: WrongAnswerAnalysis;
    solutionSteps?: any;
  } | null {
    this.runner.selectDraftOption(option, itemId);
    const verification = this.runner.verifyStudyAnswer(itemId, reportedReason);
    if (!verification) return null;

    let analysis: WrongAnswerAnalysis | undefined;
    if (!verification.isCorrect) {
      const item = this.runner.items.find((i) => i.id === itemId);
      if (item) {
        analysis = WrongAnswerClassifier.analyze(item, option, reportedReason);
      }
    }

    return {
      isCorrect: verification.isCorrect,
      attemptEvent: verification.attemptEvent,
      wrongAnswerAnalysis: analysis,
      solutionSteps: verification.explanationSteps,
    };
  }

  public getSummary(): MicroQuizSubmissionSummary {
    const exported = this.runner.exportResults();
    const itemResults: MicroQuizItemResult[] = [];

    let score = 0;

    for (const item of this.runner.items) {
      const attempt = exported.attempts[item.id];
      const isCorrect = attempt?.finalCorrect ?? false;
      const firstAttemptCorrect = attempt?.firstResponse?.isCorrect ?? false;
      const attemptCount = (attempt?.firstResponse ? 1 : 0) + (attempt?.retries.length || 0);
      const hintsUsed = (attempt?.firstResponse?.hintsUsedBeforeResponse || 0) +
        (attempt?.retries.reduce((acc, r) => acc + r.hintsUsedBeforeResponse, 0) || 0);

      if (firstAttemptCorrect) {
        score++;
      }

      let wrongAnalysis: WrongAnswerAnalysis | undefined;
      const lastOption = attempt?.retries.length
        ? attempt.retries[attempt.retries.length - 1].selectedOption
        : attempt?.firstResponse?.selectedOption;

      if (!isCorrect && lastOption) {
        wrongAnalysis = WrongAnswerClassifier.analyze(
          item,
          lastOption,
          attempt?.firstResponse?.learnerReportedReason
        );
      }

      itemResults.push({
        itemId: item.id,
        selectedOption: lastOption || 'A',
        isCorrect,
        firstAttemptCorrect,
        attemptCount,
        hintsUsed,
        wrongAnswerAnalysis: wrongAnalysis,
      });
    }

    const total = this.runner.items.length;
    const firstResponseScorePercentage = total > 0 ? Math.round((score / total) * 1000) / 10 : 0;

    return {
      quizId: this.quizId,
      totalItems: total,
      score,
      firstResponseScorePercentage,
      allCorrect: score === total,
      itemResults,
    };
  }
}
