import { describe, it, expect } from 'vitest';
import path from 'node:path';
import fs from 'node:fs';
import {
  parseFilenameMetadata,
  calculateSha256,
  inspectDocxStructure,
  scanRawAssets,
} from '../../services/qbe/assetInventory';

describe('QBE-01: Asset Inventory & Provenance Verification', () => {
  it('correctly parses various filename patterns into convocatoria metadata', () => {
    const geo1 = parseFilenameMetadata('BXM Math GEO 01 C21.docx');
    expect(geo1.year).toBe(2021);
    expect(geo1.period).toBe(1);
    expect(geo1.convocatoria).toBe('2021-c1');

    const fun2019 = parseFilenameMetadata('BXM Math FUN 02 C2019.docx');
    expect(fun2019.year).toBe(2019);
    expect(fun2019.period).toBe(2);
    expect(fun2019.convocatoria).toBe('2019-c2');

    const stats24 = parseFilenameMetadata('BXM Math STATS 02 C2024.docx');
    expect(stats24.year).toBe(2024);
    expect(stats24.period).toBe(2);
    expect(stats24.convocatoria).toBe('2024-c2');
  });

  it('calculates deterministic SHA-256 for assets', () => {
    const testFile = path.join(
      process.cwd(),
      'project_docs/Raw questions ASSETS/GEOMETRY BXM MATH/BXM Math GEO 01 C21.docx'
    );
    const hash1 = calculateSha256(testFile);
    const hash2 = calculateSha256(testFile);
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
  });

  it('inspects DOCX structure and detects paragraphs and media files', async () => {
    const testFile = path.join(
      process.cwd(),
      'project_docs/Raw questions ASSETS/GEOMETRY BXM MATH/BXM Math GEO 01 C21.docx'
    );
    const result = await inspectDocxStructure(testFile);
    expect(result.paragraphCount).toBeGreaterThan(0);
    expect(result.imageCount).toBeGreaterThan(0);
    expect(result.notes).toEqual([]);
  });

  it('scans all 27 raw DOCX assets without duplicates and with source_unverified provenance', async () => {
    const { summary, coverage } = await scanRawAssets();

    expect(summary.total_assets).toBe(27);
    expect(summary.by_area.geometry).toBe(9);
    expect(summary.by_area.functions).toBe(10);
    expect(summary.by_area.statistics).toBe(8);
    expect(Object.keys(summary.duplicate_hashes)).toHaveLength(0);

    for (const asset of summary.assets) {
      expect(asset.provenance_status).toBe('source_unverified');
      expect(asset.quality_status).toBe('raw');
      expect(asset.file_hash_sha256).toHaveLength(64);
      expect(asset.paragraph_count).toBeGreaterThan(0);
    }

    // Verify coverage matrix contains expected complete convocatorias (e.g. 2021-c1, 2024-c2)
    const c2021c1 = coverage.find(c => c.convocatoria === '2021-c1');
    expect(c2021c1?.is_complete).toBe(true);

    const c2019c1 = coverage.find(c => c.convocatoria === '2019-c1');
    expect(c2019c1?.is_complete).toBe(false);
    expect(c2019c1?.missing_domains).toContain('geometry');
  });

  it('verifies that the generated manifest file matches the scan results', () => {
    const manifestPath = path.join(process.cwd(), 'content/qbe/manifests/source_manifest.json');
    expect(fs.existsSync(manifestPath)).toBe(true);
    const content = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    expect(content.total_assets).toBe(27);
  });
});
