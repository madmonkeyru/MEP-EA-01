import type { PlatformApi, AuthSession, AuthProvider, AuthRegisterPayload, AuthLoginPayload, AuthResponse, CompileAssessmentPayload, AttemptRecord, LearningContinuity, DraftWrite, DraftRecord, DraftState, TelemetryIngestResponse, LongitudinalMetricsResponse } from '@mep-ea/api';
import { EntitlementRequired } from '@mep-ea/api';
import type { Assessment, Attempt, Diagnostic, RemediationPlan } from '@mep-ea/domain';
import { compileAssessment } from '@mep-ea/content';
import { createLearningPreviewCatalog } from '@mep-ea/content/expansion';
import { restoreAttempt, diagnose, remediate, calculateMastery, collectLearningEvidence, generateNivelacion, type LearningRecord } from '@mep-ea/learning-runtime';

export interface MobileStorageAdapter {
  getItemSync(key: string): string | null;
  setItemSync(key: string, value: string): void;
}

const memoryKvStore = new Map<string, string>();
const defaultStorage: MobileStorageAdapter = {
  getItemSync(key: string) {
    try {
      const StorageModule = require('expo-sqlite/kv-store');
      const Storage = StorageModule.default || StorageModule;
      if (typeof Storage.getItemSync === 'function') return Storage.getItemSync(key);
    } catch {
      // fallback
    }
    return memoryKvStore.get(key) ?? null;
  },
  setItemSync(key: string, value: string) {
    try {
      const StorageModule = require('expo-sqlite/kv-store');
      const Storage = StorageModule.default || StorageModule;
      if (typeof Storage.setItemSync === 'function') {
        Storage.setItemSync(key, value);
        return;
      }
    } catch {
      // fallback
    }
    memoryKvStore.set(key, value);
  },
};

