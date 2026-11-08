import type { ApiRequest, ApiResponse, AuthSession, AttemptRecord, CatalogPackage, LearningContinuity } from '@mep-ea/api';
import { parseCatalogPackage, requireSession } from '@mep-ea/api';
import { resolveBlueprint } from '@mep-ea/content';
import { restoreAttempt, diagnose, remediate, calculateMastery, collectLearningEvidence, generateNivelacion } from '@mep-ea/learning-runtime';
import { object, text, integer, ensure } from '@mep-ea/validation';
import type { ContinuityRepository } from './continuity-repository';

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
  verifier: SessionVerifier; repository: AttemptRepository & Partial<ContinuityRepository>; catalog: CatalogPackage;
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
  const continuityRepository = options.repository as Partial<ContinuityRepository>;
  async function continuity(owner: string): Promise<LearningContinuity> {
    if (!continuityRepository.continuity) return fail(503);
    return continuityRepository.continuity(owner, records => {
      // Upgrade P3 records using exact server content when still available; unknown revisions contribute no invented evidence.
      const history = records.map(record => {
        if (record.learningEvidence) return record;
        const assessment = assessments.find(a => a.id === record.attempt.assessmentId && a.blueprint.version === record.attempt.assessmentVersion);
        return assessment ? { ...record, learningEvidence: collectLearningEvidence(assessment, record.attempt) } : record;
      });
      const mastery = calculateMastery(owner, history, new Date(now()).toISOString());
      // Restrict baseline recommendations to the current BXM Mathematics eligible surface.
      const domainIds = new Set(eligible.registry.questions.filter(q => q.programId === 'bxm' && q.subjectId === 'matematica').map(q => q.domainId));
      const taxonomy = { ...eligible.registry.taxonomy, evidences: eligible.registry.taxonomy.evidences.filter(e => domainIds.has(e.domainId)) };
      return { schemaVersion: 1, mastery, plan: generateNivelacion(mastery, history, taxonomy, eligible.registry.questions) };
    });
  }
  return { async send(request: ApiRequest): Promise<ApiResponse> {
    try {
      const authorization = Object.entries(request.headers).find(([k]) => k.toLowerCase() === 'authorization')?.[1];
      const token = authorization?.match(/^Bearer (\S+)$/)?.[1];
      const verified = token ? await options.verifier.verify(token) : null;
      if (!verified) fail(401);
      let session;
      try { session = requireSession(verified!, now()); } catch { return { status: 401, body: { error: 'unauthorized' } }; }
      if (!session.roles.includes('learner')) fail(403);
      if (request.method === 'GET' && request.path === '/v1/learning-continuity') return { status: 200, body: await continuity(session.learnerId) };
      if (request.method === 'GET' && request.path === '/v1/catalog/production') return { status: 200, body: production };
      if (request.method === 'GET' && request.path === '/v1/catalog/development') {
        if (!options.allowDevelopment || source.channel !== 'development') fail(404);
        return { status: 200, body: source };
      }
      const route = request.path.match(/^\/v1\/(attempts|drafts)\/([^/]+)$/);
      if (!route) fail(404);
      let id: string;
      try { id = decodeURIComponent(route![2]); } catch { fail(400); }
      if (!id!.trim() || id!.length > 256) fail(400);
      if (route![1] === 'drafts') {
        if (!continuityRepository.getDraft || !continuityRepository.writeDraft) fail(503);
        if (request.method === 'GET') return { status: 200, body: await continuityRepository.getDraft!(session.learnerId, id!) };
        let write;
        try {
          const raw = object(JSON.parse(request.body ?? ''), 'draft');
          ensure(raw.schemaVersion === 1, 'draft', 'unsupported schema');
          const candidate = object(raw.attempt, 'draft.attempt');
          if (candidate.learnerId !== session.learnerId) fail(403);
          if (candidate.id !== id! || candidate.status !== 'in_progress') fail(400);
          const assessment = assessments.find(a => a.id === candidate.assessmentId);
          if (!assessment) fail(422);
          const attempt = restoreAttempt(assessment!, candidate, session.learnerId, id!);
          ensure(Date.parse(attempt.updatedAt) <= now() + 300_000, 'draft', 'future timestamp');
          const baseRevision = integer(raw.baseRevision, 'draft.baseRevision');
          const deviceId = text(raw.deviceId, 'draft.deviceId'); ensure(deviceId.length <= 256, 'draft.deviceId', 'too long');
          write = { schemaVersion: 1 as const, attempt, baseRevision, deviceId };
        } catch (error) {
          if (error instanceof ServiceFailure) throw error;
          fail(422);
        }
        const result = await continuityRepository.writeDraft!(write!, new Date(now()).toISOString());
        return result.accepted ? { status: 200, body: result.record } : { status: 409, body: result.state };
      }
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
          result: { diagnostic, remediation: remediate(assessment!, attempt, diagnostic) }, learningEvidence: collectLearningEvidence(assessment!, attempt) };
        const stored = await options.repository.insert(record);
        if (canonical(stored.attempt) !== canonical(attempt)) fail(409);
        // If projection storage fails, return 503. The immutable retry repairs it after an outage.
        if (continuityRepository.continuity) await continuity(session.learnerId);
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
