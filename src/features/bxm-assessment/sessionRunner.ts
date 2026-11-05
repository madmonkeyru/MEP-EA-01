/**
 * Session State Machine and Policy Runner for BXM Assessment
 * Agent B - Exclusive Ownership (`src/features/bxm-assessment/`)
 *
 * Implements:
 * - Study Mode vs Exam Mode policies.
 * - Injected ClockProvider for deterministic deadlines/timing.
 * - Exam Mode: No hints, no immediate feedback, suppressed explanations.
 *   Draft option changes are editing, NOT retries. First submitted response is evaluated upon final test submission.
 * - Study Mode: Immediate verification, hints, retries, explanations.
 *   First response is preserved, subsequent attempts are recorded as retries.
 * - Double-submission prevention (idempotent submission).
 * - Timeout enforcement (automatic single finalization on deadline).
 * - Unanswered questions: scored as incorrect in overall score, exported as unanswered, not counted as submitted responses for evidence mastery.
 * - Full result breakdown calculation across Domain, Cognitive Level, Difficulty Tier, and Evidence.
 */

import type {
  AssessmentItem,
  AssessmentPolicy,
  ClockProvider,
  CognitiveLevel,
  CognitiveScoreBreakdown,
  DifficultyScoreBreakdown,
  DifficultyTier,
  DomainScoreBreakdown,
  EvidenceScoreBreakdown,
  ItemSessionState,
  ItemSelectionShortfall,
  LearnerReportedReason,
  OptionLetter,
  ResponseAttemptEvent,
  SessionResultExport,
  StandardDomainArea,
} from './types';

export class SystemClock implements ClockProvider {
  public now(): number {
    return Date.now();
  }
}

export interface SessionRunnerOptions {
  sessionId?: string;
  items: AssessmentItem[];
  policy: AssessmentPolicy;
  shortfalls?: ItemSelectionShortfall[];
  benchmarkExposed?: boolean;
  clock?: ClockProvider;
  startTime?: string;
}

export interface SessionSnapshot {
  version: 1;
  sessionId: string;
  policy: AssessmentPolicy;
  items: AssessmentItem[];
  shortfalls: ItemSelectionShortfall[];
  benchmarkExposed: boolean;
  startTime: string;
  deadline?: number;
  currentIndex: number;
  eventCounter: number;
  states: Array<Omit<ItemSessionState, 'item'> & { itemId: string | number }>;
}

export class SessionRunner {
  public readonly sessionId: string;
  public readonly policy: AssessmentPolicy;
  public readonly items: AssessmentItem[];
  public readonly shortfalls: ItemSelectionShortfall[];
  public readonly benchmarkExposed: boolean;
  public readonly clock: ClockProvider;
  public readonly startTime: string;
  public readonly deadline?: number;

  private itemStates: Map<string | number, ItemSessionState>;
  private currentIndex: number = 0;
  private isSubmitted: boolean = false;
  private completedAt?: string;
  private terminationStatus: 'completed' | 'timed_out' | 'abandoned' = 'completed';
  private eventCounter: number = 0;
  private finalResult?: SessionResultExport;

  constructor(options: SessionRunnerOptions) {
    this.sessionId = options.sessionId || `session-${Math.random().toString(36).substring(2, 9)}`;
    this.policy = Object.freeze({ ...options.policy });
    this.items = structuredClone(options.items);
    if (new Set(this.items.map(i => String(i.id))).size !== this.items.length) throw new Error('Duplicate assessment item IDs');
    for (const item of this.items) {
      Object.freeze(item.options);
      Object.freeze(item);
    }
    if (this.policy.maxRetriesPerItem !== undefined && (!Number.isInteger(this.policy.maxRetriesPerItem) || this.policy.maxRetriesPerItem < 0)) throw new RangeError('Invalid retry limit');
    this.shortfalls = options.shortfalls || [];
    this.benchmarkExposed = options.benchmarkExposed || false;
    this.clock = options.clock || new SystemClock();

    const initialNow = this.clock.now();
    this.startTime = options.startTime || new Date(initialNow).toISOString();

    if (this.policy.enableTimer && this.policy.timeLimitMinutes && this.policy.timeLimitMinutes > 0) {
      this.deadline = Date.parse(this.startTime) + this.policy.timeLimitMinutes * 60 * 1000;
    }

    this.itemStates = new Map();
    for (const item of this.items) {
      this.itemStates.set(item.id, {
        item,
        flaggedForReview: false,
        draftOption: null,
        firstResponse: null,
        retryAttempts: [],
        hintsRevealed: 0,
        isFinalAnswerSubmitted: false,
        isCorrectFinal: false,
        isUnanswered: true,
      });
    }
  }

