import type { Assessment, Attempt } from '@mep-ea/domain';
import { parseCatalogPackage, type AttemptRecord, type CatalogPackage, type LearningContinuity, type DraftWrite, type DraftRecord, type DraftState } from './contracts';
export * from './contracts';
export * from './journey';
export * from './transport';
export * from './catalog';
export * from './drafts';
export * from './localPlatformApi';

export type AuthSession = { kind: 'anonymous'; learnerId: string; tier: 'free' } | {
  kind: 'authenticated'; learnerId: string; tier: 'free' | 'premium'; roles: ('learner' | 'content_admin' | 'platform_admin')[];
  accessToken: string; expiresAt: string;
};
export interface AuthProvider { getSession(): Promise<AuthSession>; signOut(): Promise<void> }
export interface ApiRequest { method: 'GET' | 'POST' | 'PUT'; path: string; headers: Record<string, string>; body?: string }
export interface ApiResponse { status: number; body: unknown }
export interface ApiTransport { send(request: ApiRequest): Promise<ApiResponse> }

export interface AuthRegisterPayload { username: string; password: string; tier?: 'free' | 'premium' }
export interface AuthLoginPayload { username: string; password: string }
export interface AuthResponse {
  token: string;
  expiresAt: string;
  session: { learnerId: string; username: string; tier: 'free' | 'premium'; roles: ('learner' | 'content_admin' | 'platform_admin')[] };
}

export interface CompileAssessmentPayload {
  programId: string;
  subjectId: string;
  mode: 'diagnostic' | 'mock' | 'simulation';
  seed?: number;
}

export interface TelemetryIngestResponse {
  accepted: number;
  duplicate: number;
  rejected: number;
}

export interface LongitudinalMetricsResponse {
  metrics: {
    learnerId: string;
    evaluatedAt: string;
    totalAttempts: number;
    firstAttemptAt: string | null;
    lastAttemptAt: string | null;
    loopCounts: { diagnostic: number; practice: number; mock: number; simulation: number };
    overallAccuracy: number | null;
    domainCoverage: Record<string, { total: number; correct: number; distinctFamilies: number }>;
    habits: { averageDurationSeconds: number; unansweredRate: number; totalQuestionsEncountered: number };
    loopStage: 'diagnostic_needed' | 'remediation_in_progress' | 'ready_for_retest' | 'exam_ready';
  };
}

