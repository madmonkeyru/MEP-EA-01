import type { Attempt } from '@mep-ea/domain';
import type { RemoteSyncAdapter, StringStorage } from './persistence';

/** Immutable completed snapshots. Failed writes stay queued for explicit retry/resolution. */
export class AttemptOutbox {
  private pending: Promise<unknown> = Promise.resolve();
  private key: string;
  constructor(private storage: StringStorage, private learnerId: string, private remote: RemoteSyncAdapter) {
    this.key = `mep-ea:v1:outbox:${encodeURIComponent(learnerId)}`;
  }
  private serialize<T>(action: () => Promise<T>) {
    const task = this.pending.then(action); this.pending = task.catch(() => undefined); return task;
  }
  private async read(): Promise<Attempt[]> {
    const raw = await this.storage.getItem(this.key);
    if (raw === null) return [];
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value) || value.some(a => !a || a.schemaVersion !== 1 || a.learnerId !== this.learnerId ||
      a.status !== 'submitted' || typeof a.id !== 'string')) throw new Error('Invalid attempt outbox');
    return value;
  }
  enqueue(attempt: Attempt): Promise<void> {
    return this.serialize(async () => {
      if (attempt.learnerId !== this.learnerId || attempt.status !== 'submitted') throw new Error('Completed owner attempt required');
      const entries = await this.read();
      const existing = entries.find(a => a.id === attempt.id);
      if (existing && JSON.stringify(existing) !== JSON.stringify(attempt)) throw new Error('Immutable outbox attempt conflict');
      if (!existing) await this.storage.setItem(this.key, JSON.stringify([...entries, attempt]));
    });
  }
  flush(): Promise<{ sent: number; pending: number }> {
    return this.serialize(async () => {
      const entries = await this.read(); let sent = 0;
      for (const attempt of entries) {
        try { await this.remote.push(attempt, `${attempt.learnerId}:${attempt.id}`); }
        catch { break; }
        await this.storage.setItem(this.key, JSON.stringify(entries.slice(++sent)));
      }
      return { sent, pending: entries.length - sent };
    });
  }
}
