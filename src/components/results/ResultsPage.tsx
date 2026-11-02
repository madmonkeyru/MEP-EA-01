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

export function ResultsPage({ session, onRetry, onNewTest, onGoHome, onPracticeMissed }: { session: TestSession; onRetry: () => void; onNewTest: () => void; onGoHome: () => void; onPracticeMissed?: (config: PracticeConfig) => void }) {
  const items = session.items || session.itemIds.map(id => dataService.getItemById(id)).filter((item): item is Item => !!item);
  const [selected, setSelected] = useState<number | null>(null);
  const [filter, setFilter] = useState('all');
  const [revealed, setRevealed] = useState(false);
  const [saveError, setSaveError] = useState('');
  const answered = (item: Item) => !!session.responses[item.id]?.selectedOption;
  const correct = (item: Item) => session.responses[item.id]?.selectedOption === item.correct_answer;
  const total = items.length, correctCount = items.filter(correct).length, unanswered = items.filter(item => !answered(item)).length;
  const score = total ? Math.round(correctCount / total * 100) : 0;
  useEffect(() => { if (!storageService.saveResult({ ...session, items })) setSaveError(storageService.lastError); }, [session.sessionId]);
  const attempts = storageService.getAttempts().filter(a => a.userId === session.userId && a.mode === session.config.mode && (a.scopeKey === scopeKey(session.config) || (!a.scopeKey && !session.config.programId))).slice(0, 10);
  const visible = items.filter(item => filter === 'all' || (filter === 'correct' ? correct(item) : filter === 'pending' ? !answered(item) : answered(item) && !correct(item)));
  const missed = items.filter(item => !correct(item));
  const domains = ['geometry', 'functions', 'statistics'].map(area => { const pool = items.filter(item => item.area_id === area); return { area, total: pool.length, correct: pool.filter(correct).length }; }).filter(d => d.total);
  const weakest = [...domains].sort((a, b) => a.correct / a.total - b.correct / b.total)[0];
  const current = selected !== null ? items[selected] : null;
  const open = (index: number) => { setSelected(index); setRevealed(false); };
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
    <header className="page-intro rounded-3xl p-6 sm:p-8 space-y-4"><p className="eyebrow">{modeLabel(session.config)} · Matemáticas · {session.config.convocatoriaId || '2026-c2'}</p><h1 className="text-3xl font-semibold">Tu resultado: {score}%</h1><p>{correctCount} Correctas · {total - correctCount - unanswered} Incorrectas · {unanswered} Sin responder · {Math.floor(session.elapsedSeconds / 60)} min {session.elapsedSeconds % 60} s</p>
      <p>{isExam(session.config) ? 'Nota de referencia del programa: ' + (session.passingScore || 70) + '. Este resultado corresponde a una simulación independiente.' : 'Práctica de aprendizaje: el porcentaje refleja tus primeras respuestas, no una predicción de la nota del examen.'}</p>
      <div className="action-row"><button className="secondary-button" onClick={onRetry}>Repetir estas preguntas</button><button className="primary-button" onClick={onNewTest}>Elegir otra práctica</button><button className="secondary-button" onClick={onGoHome}>Volver a Matemáticas</button><button className="secondary-button" onClick={download}>Descargar resumen</button><button className="secondary-button" onClick={() => window.print()}>Imprimir</button></div>
      {saveError && <p role="alert">{saveError}</p>}
    </header>
    {weakest && <section className="ui-surface rounded-2xl p-6 space-y-3"><h2 className="text-xl font-semibold">Tu siguiente paso</h2><p>Repasa {areaLabel(weakest.area)}: {weakest.correct} de {weakest.total} correctas en este intento.</p><div className="grid sm:grid-cols-3 gap-3">{domains.map(d => <p key={d.area}>{areaLabel(d.area)}: <strong>{d.correct}/{d.total}</strong></p>)}</div>{missed.length > 0 && onPracticeMissed && <button className="primary-button" onClick={() => onPracticeMissed({ ...session.config, mode: 'area', itemIds: missed.map(item => item.id), title: 'Repaso de preguntas pendientes', itemCount: missed.length, enableTimer: false })}>Practicar {missed.length} preguntas por reforzar</button>}<a className="text-link" href="#/ayuda?programa=bxm">Buscar materiales de repaso</a></section>}
    {attempts.length >= 2 && <section className="ui-surface p-6 rounded-2xl space-y-3"><h2 className="text-xl font-semibold">Desempeño</h2><p className="muted">Solo intentos del mismo modo y configuración. Las prácticas de distintos temas no se comparan.</p><table className="data-table"><caption className="sr-only">Resultados de intentos comparables</caption><thead><tr><th scope="col">Intento</th><th scope="col">Fecha</th><th scope="col">Resultado</th></tr></thead><tbody>{[...attempts].reverse().map((a, index) => <tr key={a.id}><th scope="row">#{index + 1}</th><td>{new Date(a.timestamp).toLocaleDateString('es-CR')}</td><td>{a.scorePercentage}% <meter min={0} max={100} value={a.scorePercentage} aria-label={'Resultado del intento ' + (index + 1)} /></td></tr>)}</tbody></table></section>}
    <section className="ui-surface rounded-2xl p-5 sm:p-7 space-y-5"><h2 className="text-xl font-semibold">Preguntas</h2>
      {current ? <>
        <div className="action-row"><button className="secondary-button" onClick={() => setSelected(null)}>Volver a la vista general</button><button className="secondary-button" disabled={visible.indexOf(current) <= 0} onClick={() => open(items.indexOf(visible[visible.indexOf(current) - 1]))}>Anterior</button><p>Pregunta {selected! + 1} de {total}</p><button className="secondary-button" disabled={visible.indexOf(current) >= visible.length - 1} onClick={() => open(items.indexOf(visible[visible.indexOf(current) + 1]))}>Siguiente</button></div>
        <p className="font-semibold">{!answered(current) ? 'Sin responder' : correct(current) ? '✓ Correcta' : '✕ Incorrecta'}</p>
        {current.group_id && <GroupVisual group={session.groups?.find(g => g.group_id === current.group_id) || dataService.getGroupById(current.group_id)} />}
        <p className="question-stem"><TextRenderer content={current.stem} /></p>{current.visual_spec && !current.group_id && <VisualRenderer key={current.id} itemId={current.id} spec={current.visual_spec} />}
        <p className="muted">Antes de revelar la solución, intenta resolver la pregunta de nuevo en tu cuaderno.</p>
        <div className="space-y-3">{options(current.options).map(option => <div key={option.letter} className="answer-option"><strong>{option.letter}</strong><TextRenderer content={option.text} />{session.responses[current.id]?.selectedOption === option.letter && <span>Tu respuesta</span>}{revealed && current.correct_answer === option.letter && <span>✓ Correcta</span>}</div>)}</div>
        <button className="secondary-button" aria-expanded={revealed} aria-controls="solution-review" onClick={() => setRevealed(!revealed)}>{revealed ? 'Ocultar explicación' : 'Ver solución paso a paso'}</button>
        {revealed && <div id="solution-review" className="feedback-panel"><h3 className="font-semibold">Explicación de apoyo</h3><p className="muted">Pregunta de los materiales de referencia; explicación de apoyo de esta plataforma. Consulta el PDF de origen para contrastar el enunciado.</p><ol className="list-decimal pl-5 space-y-3">{current.solution_steps?.map((step, index) => <li key={index}><TextRenderer content={typeof step === 'string' ? step : step.explanation} /></li>)}</ol></div>}
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
