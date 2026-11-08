import type { CanonicalIntermediateQuestion } from '../../types/qbe';
import type {
  ContentLifecycleStage,
  LifecycleIssue,
  LifecycleRecord,
  LifecycleSignoff,
  StageTransitionResult,
} from '../../types/qbeLifecycle';

const STAGE_ORDER: ContentLifecycleStage[] = [
  'raw',
  'ingested',
  'parsed',
  'mapped',
  'validated',
  'reviewed',
  'approved',
  'published',
];

export class ContentLifecycleManager {
  /**
   * Initializes a lifecycle record for a question or raw entry.
   */
  public static initializeRecord(
    itemId: string,
    initialStage: ContentLifecycleStage = 'raw',
    provenance = 'source_unverified' as const
  ): LifecycleRecord {
    const now = new Date().toISOString();
    return {
      item_id: itemId,
      current_stage: initialStage,
      stage_history: [
        {
          stage: initialStage,
          entered_at: now,
        },
      ],
      unresolved_blockers: [],
      warnings: [],
      signoffs: [],
      is_publishable: false,
      provenance_status: provenance,
      last_transition_at: now,
    };
  }

  /**
   * Evaluates prerequisites for transitioning to target stage.
   */
  public static evaluateStagePrerequisites(
    question: CanonicalIntermediateQuestion,
    record: LifecycleRecord,
    targetStage: ContentLifecycleStage
  ): { blockers: LifecycleIssue[]; warnings: LifecycleIssue[] } {
    const blockers: LifecycleIssue[] = [];
    const warnings: LifecycleIssue[] = [];
    const now = new Date().toISOString();

    const currentIdx = STAGE_ORDER.indexOf(record.current_stage);
    const targetIdx = STAGE_ORDER.indexOf(targetStage);

    // Can only transition forward or stay in same stage (or reject)
    if (targetIdx < currentIdx) {
      blockers.push({
        code: 'INVALID_BACKWARD_TRANSITION',
        stage: targetStage,
        severity: 'blocker',
        message: `Cannot regress lifecycle stage from ${record.current_stage} to ${targetStage}`,
        timestamp: now,
      });
      return { blockers, warnings };
    }

    // Checking target stage requirements
    if (targetIdx >= STAGE_ORDER.indexOf('parsed')) {
      if (!question.content.stem_cleaned || question.content.stem_cleaned.trim().length === 0) {
        blockers.push({
          code: 'MISSING_STEM',
          stage: 'parsed',
          severity: 'blocker',
          message: 'Question stem is empty or missing.',
          field: 'content.stem_cleaned',
          timestamp: now,
        });
      }
      if (!question.content.options || ![3, 4].includes(question.content.options.length)) {
        blockers.push({
          code: 'INVALID_OPTIONS_COUNT',
          stage: 'parsed',
          severity: 'blocker',
          message: `Expected 3 or 4 options, found ${question.content.options?.length ?? 0}.`,
          field: 'content.options',
          timestamp: now,
        });
      }
    }

    if (targetIdx >= STAGE_ORDER.indexOf('mapped')) {
      if (!question.evaluation || question.evaluation.mapping_status === 'unmapped' || !question.evaluation.afirmacion) {
        warnings.push({
          code: 'EVALUATION_UNMAPPED',
          stage: 'mapped',
          severity: 'warning',
          message: 'Question has no official Afirmación/Evidencia mapped.',
          field: 'evaluation',
          timestamp: now,
        });
      }
    }

    if (targetIdx >= STAGE_ORDER.indexOf('validated')) {
      if (!question.content.detected_answer) {
        blockers.push({
          code: 'MISSING_ANSWER_KEY',
          stage: 'validated',
          severity: 'blocker',
          message: 'Answer key is undetected or missing.',
          field: 'content.detected_answer',
          timestamp: now,
        });
      }
      if (question.quality.review_flags.includes('missing_visual')) {
        blockers.push({
          code: 'MISSING_REQUIRED_VISUAL',
          stage: 'validated',
          severity: 'blocker',
          message: 'Question requires visual diagram which is unresolved or missing.',
          field: 'visuals',
          timestamp: now,
        });
      }
    }

    if (targetIdx >= STAGE_ORDER.indexOf('reviewed')) {
      const hasReviewSignoff = record.signoffs.some((s) => s.stage === 'reviewed');
      if (!hasReviewSignoff && !question.review.content_reviewed) {
        blockers.push({
          code: 'UNREVIEWED_CONTENT',
          stage: 'reviewed',
          severity: 'blocker',
          message: 'Question has not undergone content review signoff.',
          timestamp: now,
        });
      }
    }

    if (targetIdx >= STAGE_ORDER.indexOf('approved')) {
      const hasApprovalSignoff = record.signoffs.some((s) => s.stage === 'approved');
      if (!hasApprovalSignoff) {
        blockers.push({
          code: 'APPROVAL_REQUIRED',
          stage: 'approved',
          severity: 'blocker',
          message: 'Question requires pedagogical/mathematical approval signoff.',
          timestamp: now,
        });
      }
    }

    if (targetIdx >= STAGE_ORDER.indexOf('published')) {
      if (record.provenance_status === 'rejected') {
        blockers.push({
          code: 'REJECTED_PROVENANCE',
          stage: 'published',
          severity: 'blocker',
          message: 'Cannot publish question with rejected provenance.',
          field: 'provenance_status',
          timestamp: now,
        });
      }
      if (record.unresolved_blockers.length > 0) {
        blockers.push({
          code: 'EXISTING_UNRESOLVED_BLOCKERS',
          stage: 'published',
          severity: 'blocker',
          message: `Cannot publish with ${record.unresolved_blockers.length} unresolved blockers.`,
          timestamp: now,
        });
      }
    }

    return { blockers, warnings };
  }

  /**
   * Attempts to advance the lifecycle stage of a question.
   */
  public static transitionStage(
    question: CanonicalIntermediateQuestion,
    record: LifecycleRecord,
    targetStage: ContentLifecycleStage,
    signoff?: LifecycleSignoff
  ): StageTransitionResult {
    const previousStage = record.current_stage;
    const now = new Date().toISOString();

    if (signoff) {
      record.signoffs.push(signoff);
    }

    const { blockers, warnings } = this.evaluateStagePrerequisites(question, record, targetStage);

    if (blockers.length > 0) {
      record.unresolved_blockers = blockers;
      record.warnings = warnings;
      record.is_publishable = false;

      return {
        success: false,
        item_id: record.item_id,
        previous_stage: previousStage,
        target_stage: targetStage,
        blockers,
        warnings,
        record,
      };
    }

    // Transition permitted
    const currentHist = record.stage_history.find((h) => h.stage === previousStage && !h.completed_at);
    if (currentHist) {
      currentHist.completed_at = now;
    }

    record.current_stage = targetStage;
    record.last_transition_at = now;
    record.unresolved_blockers = [];
    record.warnings = warnings;
    record.stage_history.push({
      stage: targetStage,
      entered_at: now,
    });

    record.is_publishable = targetStage === 'approved' || targetStage === 'published';

    return {
      success: true,
      item_id: record.item_id,
      previous_stage: previousStage,
      target_stage: targetStage,
      blockers: [],
      warnings,
      record,
    };
  }
}
