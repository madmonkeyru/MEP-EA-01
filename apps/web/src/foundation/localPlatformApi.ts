import type { PlatformApi, AuthSession, AuthProvider, AuthRegisterPayload, AuthLoginPayload, AuthResponse, CompileAssessmentPayload, AttemptRecord, LearningContinuity, DraftWrite, DraftRecord, DraftState } from '@mep-ea/api';
import { EntitlementRequired } from '@mep-ea/api';
import type { Assessment, Attempt, Diagnostic, RemediationPlan } from '@mep-ea/domain';
import { compileAssessment } from '@mep-ea/content';
import { createLearningPreviewCatalog } from '@mep-ea/content/expansion';
import { restoreAttempt, diagnose, remediate, calculateMastery, collectLearningEvidence, generateNivelacion, type LearningRecord } from '@mep-ea/learning-runtime';

export function createLocalPlatformApi(authProvider: AuthProvider, catalog = createLearningPreviewCatalog()): PlatformApi {
  const STORAGE_KEY_ATTEMPTS = 'mep_ea_foundation_attempts_v1';
  const STORAGE_KEY_ACCOUNTS = 'mep_ea_foundation_accounts_v1';

  function getStoredAttempts(): AttemptRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ATTEMPTS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveStoredAttempts(attempts: AttemptRecord[]) {
    try {
      localStorage.setItem(STORAGE_KEY_ATTEMPTS, JSON.stringify(attempts));
    } catch {
      // storage unavailable
    }
  }

  function getAccounts(): Record<string, { username: string; password: string; tier: 'free' | 'premium'; roles: ('learner' | 'content_admin' | 'platform_admin')[] }> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  function saveAccounts(accounts: Record<string, unknown>) {
    try {
      localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
    } catch {
      // storage unavailable
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
  };
}
