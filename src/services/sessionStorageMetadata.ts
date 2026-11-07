import type { PracticeConfig, TestSession } from '../types';

export function scopeKey(config: PracticeConfig) {
  return JSON.stringify([config.programId || 'bxm', config.subjectId || 'matematicas', config.subprogramId || '', config.convocatoriaId || '2026-c2', config.mode, config.area || '', config.topic || '', config.conceptId || '', config.setId || '', config.itemIds || [], config.itemCount, config.enableTimer, config.timerDurationMinutes, ...(config.reviewDraft ? [config.reviewDraft] : []), ...(config.difficultyTier === undefined ? [] : [config.difficultyTier]), ...(config.remediation ? [config.remediation.stage, config.remediation.rootSessionId] : [])]);
}
export function validSession(session: TestSession | null, userId: string): session is TestSession {
  return !!session && session.version === 2 && session.userId === userId && !session.isCompleted && !!session.config &&
    ['simulation', 'dynamic_mock', 'diagnostic', 'area', 'topic', 'random_practice', 'concept_drilldown'].includes(session.config.mode) &&
    Array.isArray(session.items) && session.items.length > 0 && Array.isArray(session.itemIds) && session.items.length === session.itemIds.length &&
    new Set(session.itemIds).size === session.itemIds.length &&
    session.items.every((item, index) => !!item && item.id === session.itemIds[index] && typeof item.stem === 'string' && !!item.options && typeof item.options === 'object' && ['A', 'B', 'C', 'D'].includes(item.correct_answer) && Array.isArray(item.solution_steps)) &&
    Number.isInteger(session.currentResponseIndex) && session.currentResponseIndex >= 0 && session.currentResponseIndex < session.items.length &&
    !!session.responses && typeof session.responses === 'object' && !!session.flaggedItems && typeof session.flaggedItems === 'object' &&
    Object.entries(session.responses).every(([id, response]) => session.itemIds.includes(Number(id)) && response && response.itemId === Number(id) && (response.selectedOption === null || ['A', 'B', 'C', 'D'].includes(response.selectedOption))) &&
    Number.isFinite(Date.parse(session.startTime)) && (!session.config.enableTimer || Number.isFinite(session.deadline));
}
