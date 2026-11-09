import { useEffect, useState, useMemo } from 'react';
import { BookOpen, PenTool, BarChart2, Shield, User as UserIcon, LogOut } from 'lucide-react';
import { createLearningPreviewCatalog } from '@mep-ea/content/expansion';
import { createOfflineJourney, createTokenAuthProvider, type PlatformApi, type AuthSession } from '@mep-ea/api';
import type { JourneyState } from '@mep-ea/learning-runtime';
import type { LearningContinuity } from '@mep-ea/api';
import type { Attempt } from '@mep-ea/domain';
import { LearningBrowser } from './LearningBrowser';
import { SimulationSurface } from './SimulationSurface';
import { ContinuitySurface } from './ContinuitySurface';
import { createLocalPlatformApi } from './localPlatformApi';
import { TextRenderer as MathText } from '../components/common/TextRenderer';
import { PaywallModal } from '../components/common/PaywallModal';

export type FoundationTab = 'aprender' | 'practicar' | 'progreso';

const catalog = createLearningPreviewCatalog();
const { journey } = createOfflineJourney(catalog, {
  getItem: key => localStorage.getItem(key),
  setItem: (key, value) => localStorage.setItem(key, value),
  removeItem: key => localStorage.removeItem(key),
}, 'p2-local');

const tiers = { strong: 'Fortaleza', developing: 'En progreso', needs_practice: 'Necesita práctica' };

