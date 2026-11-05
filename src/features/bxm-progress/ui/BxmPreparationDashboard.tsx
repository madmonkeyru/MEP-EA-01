import React, { useState } from 'react';
import type { AttemptEvent, QualifiedEvidenceInfo, LearningCompletion } from '../domain/types';
import {
  computeEvidenceMasteryRecords,
  computeDomainMasterySummaries,
  computeCognitivePerformance,
  computeDifficultyPerformance,
  computeReadinessOverview,
} from '../domain/masteryEngine';
import {
  generatePersonalPracticeQueue,
  generateStructuredStudyPlan,
  evaluateRetestRecommendation,
} from '../recommendations/recommendationsEngine';
import { generateSevenDayReport, calculateActivityStreak } from '../analytics/analyticsEngine';
import type { CapabilityProvider } from '../capabilities/capabilityModel';
import { createCapabilityProvider } from '../capabilities/capabilityModel';
import { BXM_OFFICIAL_EVIDENCES_FIXTURE } from './evidenceCatalogFixture';

export interface BxmPreparationDashboardProps {
  initialTab?: 'overview' | 'evidences' | 'queue' | 'analytics' | 'history';
  events?: AttemptEvent[];
  completions?: LearningCompletion[];
  availableInventoryByEvidence?: Record<string, { totalItems: number }>;
  availableLessonKeys?: string[];
  evidenceCatalog?: QualifiedEvidenceInfo[];
  capabilityProvider?: CapabilityProvider;
  referenceDateUtc?: Date;
  onNavigateToPractice?: (evidenceKey: string, difficultyTier: number) => void;
  onNavigateToLesson?: (evidenceKey: string) => void;
  onOpenUpgradeModal?: () => void;
}

