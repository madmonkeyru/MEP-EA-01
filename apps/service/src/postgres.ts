import { Pool, type PoolClient } from 'pg';
import type { AttemptRecord, DraftRecord, DraftConflict, DraftState } from '@mep-ea/api';
import { reviseDraft, type ContinuityRepository } from './continuity-repository';
import { schemaV1, schemaV2 } from './postgres-schema';
import type { UserAccount, UserAccountRepository } from './auth';

export function createPostgresPool(connectionString: string): Pool {
  const pool = new Pool({ connectionString, connectionTimeoutMillis: 5000, statement_timeout: 10000 });
  // Idle socket failures must not crash the offline-first host or expose connection credentials.
  pool.on('error', () => console.error('PostgreSQL idle connection unavailable'));
  return pool;
}
async function transaction<T>(pool: Pool, learnerId: string, action: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN ISOLATION LEVEL READ COMMITTED');
    // Shared lock namespace for completed writes, projections and drafts, across processes.
    await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))', [learnerId]);
    const result = await action(client);
    await client.query('COMMIT'); return result;
  } catch (error) { await client.query('ROLLBACK').catch(() => undefined); throw error; }
  finally { client.release(); }
}
export async function migratePostgres(pool: Pool): Promise<void> {
  await transaction(pool, 'mep-schema-migration', async client => {
    await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (version integer PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())');
    const v1 = await client.query('SELECT version FROM schema_migrations WHERE version = 1');
    if (!v1.rowCount) await client.query(schemaV1);
    const v2 = await client.query('SELECT version FROM schema_migrations WHERE version = 2');
    if (!v2.rowCount) await client.query(schemaV2);
  });
}
async function readDraft(client: PoolClient, owner: string, id: string): Promise<DraftState> {
  const draft = await client.query<{ record: DraftRecord }>('SELECT record FROM attempt_drafts WHERE learner_id=$1 AND attempt_id=$2', [owner, id]);
  const conflicts = await client.query<{ conflict: DraftConflict }>('SELECT conflict FROM draft_conflicts WHERE learner_id=$1 AND attempt_id=$2 ORDER BY conflict_id', [owner, id]);
  const completed = await client.query('SELECT 1 FROM attempts WHERE learner_id=$1 AND attempt_id=$2', [owner, id]);
  return { schemaVersion: 1, draft: draft.rows[0]?.record ?? null, conflicts: conflicts.rows.map(r => r.conflict), completed: !!completed.rowCount };
}
/** JSON payloads are normalized by the service; SQL keys, constraints and locks enforce durable ownership/revisions. */
export function createPostgresRepository(pool: Pool): ContinuityRepository & UserAccountRepository {
  return {
    async find(owner, id) {
      const result = await pool.query<{ record: AttemptRecord }>('SELECT record FROM attempts WHERE learner_id=$1 AND attempt_id=$2', [owner, id]);
      return result.rows[0]?.record ?? null;
    },
    insert(record) { return transaction(pool, record.attempt.learnerId, async client => {
      const { learnerId, id } = record.attempt;
      await client.query('INSERT INTO attempts(learner_id,attempt_id,record,received_at) VALUES($1,$2,$3,$4) ON CONFLICT (learner_id,attempt_id) DO NOTHING',
        [learnerId, id, JSON.stringify(record), record.receivedAt]);
      // Separate READ COMMITTED statement sees a competing committed insert; never update immutable rows.
      const result = await client.query<{ record: AttemptRecord }>('SELECT record FROM attempts WHERE learner_id=$1 AND attempt_id=$2', [learnerId, id]);
      return result.rows[0].record;
    }); },
    continuity(owner, derive) { return transaction(pool, owner, async client => {
      const records = await client.query<{ record: AttemptRecord }>('SELECT record FROM attempts WHERE learner_id=$1 ORDER BY attempt_id', [owner]);
      const value = derive(records.rows.map(r => r.record));
      await client.query('INSERT INTO mastery_snapshots(learner_id,generated_at,snapshot,plan) VALUES($1,$2,$3,$4)',
        [owner, value.mastery.generatedAt, JSON.stringify(value.mastery), JSON.stringify(value.plan)]);
      return value;
    }); },
    getDraft(owner, id) { return transaction(pool, owner, client => readDraft(client, owner, id)); },
    writeDraft(write, receivedAt) { return transaction(pool, write.attempt.learnerId, async client => {
      const { learnerId, id } = write.attempt;
      const state = await readDraft(client, learnerId, id);
      const result = reviseDraft(state, write, receivedAt);
      if (result.accepted) {
        await client.query('INSERT INTO attempt_drafts(learner_id,attempt_id,revision,record) VALUES($1,$2,$3,$4) ON CONFLICT (learner_id,attempt_id) DO UPDATE SET revision=EXCLUDED.revision,record=EXCLUDED.record',
          [learnerId, id, result.record.revision, JSON.stringify(result.record)]);
      } else for (const conflict of result.state.conflicts) {
        await client.query('INSERT INTO draft_conflicts(learner_id,attempt_id,conflict_id,conflict) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING',
          [learnerId, id, conflict.id, JSON.stringify(conflict)]);
      }
      return result;
    }); },
    async findByUsername(username: string): Promise<UserAccount | null> {
      const res = await pool.query<{ id: string; username: string; password_hash: string; tier: 'free' | 'premium'; roles: ('learner' | 'content_admin' | 'platform_admin')[]; created_at: string; updated_at: string }>(
        'SELECT id, username, password_hash, tier, roles, created_at, updated_at FROM auth_users WHERE lower(username) = lower($1)',
        [username]
      );
      if (!res.rowCount) return null;
      const row = res.rows[0];
      return {
        id: row.id,
        username: row.username,
        passwordHash: row.password_hash,
        tier: row.tier,
        roles: row.roles,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    },
    async findById(id: string): Promise<UserAccount | null> {
      const res = await pool.query<{ id: string; username: string; password_hash: string; tier: 'free' | 'premium'; roles: ('learner' | 'content_admin' | 'platform_admin')[]; created_at: string; updated_at: string }>(
        'SELECT id, username, password_hash, tier, roles, created_at, updated_at FROM auth_users WHERE id = $1',
        [id]
      );
      if (!res.rowCount) return null;
      const row = res.rows[0];
      return {
        id: row.id,
        username: row.username,
        passwordHash: row.password_hash,
        tier: row.tier,
        roles: row.roles,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    },
    async create(account: UserAccount): Promise<UserAccount> {
      await pool.query(
        'INSERT INTO auth_users(id, username, password_hash, tier, roles, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6, $7)',
        [account.id, account.username, account.passwordHash, account.tier, JSON.stringify(account.roles), account.createdAt, account.updatedAt]
      );
      return account;
    },
    async updateTier(id: string, tier: 'free' | 'premium'): Promise<UserAccount | null> {
      const res = await pool.query<{ id: string; username: string; password_hash: string; tier: 'free' | 'premium'; roles: ('learner' | 'content_admin' | 'platform_admin')[]; created_at: string; updated_at: string }>(
        'UPDATE auth_users SET tier=$1, updated_at=now() WHERE id=$2 RETURNING id, username, password_hash, tier, roles, created_at, updated_at',
        [tier, id]
      );
      if (!res.rowCount) return null;
      const row = res.rows[0];
      return {
        id: row.id,
        username: row.username,
        passwordHash: row.password_hash,
        tier: row.tier,
        roles: row.roles,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    },
  };
}
