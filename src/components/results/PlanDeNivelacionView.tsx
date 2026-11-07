import { useState } from 'react';
import { ArrowRight, BookOpen, CheckCircle, ChevronDown, ChevronUp, Sparkles, Target } from 'lucide-react';
import type { PracticeConfig } from '../../types';
import type { RemediationPlan } from '../../services/remediationEngine';
import { saveActiveRemediationPlan } from '../../services/remediationEngine';
import { TextRenderer } from '../common/TextRenderer';

export function PlanDeNivelacionView({
  plan,
  onLaunchRemediationPractice,
  onViewFormulaSheet,
  onLaunchGuidedPractice,
  evidenceLabel,
}: {
  plan: RemediationPlan;
  onLaunchRemediationPractice: (config: PracticeConfig) => void;
  onLaunchGuidedPractice?: (evidenceKey: string) => void;
  evidenceLabel?: (evidenceKey: string) => string;
  onViewFormulaSheet?: (conceptId: string) => void;
}) {
  const [expandedConcept, setExpandedConcept] = useState<string | null>(plan.topPriorityDrilldowns[0]?.conceptId || null);

  const handleStartDrilldown = (conceptId: string, itemIds: number[], title: string) => {
    saveActiveRemediationPlan(plan);
    onLaunchRemediationPractice({
      mode: 'concept_drilldown',
      programId: plan.targetProgram || 'bxm',
      subjectId: plan.targetSubject || 'matematicas',
      conceptId,
      itemIds: itemIds.length > 0 ? itemIds : undefined,
      itemCount: itemIds.length > 0 ? itemIds.length : 5,
      title: `Plan de Nivelación · ${title}`,
      enableTimer: false,
      timerDurationMinutes: 0,
    });
  };

  return (
    <section className="rounded-3xl border-2 border-indigo-200 dark:border-indigo-900 bg-surface p-6 sm:p-8 space-y-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Sparkles className="size-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Refuerzo por concepto
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ink">
            Tu Plan Personalizado de Nivelación
          </h2>
          <p className="text-sm text-muted max-w-2xl">
            Generado a partir de tus respuestas. Prioriza los conceptos por reforzar en este intento; puedes practicar y comprobar tu avance.
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-paper px-4 py-3 text-right">
          <span className="text-xs text-muted block">Efectividad Global</span>
          <span className="text-3xl font-black text-ink tabular-nums">{plan.overallScore}%</span>
        </div>
      </div>

      {/* Domain Readiness Cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        {plan.domainSummaries.map((summary) => {
          const statusColors = {
            critical: 'border-amber-300 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200',
            needs_reinforcement: 'border-indigo-200 dark:border-indigo-900 bg-indigo-50/30 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-200',
            mastered: 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/30 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200',
          };
          const statusLabels = {
            critical: 'Prioridad Urgente',
            needs_reinforcement: 'Reforzar Conceptos',
            mastered: 'Buen resultado en este intento',
          };

          return (
            <div key={summary.domain} className={`rounded-2xl border p-4 flex flex-col justify-between ${statusColors[summary.status]}`}>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">{statusLabels[summary.status]}</span>
                  <span className="text-lg font-bold tabular-nums">{summary.accuracyPercentage}%</span>
                </div>
                <h4 className="mt-1 font-bold text-base text-ink">{summary.label}</h4>
              </div>
              <p className="mt-2 text-xs opacity-80">
                {summary.totalQuestions - summary.incorrectQuestions} de {summary.totalQuestions} preguntas correctas
              </p>
            </div>
          );
        })}
      </div>

      {/* Prioritized Concepts Accordion / Action List */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-ink flex items-center gap-2">
          <Target className="size-5 text-indigo-600 dark:text-indigo-400" />
          Ruta de Refuerzo Prioritaria ({plan.topPriorityDrilldowns.length} Conceptos Clave)
        </h3>

        <div className="space-y-3">
          {plan.topPriorityDrilldowns.map((concept) => {
            const isExpanded = expandedConcept === concept.conceptId;

            return (
              <div
                key={concept.conceptId}
                className="rounded-2xl border border-line bg-paper overflow-hidden transition-all duration-200"
              >
                <div
                  className="p-4 cursor-pointer flex flex-wrap items-center justify-between gap-3 hover:bg-surface/50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`size-3 rounded-full shrink-0 ${concept.priority === 'high' ? 'bg-amber-500' : 'bg-indigo-500'}`} />
                    <div className="min-w-0">
                      <h4 className="font-bold text-ink text-base truncate">{concept.conceptName}</h4>
                      <p className="text-xs text-muted">
                        Precisión: {concept.accuracyPercentage}% · {concept.incorrectQuestions} de {concept.totalQuestions} falladas
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {onLaunchGuidedPractice ? concept.evidenceKeys?.map(key => <button key={key} data-evidence-key={key} className="secondary-button" onClick={event => { event.stopPropagation(); onLaunchGuidedPractice(key); }}>Practicar: {evidenceLabel?.(key) || key}</button>) : <button
                      onClick={event => { event.stopPropagation(); handleStartDrilldown(concept.conceptId, concept.recommendedPracticeItems, concept.conceptName); }}
                      className="secondary-button" disabled={!concept.recommendedPracticeItems.length}
                    >Practicar este concepto<ArrowRight className="size-3.5" /></button>}
                    <button type="button" className="icon-button" aria-label={`Detalles de ${concept.conceptName}`} aria-expanded={isExpanded} onClick={() => setExpandedConcept(isExpanded ? null : concept.conceptId)}>{isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}</button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-line/60 bg-surface/30 space-y-3 text-sm">
                    {concept.suggestedFormulaSheets.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
                          <BookOpen className="size-3.5" />
                          Fórmulas Oficiales Clave:
                        </span>
                        <div className="rounded-xl bg-paper p-3 border border-line space-y-1.5">
                          {concept.suggestedFormulaSheets.map((formula, idx) => (
                            <div key={idx} className="text-xs font-mono text-ink">
                              <TextRenderer content={formula} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                      <span className="text-muted">
                        Modo recomendado: {concept.recommendedPracticeItems.length} preguntas focalizadas sin límite de tiempo.
                      </span>
                      {onViewFormulaSheet && (
                        <button
                          onClick={() => onViewFormulaSheet(concept.conceptId)}
                          className="text-link font-semibold inline-flex items-center gap-1"
                        >
                          Ver ficha en la Biblioteca
                          <ArrowRight className="size-3" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Suggested next steps */}
      <div className="rounded-2xl border border-line bg-paper p-4 space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted">Próximos Pasos Sugeridos</h4>
        <ul className="space-y-1.5 text-xs text-ink">
          {plan.suggestedNextSteps.map((step, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <CheckCircle className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
