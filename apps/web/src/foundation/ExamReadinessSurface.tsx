import { useMemo } from 'react';
import { Award, Compass, TrendingUp, CheckCircle, AlertTriangle, Play, RefreshCw } from 'lucide-react';
import { tokens } from '@mep-ea/design-system';
import { deriveExamReadiness, type ExamReadinessOverview } from '@mep-ea/learning-runtime';
import type { LongitudinalMetricsResponse } from '@mep-ea/api';

export interface ExamReadinessSurfaceProps {
  metrics: LongitudinalMetricsResponse['metrics'] | null;
  priorityWeakness?: { evidenceKey?: string; domainName?: string };
  onNavigateToDiagnostic: () => void;
  onNavigateToPractice: (evidenceKey?: string) => void;
  onNavigateToSimulation: () => void;
}

export function ExamReadinessSurface({
  metrics,
  priorityWeakness,
  onNavigateToDiagnostic,
  onNavigateToPractice,
  onNavigateToSimulation,
}: ExamReadinessSurfaceProps) {
  const readiness: ExamReadinessOverview = useMemo(() => {
    return deriveExamReadiness(
      metrics?.learnerId ?? 'anonymous',
      {
        totalAttempts: metrics?.totalAttempts ?? 0,
        overallAccuracy: metrics?.overallAccuracy ?? null,
        loopCounts: metrics?.loopCounts ?? { diagnostic: 0, practice: 0, mock: 0, simulation: 0 },
        domainCoverage: metrics?.domainCoverage ?? {},
      },
      priorityWeakness
    );
  }, [metrics, priorityWeakness]);

  const handleAction = () => {
    if (readiness.recommendedAction.type === 'diagnostic') {
      onNavigateToDiagnostic();
    } else if (readiness.recommendedAction.type === 'practice') {
      onNavigateToPractice(readiness.recommendedAction.evidenceKey);
    } else {
      onNavigateToSimulation();
    }
  };

  const getStageBadge = (stage: ExamReadinessOverview['readinessStage']) => {
    switch (stage) {
      case 'exam_ready':
        return { label: 'Preparación Consolidada', color: tokens.color.mastered, bg: tokens.color.masteredBg };
      case 'ready_for_simulation':
        return { label: 'Listo para Simulación', color: tokens.color.primary, bg: tokens.color.primaryLight };
      case 'remediation_in_progress':
        return { label: 'Nivelación en Progreso', color: tokens.color.inProgress, bg: tokens.color.inProgressBg };
      default:
        return { label: 'Diagnóstico Requerido', color: tokens.color.needsPractice, bg: tokens.color.needsPracticeBg };
    }
  };

  const stageBadge = getStageBadge(readiness.readinessStage);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Centro de Preparación para el Examen</h2>
            <p className="text-xs text-slate-500">Evaluación longitudinal y preparación para la convocatoria oficial</p>
          </div>
        </div>
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: stageBadge.bg, color: stageBadge.color }}>
          {stageBadge.label}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-5">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Índice de Preparación</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-slate-900">{readiness.readinessScore}%</span>
            <span className="text-xs text-slate-500">/ 100% óptimo</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-3">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${readiness.readinessScore}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Precisión General</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {readiness.overallAccuracy !== null ? `${readiness.overallAccuracy}%` : 'N/A'}
            </span>
            <span className="text-xs text-slate-500">
              ({readiness.totalAttempts} intento{readiness.totalAttempts === 1 ? '' : 's'})
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
            {readiness.loopCounts.simulation} simulación(es) completada(s)
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ciclo Pedagógico</span>
          <div className="grid grid-cols-3 gap-1 mt-2 text-center">
            <div className="bg-white p-2 rounded-lg border border-slate-200/60">
              <span className="block text-xs font-semibold text-slate-400">Diag.</span>
              <span className="text-sm font-bold text-slate-800">{readiness.loopCounts.diagnostic}</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200/60">
              <span className="block text-xs font-semibold text-slate-400">Práct.</span>
              <span className="text-sm font-bold text-slate-800">{readiness.loopCounts.practice}</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200/60">
              <span className="block text-xs font-semibold text-slate-400">Simul.</span>
              <span className="text-sm font-bold text-slate-800">{readiness.loopCounts.simulation}</span>
            </div>
          </div>
          <span className="text-xs text-slate-400 mt-2 block">Cierre de brechas continuo</span>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-indigo-600 text-white mt-0.5">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider block">Siguiente Paso Recomendado</span>
            <h4 className="text-sm font-bold text-slate-900 mt-0.5">{readiness.recommendedAction.titleEs}</h4>
            <p className="text-xs text-slate-600 mt-1 max-w-xl">{readiness.recommendedAction.descriptionEs}</p>
          </div>
        </div>
        <button
          onClick={handleAction}
          className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <Play className="w-4 h-4 fill-current" />
          {readiness.recommendedAction.ctaEs}
        </button>
      </div>

      {readiness.domainStrengths.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Desglose por Áreas Temáticas</span>
          <div className="flex flex-wrap gap-2">
            {readiness.domainStrengths.map(ds => {
              const isMastered = ds.masteryTier === 'strong';
              const isInProgress = ds.masteryTier === 'developing';
              return (
                <div
                  key={ds.domainId}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border font-medium"
                  style={{
                    backgroundColor: isMastered ? tokens.color.masteredBg : (isInProgress ? tokens.color.inProgressBg : tokens.color.needsPracticeBg),
                    color: isMastered ? tokens.color.mastered : (isInProgress ? tokens.color.inProgress : tokens.color.needsPractice),
                    borderColor: isMastered ? '#a7f3d0' : (isInProgress ? '#fde68a' : '#fecdd3'),
                  }}
                >
                  {isMastered ? <CheckCircle className="w-3.5 h-3.5" /> : (isInProgress ? <RefreshCw className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />)}
                  <span>{ds.nameEs}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
