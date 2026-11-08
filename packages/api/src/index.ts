import type { Attempt } from '@mep-ea/domain';
import { parseCatalogPackage, type AttemptRecord, type CatalogPackage } from './contracts';
export * from './contracts';
export * from './journey';
export * from './transport';
export * from './catalog';

export type AuthSession = { kind: 'anonymous'; learnerId: string; tier: 'free' } | {
  kind: 'authenticated'; learnerId: string; tier: 'free' | 'premium'; roles: ('learner' | 'content_admin' | 'platform_admin')[];
  accessToken: string; expiresAt: string;
};
export interface AuthProvider { getSession(): Promise<AuthSession>; signOut(): Promise<void> }
export interface ApiRequest { method: 'GET' | 'PUT'; path: string; headers: Record<string, string>; body?: string }
export interface ApiResponse { status: number; body: unknown }
export interface ApiTransport { send(request: ApiRequest): Promise<ApiResponse> }
export interface PlatformApi {
  submitAttempt(attempt: Attempt): Promise<void>;
  getAttempt(id: string): Promise<AttemptRecord>;
  getCatalog(channel?: CatalogPackage['channel']): Promise<CatalogPackage>;
}
export class AuthenticationRequired extends Error {}
export class ApiError extends Error {
  constructor(readonly status: number) { super(`Service request failed (${status})`); }
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
    if (response.status < 200 || response.status >= 300) throw new ApiError(response.status);
  },
  async getAttempt(id) { return await read(`/v1/attempts/${encodeURIComponent(id)}`) as AttemptRecord; },
  async getCatalog(channel = 'production') { return parseCatalogPackage(await read(`/v1/catalog/${channel}`)); },
  };
  async function read(path: string) {
    const session = requireSession(await auth.getSession(), now());
    const response = await transport.send({ method: 'GET', path, headers: { Authorization: `Bearer ${session.accessToken}` } });
    if (response.status < 200 || response.status >= 300) throw new ApiError(response.status);
    return response.body;
  }
}
