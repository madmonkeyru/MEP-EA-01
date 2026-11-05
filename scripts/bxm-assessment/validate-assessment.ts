import { SelectionEngine } from '../../src/features/bxm-assessment/selectionEngine';
import { SessionRunner, SystemClock } from '../../src/features/bxm-assessment/sessionRunner';
import { WrongAnswerClassifier } from '../../src/features/bxm-assessment/wrongAnswerClassifier';
import { sampleAuthoredItems } from '../../src/features/bxm-assessment/fixtures/sampleItems';

console.log('=== [Agent B] Validating BXM Assessment Features ===');

// 1. Validate Diagnostic Assembly
console.log('[1/4] Checking deterministic diagnostic blueprint assembly...');
const diag1 = SelectionEngine.assembleDiagnostic(sampleAuthoredItems, { seed: 42 });
const diag2 = SelectionEngine.assembleDiagnostic(sampleAuthoredItems, { seed: 42 });

if (diag1.items.length !== 20 || diag2.items.length !== 20) {
  throw new Error(`Expected 20 items in diagnostic, got ${diag1.items.length}`);
}

const ids1 = diag1.items.map(i => i.id).join(',');
const ids2 = diag2.items.map(i => i.id).join(',');
if (ids1 !== ids2) {
  throw new Error('Deterministic selection failed: seed 42 produced differing item sequences');
}
console.log('  -> Diagnostic determinism verified.');

// 2. Validate Benchmark Exclusion
console.log('[2/4] Checking 2026-c2 benchmark exclusion...');
const filtered = SelectionEngine.filterPool(sampleAuthoredItems, {
  allowOfficialFallback: false,
  excludeBenchmarkItemCodes: new Set(['bxm-auth-geo-001']),
});
if (filtered.eligiblePool.some(i => i.id === 'auth-geo-001')) {
  throw new Error('Benchmark exclusion failed to exclude specified code');
}
console.log('  -> Benchmark exclusion verified.');

// 3. Validate Session Policies
console.log('[3/4] Checking Exam vs Study policy enforcement...');
const examPolicy = {
  mode: 'exam' as const,
  kind: 'diagnostic' as const,
  enableTimer: true,
  timeLimitMinutes: 30,
  allowHints: false,
  allowRetries: false,
  allowImmediateFeedback: false,
  allowFormulaSheet: true,
  allowCalculator: true,
};
const examRunner = new SessionRunner({
  items: sampleAuthoredItems.slice(0, 5),
  policy: examPolicy,
  clock: new SystemClock(),
});
if (examRunner.revealHint(sampleAuthoredItems[0].id).hint !== null) {
  throw new Error('Exam mode failed to suppress hints');
}
console.log('  -> Exam mode policy verified.');

// 4. Validate Wrong Answer Classifier
console.log('[4/4] Checking wrong answer classifier...');
const wrongAnalysis = WrongAnswerClassifier.analyze(sampleAuthoredItems[0], 'B');
if (!wrongAnalysis.hasAuthoredMisconception || wrongAnalysis.misconceptionSource !== 'authored_distractor') {
  throw new Error('Wrong answer classifier failed to identify authored distractor');
}
console.log('  -> Wrong answer classification verified.');

console.log('=== All Agent B Assessment Checks Passed Successfully! ===');
