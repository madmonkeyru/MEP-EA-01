import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { createPostgresRepository, migratePostgres } from './postgres';
import { p4RepositoryContract } from '../test/p4-contract';

const connectionString = process.env.MEP_TEST_DATABASE_URL;
describe.skipIf(!connectionString)('P4 real PostgreSQL', () => {
  const schema = `p4_${randomUUID().replaceAll('-', '')}`;
  const admin = new Pool({ connectionString });
  const pool = new Pool({ connectionString, options: `-c search_path=${schema}`, max: 10 });
  const otherProcessPool = new Pool({ connectionString, options: `-c search_path=${schema}`, max: 10 });
  let alternate = false;
  beforeAll(async () => {
    await admin.query(`CREATE SCHEMA ${schema}`);
    await migratePostgres(pool); await migratePostgres(otherProcessPool);
  });
  afterAll(async () => {
    await pool.end(); await otherProcessPool.end();
    await admin.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`); await admin.end();
  });
  p4RepositoryContract(async () => { alternate = !alternate; return createPostgresRepository(alternate ? pool : otherProcessPool); });
  it('enforces completed immutability in SQL, stores snapshots and contains no credentials', async () => {
    const record = (await pool.query('SELECT record FROM attempts LIMIT 1')).rows[0].record;
    await expect(pool.query('UPDATE attempts SET record=record WHERE learner_id=$1', [record.attempt.learnerId])).rejects.toThrow('immutable');
    await expect(pool.query('DELETE FROM attempts WHERE learner_id=$1', [record.attempt.learnerId])).rejects.toThrow('immutable');
    expect(Number((await pool.query('SELECT count(*) AS n FROM mastery_snapshots')).rows[0].n)).toBeGreaterThan(0);
    for (const table of ['attempts', 'mastery_snapshots', 'attempt_drafts', 'draft_conflicts']) {
      const rows = (await pool.query(`SELECT row_to_json(t)::text AS payload FROM ${table} t`)).rows;
      expect(rows.every(r => !r.payload.includes('p4-fixture-token') && !r.payload.includes('accessToken'))).toBe(true);
    }
    const columns = (await pool.query('SELECT column_name FROM information_schema.columns WHERE table_schema=$1', [schema])).rows;
    expect(columns.every(r => !/token|password|credential/.test(r.column_name))).toBe(true);
  });
});
