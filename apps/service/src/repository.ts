import { mkdir, readFile, writeFile, rename, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import type { AttemptRecord } from '@mep-ea/api';
import type { AttemptRepository } from './service';

const writers = new Map<string, Promise<unknown>>();
/** Single-process development persistence. Serialized atomic renames prevent partial visibility. */
export function createFileAttemptRepository(directory: string): AttemptRepository {
  directory = resolve(directory);
  const filename = (owner: string, id: string) => resolve(directory, `${createHash('sha256').update(JSON.stringify([owner, id])).digest('hex')}.json`);
  const find: AttemptRepository['find'] = async (owner, id) => {
    try { return JSON.parse(await readFile(filename(owner, id), 'utf8')) as AttemptRecord; }
    catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null; throw error; }
  };
  return { find, insert(record) {
    const task = (writers.get(directory) ?? Promise.resolve()).then(async () => {
      const existing = await find(record.attempt.learnerId, record.attempt.id);
      if (existing) return existing;
      await mkdir(directory, { recursive: true });
      const target = filename(record.attempt.learnerId, record.attempt.id);
      const temporary = `${target}.${randomUUID()}.tmp`;
      await writeFile(temporary, JSON.stringify(record), { flag: 'wx', mode: 0o600, flush: true });
      try { await rename(temporary, target); }
      catch (error) { await unlink(temporary).catch(() => undefined); throw error; }
      return record;
    });
    writers.set(directory, task.catch(() => undefined));
    return task;
  } };
}
