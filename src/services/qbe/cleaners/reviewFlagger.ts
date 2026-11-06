import type {
  CanonicalIntermediateQuestion,
  ReviewFlagType,
  TransformationRecord,
  CleaningSummaryReport,
  CorrectionCategory,
} from '../../../types/qbe';
import { normalizeMechanicalText } from './mechanicalNormalizer';

export interface CleanQuestionResult {
  question: CanonicalIntermediateQuestion;
  transformationsCount: number;
}

/**
 * Stage 2: Semantic Review Flagging & Intermediate Question Cleanup
 * Processes an initialized CanonicalIntermediateQuestion:
 * 1. Executes Stage 1 mechanical normalization on stem and all options.
 * 2. Checks criteria for Stage 2 review flags (missing answer key, incomplete options, ambiguous math, etc.)
 * 3. Records transformations and updates quality status without discarding items.
 */
export function cleanAndReviewCanonicalQuestion(
  item: CanonicalIntermediateQuestion
): CleanQuestionResult {
  const flags: ReviewFlagType[] = [];
  const issues: string[] = [...item.quality.issues];
  const allTransformations: TransformationRecord[] = [];

  // Clean Stem
  const stemNorm = normalizeMechanicalText(item.content.stem_raw);
  item.content.stem_cleaned = stemNorm.text;
  allTransformations.push(...stemNorm.transformations);

  if (stemNorm.ambiguousMathDetected) {
    flags.push('ambiguous_math');
    issues.push(...stemNorm.ambiguousDetails);
  }

  // Clean Options
  item.content.options.forEach(opt => {
    const optNorm = normalizeMechanicalText(opt.text_raw);
    opt.text_cleaned = optNorm.text;
    allTransformations.push(...optNorm.transformations);

    if (optNorm.ambiguousMathDetected && !flags.includes('ambiguous_math')) {
      flags.push('ambiguous_math');
      issues.push(...optNorm.ambiguousDetails);
    }
  });

  // Stage 2 Flag 1: Missing Answer Key
  if (!item.content.detected_answer) {
    flags.push('missing_answer_key');
    issues.push('Missing explicit answer key from source asset');
  }

  // Stage 2 Flag 2: Incomplete Options (< 4 options)
  if (item.content.options.length < 4) {
    flags.push('incomplete_options');
    issues.push(`Incomplete option count: ${item.content.options.length} of 4 options present`);
  }

  // Stage 2 Flag 3: Missing Visual Asset check
  const stemMentionsVisual =
    /\b(figura|gráfico|grafico|imagen|representa|siguiente triángulo|siguiente cuadrilátero|siguiente polígono)\b/i.test(
      item.content.stem_cleaned
    );
  if (stemMentionsVisual && item.visuals.length === 0) {
    flags.push('missing_visual');
    issues.push('Stem text references visual diagram but no visual asset is linked');
  }

  // Stage 2 Flag 4: Semantic Change Candidate
  const hasSemanticChange = allTransformations.some(t => t.semantic_change);
  if (hasSemanticChange) {
    flags.push('semantic_change_candidate');
    issues.push('Contains transformation flagged as potential semantic change');
  }

  // Update item quality and review state
  item.quality.review_flags = flags;
  item.quality.issues = Array.from(new Set(issues));
  item.quality.status = flags.length > 0 ? 'needs_review' : 'approved';
  // Gate B: Passed if no critical issues (has stem, at least 4 options, and no missing visual)
  item.quality.gate_b_quality_passed =
    item.content.stem_cleaned.length > 0 &&
    item.content.options.length === 4 &&
    !flags.includes('missing_visual');

  item.history.transformations = allTransformations;

  return {
    question: item,
    transformationsCount: allTransformations.length,
  };
}

