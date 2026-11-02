import React from 'react';
import { ProgramInfo } from '../../types';
import { GraduationCap, ArrowRight, Calculator, Ban, Award, CheckCircle } from 'lucide-react';

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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-300 text-[10px] font-semibold rounded-lg uppercase tracking-wider ">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
            {program.id.toUpperCase()}
          </span>

          {isMvp ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold rounded-full ">
              <CheckCircle className="w-3 h-3" />
              Matemáticas · práctica disponible
            </span>
          ) : (
            <span className="text-[10px] font-bold text-stone-500 dark:text-slate-400 bg-stone-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-full ">
              PDF y vista previa
            </span>
          )}
        </div>

        {/* Title & Description */}
        <h3 className="text-base sm:text-lg font-semibold text-stone-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {program.name}
        </h3>
        <p className="text-sm font-semibold">{program.id === 'cico' ? 'Meta: completar primaria' : program.id === 'iii_ciclo' ? 'Meta: concluir noveno año' : 'Meta: Bachillerato en Educación Media'}</p>
        <p className="text-xs text-stone-600 dark:text-slate-400 font-medium mt-1.5 leading-relaxed ">
          {program.description}
        </p>

        <p className="muted mt-3">{program.id === 'cico' ? 'Para completar primaria. Consulta la edad y habilidades de ingreso en la guía.' : program.id === 'iii_ciclo' ? 'Requiere primaria completa; prepara séptimo, octavo y noveno.' : program.id === 'edad' ? 'Requiere noveno; décimo y undécimo se evalúan por separado.' : 'Requiere noveno; consulta la edad ordinaria y las excepciones.'}</p>
        {/* Metadata Details */}
        <div className="mt-4 pt-3.5 grid grid-cols-2 gap-2 text-[11px] font-bold">
          <div className="flex items-center gap-1.5 text-stone-700 dark:text-slate-300">
            <Award className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>Mínimo: {program.passingScore} pts</span>
          </div>

          <div className="flex items-center gap-1.5 text-stone-700 dark:text-slate-300">
            {program.calculatorAllowed ? (
              <>
                <Calculator className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                <span>Reglas por materia</span>
              </>
            ) : (
              <>
                <Ban className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="text-amber-700 dark:text-amber-400">Sin Calc</span>
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
