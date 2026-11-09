import type { TelemetryEvent } from '@mep-ea/analytics';

/**
 * P8 Operational & Longitudinal Analytics Service Interface
 */

export interface TelemetryBatchResult {
  accepted: number;
  duplicate: number;
  rejected: number;
}

export interface LongitudinalLearnerMetrics {
  learnerId: string;
  evaluatedAt: string;
  totalAttempts: number;
  firstAttemptAt: string | null;
  lastAttemptAt: string | null;
  /** Closed-loop progression: count of completed diagnostics, practice sets, and mock/simulations */
  loopCounts: {
    diagnostic: number;
    practice: number;
    mock: number;
    simulation: number;
  };
  /** Average accuracy across first responses */
  overallAccuracy: number | null;
  /** Domains evaluated with mastery status count */
  domainCoverage: Record<string, { total: number; correct: number; distinctFamilies: number }>;
  /** Cognitive & test-taking habits */
  habits: {
    averageDurationSeconds: number;
    unansweredRate: number;
    totalQuestionsEncountered: number;
  };
  /** Nivelacion & progression status */
  loopStage: 'diagnostic_needed' | 'remediation_in_progress' | 'ready_for_retest' | 'exam_ready';
}

export interface OperationalDiagnostics {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptimeSeconds: number;
  memoryUsageMb: number;
  storage: {
    type: 'postgres' | 'file_memory';
    connected: boolean;
    totalAttempts: number;
    totalTelemetryEvents: number;
    activeDrafts?: number;
  };
  metrics: {
    requestsTotal: number;
    errorsTotal: number;
    telemetryIngested: number;
    syncConflictsTotal: number;
  };
}

export interface TelemetryRepository {
  recordTelemetry(events: TelemetryEvent[]): Promise<TelemetryBatchResult>;
  getTelemetryCount?(): Promise<number>;
  getLongitudinalMetrics?(learnerId: string): Promise<LongitudinalLearnerMetrics>;
  getDiagnostics?(): Promise<OperationalDiagnostics['storage']>;
}
