import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import Storage from 'expo-sqlite/kv-store';
import { createFoundationAssessment } from '@mep-ea/content/preview';
import { AssessmentSession, createLocalAdapter } from '@mep-ea/learning-runtime';
import type { Attempt } from '@mep-ea/domain';
import { tokens } from '@mep-ea/design-system';

const assessment = createFoundationAssessment();
const runtime = new AssessmentSession(assessment, createLocalAdapter(Storage), 'foundation-local', 'foundation-preview-1');

export default function App() {
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const run = async (action: () => Promise<Attempt>) => {
    setBusy(true); setError('');
    try { setAttempt(await action()); } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo guardar la prueba.'); }
    finally { setBusy(false); }
  };
  useEffect(() => { void run(() => runtime.open()); }, []);
  const question = attempt && assessment.questions[attempt.currentIndex];
  return <ScrollView contentContainerStyle={styles.page}>
    <Text style={styles.heading}>Prueba de fundamentos</Text>
    <Text>Vista previa de desarrollo · 3 preguntas de BXM. Contenido pendiente de revisión editorial.</Text>
    {error ? <View accessibilityRole="alert"><Text>{error}</Text><Button title="Reintentar carga" disabled={busy} onPress={() => void run(() => runtime.open())} /></View> : null}
    {busy && <ActivityIndicator />}
    {attempt?.status === 'submitted' ? <View>
      <Text accessibilityRole="header">Resultado: {attempt.score?.correct} / {attempt.score?.total}</Text>
      <Text>Sin responder: {attempt.score?.unanswered}</Text>
    </View> : question && attempt ? <View style={styles.card}>
      <Text>Pregunta {attempt.currentIndex + 1} de {assessment.questions.length}</Text>
      <Text>Tiempo límite: {new Date(attempt.deadlineAt).toLocaleTimeString()}</Text>
      <Text style={styles.stem}>{question.stem}</Text>
      {question.options.map(option => <View key={option.id} style={styles.option}>
        <Button title={`${attempt.answers[question.id]?.optionId === option.id ? '✓ ' : ''}${option.id}. ${option.text}`} disabled={busy}
          onPress={() => void run(() => runtime.answer(question.id, option.id))} />
      </View>)}
      <Button title="Anterior" disabled={busy || attempt.currentIndex === 0} onPress={() => void run(() => runtime.goTo(attempt.currentIndex - 1))} />
      <Button title="Siguiente" disabled={busy || attempt.currentIndex === assessment.questions.length - 1} onPress={() => void run(() => runtime.goTo(attempt.currentIndex + 1))} />
      <Button title="Entregar prueba" disabled={busy} onPress={() => void run(() => runtime.submit())} />
    </View> : null}
  </ScrollView>;
}
const styles = StyleSheet.create({
  page: { padding: tokens.spacing.large, paddingTop: 64, gap: tokens.spacing.medium, backgroundColor: tokens.color.background, flexGrow: 1 },
  heading: { fontSize: 26, fontWeight: '700', color: tokens.color.text },
  card: { gap: tokens.spacing.medium }, stem: { fontSize: 18 }, option: { marginVertical: tokens.spacing.small },
});
