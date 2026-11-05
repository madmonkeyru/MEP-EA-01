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
import { computeEvidenceMasteryRecords } from '../bxm-progress/domain/masteryEngine';
import { PlanDeNivelacionView } from '../../components/results/PlanDeNivelacionView';
import { generateRemediationPlanFromSessionResult } from '../../services/remediationEngine';

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

  // Compute prioritized recommendation from the active result
  const recommendation = useMemo(() => {
    if (!result || !result.evidenceBreakdowns) return null;
    const measuredBreakdowns = Object.values(result.evidenceBreakdowns).filter(e => e.totalItems > 0);
    if (!measuredBreakdowns.length) return null;

    // Prioritize evidence with errors in first response (lowest accuracy first)
    const sorted = [...measuredBreakdowns].sort((a, b) => {
      const accA = a.totalItems > 0 ? a.correctFirstResponseCount / a.totalItems : 1;
      const accB = b.totalItems > 0 ? b.correctFirstResponseCount / b.totalItems : 1;
      if (accA !== accB) return accA - accB;
      return (b.totalItems - b.correctFirstResponseCount) - (a.totalItems - a.correctFirstResponseCount);
    });

    // Check inventory availability (lesson or authored practice)
    for (const item of sorted) {
      const hasLesson = lessons.some(l => l.evidenceKey === item.evidenceId);
      const hasPractice = (inventory[item.evidenceId]?.totalItems || 0) > 0;
      if (hasLesson || hasPractice) {
        const accuracy = item.totalItems > 0 ? Math.round((item.correctFirstResponseCount / item.totalItems) * 100) : 0;
        return {
          evidenceId: item.evidenceId,
          evidenceCode: item.evidenceCode,
          domain: item.domain,
          accuracy,
          hasLesson,
          hasPractice,
          correct: item.correctFirstResponseCount,
          total: item.totalItems,
        };
      }
    }
    return null;
  }, [result]);

  // Compute remediation plan for mock_exam or diagnostic results
  const remediationPlan = useMemo(() => {
    if (!result || !['mock_exam', 'diagnostic'].includes(result.kind) || !result.itemSnapshots?.length) return null;
    try {
      return generateRemediationPlanFromSessionResult(result);
    } catch {
      return null;
    }
  }, [result]);

  // Compute post-practice mastery eligibility for single-evidence practice
  const practiceMasteryStatus = useMemo(() => {
    if (!result || result.kind !== 'evidence_practice' || !events.length) return null;
    const targetKey = Object.keys(result.evidenceBreakdowns)[0];
    if (!targetKey) return null;
    const masteryRecords = computeEvidenceMasteryRecords(catalog, events, new Date());
    const targetRecord = masteryRecords.find(r => r.evidenceKey === targetKey);
    const hasEnoughFamilies = (targetRecord?.qualifyingFamiliesCount || 0) >= (targetRecord?.minRequiredFamilies || 5);
    const isMastered = targetRecord?.status === 'mastered' || (result.firstResponseScorePercentage >= 75 && (targetRecord?.qualifyingFamiliesCount || 0) >= 3);
    return {
      evidenceKey: targetKey,
      record: targetRecord,
      isEligibleForMasteryCheck: isMastered || hasEnoughFamilies,
      qualifyingCount: targetRecord?.qualifyingFamiliesCount || 0,
      minRequired: targetRecord?.minRequiredFamilies || 5,
    };
  }, [result, events]);

  // Compute retest outcome and mastery recovery state
  const retestRecoveryStatus = useMemo(() => {
    if (!result || result.kind !== 'retest' || !events.length) return null;
    const targetKey = Object.keys(result.evidenceBreakdowns)[0];
    if (!targetKey) return null;
    const masteryRecords = computeEvidenceMasteryRecords(catalog, events, new Date());
    const targetRecord = masteryRecords.find(r => r.evidenceKey === targetKey);
    const accuracy = targetRecord?.accuracyPercentage || result.firstResponseScorePercentage;
    const isRecovered = (targetRecord?.status === 'mastered') || (result.firstResponseScorePercentage >= 75);
    return {
      evidenceKey: targetKey,
      evidenceCode: result.evidenceBreakdowns[targetKey]?.evidenceCode || 'A',
      domain: result.evidenceBreakdowns[targetKey]?.domain || 'geometry',
      retestScore: result.firstResponseScorePercentage,
      overallAccuracy: accuracy,
      status: targetRecord?.status || (isRecovered ? 'mastered' : 'needs_reinforcement'),
      statusLabel: targetRecord?.statusLabelEs || (isRecovered ? 'Dominio alcanzado' : 'Requiere refuerzo adicional'),
      isRecovered,
      qualifyingCount: targetRecord?.qualifyingFamiliesCount || 0,
    };
  }, [result, events]);

  return <div className="page-width py-4 sm:py-6 space-y-4 sm:space-y-5 min-w-0" data-revision={revision}>
    {tab === 'assessment' ? (
      /* Minimal compact header bar during active practice session */
      <header className="ui-surface rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-bold text-amber-500 uppercase tracking-wider font-mono">BXM</span>
          <span className="text-stone-300 dark:text-stone-700">·</span>
          <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 truncate">Sesión de Evaluación en Curso</span>
        </div>
        <button
          type="button"
          onClick={() => go('diagnostic')}
          className="text-xs font-bold px-3 py-1 rounded-lg border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors shrink-0"
        >
          Salir de la práctica
        </button>
      </header>
    ) : (
      /* Standard compact header for navigation tabs */
      <header className="ui-surface rounded-2xl p-4 sm:p-5 space-y-2.5 sm:space-y-3">
        <div className="space-y-1">
          <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Aprendizaje guiado · Matemáticas BXM
          </h1>
          <p className="hidden sm:block text-xs sm:text-sm text-stone-600 dark:text-stone-400">
            Diagnóstico, lecciones y práctica de autor. El paquete inicial incluye cuatro lecciones y 30 ejercicios en tres áreas; cubre una parte de las 71 evidencias.
          </p>
        </div>
        <nav aria-label="Aprendizaje BXM" className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {([['diagnostic','Diagnóstico'],['temario','Temario de aprendizaje'],['practice','Práctica de autor'],['simulation','Simulación'],['path','Mi plan'],['progress','Mi preparación']] as const).map(([id, label]) =>
            <button key={id} aria-current={tab === id ? 'page' : undefined} className="secondary-button text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 whitespace-nowrap shrink-0" onClick={() => go(id)}>{label}</button>)}
          <button className="text-link text-xs whitespace-nowrap shrink-0 ml-1" onClick={() => onNavigate({ view: 'hub', programId: 'bxm', subjectId: 'matematicas', convocatoriaId: '2026-c2' })}>Volver a Matemáticas</button>
        </nav>
      </header>
    )}
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
      </div>
      <button className="text-link" onClick={() => openLesson(selectedEvidence)}>Ver esta evidencia en el temario</button>
    </section>}
    {tab === 'simulation' && <section className="space-y-6">
      <div className="ui-surface p-6 rounded-2xl space-y-2">
        <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Simulación de Examen BXM</h2>
        <p className="text-sm text-stone-600 dark:text-stone-400">
          Elige entre el simulacro formativo de autor para evaluar tus habilidades y generar un plan de nivelación, o la prueba oficial de referencia conservada intacta.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Modalidad A: Simulacro formativo de autor */}
        <article className="ui-surface p-6 rounded-2xl border-2 border-indigo-200 dark:border-indigo-900 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300">
                Formativo de Autor
              </span>
              <span className="text-xs font-semibold text-stone-500">20 preguntas · 45 min</span>
            </div>
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">Simulacro Formativo de Autor</h3>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              Evalúa proporcionalmente las tres áreas de BXM (Geometría, Funciones y Estadística). Cronometrado, sin pistas durante el examen. Al finalizar, genera un <strong>Plan de Nivelación</strong> con recomendaciones de estudio y opciones de retest.
            </p>
          </div>
          <button className="primary-button w-full cursor-pointer" onClick={() => request({ kind: 'mock_exam' })}>
            Iniciar Simulacro Formativo
          </button>
        </article>

        {/* Modalidad B: Simulación oficial de referencia */}
        <article className="ui-surface p-6 rounded-2xl border border-stone-200 dark:border-stone-800 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                Oficial MEP · Gratuito
              </span>
              <span className="text-xs font-semibold text-stone-500">60 preguntas · 150 min</span>
            </div>
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">Examen Oficial de Referencia</h3>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              Prueba completa basada en la convocatoria oficial 2026-c2. Permanece completamente gratuita e independiente. No contamina ni altera tus registros de dominio de autor.
            </p>
          </div>
          <button className="secondary-button w-full cursor-pointer" onClick={onOfficialSimulation}>
            Iniciar Examen Oficial (60 ítems)
          </button>
        </article>
      </div>
    </section>}
    {(tab === 'progress' || tab === 'path') && (capabilities.canAccess('longitudinal_mastery_dashboard')
      ? <BxmPreparationDashboard key={tab} initialTab={tab === 'path' ? 'queue' : 'overview'} events={events} completions={store.getCompletions()} capabilityProvider={capabilities} availableInventoryByEvidence={inventory} availableLessonKeys={lessons.map(l => l.evidenceKey)}
        onNavigateToLesson={openLesson} onNavigateToPractice={(key, tier) => request({ kind: 'evidence_practice', evidenceKey: key, difficulty: tier as DifficultyTier })} onOpenUpgradeModal={() => setPaywall(true)} />
      : <section className="feedback-panel space-y-3"><h2>Seguimiento personalizado Premium</h2><p>El diagnóstico, sus resultados básicos y una lección completa por área siguen disponibles gratis.</p><button className="primary-button" onClick={() => setPaywall(true)}>Ver opciones Premium</button></section>)}
    {tab === 'assessment' && (runner && runner.sessionId === route.sessionId ? <BxmSessionRunnerView key={runner.sessionId} runner={runner} onFinish={finish} onStateChange={persist} onExit={() => go('diagnostic')} formulaSheet={<FormulasSheet />} />
      : <section className="feedback-panel"><h2>Actividad no disponible en este perfil</h2><p>Busca el intento guardado o inicia otra actividad.</p><button onClick={() => go('diagnostic')}>Volver al diagnóstico</button></section>)}
    {tab === 'result' && (result ? <>
      <BxmSessionResultBreakdownView result={result} onExit={() => go('diagnostic')} />

      {/* Prominent Decision Card: Tu siguiente paso recomendado */}
      {recommendation && (
        <section className="ui-surface p-5 sm:p-6 rounded-2xl border-2 border-amber-400 dark:border-amber-500/80 bg-amber-50/40 dark:bg-amber-950/20 space-y-3 min-w-0 overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <h2 className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-400">Tu siguiente paso recomendado</h2>
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              {recommendation.accuracy < 75 ? 'Reforzar:' : 'Continuar con:'} Evidencia {recommendation.evidenceCode} ({recommendation.domain})
            </h3>
            <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300">
              {recommendation.accuracy < 75
                ? `Tu resultado muestra dificultad en esta evidencia (${recommendation.correct}/${recommendation.total} aciertos en primera respuesta, ${recommendation.accuracy}%).`
                : `Demostraste buen avance en esta evidencia (${recommendation.correct}/${recommendation.total} aciertos, ${recommendation.accuracy}%).`}
            </p>
          </div>
          <div className="action-row pt-1">
            {recommendation.hasLesson ? (
              <button className="primary-button" onClick={() => openLesson(recommendation.evidenceId)}>
                Estudiar este tema en el Temario
              </button>
            ) : recommendation.hasPractice ? (
              <button className="primary-button" onClick={() => request({ kind: 'evidence_practice', evidenceKey: recommendation.evidenceId })}>
                Practicar esta evidencia
              </button>
            ) : null}
            {recommendation.hasLesson && recommendation.hasPractice && (
              <button className="secondary-button" onClick={() => request({ kind: 'evidence_practice', evidenceKey: recommendation.evidenceId })}>
                Practicar directamente
              </button>
            )}
            {recommendation.hasPractice && (
              <button className="secondary-button" onClick={() => request({ kind: 'retest', evidenceKey: recommendation.evidenceId })}>
                Preparar Retest
              </button>
            )}
          </div>
        </section>
      )}

      {/* Plan de Nivelación: Rendered when a mock_exam or diagnostic yields areas needing remediation */}
      {remediationPlan && remediationPlan.topPriorityDrilldowns.length > 0 && (
        <PlanDeNivelacionView
          plan={remediationPlan}
          onLaunchRemediationPractice={() => {
            if (recommendation?.evidenceId) {
              request({ kind: 'evidence_practice', evidenceKey: recommendation.evidenceId });
            } else {
              go('practice');
            }
          }}
        />
      )}

      {/* Retest Recovery and Mastery Update Card */}
      {retestRecoveryStatus && (
        <section className={`ui-surface p-5 sm:p-6 rounded-2xl border-2 space-y-3 min-w-0 overflow-hidden ${
          retestRecoveryStatus.isRecovered
            ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20'
            : 'border-amber-400 bg-amber-50/40 dark:bg-amber-950/20'
        }`}>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${retestRecoveryStatus.isRecovered ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <h2 className={`text-xs font-black uppercase tracking-wider ${
              retestRecoveryStatus.isRecovered ? 'text-emerald-800 dark:text-emerald-300' : 'text-amber-800 dark:text-amber-300'
            }`}>
              Resultado del Retest · Recuperación de Evidencia {retestRecoveryStatus.evidenceCode}
            </h2>
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              {retestRecoveryStatus.isRecovered
                ? `¡Evidencia Recuperada con Éxito! (${retestRecoveryStatus.retestScore}%)`
                : `Retest Completado (${retestRecoveryStatus.retestScore}%) · Continúa reforzando`}
            </h3>
            <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300">
              {retestRecoveryStatus.isRecovered
                ? `Has superado el umbral del 75% requerido para certificar el dominio en esta habilidad. Estado actualizado: ${retestRecoveryStatus.statusLabel}.`
                : `Tu puntaje actual es ${retestRecoveryStatus.overallAccuracy}% hacia el 75% requerido. Te recomendamos realizar otra práctica o repasar el tema en el temario.`}
            </p>
          </div>
          <div className="action-row pt-1">
            <button className="primary-button" onClick={() => go('progress')}>
              Ver mi preparación actualizada
            </button>
            {!retestRecoveryStatus.isRecovered && (
              <button className="secondary-button" onClick={() => request({ kind: 'evidence_practice', evidenceKey: retestRecoveryStatus.evidenceKey })}>
                Volver a practicar
              </button>
            )}
          </div>
        </section>
      )}

      {/* Post-practice Mastery Eligibility Decision */}
      {practiceMasteryStatus && (
        <section className="ui-surface p-5 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-3">
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">Comprobación de Dominio</h2>
          {practiceMasteryStatus.isEligibleForMasteryCheck ? (
            <div className="space-y-2">
              <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-400 font-medium">
                ¡Excelente práctica! Has alcanzado el criterio para comprobar tu dominio en esta evidencia.
              </p>
              <button className="primary-button" onClick={() => request({ kind: 'mastery_check', evidenceKey: practiceMasteryStatus.evidenceKey })}>
                Comprobar dominio ahora
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
                Llevas {practiceMasteryStatus.qualifyingCount} de {practiceMasteryStatus.minRequired} familias evaluadas. Continúa reforzando antes del Mastery Check oficial.
              </p>
              <button className="secondary-button" onClick={() => request({ kind: 'evidence_practice', evidenceKey: practiceMasteryStatus.evidenceKey })}>
                Seguir practicando esta evidencia
              </button>
            </div>
          )}
        </section>
      )}

      <section className="ui-surface p-5 rounded-2xl space-y-3"><h2 className="text-xl font-semibold">Desglose completo de evidencias</h2><p>Las evidencias sin preguntas en este intento permanecen sin medir.</p>
        {Object.values(result.evidenceBreakdowns).map(e => <div key={e.evidenceId} className="flex flex-wrap gap-3 items-center"><span>{e.domain} · {e.evidenceCode}: {e.correctFirstResponseCount}/{e.totalItems}</span><button className="text-link" onClick={() => openLesson(e.evidenceId)}>Estudiar evidencia {e.evidenceCode}</button></div>)}
        <div className="action-row pt-2">
          <button className="secondary-button" onClick={() => go('progress')}>Ver mi preparación</button>
          <button className="secondary-button" onClick={() => downloadResult(result)}>Descargar resultado</button>
        </div>
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
