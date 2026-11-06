#!/usr/bin/env node

/**
 * Ingestion, Validation & Quality Assurance CLI
 *
 * Validates:
 * 1. JSON Schema integrity for all atomic items in content/items/math/
 * 2. Visual spec payload parameters (zero static images, valid SVG/Canvas composites)
 * 3. Concept linkages against content/library/math/*_concepts.json
 * 4. Multi-program Convocatoria blueprint integrity and 100% item reference resolution across all manifest programs
 * 5. Official specification table integrity across all programs
 */

import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const MANIFEST_PATH = path.join(ROOT_DIR, 'content/manifest.json');
const ITEMS_DIR = path.join(ROOT_DIR, 'content/items/math');
const LIBRARY_DIR = path.join(ROOT_DIR, 'content/library/math');
const PROGRAMS_DIR = path.join(ROOT_DIR, 'content/programs');

console.log('=====================================================');
console.log('   MEP-EA-01 Multi-Program Content & Asset Validator ');
console.log('=====================================================\n');

let errorCount = 0;
let warningCount = 0;

// 1. Load Concept Registries
const concepts = new Set();
['geometry_concepts.json', 'algebra_concepts.json', 'statistics_concepts.json'].forEach((file) => {
  const filePath = path.join(LIBRARY_DIR, file);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    data.forEach((c) => concepts.add(c.id));
  } else {
    console.error(`[ERROR] Missing library concept file: ${file}`);
    errorCount++;
  }
});

console.log(`[PASS] Registered Concepts: ${concepts.size} across Geometry, Algebra, Statistics.`);

// 2. Validate Atomic Items
const itemCodes = new Set();
const itemNumericIds = new Set();
let itemsValidated = 0;

const subdirs = ['numbers', 'geometry', 'measurement', 'algebra', 'statistics'];
for (const sub of subdirs) {
  const dirPath = path.join(ITEMS_DIR, sub);
  if (!fs.existsSync(dirPath)) continue;

  const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.json'));
  for (const file of files) {
    const itemPath = path.join(dirPath, file);
    try {
      const item = JSON.parse(fs.readFileSync(itemPath, 'utf8'));
      itemsValidated++;

      // Check required fields
      if (!item.id || typeof item.id !== 'number') {
        console.error(`[ERROR] Item ${file}: missing valid numeric id.`);
        errorCount++;
      } else {
        if (itemNumericIds.has(item.id)) {
          console.error(`[ERROR] Duplicate numeric item ID: ${item.id}`);
          errorCount++;
        }
        itemNumericIds.add(item.id);
      }

      if (!item.code || typeof item.code !== 'string') {
        console.error(`[ERROR] Item ${file}: missing valid string code.`);
        errorCount++;
      } else {
        if (itemCodes.has(item.code)) {
          console.error(`[ERROR] Duplicate item code: ${item.code}`);
          errorCount++;
        }
        itemCodes.add(item.code);
      }

      if (!item.area_id || !['numbers', 'geometry', 'measurement', 'functions', 'statistics'].includes(item.area_id)) {
        console.error(`[ERROR] Item ${file}: invalid or missing area_id.`);
        errorCount++;
      }

      if (!item.stem || typeof item.stem !== 'string' || item.stem.trim().length === 0) {
        console.error(`[ERROR] Item ${file}: missing stem.`);
        errorCount++;
      }

      if (!item.options || typeof item.options !== 'object' || !item.options.A || !item.options.B || !item.options.C) {
        console.error(`[ERROR] Item ${file}: invalid options structure (A, B, C required; D optional).`);
        errorCount++;
      }

      if (!item.correct_answer || !['A', 'B', 'C', 'D'].includes(item.correct_answer)) {
        console.error(`[ERROR] Item ${file}: invalid correct_answer (${item.correct_answer}).`);
        errorCount++;
      }

      // Check concept linkage
      if (item.concept_id && !concepts.has(item.concept_id)) {
        console.warn(`[WARN] Item ${file}: linked concept_id '${item.concept_id}' not found in library.`);
        warningCount++;
      }

      // Check visual spec parameters (No static raster images)
      if (item.visual_spec) {
        const visual = item.visual_spec.visual || item.visual_spec;
        if (!visual.type) {
          console.error(`[ERROR] Item ${file}: visual_spec missing 'type' parameter.`);
          errorCount++;
        }

        const stemLower = (item.stem || '').toLowerCase();
        if (stemLower.includes('.png') || stemLower.includes('.jpg') || stemLower.includes('.jpeg')) {
          console.error(`[ERROR] Item ${file}: stem contains static bitmap image reference! Zero static images rule violated.`);
          errorCount++;
        }
      }
    } catch (err) {
      console.error(`[ERROR] Failed to parse item JSON: ${file}`, err);
      errorCount++;
    }
  }
}

