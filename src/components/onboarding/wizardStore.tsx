import { createContext, useContext, useState, type ReactNode } from "react";
import { PROGRAM_LEVELS, PROGRAM_SUBJECTS } from "../../services/onboarding/catalog";
import type {
  AgeBand,
  CheckId,
  Certs,
  Confidence,
  Enroll,
  Hours,
  LevelId,
  PlanScope,
  Profile,
  ProgramId,
  Schooling,
  ScienceId,
  Skill,
  StepId,
  StudyStyle,
  SubjectId,
} from "../../services/onboarding/types";
import type {
  EquiparacionPathway,
  OriginSystem,
  RecognizedRecord,
} from "../../services/onboarding/equiparacion";

export type WizardData = {
  step: StepId;
  completedActions: CheckId[];
  program: ProgramId | "unsure" | null;
  subjects: SubjectId[];
  levels: LevelId[];
  includeScience: boolean;
  science: ScienceId | null;
  language: 'ingles' | 'frances' | null;
  age: AgeBand | null;
  adolescentMother: boolean | null;
  formalBachillerato: boolean | null;
  schooling: Schooling | null;
  literacy: Skill | null;
  numeracy: Skill | null;
  foreignStudies: boolean | null;
  studyStyle: StudyStyle | null;
  enrolled: Enroll | null;
  firstEnrollment: boolean | null;
  knowsWindow: boolean | null;
  hasId: boolean | null;
  certificates: Certs | null;
  recognition: boolean | null;
  recordOnFile: boolean | null;
  recognitionResolved: boolean | null;
  // Equiparación interactive configuration
  equiparacionPathway: EquiparacionPathway | null;
  equiparacionOrigin: OriginSystem | null;
  equiparacionRecords: RecognizedRecord[];
  hasForeignResolution: boolean | null;
  hours: Hours | null;
  materials: boolean | null;
  confidence: Confidence | null;
};

type WizardStore = WizardData & {
  patch: (partial: Partial<WizardData>) => void;
  selectProgram: (program: ProgramId | "unsure") => void;
  reset: () => void;
};

export const initialWizard: WizardData = {
  step: "meta",
  completedActions: [],
  program: null,
  subjects: [],
  levels: [],
  includeScience: false,
  science: null,
  language: null,
  age: null,
  adolescentMother: null,
  formalBachillerato: null,
  schooling: null,
  literacy: null,
  numeracy: null,
  foreignStudies: null,
  studyStyle: null,
  enrolled: null,
  firstEnrollment: null,
  knowsWindow: null,
  hasId: null,
  certificates: null,
  recognition: null,
  recordOnFile: null,
  recognitionResolved: null,
  equiparacionPathway: null,
  equiparacionOrigin: null,
  equiparacionRecords: [],
  hasForeignResolution: null,
  hours: null,
  materials: null,
  confidence: null,
};

function scopeFor(program: ProgramId): Pick<WizardData, "subjects" | "levels" | "includeScience" | "science" | "language"> {
  return {
    subjects: [...PROGRAM_SUBJECTS[program]],
    levels: [...PROGRAM_LEVELS[program]],
    includeScience: program === "edad" || program === "bxm",
    science: null,
    language: null,
  };
}

const WizardContext = createContext<WizardStore | null>(null);

// Session-only answers: closing the guide preserves progress, reloading clears it.
// No personal profile, age exception or document status is written to browser storage.
export function WizardProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<WizardData>(initialWizard);
  const value: WizardStore = {
    ...data,
    patch: partial => setData(previous => ({ ...previous,
      ...(partial.equiparacionPathway !== undefined && partial.equiparacionPathway !== previous.equiparacionPathway ? { equiparacionRecords: [], equiparacionOrigin: null, hasForeignResolution: null, recognitionResolved: null } : {}),
      ...partial,
      ...(partial.equiparacionRecords === undefined &&
        ((partial.language !== undefined && partial.language !== previous.language) || (partial.science !== undefined && partial.science !== previous.science))
        ? { equiparacionRecords: previous.equiparacionRecords.filter(record =>
            !(partial.language !== undefined && partial.language !== previous.language && record.subject === "idioma") &&
            !(partial.science !== undefined && partial.science !== previous.science && record.subject === "ciencias")) } : {}),
    })),
    selectProgram: program => setData(previous => previous.program === program ? previous : ({ ...previous, program, step: "meta",
      completedActions: [], enrolled: null, firstEnrollment: null, recordOnFile: null, certificates: null, recognition: null,
      equiparacionPathway: null, equiparacionOrigin: null, equiparacionRecords: [], hasForeignResolution: null, recognitionResolved: null,
      ...(program === "unsure" ? { subjects: [], levels: [], includeScience: false, science: null, language: null } : scopeFor(program)),
    })),
    reset: () => setData({ ...initialWizard }),
  };
  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
}

export function useWizard<T = WizardStore>(selector?: (state: WizardStore) => T): T {
  const state = useContext(WizardContext);
  if (!state) throw new Error("WizardProvider is required");
  return (selector ? selector(state) : state) as T;
}

export function stepsFor(program: WizardData["program"], recognition?: boolean | null): StepId[] {
  const needsEquiparacion = Boolean(recognition && program && program !== "unsure");
  if (program && program !== "unsure") {
    return needsEquiparacion
      ? ["meta", "alcance", "perfil", "equiparacion", "situacion", "ruta"]
      : ["meta", "alcance", "perfil", "situacion", "ruta"];
  }
  return ["meta", "perfil", "situacion", "ruta"];
}

export function scopeFrom(data: WizardData): PlanScope {
  return {
    language: data.language,
    subjects: data.subjects,
    levels: data.levels,
    includeScience: data.includeScience,
    science: data.science,
  };
}

export function profileFrom(data: WizardData): Profile | null {
  if (!data.age || !data.schooling) return null;
  return {
    age: data.age, schooling: data.schooling, adolescentMother: data.adolescentMother ?? false, formalBachillerato: data.formalBachillerato ?? false,
    literacy: data.literacy || 'basic', numeracy: data.numeracy || 'basic', foreignStudies: data.foreignStudies ?? false, studyStyle: data.studyStyle || 'unsure',
    enrolled: data.enrolled || 'unsure', firstEnrollment: data.firstEnrollment ?? true, knowsWindow: data.knowsWindow ?? false, hasId: data.hasId ?? false,
    certificates: data.certificates || 'missing', recognition: Boolean(data.recognition && data.equiparacionPathway !== "same_program" && data.recognitionResolved !== true && !(data.equiparacionPathway === "foreign_homologation" && data.hasForeignResolution === true)), hours: data.hours || '0-2', materials: data.materials ?? false, confidence: data.confidence || 'mid',
    recordOnFile: data.recordOnFile,
    hasForeignResolution: data.hasForeignResolution,
    unconfirmed: Object.entries(data).filter(([, value]) => value === null).map(([key]) => key),
  };
}
