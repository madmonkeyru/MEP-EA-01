import { describe, it, expect, beforeEach } from 'vitest';
import { createMobilePlatformApi, type MobileStorageAdapter } from './localPlatformApi';
import { createTokenAuthProvider, EntitlementRequired } from '@mep-ea/api';
import { createLearningPreviewCatalog } from '@mep-ea/content/expansion';
import type { Attempt } from '@mep-ea/domain';

describe('Mobile Platform API & Storage Adapter (P7.4 Native Acceptance)', () => {
  let memoryMap: Map<string, string>;
  let mockStorage: MobileStorageAdapter;
  const catalog = createLearningPreviewCatalog();

  beforeEach(() => {
    memoryMap = new Map();
    mockStorage = {
      getItemSync: (key: string) => memoryMap.get(key) ?? null,
      setItemSync: (key: string, value: string) => memoryMap.set(key, value),
    };
  });

  it('handles user registration, session token generation, and account retrieval', async () => {
    const authProvider = createTokenAuthProvider({ kind: 'anonymous', learnerId: 'p2-local', tier: 'free' });
    const api = createMobilePlatformApi(authProvider, catalog, mockStorage);

    const registered = await api.register({
      username: 'estudiante_mobile',
      password: 'password123',
      tier: 'free',
    });

    expect(registered.session.username).toBe('estudiante_mobile');
    expect(registered.session.tier).toBe('free');
    expect(registered.token).toBeDefined();

    // Verify login
    const loggedIn = await api.login({
      username: 'estudiante_mobile',
      password: 'password123',
    });
    expect(loggedIn.session.username).toBe('estudiante_mobile');
    expect(loggedIn.token).toBeDefined();
  });

  it('compiles assessments deterministically and enforces Pro entitlement on 60-item simulation', async () => {
    const freeAuth = createTokenAuthProvider({ kind: 'anonymous', learnerId: 'free-learner', tier: 'free' });
    const freeApi = createMobilePlatformApi(freeAuth, catalog, mockStorage);

    // Free diagnostic (20 items) compiles cleanly
    const diagnostic = await freeApi.compileAssessment({
      programId: 'bxm',
      subjectId: 'matematica',
      mode: 'diagnostic',
      seed: 42,
    });
    expect(diagnostic.questions.length).toBe(20);

    // Free simulation attempt triggers EntitlementRequired
    await expect(
      freeApi.compileAssessment({
        programId: 'bxm',
        subjectId: 'matematica',
        mode: 'simulation',
      })
    ).rejects.toThrow(EntitlementRequired);

    // Pro simulation compiles cleanly
    const proAuth = createTokenAuthProvider({
      kind: 'authenticated',
      learnerId: 'pro-learner',
      tier: 'premium',
      roles: ['learner'],
      accessToken: 'token-pro',
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    });
    const proApi = createMobilePlatformApi(proAuth, catalog, mockStorage);
    const simulation = await proApi.compileAssessment({
      programId: 'bxm',
      subjectId: 'matematica',
      mode: 'simulation',
      seed: 42,
    });
    expect(simulation.questions.length).toBe(60);
  });

  it('submits attempts to mobile local storage, recalculates continuity, and drives Plan de Nivelación', async () => {
    const auth = createTokenAuthProvider({
      kind: 'authenticated',
      learnerId: 'test-learner-1',
      tier: 'free',
      roles: ['learner'],
      accessToken: 'token-free',
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    });
    const api = createMobilePlatformApi(auth, catalog, mockStorage);

    const compiled = await api.compileAssessment({
      programId: 'bxm',
      subjectId: 'matematica',
      mode: 'diagnostic',
      seed: 12345,
    });

    const nowIso = new Date().toISOString();
    const attempt: Attempt = {
      schemaVersion: 1,
      id: 'attempt-mobile-001',
      learnerId: 'test-learner-1',
      assessmentId: compiled.id,
      assessmentVersion: compiled.blueprint.version,
      questionIds: compiled.questions.map(q => q.id),
      status: 'submitted',
      currentIndex: compiled.questions.length - 1,
      answers: {
        [compiled.questions[0].id]: {
          questionId: compiled.questions[0].id,
          optionId: 'A',
          answeredAt: nowIso,
        },
      },
      startedAt: nowIso,
      updatedAt: nowIso,
      submittedAt: nowIso,
      deadlineAt: new Date(Date.parse(nowIso) + compiled.blueprint.timeLimitSeconds * 1000).toISOString(),
    };

    await api.submitAttempt(attempt);

    // Verify stored attempt
    const stored = await api.getAttempt('attempt-mobile-001');
    expect(stored.attempt.id).toBe('attempt-mobile-001');
    expect(stored.result?.diagnostic).toBeDefined();

    // Verify continuity derivation
    const continuity = await api.getLearningContinuity();
    expect(continuity.mastery).toBeDefined();
    expect(continuity.plan).toBeDefined();
    expect(continuity.mastery.learnerId).toBe('test-learner-1');
  });
});
