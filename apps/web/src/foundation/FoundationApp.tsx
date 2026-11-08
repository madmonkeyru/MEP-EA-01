import { useEffect, useState } from 'react';
import { createLearningPreviewCatalog } from '@mep-ea/content/expansion';
import { createOfflineJourney, type LearningContinuity, type DraftState } from '@mep-ea/api';
import { LearningBrowser } from './LearningBrowser';
import { ContinuitySurface } from './ContinuitySurface';
import { ConflictReviewModal, type ConflictResolutionChoice } from './ConflictReviewModal';
import type { JourneyState } from '@mep-ea/learning-runtime';
import { TextRenderer as MathText } from '../components/common/TextRenderer';

const catalog = createLearningPreviewCatalog();
const storage = {
  getItem: (key: string) => localStorage.getItem(key),
  setItem: (key: string, value: string) => localStorage.setItem(key, value),
  removeItem: (key: string) => localStorage.removeItem(key),
};
const { journey, api } = createOfflineJourney(catalog, storage, 'p2-local');
const tiers = { strong: 'Fortaleza', developing: 'En progreso', needs_practice: 'Necesita práctica' };

export function FoundationApp() {
  const [activeTab, setActiveTab] = useState<'learn' | 'continuity'>('learn');
  const [state, setState] = useState<JourneyState | null>(null);
  const [evidenceKey, setEvidenceKey] = useState('');
  const [program, setProgram] = useState('');
  const [subject, setSubject] = useState('');
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Continuity data state
  const [continuity, setContinuity] = useState<LearningContinuity | null>(null);
  const [continuityLoading, setContinuityLoading] = useState(false);

  // Conflict review state
  const [conflictState, setConflictState] = useState<DraftState | null>(null);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);

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

  const loadContinuity = async () => {
    if (!api) return;
    setContinuityLoading(true);
    try {
      const data = await api.getLearningContinuity();
      setContinuity(data);
    } catch {
      // Offline or unauthenticated continuity fallback
    } finally {
      setContinuityLoading(false);
    }
  };

  const handleResolveConflict = (choice: ConflictResolutionChoice) => {
    setIsConflictModalOpen(false);
    setConflictState(null);
    if (state && choice.reconciledAttempt) {
      void run(async () => {
        // Save the reconciled state
        await storage.setItem(`mep-ea:v1:attempt:p2-local:${state.attempt.id}`, JSON.stringify(choice.reconciledAttempt));
        return journey.resume();
      });
    }
  };

  const attempt = state?.attempt;
  const question = state?.assessment.questions[attempt?.currentIndex ?? 0];
  const result = state && attempt?.status === 'submitted' ? journey.result(state) : null;

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <a href="/" className="text-sm text-blue-600 hover:underline">← Volver a la aplicación</a>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('learn')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${activeTab === 'learn' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            Ruta de Estudio
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('continuity');
              void loadContinuity();
            }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${activeTab === 'continuity' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            Mi Progreso y Nivelación
          </button>
        </div>
      </div>

      <h1 className="text-3xl font-bold">Mi ruta de aprendizaje</h1>
      <p className="text-slate-600 text-sm">
        Vista previa de desarrollo · 71 evidencias y 30 preguntas propias de BXM. Contenido pendiente de revisión editorial.
      </p>

      {error && (
        <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
          {error} <button disabled={busy} onClick={() => void run(() => journey.resume())} className="underline ml-2">Reintentar carga</button>
        </div>
      )}

      {!ready && !error && <p role="status">Cargando…</p>}

      {/* Continuity Surface Tab */}
      {activeTab === 'continuity' && (
        <div className="space-y-4">
          {continuityLoading ? (
            <p className="text-sm text-slate-500">Cargando datos de nivelación del servidor…</p>
          ) : continuity ? (
            <ContinuitySurface
              continuity={continuity}
              catalog={catalog}
              onAction={(evKey, action) => {
                setEvidenceKey(evKey);
                setActiveTab('learn');
                setProgram('bxm');
                setSubject('matematica');
                if (action === 'diagnose') {
                  const diagBp = catalog.blueprints.find(b => b.mode === 'diagnostic');
                  if (diagBp) void run(() => journey.start(diagBp.id));
                } else {
                  const node = catalog.nodes.find(n => n.key === evKey);
                  if (node?.practiceBlueprintId) void run(() => journey.start(node.practiceBlueprintId!));
                }
              }}
            />
          ) : (
            <div className="p-6 border rounded-xl bg-slate-50 text-center space-y-3">
              <h3 className="font-semibold text-slate-800">Modo Local Sin Conexión</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Tu progreso actual se guarda en este dispositivo. Cuando inicies sesión o te conectes al servicio, tu dominio longitudinal y Plan de Nivelación se sincronizarán aquí.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('learn')}
                className="text-xs font-medium bg-slate-900 text-white px-4 py-2 rounded-lg"
              >
                Continuar estudiando localmente
              </button>
            </div>
          )}
        </div>
      )}

      {/* Learn Tab */}
      {activeTab === 'learn' && (
        <>
          {ready && !state && (
            <section className="space-y-4" aria-label="Programa y asignatura">
              <h2>Elige tu programa</h2>
              <label className="block text-sm font-medium text-slate-700">
                Programa
                <select
                  value={program}
                  onChange={e => { setProgram(e.target.value); setSubject(''); }}
                  className="mt-1 block w-full border rounded-lg p-2"
                >
                  <option value="">Seleccionar programa</option>
                  {catalog.registry.taxonomy.programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Asignatura
                <select
                  disabled={!program}
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="mt-1 block w-full border rounded-lg p-2 disabled:bg-slate-100"
                >
                  <option value="">Seleccionar asignatura</option>
                  {catalog.registry.taxonomy.subjects.filter(s => s.programId === program).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </label>
              {catalog.blueprints.filter(b => b.mode === 'diagnostic' && b.programId === program && b.subjectId === subject).map(b => (
                <div key={b.id} className="p-4 border rounded-xl bg-slate-50 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">Diagnóstico breve</h3>
                    <p className="text-xs text-slate-500">{b.totalItems} preguntas · {b.timeLimitSeconds / 60} minutos</p>
                  </div>
                  <button
                    disabled={busy}
                    onClick={() => void run(() => journey.start(b.id))}
                    className="text-sm font-medium bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50"
                  >
                    Comenzar diagnóstico
                  </button>
                </div>
              ))}
            </section>
          )}

          {ready && !state && program === 'bxm' && subject === 'matematica' && (
            <LearningBrowser initialKey={evidenceKey} catalog={catalog} busy={busy} start={id => void run(() => journey.start(id))} />
          )}

          {result && attempt && state ? (
            <section aria-label="Resultado" className="space-y-4">
              <h2>Resultado: {attempt.score?.correct} / {attempt.score?.total}</h2>
              <p>Sin responder: {attempt.score?.unanswered}</p>
              <h2>Diagnóstico inicial</h2>
              <p>Estimación provisional de esta prueba breve; no acredita dominio sostenido.</p>
              <ul>{result.diagnostic.domains.map(d => <li key={d.domainId}>{catalog.registry.taxonomy.domains.find(t => t.id === d.domainId)?.name}: {tiers[d.tier]} ({d.correct}/{d.total})</li>)}</ul>
              <h2>Plan de refuerzo</h2>
              {result.diagnostic.weakEvidenceIds.map(key => <button className="block" key={key} disabled={busy} onClick={() => { setEvidenceKey(key); setState(null); setProgram('bxm'); setSubject('matematica'); }}>Estudiar evidencia {key.split('/').at(-2)} {key.split('/').at(-1)}</button>)}
              {result.plan.activities.map(a => <article key={a.conceptId} className="p-4 border rounded space-y-2">
                <h3>{catalog.registry.taxonomy.concepts.find(c => c.id === a.conceptId)?.name}</h3>
                <p>Revisa el ejemplo y resuélvelo de nuevo antes de consultar los pasos.</p><MathText content={a.title} />
                <details><summary>Ver solución paso a paso</summary><ol>{a.steps.map((s, i) => <li key={i}><MathText content={s} /></li>)}</ol></details>
              </article>)}
              <p>{result.plan.nextStep === 'practice' ? 'Siguiente paso: repasa los ejemplos y vuelve a evaluar lo aprendido.' : 'Siguiente paso: repite la evaluación para comprobar tu aprendizaje.'}</p>
              <button disabled={busy} onClick={() => void run(() => journey.start(state.assessment.blueprint.id))}>Iniciar nueva evaluación</button>
              <button disabled={busy} onClick={() => { setState(null); setProgram('bxm'); setSubject('matematica'); }}>Volver al catálogo</button>
            </section>
          ) : state && attempt && question ? (
            <section className="space-y-4">
              <h2>{state.assessment.blueprint.mode === 'practice' ? 'Práctica por evidencia' : 'Diagnóstico de Matemática'}</h2>
              <p>Pregunta {attempt.currentIndex + 1} de {state.assessment.questions.length}</p>
              <p>Guardado en este dispositivo · Límite: {new Date(attempt.deadlineAt).toLocaleTimeString()}</p>
              <fieldset disabled={busy} className="space-y-3">
                <legend><MathText content={question.stem} /></legend>
                {question.options.map(o => (
                  <label key={o.id} className="block p-3 border rounded">
                    <input
                      type="radio"
                      name={question.id}
                      checked={attempt.answers[question.id]?.optionId === o.id}
                      onChange={() => void run(() => journey.answer(question.id, o.id))}
                    /> {o.id}. <MathText content={o.text} />
                  </label>
                ))}
              </fieldset>
              <div className="flex gap-4 flex-wrap">
                <button disabled={busy || !attempt.currentIndex} onClick={() => void run(() => journey.goTo(attempt.currentIndex - 1))}>Anterior</button>
                <button disabled={busy || attempt.currentIndex === state.assessment.questions.length - 1} onClick={() => void run(() => journey.goTo(attempt.currentIndex + 1))}>Siguiente</button>
                <button disabled={busy} onClick={() => void run(() => journey.submit())}>Entregar prueba</button>
              </div>
              <p>Puedes entregar con preguntas sin responder; contarán como incorrectas.</p>
            </section>
          ) : null}
        </>
      )}

      {/* Multi-Device Conflict Review Modal */}
      {conflictState && attempt && (
        <ConflictReviewModal
          conflictState={conflictState}
          localAttempt={attempt}
          isOpen={isConflictModalOpen}
          onResolve={handleResolveConflict}
          onCancel={() => setIsConflictModalOpen(false)}
        />
      )}
    </main>
  );
}
