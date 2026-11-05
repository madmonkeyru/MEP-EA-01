import React from 'react';
import {
  BxmLesson,
  BxmAssessmentCallbacks,
  BxmCapabilityContext
} from '../types';
import { InteractiveCircleVisual } from './visuals/InteractiveCircleVisual';
import { InteractiveSphereCrossSection } from './visuals/InteractiveSphereCrossSection';
import { BxmMicroQuiz } from './BxmMicroQuiz';

export interface BxmLessonViewProps {
  lesson: BxmLesson;
  callbacks?: BxmAssessmentCallbacks;
  capabilities?: BxmCapabilityContext;
  onBackToTemario?: () => void;
  className?: string;
}

export const BxmLessonView: React.FC<BxmLessonViewProps> = ({
  lesson,
  callbacks,
  capabilities = { isPremium: true },
  onBackToTemario,
  className = ''
}) => {
  return (
    <article className={`space-y-8 max-w-4xl mx-auto ${className}`}>
      {/* Header & Navigation Breadcrumb */}
      <div className="space-y-3">
        {onBackToTemario && (
          <button
            type="button"
            onClick={onBackToTemario}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
          >
            ← Volver al Temario Digital
          </button>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
            {lesson.domain === 'geometry' ? 'Geometría' : lesson.domain === 'functions' ? 'Relaciones y Álgebra' : 'Estadística'}
          </span>
          <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
            Evidencia {lesson.evidenceCode}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
          {lesson.title}
        </h1>
        <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 leading-relaxed">
          {lesson.subtitle}
        </p>
      </div>

      {/* Prerequisites Section */}
      {lesson.prerequisites.length > 0 && (
        <section className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/40">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">
            Prerrequisitos necesarios
          </h2>
          <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-stone-700 dark:text-stone-300">
            {lesson.prerequisites.map((p, idx) => (
              <li key={idx}>{p}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Key Formulas */}
      {lesson.formulas.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
            Fórmulas Clave Oficiales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {lesson.formulas.map((f, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-850 shadow-sm"
              >
                <div className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-1">
                  {f.name}
                </div>
                <div className="text-sm font-mono font-bold text-stone-900 dark:text-stone-100 my-1 bg-stone-50 dark:bg-stone-900 px-2 py-1.5 rounded border border-stone-200 dark:border-stone-800">
                  ${f.latex}$
                </div>
                {f.notes && (
                  <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    {f.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Core Explanation */}
      <section className="space-y-3 prose dark:prose-invert max-w-none text-stone-700 dark:text-stone-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
        <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
          Fundamento Teórico y Geométrico
        </h2>
        <p>{lesson.coreExplanation}</p>
      </section>

      {/* Interactive Visual Section */}
      {lesson.interactiveVisualType && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
            Laboratorio Interactivo
          </h2>
          {lesson.interactiveVisualType === 'circle_inspector' && (
            <InteractiveCircleVisual />
          )}
          {lesson.interactiveVisualType === 'sphere_cross_section' && (
            <InteractiveSphereCrossSection />
          )}
        </section>
      )}

      {/* Common Mistakes */}
      {lesson.commonMistakes.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <span>⚠️</span> Errores Comunes en el Examen de Bachillerato
          </h2>
          <div className="space-y-3">
            {lesson.commonMistakes.map((m, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-rose-200 dark:border-rose-950/60 bg-rose-50/50 dark:bg-rose-950/20 space-y-1.5 text-xs sm:text-sm"
              >
                <div className="font-bold text-rose-900 dark:text-rose-300">
                  {m.mistake}
                </div>
                <div className="text-stone-700 dark:text-stone-300">
                  <span className="font-semibold text-rose-800 dark:text-rose-400">Error típico:</span> {m.description}
                </div>
                <div className="text-stone-700 dark:text-stone-300">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">Cómo evitarlo:</span> {m.correction}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Worked Example with Multiple Methods */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
          Ejemplo Resuelto Paso a Paso
        </h2>
        <div className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm space-y-4">
          <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-sm text-stone-900 dark:text-stone-100 font-medium">
            <strong className="text-amber-800 dark:text-amber-400">Problema:</strong> {lesson.workedExample.statement}
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {lesson.workedExample.primaryMethod.name}
            </h3>
            <div className="space-y-2 text-xs sm:text-sm text-stone-700 dark:text-stone-300 pl-2 border-l-2 border-amber-400">
              {lesson.workedExample.primaryMethod.steps.map((s, idx) => (
                <div key={idx} className="whitespace-pre-line">{s}</div>
              ))}
            </div>
          </div>

          {lesson.workedExample.alternativeMethod && (
            <div className="space-y-2 pt-3 border-t border-stone-200 dark:border-stone-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {lesson.workedExample.alternativeMethod.name} (Método Alternativo)
              </h3>
              <div className="space-y-2 text-xs sm:text-sm text-stone-700 dark:text-stone-300 pl-2 border-l-2 border-indigo-400">
                {lesson.workedExample.alternativeMethod.steps.map((s, idx) => (
                  <div key={idx} className="whitespace-pre-line">{s}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Embedded Micro-Quiz */}
      {lesson.microQuiz.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
            Comprobación de Aprendizaje
          </h2>
          <div className="space-y-4">
            {lesson.microQuiz.map((quiz) => (
              <BxmMicroQuiz
                key={quiz.id}
                quiz={quiz}
                evidenceKey={lesson.evidenceKey}
                onAnswered={callbacks?.onMicroQuizAnswered}
              />
            ))}
          </div>
        </section>
      )}

      {/* Related Practice CTA */}
      <section className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-850 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
            ¿Listo para poner a prueba esta evidencia?
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-400">
            Practique preguntas de autor con distractores analizados para la evidencia {lesson.evidenceCode}.
          </p>
        </div>
        <div className="flex gap-2">
          {callbacks?.onStartTargetedPractice && (
            <button
              type="button"
              onClick={() => callbacks.onStartTargetedPractice!(lesson.evidenceKey)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-sm"
            >
              Practicar Evidencia
            </button>
          )}
          {callbacks?.onRequestDiagnostic && capabilities.isPremium && (
            <button
              type="button"
              onClick={callbacks.onRequestDiagnostic}
              className="px-4 py-2 rounded-xl text-xs font-bold text-stone-800 dark:text-stone-200 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 transition-colors"
            >
              Diagnóstico General
            </button>
          )}
        </div>
      </section>
    </article>
  );
};
