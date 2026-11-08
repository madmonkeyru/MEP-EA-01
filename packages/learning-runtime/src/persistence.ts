import type { Attempt } from '@mep-ea/domain';

export interface PersistenceAdapter {
  load(key: string): Promise<unknown | null>;
  save(key: string, value: Attempt): Promise<void>;
  remove(key: string): Promise<void>;
}
/** Remote synchronization is an explicit port. P0 never silently sends learner data. */
export interface RemoteSyncAdapter { push(attempt: Attempt, idempotencyKey: string): Promise<void> }
export interface StringStorage {
  getItem(key: string): string | null | Promise<string | null>;
  setItem(key: string, value: string): void | Promise<void>;
  removeItem(key: string): void | Promise<void>;
}
export function createLocalAdapter(storage: StringStorage): PersistenceAdapter {
  return {
    async load(key) { const raw = await storage.getItem(key); return raw === null ? null : JSON.parse(raw); },
    async save(key, value) { await storage.setItem(key, JSON.stringify(value)); },
    async remove(key) { await storage.removeItem(key); },
  };
}
export function createMemoryAdapter(): PersistenceAdapter {
  const data = new Map<string, string>();
  return createLocalAdapter({ getItem: key => data.get(key) ?? null, setItem: (key, value) => { data.set(key, value); }, removeItem: key => { data.delete(key); } });
}
export function attemptKey(learnerId: string, attemptId: string) {
  return `mep-ea:v1:attempts:${encodeURIComponent(learnerId)}:${encodeURIComponent(attemptId)}`;
}
