import React, { useState, useMemo } from 'react';
import {
  BxmDomain,
  BxmEvidenceNode,
  BxmAssessmentCallbacks,
  BxmCapabilityContext
} from '../types';
import { BxmContentService } from '../services/bxmContentService';
import { BxmLessonView } from './BxmLessonView';
import { Sliders } from 'lucide-react';

import type { LearningContextReason } from '../../../services/navigation';

export interface BxmDigitalTemarioProps {
  callbacks?: BxmAssessmentCallbacks;
  capabilities?: BxmCapabilityContext;
  className?: string;
  initialEvidenceKey?: string;
  contextReason?: LearningContextReason;
  completedLessonIds?: string[];
  onMarkLessonCompleted?: (lessonId: string) => void;
  onEvidenceChange?: (key: string | undefined) => void;
}

export const BxmDigitalTemario: React.FC<BxmDigitalTemarioProps> = ({
  callbacks,
  capabilities = { isPremium: false },
  className = '',
  initialEvidenceKey,
  contextReason,
  completedLessonIds = [],
  onMarkLessonCompleted,
  onEvidenceChange,
}) => {
  const [selectedDomain, setSelectedDomain] = useState<BxmDomain | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeEvidenceKey, setActiveEvidenceKey] = useState<string | null>(initialEvidenceKey || null);
  function selectEvidence(key: string | null) { setActiveEvidenceKey(key); onEvidenceChange?.(key || undefined); }

  const allEvidences = useMemo(() => BxmContentService.getAllEvidences(), []);

  // Filtered evidences
  const filteredEvidences = useMemo(() => {
    return allEvidences.filter((ev) => {
      const matchDomain = selectedDomain === 'all' || ev.domain === selectedDomain;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        ev.evidenceCode.toLowerCase().includes(q) ||
        ev.evidenceDesc.toLowerCase().includes(q) ||
        ev.affirmationDesc.toLowerCase().includes(q) ||
        ev.blockName.toLowerCase().includes(q);
      return matchDomain && matchQuery;
    });
  }, [allEvidences, selectedDomain, searchQuery]);

  // Group filtered evidences by block and affirmation
  const groupedTree = useMemo(() => {
    const map = new Map<string, { blockCode: string; blockName: string; affirmations: Map<string, { code: string; desc: string; evidences: BxmEvidenceNode[] }> }>();

    for (const ev of filteredEvidences) {
      if (!map.has(ev.blockCode)) {
        map.set(ev.blockCode, {
          blockCode: ev.blockCode,
          blockName: ev.blockName,
          affirmations: new Map()
        });
      }
      const bObj = map.get(ev.blockCode)!;
      if (!bObj.affirmations.has(ev.affirmationCode)) {
        bObj.affirmations.set(ev.affirmationCode, {
          code: ev.affirmationCode,
          desc: ev.affirmationDesc,
          evidences: []
        });
      }
      bObj.affirmations.get(ev.affirmationCode)!.evidences.push(ev);
    }

    return Array.from(map.values()).map((b) => ({
      ...b,
      affirmations: Array.from(b.affirmations.values())
    }));
  }, [filteredEvidences]);

  // If viewing a lesson
  const activeLesson = useMemo(() => {
    if (!activeEvidenceKey) return null;
    return BxmContentService.getLessonByEvidenceKey(activeEvidenceKey);
  }, [activeEvidenceKey]);

  const activeEvidenceNode = useMemo(() => {
    if (!activeEvidenceKey) return null;
    return BxmContentService.getEvidenceByKey(activeEvidenceKey);
  }, [activeEvidenceKey]);

  if (activeEvidenceKey && activeLesson) {
    return (
      <div className={`p-4 sm:p-6 lg:p-8 ${className}`}>
        <BxmLessonView
          lesson={activeLesson}
          callbacks={callbacks}
          capabilities={capabilities}
          contextReason={contextReason}
          isCompleted={completedLessonIds.includes(activeLesson.id)}
          onMarkLessonCompleted={onMarkLessonCompleted}
          onBackToTemario={() => selectEvidence(null)}
        />
      </div>
    );
  }

  return (
    <div className={`p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 ${className}`}>
      {/* Temario Hero Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300">
            BXM Bachillerato por Madurez 02-2026
          </span>
          <span className="text-xs font-semibold text-stone-500">
            71 habilidades del programa
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
          Temario
        </h1>
        <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 max-w-3xl">
          Elige un tema para repasar a tu ritmo.
          Consulte definiciones, fórmulas, errores típicos, ejemplos resueltos y laboratorios interactivos.
        </p>
      </div>

      {/* Domain Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-stone-100 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 text-xs font-semibold">
          <button
            type="button"
            aria-pressed={selectedDomain === 'all'}
            onClick={() => setSelectedDomain('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              selectedDomain === 'all'
                ? 'bg-white dark:bg-stone-750 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            Todas ({allEvidences.length})
          </button>
          <button
            type="button"
            aria-pressed={selectedDomain === 'geometry'}
            onClick={() => setSelectedDomain('geometry')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              selectedDomain === 'geometry'
                ? 'bg-white dark:bg-stone-750 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            Geometría ({allEvidences.filter(ev => ev.domain === 'geometry').length})
          </button>
          <button
            type="button"
            aria-pressed={selectedDomain === 'functions'}
            onClick={() => setSelectedDomain('functions')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              selectedDomain === 'functions'
                ? 'bg-white dark:bg-stone-750 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            Funciones ({allEvidences.filter(ev => ev.domain === 'functions').length})
          </button>
          <button
            type="button"
            aria-pressed={selectedDomain === 'statistics'}
            onClick={() => setSelectedDomain('statistics')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              selectedDomain === 'statistics'
                ? 'bg-white dark:bg-stone-750 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            Estadística ({allEvidences.filter(ev => ev.domain === 'statistics').length})
          </button>
        </div>

        <div className="relative">
          <input
            type="search"
            aria-label="Buscar tema o concepto"
            placeholder="Buscar tema o concepto…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-72 px-3.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>
      </div>

      {/* Active Modal / Detail for scaffolded node without rich lesson */}
      {activeEvidenceKey && !activeLesson && activeEvidenceNode && (
        <div className="p-5 rounded-2xl border border-amber-300 dark:border-amber-700/80 bg-amber-50/80 dark:bg-amber-950/40 space-y-3 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-200 dark:bg-amber-900/80 text-amber-950 dark:text-amber-200">
                Tema seleccionado
              </span>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-50 mt-1">
                {activeEvidenceNode.evidenceDesc}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => selectEvidence(null)}
              className="text-xs font-bold text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100 cursor-pointer p-1"
            >
              Cerrar ✕
            </button>
          </div>
          <div className="text-xs text-stone-700 dark:text-stone-300 space-y-1.5 leading-relaxed">
            <p>
              <strong className="text-stone-900 dark:text-stone-100">Bloque:</strong> {activeEvidenceNode.blockName}
            </p>
            <p>
              <strong className="text-stone-900 dark:text-stone-100">Aprenderás:</strong> {activeEvidenceNode.affirmationDesc}
            </p>
            <p>
              <strong className="text-stone-900 dark:text-stone-100">Sobre esta lección:</strong> Estamos preparando una explicación completa. Mientras tanto, puedes explorar otros temas o practicar preguntas relacionadas.
            </p>
          </div>
          {callbacks?.onStartTargetedPractice && (
            <button
              type="button"
              onClick={() => callbacks.onStartTargetedPractice!(activeEvidenceNode.key)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 transition-colors cursor-pointer"
            >
              Practicar ítems relacionados
            </button>
          )}
        </div>
      )}

      {groupedTree.length === 0 && <section className="feedback-state"><h2 className="text-lg font-semibold">No encontramos ese tema</h2><p className="muted">Prueba con otro concepto o explora el temario completo.</p><button className="secondary-button" onClick={() => { setSearchQuery(''); setSelectedDomain('all'); }}>Ver todos los temas</button></section>}
      {/* Curriculum Tree Accordion / List */}
      <div className="space-y-6">
        {groupedTree.map((block) => (
          <div
            key={block.blockCode}
            className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden shadow-xs"
          >
            <div className="p-4 sm:p-5 bg-stone-50/80 dark:bg-stone-850/80 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
                {block.blockName}
              </h2>
              <span className="text-xs font-semibold text-stone-500">
                {block.affirmations.reduce((acc, a) => acc + a.evidences.length, 0)} habilidades
              </span>
            </div>

            <div className="divide-y divide-stone-100 dark:divide-stone-800/60">
              {block.affirmations.map((aff) => (
                <div key={aff.code} className="p-4 sm:p-5 space-y-3">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                      Objetivo de aprendizaje
                    </div>
                    <div className="text-xs sm:text-sm text-stone-700 dark:text-stone-300">
                      {aff.desc}
                    </div>
                  </div>

                  {/* Evidences Grid */}
                  <div className="curriculum-list">
                    {aff.evidences.map((ev) => {
                      const isComplete = ev.status === 'complete';
                      return (
                        <button
                          type="button"
                          key={ev.key}
                          onClick={() => selectEvidence(ev.key)}
                          className="curriculum-row"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-mono text-xs font-bold text-stone-900 dark:text-stone-100">
                                Tema
                              </span>
                              {isComplete ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                  {ev.lessonId && completedLessonIds.includes(ev.lessonId) ? '✓ Completada' : 'Disponible'}
                                </span>
                              ) : (
                                <span className="text-[10px] font-medium text-stone-500 dark:text-stone-400">
                                  Disponible pronto
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-2">
                              {ev.evidenceDesc}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-stone-100 dark:border-stone-800 text-[11px] font-medium text-amber-700 dark:text-amber-400">
                            <span>{isComplete ? 'Estudiar →' : 'Ver detalles →'}</span>
                            {ev.hasInteractiveVisual && (
                              <span className="inline-flex items-center gap-1 font-semibold text-amber-800 dark:text-amber-400">
                                <Sliders className="w-3.5 h-3.5" aria-hidden="true" />
                                <span>Interactivo</span>
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
