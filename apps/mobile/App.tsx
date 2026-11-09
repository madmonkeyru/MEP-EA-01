import { useEffect, useState, useMemo } from 'react';
import {
  ActivityIndicator,
  Button,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Storage from 'expo-sqlite/kv-store';
import { createMultiSubjectCatalog } from '@mep-ea/content';
import { createOfflineJourney, createTokenAuthProvider, type PlatformApi, type AuthSession, type LearningContinuity } from '@mep-ea/api';
import type { JourneyState } from '@mep-ea/learning-runtime';
import type { Attempt } from '@mep-ea/domain';
import { tokens } from '@mep-ea/design-system';
import { LearningBrowser } from './LearningBrowser';
import { SimulationSurface } from './SimulationSurface';
import { ContinuitySurface } from './ContinuitySurface';
import { createMobilePlatformApi } from './localPlatformApi';
import { ClientTelemetryService } from './clientTelemetry';

export type MobileTab = 'aprender' | 'practicar' | 'progreso';

const catalog = createMultiSubjectCatalog();
const { journey } = createOfflineJourney(catalog, Storage, 'p2-local');
const tiers = { strong: 'Fortaleza', developing: 'En progreso', needs_practice: 'Necesita práctica' };

export default function App() {
  const [activeTab, setActiveTab] = useState<MobileTab>('aprender');
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
      if (typeof Storage.getItemSync === 'function') {
        const stored = Storage.getItemSync('mep_mobile_session');
        if (stored) return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return { kind: 'anonymous', learnerId: 'p2-local', tier: 'free' };
  });

  const [authProvider] = useState(() => createTokenAuthProvider(session));

  const api: PlatformApi = useMemo(() => {
    return createMobilePlatformApi(authProvider, catalog);
  }, [authProvider]);

  const telemetry = useMemo(() => {
    return new ClientTelemetryService({
      platform: 'ios',
      api,
      learnerId: session.kind === 'authenticated' ? session.learnerId : undefined,
    });
  }, [api, session]);

  useEffect(() => {
    telemetry.track('session_started', { source: 'mobile_foundation_init' });
  }, [telemetry]);

  // Continuity data
  const [continuity, setContinuity] = useState<LearningContinuity | null>(null);
  const [longitudinalMetrics, setLongitudinalMetrics] = useState<import('@mep-ea/api').LongitudinalMetricsResponse['metrics'] | null>(null);
  const [lastSubmittedAttempt, setLastSubmittedAttempt] = useState<Attempt | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [paywallModalOpen, setPaywallModalOpen] = useState(false);

  const refreshContinuity = async () => {
    try {
      const data = await api.getLearningContinuity();
      setContinuity(data);
      try {
        const metrics = await api.getLongitudinalMetrics();
        setLongitudinalMetrics(metrics);
      } catch {
        // non-blocking
      }
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
      if (typeof Storage.setItemSync === 'function') {
        Storage.setItemSync('mep_mobile_session', JSON.stringify(newSession));
      }
    } catch {
      // storage unavailable
    }
  };

  const handleLogin = async () => {
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
      if (node && node.practiceBlueprintId) {
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
    <ScrollView contentContainerStyle={styles.page}>
      {/* App Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.branding}>
            <View style={styles.badgeIcon}>
              <Text style={styles.badgeIconText}>EA</Text>
            </View>
            <View>
              <Text style={styles.appTitle}>Educación Abierta</Text>
              <Text style={styles.appSubtitle}>Preparación Oficial BXM</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => setPaywallModalOpen(true)}
              style={[styles.tierBadge, session.tier === 'premium' ? styles.tierBadgePro : styles.tierBadgeFree]}
            >
              <Text style={[styles.tierBadgeText, session.tier === 'premium' ? styles.tierTextPro : styles.tierTextFree]}>
                {session.tier === 'premium' ? 'Plan Pro' : 'Gratuito'}
              </Text>
            </TouchableOpacity>
            {session.kind === 'authenticated' ? (
              <TouchableOpacity onPress={handleSignOut} style={styles.authBtn}>
                <Text style={styles.authBtnText}>Salir</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => setAuthModalOpen(true)} style={styles.authBtnPrimary}>
                <Text style={styles.authBtnPrimaryText}>Ingresar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabsRow} accessibilityRole="tablist">
          <TouchableOpacity
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'aprender' }}
            onPress={() => setActiveTab('aprender')}
            style={[styles.tabButton, activeTab === 'aprender' && styles.tabButtonActive]}
          >
            <Text style={[styles.tabText, activeTab === 'aprender' && styles.tabTextActive]}>
              Aprender
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'practicar' }}
            onPress={() => setActiveTab('practicar')}
            style={[styles.tabButton, activeTab === 'practicar' && styles.tabButtonActive]}
          >
            <Text style={[styles.tabText, activeTab === 'practicar' && styles.tabTextActive]}>
              Practicar & Simular
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'progreso' }}
            onPress={() => {
              setActiveTab('progreso');
              void refreshContinuity();
            }}
            style={[styles.tabButton, activeTab === 'progreso' && styles.tabButtonActive]}
          >
            <Text style={[styles.tabText, activeTab === 'progreso' && styles.tabTextActive]}>
              Mi Progreso
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {error ? (
        <View accessibilityRole="alert" style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
          <Button title="Reintentar carga" disabled={busy} onPress={() => void run(() => journey.resume())} />
        </View>
      ) : null}

      {busy || (!ready && !error) ? <ActivityIndicator size="small" color={tokens.color.primary} /> : null}

      {/* Tab 1: Aprender */}
      {activeTab === 'aprender' && ready && (
        <View style={styles.tabContent}>
          {result && attempt && state ? (
            <View style={styles.card}>
              <Text accessibilityRole="header" style={styles.cardHeaderTitle}>
                Resultado: {attempt.score?.correct} / {attempt.score?.total}
              </Text>
              <Text style={styles.metaText}>Sin responder: {attempt.score?.unanswered}</Text>
              <Text accessibilityRole="header" style={styles.sectionTitle}>Diagnóstico inicial</Text>
              <Text style={styles.metaText}>
                Estimación provisional de esta prueba breve; no acredita dominio sostenido.
              </Text>
              {result.diagnostic.domains.map(d => (
                <Text key={d.domainId} style={styles.bodyText}>
                  {catalog.registry.taxonomy.domains.find(t => t.id === d.domainId)?.name}: {tiers[d.tier]} ({d.correct}/{d.total})
                </Text>
              ))}
              <Text accessibilityRole="header" style={styles.sectionTitle}>Plan de refuerzo</Text>
              {result.diagnostic.weakEvidenceIds.map(key => (
                <Button
                  key={key}
                  title={`Estudiar evidencia ${key.split('/').at(-1)}`}
                  disabled={busy}
                  onPress={() => {
                    setEvidenceKey(key);
                    setState(null);
                    setProgram('bxm');
                    setSubject('matematica');
                  }}
                />
              ))}
              {result.plan.activities.map(a => (
                <View key={a.conceptId} style={styles.innerCard}>
                  <Text accessibilityRole="header" style={styles.boldText}>
                    {catalog.registry.taxonomy.concepts.find(c => c.id === a.conceptId)?.name}
                  </Text>
                  <Text style={styles.metaText}>Revisa el ejemplo y resuélvelo de nuevo.</Text>
                  <Text style={styles.bodyText}>{a.title}</Text>
                  {a.steps.map((s, i) => (
                    <Text key={i} style={styles.metaText}>
                      {i + 1}. {s}
                    </Text>
                  ))}
                </View>
              ))}
              <Text style={styles.nextStepText}>
                {result.plan.nextStep === 'practice'
                  ? 'Siguiente paso: repasa los ejemplos y vuelve a evaluar lo aprendido.'
                  : 'Siguiente paso: repite la evaluación para comprobar tu aprendizaje.'}
              </Text>
              <View style={styles.btnRow}>
                <Button
                  title="Volver al catálogo"
                  disabled={busy}
                  onPress={() => {
                    setState(null);
                    setProgram('bxm');
                    setSubject('matematica');
                  }}
                />
                <Button
                  title="Iniciar nueva evaluación"
                  disabled={busy}
                  onPress={() => void run(() => journey.start(state.assessment.blueprint.id))}
                />
              </View>
            </View>
          ) : state && attempt && question ? (
            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.questionCounter}>
                  Pregunta {attempt.currentIndex + 1} de {state.assessment.questions.length}
                </Text>
                <Text style={styles.metaText}>
                  Límite: {new Date(attempt.deadlineAt).toLocaleTimeString()}
                </Text>
              </View>
              <Text style={styles.stem}>{question.stem}</Text>
              {question.options.map(o => (
                <Button
                  key={o.id}
                  title={`${attempt.answers[question.id]?.optionId === o.id ? '✓ ' : ''}${o.id}. ${o.text}`}
                  disabled={busy}
                  onPress={() => void run(() => journey.answer(question.id, o.id))}
                />
              ))}
              <View style={styles.navButtonsRow}>
                <Button
                  title="Anterior"
                  disabled={busy || !attempt.currentIndex}
                  onPress={() => void run(() => journey.goTo(attempt.currentIndex - 1))}
                />
                <Button
                  title="Siguiente"
                  disabled={busy || attempt.currentIndex === state.assessment.questions.length - 1}
                  onPress={() => void run(() => journey.goTo(attempt.currentIndex + 1))}
                />
              </View>
              <Button
                title="Entregar prueba"
                color={tokens.color.mastered}
                disabled={busy}
                onPress={() => void run(() => journey.submit())}
              />
              <Text style={styles.hintText}>
                Puedes entregar con preguntas sin responder; contarán como incorrectas.
              </Text>
            </View>
          ) : (
            <View style={styles.card}>
              <Text accessibilityRole="header" style={styles.cardHeaderTitle}>Elige tu programa</Text>
              {catalog.registry.taxonomy.programs.map(p => (
                <Button
                  key={p.id}
                  title={`${program === p.id ? '✓ ' : ''}${p.name}`}
                  onPress={() => {
                    setProgram(p.id);
                    setSubject('');
                  }}
                />
              ))}
              <Text style={styles.fieldLabel}>Asignatura</Text>
              {catalog.registry.taxonomy.subjects
                .filter(s => s.programId === program)
                .map(s => (
                  <Button
                    key={s.id}
                    title={`${subject === s.id ? '✓ ' : ''}${s.name}`}
                    onPress={() => setSubject(s.id)}
                  />
                ))}
              {catalog.blueprints
                .filter(b => b.mode === 'diagnostic' && b.programId === program && b.subjectId === subject)
                .map(b => (
                  <View key={b.id} style={styles.diagnosticBanner}>
                    <Text style={styles.diagnosticBannerText}>
                      Diagnóstico breve · {b.totalItems} preguntas · {b.timeLimitSeconds / 60} minutos
                    </Text>
                    <Button
                      title="Comenzar diagnóstico"
                      disabled={busy}
                      onPress={() => void run(() => journey.start(b.id))}
                    />
                  </View>
                ))}

              {Boolean(program && subject) && (
                <LearningBrowser
                  initialKey={evidenceKey}
                  catalog={catalog}
                  busy={busy}
                  selectedSubject={subject}
                  start={id => void run(() => journey.start(id))}
                />
              )}
            </View>
          )}
        </View>
      )}

      {/* Tab 2: Practicar & Simular */}
      {activeTab === 'practicar' && (
        <View style={styles.tabContent}>
          <View style={styles.card}>
            <Text style={styles.fieldLabel}>Materia activa:</Text>
            <View style={styles.btnRow}>
              {catalog.registry.taxonomy.subjects.map(s => (
                <Button
                  key={s.id}
                  title={`${(subject || 'matematica') === s.id ? '✓ ' : ''}${s.name}`}
                  onPress={() => {
                    setProgram(s.programId);
                    setSubject(s.id);
                  }}
                />
              ))}
            </View>
          </View>
          <SimulationSurface
            api={api}
            programId={program || 'bxm'}
            subjectId={subject || 'matematica'}
            onAttemptSubmitted={handleSimulationSubmitted}
            onBackToHub={() => {
              void refreshContinuity();
              setActiveTab('progreso');
            }}
            onNavigateToRemediation={() => {
              void refreshContinuity();
              setActiveTab('progreso');
            }}
          />
        </View>
      )}

      {/* Tab 3: Mi Progreso */}
      {activeTab === 'progreso' && (
        <View style={styles.tabContent}>
          {lastSubmittedAttempt && (
            <View style={styles.successBanner}>
              <Text style={styles.successBannerText}>
                Última prueba entregada: {lastSubmittedAttempt.score?.correct ?? 0} de{' '}
                {lastSubmittedAttempt.score?.total ?? 0} correctas.
              </Text>
              <Button
                title="Nueva prueba"
                color={tokens.color.mastered}
                onPress={() => setActiveTab('practicar')}
              />
            </View>
          )}

          {continuity ? (
            <ContinuitySurface
              continuity={continuity}
              catalog={catalog}
              metrics={longitudinalMetrics}
              onAction={handleContinuityAction}
            />
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.metaText}>Cargando estado de dominio curricular...</Text>
            </View>
          )}
        </View>
      )}

      {/* Auth Modal */}
      <Modal visible={authModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ingreso / Registro</Text>
              <TouchableOpacity onPress={() => setAuthModalOpen(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            {authError ? <Text style={styles.authError}>{authError}</Text> : null}
            <Text style={styles.inputLabel}>Usuario</Text>
            <TextInput
              value={usernameInput}
              onChangeText={setUsernameInput}
              placeholder="ej. estudiante1"
              style={styles.textInput}
              autoCapitalize="none"
            />
            <Text style={styles.inputLabel}>Contraseña</Text>
            <TextInput
              value={passwordInput}
              onChangeText={setPasswordInput}
              placeholder="••••••••"
              secureTextEntry
              style={styles.textInput}
            />
            <View style={styles.btnRow}>
              <Button title="Entrar" onPress={handleLogin} color={tokens.color.primary} />
              <Button title="Registrarse" onPress={handleRegister} color={tokens.color.text} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Paywall / Pro Info Modal */}
      <Modal visible={paywallModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Plan Educación Abierta Pro</Text>
              <TouchableOpacity onPress={() => setPaywallModalOpen(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.paywallSubtitle}>
              Acceso a simulaciones oficiales cronometradas de 60 ítems (Convocatoria 02-2026) y analítica longitudinal personalizada.
            </Text>
            <View style={styles.proFeatureItem}>
              <Text style={styles.boldText}>✓ Simulaciones Oficiales (60 ítems / 150 min)</Text>
              <Text style={styles.metaText}>Entorno idéntico a las condiciones reales de examen DGEC.</Text>
            </View>
            <View style={styles.proFeatureItem}>
              <Text style={styles.boldText}>✓ Plan de Nivelación Avanzado</Text>
              <Text style={styles.metaText}>Priorización pedagógica automática por debilidades.</Text>
            </View>
            <Button title="Entendido" onPress={() => setPaywallModalOpen(false)} color={tokens.color.primary} />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    padding: tokens.spacing.medium,
    paddingTop: 48,
    gap: tokens.spacing.medium,
    backgroundColor: tokens.color.background,
    flexGrow: 1,
  },
  header: {
    gap: tokens.spacing.small,
    backgroundColor: '#ffffff',
    padding: tokens.spacing.medium,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  branding: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.small,
  },
  badgeIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: tokens.color.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeIconText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  appTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: tokens.color.text,
  },
  appSubtitle: {
    fontSize: 11,
    color: '#64748b',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  tierBadgeFree: {
    backgroundColor: '#f1f5f9',
    borderColor: '#cbd5e1',
  },
  tierBadgePro: {
    backgroundColor: '#fef3c7',
    borderColor: '#fde68a',
  },
  tierBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  tierTextFree: {
    color: '#475569',
  },
  tierTextPro: {
    color: '#b45309',
  },
  authBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  authBtnText: {
    fontSize: 12,
    color: '#475569',
  },
  authBtnPrimary: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#eef2ff',
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  authBtnPrimaryText: {
    fontSize: 12,
    fontWeight: '600',
    color: tokens.color.primary,
  },
  tabsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: tokens.spacing.small,
    gap: 6,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabButtonActive: {
    backgroundColor: '#eef2ff',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  tabTextActive: {
    color: tokens.color.primary,
  },
  tabContent: {
    gap: tokens.spacing.medium,
  },
  card: {
    padding: tokens.spacing.medium,
    gap: tokens.spacing.small,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: tokens.color.text,
  },
  innerCard: {
    padding: tokens.spacing.small,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 4,
  },
  emptyCard: {
    padding: tokens.spacing.large,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  stem: {
    fontSize: 16,
    lineHeight: 22,
    color: tokens.color.text,
    marginVertical: 4,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: tokens.color.text,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.color.text,
    marginTop: 8,
  },
  bodyText: {
    fontSize: 13,
    color: tokens.color.text,
  },
  metaText: {
    fontSize: 12,
    color: '#64748b',
  },
  boldText: {
    fontWeight: '600',
    color: tokens.color.text,
  },
  nextStepText: {
    fontSize: 12,
    fontWeight: '600',
    color: tokens.color.primary,
    marginTop: 4,
  },
  hintText: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
  },
  questionCounter: {
    fontSize: 14,
    fontWeight: '700',
    color: tokens.color.text,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  navButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  diagnosticBanner: {
    padding: tokens.spacing.small,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  diagnosticBannerText: {
    fontSize: 12,
    color: '#1e40af',
  },
  errorBanner: {
    padding: tokens.spacing.small,
    backgroundColor: '#fff1f2',
    borderColor: '#fecdd3',
    borderWidth: 1,
    borderRadius: 8,
    gap: 6,
  },
  errorBannerText: {
    fontSize: 12,
    color: tokens.color.needsPractice,
  },
  successBanner: {
    padding: tokens.spacing.small,
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  successBannerText: {
    fontSize: 12,
    color: tokens.color.mastered,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    padding: tokens.spacing.medium,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: tokens.spacing.large,
    gap: tokens.spacing.small,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: tokens.color.text,
  },
  closeBtn: {
    fontSize: 16,
    color: '#94a3b8',
    padding: 4,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: tokens.color.text,
    marginTop: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 8,
    fontSize: 13,
  },
  authError: {
    fontSize: 12,
    color: tokens.color.needsPractice,
  },
  paywallSubtitle: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  proFeatureItem: {
    padding: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    gap: 2,
  },
});
