import { ScheduleBadge } from '../common/StatusBadge';
import React from 'react';
import { Calendar, Clock, ExternalLink, MapPin, UserCheck } from 'lucide-react';
import { calendarStatus } from './OfficialCalendar';

interface CalendarEvent {
  programId: string;
  convocatoriaId: string;
  type: string;
  sourceUrl: string;
  verifiedOn: string;
  moduleId?: string;
  start?: string;
  end?: string;
  sessions?: { subject: string; startTime: string; endTime: string }[];
}

const annualCalendars = import.meta.glob<CalendarEvent[]>('../../../../../content/calendar/*.json', {
  eager: true,
  import: 'default',
});
const allEvents = Object.values(annualCalendars).flat();

const displayDate = new Intl.DateTimeFormat('es-CR', { timeZone: 'UTC', dateStyle: 'medium' });
const localDay = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Costa_Rica', dateStyle: 'short' });
const formatDay = (date: string) => displayDate.format(new Date(date + 'T00:00:00Z'));

export const DynamicMilestoneBanner: React.FC<{
  programId?: string;
  convocatoriaId?: string;
  subjectFilter?: string;
}> = ({
  programId = 'bxm',
  convocatoriaId = '2026-c2',
  subjectFilter = 'Matemáticas',
}) => {
  const today = localDay.format(new Date());

  const programEvents = allEvents.filter(
    e => e.programId === programId && e.convocatoriaId === convocatoriaId
  );

  // Find math-specific exam session if available
  const mathExamEvent = programEvents.find(
    e => e.type === 'exam' && e.sessions?.some(s => s.subject.toLowerCase().includes(subjectFilter.toLowerCase()))
  ) || programEvents.find(e => e.type === 'exam');

  const registrationEvent = programEvents.find(e => e.type === 'registration');
  const sitesEvent = programEvents.find(e => e.type === 'sites');

  const mathSession = mathExamEvent?.sessions?.find(s =>
    s.subject.toLowerCase().includes(subjectFilter.toLowerCase())
  );

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900/90 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-stone-100 pb-3 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <Calendar className="size-4 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-sm font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Hitos y Fechas Oficiales MEP · Convocatoria {convocatoriaId.replace(/^(\d{4})-c(\d)$/, '0$2-$1')}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Registration */}
        <div className="rounded-xl border border-stone-100 bg-stone-50/70 p-3.5 dark:border-stone-800/80 dark:bg-stone-800/40 space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
              <UserCheck className="size-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Matrícula</span>
            </span>
            <ScheduleBadge status={calendarStatus(today, registrationEvent?.start, registrationEvent?.end)} />
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-400">
            {registrationEvent?.start && registrationEvent?.end
              ? `${formatDay(registrationEvent.start)} – ${formatDay(registrationEvent.end)}`
              : 'Fecha por confirmar'}
          </p>
        </div>

        {/* Sites */}
        <div className="rounded-xl border border-stone-100 bg-stone-50/70 p-3.5 dark:border-stone-800/80 dark:bg-stone-800/40 space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
              <MapPin className="size-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Sedes</span>
            </span>
            <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">
              {sitesEvent?.start && today >= sitesEvent.start ? 'Publicadas' : 'Por publicar'}
            </span>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-400">
            {sitesEvent?.start ? formatDay(sitesEvent.start) : 'Fecha por confirmar'}
          </p>
        </div>

        {/* Math Exam Application */}
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5 dark:border-indigo-950/60 dark:bg-indigo-950/20 space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
              <Clock className="size-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Examen {subjectFilter}</span>
            </span>
            <ScheduleBadge status={calendarStatus(today, mathExamEvent?.start, mathExamEvent?.end)} />
          </div>
          <p className="text-xs text-indigo-800 dark:text-indigo-300">
            {mathExamEvent?.start && <span className="block">{formatDay(mathExamEvent.start)}</span>}
            {mathSession ? `${mathSession.startTime} – ${mathSession.endTime} hrs (${mathSession.subject})` : 'Horario oficial DGEC'}
          </p>
        </div>
      </div>

      {mathExamEvent?.sourceUrl && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500 dark:text-stone-400 pt-1">
          <span>Última actualización: {formatDay(programEvents.map(event => event.verifiedOn).sort().at(-1)!)}</span>
          <a
            href={mathExamEvent.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            <span>Aviso DGEC</span>
            <ExternalLink className="size-3" />
          </a>
        </div>
      )}
    </div>
  );
};
