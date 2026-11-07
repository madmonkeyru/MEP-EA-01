import React, { useState } from 'react';
import { LearningJourney } from '../common/LearningJourney';
import { provinces, provinceBorders, coast } from '../maps/map-geometry';
import {
  ArrowRight,
  GraduationCap,
  MapPin,
} from 'lucide-react';

interface EntryLandingPageProps {
  onOpenHelper?: () => void;
  onExplorePrograms: () => void;
  onEnterBxmHub: () => void;
}

export const EntryLandingPage: React.FC<EntryLandingPageProps> = ({
  onOpenHelper,
  onExplorePrograms,
  onEnterBxmHub,
}) => {
  const [last] = useState(() => { try { const route = localStorage.getItem('mep_last_subject'); return route?.startsWith('#/programas/') ? route : null; } catch { return null; } });
  return (
    <div className="entry-page min-h-[calc(100vh-65px)] text-stone-900 dark:text-stone-100 flex flex-col justify-between">
      <div className="page-width py-6 sm:py-10 w-full space-y-10">
        {/* Hero Section with Cartographic Costa Rica Background */}
        <div className="relative rounded-3xl p-6 sm:p-12 overflow-hidden border border-stone-200/80 dark:border-stone-800/80 bg-stone-50/60 dark:bg-stone-900/40 backdrop-blur-xs">
          {/* Faded Cartographic Map Background */}
          <div
            className="absolute -right-16 -bottom-16 sm:-right-8 sm:-bottom-12 w-[340px] sm:w-[460px] h-[340px] sm:h-[460px] pointer-events-none select-none opacity-[0.07] dark:opacity-[0.09] transition-opacity duration-300"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 1000 1000"
              className="w-full h-full stroke-stone-900 dark:stroke-stone-100 stroke-[1.2] fill-stone-800/5 dark:fill-stone-200/5"
              style={{ strokeLinejoin: 'round', strokeLinecap: 'round' }}
            >
              {/* Cartographic graticule grid lines */}
              <defs>
                <pattern id="carto-grid" width="80" height="80" patternUnits="userSpaceOnUse">
                  <path d="M 80 0 L 0 0 0 80" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3" />
                </pattern>
              </defs>
              <rect width="1000" height="1000" fill="url(#carto-grid)" opacity="0.4" />
              {/* Province Outlines & borders */}
              {provinces.map((prov) => (
                <path key={prov.id} d={prov.d} />
              ))}
              <path d={provinceBorders} className="stroke-stone-700/60 dark:stroke-stone-300/60 stroke-[1] stroke-dasharray-[2,2] fill-none" />
              <path d={coast} className="stroke-stone-900 dark:stroke-stone-100 stroke-[1.5] fill-none" />
            </svg>
          </div>

          <div className="relative z-10 space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50">
              <MapPin className="w-3.5 h-3.5 text-indigo-500" />
              <span>Educación Abierta Costa Rica</span>
            </div>
            <h1 tabIndex={-1} className="text-3xl sm:text-5xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight leading-tight">
              Prepárate para cualquier materia
            </h1>
            <p className="text-base sm:text-lg text-stone-600 dark:text-stone-400 leading-relaxed">
              Refuerza lo que sabes y prepárate a tu ritmo
            </p>
          </div>
        </div>

        {/* Action Pathway Cards for User Flow Validation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Pathway 1: Enter Math BXM MVP directly */}
          <div className="ui-surface entry-featured rounded-2xl p-6 flex flex-col justify-between gap-6 ui-lift">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-semibold px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 ">
                  Activo
                </span>
                <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                  Bachillerato
                </span>
              </div>
              <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                Matemáticas BXM
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                Accede directamente al simulador de práctica de 60 ítems, práctica modular por área y
                especificaciones curriculares completas.
              </p>
            </div>
            <button
              onClick={onEnterBxmHub}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-xs min-h-[44px]"
            >
              <span>Practicar Matemáticas BXM</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Pathway 2: Explore all programs via Welcome Page */}
          <div className="ui-surface rounded-2xl p-6 flex flex-col justify-between gap-6 ui-lift">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-semibold px-2.5 py-1 rounded bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-stone-300 ">
                  Portal
                </span>
                <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                  4 Programas
                </span>
              </div>
              <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                Explorar Programas
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                Consulta los 4 planes de estudio (I&II CICLO, III Ciclo, EDAD, BXM), reglas de calculadora,
                notas mínimas y convocatorias de referencia.
              </p>
            </div>
            <button
              onClick={onExplorePrograms}
              className="w-full py-3 bg-stone-900 dark:bg-stone-800 hover:bg-stone-800 dark:hover:bg-stone-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-xs min-h-[44px]"
            >
              <span>Explorar programas</span>
              <GraduationCap className="w-4 h-4" />
            </button>
          </div>
        </div>
        {onOpenHelper && <section className="ui-surface rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2"><p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">Orientación opcional</p>
          <h2 className="text-lg font-semibold">¿Necesitas ubicar tu próximo paso?</h2>
          <p className="text-sm text-stone-600 dark:text-stone-400">Conoce los requisitos y recursos de cada programa, o encuentra una ruta con la guía. Puedes omitirla y volver cuando quieras.</p></div>
          <button onClick={onOpenHelper} className="min-h-11 px-5 py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold cursor-pointer">Abrir guía y recursos</button>
        </section>}
        {last && <a className="text-link" href={last}>Volver a mi última materia</a>}
        <LearningJourney />
      </div>

      {/* Footer */}
      <footer className="border-t border-stone-200 dark:border-stone-800 py-6 px-6 text-xs text-stone-500 dark:text-stone-400 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span>MEP-EA-01 Prototipo de Educación Abierta • Sistema Independiente de Práctica</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <a href="#/acerca" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Preguntas Frecuentes y Acerca de
          </a>
          <span className="text-stone-300 dark:text-stone-700">•</span>
          <a href="#/calendario" className="hover:text-stone-700 dark:hover:text-stone-200">
            Calendario DGEC
          </a>
          <span className="text-stone-300 dark:text-stone-700">•</span>
          <a href="#/ayuda" className="hover:text-stone-700 dark:hover:text-stone-200">
            Guía y trámites
          </a>
        </div>
      </footer>
    </div>
  );
};
