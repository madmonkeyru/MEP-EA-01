/** Existing keys are retained until their owning repository has a tested migration. */
export const STORAGE_KEYS = {
  user: 'mep_ea_user',
  profiles: 'mep_local_profiles',
  attempts: 'mep_ea_attempts',
  activeSession: 'mep_ea_active_session',
  subscription: 'mep_ea_subscription_tier',
  legacyTelemetry: 'mep_ea_telemetry_events',
  telemetry: 'mep_ea_telemetry_events_v1',
  anonymousUser: 'mep_ea_anon_user_id',
  telemetrySession: 'mep_ea_session_id',
  progressEvents: 'bxm-mvp-progress:v1:events',
  progressProfile: 'bxm-mvp-progress:v1:active_profile',
  learningPrefix: 'bxm-mvp-progress:v1:learning:',
  readingList: 'mep_reading_list',
  lastSubject: 'mep_last_subject',
  theme: 'mep_ea_01_theme',
  remediationPrefix: 'mep_ea_active_remediation_plan:',
} as const;

export const PERSISTENCE_KEYS = {
  PROFILE: 'mep_ea_learner_profile_v1', ATTEMPTS: 'mep_ea_learner_attempts_v1',
  MASTERY: 'mep_ea_learner_mastery_v1', RECOMMENDATION: 'mep_ea_learner_rec_v1',
  ENTITLEMENT: 'mep_ea_learner_entitlement_v1', HISTORY: 'mep_ea_learner_history_v1',
  LEGACY_USER: STORAGE_KEYS.user, LEGACY_ATTEMPTS: STORAGE_KEYS.attempts,
  LEGACY_SUBSCRIPTION: STORAGE_KEYS.subscription,
} as const;

export const STORAGE_POLICY = {
  schemaVersion: 1,
  migration: 'Copy and validate before switching readers; retain original history.',
  quota: 'Report failure to the learner; never evict attempts or active sessions.',
} as const;

export const learningStorageKey = (userId: string) => STORAGE_KEYS.learningPrefix + encodeURIComponent(userId);
