import type { CanonicalIntermediateQuestion } from '../../types/qbe';
import type { LifecycleRecord } from '../../types/qbeLifecycle';

export type PublicationVerdict = 'PASS' | 'WARNING' | 'BLOCKER';

export interface PublicationValidationIssue {
  code: string;
  verdict: 'WARNING' | 'BLOCKER';
  field?: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PublicationEligibilityResult {
  item_id: string;
  verdict: PublicationVerdict;
  is_eligible_for_release: boolean;
  blockers: PublicationValidationIssue[];
  warnings: PublicationValidationIssue[];
  provenance_summary: {
    status: string;
    claimed_origin: string;
    convocatoria: string;
    area: string;
  };
  validated_at: string;
}

export interface BatchPublicationSummary {
  total_items: number;
  verdict_counts: {
    pass: number;
    warning: number;
    blocker: number;
  };
  total_blockers: number;
  total_warnings: number;
  eligible_count: number;
  ineligible_count: number;
  results: PublicationEligibilityResult[];
  generated_at: string;
}

export class PublicationEligibilityValidator {
  /**
   * Validates a single question against Gate C / Release publication standards.
   */
  public static validateQuestion(
    question: CanonicalIntermediateQuestion,
    lifecycleRecord?: LifecycleRecord
  ): PublicationEligibilityResult {
    const blockers: PublicationValidationIssue[] = [];
    const warnings: PublicationValidationIssue[] = [];

    // 1. Provenance / Source validation
    if (!question.source || !question.source.asset_id) {
      blockers.push({
        code: 'PROVENANCE_MISSING_ASSET_ID',
        verdict: 'BLOCKER',
        field: 'source.asset_id',
        message: 'Question lacks an identifiable raw/source asset provenance ID.',
      });
    }

    if (question.source?.provenance_status === 'rejected') {
      blockers.push({
        code: 'PROVENANCE_REJECTED',
        verdict: 'BLOCKER',
        field: 'source.provenance_status',
        message: 'Question provenance has been rejected.',
      });
    }

    // 2. Question integrity (Stem)
    const stem = question.content?.stem_cleaned || question.content?.stem_raw || '';
    if (!stem.trim()) {
      blockers.push({
        code: 'STEM_EMPTY',
        verdict: 'BLOCKER',
        field: 'content.stem_cleaned',
        message: 'Question stem text is missing or completely empty.',
      });
    }

    // 3. Options validation
    const options = question.content?.options || [];
    if (![3, 4].includes(options.length)) {
      blockers.push({
        code: 'INVALID_OPTION_COUNT',
        verdict: 'BLOCKER',
        field: 'content.options',
        message: `Question must contain 3 or 4 options; found ${options.length}.`,
      });
    } else {
      const optionLetters = options.map((o) => o.id);
      const expectedLetters = ['A', 'B', 'C', 'D'].slice(0, options.length);
      const hasAllLetters = new Set(optionLetters).size === options.length && expectedLetters.every((l) => optionLetters.includes(l));
      if (!hasAllLetters) {
        blockers.push({
          code: 'MALFORMED_OPTION_KEYS',
          verdict: 'BLOCKER',
          field: 'content.options',
          message: `Options must have consecutive unique IDs A-C or A-D. Found: ${optionLetters.join(', ')}`,
        });
      }

      // Check empty option texts
      const emptyOptions = options.filter(
        (o) => (!o.text_cleaned || !o.text_cleaned.trim()) && (!o.visuals || o.visuals.length === 0)
      );
      if (emptyOptions.length > 0) {
        blockers.push({
          code: 'EMPTY_OPTION_TEXT',
          verdict: 'BLOCKER',
          field: 'content.options',
          message: `Options [${emptyOptions.map((o) => o.id).join(', ')}] have neither text nor visual assets.`,
        });
      }
    }

    // 4. Valid detected answer key
    const answer = question.content?.detected_answer;
    if (!answer || !options.some(o => o.id === answer)) {
      blockers.push({
        code: 'MISSING_OR_INVALID_ANSWER_KEY',
        verdict: 'BLOCKER',
        field: 'content.detected_answer',
        message: `Answer key must be one of ['A', 'B', 'C', 'D']. Detected: ${answer ?? 'none'}`,
      });
    }

    // 5. Visual diagram completeness
    if (question.quality?.review_flags?.includes('missing_visual')) {
      blockers.push({
        code: 'MISSING_REQUIRED_VISUAL',
        verdict: 'BLOCKER',
        field: 'visuals',
        message: 'Stem refers to a visual diagram that is missing from extracted assets.',
      });
    }

    // 6. Ambiguous mathematical expressions
    if (question.quality?.review_flags?.includes('ambiguous_math')) {
      warnings.push({
        code: 'AMBIGUOUS_MATH_EXPRESSION',
        verdict: 'WARNING',
        field: 'content.stem_cleaned',
        message: 'Stem contains potential mathematical ambiguities or unparsed symbol sequences.',
      });
    }

    // 7. Evidence & Domain mapping
    if (!question.evaluation || question.evaluation.mapping_status === 'unmapped' || !question.evaluation.afirmacion) {
      warnings.push({
        code: 'UNMAPPED_EVALUATION',
        verdict: 'WARNING',
        field: 'evaluation',
        message: 'Question does not have a confirmed or candidate official 02-2026 specification mapping.',
      });
    }

    // 8. Lifecycle & Review status checks
    if (lifecycleRecord) {
      if (lifecycleRecord.current_stage !== 'approved' && lifecycleRecord.current_stage !== 'published') {
        blockers.push({
          code: 'UNAPPROVED_LIFECYCLE_STAGE',
          verdict: 'BLOCKER',
          field: 'lifecycle.current_stage',
          message: `Content lifecycle stage is '${lifecycleRecord.current_stage}'. Only 'approved' or 'published' items can be released.`,
        });
      }
      if (lifecycleRecord.unresolved_blockers.length > 0) {
        blockers.push({
          code: 'UNRESOLVED_LIFECYCLE_BLOCKERS',
          verdict: 'BLOCKER',
          message: `Question has ${lifecycleRecord.unresolved_blockers.length} unresolved lifecycle blockers.`,
        });
      }
    } else {
      // In the absence of a lifecycle record, check question.review and gate flags
      if (!question.review?.content_reviewed && !question.quality?.gate_b_quality_passed) {
        warnings.push({
          code: 'UNREVIEWED_CONTENT_FLAG',
          verdict: 'WARNING',
          field: 'review.content_reviewed',
          message: 'Question has not undergone explicit human content review.',
        });
      }
    }

    // Determine composite verdict
    let verdict: PublicationVerdict = 'PASS';
    if (blockers.length > 0) {
      verdict = 'BLOCKER';
    } else if (warnings.length > 0) {
      verdict = 'WARNING';
    }

    return {
      item_id: question.id,
      verdict,
      is_eligible_for_release: verdict !== 'BLOCKER',
      blockers,
      warnings,
      provenance_summary: {
        status: question.source?.provenance_status || 'unknown',
        claimed_origin: question.source?.claimed_origin || 'unknown',
        convocatoria: question.source?.convocatoria || 'unknown',
        area: question.source?.area || 'unknown',
      },
      validated_at: new Date().toISOString(),
    };
  }

