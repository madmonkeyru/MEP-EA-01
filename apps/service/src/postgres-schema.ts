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
