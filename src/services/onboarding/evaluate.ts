import type {
  AgeBand,
  CheckId,
  ExamPlan,
  Fit,
  LevelId,
  PlanScope,
  Profile,
  ProgramAssessment,
  ProgramId,
  Reason,
  Report,
  Schooling,
} from "./types.ts";
import {
  FEE_COLONES,
  PROGRAM_LEVELS,
  PROGRAM_SUBJECTS,
  PROGRAMS,
  SCIENCE_LABEL,
  subjectLabel,
  LEVEL_LABEL,
  testsPerSubject,
} from "./catalog.ts";

const AGE_ORDER: AgeBand[] = ["under-14", "14-15", "16-17", "18-plus"];

function ageAtLeast(age: AgeBand, min: AgeBand): boolean {
  return AGE_ORDER.indexOf(age) >= AGE_ORDER.indexOf(min);
}

function hasPrimary(schooling: Schooling): boolean {
  return schooling !== "no-primary";
}

function hasNinth(schooling: Schooling): boolean {
  return schooling === "ninth" || schooling === "partial-div" || schooling === "bachiller";
}

function fit(fit: Fit, reasons: Reason[], blockers: Reason[] = []): ProgramAssessment {
  return { fit, reasons: fit === "blocked" ? blockers : reasons };
}

function assessIii(profile: Profile): ProgramAssessment {
  if (hasNinth(profile.schooling)) return fit("surpassed", ["ninth-surpassed"]);
  if (!hasPrimary(profile.schooling)) return fit("blocked", [], ["needs-primary"]);
  if (!ageAtLeast(profile.age, "14-15")) return fit("blocked", [], ["age-min-14"]);
  if (profile.schooling === "partial-iii") return fit("conditional", ["partial-iii", "age-ok"]);
  return fit("eligible", ["eligible-clean", "age-ok"]);
}

function assessPrimary(profile: Profile): ProgramAssessment {
  if (hasPrimary(profile.schooling)) return fit("surpassed", ["primary-surpassed"]);
  const blockers: Reason[] = [];
  if (!ageAtLeast(profile.age, "14-15")) blockers.push("age-min-14");
  if (profile.literacy === "not-yet") blockers.push("literacy-gap");
  if (profile.numeracy === "not-yet") blockers.push("numeracy-gap");
  if (blockers.length > 0) return fit("blocked", [], blockers);
  if (profile.unconfirmed?.some(field => field === "literacy" || field === "numeracy")) return fit("conditional", ["skills-unconfirmed", "age-ok"]);
  return fit("eligible", ["skills-ok", "age-ok"]);
}

function assessEdad(profile: Profile): ProgramAssessment {
  if (profile.schooling === "bachiller") return fit("surpassed", ["title-surpassed"]);
  const blockers: Reason[] = [];
  if (!hasNinth(profile.schooling)) blockers.push("needs-ninth");
  if (!ageAtLeast(profile.age, "16-17")) blockers.push("age-min-16");
  if (blockers.length > 0) return fit("blocked", [], blockers);
  if (profile.schooling === "partial-div") return fit("conditional", ["partial-div", "age-ok"]);
  return fit("eligible", ["eligible-clean", "age-ok"]);
}

function assessBxm(profile: Profile): ProgramAssessment {
  if (profile.schooling === "bachiller") return fit("surpassed", ["title-surpassed"]);
  if (!hasNinth(profile.schooling)) return fit("blocked", [], ["needs-ninth"]);
  const partial = profile.schooling === "partial-div" ? (["partial-div"] as Reason[]) : [];
  if (ageAtLeast(profile.age, "18-plus")) {
    return partial.length > 0
      ? fit("conditional", ["eligible-clean", ...partial])
      : fit("eligible", ["eligible-clean", "age-ok"]);
  }
  const exceptions: Reason[] = [];
  if (profile.adolescentMother) exceptions.push("bxm-mother");
  if (profile.formalBachillerato) exceptions.push("bxm-formal");
  if (exceptions.length > 0) return fit("conditional", [...exceptions, ...partial]);
  return fit("blocked", [], ["age-min-18"]);
}

export function assessAll(profile: Profile): Record<ProgramId, ProgramAssessment> {
  return {
    "i-ii": assessPrimary(profile),
    iii: assessIii(profile),
    edad: assessEdad(profile),
    bxm: assessBxm(profile),
  };
}

function isOpen(assessment: ProgramAssessment): boolean {
  return assessment.fit === "eligible" || assessment.fit === "conditional";
}

export function recommendProgram(
  fits: Record<ProgramId, ProgramAssessment>,
  style: Profile["studyStyle"],
): ProgramId | null {
  if (isOpen(fits["i-ii"])) return "i-ii";
  if (isOpen(fits.iii)) return "iii";
  const edad = isOpen(fits.edad);
  const bxm = isOpen(fits.bxm);
  if (edad && bxm) return style === "self" ? "bxm" : "edad";
  if (edad) return "edad";
  if (bxm) return "bxm";
  return null;
}

export function examPlan(program: ProgramId, scope: PlanScope, allowPendingScience: boolean): ExamPlan {
  const per = testsPerSubject(program, scope.levels.length > 0 ? scope.levels : PROGRAM_LEVELS[program]);
  const items = scope.subjects.map((subject) => ({
    label: subject === 'idioma' && scope.language ? (scope.language === 'ingles' ? 'Inglés' : 'Francés') : subjectLabel(program, subject),
    tests: per,
  }));
  const scienceProgram = program === "edad" || program === "bxm";
  let sciencePending = false;
  if (scienceProgram && scope.includeScience) {
    if (scope.science) {
      items.push({ label: `Ciencias · ${SCIENCE_LABEL[scope.science]}`, tests: per });
    } else if (allowPendingScience) {
      sciencePending = true;
      items.push({ label: "Ciencias · aún sin elegir", tests: per });
    }
  }
  const totalTests = items.reduce((sum, item) => sum + item.tests, 0);
  return {
    program,
    items,
    totalTests,
    fee: totalTests * FEE_COLONES,
    pass: PROGRAMS[program].pass,
    sciencePending,
  };
}

