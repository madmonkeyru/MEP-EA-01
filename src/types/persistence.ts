import type { UserTier } from '../services/entitlementService';

export const PERSISTENCE_SCHEMA_VERSION = 1;

export interface LearnerProfile {
  learner_id: string;
  schema_version: number;
  created_at: string;
  updated_at: string;
  display_name?: string;
  current_program: string;
  preferred_domain?: string;
  is_anonymous: boolean;
  metadata?: Record<string, unknown>;
}

export interface LearnerAttemptRecord {
  attempt_id: string;
  session_id: string;
  learner_id: string;
  program_id: string;
  subject_id: string;
  activity_type: 'diagnostic' | 'practice' | 'mock_exam' | 'reference_exam' | 'retest' | 'study_session';
  evidence_id?: string;
  score_percentage: number;
  correct_count: number;
  total_questions: number;
  time_spent_seconds: number;
  completed_at: string;
}

export interface MasterySnapshot {
  learner_id: string;
  program_id: string;
  evidence_id: string;
  domain: string;
  tier: 'Dominada' | 'En progreso' | 'Necesita práctica';
  accuracy_rate: number;
  qualifying_attempts_count: number;
  last_evaluated_at: string;
}

export interface RecommendationRecord {
  recommendation_id: string;
  learner_id: string;
  activity_type: 'lesson' | 'practice' | 'retest' | 'diagnostic' | 'simulation';
  target_id: string;
  reason: string;
  priority: number;
  cta_label: string;
  created_at: string;
  dismissed_at?: string;
  completed_at?: string;
}

export interface EntitlementState {
  learner_id: string;
  tier: UserTier;
  granted_at: string;
  expires_at?: string | null;
  source: 'default' | 'simulated' | 'purchased';
}

export interface ActivityHistoryEntry {
  entry_id: string;
  learner_id: string;
  program_id: string;
  activity_type: string;
  title: string;
  duration_seconds: number;
  timestamp: string;
  details?: Record<string, unknown>;
}

export interface CompleteLearnerState {
  schema_version: number;
  profile: LearnerProfile;
  entitlements: EntitlementState;
  attempts: LearnerAttemptRecord[];
  mastery: MasterySnapshot[];
  active_recommendation?: RecommendationRecord | null;
  history: ActivityHistoryEntry[];
  exported_at?: string;
}

export interface PersistenceAdapter {
  getProfile(learnerId?: string): Promise<LearnerProfile | null>;
  saveProfile(profile: LearnerProfile): Promise<void>;
  getAttempts(learnerId: string): Promise<LearnerAttemptRecord[]>;
  saveAttempt(attempt: LearnerAttemptRecord): Promise<void>;
  getMasterySnapshots(learnerId: string): Promise<MasterySnapshot[]>;
  saveMasterySnapshot(snapshot: MasterySnapshot): Promise<void>;
  getActiveRecommendation(learnerId: string): Promise<RecommendationRecord | null>;
  saveRecommendation(recommendation: RecommendationRecord): Promise<void>;
  getEntitlementState(learnerId: string): Promise<EntitlementState>;
  saveEntitlementState(entitlement: EntitlementState): Promise<void>;
  getActivityHistory(learnerId: string, limit?: number): Promise<ActivityHistoryEntry[]>;
  recordActivity(entry: ActivityHistoryEntry): Promise<void>;
  exportState(learnerId: string): Promise<CompleteLearnerState>;
  importState(state: CompleteLearnerState): Promise<boolean>;
  clear(learnerId?: string): Promise<void>;
}
