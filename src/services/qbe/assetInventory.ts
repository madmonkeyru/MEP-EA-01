import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { listZipEntries, readZipEntryAsText } from './zipHelper';
import type {
  RawAssetManifestEntry,
  SourceManifestSummary,
  ConvocatoriaCoverageEntry,
} from '../../types/qbe';

export interface ScanOptions {
  baseDir?: string;
  outputDir?: string;
}

const KNOWN_AREAS: Record<string, { area: 'geometry' | 'functions' | 'statistics'; code: string }> = {
  FUN: { area: 'functions', code: 'FUN' },
  'GEOMETRY BXM MATH': { area: 'geometry', code: 'GEO' },
  STATS: { area: 'statistics', code: 'STATS' },
};

/**
 * Parses filename like:
 * "BXM Math FUN 01 C2019.docx" -> year 2019, period 1
 * "BXM Math GEO 01 C21.docx" -> year 2021, period 1
 * "BXM Math Geo 02 C24.docx" -> year 2024, period 2
 */
export function parseFilenameMetadata(filename: string): {
  year: number;
  period: number;
  convocatoria: string;
  claimedOrigin: string;
} {
  const cleanName = filename.replace(/\.docx$/i, '').trim();
  // Match period (01 or 02) and year (C2019, C21, C2024, etc.)
  const match = cleanName.match(/\b(01|02|1|2)\s+C(?:20)?(\d{2})\b/i);

  if (!match) {
    throw new Error(`Unable to parse convocatoria metadata from filename: "${filename}"`);
  }

  const period = parseInt(match[1], 10);
  let yearNum = parseInt(match[2], 10);
  if (yearNum < 100) {
    yearNum += 2000;
  }

  const convocatoria = `${yearNum}-c${period}`;
  const claimedOrigin = `Convocatoria Oficial BXM ${yearNum}-${period} (${cleanName})`;

  return {
    year: yearNum,
    period,
    convocatoria,
    claimedOrigin,
  };
}

