import { useState, useEffect } from 'react';
import { Activity, ArrowRight, BarChart2, CheckCircle2, ChevronRight, RefreshCw, Sparkles, Target, Zap } from 'lucide-react';
import { storageService } from '../../services/storageService';

export function TelemetryFunnelDashboard() {
  const [stats, setStats] = useState(storageService.getTelemetryFunnelStats());
  const [events, setEvents] = useState(storageService.getTelemetryEvents());
  const [isOpen, setIsOpen] = useState(false);

  function refresh() {
    setStats(storageService.getTelemetryFunnelStats());
    setEvents(storageService.getTelemetryEvents());
  }

  useEffect(() => {
    refresh();
  }, []);

  const funnelSteps = [
    { key: 'goalSelected', label: '1. Meta Seleccionada', count: stats.goalSelected, icon: Target, desc: 'Pilar o modo de estudio elegido' },
    { key: 'diagnosticStarted', label: '2. Diagnóstico Iniciado', count: stats.diagnosticStarted, icon: Zap, desc: 'Evaluación inicial abierta' },
    { key: 'diagnosticCompleted', label: '3. Diagnóstico Completado', count: stats.diagnosticCompleted, icon: CheckCircle2, desc: 'Respuestas analizadas' },
    { key: 'remediationStarted', label: '4. Nivelación Iniciada', count: stats.remediationStarted, icon: Sparkles, desc: 'Plan de nivelación generado y activado' },
    { key: 'sessionCompleted', label: '5. Práctica / Simulación', count: stats.sessionCompleted, icon: Activity, desc: 'Sesión de refuerzo culminada' },
  ];

  return (
    <section className="rounded-3xl border border-line bg-surface p-6 shadow-xs space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            <BarChart2 className="size-5" />
          </span>
          <div>
            <h3 className="text-xl font-bold text-ink">Métricas de Trayectoria del Estudiante</h3>
            <p className="text-xs text-muted">Embudo de Nivelación y Diagnóstico (Uso Local / Tutoría)</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-line bg-paper text-xs font-semibold text-muted hover:text-ink transition-colors"
            title="Actualizar métricas"
          >
            <RefreshCw className="size-3.5" />
            Actualizar
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-soft text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
          >
            {isOpen ? 'Ocultar registro de eventos' : 'Ver detalle de eventos'}
          </button>
        </div>
      </div>

      {/* Funnel Visual Pipeline */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {funnelSteps.map((step, idx) => {
          const Icon = step.icon;
          const nextCount = funnelSteps[idx + 1]?.count ?? 0;
          const conversionRate = step.count > 0 ? Math.round((nextCount / step.count) * 100) : 0;

          return (
            <div key={step.key} className="relative rounded-2xl border border-line bg-paper p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-surface text-muted">
                    <Icon className="size-4" />
                  </span>
                  <span className="text-2xl font-bold tabular-nums text-ink">{step.count}</span>
                </div>
                <h4 className="mt-2 text-sm font-semibold text-ink">{step.label}</h4>
                <p className="mt-1 text-xs text-muted leading-tight">{step.desc}</p>
              </div>

              {idx < funnelSteps.length - 1 && (
                <div className="mt-4 pt-2 border-t border-line/60 flex items-center justify-between text-[11px] text-muted">
                  <span>Paso al sig:</span>
                  <span className="font-semibold text-primary tabular-nums">{conversionRate}%</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Funnel conversion summary badge */}
      <div className="rounded-2xl bg-paper border border-line p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-muted">
            Ratio de activación de nivelación:{' '}
            <strong className="text-ink">
              {stats.diagnosticCompleted > 0 ? Math.round((stats.remediationStarted / stats.diagnosticCompleted) * 100) : 0}%
            </strong>{' '}
            (Diagnósticos que continuaron a práctica focalizada)
          </span>
        </div>
        <span className="text-muted tabular-nums">Total eventos registrados: {stats.totalEvents}</span>
      </div>

      {/* Expandable event logs */}
      {isOpen && (
        <div className="space-y-2 pt-2 border-t border-line">
          <h4 className="text-xs font-bold text-muted uppercase tracking-wider">Últimos eventos registrados (Sesión Local)</h4>
          {events.length === 0 ? (
            <p className="text-xs text-muted py-2">No hay eventos recientes en esta sesión.</p>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
              {events.slice(0, 15).map((ev) => (
                <div key={ev.id} className="rounded-xl border border-line bg-paper/60 px-3 py-2 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">{ev.type}</span>
                    <span className="text-muted">({ev.programId} · {ev.subjectId})</span>
                  </div>
                  <span className="text-[11px] text-muted tabular-nums">
                    {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
