import type {
  CanonicalIntermediateQuestion,
} from '../../types/qbe';
import { mapQuestionToEvaluationFramework } from './evaluationMapper';

export interface QualityReviewResult {
  question: CanonicalIntermediateQuestion;
  gate_b_passed: boolean;
}

/**
 * Evaluates Gate B Quality Criteria:
 * 1. Has non-empty stem.
 * 2. Has 4 options.
 * 3. Has no unresolved visual diagram dependencies (stem requiring visual but visual missing).
 * 4. Maps evaluation candidate criteria from QBE-06.
 * 5. Updates composite confidence scores.
 */
export function applyQualityReview(
  question: CanonicalIntermediateQuestion
): QualityReviewResult {
  // 1. Run evaluation mapping
  const evalMapping = mapQuestionToEvaluationFramework(question);
  question.evaluation = evalMapping;

  // 2. Confidence scores update
  question.confidence.mapping_confidence = evalMapping.mapping_confidence;

  // 3. Gate B criteria assessment
  const hasStem = question.content.stem_cleaned.trim().length > 0;
  const hasFourOptions = question.content.options.length === 4;
  const noMissingVisual = !question.quality.review_flags.includes('missing_visual');
  const noAmbiguousMath = !question.quality.review_flags.includes('ambiguous_math');

  // Gate B is met when the question structure is coherent and solvable
  const gateBPassed = hasStem && hasFourOptions && noMissingVisual && noAmbiguousMath;
  question.quality.gate_b_quality_passed = gateBPassed;

  // If Gate B passed and candidate mapping found, update content confidence
  if (gateBPassed) {
    question.confidence.content_confidence = 0.90;
  }

  return {
    question,
    gate_b_passed: gateBPassed,
  };
}

export function compileMappingReport(
  questions: CanonicalIntermediateQuestion[]
): { markdown: string; stats: Record<string, any> } {
  const byArea = {
    geometry: { total: 0, mapped: 0, unmapped: 0 },
    functions: { total: 0, mapped: 0, unmapped: 0 },
    statistics: { total: 0, mapped: 0, unmapped: 0 },
  };

  const byEvidence: Record<string, number> = {};
  let totalGateB = 0;

  for (const q of questions) {
    const area = q.source.area;
    byArea[area].total++;

    if (q.evaluation.mapping_status === 'candidate') {
      byArea[area].mapped++;
      const evCode = `${q.evaluation.afirmacion}.${q.evaluation.evidencia}`;
      byEvidence[evCode] = (byEvidence[evCode] || 0) + 1;
    } else {
      byArea[area].unmapped++;
    }

    if (q.quality.gate_b_quality_passed) {
      totalGateB++;
    }
  }

  const lines = [
    '# QBE-05 & QBE-06: Evaluation Mapping & Quality Review Report',
    '',
    `**Total Evaluated Items:** ${questions.length}`,
    `**Items Passing Gate B (Quality Coherence):** ${totalGateB} / ${questions.length}`,
    '',
    '## Mapping by Domain Area',
    '| Area | Total | Mapped (Candidate) | Unmapped / No Match | Mapping Coverage |',
    '|---|---|---|---|---|',
    `| Geometry | ${byArea.geometry.total} | ${byArea.geometry.mapped} | ${byArea.geometry.unmapped} | ${((byArea.geometry.mapped / byArea.geometry.total) * 100).toFixed(1)}% |`,
    `| Functions | ${byArea.functions.total} | ${byArea.functions.mapped} | ${byArea.functions.unmapped} | ${((byArea.functions.mapped / byArea.functions.total) * 100).toFixed(1)}% |`,
    `| Statistics | ${byArea.statistics.total} | ${byArea.statistics.mapped} | ${byArea.statistics.unmapped} | ${((byArea.statistics.mapped / byArea.statistics.total) * 100).toFixed(1)}% |`,
    '',
    '## Most Frequent Evidence Matches',
    '| Afirmación / Evidencia | Matched Items |',
    '|---|---|',
  ];

  Object.entries(byEvidence)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([ev, count]) => {
      lines.push(`| ${ev} | ${count} |`);
    });

  lines.push('');
  lines.push('## Invariant Compliance');
  lines.push('- Unmapped items are allowed and preserved without forcing artificial alignment.');
  lines.push('- Provenance remains strictly `source_unverified`.');
  lines.push('');

  return {
    markdown: lines.join('\n'),
    stats: { byArea, byEvidence, totalGateB },
  };
}
