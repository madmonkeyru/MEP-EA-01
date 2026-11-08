import type { LevelId, ProgramId } from '../../services/onboarding/types';
import { formatCalendarDay, wizardCalendar } from '../../services/onboarding/calendar';

export function WizardDates({ program, levels }: { program: ProgramId; levels: LevelId[] }) {
  const dates = wizardCalendar(program, levels);
  return <section className="rounded-2xl border border-line bg-paper p-5 space-y-3" aria-label="Fechas para mi ruta">
    <h2 className="text-xl">Fechas para mi ruta</h2>
    <p className="text-sm text-muted">Referencia al {formatCalendarDay(dates.today)} · hora de Costa Rica. Fechas disponibles en los documentos incorporados; confirma actualizaciones con la DGEC.</p>
    <p>{dates.registration ? `Inscripción ${dates.registration.start! > dates.today ? 'próxima' : 'en curso'}: ${formatCalendarDay(dates.registration.start!)} – ${formatCalendarDay(dates.registration.end || dates.registration.start!)}.` : 'No hay una próxima fecha de inscripción disponible en los datos incorporados. No pagues tomando un plazo pasado como vigente.'}</p>
    <p>{dates.exams.length ? `Próximas pruebas: ${dates.exams.map(event => `${formatCalendarDay(event.start!)}${event.moduleId ? event.moduleId === 'EDAD_1' ? ' · Prueba 1' : ' · Prueba 2' : ''}`).join('; ')}.` : 'No hay fechas de próximas pruebas disponibles en los datos incorporados. Espera la publicación oficial; puedes avanzar con el estudio.'}</p>
    {dates.latest && <p className="text-sm text-muted">Última referencia del calendario: {dates.latest.convocatoriaId.replace(/^(\d{4})-c(\d)$/, '0$2-$1')} · verificada el {formatCalendarDay(dates.latest.verifiedOn)}.</p>}
    <a className="text-link" href={dates.registration?.sourceUrl || dates.exams[0]?.sourceUrl || 'https://dgec.mep.go.cr/calendario-anual/'} target="_blank" rel="noreferrer">Consultar calendario y avisos DGEC</a>
  </section>;
}
