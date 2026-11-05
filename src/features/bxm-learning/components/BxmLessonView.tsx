import { LearningText as TextRenderer } from './LearningText';
import React from 'react';
import {
  BxmLesson,
  BxmAssessmentCallbacks,
  BxmCapabilityContext
} from '../types';
import { InteractiveCircleVisual } from './visuals/InteractiveCircleVisual';
import { InteractiveSphereCrossSection } from './visuals/InteractiveSphereCrossSection';
import { BxmMicroQuiz } from './BxmMicroQuiz';
import { BxmContentService } from '../services/bxmContentService';
import { AlertTriangle } from 'lucide-react';

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
  capabilities = { isPremium: false },
  onBackToTemario,
  className = ''
}) => {
  const sampleId = BxmContentService.getAllLessons().find(l => l.domain === lesson.domain)?.id;
  if (!capabilities.isPremium && sampleId !== lesson.id) return (
    <article className="space-y-6 max-w-4xl mx-auto p-6 rounded-2xl border-2 border-stone-200 dark:border-stone-800 bg-surface">
      {onBackToTemario && (
        <button
          type="button"
          onClick={onBackToTemario}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
        >
          ← Volver al Temario Digital
        </button>
      )}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded bg-amber-400 text-stone-950">
            Contenido Pro
          </span>
          <span className="text-xs font-mono text-stone-500">Evidencia {lesson.evidenceCode}</span>
        </div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">{lesson.title}</h1>
        <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
          <TextRenderer content={lesson.subtitle} inline />
        </p>
      </div>

      <div className="p-5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 space-y-3">
        <h2 className="text-sm font-bold text-amber-900 dark:text-amber-200">
          Esta lección ampliada está disponible con el Plan Pro
        </h2>
        <p className="text-xs text-stone-700 dark:text-stone-300">
          La lección completa de muestra de cada área temática (Circunferencia, Función Lineal y Medidas de Posición) permanece 100% gratuita. Para acceder a las lecciones ampliadas de todo el temario, activa el Plan Pro.
        </p>
        <div className="action-row pt-1">
          <button
            type="button"
            onClick={onBackToTemario}
            className="secondary-button"
          >
            Ver lecciones gratuitas
          </button>
        </div>
      </div>
    </article>
  );
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
          <TextRenderer content={lesson.subtitle} inline />
        </p>
      </div>

      <p className="text-xs text-stone-500">Contenido de autor revisado mediante controles automáticos; revisión matemática humana pendiente.</p>
      {/* Prerequisites Section */}
      {lesson.prerequisites.length > 0 && (
        <section className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/40">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">
            Prerrequisitos necesarios
          </h2>
          <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-stone-700 dark:text-stone-300">
            {lesson.prerequisites.map((p, idx) => (
              <li key={idx}><TextRenderer content={p} inline /></li>
            ))}
          </ul>
        </section>
      )}

      {/* Key Formulas */}
      {lesson.formulas.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
            Fórmulas Clave
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {lesson.formulas.map((f, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-850 shadow-sm"
              >
                <div className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-1">
                  <TextRenderer content={f.name} inline />
                </div>
                <div className="text-sm font-mono font-bold text-stone-900 dark:text-stone-100 my-1 bg-stone-50 dark:bg-stone-900 px-2 py-1.5 rounded border border-stone-200 dark:border-stone-800">
                  <TextRenderer content={`$${f.latex}$`} inline />
                </div>
                {f.notes && (
                  <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    <TextRenderer content={f.notes} inline />
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
        <p><TextRenderer content={lesson.coreExplanation} inline /></p>
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
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" aria-hidden="true" />
            <span>Errores Comunes en el Examen de Bachillerato</span>
          </h2>
          <div className="space-y-3">
            {lesson.commonMistakes.map((m, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-rose-200 dark:border-rose-950/60 bg-rose-50/50 dark:bg-rose-950/20 space-y-1.5 text-xs sm:text-sm"
              >
                <div className="font-bold text-rose-900 dark:text-rose-300">
                  <TextRenderer content={m.mistake} inline />
                </div>
                <div className="text-stone-700 dark:text-stone-300">
                  <span className="font-semibold text-rose-800 dark:text-rose-400">Error típico:</span> <TextRenderer content={m.description} inline />
                </div>
                <div className="text-stone-700 dark:text-stone-300">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">Cómo evitarlo:</span> <TextRenderer content={m.correction} inline />
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
          <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-sm text-stone-900 dark:text-stone-100 font-medium leading-relaxed">
            <strong className="text-amber-800 dark:text-amber-300 font-bold">Problema:</strong>{' '}
            <TextRenderer content={lesson.workedExample.statement} inline />
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
              <TextRenderer content={lesson.workedExample.primaryMethod.name} inline />
            </h3>
            <div className="space-y-2 text-xs sm:text-sm text-stone-800 dark:text-stone-200 pl-3 border-l-2 border-amber-500 dark:border-amber-400">
              {lesson.workedExample.primaryMethod.steps.map((s, idx) => (
                <div key={idx} className="whitespace-pre-line leading-relaxed"><TextRenderer content={s} inline /></div>
              ))}
            </div>
          </div>

          {lesson.workedExample.alternativeMethod && (
            <div className="space-y-2 pt-3 border-t border-stone-200 dark:border-stone-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                <TextRenderer content={lesson.workedExample.alternativeMethod.name} inline /> (Método Alternativo)
              </h3>
              <div className="space-y-2 text-xs sm:text-sm text-stone-800 dark:text-stone-200 pl-3 border-l-2 border-indigo-500 dark:border-indigo-400">
                {lesson.workedExample.alternativeMethod.steps.map((s, idx) => (
                  <div key={idx} className="whitespace-pre-line leading-relaxed"><TextRenderer content={s} inline /></div>
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

      {/* Direct Transition CTA: Lección -> Práctica */}
      <section className="p-6 rounded-2xl border-2 border-amber-400 dark:border-amber-500/80 bg-gradient-to-br from-amber-50/50 to-amber-100/30 dark:from-amber-950/30 dark:to-stone-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Siguiente paso recomendado</span>
          </div>
          <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
            ¿Listo para poner a prueba esta habilidad?
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-400 max-w-xl">
            Aplica lo aprendido en esta lección con ejercicios de autor diseñados específicamente para la habilidad {lesson.evidenceCode}. Al completar la práctica, podrás comprobar tu dominio.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {callbacks?.onStartTargetedPractice ? (
            <button
              type="button"
              onClick={() => callbacks.onStartTargetedPractice!(lesson.evidenceKey)}
              className="px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-stone-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-sm cursor-pointer"
            >
              Practicar esta habilidad
            </button>
          ) : callbacks?.onRequestDiagnostic ? (
            <button
              type="button"
              onClick={callbacks.onRequestDiagnostic}
              className="px-5 py-3 rounded-xl text-xs font-bold text-stone-800 dark:text-stone-200 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
            >
              Diagnóstico General
            </button>
          ) : null}
        </div>
      </section>
    </article>
  );
};
