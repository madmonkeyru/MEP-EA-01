import path from 'node:path';
import fs from 'node:fs';
import { initializeCanonicalQuestion } from '../../src/services/qbe/canonicalSchema';
import {
  cleanAndReviewCanonicalQuestion,
  compileCleaningSummaryReport,
} from '../../src/services/qbe/cleaners/reviewFlagger';
import type {
  SourceManifestSummary,
  ExtractedAssetDocumentResult,
  CanonicalIntermediateQuestion,
} from '../../src/types/qbe';

async function main() {
  console.log('🚀 Running QBE-03 & QBE-04: Intermediate Cleaning & Review Flagging Pipeline...');
  const repoRoot = process.cwd();
  const manifestPath = path.join(repoRoot, 'content', 'qbe', 'manifests', 'source_manifest.json');
  const extractedDir = path.join(repoRoot, 'content', 'qbe', 'extracted');
  const cleanedOutputDir = path.join(repoRoot, 'content', 'qbe', 'cleaned');
  const manifestsDir = path.join(repoRoot, 'content', 'qbe', 'manifests');

  fs.mkdirSync(cleanedOutputDir, { recursive: true });

  const manifest: SourceManifestSummary = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const extractedFiles = fs.readdirSync(extractedDir).filter(f => f.endsWith('-extracted.json'));

  const allCleanedQuestions: CanonicalIntermediateQuestion[] = [];
  let totalTransformations = 0;

  for (const file of extractedFiles) {
    const extractedDoc: ExtractedAssetDocumentResult = JSON.parse(
      fs.readFileSync(path.join(extractedDir, file), 'utf8')
    );

    const assetManifest = manifest.assets.find(a => a.asset_id === extractedDoc.asset_id);
    if (!assetManifest) {
      console.warn(`Warning: Manifest not found for asset ${extractedDoc.asset_id}`);
      continue;
    }

    const cleanedItemsInAsset: CanonicalIntermediateQuestion[] = [];

    for (const extractedItem of extractedDoc.questions) {
      const canonicalInitial = initializeCanonicalQuestion(extractedItem, assetManifest);
      const { question, transformationsCount } = cleanAndReviewCanonicalQuestion(canonicalInitial);

      cleanedItemsInAsset.push(question);
      allCleanedQuestions.push(question);
      totalTransformations += transformationsCount;
    }

    // Save per-asset intermediate cleaned document
    const assetCleanedPath = path.join(cleanedOutputDir, `${assetManifest.asset_id}-cleaned.json`);
    fs.writeFileSync(
      assetCleanedPath,
      JSON.stringify(
        {
          asset_id: assetManifest.asset_id,
          convocatoria: assetManifest.convocatoria,
          area: assetManifest.area,
          total_questions: cleanedItemsInAsset.length,
          questions: cleanedItemsInAsset,
        },
        null,
        2
      ),
      'utf8'
    );
  }

  // Compile aggregate report
  const { report, markdown } = compileCleaningSummaryReport(allCleanedQuestions);

  // Write report artifacts
  const reportJsonPath = path.join(manifestsDir, 'cleaning_report.json');
  fs.writeFileSync(reportJsonPath, JSON.stringify(report, null, 2), 'utf8');

  const reportMdPath = path.join(manifestsDir, 'CLEANING_REPORT.md');
  fs.writeFileSync(reportMdPath, markdown, 'utf8');

  console.log('\n=======================================');
  console.log('🎉 QBE-03 & QBE-04 Cleaning Pipeline Summary:');
  console.log(`   - Extracted Questions Input: ${report.total_extracted_questions}`);
  console.log(`   - Cleaned Questions Output: ${report.total_cleaned_questions}`);
  console.log(`   - Total Audit Transformations: ${report.total_transformations_recorded}`);
  console.log(`   - Mathematical Normalizations: ${report.mathematical_normalizations_count}`);
  console.log(`   - Questions Requiring Review: ${report.questions_requiring_review}`);
  console.log(`   - Missing Answer Keys Flagged: ${report.questions_by_review_flag.missing_answer_key}`);
  console.log(`   - Incomplete Options Flagged: ${report.questions_by_review_flag.incomplete_options}`);
  console.log(`   - Ambiguous Math Flagged: ${report.questions_by_review_flag.ambiguous_math}`);
  console.log(`   - Missing Visuals Flagged: ${report.questions_by_review_flag.missing_visual}`);
  console.log(`   - Cleaned Output Dir: ${cleanedOutputDir}`);
  console.log(`   - Report Markdown: ${reportMdPath}`);
  console.log('=======================================\n');
}

main().catch(err => {
  console.error('Fatal error in cleaning pipeline runner:', err);
  process.exit(1);
});
