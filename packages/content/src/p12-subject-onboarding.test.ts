import { describe, expect, it } from 'vitest';
import {
  createMultiSubjectCatalog,
  registeredSubjectPackages,
} from './multiSubjectCatalog';
import { validateSubjectPackage } from './authoring/validator';
import { ingestSubjectPackage } from './authoring/ingestion';
import { compileAssessment } from './compilation';
import { LearnerJourney, type StringStorage } from '@mep-ea/learning-runtime';
import { createTelemetryEvent } from '@mep-ea/analytics';
import type { SubjectAuthoringPackage } from './authoring/types';

function createMemoryStorage(): StringStorage {
  const store = new Map<string, string>();
  return {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => { store.set(k, v); },
    removeItem: (k: string) => { store.delete(k); },
  };
}

describe('P12: Content Authoring, Ingestion & Multi-Subject Productization', () => {
  const socPackage = registeredSubjectPackages.find(p => p.subject.id === 'estudios-sociales')!;

  it('P12.3: Validates subject package against Gates A, B, C, D and referential integrity', () => {
    expect(socPackage).toBeDefined();
    const report = validateSubjectPackage(socPackage);
    expect(report.valid).toBe(true);
    expect(report.errors).toHaveLength(0);
    expect(report.stats.domainsCount).toBe(2);
    expect(report.stats.evidencesCount).toBe(9);
    expect(report.stats.lessonsCount).toBe(2);
    expect(report.stats.questionsCount).toBe(69);
    expect(report.stats.blueprintsCount).toBe(3);
  });

  it('P12.3 Rejection: Rejects malformed subject package with broken evidence or quota sum', () => {
    const brokenPackage: SubjectAuthoringPackage = {
      ...socPackage,
      domains: [socPackage.domains[0]!], // drop second domain so questions and blueprints break
    };
    const report = validateSubjectPackage(brokenPackage);
    expect(report.valid).toBe(false);
    expect(report.errors.length).toBeGreaterThan(0);
    expect(report.errors.some(e => e.includes('domain'))).toBe(true);
  });

  it('P12.4: Deterministically ingests package into runtime nodes, lessons, questions, and blueprints', () => {
    const ingested = ingestSubjectPackage(socPackage);
    expect(ingested.nodes.length).toBe(9);
    expect(ingested.lessons.length).toBe(2);
    expect(ingested.questions.length).toBe(69);
    // 3 authored blueprints + 9 per-evidence practice blueprints = 12 total
    expect(ingested.blueprints.length).toBe(12);

    // Verify evidence node links to lesson
    const nodeWithLesson = ingested.nodes.find(n => n.key === 'bxm/soc/02-2026/global/E1.1');
    expect(nodeWithLesson).toBeDefined();
    expect(nodeWithLesson?.lesson?.title).toBe('La Expansión Imperialista Europea (Siglos XIX y XX)');
    expect(nodeWithLesson?.practiceItemIds.length).toBeGreaterThan(0);
  });

  it('P12.8 & P12.15: Dynamic Catalog Discovery & Full Learning Loop for Estudios Sociales', async () => {
    const catalog = createMultiSubjectCatalog();

    // 1. Discover subject in catalog taxonomy
    const subject = catalog.registry.taxonomy.subjects.find(s => s.id === 'estudios-sociales');
    expect(subject).toBeDefined();
    expect(subject?.name).toBe('Estudios Sociales');
    expect(subject?.programId).toBe('bxm');

    // 2. Discover domains and curriculum version
    const domains = catalog.registry.taxonomy.domains.filter(d => d.subjectId === 'estudios-sociales');
    expect(domains).toHaveLength(2);
    const curriculumVersion = catalog.registry.taxonomy.curriculumVersions?.find(
      cv => cv.subjectId === 'estudios-sociales'
    );
    expect(curriculumVersion?.version).toBe('02-2026');

    // 3. Compile Diagnostic Assessment for Estudios Sociales
    const diagBlueprint = catalog.blueprints.find(
      b => b.id === 'estudios-sociales-diagnostic-02-2026'
    )!;
    expect(diagBlueprint).toBeDefined();
    const assessment = compileAssessment(
      {
        programId: 'bxm',
        subjectId: 'estudios-sociales',
        mode: 'diagnostic',
        blueprint: diagBlueprint,
      },
      catalog.registry
    );
    expect(assessment.questions).toHaveLength(9);
    expect(assessment.blueprint.subjectId).toBe('estudios-sociales');

    // 4. Execute Journey Loop with Memory Storage
    const storage = createMemoryStorage();
    const journey = new LearnerJourney(
      catalog,
      storage,
      'test_learner_p12',
      () => '2026-11-09T08:15:00.000Z',
      () => 'attempt_soc_diag_1'
    );

    const initial = await journey.start(diagBlueprint.id);
    expect(initial.attempt.status).toBe('in_progress');
    expect(initial.attempt.questionIds).toHaveLength(9);

    // Answer questions
    for (let i = 0; i < initial.attempt.questionIds.length; i++) {
      const qId = initial.attempt.questionIds[i]!;
      const q = catalog.registry.questions.find(item => item.id === qId)!;
      await journey.answer(qId, q.correctOptionId);
    }

    const state = await journey.submit();
    expect(state.attempt.status).toBe('submitted');
    expect(state.attempt.score?.correct).toBe(9);
    expect(state.attempt.score?.total).toBe(9);
    expect(state.attempt.score?.percentage).toBe(100);

    // 5. Verify Result & Diagnostic
    const result = journey.result(state);
    expect(result.diagnostic.domains).toHaveLength(2);
    expect(result.diagnostic.domains.every(d => d.tier === 'strong')).toBe(true);
  });

  it('P12.13: Telemetry emits correctly with programId, subjectId, and curriculumVersionId context', () => {
    const event = createTelemetryEvent({
      name: 'lesson_opened',
      platform: 'web',
      anonymousSessionId: 'anon_sess_test',
      programId: 'bxm',
      subjectId: 'estudios-sociales',
      curriculumVersionId: 'bxm-estudios-sociales-02-2026',
      payload: {
        evidenceId: 'bxm/soc/02-2026/global/E1.1',
      },
    });

    expect(event.stage).toBe('learning');
    expect(event.programId).toBe('bxm');
    expect(event.subjectId).toBe('estudios-sociales');
    expect(event.curriculumVersionId).toBe('bxm-estudios-sociales-02-2026');
    expect(event.payload.evidenceId).toBe('bxm/soc/02-2026/global/E1.1');
  });
});
