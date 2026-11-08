import type { LevelId, ProgramId, ScienceId, SubjectId } from "./types.ts";
import { FEE_COLONES, LEVEL_LABEL, PROGRAM_LEVELS, PROGRAM_SUBJECTS, SCIENCE_LABEL, subjectLabel } from "./catalog.ts";

/**
 * Three official equiparación pathways recognized by MEP DGEC
 */
export type EquiparacionPathway =
  | "same_program"         // Existing approvals in the selected program; no new recognition request
  | "formal_to_abierta"    // Colegio Académico / Técnico / CINDEA / IPEC -> Abierta (III Ciclo, EDAD, BXM)
  | "abierta_to_abierta"   // Transfers between Educación Abierta programs (EDAD <-> BXM)
  | "foreign_homologation"; // Estudios en el extranjero con resolución DGEC / Dirección Regional

export type OriginSystem =
  | "colegio_academico"
  | "colegio_tecnico"
  | "cindea_ipec"
  | "edad"
  | "bxm"
  | "extranjero";

export interface RecognizedRecord {
  subject: SubjectId;
  level?: LevelId; // For III Ciclo (7, 8, 9) or EDAD (10, 11)
  science?: ScienceId; // When subject is 'ciencias' in EDAD or BXM
  originGradeOrScore?: string;
  recognized: boolean;
}

export interface EquiparacionSubmissionGuideline {
  channel: "plataformadgec_email" | "dgec_consultas" | "regional_office" | "foreign_resolution";
  emailTarget?: string;
  portalUrl?: string;
  leadTimeWeeks: number;
  criticalNotice: string;
  requiredDocuments: {
    code: string;
    title: string;
    description: string;
    mandatory: boolean;
  }[];
}

export interface EquiparacionAnalysis {
  pathway: EquiparacionPathway;
  targetProgram: ProgramId;
  recognizedItems: {
    label: string;
    subject: SubjectId;
    level?: LevelId;
    science?: ScienceId;
  }[];
  remainingItems: {
    label: string;
    subject: SubjectId;
    level?: LevelId;
    tests: number;
  }[];
  totalRemainingTests: number;
  estimatedFee: number;
  guidelines: EquiparacionSubmissionGuideline;
  warnings: string[];
}

export interface EquiparacionEvaluationInput {
  pathway: EquiparacionPathway;
  targetProgram: ProgramId;
  originSystem: OriginSystem;
  recognizedRecords: RecognizedRecord[];
  scope?: { subjects: SubjectId[]; levels: LevelId[]; includeScience: boolean };
  chosenLanguage?: "ingles" | "frances";
  chosenScience?: ScienceId;
  hasForeignResolution?: boolean;
  hasRecognition?: boolean;
}

/**
 * Evaluates prior recognition and calculates remaining curriculum load,
 * fees, submission channels, and legal warnings according to MEP DGEC standards.
 */
