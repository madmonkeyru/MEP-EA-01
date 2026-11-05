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
  | 'not_applicable';

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
