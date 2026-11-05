export type BxmDomain = 'geometry' | 'functions' | 'statistics';

export type CognitiveLevel = 'reproduccion' | 'conexion' | 'reflexion';

export type DifficultyTier = 1 | 2 | 3;

export interface BxmEvidenceNode {
  key: string; // e.g. bxm/matematica/02-2026/geometry/A1.2
  domain: BxmDomain;
  blockCode: string;
  blockName: string;
  affirmationCode: string;
  affirmationDesc: string;
  evidenceCode: string;
  evidenceDesc: string;
  conceptIds: string[];
  status: 'complete' | 'scaffolded_available_soon';
  lessonId: string | null;
  hasInteractiveVisual: boolean;
  reviewStatus: 'canonical_scaffolded' | 'authored_computationally_checked';
}

export interface BxmFormulaItem {
  name: string;
  latex: string;
  notes?: string;
}

export interface BxmCommonMistake {
  mistake: string;
  description: string;
  correction: string;
}

export interface BxmWorkedMethod {
  name: string;
  steps: string[];
}

export interface BxmWorkedExample {
  statement: string;
  primaryMethod: BxmWorkedMethod;
  alternativeMethod?: BxmWorkedMethod;
}

export interface BxmMicroQuizItem {
  id: string;
  question: string;
  options: Record<string, string>;
  correctOption: string;
  explanation: string;
}

export interface BxmLesson {
  id: string;
  domain: BxmDomain;
  evidenceKey: string;
  evidenceCode: string;
  title: string;
  subtitle: string;
  conceptIds: string[];
  prerequisites: string[];
  formulas: BxmFormulaItem[];
  coreExplanation: string;
  commonMistakes: BxmCommonMistake[];
  workedExample: BxmWorkedExample;
  interactiveVisualType: 'circle_inspector' | 'sphere_cross_section' | null;
  microQuiz: BxmMicroQuizItem[];
}

export interface BxmAuthoredItem {
  templateVersion?: string;
  id: string;
  code: string;
  domain: BxmDomain;
  evidenceKey: string;
  evidenceCode: string;
  conceptId: string;
  cognitiveLevel: CognitiveLevel;
  difficulty: DifficultyTier;
  calculatorAllowed: boolean;
  provenance: string;
  reviewStatus: string;
  stem: string;
  options: Record<string, string>;
  correctOption: string;
  distractorRationale: Record<string, string>;
  solutionSteps: string[];
  familyId?: string;
  generatedParams?: Record<string, number | string>;
}

export interface BxmIsomorphicTemplate {
  familyId: string;
  domain: BxmDomain;
  evidenceKey: string;
  evidenceCode: string;
  conceptId: string;
  cognitiveLevel: CognitiveLevel;
  difficulty: DifficultyTier;
  titleTemplate: string;
  description: string;
  parameterRanges: Record<string, unknown>;
  sampleParameters: Record<string, unknown>[];
}

// Injected boundary callbacks for Agent B & C integration
export interface BxmAssessmentCallbacks {
  onMicroQuizAnswered?: (payload: {
    quizId: string;
    evidenceKey: string;
    selectedOption: string;
    isCorrect: boolean;
    timestamp: string;
    eventId?: string;
    responseIndex?: number;
    hintsUsedBeforeResponse?: number;
    hasSeenExplanationBefore?: boolean;
  }) => void;
  onStartTargetedPractice?: (evidenceKey: string) => void;
  onRequestDiagnostic?: () => void;
}

export interface BxmNavigationCallbacks {
  onSelectEvidence?: (evidenceKey: string) => void;
  onBackToTemario?: () => void;
}

export interface BxmCapabilityContext {
  isPremium: boolean;
  canAccessExtendedPractice?: boolean;
}
