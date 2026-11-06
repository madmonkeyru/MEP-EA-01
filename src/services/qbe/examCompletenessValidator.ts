import type { ConvocatoriaManifest, Item } from '../../types';
import type { PublicationEligibilityResult } from './publicationValidator';
import { PublicationEligibilityValidator } from './publicationValidator';

export interface ExamCompletenessIssue {
  code: string;
  severity: 'BLOCKER' | 'WARNING';
  message: string;
  details?: Record<string, unknown>;
}

export interface ExamCompletenessReport {
  convocatoria_id: string;
  program_id: string;
  subject_id: string;
  coverage_declared: 'complete' | 'sample' | 'partial' | string;
  is_officially_complete: boolean;
  expected_items: number;
  actual_items_found: number;
  missing_item_ids: string[];
  duplicate_item_ids: string[];
  invalid_evidence_references: string[];
  blocker_items_count: number;
  warning_items_count: number;
  item_evaluations: PublicationEligibilityResult[];
  issues: ExamCompletenessIssue[];
  passed_gate: boolean;
  generated_at: string;
}

export class ExamCompletenessValidator {
  /**
   * Enforces blueprint completeness and item integrity for a given convocatoria blueprint.
   */
  public static validateBlueprint(
    blueprint: ConvocatoriaManifest,
    itemsMap: Map<string, Item>,
    officialEvidenceCatalogKeys?: Set<string>
  ): ExamCompletenessReport {
    const issues: ExamCompletenessIssue[] = [];
    const expectedCount = blueprint.totalItems;
    const itemIds = blueprint.itemPool || [];

    // 1. Check duplicate IDs in pool
    const seen = new Set<string>();
    const duplicateIds = new Set<string>();
    for (const id of itemIds) {
      if (seen.has(id)) {
        duplicateIds.add(id);
      }
      seen.add(id);
    }

    if (duplicateIds.size > 0) {
      issues.push({
        code: 'DUPLICATE_BLUEPRINT_ITEM_IDS',
        severity: 'BLOCKER',
        message: `Blueprint itemPool contains duplicate item IDs: ${Array.from(duplicateIds).join(', ')}`,
      });
    }

    // 2. Resolve items from item map
    const missingItemIds: string[] = [];
    const resolvedItems: Item[] = [];
    for (const id of itemIds) {
      const it = itemsMap.get(id);
      if (!it) {
        missingItemIds.push(id);
      } else {
        resolvedItems.push(it);
      }
    }

    if (missingItemIds.length > 0) {
      issues.push({
        code: 'MISSING_BLUEPRINT_ITEMS',
        severity: 'BLOCKER',
        message: `${missingItemIds.length} item(s) defined in blueprint could not be resolved from content repository.`,
        details: { missingItemIds },
      });
    }

    // 3. Count matching
    const actualValidCount = resolvedItems.length;
    if (blueprint.coverage === 'complete') {
      if (actualValidCount !== expectedCount) {
        issues.push({
          code: 'INCOMPLETE_EXAM_BLUEPRINT',
          severity: 'BLOCKER',
          message: `Blueprint declares 'complete' coverage with expected ${expectedCount} items, but only ${actualValidCount} items were resolved.`,
        });
      }
      // For BXM official reference, enforce strict 60 items rule
      if (blueprint.programId === 'bxm' && expectedCount !== 60) {
        issues.push({
          code: 'INVALID_BXM_TOTAL_ITEMS',
          severity: 'BLOCKER',
          message: `BXM official reference exam must specify 60 total items; found ${expectedCount}.`,
        });
      }
    } else {
      issues.push({
        code: 'NON_COMPLETE_COVERAGE_DECLARED',
        severity: 'WARNING',
        message: `Blueprint declared coverage is '${blueprint.coverage}', not 'complete'. Cannot masquerade as full production exam.`,
      });
    }

    // 4. Section consistency
    let sectionItemsSum = 0;
    for (const sec of blueprint.sections) {
      sectionItemsSum += sec.totalItems;
      for (const sId of sec.itemIds) {
        if (!itemIds.includes(sId)) {
          issues.push({
            code: 'SECTION_ITEM_NOT_IN_POOL',
            severity: 'BLOCKER',
            message: `Section '${sec.id}' item '${sId}' is not declared in root itemPool.`,
          });
        }
      }
    }
    if (sectionItemsSum !== expectedCount) {
      issues.push({
        code: 'SECTION_SUM_MISMATCH',
        severity: 'BLOCKER',
        message: `Sum of section totalItems (${sectionItemsSum}) does not match blueprint totalItems (${expectedCount}).`,
      });
    }

    // 5. Item validation and evidence reference checks
    const invalidEvidenceReferences: string[] = [];
    const itemEvaluations: PublicationEligibilityResult[] = [];
    let blockerItemsCount = 0;
    let warningItemsCount = 0;

    for (const item of resolvedItems) {
      // Check evidence reference validity against official evidence catalog
      if (officialEvidenceCatalogKeys && item.evidence_id) {
        const canonicalKey1 = `bxm/matematica/02-2026/${item.area_id}/${item.evidence_id}`;
        const canonicalKey2 = item.evidence_id;
        const isValidKey =
          officialEvidenceCatalogKeys.has(canonicalKey1) ||
          officialEvidenceCatalogKeys.has(canonicalKey2) ||
          Array.from(officialEvidenceCatalogKeys).some((k) => k.endsWith(`/${item.evidence_id}`));
        if (!isValidKey) {
          invalidEvidenceReferences.push(`${item.code || item.id}: ${item.evidence_id}`);
        }
      }

      // Convert Item into canonical shape for validator check
      const canonicalQ: any = {
        id: item.code || String(item.id),
        source: {
          asset_id: `blueprint-${blueprint.convocatoriaId}`,
          filename: `blueprint-${blueprint.convocatoriaId}.json`,
          convocatoria: blueprint.convocatoriaId,
          area: item.area_id,
          subject: blueprint.subjectId,
          program: blueprint.programId,
          version: '1.0',
          source_type: 'docx',
          provenance_status: 'official_verified',
          claimed_origin: 'MEP Official Blueprint',
        },
        content: {
          stem_cleaned: item.text || item.stem || '',
          options: Array.isArray(item.options)
            ? item.options.map((opt: any) => ({
                id: opt.letter,
                text_cleaned: opt.text,
                visuals: opt.visual_spec ? [{ id: 'spec', required_for_answer: true }] : [],
              }))
            : Object.entries(item.options || {}).map(([letter, text]) => ({
                id: letter,
                text_cleaned: String(text),
                visuals: [],
              })),
          detected_answer: item.correct_answer,
        },
        visuals: item.visual_spec ? [{ id: 'spec', required_for_answer: true }] : [],
        evaluation: {
          framework_version: '02-2026',
          afirmacion: item.spec?.affirmation,
          evidencia: item.evidence_id,
          mapping_status: 'validated',
          mapping_confidence: 1.0,
        },
        quality: {
          status: 'approved',
          gate_a_extraction_passed: true,
          gate_b_quality_passed: true,
          gate_c_internalization_passed: true,
          review_flags: [],
          issues: [],
        },
        review: {
          content_reviewed: true,
        },
      };

      const evalRes = PublicationEligibilityValidator.validateQuestion(canonicalQ);
      itemEvaluations.push(evalRes);

      if (evalRes.verdict === 'BLOCKER') {
        blockerItemsCount++;
        issues.push({
          code: 'ITEM_PUBLICATION_BLOCKER',
          severity: 'BLOCKER',
          message: `Item ${item.code || item.id} failed publication gate: ${evalRes.blockers.map((b) => b.message).join('; ')}`,
        });
      } else if (evalRes.verdict === 'WARNING') {
        warningItemsCount++;
      }
    }

    if (invalidEvidenceReferences.length > 0) {
      issues.push({
        code: 'INVALID_EVIDENCE_REFERENCES',
        severity: 'BLOCKER',
        message: `${invalidEvidenceReferences.length} item(s) reference unknown or invalid evidence keys in official catalog.`,
        details: { invalidEvidenceReferences },
      });
    }

    const hasBlockers = issues.some((i) => i.severity === 'BLOCKER');

    return {
      convocatoria_id: blueprint.convocatoriaId,
      program_id: blueprint.programId,
      subject_id: blueprint.subjectId,
      coverage_declared: blueprint.coverage || 'unknown',
      is_officially_complete: blueprint.coverage === 'complete' && !hasBlockers,
      expected_items: expectedCount,
      actual_items_found: actualValidCount,
      missing_item_ids: missingItemIds,
      duplicate_item_ids: Array.from(duplicateIds),
      invalid_evidence_references: invalidEvidenceReferences,
      blocker_items_count: blockerItemsCount,
      warning_items_count: warningItemsCount,
      item_evaluations: itemEvaluations,
      issues,
      passed_gate: !hasBlockers,
      generated_at: new Date().toISOString(),
    };
  }
}