console.log(`[PASS] Validated ${itemsValidated} atomic items in the item bank.`);

// Validate the I & II Ciclo review draft separately from playable blueprints.
const draftPath = path.join(PROGRAMS_DIR, 'i_ii_ciclo/matematica/drafts/2026-c2.json');
try {
  const draft = JSON.parse(fs.readFileSync(draftPath, 'utf8'));
  const specification = JSON.parse(fs.readFileSync(path.resolve(path.dirname(draftPath), draft.structureSource), 'utf8'));
  const draftItems = draft.sections.flatMap(section => section.items);
  const draftCodes = new Set();
  const publicIds = new Set();
  const stems = new Set();
  const issues = [];

  if (draft.status !== 'released' || draft.review?.status !== 'complete' ||
      draft.programId !== specification.programId || draft.subjectId !== specification.subjectId ||
      draft.convocatoriaId !== '2026-c2' || specification.convocatoriaId !== '02-2026' ||
      draft.calculatorAllowed !== specification.calculatorAllowed ||
      !Number.isInteger(draft.timeLimitMinutes) || draft.timeLimitMinutes < 1 ||
      !draft.scheduleSourceUrl?.startsWith('https://dgec.mep.go.cr/') ||
      draft.totalItems !== specification.totalPoints || draftItems.length !== draft.totalItems ||
      draft.sections.length !== specification.blocks.length) {
    issues.push('draft metadata or total differs from the review requirements');
  }

  for (const [index, section] of draft.sections.entries()) {
    const block = specification.blocks[index];
    if (section.blockCode !== block?.blockCode || section.items.length !== block.totalPoints) {
      issues.push(`incorrect block or item count for ${section.blockCode}`);
      continue;
    }
    const expectedEvidence = new Set();
    for (const affirmation of block.affirmations) {
      const evidenceCodes = new Set(affirmation.evidences.map(evidence => evidence.code));
      evidenceCodes.forEach(code => expectedEvidence.add(code));
      const matched = section.items.filter(item => evidenceCodes.has(item.evidence));
      if (matched.length !== affirmation.targetPoints ||
          [...evidenceCodes].some(code => !matched.some(item => item.evidence === code))) {
        issues.push(`incorrect evidence coverage for ${section.blockCode} / ${affirmation.code}`);
      }
    }
    for (const item of section.items) {
      const options = Object.values(item.options);
      if (!Number.isInteger(item.publicId) || item.publicId < 1 || publicIds.has(item.publicId) ||
          itemNumericIds.has(item.publicId) || itemCodes.has(item.code) ||
          !item.code?.trim() || draftCodes.has(item.code) || !item.stem?.trim() || stems.has(item.stem) ||
          !expectedEvidence.has(item.evidence) || !item.solution?.trim() ||
          options.length !== 4 || new Set(options).size !== 4 ||
          !['A', 'B', 'C', 'D'].every(key => item.options[key]?.trim()) ||
          !['A', 'B', 'C', 'D'].includes(item.correctAnswer)) {
        issues.push(`invalid or duplicate review item ${item.code}`);
      }
      publicIds.add(item.publicId);
      draftCodes.add(item.code);
      stems.add(item.stem);
    }
  }
  for (const issue of issues) console.error(`[ERROR] I & II Ciclo review draft: ${issue}.`);
  errorCount += issues.length;
  if (!issues.length) {
    for (const item of draftItems) {
      itemCodes.add(item.code);
      itemNumericIds.add(item.publicId);
    }
    itemsValidated += draftItems.length;
    console.log(`[PASS] I & II Ciclo released bank: ${draftItems.length} items match the specification.`);
  }
} catch (error) {
  console.error('[ERROR] Could not validate I & II Ciclo review draft:', error);
  errorCount++;
}

