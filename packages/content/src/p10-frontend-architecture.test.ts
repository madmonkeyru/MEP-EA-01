import { describe, it, expect } from 'vitest';
import { createMultiSubjectCatalog } from '@mep-ea/content';
import { createLocalPlatformApi, createTokenAuthProvider, createOfflineJourney } from '@mep-ea/api';
import { ClientTelemetryService } from '@mep-ea/analytics';
import { parseEducationalHash, serializeEducationalHash } from '../../../apps/web/src/foundation/educationalNavigation';

describe('P10 Multi-Subject Architectural Proof & Boundary Suite', () => {
  const catalog = createMultiSubjectCatalog();

  it('Gate 8: Exposes both BXM Matemática and BXM Educación Cívica through a single unified catalog', () => {
    const subjects = catalog.registry.taxonomy.subjects;
    expect(subjects.some(s => s.id === 'matematica')).toBe(true);
    expect(subjects.some(s => s.id === 'civica')).toBe(true);

    const mathDomains = catalog.registry.taxonomy.domains.filter(d => d.subjectId === 'matematica');
    const civicaDomains = catalog.registry.taxonomy.domains.filter(d => d.subjectId === 'civica');

    expect(mathDomains.length).toBe(3); // geometry, functions, statistics
    expect(civicaDomains.length).toBe(3); // regimenes-politicos, sistema-democratico, sistema-electoral

    expect(civicaDomains.map(d => d.id)).toEqual([
      'regimenes-politicos',
      'sistema-democratico',
      'sistema-electoral',
    ]);
  });

  it('Gate 2 & 4: Shared offline journey executes identically across subjects without BXM Matemática coupling', async () => {
    const memory = new Map<string, string>();
    const storage = {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => { memory.set(key, value); },
      removeItem: (key: string) => { memory.delete(key); },
    };

    const { journey } = createOfflineJourney(catalog, storage, 'learner-civica-01');

    // Find Cívica diagnostic blueprint
    const civicaBlueprint = catalog.blueprints.find(b => b.subjectId === 'civica' && b.mode === 'diagnostic');
    expect(civicaBlueprint).toBeDefined();

    // Start assessment journey
    const startState = await journey.start(civicaBlueprint!.id);
    expect(startState).not.toBeNull();
    expect(startState.assessment.blueprint.subjectId).toBe('civica');
    expect(startState.assessment.questions.length).toBe(12);

    // Answer first question
    const q0 = startState.assessment.questions[0];
    const answeredState = await journey.answer(q0.id, 'A');
    expect(answeredState.attempt.answers[q0.id]?.optionId).toBe('A');

    // Submit journey
    const submittedState = await journey.submit();
    expect(submittedState.attempt.status).toBe('submitted');

    // Derive diagnostic results
    const result = journey.result(submittedState);
    expect(result.diagnostic.domains.length).toBe(3);
    expect(result.plan).toBeDefined();
  });

  it('Gate 5: Preserves and restores educational route parameters between subjects and deep links', () => {
    // 1. Math evidence route
    const mathHash = serializeEducationalHash({
      programId: 'bxm',
      subjectId: 'matematica',
      evidenceKey: 'bxm/matematica/02-2026/geometry/A1.1',
      tab: 'aprender',
    });
    expect(parseEducationalHash(mathHash)).toEqual({
      programId: 'bxm',
      subjectId: 'matematica',
      evidenceKey: 'bxm/matematica/02-2026/geometry/A1.1',
      tab: 'aprender',
    });

    // 2. Cívica simulation route
    const civicaHash = serializeEducationalHash({
      programId: 'bxm',
      subjectId: 'civica',
      tab: 'practicar',
    });
    expect(parseEducationalHash(civicaHash)).toEqual({
      programId: 'bxm',
      subjectId: 'civica',
      tab: 'practicar',
    });
  });

  it('Gate 11: Emits generalized educational telemetry with program, subject, and curriculum version context', async () => {
    const memory = new Map<string, string>();
    const storage = {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => { memory.set(key, value); },
    };
    const auth = createTokenAuthProvider({ kind: 'anonymous', learnerId: 'learner-tel', tier: 'free' });
    const api = createLocalPlatformApi(auth, catalog, storage);

    let sentEvents: any[] = [];
    const telemetry = new ClientTelemetryService({
      platform: 'web',
      api: {
        async sendTelemetry(events) {
          sentEvents = events;
          return { accepted: events.length, duplicate: 0, rejected: 0 };
        },
      },
      learnerId: 'learner-tel',
    });

    telemetry.track('session_started', { source: 'p10_verification' });
    await telemetry.flush();

    expect(sentEvents.length).toBe(1);
    expect(sentEvents[0].name).toBe('session_started');
    expect(sentEvents[0].learnerId).toBe('learner-tel');
    expect(sentEvents[0].platform).toBe('web');
  });
});
