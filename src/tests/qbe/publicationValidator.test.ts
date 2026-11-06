import { describe, it, expect } from 'vitest';
import { PublicationEligibilityValidator } from '../../services/qbe/publicationValidator';
import { ContentLifecycleManager } from '../../services/qbe/contentLifecycle';
import type { CanonicalIntermediateQuestion } from '../../types/qbe';

describe('M5.2: Publication Eligibility Validator', () => {
  const createMockQuestion = (overrides?: Partial<CanonicalIntermediateQuestion>): CanonicalIntermediateQuestion => {
    return {
      id: 'item-val-001',
      source: {
        asset_id: 'asset-test',
        filename: 'asset.docx',
        convocatoria: '2026-c2',
        area: 'geometry',
        subject: 'matematica',
        program: 'bxm',
        version: '1.0',
        source_type: 'docx',
        provenance_status: 'official_verified',
        claimed_origin: 'MEP 2026',
      },
      content: {
        stem_raw: 'Encuentre el centro de la circunferencia',
        stem_cleaned: 'Encuentre el centro de la circunferencia',
        options: [
          { id: 'A', text_raw: '(2, 3)', text_cleaned: '(2, 3)', visuals: [] },
          { id: 'B', text_raw: '(-2, 3)', text_cleaned: '(-2, 3)', visuals: [] },
          { id: 'C', text_raw: '(2, -3)', text_cleaned: '(2, -3)', visuals: [] },
          { id: 'D', text_raw: '(-2, -3)', text_cleaned: '(-2, -3)', visuals: [] },
        ],
        detected_answer: 'A',
      },
      visuals: [],
      classification: {
        topic: 'Circunferencia',
        difficulty: 'basic',
        cognitive_level: 'reproduccion',
      },
      evaluation: {
        framework_version: '02-2026',
        afirmacion: 'A1',
        evidencia: 'A1.1',
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
        extraction_reviewed: true,
        content_reviewed: true,
        answer_reviewed: true,
        mapping_reviewed: true,
        reviewer_notes: [],
      },
      confidence: {
        source_confidence: 1.0,
        extraction_confidence: 1.0,
        answer_confidence: 1.0,
        mapping_confidence: 1.0,
        content_confidence: 1.0,
      },
      history: {
        transformations: [],
      },
      ...overrides,
    };
  };

  it('yields PASS for a fully validated and reviewed canonical item', () => {
    const q = createMockQuestion();
    const result = PublicationEligibilityValidator.validateQuestion(q);
    expect(result.verdict).toBe('PASS');
    expect(result.is_eligible_for_release).toBe(true);
    expect(result.blockers).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it('yields WARNING when an item has ambiguous math or unmapped evaluation', () => {
    const q = createMockQuestion({
      evaluation: {
        framework_version: '02-2026',
        afirmacion: null,
        evidencia: null,
        mapping_status: 'unmapped',
        mapping_confidence: 0,
      },
      quality: {
        status: 'needs_review',
        gate_a_extraction_passed: true,
        gate_b_quality_passed: false,
        gate_c_internalization_passed: false,
        review_flags: ['ambiguous_math'],
        issues: [],
      },
    });

    const result = PublicationEligibilityValidator.validateQuestion(q);
    expect(result.verdict).toBe('WARNING');
    expect(result.is_eligible_for_release).toBe(true); // Warnings are conditionally eligible
    expect(result.warnings.some((w) => w.code === 'AMBIGUOUS_MATH_EXPRESSION')).toBe(true);
    expect(result.warnings.some((w) => w.code === 'UNMAPPED_EVALUATION')).toBe(true);
  });

  it('yields BLOCKER if stem is missing, options are incomplete, or answer key is missing', () => {
    const corruptedQ = createMockQuestion({
      content: {
        stem_raw: '',
        stem_cleaned: '',
        options: [
          { id: 'A', text_raw: '1', text_cleaned: '1', visuals: [] },
          { id: 'B', text_raw: '2', text_cleaned: '2', visuals: [] },
        ],
        detected_answer: null,
      },
      quality: {
        status: 'extracted',
        gate_a_extraction_passed: false,
        gate_b_quality_passed: false,
        gate_c_internalization_passed: false,
        review_flags: ['missing_visual'],
        issues: [],
      },
    });

    const result = PublicationEligibilityValidator.validateQuestion(corruptedQ);
    expect(result.verdict).toBe('BLOCKER');
    expect(result.is_eligible_for_release).toBe(false);
    expect(result.blockers.some((b) => b.code === 'STEM_EMPTY')).toBe(true);
    expect(result.blockers.some((b) => b.code === 'INVALID_OPTION_COUNT')).toBe(true);
    expect(result.blockers.some((b) => b.code === 'MISSING_OR_INVALID_ANSWER_KEY')).toBe(true);
    expect(result.blockers.some((b) => b.code === 'MISSING_REQUIRED_VISUAL')).toBe(true);
  });

  it('yields BLOCKER when attached lifecycle record is not in approved/published stage', () => {
    const q = createMockQuestion();
    const rawRecord = ContentLifecycleManager.initializeRecord(q.id, 'parsed');

    const result = PublicationEligibilityValidator.validateQuestion(q, rawRecord);
    expect(result.verdict).toBe('BLOCKER');
    expect(result.is_eligible_for_release).toBe(false);
    expect(result.blockers.some((b) => b.code === 'UNAPPROVED_LIFECYCLE_STAGE')).toBe(true);
  });

  it('detects duplicate question IDs during batch validation and flags them as BLOCKER', () => {
    const q1 = createMockQuestion({ id: 'item-dup-001' });
    const q2 = createMockQuestion({ id: 'item-dup-001' }); // Duplicate
    const q3 = createMockQuestion({ id: 'item-unique-002' });

    const batch = PublicationEligibilityValidator.validateBatch([q1, q2, q3]);
    expect(batch.total_items).toBe(3);
    expect(batch.verdict_counts.blocker).toBe(2); // Both duplicate items are blocked
    expect(batch.verdict_counts.pass).toBe(1);
    expect(batch.ineligible_count).toBe(2);
  });
});
