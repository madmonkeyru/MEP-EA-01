import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import type { PracticeConfig, TestSession } from './types';
import { storageService } from './services/storageService';
import { dataService } from './services/dataService';
import { createSession, validSession } from './services/learningSession';
import { WizardProvider } from './components/onboarding/wizardStore';
import { Header } from './components/layout/Header';
import { EntryLandingPage } from './components/pages/EntryLandingPage';
import { WelcomePage } from './components/pages/WelcomePage';
import { SubjectHubPage } from './components/pages/LandingPage';
import { TestShell } from './components/test/TestShell';
import { ResultsPage } from './components/results/ResultsPage';
import { FrameworkHubPage, ContextControls } from './components/pages/FrameworkHubPage';
import { GenericSubjectHubPage } from './components/pages/GenericSubjectHubPage';
import { Dialog } from './components/common/Dialog';
import { type AppRoute, readRoute, routeHash } from './services/navigation';
const HelperPage = lazy(() => import('./components/onboarding/HelperPage').then(module => ({ default: module.HelperPage })));
const ReadinessWizard = lazy(() => import('./components/onboarding/ReadinessWizard').then(module => ({ default: module.ReadinessWizard })));

export function App() {
  const [currentUser, setCurrentUser] = useState(() => storageService.getCurrentUser());
  const [route, setRoute] = useState(() => readRoute(window.location.hash));
  const [ready, setReady] = useState(false);
  const [loadedContext, setLoadedContext] = useState('');
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [active, setActive] = useState<TestSession | null>(null);
  const [completed, setCompleted] = useState<TestSession | null>(null);
  const [pending, setPending] = useState<PracticeConfig | null>(null);
  const [pendingSource, setPendingSource] = useState<TestSession | null>(null);
  const [discard, setDiscard] = useState(false);
  const main = useRef<HTMLElement>(null);
  const userId = currentUser?.id || 'guest';
  const program = dataService.getPrograms().find(program => program.id === route.programId);
  const mvp = route.programId === 'bxm' && route.subjectId === 'matematicas' && route.convocatoriaId === '2026-c2';
  const contextKey = [route.programId, route.subjectId, route.moduleId, route.convocatoriaId].join('/');
  const contextReady = ready && loadedContext === contextKey;
  const navigate = (next: AppRoute) => {
    const hash = routeHash(next);
    if (window.location.hash === hash) setRoute(next); else window.location.hash = hash;
  };
  useEffect(() => {
    const changed = () => setRoute(readRoute(window.location.hash));
    window.addEventListener('hashchange', changed);
    return () => window.removeEventListener('hashchange', changed);
  }, []);
  useEffect(() => {
    let cancelled = false;
    setReady(false); setError('');
    (async () => {
      try {
        if (route.programId && route.view !== 'helper') {
          await dataService.setProgram(route.programId, route.moduleId, route.convocatoriaId);
          if (!cancelled && route.subjectId && dataService.getCurrentSubjectId() !== route.subjectId) await dataService.loadSubject(route.programId, route.subjectId);
        }
        if (!cancelled) {
          setReady(true);
          setLoadedContext(contextKey);
          if (route.view === 'hub') try { localStorage.setItem('mep_last_subject', routeHash(route)); } catch { /* Navigation still works without storage. */ }
        }
      } catch { if (!cancelled) setError('No pudimos cargar esta materia. Reintenta o explora los recursos disponibles.'); }
    })();
    return () => { cancelled = true; };
  }, [route.programId, route.subjectId, route.moduleId, route.convocatoriaId, retry]);
  useEffect(() => {
    const label = route.view === 'test' ? 'Prueba en curso' : route.view === 'results' ? 'Resultados' : route.view === 'guide' ? 'Guía opcional' : route.view === 'helper' ? 'Guía y recursos' : program?.name || 'Educación Abierta';
    document.title = label + ' · MEP-EA-01';
    const heading = main.current?.querySelector<HTMLElement>('h1');
    if (contextReady && heading) { heading.tabIndex = -1; heading.focus(); }
  }, [route.view, route.programId, route.subjectId, route.moduleId, route.convocatoriaId, route.sessionId, contextReady]);
  const hub = () => navigate({ ...route, view: 'hub', sessionId: undefined });
  const saved = storageService.getActiveSession();
  const resumable = validSession(saved, userId) ? saved : null;
  const matchesRoute = (session: TestSession | null) => session && (session.config.programId || 'bxm') === route.programId && (session.config.subjectId || 'matematicas') === route.subjectId && (session.config.convocatoriaId || '2026-c2') === route.convocatoriaId && (session.config.subprogramId || '') === (route.moduleId || '');
  const candidateTest = active && active.sessionId === route.sessionId && active.userId === userId ? active : resumable?.sessionId === route.sessionId ? resumable : null;
  const candidateResult = completed && completed.sessionId === route.sessionId && completed.userId === userId ? completed : storageService.getResult(route.sessionId, userId);
  const test = matchesRoute(candidateTest) ? candidateTest : null;
  const result = matchesRoute(candidateResult) ? candidateResult : null;
  function begin(config: PracticeConfig, force = false, source?: TestSession | null) {
    const context = { ...config, programId: route.programId || 'bxm', subjectId: route.subjectId || 'matematicas', subprogramId: route.moduleId, convocatoriaId: route.convocatoriaId || '2026-c2' };
    if (!force && resumable) { setPending(context); setPendingSource(source || null); return; }
    const session = { ...createSession(context, source?.items, source?.groups), userId };
    if (!session.items?.length) { setError('No hay preguntas disponibles con esta selección.'); return; }
    storageService.saveActiveSession(session); setActive(session); setPending(null);
    navigate({ ...route, view: 'test', sessionId: session.sessionId, programId: context.programId, subjectId: context.subjectId, convocatoriaId: context.convocatoriaId });
  }
  function resume() {
    if (!resumable) return;
    setActive(resumable); setPending(null);
    navigate({ view: 'test', programId: resumable.config.programId || 'bxm', subjectId: resumable.config.subjectId || 'matematicas', convocatoriaId: resumable.config.convocatoriaId || '2026-c2', moduleId: resumable.config.subprogramId, sessionId: resumable.sessionId });
  }
  const enterMath = () => navigate({ view: 'hub', programId: 'bxm', subjectId: 'matematicas', convocatoriaId: '2026-c2' });
  return <WizardProvider><div className="app-shell min-h-screen flex flex-col">
    <a className="skip-link" href="#main-content" onClick={event => { event.preventDefault(); main.current?.focus(); }}>Saltar al contenido</a>
    {route.view !== 'test' && <Header currentUser={currentUser} onUserChanged={setCurrentUser} onNavigateHome={() => navigate({ view: 'landing' })} currentView={route.view} onOpenHelper={() => navigate({ view: 'helper', programId: route.programId, subjectId: route.subjectId, moduleId: route.moduleId })} onProgramChange={programId => {
      const target = dataService.getPrograms().find(program => program.id === programId);
      const subjectId = target?.subjects.find(subject => subject.id === route.subjectId)?.id;
      navigate({ view: subjectId ? 'hub' : 'framework', programId, subjectId, convocatoriaId: route.convocatoriaId });
    }} />}
    <main id="main-content" ref={main} tabIndex={-1} className="flex-1 outline-none">
      {error && <section className="page-width py-6" role="alert"><h1>No se pudo completar la carga</h1><p>{error}</p><div className="action-row"><button className="primary-button" onClick={() => setRetry(value => value + 1)}>Reintentar</button><button className="secondary-button" onClick={() => navigate({ view: 'helper', programId: route.programId })}>Consultar recursos</button></div></section>}
      {!error && <Suspense fallback={<p role="status" className="page-width p-8">Cargando…</p>}>
        {route.view !== 'test' && route.view !== 'results' && resumable && <section className="resume-banner page-width"><div><strong>Tienes un intento guardado</strong><p>{resumable.itemIds.length} preguntas · {resumable.config.enableTimer ? 'El tiempo continúa mientras estás fuera.' : 'Práctica sin límite de tiempo.'}</p></div><div className="action-row"><button className="primary-button" onClick={resume}>Reanudar intento</button><button className="secondary-button" onClick={() => setDiscard(true)}>Descartar</button></div></section>}
        {route.view === 'landing' && <EntryLandingPage onOpenHelper={() => navigate({ view: 'helper' })} onExplorePrograms={() => navigate({ view: 'welcome' })} onEnterBxmHub={enterMath} />}
        {route.view === 'welcome' && <WelcomePage onSelectProgram={programId => navigate({ view: 'framework', programId, convocatoriaId: '2026-c2' })} onEnterMvpMath={enterMath} />}
        {route.view === 'helper' && <HelperPage route={route} onNavigate={navigate} />}
        {route.view === 'guide' && <ReadinessWizard onNavigate={navigate} onSkip={() => navigate({ view: 'welcome' })} onExplore={() => navigate({ view: 'helper' })} />}
        {!contextReady && ['framework', 'hub', 'test', 'results'].includes(route.view) && <p role="status" className="page-width p-8">Cargando programa…</p>}
        {contextReady && program && route.view === 'framework' && <FrameworkHubPage program={program} route={route} onNavigate={navigate} />}
        {contextReady && program && route.view === 'hub' && !mvp && <GenericSubjectHubPage key={routeHash(route)} program={program} route={route} onNavigate={navigate} />}
        {contextReady && mvp && route.view === 'hub' && <SubjectHubPage contextControls={<ContextControls program={program!} route={route} onChange={navigate} />} currentUser={currentUser} route={route} onNavigate={navigate}
          onStartSimulation={() => begin({ mode: 'simulation', itemCount: 60, enableTimer: true, timerDurationMinutes: 150 })} onStartPractice={config => begin(config)}
          onStartPracticeByItems={(itemIds, title) => begin({ mode: 'area', itemIds, title, itemCount: itemIds.length, enableTimer: false, timerDurationMinutes: 30 })}
          onNavigateHome={() => navigate({ ...route, view: 'framework', subjectId: undefined })} />}
        {contextReady && route.view === 'test' && (test ? <TestShell key={test.sessionId} config={test.config} initialSession={test} onLeave={hub} onFinishTest={session => { setCompleted(session); setActive(null); navigate({ ...route, view: 'results', sessionId: session.sessionId }); }} /> : <section className="page-width p-8"><h1>No hay un intento activo para esta dirección</h1><p>Vuelve a tu materia para iniciar o reanudar una práctica.</p><button className="primary-button" onClick={hub}>Volver a la materia</button></section>)}
        {contextReady && route.view === 'results' && (result ? <ResultsPage key={result.sessionId} session={result} onRetry={() => begin({ ...result.config, itemIds: result.itemIds }, false, result)} onNewTest={hub} onGoHome={hub} onPracticeMissed={config => begin(config, false, result)} onPracticeWeakestArea={area => begin({ mode: 'area', area, itemCount: 10, enableTimer: false, timerDurationMinutes: 30 }, false)} /> : <section className="page-width p-8"><h1>Resultado no disponible en este perfil</h1><p>Los resultados se guardan solo en este navegador.</p><button className="primary-button" onClick={hub}>Volver a la materia</button></section>)}
      </Suspense>}
    </main>
    {pending && <Dialog title="Ya tienes un intento guardado" onClose={() => setPending(null)}><p>Puedes reanudarlo o descartarlo para comenzar la nueva selección. No se mezclarán sus respuestas.</p><div className="action-row"><button className="primary-button" onClick={resume}>Reanudar intento</button><button className="secondary-button" onClick={() => begin(pending, true, pendingSource)}>Descartar anterior e iniciar otro</button></div></Dialog>}
    {discard && <Dialog title="¿Descartar el intento guardado?" onClose={() => setDiscard(false)}><p>Se eliminarán sus respuestas sin registrar un resultado.</p><button className="primary-button" onClick={() => { storageService.clearActiveSession(); setActive(null); setDiscard(false); }}>Sí, descartar</button></Dialog>}
  </div></WizardProvider>;
}
export default App;