  public getCurrentIndex(): number {
    return this.currentIndex;
  }

  public snapshot(): SessionSnapshot {
    if (this.isSubmitted) throw new Error('Cannot save a completed session as active');
    return structuredClone({
      version: 1, sessionId: this.sessionId, policy: this.policy, items: this.items,
      shortfalls: this.shortfalls, benchmarkExposed: this.benchmarkExposed, startTime: this.startTime,
      deadline: this.deadline, currentIndex: this.currentIndex, eventCounter: this.eventCounter,
      states: this.getAllItemStates().map(({ item, ...state }) => ({ ...state, itemId: item.id })),
    });
  }

  public static restore(snapshot: SessionSnapshot, clock?: ClockProvider): SessionRunner {
    if (!snapshot || snapshot.version !== 1 || typeof snapshot.sessionId !== 'string' ||
      !Number.isFinite(Date.parse(snapshot.startTime)) || !Array.isArray(snapshot.items) || !snapshot.items.length ||
      !Array.isArray(snapshot.states) || snapshot.states.length !== snapshot.items.length ||
      !Number.isInteger(snapshot.currentIndex) || snapshot.currentIndex < 0 || snapshot.currentIndex >= snapshot.items.length ||
      !Number.isInteger(snapshot.eventCounter) || snapshot.eventCounter < 0) throw new Error('Invalid active session');
    const policy = snapshot.policy;
    if (!policy || !['study', 'exam'].includes(policy.mode) ||
      !['diagnostic','topic_practice','evidence_practice','mastery_check','retest','mock_exam','micro_quiz'].includes(policy.kind) ||
      ['enableTimer','allowHints','allowRetries','allowImmediateFeedback','allowFormulaSheet','allowCalculator'].some(k => typeof policy[k as keyof AssessmentPolicy] !== 'boolean') ||
      (policy.enableTimer && (!Number.isFinite(policy.timeLimitMinutes) || policy.timeLimitMinutes! <= 0))) throw new Error('Invalid saved policy');
    const runner = new SessionRunner({ ...snapshot, clock });
    if (snapshot.deadline !== runner.deadline) throw new Error('Saved deadline does not match policy');
    const seen = new Set<string | number>();
    const eventNumbers = new Set<number>();
    let eventCount = 0;
    for (const state of snapshot.states) {
      const item = runner.items.find(i => i.id === state.itemId);
      if (!item || seen.has(item.id) || !Array.isArray(state.retryAttempts) ||
        !Number.isInteger(state.hintsRevealed) || state.hintsRevealed < 0 ||
        state.hintsRevealed > (item.hints?.length || 0) ||
        typeof state.flaggedForReview !== 'boolean' || typeof state.isUnanswered !== 'boolean' ||
        typeof state.isFinalAnswerSubmitted !== 'boolean' || typeof state.isCorrectFinal !== 'boolean' ||
        state.isUnanswered !== (state.firstResponse === null) ||
        state.isCorrectFinal !== (state.retryAttempts.at(-1)?.isCorrect ?? state.firstResponse?.isCorrect ?? false) ||
        (policy.mode === 'exam' && (state.firstResponse !== null || state.retryAttempts.length || state.hintsRevealed))) throw new Error('Invalid saved item state');
      seen.add(item.id);
      const options = Array.isArray(item.options) ? item.options.map(o => o.letter) : Object.keys(item.options);
      if (state.draftOption !== null && !options.includes(state.draftOption)) throw new Error('Invalid saved answer');
      for (const [index, response] of [state.firstResponse, ...state.retryAttempts].entries()) {
        if (response === null && index === 0 && !state.retryAttempts.length) continue;
        if (!response || response.attemptIndex !== index || !options.includes(response.selectedOption!) ||
          response.isCorrect !== (response.selectedOption === item.correctAnswer) ||
          !Number.isFinite(Date.parse(response.timestamp)) || !Number.isInteger(response.hintsUsedBeforeResponse) ||
          response.hintsUsedBeforeResponse < 0 || typeof response.hasSeenExplanationBefore !== 'boolean' ||
          response.eventId !== `${runner.sessionId}-evt-${Number(response.eventId.split('-evt-').at(-1))}`) throw new Error('Invalid saved response');
        const number = Number(response.eventId.split('-evt-').at(-1));
        if (!Number.isInteger(number) || number < 1 || number > snapshot.eventCounter || eventNumbers.has(number)) throw new Error('Duplicate or invalid saved event ID');
        eventNumbers.add(number);
        eventCount++;
      }
      const { itemId: _, ...savedState } = state;
      runner.itemStates.set(item.id, { ...structuredClone(savedState), item });
    }
    if (eventCount !== snapshot.eventCounter) throw new Error('Invalid saved event counter');
    runner.currentIndex = snapshot.currentIndex;
    runner.eventCounter = snapshot.eventCounter;
    return runner;
  }

