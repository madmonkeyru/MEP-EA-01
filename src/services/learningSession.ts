import type { Group, Item, PracticeConfig, TestSession } from '../types';
import { dataService } from './dataService';
import { TestEngine } from './testEngine';

export const isExam = (config: PracticeConfig) => config.mode === 'simulation' || config.mode === 'dynamic_mock';
export const modeLabel = (config: PracticeConfig) => config.title || ({ simulation: 'Simulación completa', dynamic_mock: 'Simulación con distribución curricular', area: 'Práctica por área', topic: 'Práctica por tema', concept_drilldown: 'Práctica por concepto', random_practice: 'Práctica variada' }[config.mode]);
export const areaLabel = (area?: string) => ({ geometry: 'Geometría', functions: 'Relaciones y álgebra', statistics: 'Estadística y probabilidad' }[area || ''] || 'Todas las áreas');
export function scopeKey(config: PracticeConfig) {
  return JSON.stringify([config.programId || 'bxm', config.subjectId || 'matematicas', config.subprogramId || '', config.convocatoriaId || '2026-c2', config.mode, config.area || '', config.topic || '', config.conceptId || '', config.setId || '', config.itemIds || [], config.itemCount, config.enableTimer, config.timerDurationMinutes]);
}
export function prepareItems(config: PracticeConfig): Item[] {
  if (config.itemIds) return [...new Set(config.itemIds)].map(id => dataService.getItemById(id)).filter((item): item is Item => !!item);
  if (config.mode === 'simulation') {
    const pool = dataService.getSimulationItems(config.setId === 'all' ? 'set_1' : config.setId || 'set_1');
    return config.itemCount === 'all' ? pool : pool.slice(0, config.itemCount);
  }
  const pool = config.setId && config.setId !== 'all' ? dataService.getItemsBySet(config.setId) : dataService.getAllItems();
  return TestEngine.assemblePracticeSession(config, pool);
}
export function createSession(config: PracticeConfig, snapshotItems?: Item[], snapshotGroups?: Group[]): TestSession {
  const items = snapshotItems ? (config.itemIds || snapshotItems.map(item => item.id)).map(id => snapshotItems.find(item => item.id === id)).filter((item): item is Item => !!item) : prepareItems(config);
  const now = Date.now();
  const groups = snapshotGroups || [...new Set(items.flatMap(item => item.group_id ? [item.group_id] : []))].map(id => dataService.getGroupById(id)).filter(group => !!group);
  return { version: 2, sessionId: crypto.randomUUID(), userId: 'guest', config, items, groups,
    itemIds: items.map(item => item.id), responses: {}, flaggedItems: {}, checkedItems: {}, currentResponseIndex: 0,
    startTime: new Date(now).toISOString(), elapsedSeconds: 0, isCompleted: false,
    deadline: config.enableTimer ? now + config.timerDurationMinutes * 60000 : undefined, passingScore: dataService.getPassingScore() };
}
export function validSession(session: TestSession | null, userId: string): session is TestSession {
  return !!session && session.version === 2 && session.userId === userId && !session.isCompleted && !!session.config &&
    ['simulation', 'dynamic_mock', 'area', 'topic', 'random_practice', 'concept_drilldown'].includes(session.config.mode) &&
    Array.isArray(session.items) && session.items.length > 0 && Array.isArray(session.itemIds) && session.items.length === session.itemIds.length &&
    new Set(session.itemIds).size === session.itemIds.length &&
    session.items.every((item, index) => !!item && item.id === session.itemIds[index] && typeof item.stem === 'string' && !!item.options && typeof item.options === 'object' && ['A', 'B', 'C', 'D'].includes(item.correct_answer) && Array.isArray(item.solution_steps)) &&
    Number.isInteger(session.currentResponseIndex) && session.currentResponseIndex >= 0 && session.currentResponseIndex < session.items.length &&
    !!session.responses && typeof session.responses === 'object' && !!session.flaggedItems && typeof session.flaggedItems === 'object' &&
    Object.entries(session.responses).every(([id, response]) => session.itemIds.includes(Number(id)) && response && response.itemId === Number(id) && (response.selectedOption === null || ['A', 'B', 'C', 'D'].includes(response.selectedOption))) &&
    Number.isFinite(Date.parse(session.startTime)) && (!session.config.enableTimer || Number.isFinite(session.deadline));
}
export function calculatorRule(program: string, subject?: string, level?: string) {
  if (program === 'cico' || program === 'i_ii_ciclo') return subject === 'matematicas' ? 'Calculadora prohibida' : 'Matemáticas se evalúa sin calculadora';
  if (program === 'iii_ciclo') {
    if (subject === 'matematicas') return level === 'III_CICLO_7' ? 'Calculadora prohibida' : 'Calculadora sencilla: cuatro operaciones';
    if (subject === 'ciencias') return 'Calculadora científica no programable';
    return 'Calculadora: depende de la materia y del nivel';
  }
  return subject === 'matematicas' ? 'Calculadora no programable' : 'Consulta los materiales permitidos para cada materia';
}
