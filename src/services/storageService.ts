import type { User, Attempt, TestSession, PracticeConfig } from '../types';
import { scopeKey, validSession } from './learningSession';
const KEYS = { user: 'mep_ea_user', attempts: 'mep_ea_attempts', active: 'mep_ea_active_session' };
class StorageService {
  lastError = '';
  private read<T>(key: string, fallback: T): T {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; }
    catch { return fallback; }
  }
  private write(key: string, value: unknown): boolean {
    try { if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, JSON.stringify(value)); this.lastError = ''; return true; }
    catch { this.lastError = 'No se pudo guardar en este navegador. Conserva la página abierta y descarga tu resumen al terminar.'; return false; }
  }
  getCurrentUser(): User | null {
    const user = this.read<User | null>(KEYS.user, null);
    return user && typeof user.id === 'string' && typeof user.name === 'string' ? user : null;
  }
  getProfiles(): User[] { const values = this.read<User[]>('mep_local_profiles', []); return Array.isArray(values) ? values.filter(user => user && typeof user.id === 'string' && typeof user.name === 'string') : []; }
  setCurrentUser(user: User | null) {
    if (user && !this.write('mep_local_profiles', [user, ...this.getProfiles().filter(profile => profile.id !== user.id)])) return false;
    return this.write(KEYS.user, user);
  }
  getAttempts(): Attempt[] {
    const entries = this.read<Attempt[]>(KEYS.attempts, []);
    // The earlier interactive release only stored BXM Mathematics 02-2026 attempts.
    // Retain those summaries; do not invent question snapshots for them.
    return Array.isArray(entries) ? entries.filter(a => a && typeof a.id === 'string' && Number.isFinite(a.scorePercentage)).map(a => ({ ...a,
      programId: a.programId || 'bxm', subjectId: a.subjectId || 'matematicas', convocatoriaId: a.convocatoriaId || '2026-c2' })) : [];
  }
  getContextAttempts(config?: Partial<PracticeConfig>, userId = this.getCurrentUser()?.id || 'guest') {
    return this.getAttempts().filter(a => a.userId === userId && (!config?.programId || a.programId === config.programId) &&
      (!config?.subjectId || a.subjectId === config.subjectId) && (!config?.convocatoriaId || a.convocatoriaId === config.convocatoriaId));
  }
  saveAttempt(attempt: Attempt) { return this.write(KEYS.attempts, [attempt, ...this.getAttempts().filter(a => a.id !== attempt.id)]); }
  saveResult(session: TestSession) {
    const items = session.items || [];
    const correctCount = items.filter(item => session.responses[item.id]?.selectedOption === item.correct_answer).length;
    return this.saveAttempt({ id: session.sessionId, userId: session.userId, timestamp: session.completedAt || new Date().toISOString(),
      mode: session.config.mode, programId: session.config.programId, subjectId: session.config.subjectId, convocatoriaId: session.config.convocatoriaId,
      scopeKey: scopeKey(session.config), scopeText: session.config.title || (session.config.mode === 'simulation' ? 'Simulación completa' : 'Práctica'),
      scorePercentage: items.length ? Math.round(correctCount / items.length * 100) : 0, correctCount, totalItems: items.length,
      durationSeconds: session.elapsedSeconds, responses: session.responses, session });
  }
  getResult(id?: string, userId = this.getCurrentUser()?.id || 'guest') {
    const session = this.getAttempts().find(a => a.id === id && a.userId === userId)?.session;
    return session?.isCompleted && validSession({ ...session, isCompleted: false }, userId) ? session : null;
  }
  deleteAttempt(id: string) { return this.write(KEYS.attempts, this.getAttempts().filter(a => a.id !== id || a.userId !== (this.getCurrentUser()?.id || 'guest'))); }
  clearAttempts() { return this.write(KEYS.attempts, null); }
  private activeKey(userId: string) { return KEYS.active + (userId === 'guest' ? '' : ':' + userId); }
  getActiveSession(userId = this.getCurrentUser()?.id || 'guest'): TestSession | null {
    const saved = this.read<TestSession | null>(this.activeKey(userId), null);
    return saved && saved.userId === userId && saved.config && Array.isArray(saved.itemIds) && typeof saved.sessionId === 'string' ? saved : null;
  }
  saveActiveSession(session: TestSession) { return this.write(this.activeKey(session.userId), session); }
  clearActiveSession(userId = this.getCurrentUser()?.id || 'guest') { return this.write(this.activeKey(userId), null); }
  calculatePerformanceLevel(attempts: Attempt[]) {
    if (!attempts.length) return { scoreAverage: 0, color: '#9ca3af', description: 'Sin intentos registrados' };
    const recent = attempts.slice(0, 5);
    const avg = recent.reduce((sum, a) => sum + a.scorePercentage, 0) / recent.length;
    return { scoreAverage: Math.round(avg), color: `hsl(${Math.round(avg / 100 * 120)}, 85%, 42%)`, description: avg < 60 ? 'Sigue reforzando tus conocimientos' : avg < 75 ? 'Progresando' : 'Buen avance' };
  }
}
export const storageService = new StorageService();