export interface PlatformApi {
  submitAttempt(attempt: Attempt): Promise<void>;
  getAttempt(id: string): Promise<AttemptRecord>;
  getCatalog(channel?: CatalogPackage['channel']): Promise<CatalogPackage>;
  getLearningContinuity(): Promise<LearningContinuity>;
  getDraft(id: string): Promise<DraftState>;
  saveDraft(write: DraftWrite): Promise<DraftRecord>;
  compileAssessment(payload: CompileAssessmentPayload): Promise<Assessment>;
  register(payload: AuthRegisterPayload): Promise<AuthResponse>;
  login(payload: AuthLoginPayload): Promise<AuthResponse>;
  getSession(): Promise<AuthSession>;
  sendTelemetry(events: unknown[]): Promise<TelemetryIngestResponse>;
  getLongitudinalMetrics(): Promise<LongitudinalMetricsResponse['metrics']>;
}
export class AuthenticationRequired extends Error {}
export class EntitlementRequired extends Error {
  constructor(readonly requiredTier: 'free' | 'premium', readonly reasonEs?: string) {
    super(`Entitlement required: ${requiredTier}`);
  }
}
export class ApiError extends Error {
  constructor(readonly status: number, readonly body?: unknown) { super(`Service request failed (${status})`); }
}
export function requireSession(session: AuthSession, now: number) {
  if (session.kind !== 'authenticated' || !session.learnerId.trim() || !session.accessToken.trim() ||
    !Number.isFinite(Date.parse(session.expiresAt)) || Date.parse(session.expiresAt) <= now)
    throw new AuthenticationRequired('Valid authenticated session required');
  return session;
}
/** Transport and credentials are injected. Native secure token storage belongs in the client adapter. */
export function createPlatformApi(auth: AuthProvider, transport: ApiTransport, now = () => Date.now()): PlatformApi {
  return { async submitAttempt(attempt) {
    const session = await auth.getSession();
    if (session.kind !== 'authenticated' || !session.accessToken.trim() || !Number.isFinite(Date.parse(session.expiresAt)) || Date.parse(session.expiresAt) <= now()) throw new AuthenticationRequired('Valid authenticated session required');
    if (attempt.learnerId !== session.learnerId || !session.roles.includes('learner')) throw new AuthenticationRequired('Attempt owner must match learner session');
    if (attempt.status !== 'submitted') throw new Error('Submit the local assessment first');
    const response = await transport.send({ method: 'PUT', path: `/v1/attempts/${encodeURIComponent(attempt.id)}`,
      headers: { Authorization: `Bearer ${session.accessToken}`, 'Content-Type': 'application/json', 'Idempotency-Key': `${attempt.learnerId}:${attempt.id}` }, body: JSON.stringify(attempt) });
    if (response.status === 403 && (response.body as { error?: string })?.error === 'entitlement_required') {
      const b = response.body as { requiredTier: 'premium'; reasonEs?: string };
      throw new EntitlementRequired(b.requiredTier, b.reasonEs);
    }
    if (response.status < 200 || response.status >= 300) throw new ApiError(response.status, response.body);
  },
  async getAttempt(id) { return await read(`/v1/attempts/${encodeURIComponent(id)}`) as AttemptRecord; },
  async getCatalog(channel = 'production') { return parseCatalogPackage(await read(`/v1/catalog/${channel}`)); },
  async getLearningContinuity() { return await read('/v1/learning-continuity') as LearningContinuity; },
  async getDraft(id) { return await read(`/v1/drafts/${encodeURIComponent(id)}`) as DraftState; },
  async saveDraft(write) {
    const session = requireSession(await auth.getSession(), now());
    if (write.attempt.learnerId !== session.learnerId || !session.roles.includes('learner')) throw new AuthenticationRequired('Draft owner must match learner session');
    const response = await transport.send({ method: 'PUT', path: `/v1/drafts/${encodeURIComponent(write.attempt.id)}`,
      headers: { Authorization: `Bearer ${session.accessToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify(write) });
    if (response.status === 403 && (response.body as { error?: string })?.error === 'entitlement_required') {
      const b = response.body as { requiredTier: 'premium'; reasonEs?: string };
      throw new EntitlementRequired(b.requiredTier, b.reasonEs);
    }
    if (response.status !== 200) throw new ApiError(response.status, response.body);
    return response.body as DraftRecord;
  },
  async compileAssessment(payload) {
    const session = requireSession(await auth.getSession(), now());
    const response = await transport.send({
      method: 'POST',
      path: '/v1/assessments/compile',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (response.status === 403 && (response.body as { error?: string })?.error === 'entitlement_required') {
      const b = response.body as { requiredTier: 'premium'; reasonEs?: string };
      throw new EntitlementRequired(b.requiredTier, b.reasonEs);
    }
    if (response.status !== 200) throw new ApiError(response.status, response.body);
    return (response.body as { assessment: Assessment }).assessment;
  },
  async register(payload) {
    const response = await transport.send({
      method: 'POST',
      path: '/v1/auth/register',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (response.status !== 200) throw new ApiError(response.status, response.body);
    return response.body as AuthResponse;
  },
  async login(payload) {
    const response = await transport.send({
      method: 'POST',
      path: '/v1/auth/login',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (response.status !== 200) throw new ApiError(response.status, response.body);
    return response.body as AuthResponse;
  },
  async getSession() {
    return auth.getSession();
  },
  async sendTelemetry(events: unknown[]) {
    const session = await auth.getSession();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (session.kind === 'authenticated' && session.accessToken) {
      headers.Authorization = `Bearer ${session.accessToken}`;
    }
    const response = await transport.send({
      method: 'POST',
      path: '/v1/telemetry/events',
      headers,
      body: JSON.stringify({ events }),
    });
    if (response.status !== 200) throw new ApiError(response.status, response.body);
    return response.body as TelemetryIngestResponse;
  },
  async getLongitudinalMetrics() {
    requireSession(await auth.getSession(), now());
    const res = await read('/v1/learners/me/progress/longitudinal') as { metrics: LongitudinalMetricsResponse['metrics'] };
    return res.metrics;
  },
  };
  async function read(path: string) {
    const session = requireSession(await auth.getSession(), now());
    const response = await transport.send({ method: 'GET', path, headers: { Authorization: `Bearer ${session.accessToken}` } });
    if (response.status === 403 && (response.body as { error?: string })?.error === 'entitlement_required') {
      const b = response.body as { requiredTier: 'premium'; reasonEs?: string };
      throw new EntitlementRequired(b.requiredTier, b.reasonEs);
    }
    if (response.status < 200 || response.status >= 300) throw new ApiError(response.status, response.body);
    return response.body;
  }
}

/** Local token-backed AuthProvider implementation for Web / Mobile clients */
export function createTokenAuthProvider(initialSession?: AuthSession): AuthProvider & { setSession(s: AuthSession): void } {
  let current: AuthSession = initialSession ?? { kind: 'anonymous', learnerId: 'p2-local', tier: 'free' };
  return {
    async getSession() { return current; },
    async signOut() { current = { kind: 'anonymous', learnerId: 'p2-local', tier: 'free' }; },
    setSession(s: AuthSession) { current = s; },
  };
}

export * from './platformCapabilities';
