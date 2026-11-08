import { STORAGE_KEYS } from '../../../services/storageRegistry';
import type { AttemptEvent } from '../domain/types';
import { isAttemptEvent } from '../domain/validateAttempt';

export const PROGRESS_STORAGE_NAMESPACE = 'bxm-mvp-progress';
export const PROGRESS_EVENTS_KEY = STORAGE_KEYS.progressEvents;
export const PROGRESS_ACTIVE_PROFILE_KEY = STORAGE_KEYS.progressProfile;
export interface StorageAdapter {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}
export interface ProgressScope { userId: string }
export function createBrowserStorageAdapter(): StorageAdapter {
  return {
    getItem: key => typeof localStorage === 'undefined' ? null : localStorage.getItem(key),
    setItem: (key, value) => {
      if (typeof localStorage === 'undefined') throw new Error('Storage unavailable');
      localStorage.setItem(key, value);
    },
    removeItem: key => { if (typeof localStorage !== 'undefined') localStorage.removeItem(key); },
  };
}
export function createMemoryStorageAdapter(initialData: Record<string, string> = {}): StorageAdapter {
  const store = new Map(Object.entries(initialData));
  return { getItem: key => store.get(key) ?? null, setItem: (key, value) => { store.set(key, value); }, removeItem: key => { store.delete(key); } };
}
export class BxmProgressStorage {
  lastError = '';
  rejectedRecordCount = 0;
  lastImport = { imported: 0, skipped: 0, summaryOnly: 0 };
  private key: string;
  private quarantined: unknown[] = [];
  constructor(private adapter: StorageAdapter = createBrowserStorageAdapter(), private scope: ProgressScope = { userId: 'guest' }) {
    if (!scope.userId) throw new Error('A learner scope is required');
    this.key = scope.userId === 'guest' ? PROGRESS_EVENTS_KEY : `${PROGRESS_EVENTS_KEY}:user:${encodeURIComponent(scope.userId)}`;
  }
  getEvents(): AttemptEvent[] {
    this.lastError = ''; this.quarantined = []; this.rejectedRecordCount = 0;
    try {
      const raw = this.adapter.getItem(this.key);
      if (!raw) return [];
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error('Invalid progress storage format');
      const seen = new Set<string>();
      const events: AttemptEvent[] = [];
      for (const value of parsed) {
        if (!isAttemptEvent(value) || (value.userId ?? 'guest') !== this.scope.userId) {
          this.quarantined.push(value); this.rejectedRecordCount++; continue;
        }
        if (!seen.has(value.eventId)) { seen.add(value.eventId); events.push({ ...value, userId: this.scope.userId }); }
      }
      return events;
    } catch {
      this.lastError = 'No se pudo leer el progreso local. Los datos existentes se conservan.';
      return [];
    }
  }
  recordEvents(newEvents: AttemptEvent[]): boolean {
    const existing = this.getEvents();
    if (this.lastError) return false;
    if (newEvents.some(e => !isAttemptEvent(e) || (e.userId ?? 'guest') !== this.scope.userId)) {
      this.lastError = 'No se guardaron respuestas con metadatos o perfil inválidos.'; return false;
    }
    const events = new Map(existing.map(e => [e.eventId, e]));
    for (const event of newEvents) {
      const scoped = { ...event, userId: this.scope.userId };
      const previous = events.get(event.eventId);
      if (previous && JSON.stringify(previous) !== JSON.stringify(scoped)) {
        this.lastError = 'Se detectó un identificador de respuesta en conflicto.'; return false;
      }
      events.set(event.eventId, scoped);
    }
    try {
      const sorted = [...events.values()].sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp) || a.eventId.localeCompare(b.eventId));
      this.adapter.setItem(this.key, JSON.stringify([...this.quarantined, ...sorted]));
      return true;
    } catch { this.lastError = 'No se pudo guardar el progreso en este navegador.'; return false; }
  }
  clearEvents(): boolean {
    try { this.adapter.removeItem(this.key); this.lastError = ''; return true; }
    catch { this.lastError = 'No se pudo borrar el progreso de este perfil.'; return false; }
  }
  importLegacyBaselineAttempts(baselineAttemptsKey = 'mep_ea_attempts'): number {
    this.lastImport = { imported: 0, skipped: 0, summaryOnly: 0 };
    try {
      const raw = this.adapter.getItem(baselineAttemptsKey);
      if (!raw) return 0;
      const attempts = JSON.parse(raw);
      if (!Array.isArray(attempts)) return 0;
      const events: AttemptEvent[] = [];
      for (const att of attempts) {
        if (!att || (att.userId ?? 'guest') !== this.scope.userId || att.programId !== 'bxm' ||
          !['matematica', 'matematicas'].includes(att.subjectId) || att.convocatoriaId !== '2026-c2' ||
          !Number.isFinite(Date.parse(att.timestamp)) || typeof att.id !== 'string') { this.lastImport.skipped++; continue; }
        if (!att.session?.items || !att.session?.responses) { this.lastImport.summaryOnly++; continue; }
        for (const item of att.session.items) {
          const response = att.session.responses[item.id];
          if (!response?.selectedOption) continue;
          const event: AttemptEvent = {
            schemaVersion: '1.0.0', userId: this.scope.userId, programId: 'bxm', subjectId: 'matematica', specId: '02-2026',
            eventId: `legacy-import-${att.id}-${item.id}`, sessionId: att.id,
            sessionKind: att.mode === 'simulation' ? 'simulation_benchmark' : 'practice_topic', mode: att.mode === 'simulation' ? 'exam' : 'study',
            timestamp: att.timestamp, itemId: String(item.id), primaryEvidenceKey: `bxm/matematica/02-2026/${item.area_id}/${item.spec?.evidence}`,
            domain: item.area_id, provenance: 'legacy_unknown', reviewStatus: 'unreviewed',
            cognitiveLevel: item.cognitive_level || 'reproduccion', difficulty: item.difficulty_tier || 1,
            selectedOption: response.selectedOption, correctAnswer: item.correct_answer, isCorrect: response.selectedOption === item.correct_answer,
            responseIndex: 0, hintsUsedBeforeResponse: 0,
            // Assistance was not captured in legacy sessions; legacy_unknown excludes mastery.
          };
          if (isAttemptEvent(event)) events.push(event); else this.lastImport.skipped++;
        }
      }
      const oldIds = new Set(this.getEvents().map(e => e.eventId));
      const fresh = events.filter(e => !oldIds.has(e.eventId));
      if (fresh.length && !this.recordEvents(fresh)) return 0;
      this.lastImport.imported = fresh.length;
      return fresh.length;
    } catch { this.lastError = 'No se pudo importar el historial anterior.'; return 0; }
  }
}