  /**
   * Evaluates a batch of questions and provides duplicate item ID detection and aggregate stats.
   */
  public static validateBatch(
    questions: CanonicalIntermediateQuestion[],
    recordsMap?: Map<string, LifecycleRecord>
  ): BatchPublicationSummary {
    const results: PublicationEligibilityResult[] = [];
    const seenIds = new Set<string>();
    const duplicateIds = new Set<string>();

    for (const q of questions) {
      if (seenIds.has(q.id)) {
        duplicateIds.add(q.id);
      }
      seenIds.add(q.id);
    }

    for (const q of questions) {
      const rec = recordsMap?.get(q.id);
      const res = this.validateQuestion(q, rec);

      if (duplicateIds.has(q.id)) {
        res.blockers.push({
          code: 'DUPLICATE_ITEM_ID',
          verdict: 'BLOCKER',
          field: 'id',
          message: `Question ID '${q.id}' is duplicated across the question set.`,
        });
        res.verdict = 'BLOCKER';
        res.is_eligible_for_release = false;
      }

      results.push(res);
    }

    let pass = 0;
    let warning = 0;
    let blocker = 0;
    let totalBlockers = 0;
    let totalWarnings = 0;

    for (const r of results) {
      if (r.verdict === 'PASS') pass++;
      else if (r.verdict === 'WARNING') warning++;
      else if (r.verdict === 'BLOCKER') blocker++;

      totalBlockers += r.blockers.length;
      totalWarnings += r.warnings.length;
    }

    return {
      total_items: questions.length,
      verdict_counts: {
        pass,
        warning,
        blocker,
      },
      total_blockers: totalBlockers,
      total_warnings: totalWarnings,
      eligible_count: pass + warning,
      ineligible_count: blocker,
      results,
      generated_at: new Date().toISOString(),
    };
  }
}