export function createMobilePlatformApi(
  authProvider: AuthProvider,
  catalog = createLearningPreviewCatalog(),
  storage: MobileStorageAdapter = defaultStorage
): PlatformApi {
  const STORAGE_KEY_ATTEMPTS = 'mep_ea_mobile_attempts_v1';
  const STORAGE_KEY_ACCOUNTS = 'mep_ea_mobile_accounts_v1';
  const STORAGE_KEY_TELEMETRY = 'mep_ea_mobile_telemetry_v1';

  function getStoredAttempts(): AttemptRecord[] {
    try {
      const raw = storage.getItemSync(STORAGE_KEY_ATTEMPTS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveStoredAttempts(attempts: AttemptRecord[]) {
    try {
      storage.setItemSync(STORAGE_KEY_ATTEMPTS, JSON.stringify(attempts));
    } catch {
      // ignore
    }
  }

  function getAccounts(): Record<string, { username: string; password: string; tier: 'free' | 'premium'; roles: ('learner' | 'content_admin' | 'platform_admin')[] }> {
    try {
      const raw = storage.getItemSync(STORAGE_KEY_ACCOUNTS);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  function saveAccounts(accounts: Record<string, unknown>) {
    try {
      storage.setItemSync(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
    } catch {
      // ignore
    }
  }

  const compiledRegistry = new Map<string, Assessment>();

  return {
    async submitAttempt(attempt: Attempt): Promise<void> {
      const session = await authProvider.getSession();
      const assessment = compiledRegistry.get(attempt.assessmentId);
      const restored = assessment
        ? restoreAttempt(assessment, attempt, session.learnerId, attempt.id)
        : attempt;

      const learningEvidence = assessment ? collectLearningEvidence(assessment, restored) : undefined;
      const diagnostic: Diagnostic = assessment ? diagnose(assessment, restored) : {
        attemptId: attempt.id,
        weakEvidenceIds: [],
        generatedAt: new Date().toISOString(),
        domains: [],
        provisional: true,
      };
      const remediation: RemediationPlan = assessment ? remediate(assessment, restored, diagnostic) : {
        learnerId: session.learnerId,
        conceptIds: [],
        reason: 'diagnostic_weakness',
        activities: [],
        nextStep: 'practice',
      };

      const record: AttemptRecord = {
        schemaVersion: 1,
        revision: 1,
        attempt: restored,
        receivedAt: new Date().toISOString(),
        result: { diagnostic, remediation },
        learningEvidence,
      };

      const current = getStoredAttempts();
      const existingIdx = current.findIndex(a => a.attempt.id === attempt.id);
      if (existingIdx >= 0) {
        current[existingIdx] = record;
      } else {
        current.push(record);
      }
      saveStoredAttempts(current);
    },

    async getAttempt(id: string): Promise<AttemptRecord> {
      const current = getStoredAttempts();
      const record = current.find(a => a.attempt.id === id);
      if (!record) throw new Error('Attempt not found');
      return record;
    },

    async getCatalog(_channel = 'development') {
      return {
        schemaVersion: 1 as const,
        version: '1.0.0',
        channel: 'development' as const,
        registry: catalog.registry,
        blueprints: catalog.blueprints,
      };
    },

    async getLearningContinuity(): Promise<LearningContinuity> {
      const session = await authProvider.getSession();
      const stored = getStoredAttempts();
      const userRecords: LearningRecord[] = stored
        .filter(r => r.attempt.learnerId === session.learnerId)
        .map(r => ({
          attempt: r.attempt,
          learningEvidence: r.learningEvidence,
        }));

      const nowIso = new Date().toISOString();
      const mastery = calculateMastery(session.learnerId, userRecords, nowIso);
      const plan = generateNivelacion(
        mastery,
        userRecords,
        catalog.registry.taxonomy,
        catalog.registry.questions
      );

      return {
        schemaVersion: 1,
        mastery,
        plan,
      };
    },

    async getDraft(id: string): Promise<DraftState> {
      return {
        schemaVersion: 1,
        draft: null,
        conflicts: [],
        completed: getStoredAttempts().some(a => a.attempt.id === id),
      };
    },

    async saveDraft(write: DraftWrite): Promise<DraftRecord> {
      return {
        schemaVersion: 1,
        revision: write.baseRevision + 1,
        attempt: write.attempt,
        deviceId: write.deviceId,
        receivedAt: new Date().toISOString(),
      };
    },

    async compileAssessment(payload: CompileAssessmentPayload): Promise<Assessment> {
      const session = await authProvider.getSession();
      if (payload.mode === 'simulation' && session.tier !== 'premium') {
        throw new EntitlementRequired('premium', 'La simulación completa de examen requiere una suscripción Pro.');
      }

      const assessment = compileAssessment(
        {
          programId: payload.programId,
          subjectId: payload.subjectId,
          mode: payload.mode,
          seed: payload.seed,
        },
        catalog.registry,
        { allowDraftPreview: true }
      );

      compiledRegistry.set(assessment.id, assessment);
      return assessment;
    },

    async register(payload: AuthRegisterPayload): Promise<AuthResponse> {
      const accounts = getAccounts();
      if (accounts[payload.username]) {
        throw new Error('El usuario ya existe');
      }
      const tier = payload.tier ?? 'free';
      const learnerId = `learner_${Date.now()}_${payload.username}`;
      accounts[payload.username] = {
        username: payload.username,
        password: payload.password,
        tier,
        roles: ['learner'],
      };
      saveAccounts(accounts);
      const expiresAt = new Date(Date.now() + 86400_000 * 30).toISOString();
      return {
        token: `mock_jwt_${learnerId}_${Date.now()}`,
        expiresAt,
        session: {
          learnerId,
          username: payload.username,
          tier,
          roles: ['learner'],
        },
      };
    },

    async login(payload: AuthLoginPayload): Promise<AuthResponse> {
      const accounts = getAccounts();
      const user = accounts[payload.username];
      if (!user || user.password !== payload.password) {
        throw new Error('Credenciales inválidas');
      }
      const learnerId = `learner_${user.username}`;
      const expiresAt = new Date(Date.now() + 86400_000 * 30).toISOString();
      return {
        token: `mock_jwt_${learnerId}_${Date.now()}`,
        expiresAt,
        session: {
          learnerId,
          username: user.username,
          tier: user.tier,
          roles: user.roles,
        },
      };
    },

    async getSession(): Promise<AuthSession> {
      return authProvider.getSession();
    },

    async sendTelemetry(events: unknown[]): Promise<TelemetryIngestResponse> {
      try {
        const raw = storage.getItemSync(STORAGE_KEY_TELEMETRY);
        const current = raw ? JSON.parse(raw) : [];
        storage.setItemSync(STORAGE_KEY_TELEMETRY, JSON.stringify([...current, ...events]));
      } catch {
        // ignore
      }
      return { accepted: events.length, duplicate: 0, rejected: 0 };
    },

    async getLongitudinalMetrics(): Promise<LongitudinalMetricsResponse['metrics']> {
      const session = await authProvider.getSession();
      const attempts = getStoredAttempts().filter(a => a.attempt.learnerId === session.learnerId);
      const nowIso = new Date().toISOString();
      let totalQuestions = 0;
      let totalCorrect = 0;
      let totalUnanswered = 0;
      let totalDurationSeconds = 0;
      const domainCoverage: Record<string, { total: number; correct: number; distinctFamilies: number }> = {};
      const loopCounts = { diagnostic: 0, practice: 0, mock: 0, simulation: 0 };

      for (const a of attempts) {
        if (a.learningEvidence?.mode === 'diagnostic' || a.attempt.assessmentId.includes('diagnostic')) loopCounts.diagnostic++;
        else if (a.learningEvidence?.mode === 'practice') loopCounts.practice++;
        else if (a.attempt.questionIds.length >= 60) loopCounts.simulation++;
        else loopCounts.mock++;

        if (a.attempt.score) {
          totalQuestions += a.attempt.score.total;
          totalCorrect += a.attempt.score.correct;
          totalUnanswered += a.attempt.score.unanswered;
        }

        const start = Date.parse(a.attempt.startedAt);
        const end = Date.parse(a.attempt.submittedAt ?? a.attempt.updatedAt);
        if (!isNaN(start) && !isNaN(end) && end >= start) {
          totalDurationSeconds += Math.round((end - start) / 1000);
        }

        if (a.learningEvidence?.observations) {
          for (const obs of a.learningEvidence.observations) {
            if (!domainCoverage[obs.domainId]) {
              domainCoverage[obs.domainId] = { total: 0, correct: 0, distinctFamilies: 0 };
            }
            domainCoverage[obs.domainId].total++;
            if (obs.correct) domainCoverage[obs.domainId].correct++;
          }
        }
      }

      return {
        learnerId: session.learnerId,
        evaluatedAt: nowIso,
        totalAttempts: attempts.length,
        firstAttemptAt: attempts[0]?.receivedAt ?? null,
        lastAttemptAt: attempts[attempts.length - 1]?.receivedAt ?? null,
        loopCounts,
        overallAccuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 1000) / 10 : null,
        domainCoverage,
        habits: {
          averageDurationSeconds: attempts.length > 0 ? Math.round(totalDurationSeconds / attempts.length) : 0,
          unansweredRate: totalQuestions > 0 ? Math.round((totalUnanswered / totalQuestions) * 1000) / 1000 : 0,
          totalQuestionsEncountered: totalQuestions,
        },
        loopStage: loopCounts.diagnostic === 0 ? 'diagnostic_needed' : 'remediation_in_progress',
      };
    },
  };
}
