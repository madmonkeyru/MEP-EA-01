import {
  type ActivityHistoryEntry,
  type CompleteLearnerState,
  type EntitlementState,
  type LearnerAttemptRecord,
  type LearnerProfile,
  type MasterySnapshot,
  type PersistenceAdapter,
  type RecommendationRecord,
  PERSISTENCE_SCHEMA_VERSION,
} from '../types/persistence';
import type { UserTier } from './entitlementService';

import { PERSISTENCE_KEYS as STORAGE_KEYS } from './storageRegistry';

function generateDeterministicId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export class LocalStoragePersistenceAdapter implements PersistenceAdapter {
  private inMemoryCache: Record<string, string> = {};

  private getItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {
      // Storage unavailable, fallback to cache
    }
    return this.inMemoryCache[key] ?? null;
  }

  private setItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch {
      // Storage unavailable, fallback to cache
    }
    this.inMemoryCache[key] = value;
  }

  private removeItem(key: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {
      // Storage unavailable
    }
    delete this.inMemoryCache[key];
  }

  public async getProfile(learnerId?: string): Promise<LearnerProfile | null> {
    const raw = this.getItem(STORAGE_KEYS.PROFILE);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as LearnerProfile;
        if (!learnerId || parsed.learner_id === learnerId) {
          return parsed;
        }
      } catch {
        // Corrupted payload, fall through to migration or null
      }
    }

    // Try migration from legacy user storage if available
    const legacyRaw = this.getItem(STORAGE_KEYS.LEGACY_USER);
    if (legacyRaw) {
      try {
        const legacy = JSON.parse(legacyRaw);
        const migrated: LearnerProfile = {
          learner_id: legacy.id || generateDeterministicId('learner'),
          schema_version: PERSISTENCE_SCHEMA_VERSION,
          created_at: legacy.createdAt || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          display_name: legacy.name || 'Estudiante',
          current_program: legacy.currentProgram || 'bxm',
          is_anonymous: !legacy.id,
        };
        await this.saveProfile(migrated);
        return migrated;
      } catch {
        // ignore legacy parse errors
      }
    }

    // Default anonymous profile
    const defaultProfile: LearnerProfile = {
      learner_id: learnerId || generateDeterministicId('learner_anon'),
      schema_version: PERSISTENCE_SCHEMA_VERSION,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      display_name: 'Estudiante BXM',
      current_program: 'bxm',
      is_anonymous: true,
    };
    await this.saveProfile(defaultProfile);
    return defaultProfile;
  }

  public async saveProfile(profile: LearnerProfile): Promise<void> {
    profile.schema_version = PERSISTENCE_SCHEMA_VERSION;
    profile.updated_at = new Date().toISOString();
    this.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }

  public async getAttempts(learnerId: string): Promise<LearnerAttemptRecord[]> {
    const raw = this.getItem(STORAGE_KEYS.ATTEMPTS);
    let attempts: LearnerAttemptRecord[] = [];
    if (raw) {
      try {
        attempts = JSON.parse(raw);
      } catch {
        attempts = [];
      }
    }

    // Migrate from legacy attempts if modern storage is empty
    if (attempts.length === 0) {
      const legacyRaw = this.getItem(STORAGE_KEYS.LEGACY_ATTEMPTS);
      if (legacyRaw) {
        try {
          const legacyAttempts = JSON.parse(legacyRaw);
          if (Array.isArray(legacyAttempts)) {
            attempts = legacyAttempts.map((leg: any, idx: number) => ({
              attempt_id: leg.id || `migrated_attempt_${idx}`,
              session_id: leg.sessionId || `session_${idx}`,
              learner_id: learnerId,
              program_id: leg.programId || 'bxm',
              subject_id: leg.subjectId || 'matematica',
              activity_type: leg.mode === 'simulation' ? 'mock_exam' : 'practice',
              score_percentage: leg.score || 0,
              correct_count: leg.correctAnswers || 0,
              total_questions: leg.totalQuestions || 0,
              time_spent_seconds: leg.timeSpent || 0,
              completed_at: leg.completedAt || new Date().toISOString(),
            }));
            this.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(attempts));
          }
        } catch {
          // ignore legacy parse errors
        }
      }
    }

    return attempts.filter((a) => !learnerId || a.learner_id === learnerId);
  }

  public async saveAttempt(attempt: LearnerAttemptRecord): Promise<void> {
    const all = await this.getAttempts(attempt.learner_id);
    const existingIndex = all.findIndex((a) => a.attempt_id === attempt.attempt_id);
    if (existingIndex >= 0) {
      all[existingIndex] = attempt;
    } else {
      all.push(attempt);
    }
    this.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(all));
  }

  public async getMasterySnapshots(learnerId: string): Promise<MasterySnapshot[]> {
    const raw = this.getItem(STORAGE_KEYS.MASTERY);
    if (!raw) return [];
    try {
      const list = JSON.parse(raw) as MasterySnapshot[];
      return list.filter((m) => !learnerId || m.learner_id === learnerId);
    } catch {
      return [];
    }
  }

  public async saveMasterySnapshot(snapshot: MasterySnapshot): Promise<void> {
    const list = await this.getMasterySnapshots(snapshot.learner_id);
    const idx = list.findIndex(
      (m) => m.evidence_id === snapshot.evidence_id && m.learner_id === snapshot.learner_id
    );
    if (idx >= 0) {
      list[idx] = snapshot;
    } else {
      list.push(snapshot);
    }
    this.setItem(STORAGE_KEYS.MASTERY, JSON.stringify(list));
  }

  public async getActiveRecommendation(learnerId: string): Promise<RecommendationRecord | null> {
    const raw = this.getItem(STORAGE_KEYS.RECOMMENDATION);
    if (!raw) return null;
    try {
      const rec = JSON.parse(raw) as RecommendationRecord;
      if ((!learnerId || rec.learner_id === learnerId) && !rec.completed_at && !rec.dismissed_at) {
        return rec;
      }
      return null;
    } catch {
      return null;
    }
  }

  public async saveRecommendation(recommendation: RecommendationRecord): Promise<void> {
    this.setItem(STORAGE_KEYS.RECOMMENDATION, JSON.stringify(recommendation));
  }

  public async getEntitlementState(learnerId: string): Promise<EntitlementState> {
    const raw = this.getItem(STORAGE_KEYS.ENTITLEMENT);
    if (raw) {
      try {
        const ent = JSON.parse(raw) as EntitlementState;
        if (!learnerId || ent.learner_id === learnerId) {
          return ent;
        }
      } catch {
        // ignore
      }
    }

    // Fallback to legacy subscription tier if present
    const legacyTier = (this.getItem(STORAGE_KEYS.LEGACY_SUBSCRIPTION) || 'free') as UserTier;
    const defaultState: EntitlementState = {
      learner_id: learnerId,
      tier: legacyTier === 'premium' ? 'premium' : 'free',
      granted_at: new Date().toISOString(),
      expires_at: null,
      source: legacyTier === 'premium' ? 'simulated' : 'default',
    };
    await this.saveEntitlementState(defaultState);
    return defaultState;
  }

  public async saveEntitlementState(entitlement: EntitlementState): Promise<void> {
    this.setItem(STORAGE_KEYS.ENTITLEMENT, JSON.stringify(entitlement));
    this.setItem(STORAGE_KEYS.LEGACY_SUBSCRIPTION, entitlement.tier);
  }

  public async getActivityHistory(learnerId: string, limit = 50): Promise<ActivityHistoryEntry[]> {
    const raw = this.getItem(STORAGE_KEYS.HISTORY);
    if (!raw) return [];
    try {
      const list = JSON.parse(raw) as ActivityHistoryEntry[];
      return list.filter((h) => !learnerId || h.learner_id === learnerId).slice(0, limit);
    } catch {
      return [];
    }
  }

  public async recordActivity(entry: ActivityHistoryEntry): Promise<void> {
    const list = await this.getActivityHistory(entry.learner_id, 200);
    list.unshift(entry);
    this.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(list.slice(0, 100)));
  }

  public async exportState(learnerId: string): Promise<CompleteLearnerState> {
    const profile = (await this.getProfile(learnerId)) || {
      learner_id: learnerId,
      schema_version: PERSISTENCE_SCHEMA_VERSION,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      current_program: 'bxm',
      is_anonymous: true,
    };
    const entitlements = await this.getEntitlementState(learnerId);
    const attempts = await this.getAttempts(learnerId);
    const mastery = await this.getMasterySnapshots(learnerId);
    const rec = await this.getActiveRecommendation(learnerId);
    const history = await this.getActivityHistory(learnerId, 100);

    return {
      schema_version: PERSISTENCE_SCHEMA_VERSION,
      profile,
      entitlements,
      attempts,
      mastery,
      active_recommendation: rec,
      history,
      exported_at: new Date().toISOString(),
    };
  }

  public async importState(state: CompleteLearnerState): Promise<boolean> {
    if (!state || typeof state !== 'object') return false;
    if (!state.schema_version || !state.profile || !state.profile.learner_id) {
      return false; // Invalid schema structure
    }

    try {
      await this.saveProfile(state.profile);
      if (state.entitlements) {
        await this.saveEntitlementState(state.entitlements);
      }
      if (Array.isArray(state.attempts)) {
        this.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(state.attempts));
      }
      if (Array.isArray(state.mastery)) {
        this.setItem(STORAGE_KEYS.MASTERY, JSON.stringify(state.mastery));
      }
      if (state.active_recommendation) {
        await this.saveRecommendation(state.active_recommendation);
      }
      if (Array.isArray(state.history)) {
        this.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(state.history));
      }
      return true;
    } catch {
      return false;
    }
  }

  public async clear(learnerId?: string): Promise<void> {
    if (!learnerId) {
      Object.values(STORAGE_KEYS).forEach((k) => this.removeItem(k));
      this.inMemoryCache = {};
    } else {
      // Clear specific learner items
      this.removeItem(STORAGE_KEYS.PROFILE);
      this.removeItem(STORAGE_KEYS.RECOMMENDATION);
      this.removeItem(STORAGE_KEYS.ENTITLEMENT);
    }
  }
}

export const persistenceService: PersistenceAdapter = new LocalStoragePersistenceAdapter();
