import { describe, it, expect } from 'vitest';
import { ContentLifecycleManager } from '../../services/qbe/contentLifecycle';
import type { CanonicalIntermediateQuestion } from '../../types/qbe';

describe('M5.1: Content Lifecycle Management', () => {
  const createMockQuestion = (overrides?: Partial<CanonicalIntermediateQuestion>): CanonicalIntermediateQuestion => {
    return {
      id: 'q-test-001',
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
        stem_raw: 'Calcule el radio de la circunferencia',
        stem_cleaned: 'Calcule el radio de la circunferencia',
        options: [
          { id: 'A', text_raw: '4', text_cleaned: '4', visuals: [] },
          { id: 'B', text_raw: '8', text_cleaned: '8', visuals: [] },
          { id: 'C', text_raw: '16', text_cleaned: '16', visuals: [] },
          { id: 'D', text_raw: '32', text_cleaned: '32', visuals: [] },
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
        evidencia: 'A1.2',
        mapping_status: 'candidate',
        mapping_confidence: 0.9,
      },
      quality: {
        status: 'extracted',
        gate_a_extraction_passed: true,
        gate_b_quality_passed: true,
        gate_c_internalization_passed: false,
        review_flags: [],
        issues: [],
      },
      review: {
        extraction_reviewed: false,
        content_reviewed: false,
        answer_reviewed: false,
        mapping_reviewed: false,
        reviewer_notes: [],
      },
      confidence: {
        source_confidence: 1.0,
        extraction_confidence: 0.95,
        answer_confidence: 1.0,
        mapping_confidence: 0.9,
        content_confidence: 0.9,
      },
      history: {
        transformations: [],
      },
      ...overrides,
    };
  };

  it('initializes a lifecycle record with default raw stage and blocks publication', () => {
    const record = ContentLifecycleManager.initializeRecord('q-test-001', 'raw');
    expect(record.item_id).toBe('q-test-001');
    expect(record.current_stage).toBe('raw');
    expect(record.is_publishable).toBe(false);
    expect(record.stage_history).toHaveLength(1);
    expect(record.stage_history[0].stage).toBe('raw');
  });

  it('prevents regressing lifecycle stage backward', () => {
    const record = ContentLifecycleManager.initializeRecord('q-test-001', 'parsed');
    const q = createMockQuestion();
    const result = ContentLifecycleManager.transitionStage(q, record, 'raw');
    expect(result.success).toBe(false);
    expect(result.blockers.some((b) => b.code === 'INVALID_BACKWARD_TRANSITION')).toBe(true);
    expect(record.current_stage).toBe('parsed');
  });

  it('blocks transition to parsed stage if stem is empty or options count is not 4', () => {
    const record = ContentLifecycleManager.initializeRecord('q-test-001', 'ingested');
    const invalidQ = createMockQuestion({
      content: {
        stem_raw: '',
        stem_cleaned: '',
        options: [{ id: 'A', text_raw: '1', text_cleaned: '1', visuals: [] }],
        detected_answer: 'A',
      },
    });

    const result = ContentLifecycleManager.transitionStage(invalidQ, record, 'parsed');
    expect(result.success).toBe(false);
    expect(result.blockers.some((b) => b.code === 'MISSING_STEM')).toBe(true);
    expect(result.blockers.some((b) => b.code === 'INVALID_OPTIONS_COUNT')).toBe(true);
  });

  it('blocks transition to validated if answer key is missing', () => {
    const record = ContentLifecycleManager.initializeRecord('q-test-001', 'mapped');
    const noAnswerQ = createMockQuestion({
      content: {
        stem_raw: 'Pregunta',
        stem_cleaned: 'Pregunta',
        options: [
          { id: 'A', text_raw: '1', text_cleaned: '1', visuals: [] },
          { id: 'B', text_raw: '2', text_cleaned: '2', visuals: [] },
          { id: 'C', text_raw: '3', text_cleaned: '3', visuals: [] },
          { id: 'D', text_raw: '4', text_cleaned: '4', visuals: [] },
        ],
        detected_answer: null,
      },
    });

    const result = ContentLifecycleManager.transitionStage(noAnswerQ, record, 'validated');
    expect(result.success).toBe(false);
    expect(result.blockers.some((b) => b.code === 'MISSING_ANSWER_KEY')).toBe(true);
  });

  it('blocks transition to approved if human approval signoff is missing', () => {
    const record = ContentLifecycleManager.initializeRecord('q-test-001', 'validated');
    const q = createMockQuestion({
      review: { ...createMockQuestion().review, content_reviewed: true },
    });

    const result = ContentLifecycleManager.transitionStage(q, record, 'approved');
    expect(result.success).toBe(false);
    expect(result.blockers.some((b) => b.code === 'APPROVAL_REQUIRED')).toBe(true);
  });

  it('successfully transitions from approved to published when signoff is provided and makes it publishable', () => {
    const record = ContentLifecycleManager.initializeRecord('q-test-001', 'reviewed');
    const q = createMockQuestion({
      review: { ...createMockQuestion().review, content_reviewed: true },
    });

    // Sign off approval
    const approveResult = ContentLifecycleManager.transitionStage(q, record, 'approved', {
      reviewer_id: 'rev-math-01',
      stage: 'approved',
      timestamp: new Date().toISOString(),
      notes: 'Mathematical proof and options verified.',
    });
    expect(approveResult.success).toBe(true);
    expect(record.current_stage).toBe('approved');
    expect(record.is_publishable).toBe(true);

    // Now publish
    const publishResult = ContentLifecycleManager.transitionStage(q, record, 'published');
    expect(publishResult.success).toBe(true);
    expect(record.current_stage).toBe('published');
    expect(record.is_publishable).toBe(true);
  });
});
