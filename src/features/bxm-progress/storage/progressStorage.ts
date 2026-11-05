import type { AttemptEvent } from '../domain/types';

export const PROGRESS_STORAGE_NAMESPACE = 'bxm-mvp-progress';
export const PROGRESS_EVENTS_KEY = `${PROGRESS_STORAGE_NAMESPACE}:v1:events`;
export const PROGRESS_ACTIVE_PROFILE_KEY = `${PROGRESS_STORAGE_NAMESPACE}:v1:active_profile`;

export interface StorageAdapter {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

export function createBrowserStorageAdapter(): StorageAdapter {
  return {
    getItem: (key: string) => {
      try {
        return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
      } catch {
        return null;
      }
    },
    setItem: (key: string, value: string) => {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(key, value);
        }
      } catch {
        // storage quota exceeded or disabled
      }
    },
    removeItem: (key: string) => {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(key);
        }
      } catch {
        // ignore
      }
    },
  };
}

export function createMemoryStorageAdapter(initialData: Record<string, string> = {}): StorageAdapter {
  const store = new Map<string, string>(Object.entries(initialData));
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
  };
}

export class BxmProgressStorage {
  private adapter: StorageAdapter;

  constructor(adapter?: StorageAdapter) {
    this.adapter = adapter || createBrowserStorageAdapter();
  }

  /**
   * Retrieves all persisted attempt events, deduplicated by eventId.
   */
  getEvents(): AttemptEvent[] {
    const raw = this.adapter.getItem(PROGRESS_EVENTS_KEY);
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      // Deduplicate exact event IDs defensively
      const seen = new Set<string>();
      const valid: AttemptEvent[] = [];

      for (const item of parsed) {
        if (
          item &&
          typeof item.eventId === 'string' &&
          typeof item.primaryEvidenceKey === 'string' &&
          typeof item.timestamp === 'string'
        ) {
          if (!seen.has(item.eventId)) {
            seen.add(item.eventId);
            valid.push(item as AttemptEvent);
          }
        }
      }

      return valid;
    } catch {
      return [];
    }
  }

  /**
   * Appends one or more attempt events, deduplicating against existing events.
   */
  recordEvents(newEvents: AttemptEvent[]): void {
    if (newEvents.length === 0) return;

    const existing = this.getEvents();
    const existingMap = new Map<string, AttemptEvent>();

    for (const ev of existing) {
      existingMap.set(ev.eventId, ev);
    }

    for (const ev of newEvents) {
      existingMap.set(ev.eventId, ev);
    }

    // Sort chronologically ascending
    const combined = Array.from(existingMap.values()).sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    this.adapter.setItem(PROGRESS_EVENTS_KEY, JSON.stringify(combined));
  }

  /**
   * Clears namespaced progress events without touching baseline keys.
   */
  clearEvents(): void {
    this.adapter.removeItem(PROGRESS_EVENTS_KEY);
  }

  /**
   * Legacy import adapter:
   * Inspects baseline 'mep_ea_attempts' from localStorage, converting sessions into
   * AttemptEvent records tagged with provenance: 'legacy_unknown' and eligibility: 'unknown'.
   * This makes historical sessions visible in history without contaminating official mastery indices.
   */
  importLegacyBaselineAttempts(baselineAttemptsKey = 'mep_ea_attempts'): number {
    const raw = this.adapter.getItem(baselineAttemptsKey);
    if (!raw) return 0;

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return 0;

      const importedEvents: AttemptEvent[] = [];

      for (const att of parsed) {
        if (!att || typeof att.id !== 'string') continue;
        const session = att.session;
        if (!session || !session.responses) continue;

        const items = session.items || [];
        const responses = session.responses || {};

        for (const item of items) {
          const resp = responses[item.id];
          if (!resp || !resp.selectedOption) continue;

          const isCorrect = resp.selectedOption === item.correct_answer;
          const domain = (item.area_id === 'geometry' || item.area_id === 'functions' || item.area_id === 'statistics')
            ? item.area_id
            : (item.code?.toLowerCase().includes('geo') ? 'geometry' : item.code?.toLowerCase().includes('alg') ? 'functions' : 'statistics');

          const rawCode = item.spec?.evidence || 'general';
          const primaryEvidenceKey = `bxm/matematica/02-2026/${domain}/${rawCode}`;

          importedEvents.push({
            schemaVersion: '1.0.0',
            eventId: `legacy-import-${att.id}-${item.id}`,
            sessionId: att.id,
            sessionKind: att.mode === 'simulation' ? 'simulation_benchmark' : 'practice_topic',
            mode: att.mode === 'simulation' ? 'exam' : 'study',
            timestamp: att.timestamp || new Date().toISOString(),
            itemId: String(item.id),
            primaryEvidenceKey,
            domain,
            provenance: 'legacy_unknown', // Excluded from official mastery per CONSOLIDATED DECISIONS
            reviewStatus: 'unreviewed',
            cognitiveLevel: item.cognitive_level || 'reproduccion',
            difficulty: (item.difficulty_tier as 1 | 2 | 3) || 1,
            selectedOption: resp.selectedOption,
            correctAnswer: item.correct_answer,
            isCorrect,
            responseIndex: 0,
            hintsUsedBeforeResponse: 0,
            exposureFlags: {
              isBenchmarkItem: att.convocatoriaId === '2026-c2',
              hasSeenExplanationBefore: false,
            },
          });
        }
      }

      if (importedEvents.length > 0) {
        this.recordEvents(importedEvents);
      }

      return importedEvents.length;
    } catch {
      return 0;
    }
  }
}