// 3. Find and Validate All Convocatoria Blueprints Across Programs
function findBlueprints(dir, list = []) {
  if (!fs.existsSync(dir)) return list;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findBlueprints(fullPath, list);
    } else if (entry.isFile() && entry.name.endsWith('.json') && path.basename(dir) === 'convocatorias') {
      list.push(fullPath);
    }
  }
  return list;
}

const allBlueprints = findBlueprints(PROGRAMS_DIR);
console.log(`\nValidating ${allBlueprints.length} blueprints across all programs:`);

const freeReferences = new Set();
for (const bpPath of allBlueprints) {
  const relPath = path.relative(ROOT_DIR, bpPath);
  try {
    const bp = JSON.parse(fs.readFileSync(bpPath, 'utf8'));
    if (!bp.convocatoriaId || !bp.totalItems) {
      console.error(`[ERROR] Blueprint ${relPath}: missing convocatoriaId or totalItems.`);
      errorCount++;
    }

    if (bp.passingScore === undefined || (bp.passingScore !== 65 && bp.passingScore !== 70)) {
      console.error(`[ERROR] Blueprint ${relPath}: invalid passingScore (${bp.passingScore}). Expected 65 or 70.`);
      errorCount++;
    }

    if (bp.calculatorAllowed === undefined) {
      console.error(`[ERROR] Blueprint ${relPath}: missing calculatorAllowed flag.`);
      errorCount++;
    }

    const issues = [];
    const pool = bp.itemPool || [];
    const sections = bp.sections || [];
    const sectionItems = sections.flatMap(section => section.itemIds);
    if (!['sample', 'complete'].includes(bp.coverage)) issues.push('missing sample or complete coverage');
    if (!Number.isInteger(bp.totalItems) || bp.totalItems < 1 || pool.length !== bp.totalItems) {
      issues.push('item pool length differs from declared total');
    }
    if (new Set(pool).size !== pool.length || new Set(sectionItems).size !== sectionItems.length) {
      issues.push('duplicate item reference');
    }
    if (sectionItems.length !== pool.length || sectionItems.some(code => !pool.includes(code))) {
      issues.push('section references differ from item pool');
    }
    if (pool.some(code => !itemCodes.has(code))) issues.push('unresolved item reference');
    let nextPosition = 1;
    for (const section of sections) {
      const count = section.itemIds.length;
      if (!count || section.totalItems !== count ||
          section.itemRange?.[0] !== nextPosition || section.itemRange?.[1] !== nextPosition + count - 1) {
        issues.push(`invalid count or range in section ${section.id}`);
      }
      nextPosition += count;
    }

    if (bp.coverage === 'complete') {
      const source = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'content', bp.structureSource), 'utf8'));
      if (source.programId !== bp.programId || source.subjectId !== bp.subjectId ||
          source.totalPoints !== bp.totalItems || source.blocks.length !== sections.length ||
          source.blocks.some((block, index) =>
            (sections[index].specBlockCode
              ? block.blockCode !== sections[index].specBlockCode
              : block.areaId !== sections[index].id) || block.totalPoints !== sections[index].totalItems)) {
        issues.push('complete exam differs from its specification');
      }
    }
    if (bp.freeReference) {
      const key = JSON.stringify([bp.programId, bp.subjectId, bp.subprogramId]);
      if (bp.coverage !== 'complete' || freeReferences.has(key)) issues.push('invalid or duplicate free reference');
      freeReferences.add(key);
    }
    for (const issue of issues) console.error(`[ERROR] Blueprint ${relPath}: ${issue}.`);
    errorCount += issues.length;
    if (!issues.length) console.log(`[PASS] Blueprint ${relPath}: ${bp.coverage}, ${pool.length} items.`);
  } catch (err) {
    console.error(`[ERROR] Failed to parse blueprint: ${relPath}`, err);
    errorCount++;
  }
}

