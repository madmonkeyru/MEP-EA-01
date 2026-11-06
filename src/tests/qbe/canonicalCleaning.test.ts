import { describe, it, expect } from 'vitest';
import path from 'node:path';
import fs from 'node:fs';
import {
  initializeCanonicalQuestion,
  validateCanonicalIntermediateQuestion,
} from '../../services/qbe/canonicalSchema';
import { normalizeMechanicalText } from '../../services/qbe/cleaners/mechanicalNormalizer';
import {
  cleanAndReviewCanonicalQuestion,
  compileCleaningSummaryReport,
} from '../../services/qbe/cleaners/reviewFlagger';
import type {
  SourceManifestSummary,
  ExtractedAssetDocumentResult,
  CanonicalIntermediateQuestion,
} from '../../types/qbe';

describe('QBE-03 & QBE-04: Canonical Intermediate Schema & Two-Stage Cleaning', () => {
  it('normalizes mechanical text deterministically and records transformations', () => {
    const raw = '  (x-1)² + y² = 16*  ';
    const res1 = normalizeMechanicalText(raw);
    const res2 = normalizeMechanicalText(raw);

    expect(res1.text).toBe(res2.text);
    expect(res1.text).toBe('$(x-1)^2 + y^2 = 16$');
    expect(res1.transformations.length).toBeGreaterThan(0);

    const types = res1.transformations.map(t => t.correction_type);
    expect(types).toContain('whitespace');
    expect(types).toContain('formatting');
    expect(types).toContain('unicode_normalization');
    expect(types).toContain('mathematical_notation');
  });

  it('normalizes radical expressions conservatively', () => {
    const raw = 'Si el radio mide √5 unidades';
    const res = normalizeMechanicalText(raw);
    expect(res.text).toBe('Si el radio mide \\sqrt{5} unidades');
    expect(res.transformations.some(t => t.correction_type === 'mathematical_notation')).toBe(true);
  });

  it('flags ambiguous mathematical overline notation (e.g. Q̅P̅) without altering semantic content', () => {
    const raw = '3- Si Q̅P̅ es el radio de C, entonces la ecuación de C corresponde a*';
    const res = normalizeMechanicalText(raw);
    expect(res.ambiguousMathDetected).toBe(true);
    expect(res.ambiguousDetails[0]).toContain('overline segment notation');
    // Ensure Q and P are preserved
    expect(res.text).toContain('Q');
    expect(res.text).toContain('P');
  });

  it('preserves raw content and makes original text 100% recoverable', () => {
    const mockExtracted = {
      id: 'test-q01',
      asset_id: 'test-asset',
      source_question_number: 1,
      stem_text: '  Calcule el área de la circunferencia con radio 4* ',
      options: [
        { id: 'A', text: '16π', visuals: [] },
        { id: 'B', text: '8π', visuals: [] },
      ],
      visuals: [],
      extraction_confidence: 0.9,
      diagnostics: { has_stem: true, option_count: 2, has_answer: false, issues: [] },
      provenance: {
        source_asset_id: 'test-asset',
        source_filename: 'test.docx',
        convocatoria: '2021-c1',
        area: 'geometry',
        provenance_status: 'source_unverified' as const,
        source_confidence: 0.5,
      },
      quality_gate_a_passed: true,
    };

    const mockManifest = {
      asset_id: 'test-asset',
      filename: 'test.docx',
      rel_path: 'test.docx',
      file_hash_sha256: 'abc123hash',
      file_size_bytes: 1000,
      convocatoria: '2021-c1',
      year: 2021,
      convocatoria_number: 1,
      area: 'geometry' as const,
      area_raw: 'GEO',
      subject: 'matematica' as const,
      program: 'bxm' as const,
      version: '1.0.0',
      source_type: 'docx' as const,
      claimed_origin: 'Convocatoria 2021-1',
      created_at: new Date().toISOString(),
      modified_at: new Date().toISOString(),
      page_count_estimate: 5,
      paragraph_count: 50,
      image_count: 0,
      extraction_status: 'extracted' as const,
      provenance_status: 'source_unverified' as const,
      quality_status: 'raw' as const,
      notes: [],
    };

    const initial = initializeCanonicalQuestion(mockExtracted, mockManifest);
    const { question } = cleanAndReviewCanonicalQuestion(initial);

    // Verify original text is completely recoverable
    expect(question.content.stem_raw).toBe(mockExtracted.stem_text);
    expect(question.content.options[0].text_raw).toBe('16π');

    // Verify clean text was normalized
    expect(question.content.stem_cleaned).toBe('Calcule el área de la circunferencia con radio 4');

    // Verify Review Flags
    expect(question.quality.review_flags).toContain('missing_answer_key');
    expect(question.quality.review_flags).toContain('incomplete_options'); // only 2 options
    expect(question.quality.status).toBe('needs_review');

    // Verify schema validity
    const validation = validateCanonicalIntermediateQuestion(question);
    expect(validation.valid).toBe(true);
    expect(validation.errors).toEqual([]);
  });

  it('validates canonical schema across all 564 extracted items and checks visual associations', () => {
    const repoRoot = process.cwd();
    const manifestPath = path.join(repoRoot, 'content/qbe/manifests/source_manifest.json');
    const manifest: SourceManifestSummary = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    const extractedDir = path.join(repoRoot, 'content/qbe/extracted');
    const files = fs.readdirSync(extractedDir).filter(f => f.endsWith('-extracted.json'));

    expect(files.length).toBe(27);

    const allCleaned: CanonicalIntermediateQuestion[] = [];
    let totalVisualsCount = 0;

    for (const file of files) {
      const extractedDoc: ExtractedAssetDocumentResult = JSON.parse(
        fs.readFileSync(path.join(extractedDir, file), 'utf8')
      );
      const assetManifest = manifest.assets.find(a => a.asset_id === extractedDoc.asset_id);
      expect(assetManifest).toBeDefined();

      for (const item of extractedDoc.questions) {
        const canonical = initializeCanonicalQuestion(item, assetManifest!);
        const { question } = cleanAndReviewCanonicalQuestion(canonical);

        const val = validateCanonicalIntermediateQuestion(question);
        expect(val.valid).toBe(true);

        // Invariant: provenance status is never altered by cleaning
        expect(question.source.provenance_status).toBe('source_unverified');

        // Check visuals
        totalVisualsCount += question.visuals.length;

        allCleaned.push(question);
      }
    }

    // 1. All 564 extracted questions represented
    expect(allCleaned.length).toBe(564);

    // 2. Visual associations preserved (some shared diagrams like contextual prompts are associated with multiple subquestions)
    expect(totalVisualsCount).toBeGreaterThanOrEqual(168);
    const uniqueVisualIds = new Set<string>();
    allCleaned.forEach(q => q.visuals.forEach(v => uniqueVisualIds.add(v.id)));
    expect(uniqueVisualIds.size).toBe(168);

    // 3. Compile report and verify reconciliation
    const { report } = compileCleaningSummaryReport(allCleaned);
    expect(report.total_extracted_questions).toBe(564);
    expect(report.total_cleaned_questions).toBe(564);
    expect(report.total_transformations_recorded).toBeGreaterThan(0);
    expect(report.questions_by_review_flag.missing_answer_key).toBe(564); // all raw docs lack official answer keys
  });
});
