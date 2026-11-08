import type { PracticeConfig, TestSession } from '../types';

/** Remediation reuses the result snapshot, including archived question sets. */
export function remediationConfig(session: TestSession, requestedIds: number[], label: string, stage: 'practice' | 'retest' = 'practice'): PracticeConfig | null {
  const ids = [...new Set(requestedIds)].filter(id => session.itemIds.includes(id) && session.items?.some(item => item.id === id));
  if (!ids.length) return null;
  return {
    ...session.config, mode: 'area', itemIds: ids, itemCount: ids.length,
    title: `${stage === 'retest' ? 'Comprobación sin ayudas' : 'Refuerzo'} · ${label}`,
    enableTimer: false, timerDurationMinutes: 0,
    remediation: { rootSessionId: session.config.remediation?.rootSessionId || session.sessionId, sourceSessionId: session.sessionId, stage, targetItemIds: ids, label },
  };
}

export function sameLearningContext(a: TestSession, b: TestSession) {
  const context = (config: PracticeConfig) => [config.programId || 'bxm', config.subjectId || 'matematicas', config.subprogramId || '', config.convocatoriaId || '2026-c2', config.reviewDraft || ''];
  return a.userId === b.userId && context(a.config).every((value, index) => value === context(b.config)[index]);
}

export function remediationComparison(session: TestSession, baseline: TestSession | null) {
  if (!baseline?.items || !session.config.remediation || !sameLearningContext(session, baseline)) return null;
  const ids = session.itemIds.filter(id => baseline.itemIds.includes(id));
  if (!ids.length || ids.length !== session.itemIds.length) return null;
  const score = (attempt: TestSession) => ids.filter(id => !!attempt.responses[id]?.selectedOption && attempt.responses[id]?.selectedOption === attempt.items?.find(item => item.id === id)?.correct_answer).length;
  return { total: ids.length, before: score(baseline), after: score(session) };
}
