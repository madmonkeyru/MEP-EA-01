import bxmMathSpecJson from '../../content/programs/bxm/matematica/specs/02-2026.json';

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
export const OFFICIAL_SPECIFICATION_TABLE: OfficialSpecBlock[] = OFFICIAL_SPEC_BXM_MATH_02_2026.blocks;
