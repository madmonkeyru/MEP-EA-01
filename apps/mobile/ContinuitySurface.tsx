import { View, Text, StyleSheet, Button } from 'react-native';
import type { LearningContinuity, LongitudinalMetricsResponse } from '@mep-ea/api';
import type { LearningCatalog } from '@mep-ea/content/expansion';
import { tokens } from '@mep-ea/design-system';

const reasonLabels: Record<string, string> = {
  no_diagnostic_yet: 'Diagnóstico pendiente',
  remediation_pending: 'Refuerzo de prerrequisito',
  diagnostic_weakness: 'Debilidad en diagnóstico',
  simulation_weakness: 'Debilidad en simulación',
  retest_available: 'Comprobación disponible',
  general_practice: 'Práctica general',
};

const actionLabels: Record<string, string> = {
  diagnose: 'Realizar diagnóstico',
  learn: 'Estudiar lección',
  practice: 'Practicar ejercicios',
  retest: 'Comprobar dominio',
};

const tierLabels: Record<string, string> = {
  mastered: 'Dominada',
  in_progress: 'En progreso',
  needs_practice: 'Necesita práctica',
  insufficient_evidence: 'Evidencia insuficiente (<5 familias)',
};

export function ContinuitySurface({
  continuity,
  catalog,
  metrics,
  onAction,
}: {
  continuity: LearningContinuity;
  catalog: LearningCatalog;
  metrics?: LongitudinalMetricsResponse['metrics'] | null;
  onAction?: (evidenceKey: string, action: string) => void;
}) {
  const { mastery, plan } = continuity;
  const topActivity = plan.activities[0];
  const topNode = topActivity ? catalog.nodes.find(n => n.key === topActivity.evidenceId) : null;

  return (
    <View style={styles.container}>
      <Text accessibilityRole="header" style={styles.title}>Mi Progreso · Nivelación Continua</Text>
      <Text style={styles.subtitle}>
        Superficie de decisión pedagógica con hábitos longitudinales y plan de nivelación adaptativo.
      </Text>

      {/* Siguiente paso recomendado */}
      <View style={[styles.card, styles.recommendationCard]}>
        <Text style={styles.recommendationTag}>Siguiente paso recomendado</Text>
        <Text style={styles.bold}>
          {topNode ? `${topNode.code}: ${topNode.description}` : 'Comienza con tu Diagnóstico Curricular'}
        </Text>
        {topActivity && (
          <Text style={styles.metaText}>Razón: {reasonLabels[topActivity.reason] ?? topActivity.reason}</Text>
        )}
        {onAction && (
          <Button
            title={topActivity ? (actionLabels[topActivity.action] ?? 'Comenzar sesión focalizada') : 'Realizar diagnóstico'}
            color={tokens.color.primary}
            onPress={() => onAction(topActivity?.evidenceId ?? 'diag', topActivity?.action ?? 'diagnose')}
          />
        )}
      </View>

      {/* Hábitos de Estudio */}
      {metrics && (
        <View style={styles.card}>
          <Text accessibilityRole="header" style={styles.bold}>Hábitos de Estudio Longitudinales</Text>
          <Text style={styles.metaText}>Intentos totales: {metrics.totalAttempts}</Text>
          <Text style={styles.metaText}>
            Precisión global: {metrics.overallAccuracy !== null ? `${metrics.overallAccuracy}%` : '—'}
          </Text>
          <Text style={styles.metaText}>Preguntas respondidas: {metrics.habits.totalQuestionsEncountered}</Text>
          <Text style={styles.metaText}>
            Bucle formativo: {metrics.loopCounts.diagnostic} diag · {metrics.loopCounts.practice} práct · {metrics.loopCounts.simulation} sim
          </Text>
        </View>
      )}

      <Text accessibilityRole="header" style={styles.sectionHeader}>Estado de Dominio Curricular</Text>
      {mastery.domains.length === 0 ? (
        <Text style={styles.emptyText}>No hay intentos registrados aún en la ventana actual.</Text>
      ) : (
        mastery.domains.map(d => {
          const domainName = catalog.registry.taxonomy.domains.find(dom => dom.id === d.id)?.name ?? d.id;
          const tier = tierLabels[d.tier] ?? tierLabels.insufficient_evidence;
          return (
            <View key={d.id} style={styles.card}>
              <Text style={styles.bold}>{domainName}</Text>
              <Text>Nivel: {tier}</Text>
              <Text>Precisión: {d.accuracy !== null ? `${Math.round(d.accuracy * 100)}%` : 'Sin datos'}</Text>
              <Text>Familias evaluadas: {d.distinctFamilies} / {mastery.minimumFamilies}</Text>
            </View>
          );
        })
      )}

      <Text accessibilityRole="header" style={styles.sectionHeader}>Plan de Nivelación Priorizado</Text>
      {plan.activities.length === 0 ? (
        <Text style={styles.emptyText}>No hay actividades de nivelación pendientes.</Text>
      ) : (
        plan.activities.map((act, idx) => {
          const node = catalog.nodes.find(n => n.key === act.evidenceId);
          const reason = reasonLabels[act.reason] ?? act.reason;
          const actionText = actionLabels[act.action] ?? act.action;
          return (
            <View key={`${act.evidenceId}-${idx}`} style={styles.card}>
              <Text style={styles.reasonTag}>{reason} · Acción: {actionText}</Text>
              <Text style={styles.bold}>{node ? `${node.code}: ${node.description}` : act.evidenceId}</Text>
              {onAction && (
                <Button
                  title={`${actionText} →`}
                  onPress={() => onAction(act.evidenceId, act.action)}
                />
              )}
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: tokens.spacing.small, paddingVertical: 8 },
  title: { fontSize: 20, fontWeight: '700', color: tokens.color.text },
  subtitle: { fontSize: 13, color: '#64748b', marginBottom: 8 },
  sectionHeader: { fontSize: 16, fontWeight: '600', color: tokens.color.text, marginTop: 12 },
  card: { padding: tokens.spacing.small, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, backgroundColor: '#f8fafc', gap: 6 },
  recommendationCard: { borderColor: tokens.color.primary, backgroundColor: '#eef2ff' },
  recommendationTag: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', color: tokens.color.primary },
  metaText: { fontSize: 12, color: '#64748b' },
  bold: { fontWeight: '600', color: tokens.color.text },
  reasonTag: { fontSize: 12, color: '#334155', fontWeight: '500' },
  emptyText: { fontSize: 13, color: '#94a3b8', fontStyle: 'italic' },
});
