import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import Storage from 'expo-sqlite/kv-store';
import { createJourneyPreviewCatalog } from '@mep-ea/content/preview';
import { LearnerJourney, type JourneyState } from '@mep-ea/learning-runtime';
import { tokens } from '@mep-ea/design-system';
const catalog = createJourneyPreviewCatalog();
const journey = new LearnerJourney(catalog, Storage, 'p1-local');
const tiers = { strong: 'Fortaleza', developing: 'En progreso', needs_practice: 'Necesita práctica' };
export default function App() {
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
  return <ScrollView contentContainerStyle={styles.page}>
    <Text style={styles.heading} accessibilityRole="header">Mi ruta de aprendizaje</Text>
    <Text>Vista previa de desarrollo · 3 preguntas de BXM. Contenido pendiente de revisión editorial.</Text>
    {error ? <View accessibilityRole="alert"><Text>{error}</Text><Button title="Reintentar carga" disabled={busy} onPress={() => void run(() => journey.resume())} /></View> : null}
    {busy || !ready && !error ? <ActivityIndicator /> : null}
    {ready && !state ? <View style={styles.card}>
      <Text accessibilityRole="header">Elige tu programa</Text>
      {catalog.registry.taxonomy.programs.map(p => <Button key={p.id} title={`${program === p.id ? '✓ ' : ''}${p.name}`} onPress={() => { setProgram(p.id); setSubject(''); }} />)}
      <Text>Asignatura</Text>
      {catalog.registry.taxonomy.subjects.filter(s => s.programId === program).map(s => <Button key={s.id} title={`${subject === s.id ? '✓ ' : ''}${s.name}`} onPress={() => setSubject(s.id)} />)}
      {catalog.blueprints.filter(b => b.programId === program && b.subjectId === subject).map(b => <View key={b.id}>
        <Text>Diagnóstico breve · {b.totalItems} preguntas · {b.timeLimitSeconds / 60} minutos</Text>
        <Button title="Comenzar diagnóstico" disabled={busy} onPress={() => void run(() => journey.start(b.id))} />
      </View>)}
    </View> : null}
    {result && attempt && state ? <View style={styles.card}>
      <Text accessibilityRole="header">Resultado: {attempt.score?.correct} / {attempt.score?.total}</Text><Text>Sin responder: {attempt.score?.unanswered}</Text>
      <Text accessibilityRole="header">Diagnóstico inicial</Text><Text>Estimación provisional de esta prueba breve; no acredita dominio sostenido.</Text>
      {result.diagnostic.domains.map(d => <Text key={d.domainId}>{catalog.registry.taxonomy.domains.find(t => t.id === d.domainId)?.name}: {tiers[d.tier]} ({d.correct}/{d.total})</Text>)}
      <Text accessibilityRole="header">Plan de refuerzo</Text>
      {result.plan.activities.map(a => <View key={a.conceptId} style={styles.card}>
        <Text accessibilityRole="header">{catalog.registry.taxonomy.concepts.find(c => c.id === a.conceptId)?.name}</Text>
        <Text>Revisa el ejemplo y resuélvelo de nuevo.</Text><Text>{a.title}</Text>
        {a.steps.map((s, i) => <Text key={i}>{i + 1}. {s}</Text>)}
      </View>)}
      <Text>{result.plan.nextStep === 'practice' ? 'Siguiente paso: repasa los ejemplos y vuelve a evaluar lo aprendido.' : 'Siguiente paso: repite la evaluación para comprobar tu aprendizaje.'}</Text>
      <Button title="Iniciar nueva evaluación" disabled={busy} onPress={() => void run(() => journey.start(state.assessment.blueprint.id))} />
    </View> : state && attempt && question ? <View style={styles.card}>
      <Text>Pregunta {attempt.currentIndex + 1} de {state.assessment.questions.length}</Text>
      <Text>Guardado en este dispositivo · Límite: {new Date(attempt.deadlineAt).toLocaleTimeString()}</Text>
      <Text style={styles.stem}>{question.stem}</Text>
      {question.options.map(o => <Button key={o.id} title={`${attempt.answers[question.id]?.optionId === o.id ? '✓ ' : ''}${o.id}. ${o.text}`} disabled={busy} onPress={() => void run(() => journey.answer(question.id, o.id))} />)}
      <Button title="Anterior" disabled={busy || !attempt.currentIndex} onPress={() => void run(() => journey.goTo(attempt.currentIndex - 1))} />
      <Button title="Siguiente" disabled={busy || attempt.currentIndex === state.assessment.questions.length - 1} onPress={() => void run(() => journey.goTo(attempt.currentIndex + 1))} />
      <Button title="Entregar prueba" disabled={busy} onPress={() => void run(() => journey.submit())} />
      <Text>Puedes entregar con preguntas sin responder; contarán como incorrectas.</Text>
    </View> : null}
  </ScrollView>;
}
const styles = StyleSheet.create({
  page: { padding: tokens.spacing.large, paddingTop: 64, gap: tokens.spacing.medium, backgroundColor: tokens.color.background, flexGrow: 1 },
  heading: { fontSize: 26, fontWeight: '700', color: tokens.color.text }, card: { gap: tokens.spacing.medium }, stem: { fontSize: 18 },
});
