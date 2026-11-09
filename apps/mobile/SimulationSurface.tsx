import { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity, ScrollView } from 'react-native';
import type { Assessment, OptionId, Attempt } from '@mep-ea/domain';
import type { PlatformApi } from '@mep-ea/api';
import { EntitlementRequired } from '@mep-ea/api';
import { tokens } from '@mep-ea/design-system';

export type SimulationMode = 'diagnostic' | 'mock' | 'simulation';

export interface MobileSimulationSurfaceProps {
  api: PlatformApi;
  onAttemptSubmitted?: (attempt: Attempt) => void;
  onBackToHub?: () => void;
}

export function SimulationSurface({
  api,
  onAttemptSubmitted,
  onBackToHub,
}: MobileSimulationSurfaceProps) {
  const [selectedMode, setSelectedMode] = useState<SimulationMode | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paywallNotice, setPaywallNotice] = useState<string | null>(null);

  // Attempt State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { questionId: string; optionId: OptionId; answeredAt: string }>>({});
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'unanswered' | 'flagged'>('all');
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [deadlineAt, setDeadlineAt] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [submittedAttempt, setSubmittedAttempt] = useState<Attempt | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!deadlineAt || submittedAttempt) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((deadlineAt - Date.now()) / 1000));
      setRemainingSeconds(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        void handleSubmit();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [deadlineAt, submittedAttempt]);

  const handleLaunch = async (mode: SimulationMode) => {
    setLoading(true);
    setError(null);
    setPaywallNotice(null);
    try {
      const compiled = await api.compileAssessment({
        programId: 'bxm',
        subjectId: 'matematica',
        mode,
      });
      setAssessment(compiled);
      setSelectedMode(mode);
      setCurrentIndex(0);
      setAnswers({});
      setBookmarkedIds(new Set());
      const now = Date.now();
      const deadline = now + compiled.blueprint.timeLimitSeconds * 1000;
      setStartedAt(new Date(now).toISOString());
      setDeadlineAt(deadline);
      setRemainingSeconds(compiled.blueprint.timeLimitSeconds);
      setSubmittedAttempt(null);
    } catch (err) {
      if (err instanceof EntitlementRequired) {
        setPaywallNotice(err.reasonEs ?? 'La simulación oficial de 60 ítems requiere suscripción Pro.');
      } else {
        setError(err instanceof Error ? err.message : 'Error al compilar la prueba');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId: string, optionId: OptionId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        questionId,
        optionId,
        answeredAt: new Date().toISOString(),
      },
    }));
  };

  const handleToggleBookmark = (questionId: string) => {
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!assessment || !startedAt || !deadlineAt) return;
    setSubmitting(true);
    try {
      const session = await api.getSession();
      const attemptId = `attempt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const nowIso = new Date().toISOString();
      const attempt: Attempt = {
        schemaVersion: 1,
        id: attemptId,
        learnerId: session.learnerId,
        assessmentId: assessment.id,
        assessmentVersion: assessment.blueprint.version,
        questionIds: assessment.questions.map(q => q.id),
        status: 'submitted',
        currentIndex,
        answers,
        startedAt,
        updatedAt: nowIso,
        submittedAt: nowIso,
        deadlineAt: new Date(deadlineAt).toISOString(),
      };

      await api.submitAttempt(attempt);
      setSubmittedAttempt(attempt);
      if (onAttemptSubmitted) onAttemptSubmitted(attempt);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al entregar la prueba.');
    } finally {
      setSubmitting(false);
    }
  };

  const questions = assessment?.questions ?? [];
  const filteredIndices = useMemo(() => {
    return questions.map((q, idx) => ({ q, idx })).filter(({ q }) => {
      if (filter === 'unanswered') return !answers[q.id];
      if (filter === 'flagged') return bookmarkedIds.has(q.id);
      return true;
    }).map(({ idx }) => idx);
  }, [questions, answers, bookmarkedIds, filter]);

  const currentQuestion = questions[currentIndex];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // 1. Result View
  if (submittedAttempt && assessment) {
    const answeredCount = Object.keys(answers).length;
    const totalCount = assessment.questions.length;
    return (
      <View style={styles.container}>
        <Text accessibilityRole="header" style={styles.title}>Prueba Entregada con Éxito</Text>
        <Text style={styles.subtitle}>
          Tus respuestas se han guardado y proyectado a tu Plan de Nivelación longitudinal.
        </Text>
        <View style={styles.card}>
          <Text style={styles.bold}>Total de preguntas: {totalCount}</Text>
          <Text>Respondidas: {answeredCount}</Text>
          <Text>Sin responder: {totalCount - answeredCount}</Text>
        </View>
        <Button
          title="Realizar otra prueba"
          onPress={() => {
            setAssessment(null);
            setSelectedMode(null);
            setSubmittedAttempt(null);
          }}
        />
        {onBackToHub && <Button title="Volver a mi preparación" onPress={onBackToHub} />}
      </View>
    );
  }

  // 2. Active Exam Runner View
  if (assessment && currentQuestion) {
    const isBookmarked = bookmarkedIds.has(currentQuestion.id);
    const selectedOption = answers[currentQuestion.id]?.optionId;

    return (
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.modeBadge}>
            {selectedMode === 'simulation' ? 'Simulación Oficial' : selectedMode === 'mock' ? 'Simulacro' : 'Diagnóstico'}
          </Text>
          {remainingSeconds !== null && (
            <Text style={styles.timerBadge}>⏱ {formatTime(remainingSeconds)}</Text>
          )}
        </View>

        <Text accessibilityRole="header" style={styles.title}>
          Pregunta {currentIndex + 1} de {questions.length}
        </Text>

        <TouchableOpacity
          onPress={() => handleToggleBookmark(currentQuestion.id)}
          style={[styles.bookmarkButton, isBookmarked && styles.bookmarkActive]}
        >
          <Text style={styles.bookmarkText}>
            {isBookmarked ? '★ Marcada para revisión' : '☆ Marcar para revisión'}
          </Text>
        </TouchableOpacity>

        {/* Navigator Filters */}
        <View style={styles.filterRow}>
          <TouchableOpacity onPress={() => setFilter('all')}>
            <Text style={[styles.filterText, filter === 'all' && styles.filterActive]}>
              Todas ({questions.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setFilter('unanswered')}>
            <Text style={[styles.filterText, filter === 'unanswered' && styles.filterActive]}>
              Sin responder ({questions.filter(q => !answers[q.id]).length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setFilter('flagged')}>
            <Text style={[styles.filterText, filter === 'flagged' && styles.filterActive]}>
              Marcadas ({bookmarkedIds.size})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Question Numbers Grid */}
        <View style={styles.gridContainer}>
          {questions.map((q, idx) => {
            const isAnswered = !!answers[q.id];
            const isFlagged = bookmarkedIds.has(q.id);
            const isCurrent = idx === currentIndex;
            const matchesFilter = filteredIndices.includes(idx);

            return (
              <TouchableOpacity
                key={q.id}
                onPress={() => setCurrentIndex(idx)}
                style={[
                  styles.gridItem,
                  isCurrent && styles.gridCurrent,
                  isAnswered && !isCurrent && styles.gridAnswered,
                  !matchesFilter && styles.gridDimmed,
                ]}
              >
                <Text style={[styles.gridNumber, (isCurrent || isAnswered) && styles.whiteText]}>
                  {idx + 1}
                </Text>
                {isFlagged && <View style={styles.flagDot} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Stem and Options */}
        <View style={styles.stemContainer}>
          <Text style={styles.stemText}>{currentQuestion.stem}</Text>
        </View>

        <View style={styles.optionsList}>
          {currentQuestion.options.map(opt => {
            const selected = selectedOption === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                onPress={() => handleSelectOption(currentQuestion.id, opt.id)}
                style={[styles.optionItem, selected && styles.optionSelected]}
              >
                <View style={[styles.letterBadge, selected && styles.letterBadgeSelected]}>
                  <Text style={[styles.letterText, selected && styles.whiteText]}>{opt.id}</Text>
                </View>
                <Text style={styles.optionText}>{opt.text}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Navigation Actions */}
        <View style={styles.navRow}>
          <Button
            title="← Anterior"
            disabled={currentIndex === 0}
            onPress={() => setCurrentIndex(i => Math.max(0, i - 1))}
          />
          <Button
            title="Siguiente →"
            disabled={currentIndex >= questions.length - 1}
            onPress={() => setCurrentIndex(i => Math.min(questions.length - 1, i + 1))}
          />
        </View>

        <View style={styles.submitContainer}>
          <Button
            title={submitting ? 'Entregando…' : 'Entregar prueba'}
            color={tokens.color.mastered}
            disabled={submitting}
            onPress={() => void handleSubmit()}
          />
        </View>
      </ScrollView>
    );
  }

  // 3. Mode Launcher View
  return (
    <View style={styles.container}>
      <Text accessibilityRole="header" style={styles.title}>Simulación y Evaluaciones</Text>
      <Text style={styles.subtitle}>
        Evaluaciones deterministas basadas en las especificaciones oficiales DGEC/MEP (02-2026).
      </Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {paywallNotice && (
        <View style={styles.paywallCard}>
          <Text style={styles.paywallTitle}>Función Plan Pro Requerida</Text>
          <Text style={styles.paywallDesc}>{paywallNotice}</Text>
          <Button title="Entendido" onPress={() => setPaywallNotice(null)} />
        </View>
      )}

      {/* Diagnostic Card */}
      <View style={styles.card}>
        <Text style={styles.tag}>Gratuito</Text>
        <Text style={styles.bold}>Diagnóstico Curricular (20 ítems)</Text>
        <Text style={styles.cardDesc}>8 Geometría, 8 Funciones, 4 Estadística. Límite 30 min.</Text>
        <Button
          title="Iniciar diagnóstico"
          disabled={loading}
          onPress={() => void handleLaunch('diagnostic')}
        />
      </View>

      {/* Mock Exam Card */}
      <View style={styles.card}>
        <Text style={styles.tag}>Gratuito</Text>
        <Text style={styles.bold}>Simulacro Formativo (20 ítems)</Text>
        <Text style={styles.cardDesc}>Alimenta tu Plan de Nivelación. Límite 45 min.</Text>
        <Button
          title="Iniciar simulacro"
          disabled={loading}
          onPress={() => void handleLaunch('mock')}
        />
      </View>

      {/* Official Simulation Card */}
      <View style={[styles.card, styles.proCard]}>
        <Text style={styles.proTag}>Plan Pro Requerido</Text>
        <Text style={styles.bold}>Simulación Oficial (60 ítems)</Text>
        <Text style={styles.cardDesc}>60 ítems oficiales de referencia 02-2026. Límite 150 min.</Text>
        <Button
          title="Comenzar simulación"
          color={tokens.color.inProgress}
          disabled={loading}
          onPress={() => void handleLaunch('simulation')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: tokens.spacing.small, paddingVertical: 12 },
  title: { fontSize: 20, fontWeight: '700', color: tokens.color.text },
  subtitle: { fontSize: 13, color: '#64748b', marginBottom: 6 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modeBadge: { fontSize: 11, fontWeight: '700', color: tokens.color.primary, backgroundColor: '#e0e7ff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  timerBadge: { fontSize: 13, fontWeight: '700', color: tokens.color.text, backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  bookmarkButton: { padding: 8, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6, alignItems: 'center' },
  bookmarkActive: { backgroundColor: '#fef3c7', borderColor: '#fde68a' },
  bookmarkText: { fontSize: 12, fontWeight: '600', color: '#334155' },
  filterRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  filterText: { fontSize: 12, color: '#64748b' },
  filterActive: { fontWeight: '700', color: tokens.color.text, textDecorationLine: 'underline' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, padding: tokens.spacing.small, backgroundColor: '#f8fafc', borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  gridItem: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center', borderRadius: 4, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#cbd5e1' },
  gridCurrent: { backgroundColor: tokens.color.primary, borderColor: tokens.color.primary },
  gridAnswered: { backgroundColor: tokens.color.text, borderColor: tokens.color.text },
  gridDimmed: { opacity: 0.3 },
  gridNumber: { fontSize: 12, fontWeight: '600', color: '#334155' },
  whiteText: { color: '#ffffff' },
  flagDot: { position: 'absolute', top: 2, right: 2, width: 6, height: 6, borderRadius: 3, backgroundColor: '#f59e0b' },
  stemContainer: { padding: tokens.spacing.small, backgroundColor: '#f8fafc', borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  stemText: { fontSize: 15, color: tokens.color.text, lineHeight: 22 },
  optionsList: { gap: 8 },
  optionItem: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, backgroundColor: '#ffffff' },
  optionSelected: { borderColor: tokens.color.primary, backgroundColor: '#eef2ff' },
  letterBadge: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f1f5f9' },
  letterBadgeSelected: { backgroundColor: tokens.color.primary },
  letterText: { fontSize: 12, fontWeight: '700', color: '#334155' },
  optionText: { fontSize: 14, color: '#1e293b', flexShrink: 1 },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  submitContainer: { marginTop: 16 },
  card: { padding: 14, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, backgroundColor: '#ffffff', gap: 6 },
  proCard: { borderColor: '#fde68a', backgroundColor: '#fffbeb' },
  tag: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', color: '#0369a1' },
  proTag: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', color: '#b45309' },
  bold: { fontSize: 15, fontWeight: '700', color: tokens.color.text },
  cardDesc: { fontSize: 12, color: '#64748b' },
  paywallCard: { padding: tokens.spacing.small, backgroundColor: '#fef3c7', borderRadius: 8, gap: 6, borderWidth: 1, borderColor: '#fcd34d' },
  paywallTitle: { fontSize: 14, fontWeight: '700', color: '#92400e' },
  paywallDesc: { fontSize: 12, color: '#78350f' },
  errorText: { fontSize: 13, color: tokens.color.needsPractice },
});
