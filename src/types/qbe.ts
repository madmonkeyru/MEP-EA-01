/**
 * Question Bank Expansion (QBE) Data Contracts and Schema Types
 * Ref: project_docs/MVP Questions Asset Expansion.md
 */

export type ProvenanceStatus =
  | 'source_unverified'
  | 'source_partially_verified'
  | 'official_verified'
  | 'derived'
  | 'internal_generated'
  | 'rejected';

export type QualityStatus =
  | 'raw'
  | 'extracted'
  | 'needs_review'
  | 'approved'
  | 'rejected';

export type EvaluationMappingStatus =
  | 'unmapped'
  | 'candidate'
  | 'validated'
  | 'conflict'
  | 'no_direct_mapping';

export type CorrectionCategory =
  | 'formatting'
  | 'whitespace'
  | 'unicode_normalization'
  | 'mathematical_notation'
  | 'orthography'
  | 'punctuation'
  | 'transcription'
  | 'semantic_correction'
  | 'answer_key_correction';

export type ReviewFlagType =
  | 'missing_answer_key'
  | 'incomplete_options'
  | 'ambiguous_math'
  | 'semantic_change_candidate'
  | 'missing_visual';

export interface TransformationRecord {
  stage: 'stage_1_mechanical' | 'stage_2_semantic_review' | 'manual_review';
  rule_id: string;
  original_text: string;
  normalized_text: string;
  correction_type: CorrectionCategory;
  semantic_change: boolean;
  reason: string;
  confidence: number;
  timestamp: string;
}

export interface CanonicalQuestionSource {
  asset_id: string;
  filename: string;
  convocatoria: string;
  area: 'geometry' | 'functions' | 'statistics';
  subject: 'matematica';
  program: 'bxm';
  version: string;
  source_type: 'docx';
  provenance_status: ProvenanceStatus;
  claimed_origin: string;
}

export interface CanonicalOption {
  id: string; // 'A' | 'B' | 'C' | 'D'
  text_raw: string;
  text_cleaned: string;
  visuals: ExtractedVisualAsset[];
}

export interface CanonicalQuestionContent {
  stem_raw: string;
  stem_cleaned: string;
  options: CanonicalOption[];
  detected_answer?: string | null;
  explanation_raw?: string | null;
  explanation_cleaned?: string | null;
}

export interface CanonicalEvaluationMapping {
  framework_version: string; // e.g. "02-2026"
  afirmacion?: string | null; // e.g. "A1"
  evidencia?: string | null; // e.g. "E1.2"
  mapping_status: EvaluationMappingStatus;
  mapping_confidence: number;
  rationale?: string;
}

export interface CanonicalQuestionClassification {
  topic?: string;
  subtopic?: string;
  difficulty?: 'basic' | 'intermediate' | 'advanced';
  cognitive_level?: 'reproduccion' | 'conexion' | 'reflexion';
}

export interface CanonicalQuestionQuality {
  status: QualityStatus;
  gate_a_extraction_passed: boolean;
  gate_b_quality_passed: boolean;
  gate_c_internalization_passed: boolean;
  review_flags: ReviewFlagType[];
  issues: string[];
}

export interface CanonicalQuestionReview {
  extraction_reviewed: boolean;
  content_reviewed: boolean;
  answer_reviewed: boolean;
  mapping_reviewed: boolean;
  reviewer_notes: string[];
}

export interface CanonicalConfidenceScore {
  source_confidence: number;
  extraction_confidence: number;
  answer_confidence: number;
  mapping_confidence: number;
  content_confidence: number;
}

export interface CanonicalIntermediateQuestion {
  id: string;
  source: CanonicalQuestionSource;
  content: CanonicalQuestionContent;
  visuals: ExtractedVisualAsset[];
  classification: CanonicalQuestionClassification;
  evaluation: CanonicalEvaluationMapping;
  quality: CanonicalQuestionQuality;
  review: CanonicalQuestionReview;
  confidence: CanonicalConfidenceScore;
  history: {
    transformations: TransformationRecord[];
  };
}

export interface CleaningSummaryReport {
  generated_at: string;
  total_extracted_questions: number;
  total_cleaned_questions: number;
  total_transformations_recorded: number;
  transformations_by_type: Record<CorrectionCategory, number>;
  questions_requiring_review: number;
  questions_by_review_flag: Record<ReviewFlagType, number>;
  questions_with_potential_semantic_changes: number;
  questions_unchanged: number;
  mathematical_normalizations_count: number;
}

export interface RawAssetManifestEntry {
  asset_id: string;
  filename: string;
  rel_path: string;
  file_hash_sha256: string;
  file_size_bytes: number;
  convocatoria: string; // e.g. "2019-c1", "2021-c2"
  year: number;
  convocatoria_number: number; // 1 or 2
  area: 'geometry' | 'functions' | 'statistics';
  area_raw: string; // "FUN", "GEOMETRY BXM MATH", "STATS"
  subject: 'matematica';
  program: 'bxm';
  version: string;
  source_type: 'docx';
  claimed_origin: string;
  created_at: string;
  modified_at: string;
  page_count_estimate: number;
  paragraph_count: number;
  image_count: number;
  extraction_status: 'pending' | 'extracted' | 'failed';
  provenance_status: ProvenanceStatus;
  quality_status: QualityStatus;
  notes: string[];
}

export interface ConvocatoriaCoverageEntry {
  convocatoria: string; // e.g., "2019-c1"
  year: number;
  period: number;
  expected_domains: {
    geometry: { present: boolean; asset_id?: string; filename?: string };
    functions: { present: boolean; asset_id?: string; filename?: string };
    statistics: { present: boolean; asset_id?: string; filename?: string };
  };
  is_complete: boolean;
  missing_domains: string[];
}

export interface SourceManifestSummary {
  manifest_version: string;
  generated_at: string;
  total_assets: number;
  total_bytes: number;
  by_area: {
    geometry: number;
    functions: number;
    statistics: number;
  };
  by_convocatoria: Record<string, number>;
  duplicate_hashes: Record<string, string[]>;
  assets: RawAssetManifestEntry[];
}

export interface ExtractedVisualAsset {
  id: string;
  original_filename: string;
  stored_filename: string;
  rel_path: string;
  content_type: string;
  sha256: string;
  byte_size: number;
  relationship_id?: string;
  role: 'question_diagram' | 'option_diagram' | 'table_image' | 'decorative' | 'unknown';
  required_for_answer: boolean;
}

export interface ExtractedOption {
  id: string; // 'A' | 'B' | 'C' | 'D'
  text: string;
  visuals: ExtractedVisualAsset[];
}

export interface ExtractedQuestionItem {
  id: string;
  asset_id: string;
  source_question_number: number;
  stem_text: string;
  options: ExtractedOption[];
  detected_answer?: string; // e.g. 'A' | 'B' | 'C' | 'D'
  explanation_raw?: string;
  visuals: ExtractedVisualAsset[];
  extraction_confidence: number;
  diagnostics: {
    has_stem: boolean;
    option_count: number;
    has_answer: boolean;
    issues: string[];
  };
  provenance: {
    source_asset_id: string;
    source_filename: string;
    convocatoria: string;
    area: string;
    provenance_status: ProvenanceStatus;
    source_confidence: number;
  };
  quality_gate_a_passed: boolean;
}

export interface ExtractedAssetDocumentResult {
  asset_id: string;
  filename: string;
  extracted_at: string;
  total_questions_detected: number;
  questions: ExtractedQuestionItem[];
  media_count: number;
  diagnostics: {
    warnings: string[];
    errors: string[];
  };
}
