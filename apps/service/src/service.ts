import type { ApiRequest, ApiResponse, AuthSession, AttemptRecord, CatalogPackage } from '@mep-ea/api';
import { parseCatalogPackage, requireSession } from '@mep-ea/api';
import { resolveBlueprint } from '@mep-ea/content';
import { restoreAttempt, diagnose, remediate } from '@mep-ea/learning-runtime';
import { object, text } from '@mep-ea/validation';

/** Implementations must insert atomically, returning the existing record on duplicate owner/id. */
export interface AttemptRepository {
  find(learnerId: string, attemptId: string): Promise<AttemptRecord | null>;
  insert(record: AttemptRecord): Promise<AttemptRecord>;
}
/** Verifies signature/issuer/audience/expiry/revocation in the chosen provider, never client claims. */
export interface SessionVerifier { verify(accessToken: string): Promise<AuthSession | null> }
export function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`).join(',')}}`;
  return JSON.stringify(value);
}
class ServiceFailure extends Error { constructor(readonly status: number) { super(); } }
export function createService(options: {
  verifier: SessionVerifier; repository: AttemptRepository; catalog: CatalogPackage;
  allowDevelopment?: boolean; now?: () => number;
}) {
  const source = parseCatalogPackage(options.catalog);
  const now = options.now ?? Date.now;
  const production = parseCatalogPackage({ ...source, channel: 'production',
    registry: { ...source.registry, questions: source.registry.questions.filter(q => q.publication.status === 'published') },
    blueprints: source.blueprints.filter(b => {
      try { resolveBlueprint(b, { ...source.registry, questions: source.registry.questions.filter(q => q.publication.status === 'published') }); return true; }
      catch { return false; }
    }) });
  const eligible = options.allowDevelopment ? source : production;
  const assessments = eligible.blueprints.map(b => resolveBlueprint(b, eligible.registry, { allowDraftPreview: options.allowDevelopment }));
  const fail = (status: number): never => { throw new ServiceFailure(status); };
  return { async send(request: ApiRequest): Promise<ApiResponse> {
    try {
      const authorization = Object.entries(request.headers).find(([k]) => k.toLowerCase() === 'authorization')?.[1];
      const token = authorization?.match(/^Bearer (\S+)$/)?.[1];
      const verified = token ? await options.verifier.verify(token) : null;
      if (!verified) fail(401);
      let session;
      try { session = requireSession(verified!, now()); } catch { return { status: 401, body: { error: 'unauthorized' } }; }
      if (!session.roles.includes('learner')) fail(403);
      if (request.method === 'GET' && request.path === '/v1/catalog/production') return { status: 200, body: production };
      if (request.method === 'GET' && request.path === '/v1/catalog/development') {
        if (!options.allowDevelopment || source.channel !== 'development') fail(404);
        return { status: 200, body: source };
      }
      const route = request.path.match(/^\/v1\/attempts\/([^/]+)$/);
      if (!route) fail(404);
      let id: string;
      try { id = decodeURIComponent(route![1]); } catch { fail(400); }
      if (!id!.trim() || id!.length > 256) fail(400);
      if (request.method === 'GET') {
        const record = await options.repository.find(session.learnerId, id!);
        return record ? { status: 200, body: record } : { status: 404, body: { error: 'not_found' } };
      }
      if (request.method !== 'PUT') fail(405);
      const idempotency = Object.entries(request.headers).find(([k]) => k.toLowerCase() === 'idempotency-key')?.[1];
      if (idempotency !== `${session.learnerId}:${id!}`) fail(400);
      let attempt;
      try {
        const raw = object(JSON.parse(request.body ?? ''), 'attempt');
        if (raw.learnerId !== session.learnerId) fail(403);
        if (raw.id !== id! || raw.status !== 'submitted') fail(400);
        const assessmentId = text(raw.assessmentId, 'assessmentId');
        const assessment = assessments.find(a => a.id === assessmentId);
        if (!assessment) fail(422);
        attempt = restoreAttempt(assessment!, raw, session.learnerId, id!);
        if (Date.parse(attempt.updatedAt) > now() + 300_000) fail(422);
        const diagnostic = diagnose(assessment!, attempt);
        const record: AttemptRecord = { schemaVersion: 1, revision: 1, attempt, receivedAt: new Date(now()).toISOString(),
          result: { diagnostic, remediation: remediate(assessment!, attempt, diagnostic) } };
        const stored = await options.repository.insert(record);
        if (canonical(stored.attempt) !== canonical(attempt)) fail(409);
        return { status: 200, body: stored };
      } catch (error) {
        if (error instanceof ServiceFailure) throw error;
        // Validation failures are client errors; repository failures are handled separately below.
        if (error instanceof SyntaxError || (error instanceof Error && error.name === 'ValidationError')) fail(422);
        throw error;
      }
    } catch (error) {
      const status = error instanceof ServiceFailure ? error.status : 503;
      return { status, body: { error: status === 503 ? 'service_unavailable' : `request_rejected_${status}` } };
    }
  } };
}
