import { useEffect, useState } from 'react';
import { createFoundationAssessment } from '@mep-ea/content/preview';
import { AssessmentSession, createLocalAdapter } from '@mep-ea/learning-runtime';
import type { Attempt } from '@mep-ea/domain';
import { TextRenderer as MathText } from '../components/common/TextRenderer';

const assessment = createFoundationAssessment();
const runtime = new AssessmentSession(assessment, createLocalAdapter({
  getItem: key => localStorage.getItem(key), setItem: (key, value) => localStorage.setItem(key, value), removeItem: key => localStorage.removeItem(key),
}), 'foundation-local', 'foundation-preview-1');

export function FoundationApp() {
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const run = async (action: () => Promise<Attempt>) => {
    setBusy(true); setError('');
    try { setAttempt(await action()); } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo guardar la prueba.'); }
    finally { setBusy(false); }
  };
  useEffect(() => { void run(() => runtime.open()); }, []);
  const question = attempt && assessment.questions[attempt.currentIndex];
  return <main className="max-w-3xl mx-auto p-6 space-y-6">
    <a href="/">Volver a la aplicación</a>
    <h1 className="text-3xl font-bold">Prueba de fundamentos</h1>
    <p>Vista previa de desarrollo · 3 preguntas de BXM. Contenido pendiente de revisión editorial.</p>
    {error && <div role="alert"><p>{error}</p><button disabled={busy} onClick={() => void run(() => runtime.open())}>Reintentar carga</button></div>}
    {!attempt && !error && <p role="status">Cargando prueba…</p>}
    {attempt?.status === 'submitted' ? <section aria-label="Resultado">
      <h2>Resultado: {attempt.score?.correct} / {attempt.score?.total}</h2>
      <p>Sin responder: {attempt.score?.unanswered}</p>
    </section> : question && attempt ? <section className="space-y-4">
      <p>Pregunta {attempt.currentIndex + 1} de {assessment.questions.length}</p>
      <p>Tiempo límite: {new Date(attempt.deadlineAt).toLocaleTimeString()}</p>
      <fieldset disabled={busy} className="space-y-3">
        <legend><MathText content={question.stem} /></legend>
        {question.options.map(option => <label key={option.id} className="block p-3 border rounded">
          <input type="radio" name={question.id} value={option.id} checked={attempt.answers[question.id]?.optionId === option.id}
            onChange={() => void run(() => runtime.answer(question.id, option.id))} />
          {' '}{option.id}. <MathText content={option.text} />
        </label>)}
      </fieldset>
      <div className="flex gap-4">
        <button disabled={busy || attempt.currentIndex === 0} onClick={() => void run(() => runtime.goTo(attempt.currentIndex - 1))}>Anterior</button>
        <button disabled={busy || attempt.currentIndex === assessment.questions.length - 1} onClick={() => void run(() => runtime.goTo(attempt.currentIndex + 1))}>Siguiente</button>
        <button disabled={busy} onClick={() => void run(() => runtime.submit())}>Entregar prueba</button>
      </div>
    </section> : null}
  </main>;
}

