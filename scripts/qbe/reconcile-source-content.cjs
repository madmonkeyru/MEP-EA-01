// Recover source boundaries without overwriting already reviewed questions.
const fs = require('node:fs');
const path = require('node:path');
const load = require('../bxm-integration/load-ts.cjs');
const { extractDocxContentAndVisuals } = load('apps/web/src/services/qbe/docxExtractor.ts');
const { initializeCanonicalQuestion } = load('apps/web/src/services/qbe/canonicalSchema.ts');
const { cleanAndReviewCanonicalQuestion } = load('apps/web/src/services/qbe/cleaners/reviewFlagger.ts');

(async () => {
  const manifest = JSON.parse(fs.readFileSync('content/qbe/manifests/source_manifest.json', 'utf8'));
  const reconciled = [];
  for (const asset of manifest.assets) {
    const file = `content/qbe/cleaned/${asset.asset_id}-cleaned.json`;
    const old = JSON.parse(fs.readFileSync(file, 'utf8'));
    const recovered = await extractDocxContentAndVisuals(asset, path.resolve(asset.rel_path));
    if (recovered.diagnostics.errors.length) throw new Error(recovered.diagnostics.errors.join('; '));
    const questions = recovered.questions.map(item => {
      const previous = old.questions.filter(q => q.id === item.id);
      if (previous.length === 1 && previous[0].review.content_reviewed) return previous[0];
      const question = cleanAndReviewCanonicalQuestion(initializeCanonicalQuestion(item, asset)).question;
      if (previous.length) {
        question.history.transformations.unshift(...previous[0].history.transformations);
        if (previous[0].content.stem_cleaned !== question.content.stem_cleaned || previous.length > 1) {
          question.history.transformations.push({
            stage: 'manual_review', rule_id: 'QBE-SOURCE-RECOVERY',
            original_text: JSON.stringify(previous.map(q => q.content)),
            normalized_text: JSON.stringify(question.content),
            correction_type: 'transcription', semantic_change: true,
            reason: 'Recovered complete source paragraphs, numbered statements, table rows and shared context; raw DOCX/extracted evidence retained.',
            confidence: 1, timestamp: new Date().toISOString(),
          });
        }
      }
      return question;
    });
    old.questions.forEach((q, index) => {
      const direct = questions.find(next => next.id === q.id);
      const fragment = !q.content.options.length || old.questions.filter(other => other.id === q.id).length > 1;
      reconciled.push({ source: file, original_index: index, original_id: q.id,
        retained_id: direct?.id ?? null, requires_boundary_review: fragment,
        original_stem: q.content.stem_cleaned });
    });
    fs.writeFileSync(file, JSON.stringify({ ...old, total_questions: questions.length, questions }, null, 2) + '\n');
    console.log(`${asset.asset_id}: ${old.questions.length} -> ${questions.length}`);
  }
  // Keep the original occurrence inventory on subsequent recovery runs.
  const inventory = 'content/qbe/manifests/source_reconciliation.json';
  if (!fs.existsSync(inventory)) fs.writeFileSync(inventory, JSON.stringify(reconciled, null, 2) + '\n');
})().catch(error => { console.error(error); process.exitCode = 1; });
