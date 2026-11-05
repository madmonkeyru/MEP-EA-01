import { describe, it, expect } from 'vitest';
import path from 'node:path';
import fs from 'node:fs';
import {
  parseDocumentRelationships,
  extractDocxContentAndVisuals,
} from '../../services/qbe/docxExtractor';
import { scanRawAssets } from '../../services/qbe/assetInventory';

describe('QBE-02: DOCX Content & Visual Asset Extraction Engine', () => {
  it('parses OpenXML relationships correctly', () => {
    const sampleRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
      <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image1.png"/>
      <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
    </Relationships>`;

    const relMap = parseDocumentRelationships(sampleRels);
    expect(relMap.get('rId1')).toBe('media/image1.png');
    expect(relMap.get('rId2')).toBe('styles.xml');
  });

  it('extracts questions, options, and visual assets from a representative Geometry DOCX', async () => {
    const { summary } = await scanRawAssets();
    const geoAsset = summary.assets.find(
      a => a.convocatoria === '2021-c1' && a.area === 'geometry'
    );
    expect(geoAsset).toBeDefined();

    const rawFilePath = path.join(process.cwd(), geoAsset!.rel_path);
    const result = await extractDocxContentAndVisuals(geoAsset!, rawFilePath);

    expect(result.asset_id).toBe(geoAsset!.asset_id);
    expect(result.questions.length).toBeGreaterThan(15);
    expect(result.media_count).toBeGreaterThan(0);

    // Verify first question structure
    const q1 = result.questions[0];
    expect(q1.source_question_number).toBe(1);
    expect(q1.stem_text).toContain('circunferencia');
    expect(q1.options.length).toBe(4);
    expect(q1.options.map(o => o.id)).toEqual(['A', 'B', 'C', 'D']);
    expect(q1.provenance.provenance_status).toBe('source_unverified');
    expect(q1.quality_gate_a_passed).toBe(true);

    // Verify that at least one question received an associated visual diagram
    const hasVisualQuestion = result.questions.some(q => q.visuals.length > 0);
    expect(hasVisualQuestion).toBe(true);
  });

  it('extracts questions from a representative Functions DOCX', async () => {
    const { summary } = await scanRawAssets();
    const funAsset = summary.assets.find(
      a => a.convocatoria === '2021-c1' && a.area === 'functions'
    );
    expect(funAsset).toBeDefined();

    const rawFilePath = path.join(process.cwd(), funAsset!.rel_path);
    const result = await extractDocxContentAndVisuals(funAsset!, rawFilePath);

    expect(result.questions.length).toBeGreaterThan(15);
    const qWithStem = result.questions.filter(q => q.diagnostics.has_stem);
    expect(qWithStem.length).toBe(result.questions.length);
  });

  it('extracts questions from a representative Statistics DOCX', async () => {
    const { summary } = await scanRawAssets();
    const statsAsset = summary.assets.find(
      a => a.convocatoria === '2021-c1' && a.area === 'statistics'
    );
    expect(statsAsset).toBeDefined();

    const rawFilePath = path.join(process.cwd(), statsAsset!.rel_path);
    const result = await extractDocxContentAndVisuals(statsAsset!, rawFilePath);

    expect(result.questions.length).toBeGreaterThan(5);
  });

  it('verifies that extracted JSON files on disk conform to the extracted asset schema', () => {
    const extractedDir = path.join(process.cwd(), 'content', 'qbe', 'extracted');
    expect(fs.existsSync(extractedDir)).toBe(true);

    const files = fs.readdirSync(extractedDir).filter(f => f.endsWith('-extracted.json'));
    expect(files.length).toBe(27);

    const firstJson = JSON.parse(fs.readFileSync(path.join(extractedDir, files[0]), 'utf8'));
    expect(firstJson.asset_id).toBeDefined();
    expect(Array.isArray(firstJson.questions)).toBe(true);
  });
});
