import { remediationConfig, remediationComparison, sameLearningContext } from '../../services/legacyRemediation';
import { routeHash } from '../../services/navigation';
import { useEffect, useState } from 'react';
import type { Item, PracticeConfig, TestSession } from '../../types';
import { storageService } from '../../services/storageService';
import { dataService } from '../../services/dataService';
import { isExam, modeLabel, areaLabel, scopeKey } from '../../services/learningSession';
import { TextRenderer } from '../common/TextRenderer';
import { VisualRenderer } from '../visuals/VisualRenderer';
import { GroupVisual } from '../visuals/GroupVisual';
import { options } from '../test/TestShell';
import { CustomSelect } from '../common/CustomSelect';
import { generateRemediationPlan, type RemediationPlan } from '../../services/remediationEngine';
import { PlanDeNivelacionView } from './PlanDeNivelacionView';

export function ResultsPage({
  session,
  onRetry,
  onNewTest,
  onGoHome,
  onPracticeMissed
}: {
  session: TestSession;
  onRetry: () => void;
  onNewTest: () => void;
  onGoHome: () => void;
  onPracticeMissed?: (config: PracticeConfig) => void;
  onPracticeWeakestArea?: (area: string) => void;
}) {
  const items = session.items || session.itemIds.map(id => dataService.getItemById(id)).filter((item): item is Item => !!item);
  const [selected, setSelected] = useState<number | null>(null);
  const [filter, setFilter] = useState('all');
  const [revealed, setRevealed] = useState(false);
  const [saveError, setSaveError] = useState('');
  const answered = (item: Item) => !!session.responses[item.id]?.selectedOption;
  const correct = (item: Item) => session.responses[item.id]?.selectedOption === item.correct_answer;
  const total = items.length, correctCount = items.filter(correct).length, unanswered = items.filter(item => !answered(item)).length;
  const score = total ? Math.round(correctCount / total * 100) : 0;
  const [remediationPlan, setRemediationPlan] = useState<RemediationPlan | null>(null);

  useEffect(() => {
    if (!storageService.saveResult({ ...session, items })) {
      setSaveError(storageService.lastError);
    }
    if (session.config.mode === 'diagnostic') {
      storageService.logTelemetryEvent('diagnostic_completed', { score, total, correctCount });
      const plan = generateRemediationPlan({ ...session, items });
      setRemediationPlan(plan);
    } else {
      storageService.logTelemetryEvent('session_completed', { mode: session.config.mode, score, total, correctCount });
    }
  }, [session.sessionId]);

  const attempts = storageService.getAttempts().filter(a => a.userId === session.userId && a.mode === session.config.mode && (a.scopeKey === scopeKey(session.config) || (!a.scopeKey && !session.config.programId))).slice(0, 10);
  const visible = items.filter(item => filter === 'all' || (filter === 'correct' ? correct(item) : filter === 'pending' ? !answered(item) : answered(item) && !correct(item)));
  const missed = items.filter(item => !correct(item));
  const domains = ['numbers', 'geometry', 'measurement', 'functions', 'statistics'].map(area => { const pool = items.filter(item => item.area_id === area); return { area, total: pool.length, correct: pool.filter(correct).length }; }).filter(d => d.total);
  const weakest = domains.filter(domain => domain.correct < domain.total).sort((a, b) => a.correct / a.total - b.correct / b.total)[0];
  const current = selected !== null ? items[selected] : null;
  const open = (index: number) => { setSelected(index); setRevealed(false); };

  const handleRetry = () => {
    storageService.logTelemetryEvent('retry_clicked', { sessionId: session.sessionId });
    onRetry();
  };

  const origin = session.config.remediation ? storageService.getResult(session.config.remediation.rootSessionId, session.userId) : null;
  const baseline = origin && sameLearningContext(session, origin) ? origin : null;
  const comparison = remediationComparison(session, baseline);
  function launchRemediation(ids: number[], label: string, stage: 'practice' | 'retest' = 'practice') {
    const config = remediationConfig(session, ids, label, stage);
    if (config && onPracticeMissed) onPracticeMissed(config);
  }
  const handleRemediate = () => launchRemediation(missed.map(item => item.id), 'Preguntas por repasar');

  function download() {
    const summary = [modeLabel(session.config), 'Referencia: ' + (session.config.convocatoriaId || '2026-c2'), 'Resultado: ' + score + '%', correctCount + ' correctas; ' + (total - correctCount - unanswered) + ' incorrectas; ' + unanswered + ' sin responder', 'Duración: ' + Math.floor(session.elapsedSeconds / 60) + ' minutos', ...domains.map(d => areaLabel(d.area) + ': ' + d.correct + '/' + d.total), ...missed.map(item => 'Repasar pregunta ' + (items.indexOf(item) + 1) + ': ' + item.topic)].join('\n');
    const url = URL.createObjectURL(new Blob([summary], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'resumen-de-estudio.txt'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const filterOptions = [
    { value: 'all', label: `Todas (${total})` },
    { value: 'correct', label: `Correctas (${correctCount})` },
    { value: 'incorrect', label: `Incorrectas (${total - correctCount - unanswered})` },
    { value: 'pending', label: `Sin responder (${unanswered})` },
  ];

  return <div className="results-page page-width py-8 space-y-6">
    <header className="page-intro rounded-3xl p-6 sm:p-8 space-y-4">
      <p className="eyebrow">{modeLabel(session.config)} · Matemáticas · {session.config.convocatoriaId || '2026-c2'}</p>
      <h1 className="text-3xl sm:text-4xl font-bold">Tu resultado: {score}%</h1>
      <p className="text-stone-700 dark:text-stone-300">
        {correctCount} Correctas · {total - correctCount - unanswered} Incorrectas · {unanswered} Sin responder · {Math.floor(session.elapsedSeconds / 60)} min {session.elapsedSeconds % 60} s
      </p>
      <p className="text-sm text-stone-600 dark:text-stone-400">
        {session.config.remediation?.stage === 'retest' ? 'Comprobación sin ayudas sobre preguntas ya practicadas. Este resultado no certifica dominio ni equivale a una nueva evaluación independiente.' : isExam(session.config) ? 'Nota de referencia del programa: ' + (session.passingScore || 70) + '. Este resultado corresponde a una simulación independiente.' : session.config.mode === 'diagnostic' ? 'Diagnóstico rápido completado: revisa tus áreas y sigue la recomendación de estudio abajo.' : 'Práctica de aprendizaje: el porcentaje refleja tus primeras respuestas, no una predicción de la nota del examen.'}
      </p>
      <div className="action-row">
        {session.config.remediation?.stage === 'practice' && onPracticeMissed && <button className="primary-button" onClick={() => launchRemediation(session.itemIds, session.config.remediation!.label, 'retest')}>Comprobar sin ayudas</button>}
        {missed.length > 0 && onPracticeMissed && <button className={session.config.remediation?.stage === 'practice' ? 'secondary-button' : 'primary-button'} onClick={handleRemediate}>Reforzar preguntas falladas ({missed.length})</button>}
        <button className="secondary-button" onClick={handleRetry}>Repetir estas preguntas</button>
        <button className="secondary-button" onClick={onNewTest}>Elegir otra práctica</button>
        <button className="secondary-button" onClick={onGoHome}>Volver a Matemáticas</button>
        <button className="tertiary-button" onClick={download}>Descargar resumen</button>
      </div>
      {saveError && <p role="alert">{saveError}</p>}
    </header>

    {session.config.remediation && <section className="workspace-section" aria-label="Seguimiento del refuerzo">
      <h2>{session.config.remediation.stage === 'retest' ? 'Tu avance después del refuerzo' : 'Después de practicar, comprueba tu avance'}</h2>
      {comparison && <p>En las mismas {comparison.total} preguntas: {comparison.before}/{comparison.total} correctas antes del refuerzo → {comparison.after}/{comparison.total} en este intento.</p>}
      <p>Estas preguntas ya fueron vistas. Repite sin consultar las explicaciones y utiliza una nueva práctica para ampliar la evidencia de aprendizaje.</p>
      {baseline && <a className="text-link" href={routeHash({ view: 'results', programId: session.config.programId || 'bxm', subjectId: session.config.subjectId || 'matematicas', moduleId: session.config.subprogramId, convocatoriaId: session.config.convocatoriaId, tab: session.config.reviewDraft ? 'review' : undefined, sessionId: baseline.sessionId })}>Ver resultado de origen</a>}
      {!baseline && <p>El resultado de origen ya no está disponible en este perfil. Puedes continuar practicando.</p>}
    </section>}
    {domains.some(domain => domain.correct === domain.total) && <section className="workspace-section"><h2>Fortalezas en este intento</h2><p>{domains.filter(domain => domain.correct === domain.total).map(domain => `${areaLabel(domain.area)} · ${domain.correct}/${domain.total}`).join(' · ')}</p><p className="muted">Solo refleja las preguntas evaluadas en este intento.</p></section>}
    {!missed.length && <p role="status">No quedaron preguntas por reforzar en este intento. Puedes continuar con una nueva práctica o volver a tu materia.</p>}
    {/* Plan de Nivelación (if session is a diagnostic or has generated plan) */}
    {remediationPlan && remediationPlan.topPriorityDrilldowns.length > 0 && (
      <PlanDeNivelacionView
        plan={remediationPlan}
        onLaunchRemediationPractice={(config) => {
          launchRemediation(config.itemIds || [], config.title || 'Concepto por reforzar');
        }}
      />
    )}

    {/* Telemetry Funnel Dashboard for Tutors and Learners */}

    {weakest && (
      <section className="ui-surface rounded-2xl p-6 space-y-4 border border-indigo-100 dark:border-indigo-950/60 bg-gradient-to-br from-white to-indigo-50/20 dark:from-stone-900 dark:to-indigo-950/20">
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-700/60 pb-3">
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
            Lo que conviene reforzar
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
            Prioridad: {areaLabel(weakest.area)}
          </span>
        </div>
        <p className="text-stone-700 dark:text-stone-300 text-sm leading-relaxed">
          Tu área con mayor oportunidad de mejora es <strong>{areaLabel(weakest.area)}</strong> ({weakest.correct} de {weakest.total} correctas en esta sesión). Te sugerimos repasar sus explicaciones paso a paso e iniciar una práctica focalizada.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {domains.map(d => {
            const domainPct = d.total ? Math.round((d.correct / d.total) * 100) : 0;
            return (
              <div key={d.area} className="p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white/70 dark:bg-stone-800/70">
                <span className="text-xs text-stone-500 dark:text-stone-400 block font-medium">{areaLabel(d.area)}</span>
                <span className="text-lg font-bold text-stone-900 dark:text-stone-100">{d.correct} / {d.total}</span>
                <span className="text-xs text-stone-600 dark:text-stone-400 ml-1.5 font-semibold">({domainPct}%)</span>
                {d.correct < d.total && onPracticeMissed && <button className="text-link block" onClick={() => launchRemediation(missed.filter(item => item.area_id === d.area).map(item => item.id), areaLabel(d.area))}>Practicar {areaLabel(d.area)}</button>}
              </div>
            );
          })}
        </div>
        <div className="action-row pt-2">
          {missed.length > 0 && onPracticeMissed && (
            <button className="primary-button text-sm py-2 px-4" onClick={handleRemediate}>
              Practicar {missed.length} preguntas por reforzar
            </button>
          )}
          <a className="text-link text-sm font-semibold" href={'#/ayuda?programa=' + (session.config.programId || 'bxm')}>
            Consultar guías y fórmulas de {areaLabel(weakest.area)} →
          </a>
        </div>
      </section>
    )}
    {attempts.length >= 2 && <section className="ui-surface p-6 rounded-2xl space-y-3"><h2 className="text-xl font-semibold">Desempeño</h2><p className="muted">Solo intentos del mismo modo y configuración. Las prácticas de distintos temas no se comparan.</p><table className="data-table"><caption className="sr-only">Resultados de intentos comparables</caption><thead><tr><th scope="col">Intento</th><th scope="col">Fecha</th><th scope="col">Resultado</th></tr></thead><tbody>{[...attempts].reverse().map((a, index) => <tr key={a.id}><th scope="row">#{index + 1}</th><td>{new Date(a.timestamp).toLocaleDateString('es-CR')}</td><td>{a.scorePercentage}% <meter min={0} max={100} value={a.scorePercentage} aria-label={'Resultado del intento ' + (index + 1)} /></td></tr>)}</tbody></table></section>}
    <section className="ui-surface rounded-2xl p-5 sm:p-7 space-y-5"><h2 className="text-xl font-semibold">Preguntas</h2>
      {current ? <>
        <div className="action-row"><button className="secondary-button" onClick={() => setSelected(null)}>Volver a la vista general</button><button className="secondary-button" disabled={visible.indexOf(current) <= 0} onClick={() => open(items.indexOf(visible[visible.indexOf(current) - 1]))}>Anterior</button><p>Pregunta {selected! + 1} de {total}</p><button className="secondary-button" disabled={visible.indexOf(current) >= visible.length - 1} onClick={() => open(items.indexOf(visible[visible.indexOf(current) + 1]))}>Siguiente</button></div>
        <p className="font-semibold">{!answered(current) ? 'Sin responder' : correct(current) ? '✓ Correcta' : '✕ Incorrecta'}</p>
        {current.group_id && <GroupVisual group={session.groups?.find(g => g.group_id === current.group_id) || dataService.getGroupById(current.group_id)} />}
        <div className="question-stem text-base sm:text-lg leading-relaxed text-stone-900 dark:text-stone-100 overflow-x-auto py-1">
          <TextRenderer content={current.stem} />
        </div>
        {current.visual_spec && !current.group_id && (
          <div className="my-3 overflow-x-auto flex justify-center">
            <VisualRenderer key={current.id} itemId={current.id} spec={current.visual_spec} />
          </div>
        )}
        <p className="muted">Antes de revelar la solución, intenta resolver la pregunta de nuevo en tu cuaderno.</p>
        <div className="space-y-3">{options(current.options).map(option => <div key={option.letter} className={`answer-option ${revealed && current.correct_answer === option.letter ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30' : ''}`}><strong>{option.letter}</strong><div className="flex-1 overflow-x-auto"><TextRenderer content={option.text} /></div>{session.responses[current.id]?.selectedOption === option.letter && <span>Tu respuesta</span>}{revealed && current.correct_answer === option.letter && <span>✓ Correcta</span>}</div>)}</div>
        <button className="secondary-button" aria-expanded={revealed} aria-controls="solution-review" onClick={() => setRevealed(!revealed)}>{revealed ? 'Ocultar explicación' : 'Ver solución paso a paso'}</button>
        {revealed && <div id="solution-review" className="feedback-panel space-y-3"><div className="flex items-center justify-between"><h3 className="font-semibold text-base">Explicación de apoyo</h3><span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">Opción correcta: {current.correct_answer}</span></div><p className="muted">{session.config.reviewDraft
          ? `Ítem original en revisión · ${current.code} · ${current.spec?.block} · ${current.spec?.evidence}`
          : current.provenance === 'original_authoring'
            ? `Pregunta original alineada con el temario DGEC · ${current.spec?.block} · ${current.spec?.evidence}`
            : 'Pregunta de los materiales de referencia; explicación de apoyo de esta plataforma. Consulta el PDF de origen para contrastar el enunciado.'}</p><ol className="list-decimal pl-5 space-y-3">{current.solution_steps?.map((step, index) => <li key={index} className="overflow-x-auto"><TextRenderer content={typeof step === 'string' ? step : step.explanation} /></li>)}</ol></div>}
      </> : <>
        <div className="max-w-xs">
          <label className="block text-xs uppercase tracking-wider font-semibold text-stone-600 dark:text-stone-300 mb-1">
            Filtrar revisión
          </label>
          <CustomSelect
            label="Filtrar revisión"
            value={filter}
            options={filterOptions}
            onChange={setFilter}
          />
        </div>
        <div className="question-grid">{visible.map(item => <button className="question-cell" key={item.id} aria-label={'Pregunta ' + (items.indexOf(item) + 1) + ', ' + (!answered(item) ? 'sin responder' : correct(item) ? 'correcta' : 'incorrecta')} onClick={() => open(items.indexOf(item))}>{items.indexOf(item) + 1} <span aria-hidden="true">{!answered(item) ? '—' : correct(item) ? '✓' : '✕'}</span></button>)}</div>{!visible.length && <p role="status">No hay preguntas con este filtro.</p>}
      </>}
    </section>
  </div>;
}