  public setCurrentIndex(index: number): void {
    this.checkTimeout();
    if (this.isSubmitted) return;
    if (index >= 0 && index < this.items.length) {
      this.currentIndex = index;
    }
  }

  public getCurrentItem(): AssessmentItem | undefined {
    return this.items[this.currentIndex];
  }

  public getItemState(itemId: string | number): ItemSessionState | undefined {
    return this.itemStates.get(itemId);
  }

  public getAllItemStates(): ItemSessionState[] {
    return this.items.map((item) => this.itemStates.get(item.id)!);
  }

  public isExamMode(): boolean {
    return this.policy.mode === 'exam';
  }

  public isFinished(): boolean {
    return this.isSubmitted;
  }

  public getDeadline(): number | undefined {
    return this.deadline;
  }

  public checkTimeout(): boolean {
    if (this.isSubmitted) return false;
    if (this.deadline && this.clock.now() >= this.deadline) {
      this.finalizeSession('timed_out');
      return true;
    }
    return false;
  }

  public toggleReviewFlag(itemId?: string | number): boolean {
    this.checkTimeout();
    if (this.isSubmitted) return false;
    const targetId = itemId ?? this.getCurrentItem()?.id;
    if (!targetId) return false;

    const state = this.itemStates.get(targetId);
    if (!state) return false;

    state.flaggedForReview = !state.flaggedForReview;
    return state.flaggedForReview;
  }

  /**
   * Reveal next available hint (Study Mode only)
   */
  public revealHint(itemId?: string | number): { hint: string | null; count: number } {
    this.checkTimeout();
    if (this.isSubmitted || this.isExamMode() || !this.policy.allowHints) {
      return { hint: null, count: 0 };
    }

    const targetId = itemId ?? this.getCurrentItem()?.id;
    if (!targetId) return { hint: null, count: 0 };

    const state = this.itemStates.get(targetId);
    if (!state) return { hint: null, count: 0 };

    const hints = state.item.hints || [];
    if (state.hintsRevealed < hints.length) {
      state.hintsRevealed++;
      return {
        hint: hints[state.hintsRevealed - 1],
        count: state.hintsRevealed,
      };
    }

    return {
      hint: hints[hints.length - 1] || null,
      count: state.hintsRevealed,
    };
  }

