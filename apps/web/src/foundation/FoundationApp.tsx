import { useEffect, useState } from 'react';
import { createJourneyPreviewCatalog } from '@mep-ea/content/preview';
import { LearnerJourney, type JourneyState } from '@mep-ea/learning-runtime';
import { TextRenderer as MathText } from '../components/common/TextRenderer';
const catalog = createJourneyPreviewCatalog();
const journey = new LearnerJourney(catalog, {
  getItem: key => localStorage.getItem(key), setItem: (key, value) => localStorage.setItem(key, value), removeItem: key => localStorage.removeItem(key),
}, 'p1-local');
const tiers = { strong: 'Fortaleza', developing: 'En progreso', needs_practice: 'Necesita práctica' };
export function FoundationApp() {
  const [state, setState] = useState<JourneyState | null>(null);
  const [program, setProgram] = useState(''); const [subject, setSubject] = useState('');
  const [ready, setReady] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const run = async (action: () => Promise<JourneyState | null>) => {
    setBusy(true); setError('');
    try { setState(await action()); setReady(true); } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo guardar.'); }
    finally { setBusy(false); }
  };
  useEffect(() => { void run(() => journey.resume()); }, []);
  useEffect(() => {
    if (!state || state.attempt.status !== 'in_progress') return;
    const timer = setInterval(() => { if (Date.now() >= Date.parse(state.attempt.deadlineAt)) void run(() => journey.expire(state)); }, 1000);
    return () => clearInterval(timer);
  }, [state]);
  const attempt = state?.attempt; const question = state?.assessment.questions[attempt?.currentIndex ?? 0];
  const result = state && attempt?.status === 'submitted' ? journey.result(state) : null;
  return <main className="max-w-3xl mx-auto p-6 space-y-6">
    <a href="/">Volver a la aplicación</a><h1 className="text-3xl font-bold">Mi ruta de aprendizaje</h1>
    <p>Vista previa de desarrollo · 3 preguntas de BXM. Contenido pendiente de revisión editorial.</p>
    {error && <div role="alert">{error} <button disabled={busy} onClick={() => void run(() => journey.resume())}>Reintentar carga</button></div>}
    {!ready && !error && <p role="status">Cargando…</p>}
    {ready && !state && <section className="space-y-4" aria-label="Programa y asignatura">
      <h2>Elige tu programa</h2>
      <label className="block">Programa <select value={program} onChange={e => { setProgram(e.target.value); setSubject(''); }}>
        <option value="">Seleccionar programa</option>{catalog.registry.taxonomy.programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select></label>
      <label className="block">Asignatura <select disabled={!program} value={subject} onChange={e => setSubject(e.target.value)}>
        <option value="">Seleccionar asignatura</option>{catalog.registry.taxonomy.subjects.filter(s => s.programId === program).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select></label>
      {catalog.blueprints.filter(b => b.programId === program && b.subjectId === subject).map(b => <div key={b.id}>
        <p>Diagnóstico breve · {b.totalItems} preguntas · {b.timeLimitSeconds / 60} minutos</p>
        <button disabled={busy} onClick={() => void run(() => journey.start(b.id))}>Comenzar diagnóstico</button>
      </div>)}
    </section>}
    {result && attempt && state ? <section aria-label="Resultado" className="space-y-4">
      <h2>Resultado: {attempt.score?.correct} / {attempt.score?.total}</h2><p>Sin responder: {attempt.score?.unanswered}</p>
      <h2>Diagnóstico inicial</h2><p>Estimación provisional de esta prueba breve; no acredita dominio sostenido.</p>
      <ul>{result.diagnostic.domains.map(d => <li key={d.domainId}>{catalog.registry.taxonomy.domains.find(t => t.id === d.domainId)?.name}: {tiers[d.tier]} ({d.correct}/{d.total})</li>)}</ul>
      <h2>Plan de refuerzo</h2>
      {result.plan.activities.map(a => <article key={a.conceptId} className="p-4 border rounded space-y-2">
        <h3>{catalog.registry.taxonomy.concepts.find(c => c.id === a.conceptId)?.name}</h3>
        <p>Revisa el ejemplo y resuélvelo de nuevo antes de consultar los pasos.</p><MathText content={a.title} />
        <details><summary>Ver solución paso a paso</summary><ol>{a.steps.map((s, i) => <li key={i}><MathText content={s} /></li>)}</ol></details>
      </article>)}
      <p>{result.plan.nextStep === 'practice' ? 'Siguiente paso: repasa los ejemplos y vuelve a evaluar lo aprendido.' : 'Siguiente paso: repite la evaluación para comprobar tu aprendizaje.'}</p>
      <button disabled={busy} onClick={() => void run(() => journey.start(state.assessment.blueprint.id))}>Iniciar nueva evaluación</button>
    </section> : state && attempt && question ? <section className="space-y-4">
      <h2>Diagnóstico de Matemática</h2><p>Pregunta {attempt.currentIndex + 1} de {state.assessment.questions.length}</p>
      <p>Guardado en este dispositivo · Límite: {new Date(attempt.deadlineAt).toLocaleTimeString()}</p>
      <fieldset disabled={busy} className="space-y-3"><legend><MathText content={question.stem} /></legend>
        {question.options.map(o => <label key={o.id} className="block p-3 border rounded"><input type="radio" name={question.id} checked={attempt.answers[question.id]?.optionId === o.id} onChange={() => void run(() => journey.answer(question.id, o.id))} /> {o.id}. <MathText content={o.text} /></label>)}
      </fieldset><div className="flex gap-4 flex-wrap">
        <button disabled={busy || !attempt.currentIndex} onClick={() => void run(() => journey.goTo(attempt.currentIndex - 1))}>Anterior</button>
        <button disabled={busy || attempt.currentIndex === state.assessment.questions.length - 1} onClick={() => void run(() => journey.goTo(attempt.currentIndex + 1))}>Siguiente</button>
        <button disabled={busy} onClick={() => void run(() => journey.submit())}>Entregar prueba</button>
      </div><p>Puedes entregar con preguntas sin responder; contarán como incorrectas.</p>
    </section> : null}
  </main>;
}
