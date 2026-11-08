import { describe, expect, it } from 'vitest';
import type { CurriculumTaxonomy, MasteryMeasure } from '@mep-ea/domain';
import { createFoundationAssessment } from '@mep-ea/content/preview';
import { calculateMastery, collectLearningEvidence, generateNivelacion, initializeAttempt, recordAnswer, restoreAttempt,
  submitAttempt, type LearningRecord } from './index';

const at = '2026-11-08T12:00:00.000Z';
const assessment = createFoundationAssessment();
function record(id: string, correct: number, total = 20, submittedAt = at): LearningRecord {
  return { attempt: submitAttempt(assessment, initializeAttempt(assessment, id, 'learner', submittedAt), submittedAt),
    learningEvidence: { mode: 'practice', programId: 'bxm', subjectId: 'matematica', firstResponseKnown: true,
      observations: Array.from({ length: total }, (_, i) => ({ questionId: `q${i}`, familyId: `f${i}`, evidenceId: 'e', domainId: 'd', correct: i < correct })) } };
}
describe('longitudinal mastery and nivelación', () => {
  it.each([[15, 'mastered'], [14, 'in_progress'], [12, 'in_progress'], [11, 'needs_practice']] as const)('classifies %s/20 at the canonical boundaries', (correct, tier) => {
    const value = calculateMastery('learner', [record('a', correct)], at);
    expect(value.evidence[0].tier).toBe(tier); expect(value.domains[0].tier).toBe(tier);
  });
  it('requires five distinct families; repeated correct attempts cannot inflate first exposures', () => {
    expect(calculateMastery('learner', [record('a', 4, 4)], at).evidence[0].tier).toBe('insufficient_evidence');
    const value = calculateMastery('learner', [record('a', 0, 5, '2026-11-07T12:00:00Z'), record('b', 5, 5)], at);
    expect(value.evidence[0]).toMatchObject({ total: 5, correct: 0, distinctFamilies: 5, tier: 'needs_practice' });
    expect(calculateMastery('learner', [record('a', 5, 5)], at).evidence[0].tier).toBe('mastered');
  });
  it('excludes expired, future and other-owner evidence and counts the rolling-window boundary', () => {
    const other = record('other', 20); other.attempt.learnerId = 'another';
    const value = calculateMastery('learner', [record('expired', 20, 20, '2026-10-09T11:59:59Z'),
      record('future', 20, 20, '2026-11-09T12:00:00Z'), other], at);
    expect(value.evidence).toEqual([]);
    expect(calculateMastery('learner', [record('boundary', 20, 20, '2026-10-09T12:00:00Z')], at).evidence[0].total).toBe(20);
  });
  it('preserves a wrong first response after correction and through recovery, with legacy fallback', () => {
    const question = assessment.questions[0]; const wrong = question.options.find(o => o.id !== question.correctOptionId)!.id;
    let attempt = initializeAttempt(assessment, 'a', 'learner', at);
    attempt = recordAnswer(assessment, attempt, question.id, wrong, at);
    attempt = recordAnswer(assessment, attempt, question.id, question.correctOptionId, at);
    attempt = submitAttempt(assessment, restoreAttempt(assessment, attempt, 'learner', 'a'), at);
    expect(attempt.score!.items[0].correct).toBe(true);
    expect(collectLearningEvidence(assessment, attempt).observations[0].correct).toBe(false);
    const legacy = { ...attempt }; delete legacy.firstAnswers;
    expect(collectLearningEvidence(assessment, restoreAttempt(assessment, legacy, 'learner', 'a')).observations[0].correct).toBe(true);
    expect(() => restoreAttempt(assessment, { ...attempt, firstAnswers: {} }, 'learner', 'a')).toThrow();
    const legacyEvidence = collectLearningEvidence(assessment, legacy);
    expect(legacyEvidence.firstResponseKnown).toBe(false);
    expect(calculateMastery('learner', [{ attempt: legacy, learningEvidence: legacyEvidence }], at).evidence).toEqual([]);
  });
  it('orders all six plan reasons, traverses prerequisites and excludes official items from practice', () => {
    const ids = ['baseline', 'blocked', 'diagnostic', 'simulation', 'recovered', 'general', 'foundation'];
    const taxonomy: CurriculumTaxonomy = { programs: [], subjects: [], domains: [],
      evidences: ids.map(id => ({ id, domainId: 'd', affirmationCode: id, description: id, conceptIds: [id] })),
      concepts: ids.map(id => ({ id, domainId: 'd', name: id, prerequisiteIds: id === 'blocked' ? ['foundation'] : [] })) };
    const diagnostic = record('diag', 0); diagnostic.learningEvidence!.mode = 'diagnostic';
    diagnostic.learningEvidence!.observations = ids.filter(id => id !== 'baseline').map(id => ({ evidenceId: id, domainId: 'd', familyId: id, questionId: id, correct: !['diagnostic', 'recovered'].includes(id) }));
    const benchmark = record('sim', 0); benchmark.learningEvidence!.mode = 'benchmark';
    benchmark.learningEvidence!.observations = [{ evidenceId: 'simulation', domainId: 'd', familyId: 'sim', questionId: 'sim', correct: false }];
    const snapshot = calculateMastery('learner', [], at);
    snapshot.evidence = ids.map(id => ({ id, tier: id === 'foundation' ? 'needs_practice' : id === 'recovered' ? 'mastered' : 'insufficient_evidence',
      correct: 0, total: 5, accuracy: 0, distinctFamilies: 5 } as MasteryMeasure));
    const official = { ...assessment.questions[0], evidenceId: 'general', stream: 'official_reference' as const };
    const plan = generateNivelacion(snapshot, [diagnostic, benchmark], taxonomy, [official]);
    expect(plan.activities.slice(0, 5).map(a => a.reason)).toEqual(['no_diagnostic_yet', 'remediation_pending', 'diagnostic_weakness', 'simulation_weakness', 'retest_available']);
    expect(plan.activities.at(-1)!.reason).toBe('general_practice');
    expect(plan.activities[1].conceptIds).toEqual(['foundation']);
    expect(plan.activities.every(a => a.questionIds.length === 0)).toBe(true);
  });
});
