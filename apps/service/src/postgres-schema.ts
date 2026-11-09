/** Forward-only P4 migration. Run explicitly before starting the host; never deletes learner data. */
export const schemaV1 = `
CREATE TABLE IF NOT EXISTS schema_migrations (version integer PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS attempts (
  learner_id text NOT NULL, attempt_id text NOT NULL, record jsonb NOT NULL,
  received_at timestamptz NOT NULL,
  PRIMARY KEY (learner_id, attempt_id),
  CHECK (record->'attempt'->>'learnerId' = learner_id),
  CHECK (record->'attempt'->>'id' = attempt_id),
  CHECK (record->'attempt'->>'status' = 'submitted')
);
CREATE OR REPLACE FUNCTION reject_completed_attempt_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Completed attempts are immutable'; END; $$;
DROP TRIGGER IF EXISTS completed_attempt_immutable ON attempts;
CREATE TRIGGER completed_attempt_immutable BEFORE UPDATE OR DELETE ON attempts
FOR EACH ROW EXECUTE FUNCTION reject_completed_attempt_mutation();
CREATE TABLE IF NOT EXISTS mastery_snapshots (
  snapshot_id bigserial PRIMARY KEY, learner_id text NOT NULL, generated_at timestamptz NOT NULL,
  snapshot jsonb NOT NULL, plan jsonb NOT NULL,
  CHECK (snapshot->>'learnerId' = learner_id), CHECK (plan->>'learnerId' = learner_id)
);
CREATE INDEX IF NOT EXISTS mastery_latest ON mastery_snapshots (learner_id, snapshot_id DESC);
CREATE TABLE IF NOT EXISTS attempt_drafts (
  learner_id text NOT NULL, attempt_id text NOT NULL, revision integer NOT NULL CHECK (revision > 0),
  record jsonb NOT NULL, PRIMARY KEY (learner_id, attempt_id),
  CHECK (record->'attempt'->>'learnerId' = learner_id),
  CHECK (record->'attempt'->>'id' = attempt_id),
  CHECK (record->'attempt'->>'status' = 'in_progress')
);
CREATE TABLE IF NOT EXISTS draft_conflicts (
  learner_id text NOT NULL, attempt_id text NOT NULL, conflict_id text NOT NULL,
  conflict jsonb NOT NULL, PRIMARY KEY (learner_id, attempt_id, conflict_id)
);
INSERT INTO schema_migrations(version) VALUES (1) ON CONFLICT DO NOTHING;
`;

/** Forward-only P5 migration for learner accounts & entitlement persistence. */
export const schemaV2 = `
CREATE TABLE IF NOT EXISTS auth_users (
  id text PRIMARY KEY,
  username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  tier text NOT NULL CHECK (tier IN ('free', 'premium')),
  roles jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS auth_users_username_lower ON auth_users (lower(username));
INSERT INTO schema_migrations(version) VALUES (2) ON CONFLICT DO NOTHING;
`;

/** Forward-only P8 migration for telemetry event ingestion, persistence hardening & operational observability. */
export const schemaV3 = `
CREATE TABLE IF NOT EXISTS telemetry_events (
  id text PRIMARY KEY,
  name text NOT NULL,
  stage text NOT NULL,
  platform text NOT NULL,
  anonymous_session_id text NOT NULL,
  learner_id text,
  occurred_at timestamptz NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  idempotency_key text,
  payload jsonb NOT NULL
);
CREATE INDEX IF NOT EXISTS telemetry_events_occurred_at ON telemetry_events (occurred_at DESC);
CREATE INDEX IF NOT EXISTS telemetry_events_stage_name ON telemetry_events (stage, name);
CREATE INDEX IF NOT EXISTS telemetry_events_anonymous_session ON telemetry_events (anonymous_session_id);
CREATE INDEX IF NOT EXISTS telemetry_events_learner ON telemetry_events (learner_id) WHERE learner_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS telemetry_events_idempotency ON telemetry_events (idempotency_key) WHERE idempotency_key IS NOT NULL;

-- Performance index hardening on attempts and attempt_drafts for longitudinal analytics & sync
CREATE INDEX IF NOT EXISTS attempts_received_at ON attempts (received_at DESC);
CREATE INDEX IF NOT EXISTS attempts_learner_received ON attempts (learner_id, received_at DESC);

INSERT INTO schema_migrations(version) VALUES (3) ON CONFLICT DO NOTHING;
`;
