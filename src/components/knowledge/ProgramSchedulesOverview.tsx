import React, { useState } from 'react';
import { Calendar, ExternalLink } from 'lucide-react';

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

const annualCalendars = import.meta.glob<CalendarEvent[]>('../../../content/calendar/*.json', {
  eager: true,
  import: 'default',
});
const allEvents = Object.values(annualCalendars).flat();

const displayDate = new Intl.DateTimeFormat('es-CR', { timeZone: 'UTC', dateStyle: 'medium' });
const formatDay = (date: string) => displayDate.format(new Date(date + 'T00:00:00Z'));

const programLabels: Record<string, string> = {
  bxm: 'Bachillerato por Madurez Suficiente (BXM)',
  edad: 'Educación Diversificada a Distancia (EDAD)',
  iii_ciclo: 'III Ciclo (EGBA - 7°, 8°, 9°)',
  i_ii_ciclo: 'I y II Ciclo (Primaria Abierta)',
};

export const ProgramSchedulesOverview: React.FC = () => {
  const [selectedConvocatoria, setSelectedConvocatoria] = useState('2026-c2');

  const programList = ['bxm', 'edad', 'iii_ciclo', 'i_ii_ciclo'];

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-xs dark:border-stone-800 dark:bg-stone-900 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-100 dark:border-stone-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-1">
            <Calendar className="size-3.5" />
            <span>Calendario Multiprograma DGEC</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Cronograma Oficial de Pruebas y Matrícula
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-0.5">
            Compara fechas oficiales de inscripción, publicación de sedes y aplicación entre los 4 programas de Educación Abierta.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="schedule-convocatoria-select" className="text-xs font-semibold text-stone-600 dark:text-stone-400">
            Convocatoria:
          </label>
          <select
            id="schedule-convocatoria-select"
            value={selectedConvocatoria}
            onChange={e => setSelectedConvocatoria(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-bold text-stone-800 dark:text-stone-200"
          >
            <option value="2026-c2">02-2026 (Segunda Convocatoria)</option>
            <option value="2026-c1">01-2026 (Primera Convocatoria)</option>
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {programList.map(pid => {
          const events = allEvents.filter(
            e => e.programId === pid && e.convocatoriaId === selectedConvocatoria
          );
          const reg = events.find(e => e.type === 'registration');
          const sites = events.find(e => e.type === 'sites');
          const exams = events.filter(e => e.type === 'exam');
          const firstExam = exams[0];

          return (
            <div
              key={pid}
              className="rounded-2xl border border-stone-200/80 bg-stone-50/50 dark:border-stone-800 dark:bg-stone-800/40 p-5 space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-stone-200/60 dark:border-stone-700/60 pb-2.5">
                  <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                    {programLabels[pid] || pid}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 uppercase">
                    {pid === 'bxm' ? '10° & 11°' : pid === 'edad' ? 'Diversificada' : pid === 'iii_ciclo' ? 'Secundaria' : 'Primaria'}
                  </span>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  {/* Registration */}
                  <div className="flex items-center justify-between">
                    <span className="text-stone-600 dark:text-stone-400">Inscripción / Matrícula:</span>
                    <span className="font-semibold text-stone-800 dark:text-stone-200">
                      {reg?.start && reg?.end ? `${formatDay(reg.start)} – ${formatDay(reg.end)}` : 'Por confirmar'}
                    </span>
                  </div>

                  {/* Sites */}
                  <div className="flex items-center justify-between">
                    <span className="text-stone-600 dark:text-stone-400">Sedes de Examen:</span>
                    <span className="font-semibold text-stone-800 dark:text-stone-200">
                      {sites?.start ? formatDay(sites.start) : 'Por confirmar'}
                    </span>
                  </div>

                  {/* Exam range */}
                  <div className="flex items-center justify-between">
                    <span className="text-stone-600 dark:text-stone-400">Aplicación de Pruebas:</span>
                    <span className="font-semibold text-indigo-700 dark:text-indigo-400">
                      {exams.length > 0 && firstExam?.start
                        ? `${formatDay(firstExam.start)} ${exams.length > 1 ? `(+${exams.length - 1} fechas)` : ''}`
                        : 'Por confirmar'}
                    </span>
                  </div>
                </div>
              </div>

              {firstExam?.sourceUrl && (
                <div className="pt-2 border-t border-stone-200/40 dark:border-stone-700/40 flex justify-between items-center text-[11px] text-stone-500 dark:text-stone-400">
                  <span>Fuente oficial DGEC</span>
                  <a
                    href={firstExam.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <span>Ver documento</span>
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
