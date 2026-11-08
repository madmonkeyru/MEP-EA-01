import type { Attempt } from '@mep-ea/domain';
import { attemptKey, type StringStorage } from '@mep-ea/learning-runtime';
import { ApiError, type PlatformApi } from './index';
import type { DraftRecord, DraftState, DraftWrite } from './contracts';

/** Optional Web/Expo seam. Commit local recovery before touching the network; never auto-merge remote conflicts. */
export class DraftSynchronizer {
  private pending: Promise<unknown> = Promise.resolve();
  private key: string;
  constructor(private storage: StringStorage, private learnerId: string, private deviceId: string,
    private api: Pick<PlatformApi, 'saveDraft'>) {
    this.key = `mep-ea:v1:draft-sync:${encodeURIComponent(learnerId)}`;
  }
  private serialize<T>(action: () => Promise<T>): Promise<T> {
    const result = this.pending.then(action); this.pending = result.catch(() => undefined); return result;
  }
  save(attempt: Attempt, baseRevision?: number) { return this.serialize(async () => {
    if (attempt.learnerId !== this.learnerId || attempt.status !== 'in_progress') throw new Error('Owned in-progress draft required');
    await this.storage.setItem(attemptKey(this.learnerId, attempt.id), JSON.stringify(attempt));
    const key = `${this.key}:${encodeURIComponent(attempt.id)}`;
    const raw = await this.storage.getItem(key);
    const previous = raw ? JSON.parse(raw) as { revision: number } : null;
    const write: DraftWrite = { schemaVersion: 1, attempt, baseRevision: baseRevision ?? previous?.revision ?? 0, deviceId: this.deviceId };
    await this.storage.setItem(key, JSON.stringify({ revision: write.baseRevision, write }));
    return this.push(key, write);
  }); }
  flush(attemptId: string) { return this.serialize(async () => {
    const key = `${this.key}:${encodeURIComponent(attemptId)}`;
    const raw = await this.storage.getItem(key);
    const saved = raw ? JSON.parse(raw) as { write?: DraftWrite } : null;
    return saved?.write ? this.push(key, saved.write) : null;
  }); }
  async getConflict(attemptId: string): Promise<DraftState | null> {
    const raw = await this.storage.getItem(`${this.key}:${encodeURIComponent(attemptId)}:conflict`);
    return raw ? JSON.parse(raw) as DraftState : null;
  }
  private async push(key: string, write: DraftWrite): Promise<DraftRecord | null> {
    try {
      const record = await this.api.saveDraft(write);
      await this.storage.setItem(key, JSON.stringify({ revision: record.revision }));
      // Retain earlier conflicts until explicitly reconciled by the caller.
      return record;
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) await this.storage.setItem(`${key}:conflict`, JSON.stringify(error.body));
      return null;
    }
  }
}
