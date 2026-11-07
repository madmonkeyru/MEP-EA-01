import { useState } from 'react';
type CalendarEvent = {
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

const programs = {
  bxm: 'Bachillerato por Madurez',
  i_ii_ciclo: 'I y II Ciclo',
  iii_ciclo: 'III Ciclo',
  edad: 'Educación Diversificada a Distancia',
};

const eventLabels: Record<string, string> = {
  registration: 'Inscripción',
  sites: 'Publicación de sedes',
  exam: 'Aplicación de pruebas',
  results: 'Resultados',
};

const statusLabels = {
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
  const events = calendar.filter(event => (!program || event.programId === program) && event.convocatoriaId === convocatoria && (!type || event.type === type) && (!month || event.start?.slice(0, 7) === month) && (status === 'all' || calendarStatus(today, event.start, event.end) === status))
    .sort((a, b) => (a.start || '9999').localeCompare(b.start || '9999'));

  return <section className="ui-surface rounded-2xl p-5 sm:p-7 space-y-4" aria-label="Calendario oficial de Educación Abierta">
    <h2 className="text-xl font-semibold">Fechas de Educación Abierta</h2>
    <p>Consulta el aviso de la DGEC para confirmar la hora y las condiciones de tu prueba. Las fechas se muestran en hora de Costa Rica.</p>
    <div className="flex flex-wrap gap-4">
      <label className="grid gap-1">Programa
        <select aria-label="Programa" value={program} onChange={event => setProgram(event.target.value)}>
          <option value="">Todos</option>
          {Object.entries(programs).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
        </select>
      </label>
      <label className="grid gap-1">Convocatoria
        <select aria-label="Convocatoria" value={convocatoria} onChange={event => setConvocatoria(event.target.value)}>
          {convocatorias.map(id => <option key={id} value={id}>{convocatoriaLabel(id)}</option>)}
        </select>
      </label>
      <label className="grid gap-1">Tipo de evento<select aria-label="Tipo de evento" value={type} onChange={event => setType(event.target.value)}><option value="">Todos los eventos</option>{Object.entries(eventLabels).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
      <label className="grid gap-1">Estado<select aria-label="Estado" value={status} onChange={event => setStatus(event.target.value)}><option value="all">Todos los estados</option>{Object.entries(statusLabels).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
      <label className="grid gap-1">Mes<select aria-label="Mes" value={month} onChange={event => setMonth(event.target.value)}><option value="">Todo el año</option>{[...new Set(calendar.filter(event => event.convocatoriaId === convocatoria).flatMap(event => event.start ? [event.start.slice(0, 7)] : []))].sort().map(value => <option key={value} value={value}>{new Intl.DateTimeFormat('es-CR', { timeZone: 'UTC', month: 'long', year: 'numeric' }).format(new Date(value + '-01T00:00:00Z'))}</option>)}</select></label>
      <button className="secondary-button self-end" onClick={() => { setProgram(''); setType(''); setStatus('all'); setMonth(''); }}>Restablecer filtros</button>
    </div>
    <p role="status" className="muted">{events.length} eventos · Abre una tarjeta para consultar horarios y fuente.</p>
    {!events.length && <p role="status">No hay fechas publicadas para esta selección.</p>}
    <ul className="calendar-event-grid">
      {events.map(event => <li key={[event.programId, event.moduleId, event.type, event.start].join('/')} className="calendar-event-card" data-status={calendarStatus(today, event.start, event.end)}>
        <details><summary>
        <h3 className="font-semibold">{eventLabels[event.type]} · {programs[event.programId as keyof typeof programs]}{event.moduleId && (event.moduleId === 'EDAD_1' ? ' · Prueba 1' : ' · Prueba 2')}</h3>
        <p>{event.start && <>{formatDay(event.start)}{event.end && ' – ' + formatDay(event.end)} · </>}{statusLabels[calendarStatus(today, event.start, event.end)]}</p>
        </summary>
        {event.sessions && <ul className="list-disc pl-5 text-sm">
          {event.sessions.map(session => <li key={session.subject}>{session.startTime}–{session.endTime} · {session.subject}</li>)}
        </ul>}
        <p className="text-sm"><a className="text-link" href={event.sourceUrl} target="_blank" rel="noreferrer">Fuente DGEC</a> · Última actualización: {formatDay(event.verifiedOn)}</p></details>
      </li>)}
    </ul>
  </section>;
}
