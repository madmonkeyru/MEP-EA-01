import { describe, it, expect } from 'vitest';
import type { AttemptEvent } from '../domain/types';
import {
  BxmProgressStorage,
  createMemoryStorageAdapter,
  PROGRESS_EVENTS_KEY,
} from '../storage/progressStorage';

describe('BXM Progress - Persistence Adapter & Legacy Migration', () => {
  function makeEvent(id: string): AttemptEvent {
    return {
      schemaVersion: '1.0.0',
      eventId: id,
      sessionId: 'sess-1',
      sessionKind: 'practice_evidence',
      mode: 'study',
      timestamp: '2026-03-15T12:00:00Z',
      itemId: 'item-1',
      primaryEvidenceKey: 'bxm/matematica/02-2026/geometry/A1.1',
      domain: 'geometry',
      provenance: 'authored_mastery',
      cognitiveLevel: 'reproduccion',
      difficulty: 1,
      selectedOption: 'A',
      correctAnswer: 'A',
      isCorrect: true,
      responseIndex: 0,
      hintsUsedBeforeResponse: 0,
    };
  }

  it('persists and retrieves events under namespaced storage', () => {
    const memory = createMemoryStorageAdapter();
    const storage = new BxmProgressStorage(memory);

    const ev1 = makeEvent('ev-1');
    storage.recordEvents([ev1]);

    const retrieved = storage.getEvents();
    expect(retrieved.length).toBe(1);
    expect(retrieved[0].eventId).toBe('ev-1');
    expect(memory.getItem(PROGRESS_EVENTS_KEY)).toBeDefined();
  });

  it('deduplicates identical event IDs on write', () => {
    const memory = createMemoryStorageAdapter();
    const storage = new BxmProgressStorage(memory);

    const ev1 = makeEvent('ev-1');
    storage.recordEvents([ev1, ev1]);

    const retrieved = storage.getEvents();
    expect(retrieved.length).toBe(1);
  });

  it('imports legacy baseline attempts tagging them as legacy_unknown', () => {
    const legacyAttempts = [
      {
        id: 'legacy-sess-1',
        timestamp: '2026-02-10T10:00:00Z',
        mode: 'simulation',
        programId: 'bxm',
        subjectId: 'matematicas',
        convocatoriaId: '2026-c2',
        session: {
          sessionId: 'legacy-sess-1',
          items: [
            {
              id: 101,
              code: 'GEO-001',
              area_id: 'geometry',
              correct_answer: 'B',
              spec: { evidence: 'A1.1' },
            },
          ],
          responses: {
            101: { selectedOption: 'B' },
          },
        },
      },
    ];

    const memory = createMemoryStorageAdapter({
      mep_ea_attempts: JSON.stringify(legacyAttempts),
    });

    const storage = new BxmProgressStorage(memory);
    const importedCount = storage.importLegacyBaselineAttempts('mep_ea_attempts');

    expect(importedCount).toBe(1);
    const events = storage.getEvents();
    expect(events.length).toBe(1);
    expect(events[0].provenance).toBe('legacy_unknown');
    expect(events[0].isCorrect).toBe(true);
    expect(events[0].primaryEvidenceKey).toBe('bxm/matematica/02-2026/geometry/A1.1');
  });
});