export const BxmPreparationDashboard: React.FC<BxmPreparationDashboardProps> = ({
  initialTab = 'overview',
  events = [],
  completions = [],
  availableInventoryByEvidence = {},
  availableLessonKeys = [],
  evidenceCatalog = BXM_OFFICIAL_EVIDENCES_FIXTURE,
  capabilityProvider = createCapabilityProvider('free'),
  referenceDateUtc = new Date(),
  onNavigateToPractice,
  onNavigateToLesson,
  onOpenUpgradeModal,
}) => {
  const [selectedDomain, setSelectedDomain] = useState<'all' | 'geometry' | 'functions' | 'statistics'>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'evidences' | 'queue' | 'analytics' | 'history'>(initialTab);

  const canAccessDashboard = capabilityProvider.canAccess('longitudinal_mastery_dashboard');
  const canAccessQueue = capabilityProvider.canAccess('personalized_practice_queue');
  const canAccessReports = capabilityProvider.canAccess('weekly_progress_reports_and_streaks');

  // Compute domain & evidence metrics
  const evidenceRecords = computeEvidenceMasteryRecords(evidenceCatalog, events, referenceDateUtc);
  const domainSummaries = computeDomainMasterySummaries(evidenceRecords);
  const cognitiveSummary = computeCognitivePerformance(events, referenceDateUtc);
  const difficultySummary = computeDifficultyPerformance(events, referenceDateUtc);
  const readiness = computeReadinessOverview(evidenceRecords, events, referenceDateUtc);

  // Recommendations
  const queue = generatePersonalPracticeQueue(evidenceRecords, evidenceCatalog, { limit: 6, availableInventoryByEvidence });
  const studyPlan = generateStructuredStudyPlan(evidenceRecords, evidenceCatalog, { availableInventoryByEvidence, availableLessonKeys, now: referenceDateUtc });
  const retestRec = evaluateRetestRecommendation(evidenceRecords, readiness.totalAuthoredQualifyingResponses);

  // Analytics
  const sevenDayReport = generateSevenDayReport(events, referenceDateUtc, 'America/Costa_Rica', completions);
  const streak = calculateActivityStreak(events, referenceDateUtc, 'America/Costa_Rica', completions);

  const filteredEvidences = selectedDomain === 'all'
    ? evidenceRecords
    : evidenceRecords.filter((e) => e.domain === selectedDomain);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 space-y-6 text-stone-900 dark:text-stone-100 font-sans">
      {/* Top Header */}
      <header className="border-b border-stone-200 dark:border-stone-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-amber-400 text-stone-950">
              BXM Matemática 02-2026
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
              Preparación independiente
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-stone-950 dark:text-stone-50">
            Panel de Preparación Formativa
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-0.5">
            Seguimiento de avance por indicador, desglose cognitivo y plan de estudio adaptativo.
          </p>
        </div>

        {/* Plan Tier Badge */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-xs text-stone-500 dark:text-stone-400">Nivel de cuenta</span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded ${
              capabilityProvider.getTier() === 'premium'
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                : 'bg-stone-200 dark:bg-stone-800 text-stone-750 dark:text-stone-300'
            }`}>
              {capabilityProvider.getTier() === 'premium' ? 'Plan Premium Activo' : 'Cuenta Gratuita'}
            </span>
          </div>

          {!canAccessDashboard && (
            <button
              onClick={onOpenUpgradeModal}
              className="px-3 py-1.5 text-xs font-bold rounded bg-amber-500 hover:bg-amber-400 text-stone-950 transition-colors shadow-sm"
            >
              Desbloquear Premium
            </button>
          )}
        </div>
      </header>

      {/* Mandatory MEP Formative Disclaimer */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 p-3 sm:p-4 rounded-r-xl text-xs sm:text-sm text-amber-950 dark:text-amber-100 flex items-start gap-3 border-y border-r border-amber-200 dark:border-amber-900/60 shadow-xs">
        <span className="text-lg leading-none select-none">ℹ️</span>
        <div>
          <p className="font-bold text-amber-950 dark:text-amber-200">Indicador de estudio:</p>
          <p className="mt-0.5 leading-relaxed text-stone-750 dark:text-stone-300">{readiness.disclaimerEs}</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 overflow-x-auto pb-1 text-sm">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-2 font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          Resumen General
        </button>
        <button
          onClick={() => setActiveTab('evidences')}
          className={`px-3 py-2 font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'evidences'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          Dominio por Evidencia ({evidenceCatalog.length})
        </button>
        <button
          onClick={() => setActiveTab('queue')}
          className={`px-3 py-2 font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'queue'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          Cola de Práctica
          {queue.length > 0 && (
            <span className="text-xs px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold">
              {queue.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-3 py-2 font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          Racha e Informes (7 Días)
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-3 py-2 font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'history'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          Historial de Intentos ({events.length})
        </button>
      </nav>

      {/* Free Tier Gating Callout (if longitudinal dashboard is restricted) */}
      {!canAccessDashboard && (
        <div className="bg-stone-100 dark:bg-stone-850 border border-stone-300 dark:border-stone-700 p-6 rounded-lg text-center space-y-3">
          <div className="inline-block p-2 rounded-full bg-amber-400/20 text-amber-700 dark:text-amber-300 text-2xl">
            🔒
          </div>
          <h3 className="text-lg font-bold">Función Longitudinal Reservada para el Plan Pro</h3>
          <p className="text-sm text-stone-600 dark:text-stone-400 max-w-xl mx-auto">
            El examen oficial de 60 preguntas, el temario de referencia y las lecciones muestra son 100% gratuitos.
            Para desbloquear el seguimiento detallado de tus 71 evidencias, la cola inteligente de refuerzo y los informes de 7 días, suscríbete al Plan BXM Pro.
          </p>
          <button
            onClick={onOpenUpgradeModal}
            className="px-5 py-2 rounded bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm transition-colors shadow-sm"
          >
            Ver Planes de Suscripción
          </button>
        </div>
      )}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Stat Cards */}
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-stone-50 dark:bg-stone-850 p-4 rounded-lg border border-stone-200 dark:border-stone-800">
              <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">Precisión Observada</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-50 mt-1">
                {readiness.overallAuthoredAccuracyPercentage}%
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                {readiness.totalAuthoredQualifyingResponses} respuestas calificadas
              </div>
            </div>

            <div className="bg-stone-50 dark:bg-stone-850 p-4 rounded-lg border border-stone-200 dark:border-stone-800">
              <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">Evidencias Medidas</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-50 mt-1">
                {readiness.measuredEvidencesCount} / 71
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                {readiness.sufficientlySampledEvidencesCount} con muestra suficiente (≥5)
              </div>
            </div>

            <div className="bg-stone-50 dark:bg-stone-850 p-4 rounded-lg border border-stone-200 dark:border-stone-800">
              <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">Estado de Dominio</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                {readiness.masteredEvidencesCount}
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                {readiness.inProgressEvidencesCount} en progreso · {readiness.needsReinforcementEvidencesCount} en refuerzo
              </div>
            </div>

            <div className="bg-stone-50 dark:bg-stone-850 p-4 rounded-lg border border-stone-200 dark:border-stone-800">
              <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">Racha de Estudio</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                <span>🔥</span> {streak.currentStreakDays} {streak.currentStreakDays === 1 ? 'día' : 'días'}
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                {streak.isActiveToday ? 'Activo hoy en Costa Rica' : 'Completa un ejercicio hoy'}
              </div>
            </div>
          </section>

          {/* Domain Breakdown Cards */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold">Dominio por Área Temática</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['geometry', 'functions', 'statistics'] as const).map((dom) => {
                const s = domainSummaries[dom];
                return (
                  <div
                    key={dom}
                    className="bg-white dark:bg-stone-850 p-4 rounded-lg border border-stone-200 dark:border-stone-800 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                          {dom === 'geometry' ? '23 pts' : dom === 'functions' ? '25 pts' : '12 pts'}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800">
                          {s.measuredEvidencesCount} de {s.totalAssignedEvidences} medidas
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-stone-900 dark:text-stone-50 mt-1">{s.labelEs}</h3>
                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-2xl font-black">{s.overallAccuracyPercentage}%</span>
                        <span className="text-xs text-stone-500">precisión observada</span>
                      </div>
                      <div className="w-full bg-stone-200 dark:bg-stone-700 h-2 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className="bg-amber-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, s.overallAccuracyPercentage)}%` }}
                        />
                      </div>
                      <div className="text-xs text-stone-500 mt-2 space-y-0.5">
                        <p>Dominadas: <strong className="text-emerald-600 dark:text-emerald-400">{s.masteredCount}</strong></p>
                        <p>En progreso: <strong>{s.inProgressCount}</strong></p>
                        <p>Requiere refuerzo: <strong className="text-red-600 dark:text-red-400">{s.needsReinforcementCount}</strong></p>
                        <p>Datos insuficientes: <strong>{s.insufficientDataCount}</strong></p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedDomain(dom);
                        setActiveTab('evidences');
                      }}
                      className="mt-4 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline text-left"
                    >
                      Ver indicadores de {s.labelEs} →
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Cognitive Level and Difficulty Breakdown */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cognitive */}
            <div className="bg-white dark:bg-stone-850 p-4 rounded-lg border border-stone-200 dark:border-stone-800 space-y-3">
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">Desempeño por Nivel Cognitivo</h3>
              <div className="space-y-2.5">
                {cognitiveSummary.map((cog) => (
                  <div key={cog.cognitiveLevel} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span>{cog.labelEs} ({cog.correctCount}/{cog.totalCount})</span>
                      <span className="font-bold">{cog.accuracyPercentage}%</span>
                    </div>
                    <div className="w-full bg-stone-200 dark:bg-stone-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full rounded-full"
                        style={{ width: `${cog.accuracyPercentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div className="bg-white dark:bg-stone-850 p-4 rounded-lg border border-stone-200 dark:border-stone-800 space-y-3">
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">Desempeño por Nivel de Dificultad</h3>
              <div className="space-y-2.5">
                {difficultySummary.map((diff) => (
                  <div key={diff.difficulty} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span>{diff.labelEs} ({diff.correctCount}/{diff.totalCount})</span>
                      <span className="font-bold">{diff.accuracyPercentage}%</span>
                    </div>
                    <div className="w-full bg-stone-200 dark:bg-stone-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-teal-500 h-full rounded-full"
                        style={{ width: `${diff.accuracyPercentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Next Recommended Activity Widget */}
          <section className="bg-stone-50 dark:bg-stone-850 p-5 rounded-lg border border-stone-200 dark:border-stone-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-amber-600 dark:text-amber-400">
                Siguiente Paso Recomendado
              </span>
              <h3 className="text-base sm:text-lg font-bold text-stone-950 dark:text-stone-50 mt-0.5">
                {queue.length > 0 ? queue[0].reasonLabelEs : 'Explorar el Temario Digital'}
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 max-w-xl">
                {queue.length > 0
                  ? `${queue[0].rawCode}: ${queue[0].evidenceDescription || queue[0].evidenceKey}`
                  : 'Comienza realizando ejercicios o un diagnóstico rápido para calibrar tus indicadores.'}
              </p>
            </div>

            {queue.length > 0 && onNavigateToPractice && (
              <button
                onClick={() => onNavigateToPractice(queue[0].evidenceKey, queue[0].targetDifficulty)}
                className="px-4 py-2 text-xs font-bold rounded bg-amber-500 hover:bg-amber-400 text-stone-950 transition-colors shadow-sm whitespace-nowrap"
              >
                Comenzar Ejercicio →
              </button>
            )}
          </section>
        </div>
      )}

      {/* TAB 2: EVIDENCES */}
      {activeTab === 'evidences' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-lg font-bold">Matriz de Evidencias BXM ({filteredEvidences.length})</h2>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-stone-500">Filtrar por área:</span>
              <button
                onClick={() => setSelectedDomain('all')}
                className={`px-2.5 py-1 rounded font-medium ${
                  selectedDomain === 'all'
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setSelectedDomain('geometry')}
                className={`px-2.5 py-1 rounded font-medium ${
                  selectedDomain === 'geometry'
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                }`}
              >
                Geometría
              </button>
              <button
                onClick={() => setSelectedDomain('functions')}
                className={`px-2.5 py-1 rounded font-medium ${
                  selectedDomain === 'functions'
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                }`}
              >
                Funciones
              </button>
              <button
                onClick={() => setSelectedDomain('statistics')}
                className={`px-2.5 py-1 rounded font-medium ${
                  selectedDomain === 'statistics'
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                }`}
              >
                Estadística
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-stone-200 dark:border-stone-800 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100 dark:bg-stone-800/60 text-stone-700 dark:text-stone-300 border-b border-stone-200 dark:border-stone-800 uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-3">Código</th>
                  <th className="p-3">Área</th>
                  <th className="p-3">Descripción Oficial</th>
                  <th className="p-3">Muestra Calificada</th>
                  <th className="p-3">Precisión</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                {filteredEvidences.map((ev) => (
                  <tr key={ev.evidenceKey} className="hover:bg-stone-50 dark:hover:bg-stone-800/40">
                    <td className="p-3 font-mono font-bold whitespace-nowrap">{ev.rawCode}</td>
                    <td className="p-3 capitalize">{ev.domain === 'functions' ? 'Álgebra/Funciones' : ev.domain}</td>
                    <td className="p-3 max-w-md text-stone-700 dark:text-stone-300">
                      {ev.description || ev.evidenceKey}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="font-semibold">{ev.sampleSizeLabel}</span>
                    </td>
                    <td className="p-3 font-bold whitespace-nowrap">
                      {ev.totalQualifyingCount > 0 ? `${ev.accuracyPercentage}%` : '—'}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          ev.status === 'mastered'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : ev.status === 'in_progress'
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                            : ev.status === 'needs_reinforcement'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                            : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                        }`}
                      >
                        {ev.statusLabelEs}
                      </span>
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {onNavigateToLesson && availableLessonKeys.includes(ev.evidenceKey) && (
                          <button
                            onClick={() => onNavigateToLesson(ev.evidenceKey)}
                            className="px-2 py-1 rounded bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 font-semibold"
                          >
                            Lección
                          </button>
                        )}
                        {onNavigateToPractice && (availableInventoryByEvidence[ev.evidenceKey]?.totalItems ?? 0) > 0 && (
                          <button
                            onClick={() => onNavigateToPractice(ev.evidenceKey, ev.recommendedDifficultyTier)}
                            className="px-2 py-1 rounded bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold"
                          >
                            Practicar N{ev.recommendedDifficultyTier}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: QUEUE */}
      {activeTab === 'queue' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Cola de Práctica y Plan de Refuerzo</h2>
              <p className="text-xs text-stone-500">
                Prioriza evidencias que requieren calibración y aquellas con bajo porcentaje de precisión.
              </p>
            </div>
            {!canAccessQueue && (
              <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">
                🔒 Vista previa de cola (requiere Pro)
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {queue.map((item, idx) => (
              <div
                key={item.id}
                className="bg-white dark:bg-stone-850 p-4 rounded-lg border border-stone-200 dark:border-stone-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                      Prioridad #{idx + 1} · {item.rawCode}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 font-semibold">
                      Nivel {item.targetDifficulty} ({item.estimatedMinutes} min)
                    </span>
                  </div>
                  <h3 className="text-sm font-bold mt-1 text-stone-900 dark:text-stone-50">
                    {item.reasonLabelEs}
                  </h3>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                    {item.evidenceDescription || item.evidenceKey}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                  <span className="text-xs text-stone-500">
                    {item.isAvailableInAuthoredInventory ? 'Ejercicios disponibles' : 'Próximamente en banco'}
                  </span>
                  {onNavigateToPractice && item.isAvailableInAuthoredInventory && (
                    <button
                      onClick={() => onNavigateToPractice(item.evidenceKey, item.targetDifficulty)}
                      className="px-3 py-1.5 text-xs font-bold rounded bg-amber-500 hover:bg-amber-400 text-stone-950"
                    >
                      Iniciar Práctica →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Structured Study Plan */}
          <section className="bg-stone-50 dark:bg-stone-850 p-5 rounded-lg border border-stone-200 dark:border-stone-800 space-y-4">
            <div>
              <h3 className="text-base font-bold">Plan de Estudio Estructurado</h3>
              <p className="text-xs text-stone-500 mt-0.5">{studyPlan.focusSummaryEs}</p>
            </div>

            <ol className="space-y-3">
              {studyPlan.steps.map((st) => (
                <li
                  key={st.stepNumber}
                  className="bg-white dark:bg-stone-900 p-3 rounded border border-stone-200 dark:border-stone-800 flex items-start gap-3"
                >
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-bold text-xs flex items-center justify-center shrink-0">
                    {st.stepNumber}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold">{st.title}</h4>
                      <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-500">
                        {st.recommendedActivity}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">{st.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Retest Recommendation */}
          <section className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 p-4 rounded-lg flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                Recomendación de Retest
              </span>
              <p className="text-xs text-blue-900 dark:text-blue-200 mt-0.5">{retestRec.rationaleEs}</p>
            </div>
            {retestRec.shouldRetest && (
              <span className="text-xs font-bold px-3 py-1.5 rounded bg-blue-600 text-white whitespace-nowrap">
                {retestRec.recommendedItemCount} preguntas sugeridas
              </span>
            )}
          </section>
        </div>
      )}

      {/* TAB 4: ANALYTICS (7-DAY REPORT & STREAKS) */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Informe de Aprendizaje (Últimos 7 Días)</h2>
              <p className="text-xs text-stone-500">
                Ventana móvil del {sevenDayReport.windowStartDateIso} al {sevenDayReport.windowEndDateIso} (hora oficial de Costa Rica).
              </p>
            </div>
            {!canAccessReports && (
              <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">
                🔒 Vista previa de analítica (requiere Pro)
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-stone-850 p-4 rounded-lg border border-stone-200 dark:border-stone-800">
              <span className="text-xs text-stone-500">Eventos de respuesta</span>
              <div className="text-2xl font-black mt-1">{sevenDayReport.totalResponseEvents}</div>
              <span className="text-xs text-stone-400">{sevenDayReport.totalUniqueQuestions} preguntas únicas</span>
            </div>
            <div className="bg-white dark:bg-stone-850 p-4 rounded-lg border border-stone-200 dark:border-stone-800">
              <span className="text-xs text-stone-500">Familias independientes</span>
              <div className="text-2xl font-black mt-1">{sevenDayReport.totalDistinctFamilies}</div>
              <span className="text-xs text-stone-400">plantillas evaluadas</span>
            </div>
            <div className="bg-white dark:bg-stone-850 p-4 rounded-lg border border-stone-200 dark:border-stone-800">
              <span className="text-xs text-stone-500">Sesiones concluidas</span>
              <div className="text-2xl font-black mt-1">{sevenDayReport.totalCompletedSessions}</div>
              <span className="text-xs text-stone-400">en esta semana</span>
            </div>
            <div className="bg-white dark:bg-stone-850 p-4 rounded-lg border border-stone-200 dark:border-stone-800">
              <span className="text-xs text-stone-500">Precisión de respuestas (incluye reintentos)</span>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                {sevenDayReport.overallAccuracyPercentage}%
              </div>
              {sevenDayReport.comparisonWithPriorWeek && (
                <span className="text-xs text-emerald-600 font-semibold">
                  {sevenDayReport.comparisonWithPriorWeek.accuracyDeltaPercentagePoints >= 0 ? '+' : ''}
                  {sevenDayReport.comparisonWithPriorWeek.accuracyDeltaPercentagePoints} pts vs. semana anterior
                </span>
              )}
            </div>
          </div>

          {/* Daily Bar Chart */}
          <section className="bg-white dark:bg-stone-850 p-5 rounded-lg border border-stone-200 dark:border-stone-800 space-y-3">
            <h3 className="text-sm font-bold">Actividad Diaria Registrada</h3>
            <div className="grid grid-cols-7 gap-2 pt-4">
              {sevenDayReport.days.map((day) => {
                const maxExpected = 20;
                const barHeight = Math.min(100, Math.round((day.responseEventsCount / maxExpected) * 100));
                return (
                  <div key={day.dateIso} className="flex flex-col items-center gap-1.5">
                    <span className="text-[11px] font-bold text-stone-600 dark:text-stone-400">
                      {day.responseEventsCount}
                    </span>
                    <div className="w-full bg-stone-100 dark:bg-stone-800 h-24 rounded flex items-end p-1">
                      <div
                        className="w-full bg-amber-500 rounded transition-all duration-300"
                        style={{ height: `${Math.max(4, barHeight)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-stone-500 font-mono truncate w-full text-center">
                      {day.dateIso.slice(5)}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* TAB 5: HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Historial de Respuestas ({events.length})</h2>
            <span className="text-xs text-stone-500">
              Separa intentos de referencia oficial de la maestría formativa de autoría.
            </span>
          </div>

          {events.length === 0 ? (
            <div className="bg-stone-50 dark:bg-stone-850 p-8 rounded-lg border border-stone-200 dark:border-stone-800 text-center text-sm text-stone-500">
              No hay respuestas registradas en esta sesión. Completa una práctica para visualizar tu historial.
            </div>
          ) : (
            <div className="overflow-x-auto border border-stone-200 dark:border-stone-800 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-100 dark:bg-stone-800/60 uppercase font-bold tracking-wider">
                  <tr>
                    <th className="p-2.5">Fecha</th>
                    <th className="p-2.5">Ítem</th>
                    <th className="p-2.5">Procedencia</th>
                    <th className="p-2.5">Evidencia</th>
                    <th className="p-2.5">Nivel</th>
                    <th className="p-2.5">Respuesta</th>
                    <th className="p-2.5">Calificación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                  {events.slice(-20).reverse().map((ev) => (
                    <tr key={ev.eventId} className="hover:bg-stone-50 dark:hover:bg-stone-800/40">
                      <td className="p-2.5 font-mono text-stone-500 whitespace-nowrap">
                        {ev.timestamp.slice(0, 10)} {ev.timestamp.slice(11, 16)}
                      </td>
                      <td className="p-2.5 font-mono font-semibold">{ev.itemId}</td>
                      <td className="p-2.5 whitespace-nowrap">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          ev.provenance === 'official_reference'
                            ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300'
                            : ev.provenance === 'authored_mastery'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                            : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                        }`}>
                          {ev.provenance}
                        </span>
                      </td>
                      <td className="p-2.5 font-mono">{ev.primaryEvidenceKey.split('/').pop()}</td>
                      <td className="p-2.5 capitalize">{ev.cognitiveLevel} N{ev.difficulty}</td>
                      <td className="p-2.5 font-mono">{ev.selectedOption} / {ev.correctAnswer}</td>
                      <td className="p-2.5 font-bold">
                        {ev.isCorrect ? (
                          <span className="text-emerald-600">✓ Correcta</span>
                        ) : (
                          <span className="text-red-500">✗ Incorrecta</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
