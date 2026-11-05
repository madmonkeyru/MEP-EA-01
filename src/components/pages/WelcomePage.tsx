import React from 'react';
import { ProgramInfo } from '../../types';
import { programManifest } from '../../services/programCatalog';
import { ProgramCard } from '../common/ProgramCard';
import { ConvocatoriaBadge } from '../common/ConvocatoriaBadge';
import { ProgramSchedulesOverview } from '../knowledge/ProgramSchedulesOverview';
import { provinces, provinceBorders, coast } from '../maps/map-geometry';
import {
  ArrowRight,
  ShieldCheck,
  Calculator,
  Award,
  Layers,
  Info,
} from 'lucide-react';

interface WelcomePageProps {
  onSelectProgram: (programId: string) => void;
  onEnterMvpMath: () => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({
  onSelectProgram,
  onEnterMvpMath,
}) => {
  const programs: ProgramInfo[] = programManifest.programs;
  const currentConvocatoria = '2026-c2';

  return (
    <div className="welcome-page max-w-7xl 2xl:max-w-[1536px] mx-auto px-3.5 sm:px-6 py-6 sm:py-10 space-y-8 text-stone-900 dark:text-slate-100 transition-colors">
      {/* 1. Header Hero / Welcome Portal Banner */}
      <div className="page-intro rounded-3xl p-6 sm:p-10 relative overflow-hidden">
        {/* Faded Costa Rica map watermark */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 sm:translate-x-4 w-[280px] sm:w-[420px] md:w-[500px] pointer-events-none opacity-15 dark:opacity-20 select-none z-0" aria-hidden="true">
          <svg
            viewBox="0 0 1000 1000"
            className="w-full h-full stroke-stone-900 dark:stroke-stone-100 stroke-[1.2] fill-stone-800/5 dark:fill-stone-200/5"
            style={{ strokeLinejoin: 'round', strokeLinecap: 'round' }}
          >
            <defs>
              <pattern id="welcome-carto-grid" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.25" />
              </pattern>
            </defs>
            <rect width="1000" height="1000" fill="url(#welcome-carto-grid)" opacity="0.3" />
            {provinces.map((prov) => (
              <path key={prov.id} d={prov.d} />
            ))}
            <path d={provinceBorders} className="stroke-stone-700/60 dark:stroke-stone-300/60 stroke-[1] stroke-dasharray-[2,2] fill-none" />
            <path d={coast} className="stroke-stone-900 dark:stroke-stone-100 stroke-[1.5] fill-none" />
          </svg>
        </div>

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <ConvocatoriaBadge convocatoriaId={currentConvocatoria} />
          </div>

          <h1 tabIndex={-1} className="text-2xl sm:text-4xl font-semibold tracking-tight leading-tight">
            Encuentra tu programa de estudio
          </h1>
          <p className="text-sm sm:text-base text-stone-600 dark:text-slate-300 max-w-xl leading-relaxed">
            Hay distintas opciones para completar la escuela, el noveno grado, y obtener el bachillerato. Explora el programa que mejor te ayuda a obtener tu titulo.
          </p>
        </div>
      </div>

      {/* 2. Prominent Quick-Entry Card for MVP (Matemáticas — BXM) */}
      <div className="ui-featured rounded-3xl p-6 sm:p-8 border border-indigo-200/60 dark:border-indigo-900/40 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-[var(--surface-card,#ffffff)] to-[var(--accent-soft,#eeedf9)] dark:from-[var(--surface-card,#282422)] dark:to-[var(--accent-soft,#2e2b45)]">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
              Bachillerato por Madurez Suficiente
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight font-['Outfit']">
            Matemáticas BXM (Convocatoria 02-2026)
          </h2>

          <p className="text-sm text-stone-700 dark:text-stone-300 font-normal leading-relaxed">
            Prácticas completas, simulaciones de examen, explicaciones con pasos y fórmulas oficiales.
          </p>
        </div>

        <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2.5 items-stretch sm:items-center md:items-stretch">
          <button
            onClick={onEnterMvpMath}
            className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-sm cursor-pointer min-h-[48px] hover:shadow-md"
          >
            <span>Practicar</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. Program Tracks Overview Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-stone-800 dark:text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Programas de Educación Abierta
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {programs.map((prog) => (
            <ProgramCard
              key={prog.id}
              program={prog}
              isMvp={prog.id === 'bxm'}
              onSelect={onSelectProgram}
            />
          ))}
        </div>
      </div>

      {/* Multiprogram DGEC Schedule Overview - General Portal Placement */}
      <ProgramSchedulesOverview />

      <details className="ui-surface rounded-2xl p-5"><summary>Comparar las rutas educativas</summary><div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Comparación de programas"><table className="data-table"><caption>Elige una ruta según los estudios que deseas completar; confirma requisitos con la DGEC.</caption><thead><tr><th scope="col">Programa</th><th scope="col">Estudios previos de referencia</th><th scope="col">Meta</th></tr></thead><tbody><tr><th scope="row">I y II Ciclo</th><td>Primaria incompleta</td><td>Completar primaria</td></tr><tr><th scope="row">III Ciclo</th><td>Primaria completa</td><td>Completar noveno</td></tr><tr><th scope="row">EDAD</th><td>Noveno aprobado</td><td>Bachillerato en dos partes</td></tr><tr><th scope="row">BXM</th><td>Noveno aprobado</td><td>Bachillerato por suficiencia</td></tr></tbody></table></div></details>
      <a href="#/guia" className="text-link">No sé qué programa elegir · Abrir guía opcional</a>
      <p className="text-sm text-stone-600 dark:text-slate-400">Plataforma independiente de preparación. No realiza inscripciones ni verifica expedientes del MEP.</p>

      {/* 4. Compact Informational Banner: Examination Rules & Regulations */}
      <div className="ui-surface rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-stone-200 dark:border-slate-800 pb-3">
          <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-xs font-semibold text-stone-800 dark:text-slate-200">
            Estructura y reglas de referencia curricular
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium text-stone-700 dark:text-slate-300">
          <div className="flex items-start gap-3 bg-stone-50 dark:bg-slate-800/60 p-3.5 rounded-xl ">
            <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-stone-900 dark:text-slate-100">Notas de Aprobación</h4>
              <p className="text-[11px] text-stone-600 dark:text-slate-400 mt-1 leading-snug">
                BXM y EDAD requieren nota mínima de <strong className="text-indigo-600 dark:text-indigo-400">70</strong>.
                I y II Ciclo y III Ciclo requieren nota mínima de <strong className="text-indigo-600 dark:text-indigo-400">65</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-stone-50 dark:bg-slate-800/60 p-3.5 rounded-xl ">
            <Calculator className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-stone-900 dark:text-slate-100">Directriz de Calculadoras</h4>
              <p className="text-[11px] text-stone-600 dark:text-slate-400 mt-1 leading-snug">
                En III Ciclo depende de la materia y nivel: Matemáticas de séptimo sin calculadora; octavo y noveno con calculadora sencilla. Ciencias admite científica no programable. Consulta las reglas específicas de EDAD y BXM.
                Estrictamente prohibida en I y II Ciclo.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-stone-50 dark:bg-slate-800/60 p-3.5 rounded-xl ">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-stone-900 dark:text-slate-100">Disponibilidad de Contenido</h4>
              <p className="text-[11px] text-stone-600 dark:text-slate-400 mt-1 leading-snug">
                La práctica funcional está disponible en Matemáticas BXM, convocatoria 02-2026.
                Las demás rutas muestran su estructura mientras se prepara el contenido.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
