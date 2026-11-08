/**
 * Generic Curriculum & Preparation Path Service
 *
 * Subject-agnostic domain engine to compute learning paths,
 * block progressions, and checkpoint quizzes based on official
 * Tablas de Especificaciones and available item repositories.
 */

import {
  OfficialSpecTable,
  OfficialSpecBlock,
  OfficialSpecAffirmation,
  ALL_OFFICIAL_SPECS,
} from '../types/officialSpecs';
import { Item, PracticeConfig } from '../types';
import { dataService } from './dataService';

export interface AffirmationCheckpoint {
  code: string;
  desc: string;
  targetPoints: number;
  availableItemsCount: number;
  evidenceCodes: string[];
  masteryPercentage?: number;
}

export interface PreparationBlockPath {
  blockCode: string;
  name: string;
  areaId: string;
  totalPoints: number;
  affirmations: AffirmationCheckpoint[];
  totalAvailableItems: number;
}

export interface PreparationPathModel {
  programId: string;
  subjectId: string;
  convocatoriaId: string;
  title: string;
  totalExamPoints: number;
  blocks: PreparationBlockPath[];
}

class CurriculumService {
  private specTablesMap: Map<string, OfficialSpecTable> = new Map();

  constructor() {
    Object.entries(ALL_OFFICIAL_SPECS).forEach(([k, table]) => {
      this.specTablesMap.set(k, table);
    });
  }

  public registerSpecTable(table: OfficialSpecTable): void {
    const key = `${table.programId}-${table.subjectId}-${table.convocatoriaId}`;
    this.specTablesMap.set(key, table);
  }

  public getSpecTable(
    programId: string = 'bxm',
    subjectId: string = 'matematicas',
    convocatoriaId: string = '02-2026',
    subprogramId?: string
  ): OfficialSpecTable | undefined {
    if (subprogramId) {
      const subKey = `${programId}-${subprogramId}-${subjectId}-${convocatoriaId}`;
      if (this.specTablesMap.has(subKey)) return this.specTablesMap.get(subKey);
    }
    const specId = /^(\d{4})-c([12])$/.exec(convocatoriaId);
    const canonicalId = specId ? `0${specId[2]}-${specId[1]}` : convocatoriaId;
    const subjectAlias = subjectId === 'matematicas' ? 'matematica' : subjectId === 'matematica' ? 'matematicas' : subjectId;
    if (subprogramId) {
      return this.specTablesMap.get(`${programId}-${subprogramId}-${subjectId}-${canonicalId}`)
        ?? this.specTablesMap.get(`${programId}-${subprogramId}-${subjectAlias}-${canonicalId}`);
    }
    return this.specTablesMap.get(`${programId}-${subjectId}-${canonicalId}`)
      ?? this.specTablesMap.get(`${programId}-${subjectAlias}-${canonicalId}`);
  }

  public getPreparationPath(
    programId: string = 'bxm',
    subjectId: string = 'matematicas',
    convocatoriaId: string = '02-2026'
  ): PreparationPathModel | undefined {
    const table = this.getSpecTable(programId, subjectId, convocatoriaId);
    if (!table) return undefined;
    const allItems = dataService.getAllItems();

    const blocks: PreparationBlockPath[] = table.blocks.map((block: OfficialSpecBlock) => {
      let blockItemCount = 0;

      const affirmations: AffirmationCheckpoint[] = block.affirmations.map((aff: OfficialSpecAffirmation) => {
        const evidenceCodes = aff.evidences.map((e) => e.code);
        const matchingItems = allItems.filter((item: Item) => {
          if (!item.spec) return false;
          if (item.spec.affirmation === aff.code) return true;
          if (item.spec.evidence && evidenceCodes.includes(item.spec.evidence)) return true;
          if (item.evidence_id && evidenceCodes.includes(item.evidence_id)) return true;
          return false;
        });

        blockItemCount += matchingItems.length;

        return {
          code: aff.code,
          desc: aff.desc,
          targetPoints: aff.targetPoints,
          availableItemsCount: matchingItems.length,
          evidenceCodes,
        };
      });

      return {
        blockCode: block.blockCode,
        name: block.name,
        areaId: block.areaId,
        totalPoints: block.totalPoints,
        affirmations,
        totalAvailableItems: blockItemCount,
      };
    });

    return {
      programId: table.programId,
      subjectId: table.subjectId,
      convocatoriaId: table.convocatoriaId,
      title: table.title,
      totalExamPoints: table.totalPoints,
      blocks,
    };
  }

  public createCheckpointQuizConfig(
    blockCode: string,
    affirmationCode: string,
    itemCount: number = 5
  ): PracticeConfig {
    const allItems = dataService.getAllItems();
    const matchingItems = allItems.filter((item: Item) => {
      if (!item.spec) return false;
      return item.spec.affirmation === affirmationCode || item.spec.block?.includes(blockCode);
    });

    const selectedIds = matchingItems.slice(0, itemCount).map((i) => i.id);

    return {
      mode: 'area',
      itemCount: selectedIds.length || itemCount,
      enableTimer: false,
      timerDurationMinutes: 0,
      itemIds: selectedIds.length > 0 ? selectedIds : undefined,
    };
  }
}

export const curriculumService = new CurriculumService();
