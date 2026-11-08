import type { LearningContinuity } from '@mep-ea/api';
import type { LearningCatalog } from '@mep-ea/content/expansion';

const reasonLabels: Record<string, { label: string; badgeColor: string }> = {
  no_diagnostic_yet: { label: 'Diagnóstico pendiente', badgeColor: 'bg-blue-100 text-blue-800' },
  remediation_pending: { label: 'Refuerzo de prerrequisito', badgeColor: 'bg-amber-100 text-amber-800' },
  diagnostic_weakness: { label: 'Debilidad en diagnóstico', badgeColor: 'bg-red-100 text-red-800' },
  simulation_weakness: { label: 'Debilidad en simulación', badgeColor: 'bg-orange-100 text-orange-800' },
  retest_available: { label: 'Recuperación / Comprobación disponible', badgeColor: 'bg-emerald-100 text-emerald-800' },
  general_practice: { label: 'Práctica general', badgeColor: 'bg-indigo-100 text-indigo-800' },
};

const actionLabels: Record<string, string> = {
  diagnose: 'Realizar diagnóstico',
  learn: 'Estudiar lección',
  practice: 'Practicar ejercicios',
  retest: 'Comprobar dominio',
};

const tierLabels: Record<string, { label: string; color: string }> = {
  mastered: { label: 'Dominada', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  in_progress: { label: 'En progreso', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  needs_practice: { label: 'Necesita práctica', color: 'text-rose-700 bg-rose-50 border-rose-200' },
  insufficient_evidence: { label: 'Evidencia insuficiente (<5 familias)', color: 'text-slate-600 bg-slate-50 border-slate-200' },
};

export function ContinuitySurface({
  continuity,
  catalog,
  onAction,
}: {
  continuity: LearningContinuity;
  catalog: LearningCatalog;
  onAction?: (evidenceKey: string, action: string) => void;
}) {
  const { mastery, plan } = continuity;

  return (
    <section aria-label="Mi Progreso y Plan de Nivelación" className="space-y-6 bg-white p-6 border rounded-xl shadow-sm">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-slate-900">Mi Progreso · Nivelación Continua</h2>
        <p className="text-sm text-slate-500 mt-1">
          Estado longitudinal calculado por el servidor con base en tus primeras respuestas (ventana de 30 días, mínimo 5 familias).
        </p>
      </div>

      {/* Snapshot de Dominio por Áreas y Evidencias */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800">Estado de Dominio Curricular</h3>
        {mastery.domains.length === 0 && mastery.evidence.length === 0 ? (
          <p className="text-sm text-slate-500 italic">No hay intentos registrados aún en la ventana actual.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {mastery.domains.map(d => {
              const domainName = catalog.registry.taxonomy.domains.find(dom => dom.id === d.id)?.name ?? d.id;
              const tierInfo = tierLabels[d.tier] ?? tierLabels.insufficient_evidence;
              return (
                <div key={d.id} className={`p-4 border rounded-lg ${tierInfo.color}`}>
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-slate-900">{domainName}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-white/80 border">
                      {tierInfo.label}
                    </span>
                  </div>
                  <div className="text-xs mt-2 space-y-0.5 opacity-90">
                    <p>Precisión: {d.accuracy !== null ? `${Math.round(d.accuracy * 100)}%` : 'Sin datos'}</p>
                    <p>Familias evaluadas: {d.distinctFamilies} / {mastery.minimumFamilies} mín.</p>
                    <p>Respuestas correctas: {d.correct} de {d.total}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Plan de Nivelación Priorizado (6 razones de la arquitectura) */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800">Plan de Nivelación Priorizado</h3>
        <p className="text-xs text-slate-500">
          Ruta de estudio pedagógica ordenada por jerarquía de necesidades identificadas.
        </p>
        {plan.activities.length === 0 ? (
          <p className="text-sm text-slate-500 italic">No hay actividades de nivelación pendientes.</p>
        ) : (
          <div className="space-y-3">
            {plan.activities.map((act, idx) => {
              const node = catalog.nodes.find(n => n.key === act.evidenceId);
              const reason = reasonLabels[act.reason] ?? { label: act.reason, badgeColor: 'bg-slate-100 text-slate-800' };
              const actionText = actionLabels[act.action] ?? act.action;
              return (
                <article key={`${act.evidenceId}-${idx}`} className="p-4 border rounded-lg hover:border-slate-300 transition-colors bg-slate-50/50">
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${reason.badgeColor}`}>
                      {reason.label}
                    </span>
                    <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                      Acción: {actionText}
                    </span>
                  </div>
                  <h4 className="font-medium text-slate-900 text-sm mt-1">
                    {node ? `${node.code}: ${node.description}` : act.evidenceId}
                  </h4>
                  {act.conceptIds.length > 0 && (
                    <p className="text-xs text-slate-500 mt-1">
                      Conceptos clave: {act.conceptIds.map(cId => catalog.registry.taxonomy.concepts.find(c => c.id === cId)?.name ?? cId).join(', ')}
                    </p>
                  )}
                  {onAction && (
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() => onAction(act.evidenceId, act.action)}
                        className="text-xs font-medium bg-slate-900 text-white px-3 py-1.5 rounded hover:bg-slate-800 transition"
                      >
                        {actionText} →
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
