import React from 'react';
import { ProgramInfo } from '../../types';
import { ArrowRight, Calculator, Ban, CheckCircle } from 'lucide-react';

interface ProgramCardProps {
  program: ProgramInfo;
  isMvp?: boolean;
  onSelect: (programId: string) => void;
}

export const ProgramCard: React.FC<ProgramCardProps> = ({
  program,
  isMvp = false,
  onSelect,
}) => {
  return (
    <a href={'#/programas/' + program.id + '?convocatoria=2026-c2'}
      onClick={event => { if (!event.ctrlKey && !event.metaKey) { event.preventDefault(); onSelect(program.id); } }}
      className={`group relative text-left ui-surface ui-lift rounded-2xl p-5 sm:p-6 cursor-pointer flex flex-col justify-between ${isMvp ? 'program-featured' : ''}`}
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <span className="inline-flex items-center px-2.5 py-1 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[10px] font-bold rounded-lg uppercase tracking-wider border border-stone-200/60 dark:border-stone-700/60">
            {program.id.toUpperCase()}
          </span>

          {isMvp ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-semibold rounded-full border border-emerald-300/40">
              <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              Práctica disponible
            </span>
          ) : (
            <span className="text-[10px] font-semibold text-stone-600 dark:text-stone-400">
              PDF y estructura
            </span>
          )}
        </div>

        {/* Title & Description */}
        <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors font-['Outfit']">
          {program.name}
        </h3>
        <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 mt-0.5">{program.id === 'cico' || program.id === 'i_ii_ciclo' ? 'Meta: completar primaria' : program.id === 'iii_ciclo' ? 'Meta: concluir noveno año' : 'Meta: Bachillerato en Educación Media'}</p>
        <p className="text-xs text-stone-600 dark:text-stone-300 mt-2 leading-relaxed">
          {program.description}
        </p>

        <p className="muted mt-3 text-xs leading-relaxed">{program.id === 'cico' || program.id === 'i_ii_ciclo' ? 'Para completar primaria. Consulta la edad y habilidades de ingreso en la guía.' : program.id === 'iii_ciclo' ? 'Requiere primaria completa; prepara séptimo, octavo y noveno.' : program.id === 'edad' ? 'Requiere noveno; décimo y undécimo se evalúan por separado.' : 'Requiere noveno; consulta la edad ordinaria y las excepciones.'}</p>
        {/* Metadata Details */}
        <div className="mt-4 pt-3 border-t border-[var(--border-subtle,#e7e2d8)] dark:border-[var(--border-subtle,#3d3733)] grid grid-cols-2 gap-2 text-[11px] font-semibold">
          <div className="text-stone-700 dark:text-stone-300">
            <span>Mínimo: {program.passingScore} pts</span>
          </div>

          <div className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
            {program.calculatorAllowed ? (
              <>
                <Calculator className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span>Por materia</span>
              </>
            ) : (
              <>
                <Ban className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="text-amber-700 dark:text-amber-300">Sin Calc</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-5 pt-3 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
        <span>{'Ver asignaturas y estructura'}</span>
        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </a>
  );
};
