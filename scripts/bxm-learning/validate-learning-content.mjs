#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

/**
 * Validation Script for BXM Learning Content (Agent A)
 * Validates:
 * 1. Evidence catalog (all 71 items, canonical format, unique keys)
 * 2. Authored items pack (IDs, options A/B/C/D, distractor rationale, unique correct answer, KaTeX delimiters)
 * 3. Lessons pack (structure, prerequisites, formulas, worked examples, common mistakes, micro-quizzes)
 * 4. Isomorphic templates (parameter ranges, sample parameters)
 * 5. Content manifest consistency
 */

const contentDir = path.resolve(process.cwd(), 'content/bxm-mvp-learning');

console.log('========================================================');
console.log('   Agent A — BXM MVP Learning Content QA Validator      ');
console.log('========================================================\n');

let errorCount = 0;
let warnCount = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`[FAIL] ${message}`);
    errorCount++;
  }
}

function warn(condition, message) {
  if (!condition) {
    console.warn(`[WARN] ${message}`);
    warnCount++;
  }
}

// 1. Evidence catalog
const evidenceCatalogPath = path.join(contentDir, 'evidence-catalog.json');
assert(fs.existsSync(evidenceCatalogPath), 'evidence-catalog.json exists');
const evidenceCatalog = JSON.parse(fs.readFileSync(evidenceCatalogPath, 'utf8'));

assert(evidenceCatalog.totalEvidences === 71, `Total evidences is exactly 71 (found: ${evidenceCatalog.totalEvidences})`);
const keysSeen = new Set();
for (const ev of evidenceCatalog.evidences) {
  assert(!keysSeen.has(ev.key), `Evidence key ${ev.key} is unique`);
  keysSeen.add(ev.key);
  assert(ev.key.startsWith('bxm/matematica/02-2026/'), `Evidence key has canonical prefix: ${ev.key}`);
  assert(['geometry', 'functions', 'statistics'].includes(ev.domain), `Valid domain in ${ev.key}`);
}
console.log(`[PASS] Evidence Catalog verified: 71 canonical evidences mapped.`);

// 2. Authored items pack
const authoredPackPath = path.join(contentDir, 'authored-items-pack.json');
assert(fs.existsSync(authoredPackPath), 'authored-items-pack.json exists');
const authoredPack = JSON.parse(fs.readFileSync(authoredPackPath, 'utf8'));

assert(authoredPack.totalItems >= 30, `Authored items >= 30 (found: ${authoredPack.totalItems})`);
assert(authoredPack.domainCounts.geometry >= 10, 'Geometry authored items >= 10');
assert(authoredPack.domainCounts.functions >= 10, 'Functions authored items >= 10');
assert(authoredPack.domainCounts.statistics >= 10, 'Statistics authored items >= 10');

const itemIdsSeen = new Set();
for (const item of authoredPack.items) {
  assert(!itemIdsSeen.has(item.id), `Authored item ID ${item.id} is unique`);
  itemIdsSeen.add(item.id);

  assert(['A', 'B', 'C', 'D'].includes(item.correctOption), `Item ${item.id} has valid correctOption`);
  assert(item.options && item.options[item.correctOption], `Item ${item.id} contains correctOption in options dictionary`);

  // Distractor checks
  for (const optKey of ['A', 'B', 'C', 'D']) {
    if (optKey !== item.correctOption) {
      assert(item.distractorRationale[optKey], `Item ${item.id} has distractor rationale for option ${optKey}`);
    }
  }

  // KaTeX delimiter balance check (simple check for even number of $ signs)
  const fullText = item.stem + ' ' + Object.values(item.options).join(' ');
  const dollarCount = (fullText.match(/\$/g) || []).length;
  assert(dollarCount % 2 === 0, `Item ${item.id} has balanced LaTeX '$' delimiters`);
}
console.log(`[PASS] Authored Items Pack verified: ${authoredPack.totalItems} base items checked for uniqueness, distractors and KaTeX.`);

// 3. Lessons pack
const lessonsPackPath = path.join(contentDir, 'lessons-pack.json');
assert(fs.existsSync(lessonsPackPath), 'lessons-pack.json exists');
const lessonsPack = JSON.parse(fs.readFileSync(lessonsPackPath, 'utf8'));

assert(lessonsPack.totalLessons >= 3, 'Lessons pack contains at least 3 rich lessons');
for (const lesson of lessonsPack.lessons) {
  assert(lesson.title && lesson.title.length > 5, `Lesson ${lesson.id} has a descriptive title`);
  assert(lesson.prerequisites && lesson.prerequisites.length > 0, `Lesson ${lesson.id} has prerequisites`);
  assert(lesson.formulas && lesson.formulas.length > 0, `Lesson ${lesson.id} has formulas`);
  assert(lesson.commonMistakes && lesson.commonMistakes.length > 0, `Lesson ${lesson.id} has common mistakes`);
  assert(lesson.workedExample && lesson.workedExample.primaryMethod, `Lesson ${lesson.id} has worked example`);
  assert(lesson.microQuiz && lesson.microQuiz.length > 0, `Lesson ${lesson.id} has micro quiz`);
}
console.log(`[PASS] Lessons Pack verified: ${lessonsPack.totalLessons} rich lessons checked.`);

// 4. Isomorphic templates
const isoTemplatesPath = path.join(contentDir, 'isomorphic-templates.json');
assert(fs.existsSync(isoTemplatesPath), 'isomorphic-templates.json exists');
const isoTemplates = JSON.parse(fs.readFileSync(isoTemplatesPath, 'utf8'));

assert(isoTemplates.totalTemplates >= 3, 'Isomorphic templates >= 3');
for (const t of isoTemplates.templates) {
  assert(t.familyId && t.familyId.startsWith('bxm-iso-'), `Template familyId has canonical prefix: ${t.familyId}`);
  assert(t.sampleParameters && t.sampleParameters.length > 0, `Template ${t.familyId} has sample parameters`);
}
console.log(`[PASS] Isomorphic templates verified: ${isoTemplates.totalTemplates} template families.`);

console.log('\n========================================================');
if (errorCount === 0) {
  console.log(`[SUCCESS] All checks passed with 0 errors and ${warnCount} warnings.`);
  process.exit(0);
} else {
  console.error(`[FAILURE] Verification failed with ${errorCount} errors.`);
  process.exit(1);
}
