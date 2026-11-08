import { beforeEach, describe, expect, it } from 'vitest';
import { dataService } from './dataService';
import { createSession, isExam } from './learningSession';
import { remediationConfig, remediationComparison } from './legacyRemediation';
import { scopeKey } from './sessionStorageMetadata';
import { generateRemediationPlan, saveActiveRemediationPlan, getActiveRemediationPlan } from './remediationEngine';
import { readRoute, routeHash } from './navigation';

beforeEach(async () => { localStorage.clear(); await dataService.setProgram('bxm', undefined, '2026-c2'); });
describe('remediation identity and boundaries', () => {
  it('deduplicates and limits targets to the result snapshot while retaining exam context', () => {
    const snapshot = createSession({ mode: 'area', itemCount: 2, enableTimer: false, timerDurationMinutes: 0 });
    const session = { ...snapshot, config: { ...snapshot.config, programId: 'bxm', subjectId: 'matematicas', subprogramId: 'test-level', convocatoriaId: '2026-c1', reviewDraft: 'cico-2026-c2' as const } };
    const id = session.itemIds[0];
    const practice = remediationConfig(session, [id, id, -1], 'Tema')!;
    expect(practice.itemIds).toEqual([id]);
    expect(practice).toMatchObject({ programId: 'bxm', subprogramId: 'test-level', convocatoriaId: '2026-c1', reviewDraft: 'cico-2026-c2' });
    const attempt = { ...session, sessionId: 'practice', config: practice, itemIds: [id], items: session.items!.filter(item => item.id === id) };
    const retest = remediationConfig(attempt, [id], 'Tema', 'retest')!;
    expect(retest.remediation).toMatchObject({ rootSessionId: session.sessionId, sourceSessionId: 'practice', stage: 'retest' });
    expect(isExam(retest)).toBe(true);
    expect(scopeKey(retest)).not.toBe(scopeKey(practice));
  });
  it('does not create empty activities or compare across profiles, levels or unavailable origins', () => {
    const baseline = createSession({ mode: 'area', itemCount: 2, enableTimer: false, timerDurationMinutes: 0 });
    expect(remediationConfig(baseline, [-999], 'Fuera del intento')).toBeNull();
    const config = remediationConfig(baseline, baseline.itemIds, 'Tema', 'retest')!;
    const result = { ...baseline, config };
    expect(remediationComparison(result, null)).toBeNull();
    expect(remediationComparison(result, { ...baseline, userId: 'other' })).toBeNull();
    expect(remediationComparison(result, { ...baseline, config: { ...baseline.config, subprogramId: 'other-level' } })).toBeNull();
    expect(remediationComparison(result, baseline)).toEqual({ total: 2, before: 0, after: 0 });
  });
  it('does not invent weaknesses for unmeasured domains and scopes saved plans by learner', () => {
    const session = createSession({ mode: 'area', itemCount: 1, enableTimer: false, timerDurationMinutes: 0, area: 'geometry' });
    const plan = generateRemediationPlan({ ...session, userId: 'learner-a' });
    expect(plan.domainSummaries.map(domain => domain.domain)).toEqual(['geometry']);
    saveActiveRemediationPlan(plan);
    expect(getActiveRemediationPlan('learner-a')?.sessionId).toBe(session.sessionId);
    expect(getActiveRemediationPlan('learner-b')).toBeNull();
  });
  it('preserves the source result when a learner reloads a guided lesson link', () => {
    const route = { view: 'learning' as const, programId: 'bxm', subjectId: 'matematicas', convocatoriaId: '2026-c2', tab: 'temario', evidenceKey: 'bxm/matematica/02-2026/geometry/A1.2', sourceSessionId: 'diagnostic-root' };
    expect(readRoute(routeHash(route))).toMatchObject(route);
  });
});
