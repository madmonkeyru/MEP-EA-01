/** Product contracts: no UI, storage, transport or framework dependencies. */
export type ProgramId = 'bxm' | 'edad' | 'iii_ciclo' | 'i_ii_ciclo';
export type OptionId = 'A' | 'B' | 'C' | 'D';
export type ContentStream = 'authored' | 'official_reference';
export type CognitiveLevel = 'reproduccion' | 'conexion' | 'reflexion';
export type AssessmentMode = 'diagnostic' | 'practice' | 'benchmark';
export interface Program { id: ProgramId; name: string; subjectIds: string[] }
export interface Subject { id: string; programId: ProgramId; name: string }
export interface CurriculumDomain { id: string; subjectId: string; name: string }
export interface Concept { id: string; domainId: string; name: string; prerequisiteIds: string[] }
export interface Evidence { id: string; domainId: string; affirmationCode: string; description: string; conceptIds: string[] }
export interface CurriculumTaxonomy {
  programs: Program[]; subjects: Subject[]; domains: CurriculumDomain[]; concepts: Concept[]; evidences: Evidence[];
}
export type VisualSpecification = {
  kind: 'coordinate-plane'; alt: string; xRange: [number, number]; yRange: [number, number];
  points: { x: number; y: number; label: string }[];
} | { kind: 'circle'; alt: string; center: [number, number]; radius: number };
export interface ReviewSignoff { reviewerId: string; reviewedAt: string; gates: ['A', 'B', 'C', 'D'] }
export interface QuestionOption { id: OptionId; text: string; rationale?: string }
export interface Question {
  id: string; version: string; programId: ProgramId; subjectId: string; domainId: string;
  evidenceId: string; conceptIds: string[]; familyId: string; cognitiveLevel: CognitiveLevel;
  stream: ContentStream; stem: string; options: QuestionOption[]; correctOptionId: OptionId;
  requiresVisual: boolean; visual?: VisualSpecification; solution: string[];
  provenance: { source: string; status: 'source_unverified' | 'authored_computationally_checked' | 'verified' };
  publication: { status: 'draft' | 'published'; signoff?: ReviewSignoff };
}
export interface AssessmentBlueprint {
  id: string; version: string; programId: ProgramId; subjectId: string; convocatoriaId: string;
  mode: AssessmentMode; stream: ContentStream; totalItems: number; timeLimitSeconds: number;
  domainQuotas: { domainId: string; count: number }[];
  evidenceIds?: string[];
}
export interface Assessment { id: string; blueprint: AssessmentBlueprint; questions: Question[] }
export interface Answer { questionId: string; optionId: OptionId; answeredAt: string }
export interface Score {
  items: { questionId: string; evidenceId: string; conceptIds: string[]; correct: boolean; selectedOptionId?: OptionId }[];
  correct: number; total: number; unanswered: number; percentage: number;
  domains: Record<string, { correct: number; total: number }>;
}
export interface Attempt {
  schemaVersion: 1; id: string; learnerId: string; assessmentId: string; assessmentVersion: string;
  questionIds: string[]; status: 'in_progress' | 'submitted'; currentIndex: number;
  answers: Record<string, Answer>; startedAt: string; updatedAt: string;
  deadlineAt: string; submittedAt?: string; score?: Score;
}
export type DiagnosticTier = 'strong' | 'developing' | 'needs_practice';
export interface Diagnostic { attemptId: string; weakEvidenceIds: string[]; generatedAt: string;
  domains: { domainId: string; correct: number; total: number; tier: DiagnosticTier }[];
  provisional: true;
}
export interface RemediationPlan { learnerId: string; conceptIds: string[]; reason: 'diagnostic_weakness' | 'simulation_weakness' | 'remediation_pending';
  activities: { conceptId: string; questionId: string; title: string; steps: string[] }[];
  nextStep: 'practice' | 'reassess';
}
export interface LearningProgress { learnerId: string; evidenceId: string; distinctFamilies: number; accuracy: number; updatedAt: string }
export interface GuidanceEvaluation { programId: ProgramId; requiredSubjectIds: string[]; recognizedSubjectIds: string[]; sourceVersion: string }
