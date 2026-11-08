import { useId, useState, type ReactNode } from 'react';
import { Dialog } from '../common/Dialog';
import type { DifficultyTier } from '../../types';

export interface ConfigurationSummary {
  requested: number;
  actual: number;
  available?: number;
  scope: string;
  difficulty?: DifficultyTier;
  timerMinutes?: number;
}

export function AssessmentSummary({ summary }: { summary: ConfigurationSummary }) {
  return <div className="assessment-summary">
    <p role="status">{summary.available !== undefined && <>{summary.available} preguntas en banco. Este intento tendrá </>}<strong>{summary.actual}</strong>{summary.available === undefined && ' preguntas'}{summary.actual < summary.requested && ` de ${summary.requested} solicitadas (ajustado)`}.</p>
    <dl className="assessment-summary-details">
      <div><dt>Alcance</dt><dd>{summary.scope}</dd></div>
      <div><dt>Dificultad</dt><dd>{summary.difficulty ? { 1: 'Básica', 2: 'Intermedia', 3: 'Avanzada' }[summary.difficulty] : 'Todas las disponibles'}</dd></div>
      <div><dt>Tiempo</dt><dd>{summary.timerMinutes === undefined ? 'Sin cronómetro' : Number.isFinite(summary.timerMinutes) && summary.timerMinutes > 0 ? `${summary.timerMinutes} minutos · Con cronómetro` : 'Elige una duración válida'}</dd></div>
    </dl>
  </div>;
}

interface Props {
  modes?: { value: string; label: string }[];
  mode?: string;
  onModeChange?: (mode: string) => void;
  scope: ReactNode;
  difficulty?: { value?: DifficultyTier; onChange: (value?: DifficultyTier) => void; label?: string };
  quantity?: { value: number | 'all'; onChange: (value: number | 'all') => void; allowAll?: boolean };
  summary: ConfigurationSummary;
  timing?: ReactNode;
  children?: ReactNode;
  error?: string;
  submitLabel: string;
  onSubmit: () => void;
}

/** Shared interaction shell; each assessment adapter owns eligibility and policy. */
export function LearningConfiguration({ modes, mode, onModeChange, scope, difficulty, quantity, summary, timing, children, error, submitLabel, onSubmit }: Props) {
  const id = useId();
  const [custom, setCustom] = useState(false);
  const presets = [5, 10, 20, 30];
  const customSelected = custom || (quantity && quantity.value !== 'all' && !presets.includes(quantity.value));
  return <form className="learning-configuration" onSubmit={event => { event.preventDefault(); onSubmit(); }}>
    {modes && <fieldset><legend className="field-legend">Modo</legend><div className="action-row">{modes.map(item => <button type="button" key={item.value} aria-pressed={mode === item.value} className={mode === item.value ? 'primary-button' : 'secondary-button'} onClick={() => onModeChange?.(item.value)}>{item.label}</button>)}</div></fieldset>}
    <fieldset className="configuration-scope"><legend className="field-legend">Alcance</legend>{scope}</fieldset>
    {(difficulty || quantity) && <div className="configuration-controls">
      {difficulty && <label htmlFor={`${id}-difficulty`}>{difficulty.label || 'Dificultad'}<select aria-label={difficulty.label || 'Dificultad'} id={`${id}-difficulty`} value={difficulty.value || ''} onChange={event => difficulty.onChange(event.target.value ? Number(event.target.value) as DifficultyTier : undefined)}><option value="">Todas las disponibles</option><option value="1">Básica</option><option value="2">Intermedia</option><option value="3">Avanzada</option></select></label>}
      {quantity && <div><label htmlFor={`${id}-quantity`}>Cantidad de preguntas<select aria-label="Cantidad de preguntas" id={`${id}-quantity`} value={customSelected ? 'custom' : quantity.value} onChange={event => {
        const value = event.target.value; setCustom(value === 'custom');
        if (value !== 'custom') quantity.onChange(value === 'all' ? 'all' : Number(value));
        else if (quantity.value === 'all') quantity.onChange(10);
      }}>{presets.map(value => <option key={value} value={value}>{value} preguntas</option>)}<option value="custom">Personalizado</option>{quantity.allowAll && <option value="all">Todas las disponibles</option>}</select></label>
      {customSelected && <label htmlFor={`${id}-custom`}>Preguntas personalizadas<input id={`${id}-custom`} type="number" min={1} max={100} required value={quantity.value === 'all' ? 10 : quantity.value || ''} onChange={event => quantity.onChange(Number(event.target.value))} /></label>}</div>}
    </div>}
    {timing}{children}
    <AssessmentSummary summary={summary} />
    {!summary.actual && <p className="muted">No hay preguntas disponibles. Cambia el alcance o la dificultad.</p>}
    {error && <p role="alert" className="error-message">{error}</p>}
    <button className="primary-button configuration-submit" disabled={!summary.actual || !Number.isInteger(summary.requested) || summary.requested < 1}>{submitLabel}</button>
  </form>;
}

export function AssessmentBriefing({ title, summary, onClose, onStart, startLabel, children }: {
  title: string; summary: ConfigurationSummary; onClose: () => void; onStart: () => void; startLabel: string; children: ReactNode;
}) {
  return <Dialog title={title} onClose={onClose}>
    <AssessmentSummary summary={summary} />
    {children}
    <div className="action-row"><button type="button" className="primary-button" disabled={!summary.actual} onClick={onStart}>{startLabel}</button><button type="button" className="secondary-button" onClick={onClose}>Cancelar</button></div>
  </Dialog>;
}