export function FoundationApp() {
  const [activeTab, setActiveTab] = useState<FoundationTab>('aprender');
  const [state, setState] = useState<JourneyState | null>(null);
  const [evidenceKey, setEvidenceKey] = useState('');
  const [program, setProgram] = useState('');
  const [subject, setSubject] = useState('');
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Auth & Session
  const [session, setSession] = useState<AuthSession>(() => {
    try {
      const stored = localStorage.getItem('mep_foundation_session');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return { kind: 'anonymous', learnerId: 'p2-local', tier: 'free' };
  });

  const [authProvider] = useState(() => {
    return createTokenAuthProvider(session);
  });

  const api: PlatformApi = useMemo(() => {
    return createLocalPlatformApi(authProvider, catalog);
  }, [authProvider]);

  // Continuity data
  const [continuity, setContinuity] = useState<LearningContinuity | null>(null);
  const [lastSubmittedAttempt, setLastSubmittedAttempt] = useState<Attempt | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  const refreshContinuity = async () => {
    try {
      const data = await api.getLearningContinuity();
      setContinuity(data);
    } catch {
      // non-blocking
    }
  };

  useEffect(() => {
    void refreshContinuity();
  }, [api, session]);

  const run = async (action: () => Promise<JourneyState | null>) => {
    setBusy(true);
    setError('');
    try {
      const next = await action();
      setState(next);
      setReady(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar.');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    void run(() => journey.resume());
  }, []);

  useEffect(() => {
    if (!state || state.attempt.status !== 'in_progress') return;
    const timer = setInterval(() => {
      if (Date.now() >= Date.parse(state.attempt.deadlineAt)) void run(() => journey.expire(state));
    }, 1000);
    return () => clearInterval(timer);
  }, [state]);

  const attempt = state?.attempt;
  const question = state?.assessment.questions[attempt?.currentIndex ?? 0];
  const result = state && attempt?.status === 'submitted' ? journey.result(state) : null;

  const handleUpdateSession = (newSession: AuthSession) => {
    setSession(newSession);
    authProvider.setSession(newSession);
    try {
      localStorage.setItem('mep_foundation_session', JSON.stringify(newSession));
    } catch {
      // storage unavailable
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await api.login({ username: usernameInput, password: passwordInput });
      const nextSession: AuthSession = {
        kind: 'authenticated',
        learnerId: res.session.learnerId,
        tier: res.session.tier,
        roles: res.session.roles,
        accessToken: res.token,
        expiresAt: res.expiresAt,
      };
      handleUpdateSession(nextSession);
      setAuthModalOpen(false);
      setUsernameInput('');
      setPasswordInput('');
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    }
  };

  const handleRegister = async () => {
    setAuthError('');
    if (!usernameInput || !passwordInput) {
      setAuthError('Ingrese usuario y contraseña');
      return;
    }
    try {
      const res = await api.register({ username: usernameInput, password: passwordInput, tier: 'free' });
      const nextSession: AuthSession = {
        kind: 'authenticated',
        learnerId: res.session.learnerId,
        tier: res.session.tier,
        roles: res.session.roles,
        accessToken: res.token,
        expiresAt: res.expiresAt,
      };
      handleUpdateSession(nextSession);
      setAuthModalOpen(false);
      setUsernameInput('');
      setPasswordInput('');
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Error al registrar usuario');
    }
  };

  const handleSignOut = async () => {
    await authProvider.signOut();
    const guest: AuthSession = { kind: 'anonymous', learnerId: 'p2-local', tier: 'free' };
    handleUpdateSession(guest);
  };

  const handleSimulationSubmitted = async (submitted: Attempt) => {
    setLastSubmittedAttempt(submitted);
    await refreshContinuity();
    setActiveTab('progreso');
  };

  const handleContinuityAction = (evidenceId: string, action: string) => {
    if (action === 'learn') {
      setEvidenceKey(evidenceId);
      setActiveTab('aprender');
    } else if (action === 'practice') {
      const node = catalog.nodes.find(n => n.key === evidenceId);
      if (node?.practiceBlueprintId) {
        setActiveTab('aprender');
        setEvidenceKey(evidenceId);
        void run(() => journey.start(node.practiceBlueprintId!));
      } else {
        setActiveTab('aprender');
        setEvidenceKey(evidenceId);
      }
    } else if (action === 'diagnose' || action === 'retest') {
      setActiveTab('practicar');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Application Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs overflow-x-hidden">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-700 text-white font-bold flex items-center justify-center text-xs sm:text-sm shadow-xs shrink-0">
              EA
            </span>
            <div className="min-w-0">
              <span className="text-sm sm:text-base font-bold text-slate-900 block leading-tight truncate">
                Educación Abierta
              </span>
              <span className="text-[11px] text-slate-500 font-medium hidden sm:block truncate">
                Plataforma Oficial de Preparación · BXM Matemática
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setPaywallOpen(true)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
                session.tier === 'premium'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200'
                  : 'bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{session.tier === 'premium' ? 'Plan Pro' : 'Plan Gratuito'}</span>
            </button>

            {session.kind === 'authenticated' ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 hidden md:inline">
                  {session.learnerId}
                </span>
                <button
                  type="button"
                  onClick={handleSignOut}
                  title="Cerrar sesión"
                  aria-label="Cerrar sesión"
                  className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition flex items-center gap-1.5"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Ingresar</span>
              </button>
            )}

          </div>
        </div>

        {/* Primary Navigation Tabs */}
        <nav
          aria-label="Navegación principal"
          className="max-w-5xl mx-auto px-2 sm:px-6 flex border-t border-slate-100 bg-white overflow-x-auto"
        >
          <button
            type="button"
            onClick={() => setActiveTab('aprender')}
            className={`py-2.5 sm:py-3 px-2.5 sm:px-4 text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2 border-b-2 whitespace-nowrap transition ${
              activeTab === 'aprender'
                ? 'border-indigo-700 text-indigo-700'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Aprender</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('practicar')}
            className={`py-2.5 sm:py-3 px-2.5 sm:px-4 text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2 border-b-2 whitespace-nowrap transition ${
              activeTab === 'practicar'
                ? 'border-indigo-700 text-indigo-700'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <PenTool className="w-4 h-4" />
            <span>Practicar & Simular</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('progreso');
              void refreshContinuity();
            }}
            className={`py-2.5 sm:py-3 px-2.5 sm:px-4 text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2 border-b-2 whitespace-nowrap transition ${
              activeTab === 'progreso'
                ? 'border-indigo-700 text-indigo-700'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Mi Progreso</span>
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto w-full p-4 sm:p-6 flex-1 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {activeTab === 'aprender'
              ? 'Aprender · Temario Digital BXM'
              : activeTab === 'practicar'
              ? 'Practicar & Simular · Evaluaciones'
              : 'Mi Progreso · Plan de Nivelación'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            71 evidencias y 30 preguntas propias de BXM. Simulación oficial aislada bajo convocatoria 02-2026.
          </p>
        </div>

        {error && (
          <div role="alert" className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-sm flex justify-between items-center">
            <span>{error}</span>
            <button
              disabled={busy}
              onClick={() => void run(() => journey.resume())}
              className="px-3 py-1 bg-white border border-rose-300 rounded font-medium text-xs hover:bg-rose-100"
            >
              Reintentar carga
            </button>
          </div>
        )}

        {!ready && !error && <p role="status" className="text-slate-500 text-sm">Cargando…</p>}

        {/* Tab 1: APRENDER */}
        {activeTab === 'aprender' && ready && (
          <div className="space-y-6">
            {result && attempt && state ? (
              <section aria-label="Resultado" className="bg-white p-6 border rounded-xl shadow-xs space-y-4">
                <div className="border-b pb-3">
                  <h2 className="text-xl font-bold text-slate-900">
                    Resultado: {attempt.score?.correct} / {attempt.score?.total}
                  </h2>
                  <p className="text-xs text-slate-500">Sin responder: {attempt.score?.unanswered}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm">Diagnóstico inicial</h3>
                  <p className="text-xs text-slate-500">Estimación provisional de esta prueba breve; no acredita dominio sostenido.</p>
                  <ul className="mt-2 space-y-1">
                    {result.diagnostic.domains.map(d => (
                      <li key={d.domainId} className="text-xs text-slate-700">
                        {catalog.registry.taxonomy.domains.find(t => t.id === d.domainId)?.name}:{' '}
                        <span className="font-semibold">{tiers[d.tier]}</span> ({d.correct}/{d.total})
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm">Plan de refuerzo</h3>
                  <div className="mt-2 space-y-2">
                    {result.diagnostic.weakEvidenceIds.map(key => (
                      <button
                        key={key}
                        disabled={busy}
                        onClick={() => {
                          setEvidenceKey(key);
                          setState(null);
                          setProgram('bxm');
                          setSubject('matematica');
                        }}
                        className="text-xs px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-100 block transition"
                      >
                        Estudiar evidencia {key.split('/').at(-2)} {key.split('/').at(-1)}
                      </button>
                    ))}
                    {result.plan.activities.map(a => (
                      <article key={a.conceptId} className="p-3 border rounded-lg bg-slate-50 space-y-2">
                        <h4 className="text-xs font-bold text-slate-800">
                          {catalog.registry.taxonomy.concepts.find(c => c.id === a.conceptId)?.name}
                        </h4>
                        <p className="text-xs text-slate-600">Revisa el ejemplo y resuélvelo de nuevo antes de consultar los pasos.</p>
                        <MathText content={a.title} />
                        <details className="text-xs text-slate-600">
                          <summary className="cursor-pointer font-medium text-indigo-700">Ver solución paso a paso</summary>
                          <ol className="mt-2 list-decimal list-inside space-y-1">
                            {a.steps.map((s, i) => (
                              <li key={i}><MathText content={s} /></li>
                            ))}
                          </ol>
                        </details>
                      </article>
                    ))}
                  </div>
                </div>
                <div className="pt-2 flex gap-3">
                  <button
                    disabled={busy}
                    onClick={() => void run(() => journey.start(state.assessment.blueprint.id))}
                    className="px-4 py-2 text-xs font-semibold bg-indigo-700 text-white rounded-lg hover:bg-indigo-800"
                  >
                    Iniciar nueva evaluación
                  </button>
                  <button
                    disabled={busy}
                    onClick={() => {
                      setState(null);
                      setProgram('bxm');
                      setSubject('matematica');
                    }}
                    className="px-4 py-2 text-xs font-semibold border rounded-lg hover:bg-slate-100"
                  >
                    Volver al catálogo
                  </button>
                </div>
              </section>
            ) : state && attempt && question ? (
              <section className="bg-white p-6 border rounded-xl shadow-xs space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <h2 className="text-lg font-bold text-slate-900">
                    {state.assessment.blueprint.mode === 'practice' ? 'Práctica por evidencia' : 'Diagnóstico de Matemática'}
                  </h2>
                  <span className="text-xs text-slate-500">
                    Pregunta {attempt.currentIndex + 1} de {state.assessment.questions.length}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Guardado en este dispositivo · Límite: {new Date(attempt.deadlineAt).toLocaleTimeString()}
                </p>
                <fieldset disabled={busy} className="space-y-3">
                  <legend className="text-base text-slate-900 font-medium mb-2">
                    <MathText content={question.stem} />
                  </legend>
                  {question.options.map(o => (
                    <label key={o.id} className="block p-3.5 border rounded-lg hover:bg-slate-50 cursor-pointer transition">
                      <input
                        type="radio"
                        name={question.id}
                        checked={attempt.answers[question.id]?.optionId === o.id}
                        onChange={() => void run(() => journey.answer(question.id, o.id))}
                        className="mr-2"
                      />
                      <span className="font-semibold text-slate-700">{o.id}. </span>
                      <MathText content={o.text} />
                    </label>
                  ))}
                </fieldset>
                <div className="flex gap-3 flex-wrap pt-2">
                  <button
                    disabled={busy || !attempt.currentIndex}
                    onClick={() => void run(() => journey.goTo(attempt.currentIndex - 1))}
                    className="px-4 py-2 text-xs font-semibold border rounded-lg disabled:opacity-40"
                  >
                    Anterior
                  </button>
                  <button
                    disabled={busy || attempt.currentIndex === state.assessment.questions.length - 1}
                    onClick={() => void run(() => journey.goTo(attempt.currentIndex + 1))}
                    className="px-4 py-2 text-xs font-semibold border rounded-lg disabled:opacity-40"
                  >
                    Siguiente
                  </button>
                  <button
                    disabled={busy}
                    onClick={() => void run(() => journey.submit())}
                    className="px-4 py-2 text-xs font-bold bg-indigo-700 text-white rounded-lg hover:bg-indigo-800 transition"
                  >
                    Entregar prueba
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  Puedes entregar con preguntas sin responder; contarán como incorrectas.
                </p>
              </section>
            ) : (
              <div className="bg-white p-6 border rounded-xl shadow-xs space-y-6">
                <section className="space-y-4" aria-label="Programa y asignatura">
                  <h2 className="text-lg font-bold text-slate-900">Elige tu programa</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="block text-xs font-semibold text-slate-700">
                      Programa
                      <select
                        value={program}
                        onChange={e => { setProgram(e.target.value); setSubject(''); }}
                        className="mt-1 block w-full p-2 border border-slate-300 rounded-lg text-sm bg-white"
                      >
                        <option value="">Seleccionar programa</option>
                        {catalog.registry.taxonomy.programs.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </label>
                    <label className="block text-xs font-semibold text-slate-700">
                      Asignatura
                      <select
                        disabled={!program}
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                        className="mt-1 block w-full p-2 border border-slate-300 rounded-lg text-sm bg-white disabled:opacity-50"
                      >
                        <option value="">Seleccionar asignatura</option>
                        {catalog.registry.taxonomy.subjects.filter(s => s.programId === program).map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  {catalog.blueprints.filter(b => b.mode === 'diagnostic' && b.programId === program && b.subjectId === subject).map(b => (
                    <div key={b.id} className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="text-xs font-semibold text-indigo-900">Diagnóstico breve</p>
                        <p className="text-xs text-indigo-700">{b.totalItems} preguntas · {b.timeLimitSeconds / 60} minutos</p>
                      </div>
                      <button
                        disabled={busy}
                        onClick={() => void run(() => journey.start(b.id))}
                        className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-semibold transition"
                      >
                        Comenzar diagnóstico
                      </button>
                    </div>
                  ))}
                </section>

                {program === 'bxm' && subject === 'matematica' && (
                  <LearningBrowser
                    initialKey={evidenceKey}
                    catalog={catalog}
                    busy={busy}
                    start={id => void run(() => journey.start(id))}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: PRACTICAR & SIMULAR */}
        {activeTab === 'practicar' && (
          <div className="space-y-6">
            <SimulationSurface
              api={api}
              onAttemptSubmitted={handleSimulationSubmitted}
              onBackToHub={() => {
                void refreshContinuity();
                setActiveTab('progreso');
              }}
            />
          </div>
        )}

        {/* Tab 3: MI PROGRESO */}
        {activeTab === 'progreso' && (
          <div className="space-y-6">
            {lastSubmittedAttempt && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs sm:text-sm flex justify-between items-center">
                <span>
                  <strong>Último intento entregado con éxito:</strong> {lastSubmittedAttempt.score?.correct ?? 0} de {lastSubmittedAttempt.score?.total ?? 0} correctas.
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('practicar')}
                  className="px-3 py-1 bg-emerald-700 text-white font-semibold rounded text-xs hover:bg-emerald-800"
                >
                  Nueva prueba
                </button>
              </div>
            )}

            {continuity ? (
              <ContinuitySurface
                continuity={continuity}
                catalog={catalog}
                onAction={handleContinuityAction}
              />
            ) : (
              <div className="p-8 text-center text-slate-500 bg-white border rounded-xl">
                Cargando estado de dominio curricular...
              </div>
            )}
          </div>
        )}
      </main>

      {/* Auth Modal */}
      {authModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Iniciar Sesión / Registro</h3>
              <button
                type="button"
                onClick={() => setAuthModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            {authError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded">
                {authError}
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">
                Usuario
                <input
                  type="text"
                  value={usernameInput}
                  onChange={e => setUsernameInput(e.target.value)}
                  className="mt-1 block w-full p-2 border rounded text-xs"
                  placeholder="ej. estudiante1"
                  required
                />
              </label>
              <label className="block text-xs font-semibold text-slate-700">
                Contraseña
                <input
                  type="password"
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  className="mt-1 block w-full p-2 border rounded text-xs"
                  placeholder="••••••••"
                  required
                />
              </label>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold text-xs rounded transition"
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={handleRegister}
                  className="flex-1 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded transition"
                >
                  Registrarse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Paywall / Upgrade Modal */}
      <PaywallModal
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        featureTitle="Preparación Completa Educación Abierta Pro"
        featureDescription="Acceso irrestricto a simulaciones oficiales cronometradas de 60 ítems y nivelación personalizada."
      />
    </div>
  );
}
