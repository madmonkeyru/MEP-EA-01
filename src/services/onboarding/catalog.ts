import type { LevelId, ProgramId, ScienceId, SubjectId } from "./types";

export const FEE_COLONES = 8000;

export const SUBJECT_LABEL: Record<SubjectId, string> = {
  ciencias: "Ciencias",
  espanol: "Español",
  "formacion-ciudadana": "Formación Ciudadana",
  matematica: "Matemática",
  "estudios-sociales": "Estudios Sociales",
  idioma: "Inglés o Francés",
  "educacion-civica": "Educación Cívica",
};

export const SCIENCE_LABEL: Record<ScienceId, string> = {
  biologia: "Biología",
  fisica: "Física",
  quimica: "Química",
};

export const LEVEL_LABEL: Record<LevelId, string> = {
  "7": "7° año",
  "8": "8° año",
  "9": "9° año",
  "10": "Parte 1 · 10°",
  "11": "Parte 2 · 11°",
};

export const PROGRAM_SUBJECTS: Record<ProgramId, SubjectId[]> = {
  "i-ii": [
    "ciencias",
    "espanol",
    "formacion-ciudadana",
    "matematica",
    "estudios-sociales",
  ],
  iii: [
    "matematica",
    "ciencias",
    "estudios-sociales",
    "espanol",
    "idioma",
    "formacion-ciudadana",
  ],
  edad: ["espanol", "educacion-civica", "idioma", "matematica", "estudios-sociales"],
  bxm: ["espanol", "educacion-civica", "idioma", "matematica", "estudios-sociales"],
};

export const PROGRAM_LEVELS: Record<ProgramId, LevelId[]> = {
  "i-ii": [],
  iii: ["7", "8", "9"],
  edad: ["10", "11"],
  bxm: [],
};

export type ProgramCopy = {
  name: string;
  offer: string;
  summary: string;
  pass: number;
  mode: string;
  topology: string;
  rules: string[];
};

export const PROGRAMS: Record<ProgramId, ProgramCopy> = {
  "i-ii": {
    name: "I y II Ciclo",
    offer: "Primaria por suficiencia",
    summary: "Cinco pruebas para cerrar la primaria. Desde los 14 años.",
    pass: 65,
    mode: "Abierta y flexible",
    topology: "Una prueba por materia, por convocatoria.",
    rules: [
      "Son cinco pruebas. Lo ya aprobado en el programa no se vuelve a matricular: consulte el registro antes.",
      "Hace falta leer, escribir y las cuatro operaciones. En Matemática no se permite calculadora.",
      "Quien llega con más de 30 minutos de atraso no ingresa.",
    ],
  },
  iii: {
    name: "III Ciclo",
    offer: "Séptimo, octavo y noveno",
    summary: "Seis materias en cada nivel, Inglés incluido. Pide la primaria aprobada.",
    pass: 65,
    mode: "Abierta y flexible",
    topology: "Una prueba por materia en 7°, en 8° y en 9°.",
    rules: [
      "Hay que aprobar las seis materias —incluida Inglés— en 7°, 8° y 9°.",
      "En Matemática de 8° y 9° se permite calculadora sencilla. En Ciencias, científica no programable. En 7° de Matemática, no.",
      "Después de matricular no se cambian materias, niveles ni convocatoria. El reconocimiento de colegio formal no es automático.",
    ],
  },
  edad: {
    name: "EDAD",
    offer: "Bachillerato a distancia",
    summary: "Décimo y undécimo, en dos partes. Desde los 16 años cumplidos.",
    pass: 70,
    mode: "A distancia, con estudio flexible",
    topology: "Dos pruebas por materia: parte 1 (10°) y parte 2 (11°).",
    rules: [
      "Ciencias se elige una sola vez: Biología, Física o Química. El idioma es Inglés o Francés.",
      "Pide 16 años cumplidos al inicio de la convocatoria. La reforma de 2024 quitó la nota de presentación y la prueba comprensiva.",
      "La prueba 1 (10°) se aprueba antes de matricular la prueba 2 de esa materia, salvo reconocimiento.",
    ],
  },
  bxm: {
    name: "BXM",
    offer: "Bachillerato por madurez",
    summary: "Una prueba por materia. Desde los 18 años, con excepciones puntuales.",
    pass: 70,
    mode: "Abierta, por su cuenta",
    topology: "Una prueba por materia, por convocatoria.",
    rules: [
      "Ciencias se elige una sola vez: Biología, Física o Química.",
      "La edad ordinaria es 18 años. Antes, solo madres adolescentes que lo demuestren, o quien viene del bachillerato formal.",
      "Puede llevar bolígrafo azul o negro, corrector blanco, calculadora no programable, lápiz, sacapuntas y borrador.",
    ],
  },
};

export function subjectLabel(program: ProgramId, subject: SubjectId): string {
  if (subject === "idioma" && program === "iii") return "Inglés";
  return SUBJECT_LABEL[subject];
}

export function colones(amount: number): string {
  const formatted = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
  return `₡${formatted}`;
}

export function testsPerSubject(program: ProgramId, levels: LevelId[]): number {
  if (program === "iii" || program === "edad") return Math.max(levels.length, 1);
  return 1;
}
