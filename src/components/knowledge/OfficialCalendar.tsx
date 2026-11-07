import { useState, useId } from 'react';
import { ScheduleBadge } from '../common/StatusBadge';
import {
  Calendar as CalendarIcon,
  Clock,
  ExternalLink,
  ChevronDown,
  UserCheck,
  MapPin,
  GraduationCap,
  Sparkles,
  LayoutGrid,
  ListOrdered,
  CalendarDays,
  AlertCircle
} from 'lucide-react';

export type CalendarEvent = {
  programId: string;
  convocatoriaId: string;
  type: string;
  sourceUrl: string;
  verifiedOn: string;
  moduleId?: string;
  start?: string;
  end?: string;
  sessions?: { subject: string; startTime: string; endTime: string }[];
};

const annualCalendars = import.meta.glob<CalendarEvent[]>('../../../content/calendar/*.json', { eager: true, import: 'default' });
const calendar = Object.values(annualCalendars).flat();
const convocatorias = [...new Set(calendar.map(event => event.convocatoriaId))].sort().reverse();
const convocatoriaLabel = (id: string) => id.replace(/^(\d{4})-c(\d)$/, '0$2-$1');

const programs: Record<string, string> = {
  bxm: 'Bachillerato por Madurez',
  i_ii_ciclo: 'I y II Ciclo',
  iii_ciclo: 'III Ciclo',
  edad: 'Educación Diversificada a Distancia',
};

const programShortLabels: Record<string, string> = {
  bxm: 'BXM',
  i_ii_ciclo: 'I y II Ciclo',
  iii_ciclo: 'III Ciclo',
  edad: 'EDAD',
};

const eventLabels: Record<string, string> = {
  registration: 'Inscripción',
  sites: 'Publicación de sedes',
  exam: 'Aplicación de pruebas',
  results: 'Resultados',
};

const statusLabels: Record<string, string> = {
  upcoming: 'Próximo',
  open: 'En curso',
  past: 'Pasado',
  pending: 'Fecha por confirmar',
};

const localDay = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Costa_Rica', dateStyle: 'short' });
const displayDate = new Intl.DateTimeFormat('es-CR', { timeZone: 'UTC', dateStyle: 'medium' });
const formatDay = (date: string) => displayDate.format(new Date(date + 'T00:00:00Z'));

export function calendarStatus(today: string, start?: string, end = start) {
  if (!start || !end) return 'pending';
  if (today < start) return 'upcoming';
  return today > end ? 'past' : 'open';
}

function getEventIcon(type: string) {
  switch (type) {
    case 'registration':
      return UserCheck;
    case 'sites':
      return MapPin;
    case 'exam':
      return GraduationCap;
    default:
      return CalendarIcon;
  }
}

