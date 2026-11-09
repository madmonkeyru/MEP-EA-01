import { describe, expect, it } from 'vitest';
import {
  compileAssessment,
  createMultiSubjectRegistry,
  civicaDiagnosticBlueprint,
  civicaMockBlueprint,
  civicaOfficialSimulationBlueprint,
} from './index';
import { createLearningPreviewCatalog } from './expansion';
import {
  initializeAttempt,
  recordAnswer,
  submitAttempt,
  calculateMastery,
  generateNivelacion,
  collectLearningEvidence,
} from '@mep-ea/learning-runtime';
import { deriveLongitudinalMetrics } from '../../../apps/service/src/longitudinal';
import type { AttemptRecord } from '../../../apps/service/src/repository';

describe('P9 Multi-Subject Architectural Validation (Educación Cívica & BXM Matemática)', () => {
  const baseCatalog = createLearningPreviewCatalog();
  const multiRegistry = createMultiSubjectRegistry(baseCatalog.registry);

  it('P9.1 & P9.2: Successfully loads multi-subject taxonomy without state or schema corruption', () => {
    const { taxonomy } = multiRegistry;

    // Both subjects exist under the same program 'bxm'
    expect(taxonomy.programs[0]?.subjectIds).toContain('matematica');
    expect(taxonomy.programs[0]?.subjectIds).toContain('civica');

    // Both subjects exist in taxonomy.subjects
    expect(taxonomy.subjects.some(s => s.id === 'matematica')).toBe(true);
    expect(taxonomy.subjects.some(s => s.id === 'civica')).toBe(true);

    // Curriculum versioning is explicit
    expect(taxonomy.curriculumVersions?.some(cv => cv.subjectId === 'civica' && cv.version === '02-2026')).toBe(true);

    // Domains exist for both subjects independently
    const civDomains = taxonomy.domains.filter(d => d.subjectId === 'civica');
    const mathDomains = taxonomy.domains.filter(d => d.subjectId === 'matematica');
    expect(civDomains.length).toBe(3);
    expect(mathDomains.length).toBe(3);

    // Evidence mappings are distinct and valid
    const civEvidences = taxonomy.evidences.filter(e => e.id.startsWith('bxm/civica/'));
    const mathEvidences = taxonomy.evidences.filter(e => e.id.startsWith('bxm/matematica/'));
    expect(civEvidences.length).toBe(6);
    expect(mathEvidences.length).toBeGreaterThan(0);
  });

  it('P9.4: Compiles Educación Cívica Diagnostic, Formative Mock, and Official Simulation via generalized compiler', () => {
    // 1. Diagnostic (12 items: 4 per domain)
    const diag = compileAssessment(
      {
        programId: 'bxm',
        subjectId: 'civica',
        mode: 'diagnostic',
        seed: 42,
        blueprint: civicaDiagnosticBlueprint,
      },
      multiRegistry
    );

    expect(diag.blueprint.subjectId).toBe('civica');
    expect(diag.blueprint.mode).toBe('diagnostic');
    expect(diag.questions.length).toBe(12);
    expect(diag.questions.every(q => q.subjectId === 'civica')).toBe(true);
    expect(diag.questions.every(q => q.stream === 'authored')).toBe(true);

    const diagReg = diag.questions.filter(q => q.domainId === 'regimenes-politicos');
    const diagDem = diag.questions.filter(q => q.domainId === 'sistema-democratico');
    const diagEle = diag.questions.filter(q => q.domainId === 'sistema-electoral');
    expect(diagReg.length).toBe(4);
    expect(diagDem.length).toBe(4);
    expect(diagEle.length).toBe(4);

    // 2. Formative Mock (12 items)
    const mock = compileAssessment(
      {
        programId: 'bxm',
        subjectId: 'civica',
        mode: 'mock',
        seed: 99,
        blueprint: civicaMockBlueprint,
      },
      multiRegistry
    );
    expect(mock.questions.length).toBe(12);
    expect(mock.blueprint.timeLimitSeconds).toBe(1800); // 30 min
    expect(mock.questions.every(q => q.stream === 'authored')).toBe(true);

    // 3. Official Simulation (60 items: 20 per domain)
    const sim = compileAssessment(
      {
        programId: 'bxm',
        subjectId: 'civica',
        mode: 'simulation',
        seed: 2026,
        blueprint: civicaOfficialSimulationBlueprint,
      },
      multiRegistry
    );
    expect(sim.questions.length).toBe(60);
    expect(sim.blueprint.mode).toBe('benchmark');
    expect(sim.blueprint.stream).toBe('official_reference');
    expect(sim.blueprint.timeLimitSeconds).toBe(150 * 60); // 150 min

    const simReg = sim.questions.filter(q => q.domainId === 'regimenes-politicos');
    const simDem = sim.questions.filter(q => q.domainId === 'sistema-democratico');
    const simEle = sim.questions.filter(q => q.domainId === 'sistema-electoral');
    expect(simReg.length).toBe(20);
    expect(simDem.length).toBe(20);
    expect(simEle.length).toBe(20);
    expect(sim.questions.every(q => q.stream === 'official_reference')).toBe(true);
  });

  it('P9.5: Executes full learner loop in Educación Cívica: attempt -> scoring -> mastery -> remediation', () => {
    const assessment = compileAssessment(
      {
        programId: 'bxm',
        subjectId: 'civica',
        mode: 'diagnostic',
        seed: 777,
        blueprint: civicaDiagnosticBlueprint,
      },
      multiRegistry
    );

    // Run session
    const now = new Date().toISOString();
    let attempt = initializeAttempt(assessment, 'att_civica_test', 'learner_civica_test', now);
    for (let i = 0; i < assessment.questions.length; i++) {
      const q = assessment.questions[i]!;
      attempt = recordAnswer(assessment, attempt, q.id, 'A', now);
    }
    const completedAttempt = submitAttempt(assessment, attempt, now);
    expect(completedAttempt.status).toBe('submitted');
    expect(completedAttempt.score).toBeDefined();

    // Verify evidence collection
    const learningEvidence = collectLearningEvidence(assessment, completedAttempt);
    expect(learningEvidence.programId).toBe('bxm');
    expect(learningEvidence.subjectId).toBe('civica');
    expect(learningEvidence.observations.length).toBe(12);

    const historyRecord = {
      attempt: completedAttempt,
      assessmentVersion: assessment.blueprint.version,
      deviceFingerprint: 'device_test_p9',
      learningEvidence,
    };

    // Calculate Mastery
    const mastery = calculateMastery('learner_civica_test', [historyRecord], new Date().toISOString());
    expect(mastery.learnerId).toBe('learner_civica_test');
    expect(mastery.domains.length).toBeGreaterThan(0);

    // Plan de Nivelación
    const plan = generateNivelacion(mastery, [historyRecord], multiRegistry.taxonomy, multiRegistry.questions);
    expect(plan.learnerId).toBe('learner_civica_test');
    expect(plan.activities.length).toBeGreaterThan(0);
    // All recommended activities should reference valid civica evidences from multiRegistry
    for (const act of plan.activities) {
      expect(multiRegistry.taxonomy.evidences.some(e => e.id === act.evidenceId)).toBe(true);
    }
  });

  it('P9.5 & P9.10: Demonstrates multi-subject coexistence without learner state collision', () => {
    const learnerId = 'learner_multi_subject';

    // Compile Civica Assessment
    const civAssessment = compileAssessment(
      { programId: 'bxm', subjectId: 'civica', mode: 'diagnostic', seed: 101, blueprint: civicaDiagnosticBlueprint },
      multiRegistry
    );
    // Compile Math Assessment
    const mathAssessment = compileAssessment(
      { programId: 'bxm', subjectId: 'matematica', mode: 'diagnostic', seed: 101 },
      multiRegistry,
      { allowDraftPreview: true }
    );

    // Submit Civica attempt (100% correct)
    const nowCiv = new Date(Date.now() - 3600000).toISOString();
    let civAttempt = initializeAttempt(civAssessment, 'att_civ_multi', learnerId, nowCiv);
    for (const q of civAssessment.questions) {
      civAttempt = recordAnswer(civAssessment, civAttempt, q.id, q.correctOptionId, nowCiv);
    }
    const civFinished = submitAttempt(civAssessment, civAttempt, nowCiv);

    // Submit Math attempt (0% correct)
    const nowMath = new Date().toISOString();
    let mathAttempt = initializeAttempt(mathAssessment, 'att_math_multi', learnerId, nowMath);
    for (const q of mathAssessment.questions) {
      const wrong = (['A', 'B', 'C', 'D'] as const).find(o => o !== q.correctOptionId)!;
      mathAttempt = recordAnswer(mathAssessment, mathAttempt, q.id, wrong, nowMath);
    }
    const mathFinished = submitAttempt(mathAssessment, mathAttempt, nowMath);

    const civRecord: AttemptRecord = {
      attempt: civFinished,
      assessmentVersion: civAssessment.blueprint.version,
      deviceFingerprint: 'dev_1',
      receivedAt: nowCiv,
      learningEvidence: collectLearningEvidence(civAssessment, civFinished),
    } as AttemptRecord;

    const mathRecord: AttemptRecord = {
      attempt: mathFinished,
      assessmentVersion: mathAssessment.blueprint.version,
      deviceFingerprint: 'dev_1',
      receivedAt: nowMath,
      learningEvidence: collectLearningEvidence(mathAssessment, mathFinished),
    } as AttemptRecord;

    // Calculate Mastery across combined history
    const combinedHistory = [civRecord, mathRecord];
    const mastery = calculateMastery(learnerId, combinedHistory, new Date().toISOString());

    // Verify domains from both subjects are present
    const domainIds = mastery.domains.map(d => d.id);
    expect(domainIds).toContain('regimenes-politicos');
    expect(domainIds).toContain('geometry');

    // Longitudinal progress derivation
    const longitudinal = deriveLongitudinalMetrics(learnerId, combinedHistory as any);
    expect(longitudinal.totalAttempts).toBe(2);
    expect(longitudinal.loopCounts.diagnostic).toBe(2);
    expect(Object.keys(longitudinal.domainCoverage).length).toBeGreaterThanOrEqual(4);
    // Verified both subjects coexist cleanly in attempts and analytics
  });
});
