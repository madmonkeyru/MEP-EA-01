import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AppRoute } from '../../services/navigation';
import { storageService } from '../../services/storageService';
import { Dialog } from '../../components/common/Dialog';
import { PaywallModal } from '../../components/common/PaywallModal';
import { TextRenderer } from '../../components/common/TextRenderer';
import { FormulasSheet } from '../../components/knowledge/FormulasSheet';
import { BxmDigitalTemario } from '../bxm-learning/components/BxmDigitalTemario';
import { BxmSessionRunnerView, BxmSessionResultBreakdownView } from '../bxm-assessment/components/BxmSessionRunnerView';
import { SessionRunner } from '../bxm-assessment/sessionRunner';
import type { BlueprintSelectionResult, SessionResultExport, DifficultyTier } from '../bxm-assessment/types';
import { BxmPreparationDashboard } from '../bxm-progress/ui/BxmPreparationDashboard';
import { BXM_OFFICIAL_EVIDENCES_FIXTURE as catalog } from '../bxm-progress/ui/evidenceCatalogFixture';
import { useSubscriptionCapabilities } from './capabilities';
import { BxmLearningStore } from './learningStore';
import { inventory, lessons, policyFor, preparePresentation, sampleLessonKeys, selectActivity, type ActivityRequest } from './providers';

