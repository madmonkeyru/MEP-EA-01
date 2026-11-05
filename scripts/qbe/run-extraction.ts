import path from 'node:path';
import fs from 'node:fs';
import { extractDocxContentAndVisuals, saveExtractedResult } from '../../src/services/qbe/docxExtractor';
import type { SourceManifestSummary } from '../../src/types/qbe';

async function main() {
  console.log('🚀 Running QBE-02: DOCX Extraction Pipeline...');
  const repoRoot = process.cwd();
  const manifestPath = path.join(repoRoot, 'content', 'qbe', 'manifests', 'source_manifest.json');

  if (!fs.existsSync(manifestPath)) {
    throw new Error('source_manifest.json not found! Run QBE-01 first.');
  }

  const manifest: SourceManifestSummary = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const extractedOutputDir = path.join(repoRoot, 'content', 'qbe', 'extracted');
  const mediaOutputDir = path.join(repoRoot, 'content', 'qbe', 'assets', 'media');

  let totalQuestions = 0;
  let totalVisuals = 0;
  let totalGateAPassed = 0;

  for (const asset of manifest.assets) {
    const rawFilePath = path.join(repoRoot, asset.rel_path);
    console.log(`Processing [${asset.convocatoria} / ${asset.area}]: ${asset.filename}...`);

    const result = await extractDocxContentAndVisuals(asset, rawFilePath, {
      extractedOutputDir,
      mediaOutputDir,
    });

    saveExtractedResult(extractedOutputDir, result);

    const gateAPassed = result.questions.filter(q => q.quality_gate_a_passed).length;
    totalQuestions += result.questions.length;
    totalVisuals += result.media_count;
    totalGateAPassed += gateAPassed;

    console.log(
      `   -> Detected ${result.questions.length} questions (${gateAPassed} Gate A passed), ${result.media_count} media files.`
    );
  }

  console.log('\n=======================================');
  console.log('🎉 QBE-02 Extraction Summary:');
  console.log(`   - Assets Processed: ${manifest.assets.length}`);
  console.log(`   - Total Questions Detected: ${totalQuestions}`);
  console.log(`   - Total Gate A Passed: ${totalGateAPassed}`);
  console.log(`   - Total Visuals Extracted: ${totalVisuals}`);
  console.log(`   - Output Artifacts: ${extractedOutputDir}`);
  console.log('=======================================\n');
}

main().catch(err => {
  console.error('Fatal error in QBE-02:', err);
  process.exit(1);
});
