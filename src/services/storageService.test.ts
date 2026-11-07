import { describe, it, expect, beforeEach } from 'vitest';
import { storageService } from './storageService';
import { Attempt, User } from '../types';

describe('StorageService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('manages current user in localStorage', () => {
    expect(storageService.getCurrentUser()).toBeNull();
    const user: User = { id: 'u1', name: 'Estudiante Test', email: 'test@mep.cr' };
    storageService.setCurrentUser(user);
    expect(storageService.getCurrentUser()).toEqual(user);
    storageService.setCurrentUser(null);
    expect(storageService.getCurrentUser()).toBeNull();
  });

  it('saves and retrieves attempt history', () => {
    expect(storageService.getAttempts()).toEqual([]);
    const attempt: Attempt = {
      id: 'att-1',
      userId: 'u1',
      timestamp: new Date().toISOString(),
      mode: 'simulation',
      scopeText: 'Simulación Completa (60 ítems)',
      scorePercentage: 85,
      correctCount: 51,
      totalItems: 60,
      durationSeconds: 5400,
      responses: {},
    };
    storageService.saveAttempt(attempt);
    const saved = storageService.getAttempts();
    expect(saved.length).toBe(1);
    expect(saved[0].id).toBe('att-1');
  });

  it('bulk deletes only results in the selected profile and context', () => {
    const base: Attempt = { id: 'current', userId: 'guest', timestamp: new Date().toISOString(), mode: 'simulation', scopeText: 'Test', scorePercentage: 80, correctCount: 48, totalItems: 60, durationSeconds: 100, responses: {}, programId: 'bxm', subjectId: 'matematicas', convocatoriaId: '2026-c2' };
    for (const attempt of [base, { ...base, id: 'other-profile', userId: 'u1' }, { ...base, id: 'other-call', convocatoriaId: '2026-c1' }, { ...base, id: 'other-subject', subjectId: 'espanol' }]) storageService.saveAttempt(attempt);
    expect(storageService.deleteContextAttempts({ programId: 'bxm', subjectId: 'matematicas', convocatoriaId: '2026-c2' })).toBe(true);
    expect(storageService.getAttempts().map(attempt => attempt.id).sort()).toEqual(['other-call', 'other-profile', 'other-subject']);
  });

  it('calculates performance level with green-to-red color gradient', () => {
    expect(storageService.calculatePerformanceLevel([]).color).toBe('#9ca3af');

    const highAttempt: Attempt = {
      id: 'att-1',
      userId: 'u1',
      timestamp: new Date().toISOString(),
      mode: 'simulation',
      scopeText: 'Simulación',
      scorePercentage: 100,
      correctCount: 60,
      totalItems: 60,
      durationSeconds: 3000,
      responses: {},
    };

    const lowAttempt: Attempt = {
      ...highAttempt,
      id: 'att-2',
      scorePercentage: 0,
      correctCount: 0,
    };

    const greenPerf = storageService.calculatePerformanceLevel([highAttempt]);
    expect(greenPerf.color).toContain('hsl(120');

    const redPerf = storageService.calculatePerformanceLevel([lowAttempt]);
    expect(redPerf.color).toContain('hsl(0');
  });

  it('records and summarizes telemetry funnel events', () => {
    storageService.clearTelemetryEvents();
    expect(storageService.getTelemetryEvents()).toHaveLength(0);

    storageService.logTelemetryEvent('goal_selected', { goal: 'bxm_pass' });
    storageService.logTelemetryEvent('diagnostic_started', { questions: 8 });
    storageService.logTelemetryEvent('diagnostic_completed', { score: 75 });
    storageService.logTelemetryEvent('remediation_started', { topic: 'Circunferencia' });
    storageService.logTelemetryEvent('retry_clicked');

    const stats = storageService.getTelemetryFunnelStats();
    expect(stats.totalEvents).toBe(5);
    expect(stats.goalSelected).toBe(1);
    expect(stats.diagnosticStarted).toBe(1);
    expect(stats.diagnosticCompleted).toBe(1);
    expect(stats.remediationStarted).toBe(1);
    expect(stats.retryClicked).toBe(1);
  });
});
