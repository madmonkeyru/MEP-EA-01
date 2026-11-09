import type { AssessmentMode, NivelacionReason } from '@mep-ea/domain';

/**
 * P8 Telemetry Event Taxonomy
 *
 * Strict security & privacy boundaries:
 * - NO user credentials, passwords, auth tokens, or session secrets.
 * - NO raw learner identifying PII (names, emails, cedulas).
 * - NO question answer text or authored solution text.
 * - Client events are stamped with anonymous or pseudonymized learner/session identifiers.
 */

export type PlatformId = 'web' | 'ios' | 'android' | 'service';

export type FunnelStage = 'activation' | 'learning' | 'assessment' | 'commercial' | 'operational';

export type TelemetryEventName =
  // Session & Authentication
  | 'session_started'
  | 'session_authenticated'
  | 'session_signed_out'
  // Learning & Temario
  | 'lesson_opened'
  | 'lesson_completed'
  | 'evidence_practiced'
  // Assessment Lifecycle
  | 'diagnostic_started'
  | 'diagnostic_completed'
  | 'mock_started'
  | 'mock_completed'
  | 'official_simulation_started'
  | 'official_simulation_completed'
  | 'assessment_abandoned'
  | 'assessment_expired'
  // In-Assessment Interactions
  | 'question_answered'
  | 'question_changed'
  | 'question_flagged'
  | 'question_unflagged'
  // Remediation & Loop Progression
  | 'remediation_selected'
  | 'nivelacion_action_completed'
  // Sync & Continuity
  | 'sync_started'
  | 'sync_succeeded'
  | 'sync_failed'
  | 'conflict_detected'
  | 'conflict_resolved'
  // Entitlement & Commercial
  | 'entitlement_denied'
  | 'paywall_viewed'
  // Operational & Health
  | 'client_error_captured'
  | 'service_health_checked';

export interface TelemetryEventPayloads {
  session_started: { source?: string };
  session_authenticated: { method: 'password' | 'token' | 'anonymous_claim' };
  session_signed_out: { reason?: string };

  lesson_opened: { evidenceId: string; domainId?: string };
  lesson_completed: { evidenceId: string; score?: number; passed?: boolean };
  evidence_practiced: { evidenceId: string; count: number; correct: number };

  diagnostic_started: { attemptId: string; questionCount: number };
  diagnostic_completed: { attemptId: string; durationSeconds: number; scorePercentage: number };

  mock_started: { attemptId: string; questionCount: number };
  mock_completed: { attemptId: string; durationSeconds: number; scorePercentage: number };

  official_simulation_started: { attemptId: string; questionCount: number };
  official_simulation_completed: { attemptId: string; durationSeconds: number; scorePercentage: number };

  assessment_abandoned: { attemptId: string; mode: AssessmentMode; answeredCount: number; totalCount: number };
  assessment_expired: { attemptId: string; mode: AssessmentMode; answeredCount: number; totalCount: number };

  question_answered: { questionId: string; index: number; durationMs?: number };
  question_changed: { questionId: string; index: number };
  question_flagged: { questionId: string; index: number };
  question_unflagged: { questionId: string; index: number };

  remediation_selected: { evidenceId: string; reason: NivelacionReason; action: string };
  nivelacion_action_completed: { evidenceId: string; action: string; outcome?: string };

  sync_started: { pendingCount: number };
  sync_succeeded: { syncedCount: number; durationMs: number };
  sync_failed: { pendingCount: number; errorClassification: string; retryCount?: number };
  conflict_detected: { serverRevision: number; clientRevision: number };
  conflict_resolved: { resolutionStrategy: 'server' | 'client_rebase' | 'union' };

  entitlement_denied: { capability: string; currentTier: 'free' | 'pro'; requiredTier: 'pro' };
  paywall_viewed: { trigger: string };

  client_error_captured: { errorClassification: string; component?: string };
  service_health_checked: { status: 'healthy' | 'degraded' | 'unhealthy'; responseTimeMs: number };
}

export interface TelemetryEvent<T extends TelemetryEventName = TelemetryEventName> {
  id: string;
  name: T;
  stage: FunnelStage;
  occurredAt: string;
  platform: PlatformId;
  anonymousSessionId: string;
  learnerId?: string;
  payload: T extends keyof TelemetryEventPayloads ? TelemetryEventPayloads[T] : Record<string, unknown>;
  /** Client-side idempotency key to prevent accidental duplicate submission. */
  idempotencyKey?: string;
}

/** Legacy-compatible LearningEvent alias */
export type LearningEvent = TelemetryEvent;