export function compileCleaningSummaryReport(
  questions: CanonicalIntermediateQuestion[]
): { report: CleaningSummaryReport; markdown: string } {
  const byType: Record<CorrectionCategory, number> = {
    formatting: 0,
    whitespace: 0,
    unicode_normalization: 0,
    mathematical_notation: 0,
    orthography: 0,
    punctuation: 0,
    transcription: 0,
    semantic_correction: 0,
    answer_key_correction: 0,
  };

  const byFlag: Record<ReviewFlagType, number> = {
    missing_answer_key: 0,
    incomplete_options: 0,
    ambiguous_math: 0,
    semantic_change_candidate: 0,
    missing_visual: 0,
  };

  let totalTransformations = 0;
  let questionsRequiringReview = 0;
  let questionsSemanticChange = 0;
  let questionsUnchanged = 0;
  let mathNormalizations = 0;

  for (const q of questions) {
    const qTrans = q.history.transformations;
    totalTransformations += qTrans.length;

    if (qTrans.length === 0) {
      questionsUnchanged++;
    }

    qTrans.forEach(t => {
      byType[t.correction_type] = (byType[t.correction_type] || 0) + 1;
      if (t.correction_type === 'mathematical_notation' || t.correction_type === 'unicode_normalization') {
        mathNormalizations++;
      }
    });

    if (q.quality.review_flags.length > 0) {
      questionsRequiringReview++;
    }

    q.quality.review_flags.forEach(f => {
      byFlag[f] = (byFlag[f] || 0) + 1;
    });

    if (q.quality.review_flags.includes('semantic_change_candidate')) {
      questionsSemanticChange++;
    }
  }

  const report: CleaningSummaryReport = {
    generated_at: new Date().toISOString(),
    total_extracted_questions: questions.length,
    total_cleaned_questions: questions.length,
    total_transformations_recorded: totalTransformations,
    transformations_by_type: byType,
    questions_requiring_review: questionsRequiringReview,
    questions_by_review_flag: byFlag,
    questions_with_potential_semantic_changes: questionsSemanticChange,
    questions_unchanged: questionsUnchanged,
    mathematical_normalizations_count: mathNormalizations,
  };

  const md = [
    '# QBE-04: Question Cleaning & Normalization Audit Report',
    '',
    `**Generated:** ${report.generated_at}`,
    `**Total Extracted Questions:** ${report.total_extracted_questions}`,
    `**Total Cleaned Questions:** ${report.total_cleaned_questions}`,
    `**Total Recorded Transformations:** ${report.total_transformations_recorded}`,
    `**Questions Unchanged:** ${report.questions_unchanged}`,
    `**Questions Requiring Review:** ${report.questions_requiring_review}`,
    '',
    '## Transformations by Category',
    '| Category | Count |',
    '|---|---|',
    `| Formatting | ${byType.formatting} |`,
    `| Whitespace | ${byType.whitespace} |`,
    `| Unicode Normalization | ${byType.unicode_normalization} |`,
    `| Mathematical Notation | ${byType.mathematical_notation} |`,
    `| Orthography | ${byType.orthography} |`,
    `| Punctuation | ${byType.punctuation} |`,
    `| Semantic Correction | ${byType.semantic_correction} |`,
    `| Answer Key Correction | ${byType.answer_key_correction} |`,
    '',
    '## Review Flags Distribution',
    '| Review Flag | Affected Questions | Notes |',
    '|---|---|---|',
    `| \`missing_answer_key\` | ${byFlag.missing_answer_key} | Pending official human answer verification |`,
    `| \`incomplete_options\` | ${byFlag.incomplete_options} | Less than 4 multiple-choice options extracted |`,
    `| \`ambiguous_math\` | ${byFlag.ambiguous_math} | Preserved unverified combining symbols (e.g. overlines) |`,
    `| \`missing_visual\` | ${byFlag.missing_visual} | Stem references diagram without attached image |`,
    `| \`semantic_change_candidate\` | ${byFlag.semantic_change_candidate} | Automated check flagged potential meaning change |`,
    '',
    '## Core Architectural Invariants',
    '- **Non-destructive:** Original stem (`stem_raw`) and options (`text_raw`) remain 100% recoverable in every item JSON.',
    '- **Audit Trail:** Every single modification is preserved under `history.transformations[]`.',
    '- **Provenance Invariance:** `provenance_status: source_unverified` is preserved across all items regardless of cleaning score.',
    '',
  ].join('\n');

  return { report, markdown: md };
}