export function OfficialCalendar({ initialProgram = '', initialConvocatoria = '' }: {
  initialProgram?: string;
  initialConvocatoria?: string;
}) {
  const [program, setProgram] = useState(initialProgram in programs ? initialProgram : '');
  const [convocatoria, setConvocatoria] = useState(convocatorias.includes(initialConvocatoria) ? initialConvocatoria : convocatorias[0] || '');
  const today = localDay.format(new Date());
  const [status, setStatus] = useState('all');
  const [type, setType] = useState('');
  const [month, setMonth] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');

  const filterSummaryId = useId();

  // All events matching the current criteria
  const events = calendar
    .filter(
      event =>
        (!program || event.programId === program) &&
        event.convocatoriaId === convocatoria &&
        (!type || event.type === type) &&
        (!month || event.start?.slice(0, 7) === month) &&
        (status === 'all' || calendarStatus(today, event.start, event.end) === status)
    )
    .sort((a, b) => (a.start || '9999').localeCompare(b.start || '9999'));

  // Distinct months in the current convocatoria for month filter
  const availableMonths = [
    ...new Set(
      calendar
        .filter(event => event.convocatoriaId === convocatoria)
        .flatMap(event => (event.start ? [event.start.slice(0, 7)] : []))
    ),
  ].sort();

  // Highlighted next upcoming / open milestones for this convocatoria and program selection
  const activeOrUpcomingEvents = calendar
    .filter(
      event =>
        (!program || event.programId === program) &&
        event.convocatoriaId === convocatoria &&
        ['open', 'upcoming'].includes(calendarStatus(today, event.start, event.end))
    )
    .sort((a, b) => (a.start || '9999').localeCompare(b.start || '9999'));

  const primaryMilestones = activeOrUpcomingEvents.slice(0, 3);

  // Group events by month for timeline view
  const eventsByMonth = events.reduce((acc, event) => {
    const monthKey = event.start ? event.start.slice(0, 7) : 'Sin fecha';
    if (!acc[monthKey]) acc[monthKey] = [];
    acc[monthKey].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  const resetFilters = () => {
    setProgram('');
    setType('');
    setStatus('all');
    setMonth('');
  };

  const hasActiveFilters = Boolean(program || type || status !== 'all' || month);

  return (
    <section
      className="ui-surface rounded-2xl sm:rounded-3xl p-5 sm:p-8 space-y-6 border border-stone-200/80 dark:border-stone-800 shadow-xs"
      aria-label="Calendario oficial de Educación Abierta"
    >
      {/* Header section with subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-100 dark:border-stone-800/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <CalendarDays className="size-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Fechas de Educación Abierta
            </h2>
          </div>
          <p className="text-sm text-stone-600 dark:text-stone-400 max-w-3xl">
            Consulta el aviso de la DGEC para confirmar la hora y las condiciones de tu prueba. Las fechas se muestran en hora de Costa Rica.
          </p>
        </div>

        {/* View Switcher buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-100 dark:bg-stone-800/60 self-start sm:self-center border border-stone-200/60 dark:border-stone-700/60">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            aria-pressed={viewMode === 'grid'}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs font-bold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <LayoutGrid className="size-3.5" />
            <span>Cuadrícula</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('timeline')}
            aria-pressed={viewMode === 'timeline'}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              viewMode === 'timeline'
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs font-bold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <ListOrdered className="size-3.5" />
            <span>Cronograma</span>
          </button>
        </div>
      </div>

      {/* Featured next upcoming milestones banner */}
      {primaryMilestones.length > 0 && (
        <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/70 via-stone-50 to-amber-50/40 dark:from-indigo-950/40 dark:via-stone-900 dark:to-stone-900/60 p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-bold tracking-tight text-stone-900 dark:text-stone-100">
                Próximos hitos oficiales · Convocatoria {convocatoriaLabel(convocatoria)}
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-indigo-800 dark:text-indigo-300">
              {primaryMilestones.length} fechas clave
            </span>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            {primaryMilestones.map(milestone => {
              const currentStatus = calendarStatus(today, milestone.start, milestone.end);
              const EventIcon = getEventIcon(milestone.type);
              return (
                <div
                  key={['feat', milestone.programId, milestone.moduleId, milestone.type, milestone.start].join('/')}
                  className="rounded-xl border border-white/80 bg-white/90 dark:border-stone-800/80 dark:bg-stone-850/80 p-3 flex flex-col justify-between shadow-2xs"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                        {programShortLabels[milestone.programId] || milestone.programId}
                      </span>
                      <ScheduleBadge status={currentStatus} />
                    </div>
                    <div className="flex items-start gap-2 pt-0.5">
                      <EventIcon className="size-4 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-bold text-xs text-stone-900 dark:text-stone-100 leading-tight">
                          {eventLabels[milestone.type] || milestone.type}
                          {milestone.moduleId && (milestone.moduleId === 'EDAD_1' ? ' · P1' : ' · P2')}
                        </div>
                        <div className="text-xs text-stone-600 dark:text-stone-400 font-medium mt-0.5">
                          {milestone.start && formatDay(milestone.start)}
                          {milestone.end && ` – ${formatDay(milestone.end)}`}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Program quick-pills filter row */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-stone-600 dark:text-stone-400">
          <span>Filtrar por programa educativo:</span>
          {program && (
            <button
              type="button"
              onClick={() => setProgram('')}
              className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Ver todos los programas
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setProgram('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              program === ''
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            Todos
          </button>
          {Object.entries(programs).map(([id, name]) => {
            const isSelected = program === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setProgram(isSelected ? '' : id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Granular Accessible Filters Panel */}
      <div className="p-4 rounded-2xl bg-stone-50/80 dark:bg-stone-850/60 border border-stone-200/60 dark:border-stone-800 space-y-3">
        <div className="calendar-filters">
          <label className="grid gap-1 text-xs font-bold text-stone-700 dark:text-stone-300">
            Programa
            <select
              aria-label="Programa"
              value={program}
              onChange={event => setProgram(event.target.value)}
              className="px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-semibold text-stone-900 dark:text-stone-100 shadow-2xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              <option value="">Todos</option>
              {Object.entries(programs).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-xs font-bold text-stone-700 dark:text-stone-300">
            Convocatoria
            <select
              aria-label="Convocatoria"
              value={convocatoria}
              onChange={event => setConvocatoria(event.target.value)}
              className="px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-semibold text-stone-900 dark:text-stone-100 shadow-2xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              {convocatorias.map(id => (
                <option key={id} value={id}>
                  {convocatoriaLabel(id)}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-xs font-bold text-stone-700 dark:text-stone-300">
            Tipo de evento
            <select
              aria-label="Tipo de evento"
              value={type}
              onChange={event => setType(event.target.value)}
              className="px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-semibold text-stone-900 dark:text-stone-100 shadow-2xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              <option value="">Todos los eventos</option>
              {Object.entries(eventLabels).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-xs font-bold text-stone-700 dark:text-stone-300">
            Estado
            <select
              aria-label="Estado"
              value={status}
              onChange={event => setStatus(event.target.value)}
              className="px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-semibold text-stone-900 dark:text-stone-100 shadow-2xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              <option value="all">Todos los estados</option>
              {Object.entries(statusLabels).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-xs font-bold text-stone-700 dark:text-stone-300">
            Mes
            <select
              aria-label="Mes"
              value={month}
              onChange={event => setMonth(event.target.value)}
              className="px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-semibold text-stone-900 dark:text-stone-100 shadow-2xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              <option value="">Todo el año</option>
              {availableMonths.map(value => (
                <option key={value} value={value}>
                  {new Intl.DateTimeFormat('es-CR', { timeZone: 'UTC', month: 'long', year: 'numeric' }).format(
                    new Date(value + '-01T00:00:00Z')
                  )}
                </option>
              ))}
            </select>
          </label>

          <button
            className="secondary-button self-end font-semibold text-xs"
            onClick={resetFilters}
            disabled={!hasActiveFilters}
          >
            Restablecer filtros
          </button>
        </div>
      </div>

      {/* Results status counter */}
      <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-400">
        <p id={filterSummaryId} role="status">
          <strong className="font-bold text-stone-800 dark:text-stone-200">{events.length}</strong> eventos · Abre una tarjeta para consultar horarios y fuente oficial.
        </p>
      </div>

      {/* Empty state */}
      {!events.length && (
        <div
          role="status"
          className="rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 p-8 text-center space-y-2 bg-stone-50/50 dark:bg-stone-800/30"
        >
          <AlertCircle className="size-8 mx-auto text-stone-400 dark:text-stone-500" />
          <h3 className="text-base font-bold text-stone-800 dark:text-stone-200">No hay fechas publicadas para esta selección</h3>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Intenta cambiar los filtros de programa, tipo de evento o estado para visualizar otras fechas.
          </p>
          <button type="button" onClick={resetFilters} className="primary-button text-xs mt-2">
            Restablecer filtros
          </button>
        </div>
      )}

      {/* Timeline View */}
      {viewMode === 'timeline' && events.length > 0 && (
        <div className="space-y-6">
          {Object.entries(eventsByMonth).map(([monthKey, monthEvents]) => {
            const formattedMonth =
              monthKey === 'Sin fecha'
                ? 'Fechas por definir'
                : new Intl.DateTimeFormat('es-CR', { timeZone: 'UTC', month: 'long', year: 'numeric' }).format(
                    new Date(monthKey + '-01T00:00:00Z')
                  );
            return (
              <div key={monthKey} className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-200/60 dark:border-indigo-800/60">
                    {formattedMonth}
                  </span>
                  <div className="h-px bg-stone-200 dark:bg-stone-800 flex-1" />
                </div>

                <div className="grid gap-3">
                  {monthEvents.map(event => {
                    const currentStatus = calendarStatus(today, event.start, event.end);
                    const EventIcon = getEventIcon(event.type);
                    return (
                      <div
                        key={['timeline', event.programId, event.moduleId, event.type, event.start].join('/')}
                        className="rounded-xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 transition-all hover:border-indigo-300 dark:hover:border-indigo-800 shadow-2xs"
                      >
                        <details className="group">
                          <summary className="cursor-pointer list-none flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <span className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 group-open:bg-indigo-50 group-open:text-indigo-600 dark:group-open:bg-indigo-950 dark:group-open:text-indigo-400 transition-colors shrink-0">
                                <EventIcon className="size-4" />
                              </span>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                                    {programShortLabels[event.programId] || event.programId}
                                  </span>
                                  <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                                    {eventLabels[event.type]} · {programs[event.programId as keyof typeof programs]}
                                    {event.moduleId && (event.moduleId === 'EDAD_1' ? ' · Prueba 1' : ' · Prueba 2')}
                                  </h3>
                                </div>
                                <p className="text-xs text-stone-600 dark:text-stone-400 font-medium mt-1">
                                  {event.start && <>{formatDay(event.start)}{event.end && ' – ' + formatDay(event.end)} · </>}
                                  <ScheduleBadge status={currentStatus} />
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 self-end sm:self-center">
                              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-open:hidden">
                                Ver detalles
                              </span>
                              <ChevronDown className="size-4 text-stone-400 transition-transform duration-200 group-open:rotate-180" />
                            </div>
                          </summary>

                          <div className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-800/80 space-y-3 text-xs">
                            {event.sessions && (
                              <div className="space-y-1.5">
                                <span className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                                  <Clock className="size-3.5 text-stone-400" />
                                  Horarios por asignatura:
                                </span>
                                <ul className="grid sm:grid-cols-2 gap-1.5 bg-stone-50 dark:bg-stone-800/50 p-2.5 rounded-xl border border-stone-200/50 dark:border-stone-700/50">
                                  {event.sessions.map(session => (
                                    <li
                                      key={session.subject}
                                      className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700"
                                    >
                                      <span className="font-semibold text-stone-800 dark:text-stone-200">{session.subject}</span>
                                      <span className="font-mono text-[11px] text-stone-500 dark:text-stone-400">
                                        {session.startTime}–{session.endTime}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            <div className="flex items-center justify-between pt-1 text-[11px] text-stone-500 dark:text-stone-400">
                              <a
                                className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                                href={event.sourceUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <span>Fuente oficial DGEC</span>
                                <ExternalLink className="size-3" />
                              </a>
                              <span>Última verificación: {formatDay(event.verifiedOn)}</span>
                            </div>
                          </div>
                        </details>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Grid Card View */}
      {viewMode === 'grid' && events.length > 0 && (
        <ul className="calendar-event-grid">
          {events.map(event => {
            const currentStatus = calendarStatus(today, event.start, event.end);
            const EventIcon = getEventIcon(event.type);
            return (
              <li
                key={[event.programId, event.moduleId, event.type, event.start].join('/')}
                className="calendar-event-card group hover:shadow-sm transition-all"
                data-status={currentStatus}
              >
                <details className="group">
                  <summary className="focus:outline-hidden">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-stone-200/80 dark:bg-stone-700/80 text-stone-700 dark:text-stone-300">
                        {programShortLabels[event.programId] || event.programId}
                      </span>
                      <ChevronDown className="size-4 text-stone-400 transition-transform duration-200 group-open:rotate-180 shrink-0" />
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 group-open:bg-indigo-50 group-open:text-indigo-600 dark:group-open:bg-indigo-950 dark:group-open:text-indigo-400 transition-colors shrink-0">
                        <EventIcon className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100 leading-snug">
                          {eventLabels[event.type]} · {programs[event.programId as keyof typeof programs]}
                          {event.moduleId && (event.moduleId === 'EDAD_1' ? ' · Prueba 1' : ' · Prueba 2')}
                        </h3>
                        <p className="text-xs text-stone-600 dark:text-stone-400 font-medium mt-1">
                          {event.start && <>{formatDay(event.start)}{event.end && ' – ' + formatDay(event.end)} · </>}
                          <ScheduleBadge status={currentStatus} />
                        </p>
                      </div>
                    </div>
                  </summary>

                  {/* Expanded Session Times */}
                  {event.sessions && (
                    <div className="mt-3 pt-3 border-t border-stone-200/60 dark:border-stone-700/60 space-y-1.5">
                      <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1">
                        <Clock className="size-3 text-stone-400" /> Horarios de prueba:
                      </span>
                      <ul className="space-y-1 text-xs">
                        {event.sessions.map(session => (
                          <li
                            key={session.subject}
                            className="flex items-center justify-between p-1.5 rounded-lg bg-stone-100/70 dark:bg-stone-800/60 text-stone-800 dark:text-stone-200"
                          >
                            <span className="font-semibold text-xs">{session.subject}</span>
                            <span className="font-mono text-[11px] text-stone-500 dark:text-stone-400">
                              {session.startTime}–{session.endTime}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* DGEC Source Link */}
                  <div className="mt-3 pt-3 border-t border-stone-200/60 dark:border-stone-700/60 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                    <a
                      className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                      href={event.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <span>Fuente DGEC</span>
                      <ExternalLink className="size-3" />
                    </a>
                    <span className="text-[11px]">Verificado: {formatDay(event.verifiedOn)}</span>
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
