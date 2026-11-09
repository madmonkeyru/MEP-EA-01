import type {
  AssessmentBlueprint,
  CognitiveLevel,
  ContentStream,
  CurriculumVersion,
  OptionId,
  ProgramId,
  Question,
} from '@mep-ea/domain';

/**
 * Authoring contract for an individual pedagogical lesson matching LearningLesson schema.
 */
export interface AuthoredLesson {
  id: string;
  domain: string;
  evidenceKey: string;
  evidenceCode: string;
  title: string;
  subtitle: string;
  conceptIds: string[];
  prerequisites: string[];
  formulas?: { name: string; latex: string; notes: string }[];
  coreExplanation: string;
  commonMistakes: {
    mistake: string;
    description: string;
    correction: string;
  }[];
  workedExample: {
    statement: string;
    primaryMethod: {
      name: string;
      steps: string[];
    };
    alternativeMethod?: {
      name: string;
      steps: string[];
    };
  };
  interactiveVisualType?: string | null;
  microQuiz: {
    id: string;
    question: string;
    options: {
      A: string;
      B: string;
      C: string;
      D: string;
    };
    correctOption: OptionId;
    explanation: string;
  }[];
}

/**
 * Authoring contract for a single assessment question.
 */
export interface AuthoredQuestionItem {
  id: string;
  version: string;
  programId: ProgramId;
  subjectId: string;
  domainId: string;
  evidenceId: string;
  conceptIds: string[];
  familyId: string;
  cognitiveLevel: CognitiveLevel;
  stream: ContentStream;
  stem: string;
  options: {
    id: OptionId;
    text: string;
    rationale?: string;
  }[];
  correctOptionId: OptionId;
  requiresVisual: boolean;
  visual?: Question['visual'];
  solution: string[];
  curriculumVersionId?: string;
  provenance: {
    source: string;
    status: 'source_unverified' | 'authored_computationally_checked' | 'verified';
  };
  publication: {
    status: 'draft' | 'published';
    signoff?: {
      reviewerId: string;
      reviewedAt: string;
      gates: ['A', 'B', 'C', 'D'];
    };
  };
}

/**
 * Complete declarative authoring package for an educational subject convocatoria.
 */
export interface SubjectAuthoringPackage {
  schemaVersion: '1.0.0';
  program: {
    id: ProgramId;
    name: string;
  };
  subject: {
    id: string;
    name: string;
  };
  curriculumVersion: CurriculumVersion;
  domains: {
    id: string;
    name: string;
  }[];
  concepts: {
    id: string;
    domainId: string;
    name: string;
    prerequisiteIds: string[];
  }[];
  evidences: {
    id: string;
    domainId: string;
    affirmationCode: string;
    description: string;
    conceptIds: string[];
  }[];
  lessons: AuthoredLesson[];
  questions: AuthoredQuestionItem[];
  blueprints: AssessmentBlueprint[];
}
