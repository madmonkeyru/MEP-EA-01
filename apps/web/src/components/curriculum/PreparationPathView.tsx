import React, { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronRight, Compass, Flame, Play, Target } from 'lucide-react';
import { curriculumService, PreparationBlockPath } from '../../services/curriculumService';
import { TextRenderer } from '../common/TextRenderer';
import { PracticeConfig } from '../../types';

interface PreparationPathViewProps {
  programId?: string;
  subjectId?: string;
  convocatoriaId?: string;
  onStartQuiz: (config: PracticeConfig) => void;
}

export const PreparationPathView: React.FC<PreparationPathViewProps> = ({
  programId = 'bxm',
  subjectId = 'matematicas',
  convocatoriaId = '02-2026',
  onStartQuiz,
}) => {
  const pathModel = curriculumService.getPreparationPath(programId, subjectId, convocatoriaId);
  const [expandedBlock, setExpandedBlock] = useState<string>(pathModel?.blocks[0]?.blockCode || '');

  if (!pathModel) return <section className="feedback-state"><h2>Temario no disponible</h2><p>Aún no hay una tabla de especificaciones para esta materia y convocatoria.</p></section>;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs dark:border-stone-800 dark:bg-stone-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
              <Compass className="size-3.5" />
              <span>Ruta Oficial de Preparación</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 sm:text-2xl">
              Trayectoria de Estudio por Bloques
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400">
              Explora los bloques del programa y practica las habilidades de cada tema.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-medium text-stone-700 dark:border-stone-700 dark:bg-stone-800/80 dark:text-stone-300">
              <Target className="size-4 text-indigo-600 dark:text-indigo-400" />
              <span>{pathModel.totalExamPoints} pts totales</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-medium text-stone-700 dark:border-stone-700 dark:bg-stone-800/80 dark:text-stone-300">
              <Flame className="size-4 text-amber-500" />
              <span>{pathModel.blocks.length} Bloques</span>
            </div>
          </div>
        </div>
      </div>

      {programId === 'bxm' && <article className="ui-surface rounded-2xl p-6 space-y-3">
        <h2 className="text-xl font-semibold">Del centro y el radio a la ecuación</h2>
        <p>Geometría. Escribe la ecuación de una circunferencia a partir de su centro y su radio.</p>
        <p>Todos los puntos de la circunferencia están a la misma distancia del centro. Eleva al cuadrado la distancia para obtener la ecuación.</p>
        <TextRenderer content={String.raw`$(x-h)^2+(y-k)^2=r^2$`} />
        <p>Ejemplo. Para el centro (−3, 2) y el radio 4, sustituye las coordenadas del centro y eleva el radio al cuadrado.</p>
        <TextRenderer content={String.raw`$(x+3)^2+(y-2)^2=16$`} />
        <div className="action-row">
          <button className="primary-button" onClick={() => onStartQuiz({
            mode: 'area', title: 'Comprobación A1.2 · Circunferencia', itemIds: [1], itemCount: 1,
            enableTimer: false, timerDurationMinutes: 0,
          })}>Responder comprobación</button>
          <button className="secondary-button" onClick={() => onStartQuiz({
            mode: 'area', title: 'Aplicar la ecuación de la circunferencia', itemIds: [2], itemCount: 1,
            enableTimer: false, timerDurationMinutes: 0,
          })}>Practicar en contexto</button>
        </div>
        <p className="text-sm muted">Consulta tus resultados en Mi progreso.</p>
      </article>}

      {/* Blocks Accordion Stack */}
      <div className="space-y-4">
        {pathModel.blocks.map((block: PreparationBlockPath, bIdx: number) => {
          const isExpanded = expandedBlock === block.blockCode;
          return (
            <div
              key={block.blockCode}
              className="overflow-hidden rounded-2xl border border-stone-200 bg-white transition-all dark:border-stone-800 dark:bg-stone-900"
            >
              <button
                type="button"
                onClick={() => setExpandedBlock(isExpanded ? '' : block.blockCode)}
                className="flex w-full items-center justify-between p-5 text-left transition hover:bg-stone-50/70 dark:hover:bg-stone-800/50"
                aria-expanded={isExpanded}
              >
                <div className="flex items-center gap-3.5">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {bIdx + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold text-stone-900 dark:text-stone-100">{block.blockCode}</h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      {block.totalPoints} puntos en examen • {block.affirmations.length} objetivos • {block.totalAvailableItems} ítems disponibles
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="size-5 text-stone-400" />
                  ) : (
                    <ChevronRight className="size-5 text-stone-400" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-stone-100 bg-stone-50/40 p-5 dark:border-stone-800 dark:bg-stone-950/30">
                  <div className="space-y-3">
                    {block.affirmations.map((aff) => (
                      <div
                        key={aff.code}
                        className="flex flex-col justify-between gap-3 rounded-xl border border-stone-200/80 bg-white p-4 shadow-2xs dark:border-stone-800/80 dark:bg-stone-900/90 sm:flex-row sm:items-center"
                      >
                        <div className="space-y-1 sm:max-w-xl">
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-stone-100 px-2 py-0.5 text-xs font-bold text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                              Objetivo
                            </span>
                            <span className="text-xs text-stone-500 dark:text-stone-400">
                              {aff.targetPoints} {aff.targetPoints === 1 ? 'punto' : 'puntos'}
                            </span>
                            <span className="text-xs text-indigo-600 dark:text-indigo-400">
                              {aff.evidenceCodes.length} habilidades
                            </span>
                          </div>
                          <p className="text-sm text-stone-800 dark:text-stone-200">{aff.desc}</p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right text-xs text-stone-500 dark:text-stone-400">
                            <span className="font-medium text-stone-700 dark:text-stone-300">
                              {aff.availableItemsCount}
                            </span>{' '}
                            preguntas
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const config = curriculumService.createCheckpointQuizConfig(
                                block.blockCode,
                                aff.code,
                                5
                              );
                              onStartQuiz(config);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700 active:scale-95"
                          >
                            <Play className="size-3.5 fill-current" />
                            <span>Quiz ({Math.min(5, aff.availableItemsCount || 5)})</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Block Mastery Footnote */}
                  <div className="mt-4 flex items-center justify-between rounded-xl bg-indigo-50/60 px-4 py-2.5 text-xs text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-indigo-600 dark:text-indigo-400" />
                      <span>Completa cada quiz de comprobación para certificar el dominio del bloque.</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
