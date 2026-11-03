export const PROGRAM_ORDER = ["i-ii", "iii", "edad", "bxm"] as const;

export type ProgramId = (typeof PROGRAM_ORDER)[number];

export type AgeBand = "under-14" | "14-15" | "16-17" | "18-plus";

export type Schooling =
  | "no-primary"
  | "primary"
  | "partial-iii"
  | "ninth"
  | "partial-div"
  | "bachiller";

export type Skill = "solid" | "basic" | "not-yet";

export type StudyStyle = "supported" | "self" | "unsure";

export type Enroll = "enrolled" | "in-process" | "not-yet" | "unsure";

export type Certs = "ready" | "partial" | "missing";

export type Hours = "0-2" | "3-5" | "6-10" | "10-plus";

export type Confidence = "low" | "mid" | "high";

export type LevelId = "7" | "8" | "9" | "10" | "11";

export type SubjectId =
  | "ciencias"
  | "espanol"
  | "formacion-ciudadana"
  | "matematica"
  | "estudios-sociales"
  | "idioma"
  | "educacion-civica";

export type ScienceId = "biologia" | "fisica" | "quimica";

export type Fit = "eligible" | "conditional" | "blocked" | "surpassed";

export type Reason =
  | "age-min-14"
  | "age-min-16"
  | "age-min-18"
  | "age-ok"
  | "literacy-gap"
  | "numeracy-gap"
  | "skills-ok"
  | "needs-primary"
  | "needs-ninth"
  | "primary-surpassed"
  | "ninth-surpassed"
  | "title-surpassed"
  | "bxm-mother"
  | "bxm-formal"
  | "partial-iii"
  | "partial-div"
  | "eligible-clean"
  | "skills-unconfirmed";

export type CheckId =
  | "confirm-dates"
  | "yo-aplico"
  | "payment"
  | "grade-record"
  | "photo-new"
  | "email"
  | "bring-id"
  | "certificates"
  | "recognition"
  | "no-recognition"
  | "foreign-dgec"
  | "regional-signature"
  | "no-calculator"
  | "calculator-iii"
  | "no-swap"
  | "punctuality"
  | "allowed-materials"
  | "two-parts"
  | "prueba1-gate"
  | "all-levels"
  | "track-window"
  | "enroll"
  | "hours"
  | "materials"
  | "diagnostic-review"
  | "confirm-exception"
  | "align-topology"
  | "wait-age"
  | "build-literacy"
  | "build-numeracy"
  | "five-tests";

export type StepId = "meta" | "alcance" | "perfil" | "equiparacion" | "situacion" | "ruta";

export type Profile = {
  unconfirmed?: string[];
  age: AgeBand;
  adolescentMother: boolean;
  formalBachillerato: boolean;
  schooling: Schooling;
  literacy: Skill;
  numeracy: Skill;
  foreignStudies: boolean;
  studyStyle: StudyStyle;
  enrolled: Enroll;
  firstEnrollment: boolean;
  knowsWindow: boolean;
  hasId: boolean;
  certificates: Certs;
  recognition: boolean;
  hours: Hours;
  materials: boolean;
  confidence: Confidence;
};

export type PlanScope = {
  language?: 'ingles' | 'frances' | null;
  subjects: SubjectId[];
  levels: LevelId[];
  includeScience: boolean;
  science: ScienceId | null;
};

export type ExamItem = {
  label: string;
  tests: number;
};

export type ExamPlan = {
  program: ProgramId;
  items: ExamItem[];
  totalTests: number;
  fee: number;
  pass: number;
  sciencePending: boolean;
};

export type ProgramAssessment = {
  fit: Fit;
  reasons: Reason[];
};

export type Report = {
  fits: Record<ProgramId, ProgramAssessment>;
  recommended: ProgramId | null;
  chosen: ProgramId | null;
  /** Program the checklist refers to, if one is open. */
  focus: ProgramId | null;
  chosenFit: Fit | null;
  actions: CheckId[];
  rules: CheckId[];
  plan: ExamPlan | null;
};