/** Map event names to canonical funnel stages */
export function getFunnelStageForEvent(name: TelemetryEventName): FunnelStage {
  switch (name) {
    case 'session_started':
    case 'session_authenticated':
    case 'session_signed_out':
    case 'diagnostic_started':
    case 'diagnostic_completed':
      return 'activation';

    case 'lesson_opened':
    case 'lesson_completed':
    case 'evidence_practiced':
    case 'remediation_selected':
    case 'nivelacion_action_completed':
      return 'learning';

    case 'mock_started':
    case 'mock_completed':
    case 'official_simulation_started':
    case 'official_simulation_completed':
    case 'assessment_abandoned':
    case 'assessment_expired':
    case 'question_answered':
    case 'question_changed':
    case 'question_flagged':
    case 'question_unflagged':
      return 'assessment';

    case 'entitlement_denied':
    case 'paywall_viewed':
      return 'commercial';

    case 'sync_started':
    case 'sync_succeeded':
    case 'sync_failed':
    case 'conflict_detected':
    case 'conflict_resolved':
    case 'client_error_captured':
    case 'service_health_checked':
      return 'operational';

    default:
      return 'operational';
  }
}

/** Security & privacy guardrail: strictly scrubs sensitive data from telemetry event payloads */
const SENSITIVE_KEY_PATTERNS = [
  /password/i,
  /token/i,
  /secret/i,
  /auth/i,
  /credential/i,
  /bearer/i,
  /email/i,
  /cedula/i,
  /name/i,
  /optionText/i,
  /solution/i,
  /stem/i,
];

export function sanitizeTelemetryPayload<T extends Record<string, unknown>>(payload: T): T {
  if (!payload || typeof payload !== 'object') return payload;
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    const isSensitive = SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
    if (isSensitive) {
      continue;
    }
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeTelemetryPayload(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized as T;
}

/** Factory to construct a sanitized telemetry event */
export function createTelemetryEvent<T extends TelemetryEventName>(params: {
  name: T;
  platform: PlatformId;
  anonymousSessionId: string;
  learnerId?: string;
  payload: T extends keyof TelemetryEventPayloads ? TelemetryEventPayloads[T] : Record<string, unknown>;
  id?: string;
  occurredAt?: string;
  idempotencyKey?: string;
}): TelemetryEvent<T> {
  const sanitizedPayload = sanitizeTelemetryPayload(params.payload as Record<string, unknown>);
  return {
    id: params.id ?? `evt_${Math.random().toString(36).slice(2, 11)}_${Date.now()}`,
    name: params.name,
    stage: getFunnelStageForEvent(params.name),
    occurredAt: params.occurredAt ?? new Date().toISOString(),
    platform: params.platform,
    anonymousSessionId: params.anonymousSessionId,
    learnerId: params.learnerId,
    payload: sanitizedPayload as any,
    idempotencyKey: params.idempotencyKey,
  };
}

/** Sink interface for telemetry emission */
export interface AnalyticsSink {
  enqueue(event: TelemetryEvent): Promise<void>;
  flush(): Promise<void>;
}

/** In-memory buffering sink with batching and deduplication */
export class BufferingAnalyticsSink implements AnalyticsSink {
  private buffer: TelemetryEvent[] = [];
  private seenKeys = new Set<string>();
  private readonly maxBufferSize: number;
  private readonly onFlush: (batch: TelemetryEvent[]) => Promise<void>;

  constructor(options: { maxBufferSize?: number; onFlush: (batch: TelemetryEvent[]) => Promise<void> }) {
    this.maxBufferSize = options.maxBufferSize ?? 50;
    this.onFlush = options.onFlush;
  }

  async enqueue(event: TelemetryEvent): Promise<void> {
    const dedupeKey = event.idempotencyKey ?? `${event.name}:${event.anonymousSessionId}:${event.occurredAt}`;
    if (this.seenKeys.has(dedupeKey)) {
      return;
    }
    this.seenKeys.add(dedupeKey);
    // Keep deduplication set reasonable in memory
    if (this.seenKeys.size > 1000) {
      this.seenKeys.clear();
    }

    this.buffer.push(event);
    if (this.buffer.length >= this.maxBufferSize) {
      await this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;
    const batch = [...this.buffer];
    this.buffer = [];
    try {
      await this.onFlush(batch);
    } catch (err) {
      // Re-insert failed batch to buffer if room allows
      this.buffer.unshift(...batch);
      throw err;
    }
  }

  get bufferedCount(): number {
    return this.buffer.length;
  }

  clear(): void {
    this.buffer = [];
    this.seenKeys.clear();
  }
}
