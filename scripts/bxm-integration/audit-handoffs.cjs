// Read-only audit of merged handoff claims. Uses the repository's installed
// Node type stripper to execute isolated, non-UI modules without installing tools.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const read = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const load = require('./load-ts.cjs');
const rejected = fn => { try { fn(); return false; } catch { return true; } };
const spec = read('content/programs/bxm/matematica/specs/02-2026.json');
const canonical = spec.blocks.flatMap(b => b.affirmations.flatMap(a => a.evidences.map(e => ({
  key: `bxm/matematica/02-2026/${b.areaId}/${e.code}`, description: e.desc,
}))));
const canonicalKeys = new Set(canonical.map(e => e.key));
const learning = read('content/bxm-mvp-learning/evidence-catalog.json').evidences;
const authored = read('content/bxm-mvp-learning/authored-items-pack.json').items;
const templates = read('content/bxm-mvp-learning/isomorphic-templates.json').templates;
const { BXM_OFFICIAL_EVIDENCES_FIXTURE: progress } = load('apps/web/src/features/bxm-progress/ui/evidenceCatalogFixture.ts');
const { BxmIsomorphicGenerator: generator } = load('apps/web/src/features/bxm-learning/services/bxmIsomorphicGenerator.ts');
const { SelectionEngine } = load('apps/web/src/features/bxm-assessment/selectionEngine.ts');
const { SessionRunner } = load('apps/web/src/features/bxm-assessment/sessionRunner.ts');
const { qualifyAttemptObservation } = load('apps/web/src/features/bxm-progress/domain/qualifyingObservation.ts');
const { BxmProgressStorage, createMemoryStorageAdapter, PROGRESS_EVENTS_KEY } = load('apps/web/src/features/bxm-progress/storage/progressStorage.ts');
const now = new Date('2026-11-05T18:00:00Z');
const item = {
  id: 'audit-authored', familyId: 'audit-family', provenance: 'authored', reviewStatus: 'unreviewed',
  domain: 'geometry', evidenceCode: 'A1.2', evidenceId: 'bxm/matematica/02-2026/geometry/A1.2',
  cognitiveLevel: 'reproduccion', difficultyTier: 1, stem: 'Audit fixture',
  options: { A: '1', B: '2', C: '3', D: '4' }, correctAnswer: 'A',
};
const policy = {
  mode: 'study', kind: 'evidence_practice', enableTimer: false,
  allowHints: false, allowRetries: false, allowImmediateFeedback: false,
  allowFormulaSheet: false, allowCalculator: false, maxRetriesPerItem: 0,
};
const runner = new SessionRunner({ items: [item], policy, clock: { now: () => now.getTime() } });
runner.selectDraftOption('B');
const first = runner.verifyStudyAnswer();
runner.selectDraftOption('A');
const retry = runner.verifyStudyAnswer();
let tick = now.getTime();
const timed = new SessionRunner({ items: [item], policy: { ...policy, mode: 'exam', enableTimer: true, timeLimitMinutes: 1 }, clock: { now: () => tick } });
tick += 60001;
const lateFinal = timed.finalizeSession();
const incomplete = {
  eventId: 'missing-required-metadata', primaryEvidenceKey: item.evidenceId,
  timestamp: now.toISOString(), domain: 'geometry', provenance: 'authored_mastery',
};
const memory = createMemoryStorageAdapter({ [PROGRESS_EVENTS_KEY]: JSON.stringify([incomplete]) });
const persisted = new BxmProgressStorage(memory).getEvents();
const canonicalMap = new Map(canonical.map(e => [e.key, e.description]));
const circleRejected = rejected(() => generator.generateCircleCanonicalItem({ h: 0, k: 0, r: 1 }));
const linearRejected = rejected(() => generator.generateLinearEquationItem({ m: 0, x1: 0, y1: 2 }));
const ricRejected = rejected(() => generator.generateRicBoxItem({ q1: 0, q3: 10 }));
const stats009 = authored.find(i => i.id === 'bxm-authored-v1-stat-009');
const concepts = ['geometry', 'algebra', 'statistics'].flatMap(d => read(`content/library/math/${d}_concepts.json`));
const conceptIds = new Set(concepts.map(c => c.id));
const katex = require('katex');
const mathErrors = [];
let parsedMathCount = 0;
const walk = (value, label) => {
  if (typeof value === 'string') {
    for (const match of value.matchAll(/\$\$([\s\S]*?)\$\$|\$([^$]*?)\$/g)) {
      parsedMathCount++;
      try { katex.renderToString(match[1] ?? match[2], { throwOnError: true, strict: 'ignore' }); }
      catch (error) { mathErrors.push({ label, expression: match[1], error: error.message }); }
    }
  } else if (Array.isArray(value)) value.forEach((v, i) => walk(v, `${label}[${i}]`));
  else if (value && typeof value === 'object') Object.entries(value).forEach(([k, v]) => walk(v, `${label}.${k}`));
};
walk(authored, 'authored');
walk(read('content/bxm-mvp-learning/lessons-pack.json'), 'lessons');
const result = {
  canonicalCount: canonical.length,
  learningCatalog: {
    count: learning.length,
    unknownKeys: learning.filter(e => !canonicalKeys.has(e.key)).map(e => e.key),
    missingKeys: canonical.filter(e => !learning.some(l => l.key === e.key)).map(e => e.key),
    changedDescriptions: learning.filter(e => canonicalMap.get(e.key) !== e.evidenceDesc).map(e => e.key),
  },
  progressCatalog: {
    count: progress.length,
    unknownKeys: progress.filter(e => !canonicalKeys.has(e.key)).map(e => e.key),
    missingKeys: canonical.filter(e => !progress.some(p => p.key === e.key)).map(e => e.key),
    changedDescriptions: progress.filter(e => canonicalMap.has(e.key) && canonicalMap.get(e.key) !== e.description).length,
    weightSumClaimedOfficialPercent: progress.reduce((s, e) => s + (e.weightOfficialPercent || 0), 0),
  },
  authored: {
    count: authored.length,
    withoutFamilyId: authored.filter(e => !e.familyId).length,
    unknownConceptReferences: authored.filter(e => !conceptIds.has(e.conceptId)).map(e => ({ itemId: e.id, conceptId: e.conceptId })),
    answerDistribution: Object.fromEntries(['A', 'B', 'C', 'D'].map(k => [k, authored.filter(i => i.correctOption === k).length])),
    statistics009: { selectedAnswer: stats009.options[stats009.correctOption], medianOfHalves: { q1: 19.5, q3: 26.5, iqr: 7, rangeMinusIqr: 11 } },
  },
  generator: {
    declaredFamilies: templates.map(t => t.familyId),
    implementedMethods: Object.getOwnPropertyNames(generator).filter(k => k.startsWith('generate')),
    circleInvalidInputRejected: circleRejected,
    linearInvalidInputRejected: linearRejected,
    ricInvalidInputRejected: ricRejected,
    sameIdForDifferentParams: generator.generateCircleCanonicalItem({ h: 2, k: 3, r: 4 }).id === generator.generateCircleCanonicalItem({ h: 5, k: 6, r: 7 }).id,
  },
  assessment: {
    acceptsUnreviewedAuthoredItem: SelectionEngine.filterPool([item]).eligiblePool.length === 1,
    forbiddenRetryRecorded: retry !== null,
    feedbackReturnedWhenDisabled: first !== null && typeof first.isCorrect === 'boolean',
    manualSubmissionAfterDeadlineStatus: lateFinal.status,
    exportedItemFields: Object.keys(runner.finalizeSession().attempts[item.id]),
  },
  progress: {
    malformedEventReadCount: persisted.length,
    missingRequiredEligibilityMetadataQualifies: qualifyAttemptObservation(incomplete, now).eligible,
  },
  mathParsing: { parsedMathCount, errors: mathErrors },
};
console.log(JSON.stringify(result, null, 2));