export function evaluateEquiparacion(input: EquiparacionEvaluationInput): EquiparacionAnalysis {
  const { pathway, targetProgram, recognizedRecords, chosenLanguage = "ingles", chosenScience = "biologia" } = input;
  const warnings: string[] = [];

  // 1. Validation checks
  if (targetProgram === "i-ii") {
    warnings.push("I y II Ciclo (Primaria) no realiza equiparación de materias sueltas de escuela formal; se conserva únicamente lo aprobado dentro de las 5 pruebas oficiales del programa.");
  }

  if (pathway === "foreign_homologation" && !input.hasForeignResolution) {
    warnings.push("Los estudios cursados en el exterior requieren de previo acuerdo de homologación y resolución oficial expedida por el Departamento de Estudios Extranjeros de la DGEC antes de matricular.");
  }

  // A foreign record cannot clear local tests without a resolution. Partial EDAD
  // credits cannot clear the combined BXM test; records without levels represent
  // a complete subject already accredited by DGEC, as requested by the UI.
  if (pathway !== "same_program" && pathway !== "foreign_homologation" && input.hasRecognition === false) {
    warnings.push("El reconocimiento está pendiente de confirmación. Las materias marcadas no se descuentan del total hasta que indiques que la DGEC aprobó su equivalencia.");
  }
  const usableRecords = recognizedRecords.filter(record =>
    !(pathway !== "same_program" && input.hasRecognition === false) &&
    !(pathway === "foreign_homologation" && !input.hasForeignResolution) &&
    !(targetProgram === "i-ii" && pathway !== "same_program") &&
    !(record.subject === "ciencias" && record.science && record.science !== chosenScience)
  );
  const approved = (subject: SubjectId, level?: LevelId) => {
    const has = (grade?: LevelId) => usableRecords.some(record => record.subject === subject && record.recognized && record.level === grade);
    if (pathway === "abierta_to_abierta" && input.originSystem === "edad" && targetProgram === "bxm") return has() || (has("10") && has("11"));
    if (pathway === "abierta_to_abierta" && input.originSystem === "bxm" && targetProgram === "edad") return has();
    return has(level);
  };

  // 2. Identify recognized vs remaining
  const recognizedItems: EquiparacionAnalysis["recognizedItems"] = [];
  const remainingItems: EquiparacionAnalysis["remainingItems"] = [];

  if (targetProgram === "iii") {
    // III Ciclo evaluates by (level: 7, 8, 9) x subjects
    const subjects = PROGRAM_SUBJECTS.iii;
    const levels = PROGRAM_LEVELS.iii;

    levels.forEach((lvl) => {
      subjects.forEach((subj) => {
        const isRecognized = approved(subj, lvl);
        const label = `${subjectLabel("iii", subj)} (${LEVEL_LABEL[lvl]})`;
        if (isRecognized) {
          recognizedItems.push({ label, subject: subj, level: lvl });
        } else {
          remainingItems.push({ label, subject: subj, level: lvl, tests: 1 });
        }
      });
    });
  } else if (targetProgram === "edad") {
    // EDAD: 10° (Parte 1) and 11° (Parte 2). 5 core subjects + 1 science
    const baseSubjects = PROGRAM_SUBJECTS.edad; // espanol, civica, idioma, matematica, sociales
    const levels = PROGRAM_LEVELS.edad; // 10, 11

    levels.forEach((lvl) => {
      baseSubjects.forEach((subj) => {
        const isRecognized = approved(subj, lvl);
        const name = subj === "idioma" ? (chosenLanguage === "ingles" ? "Inglés" : "Francés") : subjectLabel("edad", subj);
        const label = `${name} (${LEVEL_LABEL[lvl]})`;
        if (isRecognized) {
          recognizedItems.push({ label, subject: subj, level: lvl });
        } else {
          remainingItems.push({ label, subject: subj, level: lvl, tests: 1 });
        }
      });

      // Science for this level
      const isScienceRecognized = approved("ciencias", lvl);
      const sciLabel = `Ciencias (${SCIENCE_LABEL[chosenScience]}) (${LEVEL_LABEL[lvl]})`;
      if (isScienceRecognized) {
        recognizedItems.push({ label: sciLabel, subject: "ciencias", level: lvl, science: chosenScience });
      } else {
        remainingItems.push({ label: sciLabel, subject: "ciencias", level: lvl, tests: 1 });
      }
    });

    if (input.scope?.levels.includes("11")) {
      const selectedSubjects = [...input.scope.subjects, ...(input.scope.includeScience ? ["ciencias" as SubjectId] : [])];
      if (selectedSubjects.some(subject => !approved(subject, "10") && !approved(subject, "11"))) {
        warnings.push("El total pendiente no significa que puedas matricular ambas partes a la vez. Para cada materia de Prueba 2 seleccionada, primero debes tener aprobada o reconocida la Prueba 1.");
      }
    }
    // Check Parte 1 gate warning
    const part2WithoutPart1 = baseSubjects.some((subj) => {
      const part1Done = recognizedRecords.some((r) => r.subject === subj && r.level === "10" && r.recognized);
      const part2Marked = recognizedRecords.some((r) => r.subject === subj && r.level === "11" && r.recognized);
      return part2Marked && !part1Done;
    });
    if (part2WithoutPart1) {
      warnings.push("En EDAD no se puede validar o matricular la Parte 2 (11°) sin haber aprobado o acreditado formalmente la Parte 1 (10°) de la misma asignatura.");
    }
  } else if (targetProgram === "bxm") {
    // BXM: 1 test per subject (5 subjects + 1 science)
    const baseSubjects = PROGRAM_SUBJECTS.bxm;

    baseSubjects.forEach((subj) => {
      const isRecognized = approved(subj);
      const name = subj === "idioma" ? (chosenLanguage === "ingles" ? "Inglés" : "Francés") : subjectLabel("bxm", subj);
      const label = `${name} (Bachillerato)`;
      if (isRecognized) {
        recognizedItems.push({ label, subject: subj });
      } else {
        remainingItems.push({ label, subject: subj, tests: 1 });
      }
    });

    const isScienceRecognized = approved("ciencias");
    const sciLabel = `Ciencias (${SCIENCE_LABEL[chosenScience]}) (Bachillerato)`;
    if (isScienceRecognized) {
      recognizedItems.push({ label: sciLabel, subject: "ciencias", science: chosenScience });
    } else {
      remainingItems.push({ label: sciLabel, subject: "ciencias", tests: 1 });
    }
  } else {
    // I y II Ciclo
    const subjects = PROGRAM_SUBJECTS["i-ii"];
    subjects.forEach((subj) => {
      const isRecognized = recognizedRecords.some((r) => r.subject === subj && r.recognized);
      const label = subjectLabel("i-ii", subj);
      if (isRecognized) {
        recognizedItems.push({ label, subject: subj });
      } else {
        remainingItems.push({ label, subject: subj, tests: 1 });
      }
    });
  }

  // 3. Assemble submission guidelines based on pathway and origin
  let guidelines: EquiparacionSubmissionGuideline;

  if (pathway === "same_program") {
    guidelines = {
      channel: "dgec_consultas", portalUrl: "https://portaldgec.mep.go.cr/yo_aplico/Login", leadTimeWeeks: 0,
      criticalNotice: "Las pruebas ya aprobadas en este mismo programa no requieren una nueva equiparación. Consulta el registro de calificaciones y matricula solo las pendientes. Si falta una aprobación en el registro, consulta a la DGEC antes de pagar.",
      requiredDocuments: [],
    };
  } else if (pathway === "foreign_homologation") {
    guidelines = {
      channel: "foreign_resolution",
      emailTarget: "dgec.reconocimientos@mep.go.cr",
      portalUrl: "https://www.dgec.mep.go.cr/certificacion-extranjera",
      leadTimeWeeks: 6,
      criticalNotice: "Consulta los requisitos y los plazos vigentes para el reconocimiento de estudios extranjeros antes de la matrícula. Esta guía no garantiza un tiempo de resolución.",
      requiredDocuments: [
        {
          code: "DOC-EXT-01",
          title: "Resolución Oficial de Equiparación DGEC",
          description: "Documento oficial emanado por el Departamento de Estudios Extranjeros de la DGEC acreditando equivalencia curricular.",
          mandatory: true,
        },
        {
          code: "DOC-EXT-02",
          title: "Cédula de Residencia, Pasaporte o DIMEX vigente",
          description: "Documento de identificación original con estatus migratorio válido en Costa Rica.",
          mandatory: true,
        },
        {
          code: "DOC-EXT-03",
          title: "Certificación Apostillada o Legalizada Consularmente",
          description: "Notas y certificados del país de origen apostillados bajo el Convenio de La Haya o autenticados vía consulado y Casa Amarilla.",
          mandatory: true,
        },
      ],
    };
  } else if (pathway === "abierta_to_abierta") {
    guidelines = {
      channel: "dgec_consultas",
      emailTarget: "plataformadgec@mep.go.cr",
      portalUrl: "https://dgec.mep.go.cr/consultas",
      leadTimeWeeks: 3,
      criticalNotice: "El traslado de materias entre EDAD y BXM debe registrarse formalmente en el sistema DGEC antes de la matrícula para no duplicar pagos ni asignaturas.",
      requiredDocuments: [
        {
          code: "DOC-AA-01",
          title: "Consulta sobre traslado de asignaturas",
          description: "Indica el programa, las asignaturas y la convocatoria de aprobación. Confirma con la DGEC si procede una solicitud adicional; esta guía no incorpora un formulario específico de traslado.",
          mandatory: false,
        },
        {
          code: "DOC-AA-02",
          title: "Historial de Calificaciones de Educación Abierta",
          description: "Reporte de notas oficial emitido por la plataforma Yo Aplico o DGEC con condición de 'Aprobado'.",
          mandatory: true,
        },
        {
          code: "DOC-AA-03",
          title: "Documento de Identificación Vigente",
          description: "Cédula de identidad física nacional o DIMEX por ambos lados.",
          mandatory: true,
        },
      ],
    };
  } else {
    // formal_to_abierta
    const isIII = targetProgram === "iii";
    guidelines = {
      channel: isIII ? "plataformadgec_email" : "regional_office",
      emailTarget: "plataformadgec@mep.go.cr",
      portalUrl: "https://dgec.mep.go.cr/consultas",
      leadTimeWeeks: 4,
      criticalNotice: "La equiparación desde el sistema formal (colegio/IPEC) no es automática. La DGEC debe verificar que la certificación cuente con firma de director, sello institucional y citas de registro (tomo, folio y asiento).",
      requiredDocuments: [
        {
          code: "DOC-FA-01",
          title: "Certificación de Estudios del Centro Educativo Formal",
          description: "Certificación original emitida por el colegio con desglose de materias, notas anuales, tomo, folio, asiento y sello húmedo.",
          mandatory: true,
        },
        {
          code: "DOC-FA-02",
          title: "Formulario de Equiparación DGEC Oficial",
          description: "Formulario de solicitud de reconocimiento de asignaturas para el programa destino firmado por el postulante.",
          mandatory: true,
        },
        {
          code: "DOC-FA-03",
          title: "Documento de Identidad por ambos lados",
          description: "Copia legible de la cédula nacional o tarjeta de identidad de menores (TIM).",
          mandatory: true,
        },
      ],
    };
  }

  // The estimate is for the selected subjects and levels, not the entire curriculum.
  if (input.scope) {
    const inScope = (item: { subject: SubjectId; level?: LevelId }) =>
      (item.subject === "ciencias" && (targetProgram === "edad" || targetProgram === "bxm") ? input.scope!.includeScience : input.scope!.subjects.includes(item.subject)) &&
      (!item.level || input.scope!.levels.includes(item.level));
    for (let index = remainingItems.length - 1; index >= 0; index--) if (!inScope(remainingItems[index])) remainingItems.splice(index, 1);
    for (let index = recognizedItems.length - 1; index >= 0; index--) if (!inScope(recognizedItems[index])) recognizedItems.splice(index, 1);
  }
  const totalRemainingTests = remainingItems.reduce((acc, curr) => acc + curr.tests, 0);
  const estimatedFee = totalRemainingTests * FEE_COLONES;

  return {
    pathway,
    targetProgram,
    recognizedItems,
    remainingItems,
    totalRemainingTests,
    estimatedFee,
    guidelines,
    warnings,
  };
}
