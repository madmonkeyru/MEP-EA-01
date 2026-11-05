import path from 'node:path';
import { scanRawAssets, saveInventoryArtifacts } from '../../src/services/qbe/assetInventory';

async function main() {
  console.log('🚀 Running QBE-01: Asset Inventory & Provenance Scan...');
  const repoRoot = process.cwd();
  const outputDir = path.join(repoRoot, 'content', 'qbe', 'manifests');

  const { summary, coverage } = await scanRawAssets();

  console.log(`✅ Discovered ${summary.total_assets} raw DOCX assets.`);
  console.log(`   - Geometry: ${summary.by_area.geometry}`);
  console.log(`   - Functions: ${summary.by_area.functions}`);
  console.log(`   - Statistics: ${summary.by_area.statistics}`);
  console.log(`   - Duplicate files: ${Object.keys(summary.duplicate_hashes).length}`);

  saveInventoryArtifacts(outputDir, summary, coverage);
  console.log(`💾 Artifacts written to ${outputDir}:`);
  console.log(`   - source_manifest.json`);
  console.log(`   - coverage_matrix.json`);
  console.log(`   - INVENTORY_REPORT.md`);
}

main();
