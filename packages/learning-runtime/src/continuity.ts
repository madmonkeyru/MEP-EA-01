import type { Assessment, Attempt, CurriculumTaxonomy, LearningEvidence, MasteryMeasure, MasteryObservation,
  MasterySnapshot, NivelacionPlan, NivelacionReason, Question } from '@mep-ea/domain';

export interface LearningRecord { attempt: Attempt; learningEvidence?: LearningEvidence }
export function collectLearningEvidence(assessment: Assessment, attempt: Attempt): LearningEvidence {
  return { mode: assessment.blueprint.mode, programId: assessment.blueprint.programId, subjectId: assessment.blueprint.subjectId,
    firstResponseKnown: attempt.firstAnswers !== undefined,
    observations: assessment.questions.map(q => ({ questionId: q.id, evidenceId: q.evidenceId, domainId: q.domainId,
      familyId: q.familyId, correct: (attempt.firstAnswers ?? attempt.answers)[q.id]?.optionId === q.correctOptionId })) };
}
export function masteryTier(correct: number, total: number, families: number): MasteryMeasure['tier'] {
  return families < 5 || total === 0 ? 'insufficient_evidence' : correct / total >= .75 ? 'mastered' :
    correct / total >= .6 ? 'in_progress' : 'needs_practice';
}
/** Earliest exposure per family in a rolling 30-day window; repetitions cannot inflate volume or accuracy. */
export function calculateMastery(learnerId: string, records: LearningRecord[], generatedAt: string): MasterySnapshot {
  const cutoff = Date.parse(generatedAt) - 30 * 86_400_000;
  const families = new Map<string, MasteryObservation>();
  for (const record of [...records].sort((a, b) => a.attempt.submittedAt!.localeCompare(b.attempt.submittedAt!) || a.attempt.id.localeCompare(b.attempt.id))) {
    const at = Date.parse(record.attempt.submittedAt!);
    if (record.attempt.learnerId !== learnerId || record.attempt.status !== 'submitted' ||
      record.learningEvidence?.firstResponseKnown !== true || at < cutoff || at > Date.parse(generatedAt)) continue;
    for (const observation of record.learningEvidence?.observations ?? []) {
      const key = JSON.stringify([observation.evidenceId, observation.familyId]);
      if (!families.has(key)) families.set(key, observation);
    }
  }
  function aggregate(field: 'evidenceId' | 'domainId'): MasteryMeasure[] {
    const groups = new Map<string, MasteryObservation[]>();
    for (const item of families.values()) { const group = groups.get(item[field]) ?? []; group.push(item); groups.set(item[field], group); }
    return [...groups].sort(([a], [b]) => a.localeCompare(b)).map(([id, items]) => {
      const correct = items.filter(i => i.correct).length; const distinctFamilies = new Set(items.map(i => i.familyId)).size;
      return { id, correct, total: items.length, distinctFamilies, accuracy: correct / items.length, tier: masteryTier(correct, items.length, distinctFamilies) };
    });
  }
  return { schemaVersion: 1, learnerId, generatedAt, windowDays: 30, minimumFamilies: 5, evidence: aggregate('evidenceId'), domains: aggregate('domainId') };
}
const reasons: NivelacionReason[] = ['no_diagnostic_yet', 'remediation_pending', 'diagnostic_weakness', 'simulation_weakness', 'retest_available', 'general_practice'];
/** Server/shared policy, scoped to eligible curriculum. Official-reference items never become practice recommendations. */
export function generateNivelacion(snapshot: MasterySnapshot, records: LearningRecord[], taxonomy: CurriculumTaxonomy, questions: Question[]): NivelacionPlan {
  const activities: NivelacionPlan['activities'] = [];
  const history = records.filter(r => r.attempt.learnerId === snapshot.learnerId && r.attempt.status === 'submitted' &&
    Date.parse(r.attempt.submittedAt!) <= Date.parse(snapshot.generatedAt));
  const measures = new Map(snapshot.evidence.map(e => [e.id, e]));
  const latest = (id: string, mode: 'diagnostic' | 'benchmark') => [...history].filter(r => r.learningEvidence?.mode === mode &&
    r.learningEvidence.observations.some(o => o.evidenceId === id)).sort((a, b) => b.attempt.submittedAt!.localeCompare(a.attempt.submittedAt!) || b.attempt.id.localeCompare(a.attempt.id))[0];
  const weak = (record: LearningRecord | undefined, id: string) => {
    const items = record?.learningEvidence?.observations.filter(o => o.evidenceId === id) ?? [];
    return items.length > 0 && items.filter(o => o.correct).length / items.length < .75;
  };
  for (const evidence of taxonomy.evidences) {
    const diagnostic = latest(evidence.id, 'diagnostic'); const benchmark = latest(evidence.id, 'benchmark');
    const measure = measures.get(evidence.id);
    const prerequisiteIds = new Set<string>();
    function visit(id: string) {
      if (prerequisiteIds.has(id)) return; prerequisiteIds.add(id);
      for (const parent of taxonomy.concepts.find(c => c.id === id)?.prerequisiteIds ?? []) visit(parent);
    }
    for (const concept of evidence.conceptIds) for (const parent of taxonomy.concepts.find(c => c.id === concept)?.prerequisiteIds ?? []) visit(parent);
    const deficient = taxonomy.evidences.filter(e => e.conceptIds.some(c => prerequisiteIds.has(c)) && measures.get(e.id)?.tier === 'needs_practice');
    const recovered = measure?.tier === 'mastered' && (weak(diagnostic, evidence.id) || weak(benchmark, evidence.id));
    const reason: NivelacionReason = !diagnostic ? 'no_diagnostic_yet' : deficient.length ? 'remediation_pending' : recovered ? 'retest_available' :
      weak(diagnostic, evidence.id) ? 'diagnostic_weakness' : weak(benchmark, evidence.id) ? 'simulation_weakness' : 'general_practice';
    const target = reason === 'remediation_pending' ? deficient : [evidence];
    const conceptIds = [...new Set(target.flatMap(e => e.conceptIds))];
    const practice = questions.filter(q => q.stream === 'authored' && target.some(e => e.id === q.evidenceId));
    activities.push({ evidenceId: evidence.id, conceptIds, reason,
      action: reason === 'no_diagnostic_yet' ? 'diagnose' : reason === 'remediation_pending' ? 'learn' : reason === 'retest_available' ? 'retest' : 'practice',
      questionIds: practice.map(q => q.id).sort() });
  }
  activities.sort((a, b) => reasons.indexOf(a.reason) - reasons.indexOf(b.reason) || a.evidenceId.localeCompare(b.evidenceId));
  return { schemaVersion: 1, learnerId: snapshot.learnerId, generatedAt: snapshot.generatedAt, activities };
}