  /**
   * Select or change draft answer.
   * In Exam Mode: this simply updates the draft option until final submission.
   * In Study Mode: updates draft option prior to immediate verification.
   */
  public selectDraftOption(option: OptionLetter, itemId?: string | number): void {
    if (this.isSubmitted) return;
    this.checkTimeout();
    if (this.isSubmitted) return;

    const targetId = itemId ?? this.getCurrentItem()?.id;
    if (!targetId) return;

    const state = this.itemStates.get(targetId);
    if (!state) return;

    const validOptions = Array.isArray(state.item.options) ? state.item.options.map(o => o.letter) : Object.keys(state.item.options);
    if (!validOptions.includes(option)) throw new Error('Invalid selected option');

    state.draftOption = option;
  }

  /**
   * Verify and submit answer for an item in Study Mode.
   */
  public verifyStudyAnswer(
    itemId?: string | number,
    learnerReason?: LearnerReportedReason
  ): {
    isCorrect: boolean;
    attemptEvent: ResponseAttemptEvent;
    authoredMisconception?: any;
    explanationSteps?: any;
  } | null {
    if (this.isSubmitted || this.isExamMode()) return null;
    this.checkTimeout();
    if (this.isSubmitted) return null;

    const targetId = itemId ?? this.getCurrentItem()?.id;
    if (!targetId) return null;

    const state = this.itemStates.get(targetId);
    if (!state || !state.draftOption) return null;
    if (state.firstResponse && (!this.policy.allowRetries ||
      (this.policy.maxRetriesPerItem !== undefined && state.retryAttempts.length >= this.policy.maxRetriesPerItem))) return null;

    const chosenOption = state.draftOption;
    const isCorrect = chosenOption === state.item.correctAnswer;
    const now = this.clock.now();
    const isoTimestamp = new Date(now).toISOString();

    this.eventCounter++;
    const eventId = `${this.sessionId}-evt-${this.eventCounter}`;

    const distractorInfo = !isCorrect && state.item.distractorExplanations
      ? state.item.distractorExplanations[chosenOption]
      : undefined;

    const isFirstAttempt = state.firstResponse === null;
    const attemptIndex = isFirstAttempt ? 0 : state.retryAttempts.length + 1;

    // A response is unassisted if NO hints, reveals, or solutions were accessed prior to this response
    const hasSeenExplanationBefore = !!state.item.hasSeenExplanationBefore ||
      (!!state.firstResponse && this.policy.allowImmediateFeedback);
    const isUnassisted = isFirstAttempt && state.hintsRevealed === 0 && !hasSeenExplanationBefore;

    const attemptEvent: ResponseAttemptEvent = {
      eventId,
      attemptIndex,
      selectedOption: chosenOption,
      isCorrect,
      hintsUsedBeforeResponse: state.hintsRevealed,
      timeSpentSeconds: Math.max(1, Math.floor((now - Date.parse(this.startTime)) / 1000)),
      timestamp: isoTimestamp,
      isUnassisted,
      hasSeenExplanationBefore,
      learnerReportedReason: !isCorrect ? learnerReason : undefined,
      authoredMisconception: distractorInfo
        ? {
            misconceptionId: distractorInfo.misconceptionId,
            label: distractorInfo.misconceptionLabel,
            explanation: distractorInfo.explanation,
          }
        : undefined,
    };

    if (isFirstAttempt) {
      state.firstResponse = attemptEvent;
      state.isUnanswered = false;
    } else {
      state.retryAttempts.push(attemptEvent);
    }

    state.isFinalAnswerSubmitted = true;
    state.isCorrectFinal = isCorrect;

    if (!this.policy.allowImmediateFeedback) return null;

    return {
      isCorrect,
      attemptEvent,
      authoredMisconception: attemptEvent.authoredMisconception,
      explanationSteps: state.item.solutionSteps,
    };
  }

