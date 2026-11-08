import { describe, expect, it } from 'vitest';
import { costaRicaDay, wizardCalendar, type WizardCalendarEvent } from './calendar';

describe('wizard dates', () => {
  it('uses the Costa Rica calendar day around UTC midnight', () => {
    expect(costaRicaDay(new Date('2026-11-05T02:00:00Z'))).toBe('2026-11-04');
  });
  it('does not present old BXM exams as upcoming or invent the next year', () => {
    const result = wizardCalendar('bxm', [], '2026-11-05');
    expect(result.exams).toEqual([]);
    expect(result.registration).toBeUndefined();
    expect(result.latest).toBeDefined();
  });
  it('keeps the closing day open and filters EDAD parts', () => {
    const event = (type: string, moduleId: string, start: string, end?: string): WizardCalendarEvent => ({ programId: 'edad', convocatoriaId: '2026-c2', type, moduleId, start, end, verifiedOn: '2026-11-04', sourceUrl: 'https://dgec.mep.go.cr/' });
    const events = [event('registration', 'EDAD_1', '2026-11-01', '2026-11-05'), event('exam', 'EDAD_1', '2026-11-20'), event('exam', 'EDAD_2', '2026-11-21')];
    const result = wizardCalendar('edad', ['10'], '2026-11-05', events);
    expect(result.registration?.end).toBe('2026-11-05');
    expect(result.exams.map(item => item.moduleId)).toEqual(['EDAD_1']);
    expect(wizardCalendar('edad', ['10'], '2026-11-06', events).registration).toBeUndefined();
  });
});
