import { mkdir, readFile, writeFile, rename, unlink, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import type { AttemptRecord, DraftState } from '@mep-ea/api';
import { emptyDraftState, reviseDraft, type ContinuityRepository } from './continuity-repository';

const writers = new Map<string, Promise<unknown>>();
/** Single-process development persistence. Serialized atomic renames prevent partial visibility. */
export function createFileAttemptRepository(directory: string): ContinuityRepository {
  directory = resolve(directory);
  const filename = (owner: string, id: string) => resolve(directory, `${createHash('sha256').update(JSON.stringify([owner, id])).digest('hex')}.json`);
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
  return { find, insert(record) { return serialize(async () => {
      const existing = await find(record.attempt.learnerId, record.attempt.id);
      if (existing) return existing;
      await save(filename(record.attempt.learnerId, record.attempt.id), record);
      return record;
  }); },
  continuity(owner, derive) { return serialize(async () => {
    await mkdir(directory, { recursive: true });
    const records: AttemptRecord[] = [];
    for (const file of await readdir(directory)) {
      if (!/^[a-f0-9]{64}\.json$/.test(file)) continue;
      const record = JSON.parse(await readFile(resolve(directory, file), 'utf8')) as AttemptRecord;
      if (record.attempt.learnerId === owner) records.push(record);
    }
    const value = derive(records);
    await save(`${filename(owner, 'continuity')}.snapshot`, value); return value;
  }); },
  getDraft(owner, id) { return serialize(() => readDraft(owner, id)); },
  writeDraft(write, receivedAt) { return serialize(async () => {
    const state = await readDraft(write.attempt.learnerId, write.attempt.id);
    const result = reviseDraft(state, write, receivedAt);
    await save(draftPath(write.attempt.learnerId, write.attempt.id), state); return result;
  }); },
  };
}
