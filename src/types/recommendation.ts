/**
 * Program-agnostic canonical recommendation and learner activity contracts.
 * Designed for BXM, III Ciclo, EDAD, and I y II Ciclo.
 */

export type ActivityType =
  | 'diagnostic'
  | 'lesson'
  | 'practice'
  | 'remediation'
  | 'simulation'
  | 'retest';

export type RecommendationReason =
  | 'no_diagnostic_yet'
  | 'diagnostic_weakness'
  | 'remediation_pending'
  | 'unfinished_lesson'
  | 'retest_available'
  | 'simulation_recommended'
  | 'general_practice';

export type RecommendationPriority = 'p0' | 'p1' | 'p2' | 'p3';

export interface RecommendationCTA {
  label: string;
  action: ActivityType;
  targetId?: string;
  secondaryLabel?: string;
  secondaryAction?: ActivityType;
  secondaryTargetId?: string;
}

/**
 * Canonical contract required by M1.2:
 * {
 *   activityType,
 *   targetId,
 *   reason,
 *   priority,
 *   cta
 * }
 */
export interface CanonicalRecommendation {
  activityType: ActivityType;
  targetId?: string;
  reason: RecommendationReason;
  priority: RecommendationPriority;
  cta: RecommendationCTA;

  // Pedagogical context presented in student-friendly language
  // (No internal evidence IDs or raw codes exposed directly to the student)
  title: string;
  description: string;
  domainLabel?: string;
  currentAccuracyPercentage?: number;
  statusLabel?: string;
  estimatedMinutes?: number;
}