interface Props { userId: string; route: AppRoute; onNavigate: (route: AppRoute) => void; onOfficialSimulation: () => void }
interface Pending { request: ActivityRequest; selection: BlueprintSelectionResult; seed: number }
export function BxmLearningHub({ userId, route, onNavigate, onOfficialSimulation }: Props) {
  const capabilities = useSubscriptionCapabilities();
  const store = useMemo(() => new BxmLearningStore(userId), [userId]);
  const [revision, setRevision] = useState(0);
  const [message, setMessage] = useState(store.lastError);
  const [paywall, setPaywall] = useState(false);
  const [discard, setDiscard] = useState(false);
  const [pending, setPending] = useState<Pending | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState(route.evidenceKey || [...sampleLessonKeys][0]);
  const [difficulty, setDifficulty] = useState<DifficultyTier | undefined>();
  const [runner, setRunner] = useState<SessionRunner | null>(() => {
    const saved = store.getActive();
    return saved && saved.sessionId === route.sessionId && route.tab === 'assessment' ? SessionRunner.restore(saved) : null;
  });
  const tab = route.tab || 'diagnostic';
  const go = useCallback((nextTab: string, evidenceKey?: string, sessionId?: string) => onNavigate({
    view: 'learning', programId: 'bxm', subjectId: 'matematicas', convocatoriaId: '2026-c2', tab: nextTab, evidenceKey, sessionId,
  }), [onNavigate]);
  useEffect(() => { store.reconcile(); if (store.lastError) setMessage(store.lastError); }, [store]);
  const persist = useCallback((current: SessionRunner) => {
    if (!store.saveActive(current)) setMessage(store.lastError);
  }, [store]);
  const finish = useCallback((result: SessionResultExport) => {
    const saved = store.complete(result);
    setMessage(saved ? '' : store.lastError);
    setRevision(value => value + 1);
    setRunner(null);
    go('result', undefined, result.sessionId);
  }, [store, go]);
  const active = store.getActive();
  const result = store.getResult(route.sessionId);
  const events = store.progress.getEvents();
  const allow = (feature: Parameters<typeof capabilities.canAccess>[0]) => {
    if (capabilities.canAccess(feature)) return true;
    setPaywall(true); return false;
  };
  function request(requested: ActivityRequest) {
    if (requested.kind !== 'diagnostic' && !allow(requested.generated ? 'isomorphic_practice_drills' : requested.kind === 'mock_exam' ? 'configurable_mock_sessions' : 'extended_authored_practice')) return;
    if (active) { setMessage('Tienes una actividad guardada. Reanúdala o descártala antes de iniciar otra.'); return; }
    const seed = crypto.getRandomValues(new Uint32Array(1))[0];
    const selection = selectActivity(requested, seed, events.map(e => e.itemId), events.flatMap(e => e.familyId ? [e.familyId] : []));
    if (!selection.items.length) { setMessage('No hay ejercicios disponibles con esta selección. Elige otra evidencia o dificultad.'); return; }
    setPending({ request: requested, selection, seed });
  }
  function begin() {
    if (!pending) return;
    // Recheck permissions when the preflight is accepted, including a tier change.
    if (pending.request.kind !== 'diagnostic' && !allow(pending.request.generated ? 'isomorphic_practice_drills' : pending.request.kind === 'mock_exam' ? 'configurable_mock_sessions' : 'extended_authored_practice')) return;
    const next = new SessionRunner({ sessionId: `bxm-${crypto.randomUUID()}`, items: preparePresentation(pending.selection.items, pending.seed, store.getExposedItemIds()),
      policy: policyFor(pending.request.kind), shortfalls: pending.selection.shortfalls, benchmarkExposed: pending.selection.benchmarkExposed });
    persist(next); setRunner(next); setPending(null); setMessage(store.lastError);
    go('assessment', pending.request.evidenceKey, next.sessionId);
  }
  function resume() {
    if (!active) return;
    try { const restored = SessionRunner.restore(active); setRunner(restored); go('assessment', undefined, active.sessionId); }
    catch { setMessage('No se pudo reanudar este intento. El registro se conserva para su revisión.'); }
  }
  function openLesson(key: string) { go('temario', key); }
  const results = store.getResults();
  const legacy = storageService.getContextAttempts({ programId: 'bxm', subjectId: 'matematicas', convocatoriaId: '2026-c2' }, userId);
  return <div className="page-width py-6 space-y-5 min-w-0" data-revision={revision}>
    <header className="ui-surface rounded-2xl p-5 space-y-3">
      <h1 className="text-2xl font-semibold">Aprendizaje guiado · Matemáticas BXM</h1>
      <p>Diagnóstico, lecciones y práctica de autor. El paquete inicial incluye cuatro lecciones y 30 ejercicios en tres áreas; cubre una parte de las 71 evidencias.</p>
      <nav aria-label="Aprendizaje BXM" className="flex flex-wrap gap-2">
        {([['diagnostic','Diagnóstico'],['temario','Temario de aprendizaje'],['practice','Práctica de autor'],['path','Mi plan'],['progress','Mi preparación']] as const).map(([id, label]) =>
          <button key={id} aria-current={tab === id ? 'page' : undefined} className="secondary-button" onClick={() => go(id)}>{label}</button>)}
        <button className="text-link" onClick={() => onNavigate({ view: 'hub', programId: 'bxm', subjectId: 'matematicas', convocatoriaId: '2026-c2' })}>Volver a Matemáticas</button>
      </nav>
    </header>
    {message && <div role="alert" className="feedback-panel space-y-2"><p>{message}</p>{store.lastError && <button className="secondary-button" onClick={() => { store.retrySave(); setMessage(store.lastError); }}>Reintentar guardado</button>}</div>}
    {active && tab !== 'assessment' && <section className="feedback-panel"><h2>Actividad de aprendizaje guardada</h2><p>{active.items.length} preguntas. {active.deadline ? 'El tiempo sigue corriendo al salir.' : 'Sin límite de tiempo.'}</p><div className="action-row"><button className="primary-button" onClick={resume}>Reanudar aprendizaje</button><button className="secondary-button" onClick={() => setDiscard(true)}>Descartar actividad</button></div></section>}
    {tab === 'diagnostic' && <section className="ui-surface p-5 rounded-2xl space-y-4">
      <h2 className="text-xl font-semibold">¿Qué necesitas repasar?</h2>
      <p>Diagnóstico gratuito: hasta 20 preguntas / 30 minutos. La muestra abarca las tres áreas, pero no evalúa todas las evidencias. Verás la cobertura antes de empezar.</p>
      <button className="primary-button" onClick={() => request({ kind: 'diagnostic' })}>Preparar diagnóstico</button>
      <p>La prueba oficial de referencia se conserva separada y gratuita.</p><button className="secondary-button" onClick={onOfficialSimulation}>Examen oficial de referencia · 60 preguntas</button>
    </section>}
    {tab === 'temario' && <BxmDigitalTemario key={route.evidenceKey || 'catalog'} initialEvidenceKey={route.evidenceKey} onEvidenceChange={key => go('temario', key)} capabilities={{ isPremium: capabilities.getTier() === 'premium' }} callbacks={{
      onRequestDiagnostic: () => request({ kind: 'diagnostic' }),
      onStartTargetedPractice: key => request({ kind: 'evidence_practice', evidenceKey: key }),
      onMicroQuizAnswered: activity => {
        if (!activity.eventId) return;
        if (!store.recordActivity({ ...activity, eventId: activity.eventId })) setMessage(store.lastError);
        setRevision(value => value + 1);
      },
    }} />}
    {tab === 'practice' && <section className="ui-surface p-5 rounded-2xl space-y-4">
      <h2 className="text-xl font-semibold">Práctica por evidencia</h2>
      <label className="block">Evidencia<select aria-label="Evidencia" className="w-full" value={selectedEvidence} onChange={e => setSelectedEvidence(e.target.value)}>
        {catalog.map(e => <option key={e.key} value={e.key}>{e.domain} · {e.rawCode} · {e.description}</option>)}
      </select></label>
      <label className="block">Dificultad de práctica<select aria-label="Dificultad de práctica" value={difficulty || ''} onChange={e => setDifficulty(e.target.value ? Number(e.target.value) as DifficultyTier : undefined)}><option value="">Todas</option><option value="1">Básico</option><option value="2">Intermedio</option><option value="3">Avanzado</option></select></label>
      <p>{inventory[selectedEvidence]?.totalItems || 0} ejercicios base disponibles para esta evidencia.</p>
      <div className="action-row">
        <button className="primary-button" onClick={() => request({ kind: 'evidence_practice', evidenceKey: selectedEvidence, difficulty })}>Preparar práctica</button>
        <button className="secondary-button" onClick={() => request({ kind: 'mastery_check', evidenceKey: selectedEvidence })}>Comprobar aprendizaje</button>
        <button className="secondary-button" onClick={() => request({ kind: 'retest', evidenceKey: selectedEvidence })}>Preparar retest</button>
        <button className="secondary-button" onClick={() => request({ kind: 'evidence_practice', evidenceKey: selectedEvidence, generated: true })}>Practicar variantes</button>
        <button className="secondary-button" onClick={() => request({ kind: 'mock_exam' })}>Simulacro formativo · 20 preguntas</button>
      </div>
      <button className="text-link" onClick={() => openLesson(selectedEvidence)}>Ver esta evidencia en el temario</button>
    </section>}
    {(tab === 'progress' || tab === 'path') && (capabilities.canAccess('longitudinal_mastery_dashboard')
      ? <BxmPreparationDashboard key={tab} initialTab={tab === 'path' ? 'queue' : 'overview'} events={events} completions={store.getCompletions()} capabilityProvider={capabilities} availableInventoryByEvidence={inventory} availableLessonKeys={lessons.map(l => l.evidenceKey)}
        onNavigateToLesson={openLesson} onNavigateToPractice={(key, tier) => request({ kind: 'evidence_practice', evidenceKey: key, difficulty: tier as DifficultyTier })} onOpenUpgradeModal={() => setPaywall(true)} />
      : <section className="feedback-panel space-y-3"><h2>Seguimiento personalizado Premium</h2><p>El diagnóstico, sus resultados básicos y una lección completa por área siguen disponibles gratis.</p><button className="primary-button" onClick={() => setPaywall(true)}>Ver opciones Premium</button></section>)}
    {tab === 'assessment' && (runner && runner.sessionId === route.sessionId ? <BxmSessionRunnerView key={runner.sessionId} runner={runner} onFinish={finish} onStateChange={persist} onExit={() => go('diagnostic')} formulaSheet={<FormulasSheet />} />
      : <section className="feedback-panel"><h2>Actividad no disponible en este perfil</h2><p>Busca el intento guardado o inicia otra actividad.</p><button onClick={() => go('diagnostic')}>Volver al diagnóstico</button></section>)}
    {tab === 'result' && (result ? <>
      <BxmSessionResultBreakdownView result={result} onExit={() => go('diagnostic')} />
      <section className="ui-surface p-5 rounded-2xl space-y-3"><h2 className="text-xl font-semibold">Qué estudiar después</h2><p>Las evidencias sin preguntas en este intento permanecen sin medir.</p>
        {Object.values(result.evidenceBreakdowns).map(e => <div key={e.evidenceId} className="flex flex-wrap gap-3 items-center"><span>{e.domain} · {e.evidenceCode}: {e.correctFirstResponseCount}/{e.totalItems}</span><button className="text-link" onClick={() => openLesson(e.evidenceId)}>Estudiar evidencia {e.evidenceCode}</button></div>)}
        <button className="secondary-button" onClick={() => go('progress')}>Ver mi preparación</button>
        <button className="secondary-button" onClick={() => downloadResult(result)}>Descargar resultado</button>
      </section>
      <ResultReview result={result} onExpose={id => { if (!store.markExposed(id)) setMessage(store.lastError); }} />
    </> : <p role="status">No hay un resultado para esta dirección en el perfil actual.</p>)}
    {tab !== 'assessment' && <section className="ui-surface p-5 rounded-2xl space-y-3">
      <h2 className="text-xl font-semibold">Resultados de aprendizaje de este perfil</h2>
      {!results.length && <p>Aún no hay resultados de aprendizaje.</p>}
      {results.map(r => <div className="flex flex-wrap gap-3" key={r.sessionId}><span>{new Date(r.completedAt).toLocaleString('es-CR', { timeZone: 'America/Costa_Rica' })} · {r.firstResponseCorrectCount}/{r.totalActualItems}</span><button className="text-link" onClick={() => go('result', undefined, r.sessionId)}>Revisar aprendizaje</button></div>)}
      <p>Comprobaciones de lección: {store.getActivities().length}. Se registran como actividad; no certifican dominio.</p>
      {legacy.length > 0 && <><p>{legacy.length} registros anteriores se conservan en el historial de referencia.</p><button className="secondary-button" onClick={() => { store.progress.importLegacyBaselineAttempts(); const report = store.progress.lastImport; setMessage(`Importados: ${report.imported}; solo resumen: ${report.summaryOnly}; omitidos: ${report.skipped}. Los registros antiguos no cuentan para dominio.`); setRevision(value => value+1); }}>Importar historial anterior de este perfil</button></>}
    </section>}
    {pending && <Dialog title="Antes de comenzar la actividad" onClose={() => setPending(null)}>
      <p>{pending.selection.totalSelected} de {pending.selection.totalRequested} preguntas. {policyFor(pending.request.kind).mode === 'exam' ? `${policyFor(pending.request.kind).timeLimitMinutes} minutos; sin pistas ni corrección antes de entregar.` : 'Sin cronómetro; con explicación y reintentos.'}</p>
      {pending.selection.isPartial && <p role="status">Cobertura limitada: no hay suficientes preguntas para completar esta selección. Puedes aceptar una actividad más corta.</p>}
      <p>{new Set(pending.selection.items.map(i => i.evidenceId)).size} de 71 evidencias; {new Set(pending.selection.items.map(i => i.familyId || i.id)).size} familias independientes.</p>
      <p>{pending.selection.items.filter(i => events.some(e => e.itemId === String(i.id) || (!!i.familyId && e.familyId === i.familyId))).length} preguntas pertenecen a ítems o familias ya practicados.</p>
      <p>Contenido de autor con controles automáticos; revisión matemática humana pendiente. La nota es un indicador de estudio, no una predicción oficial.</p>
      <button className="primary-button" onClick={begin}>{pending.selection.isPartial ? 'Aceptar actividad limitada' : 'Comenzar actividad'}</button>
    </Dialog>}
    {discard && <Dialog title="¿Descartar la actividad de aprendizaje?" onClose={() => setDiscard(false)}><p>No se registrará un resultado; se conservan las exposiciones a explicaciones ya mostradas.</p><button className="primary-button" onClick={() => { const ok = store.discardActive(); setRunner(null); setDiscard(false); setMessage(ok ? '' : store.lastError); setRevision(value => value+1); go('diagnostic'); }}>Sí, descartar actividad</button></Dialog>}
    <PaywallModal isOpen={paywall} onClose={() => setPaywall(false)} />
  </div>;
}
function ResultReview({ result, onExpose }: { result: SessionResultExport; onExpose: (id: string) => void }) {
  const [open, setOpen] = useState<string | null>(null);
  return <section className="ui-surface p-5 rounded-2xl space-y-3"><h2 className="text-xl font-semibold">Revisión y explicación</h2>{result.itemSnapshots.map((item, index) => <article className="border rounded-xl p-3 min-w-0" key={item.id}>
    <button className="text-link" aria-expanded={open === String(item.id)} onClick={() => { setOpen(String(item.id)); onExpose(String(item.id)); }}>Revisar pregunta {index+1}</button>
    {open === String(item.id) && <div className="space-y-3"><TextRenderer content={item.stem} /><p>Respuesta correcta: {item.correctAnswer}</p><TextRenderer content={Array.isArray(item.options) ? item.options.find(o => o.letter === item.correctAnswer)?.text : item.options[item.correctAnswer]} />
      {item.solutionSteps?.map((step, i) => <TextRenderer key={i} content={typeof step === 'string' ? step : step.explanation} />)}</div>}
  </article>)}</section>;
}
function downloadResult(result: SessionResultExport) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a'); link.href = url; link.download = `bxm-${result.sessionId}.json`; link.click(); URL.revokeObjectURL(url);
}