// 4. Validate Manifest Convocatoria References
if (fs.existsSync(MANIFEST_PATH)) {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  for (const prog of manifest.programs) {
    for (const subj of prog.subjects) {
      for (const convPath of subj.convocatorias || []) {
        const fullConv = path.join(ROOT_DIR, 'content', convPath);
        if (!fs.existsSync(fullConv)) {
          console.error(`[ERROR] Manifest references nonexistent convocatoria: ${convPath}`);
          errorCount++;
        }
      }
    }
  }
  console.log(`[PASS] Manifest convocatoria blueprint references verified.`);
}

// Check the authored EDAD Geometry slice without registering it as playable content.
const edadDraftPath = path.join(PROGRAMS_DIR, 'edad/matematica/parte-1-10mo/drafts/2026-c2-geometry.json');
try {
  const draft = JSON.parse(fs.readFileSync(edadDraftPath, 'utf8'));
  const specification = JSON.parse(fs.readFileSync(path.resolve(path.dirname(edadDraftPath), draft.structureSource), 'utf8'));
  const [section] = draft.sections;
  const block = specification.blocks.find(entry => entry.blockCode === section.blockCode);
  const codes = section.items.map(item => item.code);
  const keys = ['A', 'B', 'C', 'D'];
  if (draft.status !== 'pending_pedagogical_review' || draft.programId !== specification.programId ||
      draft.subjectId !== specification.subjectId || draft.subprogramId !== 'EDAD_1' ||
      draft.convocatoriaId !== '2026-c2' || draft.sections.length !== 1 || !block ||
      section.areaId !== block.areaId || section.items.length !== block.totalPoints ||
      new Set(codes).size !== codes.length ||
      section.items.some(item => !item.code?.trim() || !item.stem?.trim() || !item.solution?.trim() ||
        !keys.includes(item.correctAnswer) || Object.keys(item.options).length !== keys.length ||
        new Set(Object.values(item.options)).size !== keys.length || !keys.every(key => item.options[key]?.trim()))) {
    throw new Error('Geometry draft metadata, item count or item structure is invalid.');
  }
  for (const affirmation of block.affirmations) {
    const evidence = affirmation.evidences.map(entry => entry.code);
    const matched = section.items.filter(item => evidence.includes(item.evidence));
    if (matched.length !== affirmation.targetPoints || evidence.some(code => !matched.some(item => item.evidence === code))) {
      throw new Error(`Geometry draft evidence coverage differs from ${affirmation.code}.`);
    }
  }
  console.log(`[PASS] EDAD Prueba 1 Geometry draft: ${section.items.length} items match the specification.`);
} catch (error) {
  console.error('[ERROR] Could not validate EDAD Prueba 1 Geometry draft:', error);
  errorCount++;
}

// Validate calendar records before a new year or revision is published.
const calendarDir = path.join(ROOT_DIR, 'content/calendar');
const calendarPrograms = ['bxm', 'i_ii_ciclo', 'iii_ciclo', 'edad'];
const calendarTypes = ['registration', 'sites', 'exam', 'results'];
const isCalendarDay = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
const isClockTime = value => typeof value === 'string' && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
let calendarEvents = 0;
for (const file of fs.readdirSync(calendarDir).filter(name => name.endsWith('.json'))) {
  try {
    const events = JSON.parse(fs.readFileSync(path.join(calendarDir, file), 'utf8'));
    const year = file.slice(0, -5);
    const eventKeys = new Set();
    if (!/^\d{4}$/.test(year) || !Array.isArray(events) || !events.length) throw new Error('Expected a non-empty YYYY.json calendar.');
    for (const event of events) {
      const key = JSON.stringify([event.programId, event.moduleId, event.convocatoriaId, event.type, event.start]);
      const source = new URL(event.sourceUrl);
      const hasValidModule = event.programId === 'edad' ? ['EDAD_1', 'EDAD_2'].includes(event.moduleId) : event.moduleId === undefined;
      if (eventKeys.has(key) || !calendarPrograms.includes(event.programId) || !hasValidModule ||
          ![`${year}-c1`, `${year}-c2`].includes(event.convocatoriaId) ||
          !calendarTypes.includes(event.type) || !isCalendarDay(event.verifiedOn) ||
          source.protocol !== 'https:' || !['dgec.mep.go.cr', 'portaldgec.mep.go.cr'].includes(source.hostname) ||
          (event.start !== undefined && (!isCalendarDay(event.start) || !event.start.startsWith(year + '-'))) ||
          (event.end !== undefined && (!isCalendarDay(event.end) || !event.start || event.end < event.start)) ||
          (event.sessions !== undefined && (event.type !== 'exam' || !event.start || !Array.isArray(event.sessions) ||
            event.sessions.some(session => !session.subject?.trim() || !isClockTime(session.startTime) ||
              !isClockTime(session.endTime) || session.startTime >= session.endTime)))) {
        console.error(`[ERROR] Calendar ${file}: invalid or duplicate event ${key}.`);
        errorCount++;
      }
      eventKeys.add(key);
      calendarEvents++;
    }
  } catch (error) {
    console.error(`[ERROR] Could not validate calendar ${file}:`, error);
    errorCount++;
  }
}
if (calendarEvents) console.log(`[PASS] Checked ${calendarEvents} calendar events.`);

