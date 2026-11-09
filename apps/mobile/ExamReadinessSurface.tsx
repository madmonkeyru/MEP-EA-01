import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { tokens } from '@mep-ea/design-system';
import { deriveExamReadiness, type ExamReadinessOverview } from '@mep-ea/learning-runtime';
import type { LongitudinalMetricsResponse } from '@mep-ea/api';

export interface MobileExamReadinessSurfaceProps {
  metrics: LongitudinalMetricsResponse['metrics'] | null;
  priorityWeakness?: { evidenceKey?: string; domainName?: string };
  onNavigateToDiagnostic: () => void;
  onNavigateToPractice: (evidenceKey?: string) => void;
  onNavigateToSimulation: () => void;
}

export function ExamReadinessSurface({
  metrics,
  priorityWeakness,
  onNavigateToDiagnostic,
  onNavigateToPractice,
  onNavigateToSimulation,
}: MobileExamReadinessSurfaceProps) {
  const readiness: ExamReadinessOverview = useMemo(() => {
    return deriveExamReadiness(
      metrics?.learnerId ?? 'anonymous',
      {
        totalAttempts: metrics?.totalAttempts ?? 0,
        overallAccuracy: metrics?.overallAccuracy ?? null,
        loopCounts: metrics?.loopCounts ?? { diagnostic: 0, practice: 0, mock: 0, simulation: 0 },
        domainCoverage: metrics?.domainCoverage ?? {},
      },
      priorityWeakness
    );
  }, [metrics, priorityWeakness]);

  const handleAction = () => {
    if (readiness.recommendedAction.type === 'diagnostic') {
      onNavigateToDiagnostic();
    } else if (readiness.recommendedAction.type === 'practice') {
      onNavigateToPractice(readiness.recommendedAction.evidenceKey);
    } else {
      onNavigateToSimulation();
    }
  };

  const getStageBadge = (stage: ExamReadinessOverview['readinessStage']) => {
    switch (stage) {
      case 'exam_ready':
        return { label: 'Preparación Consolidada', color: tokens.color.mastered, bg: tokens.color.masteredBg };
      case 'ready_for_simulation':
        return { label: 'Listo para Simulación', color: tokens.color.primary, bg: tokens.color.primaryLight };
      case 'remediation_in_progress':
        return { label: 'Nivelación en Progreso', color: tokens.color.inProgress, bg: tokens.color.inProgressBg };
      default:
        return { label: 'Diagnóstico Requerido', color: tokens.color.needsPractice, bg: tokens.color.needsPracticeBg };
    }
  };

  const stageBadge = getStageBadge(readiness.readinessStage);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Centro de Preparación</Text>
          <Text style={styles.subtitle}>Convocatoria oficial MEP Educación Abierta</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: stageBadge.bg }]}>
          <Text style={[styles.badgeText, { color: stageBadge.color }]}>{stageBadge.label}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>PREPARACIÓN</Text>
          <Text style={styles.statValue}>{readiness.readinessScore}%</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${readiness.readinessScore}%` }]} />
          </View>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>PRECISIÓN</Text>
          <Text style={styles.statValue}>
            {readiness.overallAccuracy !== null ? `${readiness.overallAccuracy}%` : 'N/A'}
          </Text>
          <Text style={styles.statSub}>{readiness.totalAttempts} intentos</Text>
        </View>
      </View>

      <View style={styles.ctaCard}>
        <Text style={styles.ctaTag}>SIGUIENTE PASO RECOMENDADO</Text>
        <Text style={styles.ctaTitle}>{readiness.recommendedAction.titleEs}</Text>
        <Text style={styles.ctaDesc}>{readiness.recommendedAction.descriptionEs}</Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleAction}
          accessibilityRole="button"
          accessibilityLabel={readiness.recommendedAction.ctaEs}
        >
          <Text style={styles.actionButtonText}>▶ {readiness.recommendedAction.ctaEs}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.color.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: tokens.color.border,
    padding: tokens.spacing.medium,
    marginBottom: tokens.spacing.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: tokens.spacing.medium,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: tokens.color.text,
  },
  subtitle: {
    fontSize: 11,
    color: tokens.color.textMuted,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: tokens.spacing.medium,
  },
  statBox: {
    flex: 1,
    backgroundColor: tokens.color.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: tokens.color.border,
    padding: tokens.spacing.small,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: tokens.color.textMuted,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: tokens.color.text,
    marginVertical: 4,
  },
  statSub: {
    fontSize: 10,
    color: tokens.color.textMuted,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#cbd5e1',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: tokens.color.primary,
  },
  ctaCard: {
    backgroundColor: tokens.color.primaryLight,
    borderRadius: 12,
    padding: tokens.spacing.medium,
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  ctaTag: {
    fontSize: 9,
    fontWeight: 'bold',
    color: tokens.color.primary,
    letterSpacing: 0.5,
  },
  ctaTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: tokens.color.text,
    marginTop: 2,
  },
  ctaDesc: {
    fontSize: 11,
    color: '#334155',
    marginVertical: 6,
    lineHeight: 16,
  },
  actionButton: {
    backgroundColor: tokens.color.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: tokens.a11y.minTargetSize,
    marginTop: 4,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
