import type { ProgramId } from './types';

export interface WizardCalendarEvent {
  programId: string;
  convocatoriaId: string;
  type: string;
  start?: string;
  end?: string;
  moduleId?: string;
  sourceUrl: string;
  verifiedOn: string;
}
const calendars = import.meta.glob<WizardCalendarEvent[]>('../../../../../content/calendar/*.json', { eager: true, import: 'default' });
export const calendarEvents = Object.values(calendars).flat();
export const costaRicaDay = (now = new Date()) => new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Costa_Rica', dateStyle: 'short' }).format(now);
export const formatCalendarDay = (day: string) => new Intl.DateTimeFormat('es-CR', { timeZone: 'UTC', dateStyle: 'medium' }).format(new Date(day + 'T00:00:00Z'));

export function wizardCalendar(program: ProgramId, levels: string[] = [], today = costaRicaDay(), events = calendarEvents) {
  const id = program === 'i-ii' ? 'i_ii_ciclo' : program === 'iii' ? 'iii_ciclo' : program;
  const relevant = events.filter(event => event.programId === id && (program !== 'edad' || !levels.length || !event.moduleId || levels.includes(event.moduleId === 'EDAD_1' ? '10' : '11')));
  const active = (type: string) => relevant.filter(event => event.type === type && event.start && (event.end || event.start) >= today).sort((a, b) => a.start!.localeCompare(b.start!));
  return { today, registration: active('registration')[0], exams: active('exam'), latest: relevant.filter(event => event.start).sort((a, b) => b.start!.localeCompare(a.start!))[0] };
}
