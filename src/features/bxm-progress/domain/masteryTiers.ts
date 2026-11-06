export type StudentMasteryTier = 'mastered' | 'in_progress' | 'needs_practice';

export interface StudentMasteryConfig {
  masteredThreshold: number; // default: 75%
  inProgressThreshold: number; // default: 60%
}

export const DEFAULT_MASTERY_CONFIG: StudentMasteryConfig = {
  masteredThreshold: 75,
  inProgressThreshold: 60,
};

export interface StudentMasteryPresentation {
  tier: StudentMasteryTier;
  label: string; // 'Dominada' | 'En progreso' | 'Necesita práctica'
  badgeEmoji: string; // '🟢' | '🟡' | '🔴'
  badgeColorClass: string;
  pillClass: string;
  percentage?: number;
}

/**
 * Classifies an accuracy percentage into a student-facing mastery tier.
 * Never exposes raw taxonomy IDs or quantitative formulas directly.
 */
export function classifyStudentMastery(
  percentage: number,
  config: StudentMasteryConfig = DEFAULT_MASTERY_CONFIG
): StudentMasteryPresentation {
  const boundedPct = Math.max(0, Math.min(100, Math.round(percentage)));

  if (boundedPct >= config.masteredThreshold) {
    return {
      tier: 'mastered',
      label: 'Dominada',
      badgeEmoji: '🟢',
      badgeColorClass: 'text-emerald-700 dark:text-emerald-400',
      pillClass: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
      percentage: boundedPct,
    };
  }

  if (boundedPct >= config.inProgressThreshold) {
    return {
      tier: 'in_progress',
      label: 'En progreso',
      badgeEmoji: '🟡',
      badgeColorClass: 'text-amber-700 dark:text-amber-400',
      pillClass: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
      percentage: boundedPct,
    };
  }

  return {
    tier: 'needs_practice',
    label: 'Necesita práctica',
    badgeEmoji: '🔴',
    badgeColorClass: 'text-rose-700 dark:text-rose-400',
    pillClass: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
    percentage: boundedPct,
  };
}
