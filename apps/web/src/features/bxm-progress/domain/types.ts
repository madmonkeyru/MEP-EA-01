/**
 * Core Boundary Types and Identifiers for BXM Progress & Measurement.
 * Conforms to CONSOLIDATED DECISIONS v1 Section 8.
 */

export type { LearningDomain as BxmDomain } from '../../../types/learningDomain';
import type { LearningDomain as BxmDomain } from '../../../types/learningDomain';

import type { CognitiveLevel, DifficultyTier } from '../../../types/learningDomain';
export type { CognitiveLevel, DifficultyTier } from '../../../types/learningDomain';



export type ItemProvenance = 'official_reference' | 'official_past' | 'authored_mastery' | 'isomorphic_generated' | 'legacy_unknown';

export type MasteryStatus = 'mastered' | 'in_progress' | 'needs_reinforcement' | 'insufficient_data';

export type SessionKind = 'diagnostic' | 'practice_topic' | 'practice_evidence' | 'simulation_benchmark' | 'simulation_mock' | 'micro_quiz' | 'mastery_check' | 'retest';

export type SessionMode = 'study' | 'exam';

export interface LearningCompletion {
  sessionId: string;
  completedAt: string;
  answeredCount: number;
  status: 'completed' | 'timed_out' | 'abandoned';
}

export interface BxmSpecContext {
  programId: 'bxm';
  subjectId: 'matematica';
  specId: '02-2026';
  convocatoriaId?: '2026-c2' | '2026-c1' | string;
}

/**
 * Creates a stable domain-qualified evidence key.
 * Example: "bxm/matematica/02-2026/geometry/A1.2"
 */
export function buildQualifiedEvidenceKey(domain: BxmDomain, rawEvidenceCode: string, specId = '02-2026'): string {
  const cleanCode = rawEvidenceCode.trim();
  return `bxm/matematica/${specId}/${domain}/${cleanCode}`;
}

export interface QualifiedEvidenceInfo {
  key: string;
  domain: BxmDomain;
  rawCode: string;
  affirmationCode?: string;
  description?: string;
  weightOfficialPercent?: number; // spec-level weight if applicable
}

/**
 * Attempt event recorded on every student response.
 * Follows the attempt envelope agreed in CONSOLIDATED DECISIONS Section 8.
 */
export interface AttemptEvent {
  userId?: string;
  programId?: 'bxm';
  subjectId?: 'matematica';
  specId?: '02-2026';
  sessionStatus?: 'completed' | 'timed_out' | 'abandoned';
  sessionCompletedAt?: string;
  schemaVersion: '1.0.0';
  eventId: string;
  sessionId: string;
  sessionKind: SessionKind;
  mode: SessionMode;
  timestamp: string; // ISO 8601 UTC
  itemId: string;
  familyId?: string; // Stable template family ID if isomorphic/authored
  primaryEvidenceKey: string; // Domain-qualified evidence key
  secondaryEvidenceKeys?: string[];
  conceptIds?: string[];
  domain: BxmDomain;
  provenance: ItemProvenance;
  reviewStatus?: 'computationally_checked' | 'human_reviewed' | 'unreviewed';
  cognitiveLevel: CognitiveLevel;
  difficulty: DifficultyTier;
  selectedOption: string;
  correctAnswer: string;
  isCorrect: boolean;
  responseIndex: number; // 0-based index of attempt on this question in this session
  hintsUsedBeforeResponse: number;
  exposureFlags?: {
    isBenchmarkItem: boolean;
    hasSeenExplanationBefore: boolean;
  };
  misconceptionCode?: string; // Authored misconception tag if mapped
  learnerReportedReason?: string; // Self-reported learner error reason
}

/**
 * Qualification outcome for mastery calculation.
 */
export type ObservationQualification =
  | { eligible: true; reason: 'unassisted_first_response' }
  | { eligible: false; reason: 'hint_used' | 'retry_after_first' | 'benchmark_item' | 'legacy_unknown' | 'window_expired' | 'invalid_metadata' | 'unreviewed' };