// Published QBE bundles use the same playable item contract as the atomic bank.
// Staging records must never become selectable merely because their JSON exists.
const publicationPath = path.join(ROOT_DIR, 'content/qbe/manifests/publication_report.json');
if (fs.existsSync(publicationPath)) {
  const publication = JSON.parse(fs.readFileSync(publicationPath, 'utf8'));
  const expected = new Map(publication.questions.filter(q => q.enabled).map(q => [q.id, q]));
  const encountered = new Set();
  const registered = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8')).programs
    .find(program => program.id === 'bxm').subjects.find(subject => subject.id === 'matematicas').sets
    .filter(set => set.id.startsWith('qbe-'));
  for (const set of registered) {
    const bundle = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'content', set.file), 'utf8'));
    if (bundle.items.length !== set.total_items || bundle.total_items !== set.total_items) {
      console.error(`[ERROR] QBE set ${set.id}: inconsistent released count.`); errorCount++;
    }
    for (const item of bundle.items) {
      const source = item.source_question_id;
      const canonicalFile = source.replace(/-q\d+$/, '') + '-cleaned.json';
      const canonical = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'content/qbe/cleaned', canonicalFile), 'utf8'))
        .questions.find(question => question.id === source);
      const letters = Object.keys(item.options);
      if (!expected.has(source) || encountered.has(source) || itemNumericIds.has(item.id) || itemCodes.has(item.code) ||
          item.id !== publication.runtime_id_map[source] || item.set_id !== set.id || !item.stem?.trim() ||
          !['A','B','C'].every(key => item.options[key]?.trim()) || ![3,4].includes(letters.length) ||
          !letters.every(key => ['A','B','C','D'].includes(key)) || !letters.includes(item.correct_answer) ||
          !item.solution_steps?.length || canonical?.quality.status !== 'approved' ||
          !canonical?.review.answer_reviewed || !canonical?.quality.gate_c_internalization_passed ||
          canonical?.content.detected_answer !== item.correct_answer) {
        console.error(`[ERROR] QBE item ${source}: publication, identity, answer or required fields mismatch.`); errorCount++;
      }
      encountered.add(source); itemNumericIds.add(item.id); itemCodes.add(item.code); itemsValidated++;
    }
  }
  if (encountered.size !== expected.size) {
    console.error('[ERROR] Approved QBE questions missing from registered release bundles.'); errorCount++;
  }
  console.log(`[PASS] Checked ${encountered.size} released QBE items across ${registered.length} practice sets.`);
}

console.log('\n=====================================================');
console.log(`Summary: ${itemsValidated} items | ${allBlueprints.length} blueprints | ${errorCount} errors | ${warningCount} warnings`);
console.log('=====================================================');

if (errorCount > 0) {
  process.exit(1);
} else {
  console.log('All content registry and multi-program checks passed successfully!\n');
  process.exit(0);
}
