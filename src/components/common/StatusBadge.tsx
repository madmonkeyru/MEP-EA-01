export const learningStatuses = {
  completed: { label: 'Completado', symbol: '✓', tone: 'positive' },
  in_progress: { label: 'En progreso', symbol: '●', tone: 'info' },
  upcoming: { label: 'Próximo', symbol: '→', tone: 'info' },
  pending: { label: 'Pendiente', symbol: '○', tone: 'neutral' },
  attention: { label: 'Requiere atención', symbol: '!', tone: 'attention' },
  locked: { label: 'Bloqueado', symbol: '▣', tone: 'neutral' },
  passed: { label: 'Aprobado', symbol: '✓', tone: 'positive' },
  failed: { label: 'Por reforzar', symbol: '!', tone: 'attention' },
} as const;

/** User activity state only. Official dates have separate schedule semantics. */
export function StatusBadge({ status }: { status: keyof typeof learningStatuses }) {
  const item = learningStatuses[status];
  return <span className="status-badge" data-kind="learning" data-tone={item.tone}>
    <span aria-hidden="true">{item.symbol}</span>{item.label}
  </span>;
}

export function ScheduleBadge({ status }: { status: 'upcoming' | 'open' | 'past' | 'pending' }) {
  const labels = { upcoming: 'Próximo', open: 'En curso', past: 'Fecha pasada', pending: 'Fecha por confirmar' };
  return <span className="status-badge" data-kind="schedule" data-tone={status === 'open' || status === 'upcoming' ? 'info' : 'neutral'}>{labels[status]}</span>;
}
