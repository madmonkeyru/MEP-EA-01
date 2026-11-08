import path from 'node:path';
import fs from 'node:fs';
import { applyQualityReview, compileMappingReport } from '../../apps/web/src/services/qbe/qualityReview';
import type { CanonicalIntermediateQuestion } from '../../apps/web/src/types/qbe';

async function main() {
  console.log('🚀 Running QBE-05 & QBE-06: Evaluation Mapping & Quality Review Pipeline...');
  const repoRoot = process.cwd();
  const cleanedDir = path.join(repoRoot, 'content', 'qbe', 'cleaned');
  const manifestsDir = path.join(repoRoot, 'content', 'qbe', 'manifests');

  const cleanedFiles = fs.readdirSync(cleanedDir).filter(f => f.endsWith('-cleaned.json'));

  const allReviewedQuestions: CanonicalIntermediateQuestion[] = [];

  for (const file of cleanedFiles) {
    const filePath = path.join(cleanedDir, file);
    const doc = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    const reviewedQuestions: CanonicalIntermediateQuestion[] = [];
    for (const item of doc.questions) {
      const { question } = applyQualityReview(item);
      reviewedQuestions.push(question);
      allReviewedQuestions.push(question);
    }

    // Overwrite with enriched evaluation mapping and Gate B status
    doc.questions = reviewedQuestions;
    fs.writeFileSync(filePath, JSON.stringify(doc, null, 2), 'utf8');
  }

  // Compile aggregate mapping & quality review report
  const { markdown, stats } = compileMappingReport(allReviewedQuestions);

  const reportPath = path.join(manifestsDir, 'MAPPING_REPORT.md');
  fs.writeFileSync(reportPath, markdown, 'utf8');

  const reportJsonPath = path.join(manifestsDir, 'mapping_report.json');
  fs.writeFileSync(reportJsonPath, JSON.stringify(stats, null, 2), 'utf8');

  console.log('\n=======================================');
  console.log('🎉 QBE-05 & QBE-06 Mapping Summary:');
  console.log(`   - Total Items Processed: ${allReviewedQuestions.length}`);
  console.log(`   - Gate B Qualified Items: ${stats.totalGateB} / ${allReviewedQuestions.length}`);
  console.log(`   - Geometry Mapped: ${stats.byArea.geometry.mapped} / ${stats.byArea.geometry.total}`);
  console.log(`   - Functions Mapped: ${stats.byArea.functions.mapped} / ${stats.byArea.functions.total}`);
  console.log(`   - Statistics Mapped: ${stats.byArea.statistics.mapped} / ${stats.byArea.statistics.total}`);
  console.log(`   - Report Markdown: ${reportPath}`);
  console.log('=======================================\n');
}

main().catch(err => {
  console.error('Fatal error in mapping pipeline runner:', err);
  process.exit(1);
});
