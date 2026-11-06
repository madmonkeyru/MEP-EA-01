import { SessionRunner, type SessionSnapshot } from '../bxm-assessment/sessionRunner';
import type { SessionResultExport } from '../bxm-assessment/types';
import { BxmProgressStorage, createBrowserStorageAdapter, type StorageAdapter } from '../bxm-progress/storage/progressStorage';
import type { LearningCompletion } from '../bxm-progress/domain/types';
import { BXM_OFFICIAL_EVIDENCES_FIXTURE } from '../bxm-progress/ui/evidenceCatalogFixture';
import { toProgressEvents } from './contracts';

export interface LessonActivity {
  eventId: string;
  quizId: string;
  evidenceKey: string;
  selectedOption: string;
  isCorrect: boolean;
  timestamp: string;
  responseIndex?: number;
}

export interface StoredLessonCompletion {
  lessonId: string;
  completedAt: string;
  quizPassed?: boolean;
}

interface LearningDocument {
  version: 1;
  userId: string;
  subjectId: 'matematica';
  specId: '02-2026';
  active?: SessionSnapshot;
  results: SessionResultExport[];
  activities: LessonActivity[];
  completedLessons?: StoredLessonCompletion[];
  exposedItemIds?: string[];
}
export const learningKey = (userId: string) => `bxm-mvp-progress:v1:learning:${encodeURIComponent(userId)}`;

