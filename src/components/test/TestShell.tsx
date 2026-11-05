import { useCallback, useEffect, useRef, useState } from 'react';
import type { PracticeConfig, TestSession } from '../../types';
import { storageService } from '../../services/storageService';
import { createSession, isExam, calculatorRule, modeLabel } from '../../services/learningSession';
import { TextRenderer } from '../common/TextRenderer';
import { VisualRenderer } from '../visuals/VisualRenderer';
import { GroupVisual } from '../visuals/GroupVisual';
import { FormulasSheet } from '../knowledge/FormulasSheet';
import { Dialog } from '../common/Dialog';
import { ThemeToggle } from '../common/ThemeToggle';
import { CustomSelect } from '../common/CustomSelect';

export function TestShell({ config, initialSession, onFinishTest, onLeave }: {
  config: PracticeConfig; initialSession?: TestSession; onFinishTest: (session: TestSession) => void; onLeave?: () => void;
}) {
  const [session, setSession] = useState<TestSession>(() => initialSession || { ...createSession(config), userId: storageService.getCurrentUser()?.id || 'guest' });
  const latest = useRef(session); latest.current = session;
  const finished = useRef(false);
  const [overlay, setOverlay] = useState<'formulas' | 'submit' | 'exit' | 'navigator' | null>(null);
  const [filter, setFilter] = useState('all');
  const [shortcuts, setShortcuts] = useState(true);
  const question = useRef<HTMLHeadingElement>(null);
  const examHeader = useRef<HTMLElement>(null);
  useEffect(() => {
    const measure = () => document.documentElement.style.setProperty('--exam-header-height', (examHeader.current?.getBoundingClientRect().height || 120) + 'px');
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure); if (examHeader.current) observer.observe(examHeader.current);
    return () => observer.disconnect();
  }, []);
  const items = session.items || [];
  const current = items[session.currentResponseIndex];
  const exam = isExam(config);
  const patch = (partial: Partial<TestSession>) => {
    const next = { ...latest.current, ...partial }; latest.current = next; setSession(next);
  };
  const snapshot = useCallback(() => ({ ...latest.current, elapsedSeconds: Math.max(latest.current.elapsedSeconds, Math.floor((Date.now() - Date.parse(latest.current.startTime)) / 1000)) }), []);
  const submit = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    const completed = { ...snapshot(), isCompleted: true, completedAt: new Date().toISOString() };
    // Save the completed snapshot before removing the recoverable active copy.
    if (storageService.saveResult(completed)) storageService.clearActiveSession();
    onFinishTest(completed);
  }, [onFinishTest, snapshot]);
  const choose = (letter: 'A' | 'B' | 'C' | 'D') => {
    const active = latest.current.items?.[latest.current.currentResponseIndex];
    if (!active || latest.current.checkedItems?.[active.id]) return;
    patch({ responses: { ...latest.current.responses, [active.id]: { itemId: active.id, selectedOption: letter } } });
  };
  const move = (index: number) => patch({ currentResponseIndex: Math.max(0, Math.min(items.length - 1, index)) });
  const flag = () => current && patch({ flaggedItems: { ...latest.current.flaggedItems, [current.id]: !latest.current.flaggedItems[current.id] } });
  useEffect(() => {
    if (!items.length || finished.current) return;
    storageService.saveActiveSession(snapshot());
  }, [session]);
  useEffect(() => {
    const save = () => { if (!finished.current && items.length) storageService.saveActiveSession(snapshot()); };
    const interval = window.setInterval(save, 5000);
    const beforeUnload = (event: BeforeUnloadEvent) => { save(); if (!finished.current) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', beforeUnload);
    window.addEventListener('pagehide', save);
    return () => { clearInterval(interval); save(); window.removeEventListener('beforeunload', beforeUnload); window.removeEventListener('pagehide', save); };
  }, []);
  useEffect(() => { question.current?.focus(); }, [session.currentResponseIndex]);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (!shortcuts || overlay || event.ctrlKey || event.altKey || event.metaKey || document.querySelector('dialog[open]')) return;
      const target = event.target as HTMLElement | null;
      if (target instanceof HTMLElement && target.closest('input, textarea, select, button, a, [contenteditable="true"]')) return;
      const key = event.key.toLowerCase();
      const letter = ({ a: 'A', b: 'B', c: 'C', d: 'D', '1': 'A', '2': 'B', '3': 'C', '4': 'D' } as const)[key as 'a'];
      if (letter && current && options(current.options).some(option => option.letter === letter)) choose(letter);
      else if (key === 'arrowright') move(session.currentResponseIndex + 1);
      else if (key === 'arrowleft') move(session.currentResponseIndex - 1);
      else if (key === 'f') flag();
      else return;
      event.preventDefault();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcuts, overlay, session]);
  if (!current) return <section className="page-width ui-surface p-8 rounded-2xl"><h1>No hay preguntas para esta selección</h1><p>Elige otra materia, concepto o conjunto.</p><button className="primary-button" onClick={onLeave}>Volver y cambiar selección</button></section>;
  const answered = items.filter(item => session.responses[item.id]?.selectedOption).length;
  const flagged = Object.values(session.flaggedItems).filter(Boolean).length;
  const checked = session.checkedItems?.[current.id];
  const response = session.responses[current.id];
  const correct = response?.selectedOption === current.correct_answer;
  const group = session.groups?.find(group => group.group_id === current.group_id);

  const filterOptions = [
    { value: 'all', label: 'Todas' },
    { value: 'pending', label: 'Sin responder' },
    { value: 'flagged', label: 'Marcadas' },
  ];

  const navigator = <div className="space-y-4">
    <h2 className="font-semibold">Revisar preguntas</h2>
    <label className="text-xs uppercase tracking-wider font-semibold text-stone-600 dark:text-stone-300">
      Mostrar
      <div className="mt-1 normal-case tracking-normal text-sm font-normal">
        <CustomSelect
          label="Mostrar"
          value={filter}
          options={filterOptions}
          onChange={setFilter}
        />
      </div>
    </label>
    <div className="question-grid">{items.map((item, index) => {
      const done = !!session.responses[item.id]?.selectedOption, marked = !!session.flaggedItems[item.id];
      if ((filter === 'pending' && done) || (filter === 'flagged' && !marked)) return null;
      return <button key={item.id} aria-label={'Pregunta ' + (index + 1) + ', ' + (done ? 'respondida' : 'sin responder') + (marked ? ', marcada' : '')} aria-current={index === session.currentResponseIndex ? 'step' : undefined} className={'question-cell ' + (done ? 'answered' : '')} onClick={() => { move(index); setOverlay(null); }}>{index + 1}{done && <span aria-hidden="true"> ✓</span>}{marked && <span aria-hidden="true"> ⚑</span>}</button>;
    })}</div>
    {!items.some(item => filter === 'all' || (filter === 'pending' ? !session.responses[item.id]?.selectedOption : session.flaggedItems[item.id])) && <p role="status">No hay preguntas con este filtro.</p>}
    <p className="muted">✓ Respondida · ⚑ Marcada. El borde señala la pregunta actual.</p>
  </div>;
  return <div className="test-shell">
    <header ref={examHeader} className="exam-header"><div className="page-width flex flex-wrap items-center justify-between gap-3">
      <div><p className="font-semibold">{modeLabel(config)}</p><p className="text-sm">{answered}/{items.length} respondidas · {flagged} marcadas</p></div>
      <div className="action-row items-center"><ThemeToggle /><button className="secondary-button" onClick={() => setOverlay('formulas')}>Fórmulas</button>
        <ExamClock enabled={config.enableTimer} deadline={session.deadline} startTime={session.startTime} onExpire={submit} />
        <button className="primary-button" onClick={() => setOverlay('submit')}>Finalizar</button></div>
    </div></header>
    <div className="page-width py-6 grid lg:grid-cols-[240px_minmax(0,1fr)] gap-6 items-start">
      <aside className="hidden lg:block ui-surface p-5 rounded-2xl exam-navigator">{navigator}</aside>
      <section className="ui-surface p-5 sm:p-8 rounded-2xl space-y-6 min-w-0">
        <div className="flex items-center justify-between gap-3">
          <h1 ref={question} tabIndex={-1} className="text-xl font-semibold focus-heading">Pregunta {session.currentResponseIndex + 1} de {items.length}</h1>
          <div className="flex items-center gap-2">
            <button
              className={`p-2 rounded-xl border transition-all inline-flex items-center justify-center text-sm font-medium ${
                session.flaggedItems[current.id]
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/30'
                  : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 border-stone-200 dark:border-stone-700 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
              aria-pressed={!!session.flaggedItems[current.id]}
              aria-label={session.flaggedItems[current.id] ? 'Pregunta marcada para revisar [F]' : 'Marcar pregunta para revisar [F]'}
              title={session.flaggedItems[current.id] ? 'Pregunta marcada (F)' : 'Marcar para revisar (F)'}
              onClick={flag}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill={session.flaggedItems[current.id] ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                <line x1="4" y1="22" x2="4" y2="15" />
              </svg>
              <span className="sr-only">{session.flaggedItems[current.id] ? 'Marcada para revisar [F]' : 'Marcar para revisar [F]'}</span>
            </button>
            <button className="secondary-button lg:hidden" onClick={() => setOverlay('navigator')}>Ver preguntas</button>
          </div>
        </div>
        <p className="muted text-sm">{current.topic} · {calculatorRule(config.programId || 'bxm', 'matematicas', config.subprogramId)}</p>
        {group && <details open className="question-context"><summary>Contexto compartido de {group.items?.length || ''} preguntas</summary><GroupVisual group={group} /></details>}
        <p className="question-stem"><TextRenderer content={current.stem} /></p>
        {!group && current.visual_spec && <VisualRenderer key={current.id} spec={current.visual_spec} itemId={current.id} />}
        <fieldset className="answer-options"><legend className="sr-only">Elige una respuesta para la pregunta {session.currentResponseIndex + 1}</legend>
          {options(current.options).map(option => <label key={option.letter} className={'answer-option ' + (response?.selectedOption === option.letter ? 'selected' : '')}>
            <input type="radio" name={'answer-' + current.id} value={option.letter} checked={response?.selectedOption === option.letter} disabled={!!checked} onChange={() => choose(option.letter)} />
            <span title={'Presiona ' + option.letter} className="option-letter">{option.letter}</span><TextRenderer content={option.text} />
          </label>)}
        </fieldset>
        {!exam && response?.selectedOption && !checked && <button className="secondary-button" onClick={() => patch({ checkedItems: { ...session.checkedItems, [current.id]: true } })}>Verificar respuesta y ver explicación</button>}
        {!exam && checked && <section className="feedback-panel" aria-label="Explicación de la respuesta"><p role="status" className="font-semibold">{correct ? '✓ Respuesta correcta' : '✕ Respuesta incorrecta'} · Opción {current.correct_answer}</p><p className="muted">Se conserva tu primera respuesta verificada. Puedes volver a practicarla al terminar.</p><ol className="list-decimal pl-5 space-y-3">{current.solution_steps?.map((step, i) => <li key={i}><TextRenderer content={typeof step === 'string' ? step : step.explanation} /></li>)}</ol></section>}
        <div className="action-row justify-between"><button className="secondary-button" disabled={session.currentResponseIndex === 0} onClick={() => move(session.currentResponseIndex - 1)}>Anterior</button>
          {session.currentResponseIndex < items.length - 1 ? <button className="primary-button" onClick={() => move(session.currentResponseIndex + 1)}>Siguiente</button> : <button className="primary-button" onClick={() => setOverlay('submit')}>Revisar y entregar</button>}
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t border-stone-200/60 dark:border-stone-800/60">
          <label className="inline-flex items-center gap-2 text-xs text-stone-400 dark:text-stone-500 font-normal cursor-pointer select-none hover:text-stone-600 dark:hover:text-stone-400 transition-colors">
            <input
              type="checkbox"
              className="w-3.5 h-3.5 rounded border-stone-300 dark:border-stone-700 text-stone-500 focus:ring-0 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
              checked={shortcuts}
              onChange={e => setShortcuts(e.target.checked)}
            />
            <span>Atajos: A–D para responder, flechas para navegar, F para marcar</span>
          </label>
          <a className="text-xs text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 underline underline-offset-2 transition-colors" href={'#/ayuda?reporte=' + encodeURIComponent(current.id + ' · ' + (config.programId || 'bxm') + ' · ' + current.topic)}>Reportar un problema</a>
        </div>
      </section>
    </div>
    {overlay === 'navigator' && <Dialog title="Preguntas de la prueba" onClose={() => setOverlay(null)}>{navigator}</Dialog>}
    {overlay === 'formulas' && <Dialog title="Fórmulas de referencia" onClose={() => setOverlay(null)}><p className="muted">Material de apoyo para estudiar. Consulta el PDF oficial para identificar los anexos del examen.</p><FormulasSheet /><button className="secondary-button" onClick={() => setOverlay(null)}>Cerrar fórmulas</button></Dialog>}
    {overlay === 'submit' && <Dialog title="Finalizar o pausar prueba" onClose={() => setOverlay(null)}>
      <p>{answered} respondidas, {items.length - answered} sin responder y {flagged} marcadas.</p>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <button className="secondary-button" onClick={() => { setFilter('pending'); setOverlay('navigator'); }}>Revisar sin responder</button>
          <button className="secondary-button" onClick={() => { setFilter('flagged'); setOverlay('navigator'); }}>Revisar marcadas</button>
        </div>
        <div className="action-row flex-wrap pt-2 border-t border-stone-200 dark:border-stone-700">
          <button className="primary-button" onClick={submit}>Sí, entregar</button>
          <button className="secondary-button" onClick={() => { const ok = storageService.saveActiveSession(snapshot()); if (ok) onLeave?.(); }}>Guardar y salir</button>
          <button className="secondary-button" onClick={() => setOverlay(null)}>Seguir respondiendo</button>
        </div>
      </div>
    </Dialog>}
  </div>;
}
function ExamClock({ enabled, deadline, startTime, onExpire }: {
  enabled: boolean; deadline?: number; startTime: string; onExpire: () => void;
}) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (!enabled) return;
    const tick = () => {
      const currentTime = Date.now();
      setNow(currentTime);
      if (deadline && currentTime >= deadline) onExpire();
    };
    tick();
    const interval = window.setInterval(tick, 1000);
    document.addEventListener('visibilitychange', tick);
    return () => { window.clearInterval(interval); document.removeEventListener('visibilitychange', tick); };
  }, [enabled, deadline, onExpire]);

  const remaining = Math.max(0, Math.ceil(((deadline || now) - now) / 1000));
  const elapsed = Math.max(0, Math.floor((now - Date.parse(startTime)) / 1000));
  return <>
    {enabled && <span className={remaining <= 300 ? 'time-warning' : 'timer'} aria-label="Tiempo restante">{Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}</span>}
    <span role="status" className="sr-only">{enabled && remaining <= 60 ? 'Queda un minuto o menos. Al terminar el tiempo se entrega la prueba automáticamente.' : enabled && remaining <= 300 ? 'Quedan cinco minutos o menos.' : ''}</span>
    <span className="sr-only">Tiempo transcurrido: {elapsed} segundos</span>
  </>;
}

export function options(value: import('../../types').Item['options']) {
  return Array.isArray(value) ? value.map((option, index) => ({ letter: (option.letter || 'ABCD'[index]) as 'A' | 'B' | 'C' | 'D', text: typeof option === 'string' ? option : option.text })) : (Object.entries(value).map(([letter, text]) => ({ letter: letter as 'A' | 'B' | 'C' | 'D', text })));
}