export function calculateSha256(filePath: string): string {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

export async function inspectDocxStructure(filePath: string): Promise<{
  paragraphCount: number;
  pageCountEstimate: number;
  imageCount: number;
  notes: string[];
}> {
  const notes: string[] = [];
  let paragraphCount = 0;
  let pageCountEstimate = 1;
  let imageCount = 0;

  try {
    const entries = await listZipEntries(filePath);
    for (const entry of entries) {
      const name = entry.fileName.replace(/\\/g, '/');
      if (name.startsWith('word/media/')) {
        imageCount++;
      }
    }

    const docXmlText = await readZipEntryAsText(filePath, 'word/document.xml');
    if (docXmlText && docXmlText.length > 0) {
      // Count w:p paragraphs
      const pMatches = docXmlText.match(/<w:p[\s>]/g);
      paragraphCount = pMatches ? pMatches.length : 0;

      // Count page breaks (<w:br w:type="page"/> or <w:lastRenderedPageBreak/>)
      const pageBrMatches = docXmlText.match(/w:type="page"|lastRenderedPageBreak/g);
      if (pageBrMatches) {
        pageCountEstimate = pageBrMatches.length + 1;
      } else {
        // Rough estimate: 12 paragraphs per page
        pageCountEstimate = Math.max(1, Math.round(paragraphCount / 12));
      }
    } else {
      notes.push('Missing word/document.xml in DOCX zip archive');
    }
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    notes.push(`Error inspecting DOCX: ${errMsg}`);
  }

  return {
    paragraphCount,
    pageCountEstimate,
    imageCount,
    notes,
  };
}

export async function scanRawAssets(options: ScanOptions = {}): Promise<{
  summary: SourceManifestSummary;
  coverage: ConvocatoriaCoverageEntry[];
}> {
  const repoRoot = process.cwd();
  const baseDir = options.baseDir || path.join(repoRoot, 'project_docs', 'Raw questions ASSETS');

  if (!fs.existsSync(baseDir)) {
    throw new Error(`Raw assets directory not found at: ${baseDir}`);
  }

  const entries: RawAssetManifestEntry[] = [];
  const hashMap = new Map<string, string[]>();
  const byArea = { geometry: 0, functions: 0, statistics: 0 };
  const byConvocatoria: Record<string, number> = {};
  let totalBytes = 0;

  const areaDirs = fs.readdirSync(baseDir, { withFileTypes: true });

  for (const dir of areaDirs) {
    if (!dir.isDirectory()) continue;
    const areaMeta = KNOWN_AREAS[dir.name];
    if (!areaMeta) continue;

    const fullDirPath = path.join(baseDir, dir.name);
    const files = fs.readdirSync(fullDirPath).filter(f => f.endsWith('.docx') && !f.startsWith('~$'));

    for (const filename of files) {
      const fullPath = path.join(fullDirPath, filename);
      const relPath = path.relative(repoRoot, fullPath);
      const stat = fs.statSync(fullPath);
      totalBytes += stat.size;

      const hash = calculateSha256(fullPath);
      if (!hashMap.has(hash)) {
        hashMap.set(hash, []);
      }
      hashMap.get(hash)!.push(relPath);

      const parsedMeta = parseFilenameMetadata(filename);
      const docxStats = await inspectDocxStructure(fullPath);

      const assetId = `bxm-raw-${parsedMeta.convocatoria}-${areaMeta.area}-${parsedMeta.period}`;

      const entry: RawAssetManifestEntry = {
        asset_id: assetId,
        filename,
        rel_path: relPath,
        file_hash_sha256: hash,
        file_size_bytes: stat.size,
        convocatoria: parsedMeta.convocatoria,
        year: parsedMeta.year,
        convocatoria_number: parsedMeta.period,
        area: areaMeta.area,
        area_raw: dir.name,
        subject: 'matematica',
        program: 'bxm',
        version: '1.0.0',
        source_type: 'docx',
        claimed_origin: parsedMeta.claimedOrigin,
        created_at: stat.birthtime.toISOString(),
        modified_at: stat.mtime.toISOString(),
        page_count_estimate: docxStats.pageCountEstimate,
        paragraph_count: docxStats.paragraphCount,
        image_count: docxStats.imageCount,
        extraction_status: 'pending',
        // Invariant: initial classification is derived + source_unverified
        provenance_status: 'source_unverified',
        quality_status: 'raw',
        notes: docxStats.notes,
      };

      entries.push(entry);
      byArea[areaMeta.area]++;
      byConvocatoria[parsedMeta.convocatoria] = (byConvocatoria[parsedMeta.convocatoria] || 0) + 1;
    }
  }

  // Sort deterministically by convocatoria then area
  entries.sort((a, b) => {
    if (a.convocatoria !== b.convocatoria) {
      return a.convocatoria.localeCompare(b.convocatoria);
    }
    return a.area.localeCompare(b.area);
  });

  const duplicateHashes: Record<string, string[]> = {};
  for (const [hash, fileList] of hashMap.entries()) {
    if (fileList.length > 1) {
      duplicateHashes[hash] = fileList;
    }
  }

  // Calculate coverage across all discovered convocatorias
  const allConvocatorias = new Set<string>();
  entries.forEach(e => allConvocatorias.add(e.convocatoria));

  // Also include expected standard matrix from 2019 to 2025 (c1 and c2)
  for (let y = 2019; y <= 2025; y++) {
    allConvocatorias.add(`${y}-c1`);
    allConvocatorias.add(`${y}-c2`);
  }

  const coverage: ConvocatoriaCoverageEntry[] = [];
  const sortedConvs = Array.from(allConvocatorias).sort();

  for (const conv of sortedConvs) {
    const [yStr, cStr] = conv.split('-c');
    const y = parseInt(yStr, 10);
    const p = parseInt(cStr, 10);

    const geoAsset = entries.find(e => e.convocatoria === conv && e.area === 'geometry');
    const funAsset = entries.find(e => e.convocatoria === conv && e.area === 'functions');
    const statsAsset = entries.find(e => e.convocatoria === conv && e.area === 'statistics');

    const missing: string[] = [];
    if (!geoAsset) missing.push('geometry');
    if (!funAsset) missing.push('functions');
    if (!statsAsset) missing.push('statistics');

    coverage.push({
      convocatoria: conv,
      year: y,
      period: p,
      expected_domains: {
        geometry: {
          present: !!geoAsset,
          asset_id: geoAsset?.asset_id,
          filename: geoAsset?.filename,
        },
        functions: {
          present: !!funAsset,
          asset_id: funAsset?.asset_id,
          filename: funAsset?.filename,
        },
        statistics: {
          present: !!statsAsset,
          asset_id: statsAsset?.asset_id,
          filename: statsAsset?.filename,
        },
      },
      is_complete: missing.length === 0,
      missing_domains: missing,
    });
  }

  const summary: SourceManifestSummary = {
    manifest_version: '1.0.0',
    generated_at: new Date().toISOString(),
    total_assets: entries.length,
    total_bytes: totalBytes,
    by_area: byArea,
    by_convocatoria: byConvocatoria,
    duplicate_hashes: duplicateHashes,
    assets: entries,
  };

  return { summary, coverage };
}

export function saveInventoryArtifacts(
  outputDir: string,
  summary: SourceManifestSummary,
  coverage: ConvocatoriaCoverageEntry[]
): void {
  fs.mkdirSync(outputDir, { recursive: true });

  const manifestPath = path.join(outputDir, 'source_manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(summary, null, 2), 'utf8');

  const coveragePath = path.join(outputDir, 'coverage_matrix.json');
  fs.writeFileSync(coveragePath, JSON.stringify(coverage, null, 2), 'utf8');

  // Also write human-readable Markdown report
  const mdReportPath = path.join(outputDir, 'INVENTORY_REPORT.md');
  const mdLines = [
    '# QBE-01: Asset Inventory & Convocatoria Coverage Report',
    '',
    `**Generated:** ${summary.generated_at}`,
    `**Total Raw DOCX Assets:** ${summary.total_assets}`,
    `**Total Data Size:** ${(summary.total_bytes / (1024 * 1024)).toFixed(2)} MB`,
    `**Duplicate Files Detected:** ${Object.keys(summary.duplicate_hashes).length}`,
    '',
    '## Breakdown by Domain Area',
    `- **Geometry:** ${summary.by_area.geometry} assets`,
    `- **Functions (FUN):** ${summary.by_area.functions} assets`,
    `- **Statistics (STATS):** ${summary.by_area.statistics} assets`,
    '',
    '## Convocatoria Coverage Matrix',
    '| Convocatoria | Geometry | Functions | Statistics | Status | Missing |',
    '|---|---|---|---|---|---|',
  ];

  for (const c of coverage) {
    const geo = c.expected_domains.geometry.present ? '✅' : '❌';
    const fun = c.expected_domains.functions.present ? '✅' : '❌';
    const sta = c.expected_domains.statistics.present ? '✅' : '❌';
    const st = c.is_complete ? '**Complete**' : 'Partial / Missing';
    const miss = c.missing_domains.length > 0 ? c.missing_domains.join(', ') : 'None';
    mdLines.push(`| ${c.convocatoria} | ${geo} | ${fun} | ${sta} | ${st} | ${miss} |`);
  }

  mdLines.push('');
  mdLines.push('## Provenance & Quality Invariant');
  mdLines.push('- All 27 assets are initialized with status: `provenance_status: source_unverified`, `quality_status: raw`.');
  mdLines.push('- Raw DOCX files remain immutable under `project_docs/Raw questions ASSETS/`.');
  mdLines.push('');

  fs.writeFileSync(mdReportPath, mdLines.join('\n'), 'utf8');
}