/** Session records are the recovery journal; the progress event sink is idempotent. */
export class BxmLearningStore {
  readonly progress: BxmProgressStorage;
  lastError = '';
  private corrupt = false;
  private document: LearningDocument;
  constructor(readonly userId: string, private adapter: StorageAdapter = createBrowserStorageAdapter()) {
    if (!userId) throw new Error('Learner is required');
    this.progress = new BxmProgressStorage(adapter, { userId });
    this.document = { version: 1, userId, subjectId: 'matematica', specId: '02-2026', results: [], activities: [] };
    try {
      const raw = adapter.getItem(learningKey(userId));
      if (raw) {
        const saved: LearningDocument = JSON.parse(raw);
        if (saved.version !== 1 || saved.userId !== userId || saved.subjectId !== 'matematica' || saved.specId !== '02-2026' ||
          !Array.isArray(saved.results) || !Array.isArray(saved.activities) ||
          (saved.exposedItemIds !== undefined && (!Array.isArray(saved.exposedItemIds) || saved.exposedItemIds.some(id => typeof id !== 'string')))) throw new Error('Invalid learning journal');
        if (saved.active) SessionRunner.restore(saved.active);
        for (const result of saved.results) {
          if (!result.isFinalized || !Number.isFinite(result.firstResponseScorePercentage) || !Number.isFinite(Date.parse(result.completedAt))) throw new Error('Invalid stored result');
          toProgressEvents(result, userId);
        }
        if (saved.activities.some(a => !validActivity(a))) throw new Error('Invalid stored activity');
        this.document = saved;
      }
    } catch {
      this.corrupt = true;
      this.lastError = 'No se pudo leer el aprendizaje guardado. Los datos existentes se conservan; puedes continuar en memoria y descargar el resultado.';
    }
  }
  getActive(): SessionSnapshot | undefined { return this.document.active && structuredClone(this.document.active); }
  getResults(): SessionResultExport[] { return structuredClone(this.document.results); }
  getActivities(): LessonActivity[] { return structuredClone(this.document.activities); }
  getResult(id?: string): SessionResultExport | undefined { return this.getResults().find(r => r.sessionId === id); }
  getExposedItemIds(): string[] { return [...(this.document.exposedItemIds || [])]; }
  markExposed(itemId: string): boolean {
    this.document.exposedItemIds = [...new Set([...(this.document.exposedItemIds || []), itemId])];
    return this.write();
  }
  saveActive(runner: SessionRunner): boolean {
    if (runner.isFinished()) return false;
    this.document.active = runner.snapshot();
    if (runner.policy.allowImmediateFeedback && runner.policy.mode === 'study') {
      this.document.exposedItemIds = [...new Set([...(this.document.exposedItemIds || []),
        ...runner.getAllItemStates().filter(s => s.firstResponse !== null).map(s => String(s.item.id))])];
    }
    return this.write();
  }
  discardActive(): boolean { delete this.document.active; return this.write(); }
  complete(result: SessionResultExport): boolean {
    toProgressEvents(result, this.userId); // Validate before mutating the recovery journal.
    const previous = this.document.results.find(r => r.sessionId === result.sessionId);
    if (previous && JSON.stringify(previous) !== JSON.stringify(result)) {
      this.lastError = 'El resultado entra en conflicto con otro registro del mismo intento.'; return false;
    }
    if (!previous) this.document.results.unshift(structuredClone(result));
    if (this.document.active?.sessionId === result.sessionId) delete this.document.active;
    const saved = this.write();
    const synced = saved ? this.reconcile() : false;
    return saved && synced;
  }
  recordActivity(activity: LessonActivity): boolean {
    if (!validActivity(activity)) { this.lastError = 'No se registró una comprobación con metadatos incompletos.'; return false; }
    if (!this.document.activities.some(a => a.eventId === activity.eventId)) this.document.activities.push(structuredClone(activity));
    return this.write();
  }
  getCompletedLessons(): StoredLessonCompletion[] {
    return structuredClone(this.document.completedLessons || []);
  }
  isLessonCompleted(lessonId: string): boolean {
    return (this.document.completedLessons || []).some(l => l.lessonId === lessonId);
  }
  recordLessonCompletion(lessonId: string, quizPassed = true): boolean {
    if (!lessonId) return false;
    const existing = (this.document.completedLessons || []).filter(l => l.lessonId !== lessonId);
    this.document.completedLessons = [
      ...existing,
      {
        lessonId,
        completedAt: new Date().toISOString(),
        quizPassed,
      },
    ];
    return this.write();
  }
  /** Replays persisted results after a previous interruption between journal and event writes. */
  reconcile(): boolean {
    try {
      const events = this.document.results.flatMap(r => toProgressEvents(r, this.userId));
      if (!events.length) return true;
      if (!this.progress.recordEvents(events)) { this.lastError = this.progress.lastError; return false; }
      return true;
    } catch { this.lastError = 'No se pudo actualizar el progreso de este perfil.'; return false; }
  }
  retrySave(): boolean { const saved = this.write(); return saved && this.reconcile(); }
  private write(): boolean {
    if (this.corrupt) return false;
    try { this.adapter.setItem(learningKey(this.userId), JSON.stringify(this.document)); this.lastError = ''; return true; }
    catch { this.lastError = 'No se pudo guardar en este navegador. Mantén la página abierta y descarga el resultado antes de salir.'; return false; }
  }
  getCompletions(): LearningCompletion[] {
    const results: LearningCompletion[] = this.document.results.map(r => ({ sessionId: r.sessionId, completedAt: r.completedAt, answeredCount: r.totalAnswered, status: r.status }));
    const quizzes = new Map<string, LessonActivity>();
    for (const a of this.document.activities) {
      if (a.responseIndex !== 0) continue;
      const sessionId = a.eventId.replace(/-evt-\d+$/, '');
      if (!quizzes.has(sessionId)) quizzes.set(sessionId, a);
    }
    return [...results, ...[...quizzes].map(([sessionId, a]) => ({ sessionId, completedAt: a.timestamp, answeredCount: 1, status: 'completed' as const }))];
  }
}
function validActivity(value: LessonActivity): boolean {
  return !!value && typeof value.eventId === 'string' && typeof value.quizId === 'string' &&
    BXM_OFFICIAL_EVIDENCES_FIXTURE.some(e => e.key === value.evidenceKey) &&
    /^[ABCD]$/.test(value.selectedOption) && typeof value.isCorrect === 'boolean' && Number.isFinite(Date.parse(value.timestamp)) &&
    (value.responseIndex === undefined || (Number.isInteger(value.responseIndex) && value.responseIndex >= 0));
}