  public reportLearnerReason(itemId: string | number, reason: LearnerReportedReason): void {
    this.checkTimeout();
    if (this.isSubmitted || this.isExamMode()) return;
    const state = this.itemStates.get(itemId);
    const response = state?.retryAttempts.at(-1) || state?.firstResponse;
    if (response && !response.isCorrect) response.learnerReportedReason = reason;
  }

  /**
   * Finalize the session (idempotent, prevents double submission).
   */
  public finalizeSession(status: 'completed' | 'timed_out' | 'abandoned' = 'completed'): SessionResultExport {
    if (this.isSubmitted) {
      return this.exportResults();
    }

    this.isSubmitted = true;
    this.terminationStatus = this.deadline !== undefined && this.clock.now() >= this.deadline ? 'timed_out' : status;
    const now = this.clock.now();
    this.completedAt = new Date(now).toISOString();

    // In Exam Mode, finalize all draft responses as final submissions
    for (const item of this.items) {
      const state = this.itemStates.get(item.id)!;

      if (this.isExamMode()) {
        if (state.draftOption !== null) {
          const chosen = state.draftOption;
          const isCorrect = chosen === item.correctAnswer;
          this.eventCounter++;

          state.firstResponse = {
            eventId: `${this.sessionId}-evt-${this.eventCounter}`,
            attemptIndex: 0,
            selectedOption: chosen,
            isCorrect,
            hintsUsedBeforeResponse: 0,
            timeSpentSeconds: Math.max(1, Math.floor((now - Date.parse(this.startTime)) / 1000)),
            timestamp: this.completedAt,
            isUnassisted: !item.hasSeenExplanationBefore,
            hasSeenExplanationBefore: !!item.hasSeenExplanationBefore,
          };
          state.isUnanswered = false;
          state.isFinalAnswerSubmitted = true;
          state.isCorrectFinal = isCorrect;
        } else {
          // Unanswered item
          state.isUnanswered = true;
          state.isFinalAnswerSubmitted = true;
          state.isCorrectFinal = false;
        }
      } else {
        // Study mode: if learner never clicked verify, mark unanswered or evaluate draft
        if (state.firstResponse === null) {
          state.isUnanswered = true;
          state.isCorrectFinal = false;
        }
      }
    }

    this.finalResult = this.exportResults();
    return structuredClone(this.finalResult);
  }

