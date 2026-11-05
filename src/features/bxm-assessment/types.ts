/**
 * BXM Mathematics 02-2026 Assessment & Practice Session Boundary Types
 * Agent B - Exclusive Ownership (`src/features/bxm-assessment/`)
 * Compliant with CONSOLIDATED DECISIONS v1.
 */

export type StandardDomainArea = 'geometry' | 'functions' | 'statistics';
export type CognitiveLevel = 'reproduccion' | 'conexion' | 'reflexion';
export type DifficultyTier = 1 | 2 | 3;

export type SessionKind =
  | 'diagnostic'
  | 'topic_practice'
  | 'evidence_practice'
  | 'mastery_check'
  | 'retest'
  | 'mock_exam'
  | 'micro_quiz';

export type SessionMode = 'study' | 'exam';

export type OptionLetter = 'A' | 'B' | 'C' | 'D';

/**
 * Standard learner-reported reasons for incorrect answers.
 * Used when authored misconception mapping is absent.
 */
export type LearnerReportedReason =
  | 'formula_selection'
  | 'algebraic_manipulation'
  | 'arithmetic'
  | 'graph_reading'
  | 'misread_question'
  | 'concept_misunderstanding'
  | 'unknown';

export interface DistractorExplanation {
  option: OptionLetter;
  explanation: string;
  misconceptionId?: string;
  misconceptionLabel?: string;
}

export interface AssessmentItemOption {
  letter: OptionLetter;
  text: string;
}

export interface AssessmentItem {
  id: string | number;
  code?: string;
  familyId?: string;
  templateVersion?: string;
  provenance: 'authored' | 'official_benchmark' | 'official_past' | 'generated_isomorph';
  reviewStatus: 'unreviewed' | 'computationally_checked' | 'expert_reviewed' | 'certified';
  domain: StandardDomainArea;
  topic?: string;
  evidenceCode: string; // Raw code e.g. 'A1.2'
  evidenceId: string;   // Canonical domain-qualified key e.g. 'bxm/matematica/02-2026/geometry/A1.2'
  conceptId?: string;
  linkedConceptIds?: string[];
  cognitiveLevel: CognitiveLevel;
  difficultyTier: DifficultyTier;
  stem: string;
  options: Record<OptionLetter, string> | AssessmentItemOption[];
  correctAnswer: OptionLetter;
  solutionSteps?: Array<string | { step: number; title: string; explanation: string }>;
  distractorExplanations?: Record<OptionLetter, DistractorExplanation>;
  hints?: string[];
  formulaAccessAllowed?: boolean;
  calculatorAllowed?: boolean;
}

export interface AssessmentPolicy {
  mode: SessionMode;
  kind: SessionKind;
  timeLimitMinutes?: number;
  enableTimer: boolean;
  allowHints: boolean;
  allowRetries: boolean;
  allowImmediateFeedback: boolean;
  allowFormulaSheet: boolean;
  allowCalculator: boolean;
  maxRetriesPerItem?: number;
  allowOfficialFallback?: boolean;
}

export interface ItemSelectionShortfall {
  domain: StandardDomainArea;
  requested: number;
  available: number;
  missing: number;
}

export interface BlueprintSelectionResult {
  items: AssessmentItem[];
  shortfalls: ItemSelectionShortfall[];
  isPartial: boolean;
  policyVersion: string;
  seed: number;
  totalRequested: number;
  totalSelected: number;
}

export interface ResponseAttemptEvent {
  eventId: string;
  attemptIndex: number; // 0 = first response, 1 = retry 1, etc.
  selectedOption: OptionLetter | null;
  isCorrect: boolean;
  hintsUsedBeforeResponse: number;
  timeSpentSeconds: number;
  timestamp: string; // ISO-8601 UTC
  isUnassisted: boolean;
  learnerReportedReason?: LearnerReportedReason;
  authoredMisconception?: {
    misconceptionId?: string;
    label?: string;
    explanation?: string;
  };
}

export interface ItemSessionState {
  item: AssessmentItem;
  flaggedForReview: boolean;
  draftOption: OptionLetter | null;
  firstResponse: ResponseAttemptEvent | null;
  retryAttempts: ResponseAttemptEvent[];
  hintsRevealed: number;
  isFinalAnswerSubmitted: boolean;
  isCorrectFinal: boolean;
  isUnanswered: boolean;
}

export interface DomainScoreBreakdown {
  domain: StandardDomainArea;
  totalItems: number;
  answeredCount: number;
  correctFirstResponseCount: number;
  scorePercentage: number;
}

export interface CognitiveScoreBreakdown {
  cognitiveLevel: CognitiveLevel;
  totalItems: number;
  answeredCount: number;
  correctFirstResponseCount: number;
  scorePercentage: number;
}

export interface DifficultyScoreBreakdown {
  difficultyTier: DifficultyTier;
  totalItems: number;
  answeredCount: number;
  correctFirstResponseCount: number;
  scorePercentage: number;
}

export interface EvidenceScoreBreakdown {
  evidenceId: string;
  evidenceCode: string;
  domain: StandardDomainArea;
  totalItems: number;
  answeredCount: number;
  correctFirstResponseCount: number;
  isMeasured: boolean;
  scorePercentage: number;
}

export interface SessionResultExport {
  schemaVersion: '1.0.0';
  sessionId: string;
  kind: SessionKind;
  mode: SessionMode;
  programId: 'bxm';
  subjectId: 'matematica';
  specId: '02-2026';
  startTime: string; // UTC ISO
  completedAt: string; // UTC ISO
  durationSeconds: number;
  status: 'completed' | 'timed_out' | 'abandoned';
  totalConfiguredItems: number;
  totalActualItems: number;
  totalAnswered: number;
  totalUnanswered: number;
  totalFlagged: number;
  firstResponseCorrectCount: number;
  firstResponseScorePercentage: number;
  domainBreakdowns: Record<StandardDomainArea, DomainScoreBreakdown>;
  cognitiveBreakdowns: Record<CognitiveLevel, CognitiveScoreBreakdown>;
  difficultyBreakdowns: Record<DifficultyTier, DifficultyScoreBreakdown>;
  evidenceBreakdowns: Record<string, EvidenceScoreBreakdown>;
  shortfalls: ItemSelectionShortfall[];
  benchmarkExposed: boolean;
  attempts: Record<string | number, {
    itemId: string | number;
    familyId?: string;
    evidenceId: string;
    domain: StandardDomainArea;
    cognitiveLevel: CognitiveLevel;
    difficultyTier: DifficultyTier;
    firstResponse: ResponseAttemptEvent | null;
    retries: ResponseAttemptEvent[];
    unanswered: boolean;
    finalCorrect: boolean;
  }>;
}

/**
 * Injected Clock Provider to enable deterministic time testing
 */
export interface ClockProvider {
  now(): number;
}

/**
 * Helper to construct stable domain-qualified evidence key
 */
export function buildEvidenceKey(
  domain: StandardDomainArea,
  rawEvidenceCode: string,
  specId: string = '02-2026'
): string {
  return `bxm/matematica/${specId}/${domain}/${rawEvidenceCode.trim()}`;
}