export function fullScope(program: ProgramId): PlanScope {
  return {
    subjects: [...PROGRAM_SUBJECTS[program]],
    levels: [...PROGRAM_LEVELS[program]],
    includeScience: program === "edad" || program === "bxm",
    science: null,
  };
}

function unique(ids: CheckId[]): CheckId[] {
  return [...new Set(ids)];
}

function buildLists(
  focus: ProgramId | null,
  fits: Record<ProgramId, ProgramAssessment>,
  profile: Profile,
): { actions: CheckId[]; rules: CheckId[] } {
  if (!focus || !isOpen(fits[focus])) {
    const nearest: ProgramId = !hasPrimary(profile.schooling)
      ? "i-ii"
      : !hasNinth(profile.schooling)
        ? "iii"
        : fits.edad.reasons.includes("age-min-16")
          ? "edad"
          : "bxm";
    const blockers = fits[nearest].fit === "blocked" ? fits[nearest].reasons : [];
    const actions: CheckId[] = [];
    if (blockers.includes("age-min-14") || blockers.includes("age-min-16") || blockers.includes("age-min-18")) {
      actions.push("wait-age");
    }
    if (blockers.includes("literacy-gap") || profile.literacy === "not-yet") actions.push("build-literacy");
    if (blockers.includes("numeracy-gap") || profile.numeracy === "not-yet") actions.push("build-numeracy");
    return { actions: unique(actions), rules: [] };
  }

  const program = focus;
  const actions: CheckId[] = ["confirm-dates"];
  const rules: CheckId[] = ["align-topology"];

  if (!profile.hasId) actions.push("bring-id");
  if (program !== "i-ii" && profile.certificates !== "ready") actions.push("certificates");
  if ((program === "edad" || program === "bxm") && profile.certificates !== "ready") {
    actions.push("regional-signature");
  }
  if (profile.recognition && program !== "i-ii") actions.push("recognition");
  if (profile.recognition && program === "i-ii") rules.push("no-recognition");
  if (profile.foreignStudies && program !== "i-ii") actions.push("foreign-dgec");
  if (
    program === "bxm" &&
    (fits.bxm.reasons.includes("bxm-mother") || fits.bxm.reasons.includes("bxm-formal"))
  ) {
    actions.push("confirm-exception");
  }

  if (profile.enrolled === "enrolled" || profile.enrolled === "in-process") actions.push("track-window");
  else actions.push("enroll");
  if (profile.enrolled !== "enrolled") actions.push("yo-aplico", "payment", "grade-record");
  if ((profile.firstEnrollment || program === 'edad') && profile.enrolled !== "enrolled") actions.push("photo-new");
  if (profile.firstEnrollment && program === "iii") actions.push("email");

  if (profile.hours === "0-2") actions.push("hours");
  if (!profile.materials) actions.push("materials");
  if (profile.confidence === "low") actions.push("diagnostic-review");

  if (program === "i-ii") rules.push("five-tests", "punctuality", "no-calculator");
  if (program === "iii") rules.push("all-levels", "calculator-iii", "no-swap");
  if (program === "edad") rules.push("two-parts", "prueba1-gate");
  if (program === "bxm") rules.push("allowed-materials");

  return { actions: unique(actions), rules: unique(rules) };
}

export type Answers = {
  profile: Profile;
  chosen: ProgramId | "unsure";
  scope: PlanScope | null;
};

export function buildReport(answers: Answers): Report {
  const fits = assessAll(answers.profile);
  const recommended = recommendProgram(fits, answers.profile.studyStyle);
  const chosen = answers.chosen === "unsure" ? null : answers.chosen;
  const chosenFit = chosen ? fits[chosen].fit : null;
  const chosenOpen = chosen ? isOpen(fits[chosen]) : false;
  const focus = chosenOpen ? chosen : recommended;

  let plan: ExamPlan | null = null;
  if (focus) {
    const chosenScope = chosenOpen && answers.scope ? answers.scope : null;
    plan = examPlan(focus, chosenScope ?? fullScope(focus), chosenScope === null);
  }

  const { actions, rules } = buildLists(focus, fits, answers.profile);

  return { fits, recommended, chosen, focus, chosenFit, actions, rules, plan };
}

export function levelPhrase(levels: LevelId[]): string {
  if (levels.length === 0) return "";
  return levels.map((level) => LEVEL_LABEL[level]).join(", ");
}

export function programNeedsScope(program: ProgramId | "unsure" | null): program is ProgramId {
  return program !== null && program !== "unsure";
}

export function scopeIsComplete(program: ProgramId, scope: PlanScope): boolean {
  const count = scope.subjects.length + (scope.includeScience ? 1 : 0);
  if (count < 1) return false;
  if ((program === "iii" || program === "edad") && scope.levels.length < 1) return false;
  if ((program === "edad" || program === "bxm") && scope.includeScience && !scope.science) return false;
  if ((program === 'edad' || program === 'bxm') && scope.subjects.includes('idioma') && !scope.language) return false;
  return true;
}