  /**
   * Generate comprehensive SessionResultExport for Agent C and UI consumers.
   */
  public exportResults(): SessionResultExport {
    if (this.finalResult) return structuredClone(this.finalResult);
    const completedTime = this.completedAt || new Date(this.clock.now()).toISOString();
    const durationSeconds = Math.max(0, Math.floor((Date.parse(completedTime) - Date.parse(this.startTime)) / 1000));

    let answeredCount = 0;
    let unansweredCount = 0;
    let flaggedCount = 0;
    let firstResponseCorrectCount = 0;

    const domainBuckets: Record<StandardDomainArea, { total: number; answered: number; correctFirst: number }> = {
      geometry: { total: 0, answered: 0, correctFirst: 0 },
      functions: { total: 0, answered: 0, correctFirst: 0 },
      statistics: { total: 0, answered: 0, correctFirst: 0 },
    };

    const cogBuckets: Record<CognitiveLevel, { total: number; answered: number; correctFirst: number }> = {
      reproduccion: { total: 0, answered: 0, correctFirst: 0 },
      conexion: { total: 0, answered: 0, correctFirst: 0 },
      reflexion: { total: 0, answered: 0, correctFirst: 0 },
    };

    const diffBuckets: Record<DifficultyTier, { total: number; answered: number; correctFirst: number }> = {
      1: { total: 0, answered: 0, correctFirst: 0 },
      2: { total: 0, answered: 0, correctFirst: 0 },
      3: { total: 0, answered: 0, correctFirst: 0 },
    };

    const evidenceBuckets = new Map<string, {
      code: string;
      domain: StandardDomainArea;
      total: number;
      answered: number;
      correctFirst: number;
    }>();

    const attemptsMap: SessionResultExport['attempts'] = {};

    for (const item of this.items) {
      const state = this.itemStates.get(item.id)!;
      const isAnswered = !state.isUnanswered && state.firstResponse !== null;

      if (state.flaggedForReview) flaggedCount++;

      if (isAnswered) {
        answeredCount++;
        if (state.firstResponse?.isCorrect) {
          firstResponseCorrectCount++;
        }
      } else {
        unansweredCount++;
      }

      // Domain breakdown
      const dom = item.domain;
      if (domainBuckets[dom]) {
        domainBuckets[dom].total++;
        if (isAnswered) {
          domainBuckets[dom].answered++;
          if (state.firstResponse?.isCorrect) domainBuckets[dom].correctFirst++;
        }
      }

      // Cognitive breakdown
      const cog = item.cognitiveLevel;
      if (cogBuckets[cog]) {
        cogBuckets[cog].total++;
        if (isAnswered) {
          cogBuckets[cog].answered++;
          if (state.firstResponse?.isCorrect) cogBuckets[cog].correctFirst++;
        }
      }

      // Difficulty breakdown
      const diff = item.difficultyTier;
      if (diffBuckets[diff]) {
        diffBuckets[diff].total++;
        if (isAnswered) {
          diffBuckets[diff].answered++;
          if (state.firstResponse?.isCorrect) diffBuckets[diff].correctFirst++;
        }
      }

      // Evidence breakdown
      if (!evidenceBuckets.has(item.evidenceId)) {
        evidenceBuckets.set(item.evidenceId, {
          code: item.evidenceCode,
          domain: item.domain,
          total: 0,
          answered: 0,
          correctFirst: 0,
        });
      }
      const evBucket = evidenceBuckets.get(item.evidenceId)!;
      evBucket.total++;
      if (isAnswered) {
        evBucket.answered++;
        if (state.firstResponse?.isCorrect) evBucket.correctFirst++;
      }

      attemptsMap[item.id] = {
        itemId: item.id,
        familyId: item.familyId,
        evidenceId: item.evidenceId,
        domain: item.domain,
        cognitiveLevel: item.cognitiveLevel,
        difficultyTier: item.difficultyTier,
        firstResponse: state.firstResponse,
        retries: state.retryAttempts,
        unanswered: state.isUnanswered,
        finalCorrect: state.isCorrectFinal,
      };
    }

    const calcPct = (num: number, den: number) => (den > 0 ? Math.round((num / den) * 1000) / 10 : 0);

    const domainBreakdowns: Record<StandardDomainArea, DomainScoreBreakdown> = {
      geometry: {
        domain: 'geometry',
        totalItems: domainBuckets.geometry.total,
        answeredCount: domainBuckets.geometry.answered,
        correctFirstResponseCount: domainBuckets.geometry.correctFirst,
        scorePercentage: calcPct(domainBuckets.geometry.correctFirst, domainBuckets.geometry.total),
      },
      functions: {
        domain: 'functions',
        totalItems: domainBuckets.functions.total,
        answeredCount: domainBuckets.functions.answered,
        correctFirstResponseCount: domainBuckets.functions.correctFirst,
        scorePercentage: calcPct(domainBuckets.functions.correctFirst, domainBuckets.functions.total),
      },
      statistics: {
        domain: 'statistics',
        totalItems: domainBuckets.statistics.total,
        answeredCount: domainBuckets.statistics.answered,
        correctFirstResponseCount: domainBuckets.statistics.correctFirst,
        scorePercentage: calcPct(domainBuckets.statistics.correctFirst, domainBuckets.statistics.total),
      },
    };

    const cognitiveBreakdowns: Record<CognitiveLevel, CognitiveScoreBreakdown> = {
      reproduccion: {
        cognitiveLevel: 'reproduccion',
        totalItems: cogBuckets.reproduccion.total,
        answeredCount: cogBuckets.reproduccion.answered,
        correctFirstResponseCount: cogBuckets.reproduccion.correctFirst,
        scorePercentage: calcPct(cogBuckets.reproduccion.correctFirst, cogBuckets.reproduccion.total),
      },
      conexion: {
        cognitiveLevel: 'conexion',
        totalItems: cogBuckets.conexion.total,
        answeredCount: cogBuckets.conexion.answered,
        correctFirstResponseCount: cogBuckets.conexion.correctFirst,
        scorePercentage: calcPct(cogBuckets.conexion.correctFirst, cogBuckets.conexion.total),
      },
      reflexion: {
        cognitiveLevel: 'reflexion',
        totalItems: cogBuckets.reflexion.total,
        answeredCount: cogBuckets.reflexion.answered,
        correctFirstResponseCount: cogBuckets.reflexion.correctFirst,
        scorePercentage: calcPct(cogBuckets.reflexion.correctFirst, cogBuckets.reflexion.total),
      },
    };

    const difficultyBreakdowns: Record<DifficultyTier, DifficultyScoreBreakdown> = {
      1: {
        difficultyTier: 1,
        totalItems: diffBuckets[1].total,
        answeredCount: diffBuckets[1].answered,
        correctFirstResponseCount: diffBuckets[1].correctFirst,
        scorePercentage: calcPct(diffBuckets[1].correctFirst, diffBuckets[1].total),
      },
      2: {
        difficultyTier: 2,
        totalItems: diffBuckets[2].total,
        answeredCount: diffBuckets[2].answered,
        correctFirstResponseCount: diffBuckets[2].correctFirst,
        scorePercentage: calcPct(diffBuckets[2].correctFirst, diffBuckets[2].total),
      },
      3: {
        difficultyTier: 3,
        totalItems: diffBuckets[3].total,
        answeredCount: diffBuckets[3].answered,
        correctFirstResponseCount: diffBuckets[3].correctFirst,
        scorePercentage: calcPct(diffBuckets[3].correctFirst, diffBuckets[3].total),
      },
    };

    const evidenceBreakdowns: Record<string, EvidenceScoreBreakdown> = {};
    for (const [evId, evData] of evidenceBuckets.entries()) {
      evidenceBreakdowns[evId] = {
        evidenceId: evId,
        evidenceCode: evData.code,
        domain: evData.domain,
        totalItems: evData.total,
        answeredCount: evData.answered,
        correctFirstResponseCount: evData.correctFirst,
        isMeasured: evData.total > 0,
        scorePercentage: calcPct(evData.correctFirst, evData.total),
      };
    }

    const totalActual = this.items.length;
    const firstResponseScorePercentage = calcPct(firstResponseCorrectCount, totalActual);

    return {
      isFinalized: this.isSubmitted,
      itemSnapshots: structuredClone(this.items),
      deadline: this.deadline === undefined ? undefined : new Date(this.deadline).toISOString(),
      schemaVersion: '1.0.0',
      sessionId: this.sessionId,
      kind: this.policy.kind,
      mode: this.policy.mode,
      programId: 'bxm',
      subjectId: 'matematica',
      specId: '02-2026',
      startTime: this.startTime,
      completedAt: completedTime,
      durationSeconds,
      status: this.terminationStatus,
      totalConfiguredItems: totalActual + this.shortfalls.reduce((acc, s) => acc + s.missing, 0),
      totalActualItems: totalActual,
      totalAnswered: answeredCount,
      totalUnanswered: unansweredCount,
      totalFlagged: flaggedCount,
      firstResponseCorrectCount,
      firstResponseScorePercentage,
      domainBreakdowns,
      cognitiveBreakdowns,
      difficultyBreakdowns,
      evidenceBreakdowns,
      shortfalls: this.shortfalls,
      benchmarkExposed: this.benchmarkExposed,
      attempts: attemptsMap,
    };
  }
}
