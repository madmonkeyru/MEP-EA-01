import { describe, it, expect } from 'vitest';
import path from 'node:path';
import fs from 'node:fs';
import { mapQuestionToEvaluationFramework } from '../../services/qbe/evaluationMapper';
import { applyQualityReview, compileMappingReport } from '../../services/qbe/qualityReview';
import type { CanonicalIntermediateQuestion } from '../../types/qbe';

describe('QBE-05 & QBE-06: Evaluation Mapping & Quality Review Workflow', () => {
  function createSampleQuestion(
    area: 'geometry' | 'functions' | 'statistics',
    stem: string,
    optionsCount: number = 4
  ): CanonicalIntermediateQuestion {
    const opts = ['A', 'B', 'C', 'D'].slice(0, optionsCount).map(letter => ({
      id: letter,
      text_raw: `Opción ${letter}`,
      text_cleaned: `Opción ${letter}`,
      visuals: [],
    }));

    return {
      id: `test-${area}-q1`,
      source: {
        asset_id: `bxm-raw-test-${area}`,
        filename: 'test.docx',
        convocatoria: '2021-c1',
        area,
        subject: 'matematica',
        program: 'bxm',
        version: '1.0.0',
        source_type: 'docx',
        provenance_status: 'source_unverified',
        claimed_origin: 'Convocatoria Test',
      },
      content: {
        stem_raw: stem,
        stem_cleaned: stem,
        options: opts,
        detected_answer: null,
        explanation_raw: null,
        explanation_cleaned: null,
      },
      visuals: [],
      classification: { topic: area },
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
        review_flags: ['missing_answer_key'],
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
        source_confidence: 0.5,
        extraction_confidence: 0.9,
        answer_confidence: 0,
        mapping_confidence: 0,
        content_confidence: 0.7,
      },
      history: { transformations: [] },
    };
  }

  it('maps geometry questions about circle equations to Afirmación A1 Evidencia A1.2', () => {
    const q = createSampleQuestion(
      'geometry',
      'El centro de una circunferencia C es (0,-1) y su radio es 4. Por tanto, la ecuación de la circunferencia corresponde a:'
    );
    const mapping = mapQuestionToEvaluationFramework(q);

    expect(mapping.mapping_status).toBe('candidate');
    expect(mapping.afirmacion).toBe('A1');
    expect(mapping.evidencia).toBe('A1.2');
    expect(mapping.mapping_confidence).toBeGreaterThan(0.8);
  });

  it('maps function questions about inverse function to Afirmación A4 Evidencia A4.4', () => {
    const q = createSampleQuestion(
      'functions',
      'Considere la función f(x) = 2x + 1. El criterio de la función inversa corresponde a:'
    );
    const mapping = mapQuestionToEvaluationFramework(q);

    expect(mapping.mapping_status).toBe('candidate');
    expect(mapping.afirmacion).toBe('A4');
    expect(mapping.evidencia).toBe('A4.4');
  });

  it('maps statistics questions about boxplots to Afirmación A3 Evidencia A3.2', () => {
    const q = createSampleQuestion(
      'statistics',
      'Considere los siguientes diagramas de cajas para la comparación de los salarios de dos empresas:'
    );
    const mapping = mapQuestionToEvaluationFramework(q);

    expect(mapping.mapping_status).toBe('candidate');
    expect(mapping.afirmacion).toBe('A3');
    expect(mapping.evidencia).toBe('A3.2');
  });

  it('leaves unrecognized legacy content unmapped without forcing artificial criteria', () => {
    const q = createSampleQuestion(
      'geometry',
      'Un tema antiguo que no aparece en el programa actual de educación abierta.'
    );
    const mapping = mapQuestionToEvaluationFramework(q);

    expect(mapping.mapping_status).toBe('unmapped');
    expect(mapping.afirmacion).toBeNull();
    expect(mapping.evidencia).toBeNull();
  });

  it('evaluates Gate B quality criteria and updates confidence scores', () => {
    const qValid = createSampleQuestion(
      'geometry',
      'La ecuación de la circunferencia es (x-1)^2 + y^2 = 9. Calcule el radio.'
    );
    const res1 = applyQualityReview(qValid);
    expect(res1.gate_b_passed).toBe(true);
    expect(qValid.confidence.content_confidence).toBe(0.9);

    const qIncomplete = createSampleQuestion(
      'geometry',
      'La ecuación de la circunferencia...',
      2 // Only 2 options
    );
    const res2 = applyQualityReview(qIncomplete);
    expect(res2.gate_b_passed).toBe(false);
  });

  it('compiles mapping summary report across cleaned items on disk', () => {
    const cleanedDir = path.join(process.cwd(), 'content/qbe/cleaned');
    expect(fs.existsSync(cleanedDir)).toBe(true);

    const files = fs.readdirSync(cleanedDir).filter(f => f.endsWith('-cleaned.json'));
    expect(files.length).toBe(27);

    const questions: CanonicalIntermediateQuestion[] = [];
    for (const f of files) {
      const doc = JSON.parse(fs.readFileSync(path.join(cleanedDir, f), 'utf8'));
      for (const item of doc.questions) {
        applyQualityReview(item);
        questions.push(item);
      }
    }

    expect(questions.length).toBe(564);
    const { stats, markdown } = compileMappingReport(questions);

    expect(stats.totalGateB).toBeGreaterThan(250);
    expect(markdown).toContain('# QBE-05 & QBE-06: Evaluation Mapping & Quality Review Report');
  });
});
