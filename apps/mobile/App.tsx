import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import Storage from 'expo-sqlite/kv-store';
import { createLearningPreviewCatalog } from '@mep-ea/content/expansion';
import { createOfflineJourney, type LearningContinuity, type DraftState } from '@mep-ea/api';
import { LearningBrowser } from './LearningBrowser';
import { ContinuitySurface } from './ContinuitySurface';
import { ConflictReviewModal, type ConflictResolutionChoice } from './ConflictReviewModal';
import type { JourneyState } from '@mep-ea/learning-runtime';
import { tokens } from '@mep-ea/design-system';

const catalog = createLearningPreviewCatalog();
const { journey, api } = createOfflineJourney(catalog, Storage, 'p2-local');
const tiers = { strong: 'Fortaleza', developing: 'En progreso', needs_practice: 'Necesita práctica' };

export default function App() {
  const [activeTab, setActiveTab] = useState<'learn' | 'continuity'>('learn');
  const [state, setState] = useState<JourneyState | null>(null);
  const [evidenceKey, setEvidenceKey] = useState('');
  const [program, setProgram] = useState('');
  const [subject, setSubject] = useState('');
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Continuity & Conflict states
  const [continuity, setContinuity] = useState<LearningContinuity | null>(null);
  const [continuityLoading, setContinuityLoading] = useState(false);
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
      // offline / unauthenticated continuity fallback
    } finally {
      setContinuityLoading(false);
    }
  };

  const handleResolveConflict = (choice: ConflictResolutionChoice) => {
    setIsConflictModalOpen(false);
    setConflictState(null);
    if (state && choice.reconciledAttempt) {
      void run(async () => {
        await Storage.setItem(`mep-ea:v1:attempt:p2-local:${state.attempt.id}`, JSON.stringify(choice.reconciledAttempt));
        return journey.resume();
      });
    }
  };

  const attempt = state?.attempt;
  const question = state?.assessment.questions[attempt?.currentIndex ?? 0];
  const result = state && attempt?.status === 'submitted' ? journey.result(state) : null;

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.tabBar}>
        <Button
          title={activeTab === 'learn' ? '• Ruta de Estudio' : 'Ruta de Estudio'}
          onPress={() => setActiveTab('learn')}
          color={activeTab === 'learn' ? '#0f172a' : '#64748b'}
        />
        <Button
          title={activeTab === 'continuity' ? '• Mi Progreso' : 'Mi Progreso'}
          onPress={() => {
            setActiveTab('continuity');
            void loadContinuity();
          }}
          color={activeTab === 'continuity' ? '#0f172a' : '#64748b'}
        />
      </View>

      <Text style={styles.heading} accessibilityRole="header">Mi ruta de aprendizaje</Text>
      <Text>Vista previa de desarrollo · 71 evidencias y 30 preguntas propias de BXM. Contenido pendiente de revisión editorial.</Text>
      {error ? <View accessibilityRole="alert"><Text>{error}</Text><Button title="Reintentar carga" disabled={busy} onPress={() => void run(() => journey.resume())} /></View> : null}
      {busy || (!ready && !error) ? <ActivityIndicator /> : null}

      {/* Continuity Tab */}
      {activeTab === 'continuity' && (
        <View style={styles.card}>
          {continuityLoading ? (
            <Text>Cargando datos de nivelación del servidor…</Text>
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
            <View style={styles.localNotice}>
              <Text style={styles.bold}>Modo Local Sin Conexión</Text>
              <Text>Tu progreso se conserva en este dispositivo. Conéctate para sincronizar tu Plan de Nivelación.</Text>
              <Button title="Continuar estudiando localmente" onPress={() => setActiveTab('learn')} color="#0f172a" />
            </View>
          )}
        </View>
      )}

      {/* Learn Tab */}
      {activeTab === 'learn' && (
        <>
          {ready && !state ? (
            <View style={styles.card}>
              <Text accessibilityRole="header">Elige tu programa</Text>
              {catalog.registry.taxonomy.programs.map(p => <Button key={p.id} title={`${program === p.id ? '✓ ' : ''}${p.name}`} onPress={() => { setProgram(p.id); setSubject(''); }} />)}
              <Text>Asignatura</Text>
              {catalog.registry.taxonomy.subjects.filter(s => s.programId === program).map(s => <Button key={s.id} title={`${subject === s.id ? '✓ ' : ''}${s.name}`} onPress={() => setSubject(s.id)} />)}
              {catalog.blueprints.filter(b => b.mode === 'diagnostic' && b.programId === program && b.subjectId === subject).map(b => (
                <View key={b.id}>
                  <Text>Diagnóstico breve · {b.totalItems} preguntas · {b.timeLimitSeconds / 60} minutos</Text>
                  <Button title="Comenzar diagnóstico" disabled={busy} onPress={() => void run(() => journey.start(b.id))} />
                </View>
              ))}
            </View>
          ) : null}

          {ready && !state && program === 'bxm' && subject === 'matematica' && (
            <LearningBrowser initialKey={evidenceKey} catalog={catalog} busy={busy} start={id => void run(() => journey.start(id))} />
          )}

          {result && attempt && state ? (
            <View style={styles.card}>
              <Text accessibilityRole="header">Resultado: {attempt.score?.correct} / {attempt.score?.total}</Text>
              <Text>Sin responder: {attempt.score?.unanswered}</Text>
              <Text accessibilityRole="header">Diagnóstico inicial</Text>
              <Text>Estimación provisional de esta prueba breve; no acredita dominio sostenido.</Text>
              {result.diagnostic.domains.map(d => (
                <Text key={d.domainId}>{catalog.registry.taxonomy.domains.find(t => t.id === d.domainId)?.name}: {tiers[d.tier]} ({d.correct}/{d.total})</Text>
              ))}
              <Text accessibilityRole="header">Plan de refuerzo</Text>
              {result.diagnostic.weakEvidenceIds.map(key => (
                <Button key={key} title={`Estudiar evidencia ${key.split('/').at(-1)}`} disabled={busy} onPress={() => { setEvidenceKey(key); setState(null); setProgram('bxm'); setSubject('matematica'); }} />
              ))}
              {result.plan.activities.map(a => (
                <View key={a.conceptId} style={styles.card}>
                  <Text accessibilityRole="header">{catalog.registry.taxonomy.concepts.find(c => c.id === a.conceptId)?.name}</Text>
                  <Text>Revisa el ejemplo y resuélvelo de nuevo.</Text>
                  <Text>{a.title}</Text>
                  {a.steps.map((s, i) => <Text key={i}>{i + 1}. {s}</Text>)}
                </View>
              ))}
              <Text>{result.plan.nextStep === 'practice' ? 'Siguiente paso: repasa los ejemplos y vuelve a evaluar lo aprendido.' : 'Siguiente paso: repite la evaluación para comprobar tu aprendizaje.'}</Text>
              <Button title="Volver al catálogo" disabled={busy} onPress={() => { setState(null); setProgram('bxm'); setSubject('matematica'); }} />
              <Button title="Iniciar nueva evaluación" disabled={busy} onPress={() => void run(() => journey.start(state.assessment.blueprint.id))} />
            </View>
          ) : state && attempt && question ? (
            <View style={styles.card}>
              <Text>Pregunta {attempt.currentIndex + 1} de {state.assessment.questions.length}</Text>
              <Text>Guardado en este dispositivo · Límite: {new Date(attempt.deadlineAt).toLocaleTimeString()}</Text>
              <Text style={styles.stem}>{question.stem}</Text>
              {question.options.map(o => (
                <Button
                  key={o.id}
                  title={`${attempt.answers[question.id]?.optionId === o.id ? '✓ ' : ''}${o.id}. ${o.text}`}
                  disabled={busy}
                  onPress={() => void run(() => journey.answer(question.id, o.id))}
                />
              ))}
              <Button title="Anterior" disabled={busy || !attempt.currentIndex} onPress={() => void run(() => journey.goTo(attempt.currentIndex - 1))} />
              <Button title="Siguiente" disabled={busy || attempt.currentIndex === state.assessment.questions.length - 1} onPress={() => void run(() => journey.goTo(attempt.currentIndex + 1))} />
              <Button title="Entregar prueba" disabled={busy} onPress={() => void run(() => journey.submit())} />
              <Text>Puedes entregar con preguntas sin responder; contarán como incorrectas.</Text>
            </View>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: tokens.spacing.large, paddingTop: 64, gap: tokens.spacing.medium, backgroundColor: tokens.color.background, flexGrow: 1 },
  heading: { fontSize: 26, fontWeight: '700', color: tokens.color.text },
  card: { gap: tokens.spacing.medium },
  stem: { fontSize: 18 },
  tabBar: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  localNotice: { padding: 16, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, backgroundColor: '#f8fafc', gap: 8 },
  bold: { fontWeight: '700', color: '#0f172a' },
});
