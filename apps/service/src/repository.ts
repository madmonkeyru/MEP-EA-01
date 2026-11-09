import { mkdir, readFile, writeFile, rename, unlink, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import type { AttemptRecord, DraftState } from '@mep-ea/api';
import type { TelemetryEvent } from '@mep-ea/analytics';
import { emptyDraftState, reviseDraft, type ContinuityRepository } from './continuity-repository';
import type { UserAccount, UserAccountRepository } from './auth';
import type { TelemetryRepository, TelemetryBatchResult, LongitudinalLearnerMetrics, OperationalDiagnostics } from './telemetry-repository';
import { deriveLongitudinalMetrics } from './longitudinal';

const writers = new Map<string, Promise<unknown>>();
/** Single-process development persistence. Serialized atomic renames prevent partial visibility. */
export function createFileAttemptRepository(directory: string): ContinuityRepository & UserAccountRepository & TelemetryRepository {
  directory = resolve(directory);
  const filename = (owner: string, id: string) => resolve(directory, `${createHash('sha256').update(JSON.stringify([owner, id])).digest('hex')}.json`);
  const userFilename = (id: string) => resolve(directory, `user_${createHash('sha256').update(id).digest('hex')}.json`);
  const usernameIndexFilename = (username: string) => resolve(directory, `username_${createHash('sha256').update(username.toLowerCase()).digest('hex')}.json`);
  const telemetryFilename = resolve(directory, 'telemetry_events.json');

  const find: ContinuityRepository['find'] = async (owner, id) => {
    try { return JSON.parse(await readFile(filename(owner, id), 'utf8')) as AttemptRecord; }
    catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null; throw error; }
  };
  function serialize<T>(action: () => Promise<T>): Promise<T> {
    const task = (writers.get(directory) ?? Promise.resolve()).then(action);
    writers.set(directory, task.catch(() => undefined)); return task;
  }
  async function save(target: string, value: unknown) {
    await mkdir(directory, { recursive: true });
    const temporary = `${target}.${randomUUID()}.tmp`;
    await writeFile(temporary, JSON.stringify(value), { flag: 'wx', mode: 0o600, flush: true });
    try { await rename(temporary, target); }
    catch (error) { await unlink(temporary).catch(() => undefined); throw error; }
  }
  const draftPath = (owner: string, id: string) => `${filename(owner, id)}.draft`;
  async function readDraft(owner: string, id: string): Promise<DraftState> {
    let state: DraftState;
    try { state = JSON.parse(await readFile(draftPath(owner, id), 'utf8')); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; state = emptyDraftState(); }
    state.completed = !!await find(owner, id); return state;
  }

  async function readTelemetry(): Promise<TelemetryEvent[]> {
    try {
      return JSON.parse(await readFile(telemetryFilename, 'utf8')) as TelemetryEvent[];
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
      throw error;
    }
  }

  async function getLearnerAttempts(owner: string): Promise<AttemptRecord[]> {
    await mkdir(directory, { recursive: true });
    const records: AttemptRecord[] = [];
    for (const file of await readdir(directory)) {
      if (!/^[a-f0-9]{64}\.json$/.test(file)) continue;
      try {
        const record = JSON.parse(await readFile(resolve(directory, file), 'utf8')) as AttemptRecord;
        if (record.attempt.learnerId === owner) records.push(record);
      } catch {
        // Ignore unreadable/corrupted files during development
      }
    }
    return records;
  }

  return { find, insert(record) { return serialize(async () => {
      const existing = await find(record.attempt.learnerId, record.attempt.id);
      if (existing) return existing;
      await save(filename(record.attempt.learnerId, record.attempt.id), record);
      return record;
  }); },
  continuity(owner, derive) { return serialize(async () => {
    const records = await getLearnerAttempts(owner);
    const value = derive(records);
    await save(`${filename(owner, 'continuity')}.snapshot`, value); return value;
  }); },
  getDraft(owner, id) { return serialize(() => readDraft(owner, id)); },
  writeDraft(write, receivedAt) { return serialize(async () => {
    const state = await readDraft(write.attempt.learnerId, write.attempt.id);
    const result = reviseDraft(state, write, receivedAt);
    await save(draftPath(write.attempt.learnerId, write.attempt.id), state); return result;
  }); },
  async findById(id: string): Promise<UserAccount | null> {
    try {
      return JSON.parse(await readFile(userFilename(id), 'utf8')) as UserAccount;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw error;
    }
  },
  async findByUsername(username: string): Promise<UserAccount | null> {
    try {
      const idRecord = JSON.parse(await readFile(usernameIndexFilename(username), 'utf8')) as { id: string };
      return this.findById(idRecord.id);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw error;
    }
  },
  create(account: UserAccount) { return serialize(async () => {
    const existing = await this.findByUsername(account.username);
    if (existing) throw new Error('Username already exists');
    await save(userFilename(account.id), account);
    await save(usernameIndexFilename(account.username), { id: account.id });
    return account;
  }); },
  updateTier(id: string, tier: 'free' | 'premium') { return serialize(async () => {
    const existing = await this.findById(id);
    if (!existing) return null;
    const updated: UserAccount = { ...existing, tier, updatedAt: new Date().toISOString() };
    await save(userFilename(id), updated);
    return updated;
  }); },
  recordTelemetry(events: TelemetryEvent[]): Promise<TelemetryBatchResult> {
    return serialize(async () => {
      const existing = await readTelemetry();
      const existingIds = new Set(existing.map(e => e.id));
      const existingIdempotency = new Set(existing.filter(e => e.idempotencyKey).map(e => e.idempotencyKey!));

      let accepted = 0;
      let duplicate = 0;
      let rejected = 0;
      const toAdd: TelemetryEvent[] = [];

      for (const evt of events) {
        if (!evt || !evt.id || !evt.name) {
          rejected++;
          continue;
        }
        if (existingIds.has(evt.id) || (evt.idempotencyKey && existingIdempotency.has(evt.idempotencyKey))) {
          duplicate++;
          continue;
        }
        existingIds.add(evt.id);
        if (evt.idempotencyKey) existingIdempotency.add(evt.idempotencyKey);
        toAdd.push(evt);
        accepted++;
      }

      if (toAdd.length > 0) {
        await save(telemetryFilename, [...existing, ...toAdd]);
      }
      return { accepted, duplicate, rejected };
    });
  },
  async getTelemetryCount(): Promise<number> {
    const events = await readTelemetry();
    return events.length;
  },
  async getLongitudinalMetrics(learnerId: string): Promise<LongitudinalLearnerMetrics> {
    const records = await getLearnerAttempts(learnerId);
    return deriveLongitudinalMetrics(learnerId, records);
  },
  async getDiagnostics(): Promise<OperationalDiagnostics['storage']> {
    await mkdir(directory, { recursive: true });
    let totalAttempts = 0;
    let activeDrafts = 0;
    for (const file of await readdir(directory)) {
      if (/^[a-f0-9]{64}\.json$/.test(file)) totalAttempts++;
      if (file.endsWith('.draft')) activeDrafts++;
    }
    const telemetryEvents = await readTelemetry();
    return {
      type: 'file_memory',
      connected: true,
      totalAttempts,
      totalTelemetryEvents: telemetryEvents.length,
      activeDrafts,
    };
  },
  };
}
