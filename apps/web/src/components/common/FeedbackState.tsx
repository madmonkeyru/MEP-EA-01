import type { ReactNode } from 'react';

/** Contextual feedback keeps a useful next action beside the message. */
export function FeedbackState({ title, description, action, busy = false }: {
  title: string; description?: string; action?: ReactNode; busy?: boolean;
}) {
  return <section className="feedback-state" role={busy ? 'status' : undefined} aria-busy={busy || undefined}>
    <h2 className="text-lg font-semibold">{title}</h2>
    {description && <p className="muted">{description}</p>}
    {busy && <div className="loading-skeleton" aria-hidden="true"><span /><span /><span /></div>}
    {action && <div className="action-row">{action}</div>}
  </section>;
}
