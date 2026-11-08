import type {
  CanonicalIntermediateQuestion,
  ExtractedQuestionItem,
  RawAssetManifestEntry,
} from '../../types/qbe';

export function initializeCanonicalQuestion(
  extractedItem: ExtractedQuestionItem,
  manifestEntry: RawAssetManifestEntry
): CanonicalIntermediateQuestion {
  return {
    id: extractedItem.id,
    source: {
      asset_id: manifestEntry.asset_id,
      filename: manifestEntry.filename,
      convocatoria: manifestEntry.convocatoria,
      area: manifestEntry.area,
      subject: 'matematica',
      program: 'bxm',
      version: manifestEntry.version,
      source_type: 'docx',
      provenance_status: manifestEntry.provenance_status, // Always source_unverified by default
      claimed_origin: manifestEntry.claimed_origin,
    },
    content: {
      stem_raw: extractedItem.stem_text,
      stem_cleaned: extractedItem.stem_text,
      options: extractedItem.options.map(o => ({
        id: o.id,
        text_raw: o.text,
        text_cleaned: o.text,
        visuals: o.visuals,
      })),
      detected_answer: extractedItem.detected_answer || null,
      explanation_raw: extractedItem.explanation_raw || null,
      explanation_cleaned: null,
    },
    visuals: extractedItem.visuals || [],
    classification: {
      topic: manifestEntry.area,
    },
    evaluation: {
      framework_version: '02-2026',
      afirmacion: null,
      evidencia: null,
      mapping_status: 'unmapped',
      mapping_confidence: 0.0,
      rationale: 'Unmapped initial extraction from historical asset',
    },
    quality: {
      status: 'extracted',
      gate_a_extraction_passed: extractedItem.quality_gate_a_passed,
      gate_b_quality_passed: false,
      gate_c_internalization_passed: false,
      review_flags: [],
      issues: [...extractedItem.diagnostics.issues],
    },
    review: {
      extraction_reviewed: false,
      content_reviewed: false,
      answer_reviewed: false,
      mapping_reviewed: false,
      reviewer_notes: [],
    },
    confidence: {
      source_confidence: extractedItem.provenance.source_confidence,
      extraction_confidence: extractedItem.extraction_confidence,
      answer_confidence: extractedItem.detected_answer ? 0.8 : 0.0,
      mapping_confidence: 0.0,
      content_confidence: extractedItem.quality_gate_a_passed ? 0.75 : 0.5,
    },
    history: {
      transformations: [],
    },
  };
}

export function validateCanonicalIntermediateQuestion(item: CanonicalIntermediateQuestion): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!item.id || typeof item.id !== 'string') errors.push('Missing or invalid "id"');
  if (!item.source?.asset_id) errors.push('Missing source.asset_id');
  if (!item.source?.convocatoria) errors.push('Missing source.convocatoria');
  if (!item.source?.provenance_status) errors.push('Missing source.provenance_status');

  if (typeof item.content?.stem_raw !== 'string') errors.push('Missing content.stem_raw');
  if (typeof item.content?.stem_cleaned !== 'string') errors.push('Missing content.stem_cleaned');
  if (!Array.isArray(item.content?.options)) errors.push('content.options must be an array');

  if (!item.evaluation?.mapping_status) errors.push('Missing evaluation.mapping_status');
  if (!item.quality?.status) errors.push('Missing quality.status');
  if (!Array.isArray(item.quality?.review_flags)) errors.push('quality.review_flags must be an array');
  if (!Array.isArray(item.history?.transformations)) errors.push('history.transformations must be an array');

  return {
    valid: errors.length === 0,
    errors,
  };
}
