import bxmMathSpecJson from '../../content/programs/bxm/matematica/specs/02-2026.json';
import edadP1MathSpecJson from '../../content/programs/edad/matematica/specs/02-2026-p1.json';
import edadP2MathSpecJson from '../../content/programs/edad/matematica/specs/02-2026-p2.json';
import iIiCicloMathSpecJson from '../../content/programs/i_ii_ciclo/matematica/specs/02-2026.json';
import iii7moMathSpecJson from '../../content/programs/iii_ciclo/matematica/specs/02-2026-7mo.json';
import iii8voMathSpecJson from '../../content/programs/iii_ciclo/matematica/specs/02-2026-8vo.json';
import iii9noMathSpecJson from '../../content/programs/iii_ciclo/matematica/specs/02-2026-9no.json';

export interface OfficialSpecEvidence {
  code: string; // e.g., "A3.1"
  desc: string;
  cognitiveLevel?: 'reproduccion' | 'conexion' | 'reflexion';
}

export interface OfficialSpecAffirmation {
  code: string; // e.g., "A3"
  desc: string;
  targetPoints: number; // Official item points allocated in 60-item exam
  evidences: OfficialSpecEvidence[];
}

export interface OfficialSpecBlock {
  blockCode: string; // e.g., "1. Geometría"
  name: string;
  areaId: 'geometry' | 'functions' | 'statistics' | string;
  totalPoints: number;
  affirmations: OfficialSpecAffirmation[];
}

export interface OfficialSpecTable {
  programId: string;
  subprogramId?: string;
  subjectId: string;
  convocatoriaId: string;
  title: string;
  totalPoints: number;
  passingScore: number;
  calculatorAllowed: boolean;
  blocks: OfficialSpecBlock[];
}

// Complete Official MEP Specification Table Data imported from source-of-truth JSON
export const OFFICIAL_SPEC_BXM_MATH_02_2026 = bxmMathSpecJson as unknown as OfficialSpecTable;
export const OFFICIAL_SPEC_EDAD_P1_MATH_02_2026 = edadP1MathSpecJson as unknown as OfficialSpecTable;
export const OFFICIAL_SPEC_EDAD_P2_MATH_02_2026 = edadP2MathSpecJson as unknown as OfficialSpecTable;
export const OFFICIAL_SPEC_I_II_CICLO_MATH_02_2026 = iIiCicloMathSpecJson as unknown as OfficialSpecTable;
export const OFFICIAL_SPEC_III_7MO_MATH_02_2026 = iii7moMathSpecJson as unknown as OfficialSpecTable;
export const OFFICIAL_SPEC_III_8VO_MATH_02_2026 = iii8voMathSpecJson as unknown as OfficialSpecTable;
export const OFFICIAL_SPEC_III_9NO_MATH_02_2026 = iii9noMathSpecJson as unknown as OfficialSpecTable;

export const ALL_OFFICIAL_SPECS: Record<string, OfficialSpecTable> = {
  'bxm-matematicas-02-2026': OFFICIAL_SPEC_BXM_MATH_02_2026,
  'bxm-matematica-02-2026': OFFICIAL_SPEC_BXM_MATH_02_2026,
  'edad-parte-1-10mo-matematica-02-2026': OFFICIAL_SPEC_EDAD_P1_MATH_02_2026,
  'edad-EDAD_1-matematica-02-2026': OFFICIAL_SPEC_EDAD_P1_MATH_02_2026,
  'edad-parte-2-11mo-matematica-02-2026': OFFICIAL_SPEC_EDAD_P2_MATH_02_2026,
  'edad-EDAD_2-matematica-02-2026': OFFICIAL_SPEC_EDAD_P2_MATH_02_2026,
  'i_ii_ciclo-matematica-02-2026': OFFICIAL_SPEC_I_II_CICLO_MATH_02_2026,
  'i_ii_ciclo-matematicas-02-2026': OFFICIAL_SPEC_I_II_CICLO_MATH_02_2026,
  'cico-matematica-02-2026': OFFICIAL_SPEC_I_II_CICLO_MATH_02_2026,
  'cico-matematicas-02-2026': OFFICIAL_SPEC_I_II_CICLO_MATH_02_2026,
  'iii_ciclo-III_CICLO_7-matematica-02-2026': OFFICIAL_SPEC_III_7MO_MATH_02_2026,
  'iii_ciclo-III_CICLO_8-matematica-02-2026': OFFICIAL_SPEC_III_8VO_MATH_02_2026,
  'iii_ciclo-III_CICLO_9-matematica-02-2026': OFFICIAL_SPEC_III_9NO_MATH_02_2026,
};

export const OFFICIAL_SPECIFICATION_TABLE: OfficialSpecBlock[] = OFFICIAL_SPEC_BXM_MATH_02_2026.blocks;
