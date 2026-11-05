import React, { useState } from 'react';
import { LearningJourney } from '../common/LearningJourney';
import { CostaRicaPlate } from '../maps/CostaRicaPlate';
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-20 w-full space-y-10">
        {/* Simple Top Badge */}
        {/* Core Value Statement & Interactive Hero Visual */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <p className="text-xs font-semibold tracking-widest uppercase text-indigo-600 dark:text-indigo-300">Tu próximo paso empieza aquí</p>
            <h1 tabIndex={-1} className="text-3xl sm:text-5xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight leading-tight">
              Prepárate para tu próximo paso
            </h1>
            <p className="text-base sm:text-lg text-stone-600 dark:text-stone-400 max-w-2xl leading-relaxed">
              Encuentra tu programa, refuerza lo que sabes y prepárate a tu ritmo. Práctica oficial e interactiva para toda Costa Rica.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
              <MapPin className="size-4 text-indigo-600 dark:text-indigo-400" />
              <span>Sedes y convocatorias activas en las 7 provincias</span>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-xs sm:max-w-sm rounded-3xl p-4 ui-surface border border-stone-200/80 dark:border-stone-800 shadow-sm overflow-hidden group">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800/80 text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                <span className="uppercase tracking-wider">Costa Rica · Mapa Interactivo</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">7 Provincias</span>
              </div>
              <div className="relative pt-2">
                <CostaRicaPlate
                  className="w-full h-auto max-h-[250px]"
                  framing="bleed"
                  interactive={true}
                />
              </div>
              <p className="text-[10px] text-center text-stone-400 dark:text-stone-500 pt-2">
                Pasa el cursor sobre cada provincia para explorar la cobertura territorial
              </p>
            </div>
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
                  10° y 11° Año
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
                  4 Programas MEP
                </span>
              </div>
              <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                Explorar Programas MEP
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                Consulta los 4 planes de estudio (CICO, III Ciclo, EDAD, BXM), reglas de calculadora,
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
      <footer className="border-t border-stone-200 dark:border-stone-800 py-4 px-6 text-center text-xs text-stone-500 dark:text-stone-400">
        MEP-EA-01 Prototipo de Educación Abierta • Sistema Independiente de Práctica
      </footer>
    </div>
  );
};
