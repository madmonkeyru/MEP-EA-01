import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { AddressInfo } from 'node:net';
import { describe, expect, it } from 'vitest';
import { createFoundationAssessment, createJourneyPreviewCatalog } from '@mep-ea/content/preview';
import { initializeAttempt, recordAnswer, submitAttempt, AttemptOutbox, LearnerJourney } from '@mep-ea/learning-runtime';
import { createPlatformApi, createFetchTransport, createCatalogSource, createServiceJourney, type AuthSession, type CatalogPackage, type ApiRequest } from '@mep-ea/api';
import { createService } from './service';
import { createFileAttemptRepository } from './repository';
import { createHttpServer } from './http';

const now = '2026-11-08T12:00:00.000Z';
const assessment = createFoundationAssessment();
const local = createJourneyPreviewCatalog();
const catalog: CatalogPackage = { schemaVersion: 1, version: 'contract-fixture-v1', channel: 'development', registry: local.registry, blueprints: local.blueprints };
const session: AuthSession = { kind: 'authenticated', learnerId: 'learner', tier: 'free', roles: ['learner'], accessToken: 'fixture-token', expiresAt: '2026-11-08T13:00:00Z' };
const attempt = submitAttempt(assessment, initializeAttempt(assessment, 'attempt', 'learner', now), now);
async function setup() {
  const directory = await mkdtemp(join(tmpdir(), 'mep-p3-'));
  const repository = createFileAttemptRepository(directory);
  const verifier = { verify: async (token: string) => token === 'fixture-token' ? session : token === 'other-token' ? { ...session, learnerId: 'other' } : null };
  const options = { repository, verifier, catalog, allowDevelopment: true, now: () => Date.parse(now) };
  const service = createService(options);
  const api = createPlatformApi({ getSession: async () => session, signOut: async () => {} }, service, options.now);
  return { directory, options, service, api };
}
const request = (body: unknown = attempt): ApiRequest => ({ method: 'PUT', path: '/v1/attempts/attempt',
  headers: { Authorization: 'Bearer fixture-token', 'Idempotency-Key': 'learner:attempt' }, body: JSON.stringify(body) });
function storage() {
  const data = new Map<string, string>();
  return { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => { data.set(key, value); }, removeItem: (key: string) => { data.delete(key); } };
}
describe('P3 real service contract', () => {
  it('persists across repository/service recreation, recomputes forged scores and returns diagnosis/remediation', async () => {
    const { api, options, directory } = await setup();
    await api.submitAttempt({ ...attempt, score: { ...attempt.score!, correct: 999 } });
    const restarted = createService({ ...options, repository: createFileAttemptRepository(directory) });
    const response = await restarted.send({ ...request(), method: 'GET', body: undefined });
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ revision: 1, attempt: { score: { correct: 0, total: 3 } },
      result: { diagnostic: { weakEvidenceIds: expect.any(Array) }, remediation: { learnerId: 'learner', nextStep: 'practice' } } });
  });
  it('deduplicates concurrent retries and rejects changed final submissions', async () => {
    const { service } = await setup();
    const responses = await Promise.all(Array.from({ length: 5 }, () => service.send(request())));
    expect(responses.map(r => r.status)).toEqual([200, 200, 200, 200, 200]);
    const changed = submitAttempt(assessment, recordAnswer(assessment, initializeAttempt(assessment, 'attempt', 'learner', now), assessment.questions[0].id, 'A', now), now);
    expect((await service.send(request(changed))).status).toBe(409);
  });
  it('enforces server identity, role, expiration, ownership and stable idempotency keys', async () => {
    const { service, options } = await setup();
    expect((await service.send({ ...request(), headers: {} })).status).toBe(401);
    expect((await service.send(request({ ...attempt, learnerId: 'other' }))).status).toBe(403);
    expect((await service.send({ ...request(), headers: { ...request().headers, 'Idempotency-Key': 'wrong' } })).status).toBe(400);
    for (const modified of [{ ...session, expiresAt: '2020-01-01' }, { ...session, roles: ['content_admin'] }]) {
      const restricted = createService({ ...options, verifier: { verify: async () => modified as AuthSession } });
      expect((await restricted.send(request())).status).toBe(modified.roles.includes('learner') ? 401 : 403);
    }
    await service.send(request());
    expect((await service.send({ method: 'GET', path: request().path, headers: { Authorization: 'Bearer other-token' } })).status).toBe(404);
  });
  it('rejects malformed state, unknown content revisions and in-progress writes', async () => {
    const { service } = await setup();
    for (const value of [{ ...attempt, schemaVersion: 2 }, { ...attempt, deadlineAt: now }, { ...attempt, answers: { fake: {} } }])
      expect((await service.send(request(value))).status).toBe(422);
    expect((await service.send(request({ ...attempt, assessmentId: 'unknown' }))).status).toBe(422);
    expect((await service.send(request({ ...attempt, status: 'in_progress' }))).status).toBe(400);
  });
  it('isolates draft packages from production, including offline fallback', async () => {
    const { api, options } = await setup();
    expect((await api.getCatalog('development')).registry.questions).toHaveLength(3);
    const published = await api.getCatalog();
    expect(published.registry.questions).toHaveLength(0); expect(published.blueprints).toHaveLength(0);
    expect((await createService({ ...options, allowDevelopment: false }).send({ method: 'GET', path: '/v1/catalog/development', headers: request().headers })).status).toBe(404);
    const fallback = createCatalogSource(null, catalog);
    expect((await fallback.load('development')).channel).toBe('development');
    await expect(fallback.load('production')).rejects.toThrow('eligible');
  });
  it('retains an offline outbox across recreation, then retries with fresh auth without storing credentials', async () => {
    const { api } = await setup(); const disk = storage(); let online = false;
    const remote = { push: async (value: typeof attempt) => { if (!online) throw new Error('offline'); await api.submitAttempt(value); } };
    const queue = new AttemptOutbox(disk, 'learner', remote);
    await queue.enqueue(attempt); expect(await queue.flush()).toEqual({ sent: 0, pending: 1 });
    expect(disk.getItem('mep-ea:v1:outbox:learner')).not.toContain('fixture-token');
    online = true;
    expect(await new AttemptOutbox(disk, 'learner', remote).flush()).toEqual({ sent: 1, pending: 0 });
    expect((await api.getAttempt('attempt')).attempt.id).toBe('attempt');
  });
  it('keeps local learning available during outage and repairs an enqueue interrupted after local commit', async () => {
    const disk = storage(); let failSave = true;
    const flaky = { ...disk, setItem: (key: string, value: string) => { if (key.includes('outbox') && failSave) throw new Error('disk unavailable'); disk.setItem(key, value); } };
    const remote = { push: async () => { throw new Error('offline'); } };
    const queue = new AttemptOutbox(flaky, 'learner', remote);
    const journey = new LearnerJourney(local, flaky, 'learner', () => now, () => 'attempt', queue);
    await journey.start(local.blueprints[0].id);
    expect((await journey.submit()).attempt.status).toBe('submitted');
    failSave = false;
    const reopened = new LearnerJourney(local, flaky, 'learner', () => now, () => 'next', new AttemptOutbox(flaky, 'learner', remote));
    expect((await reopened.resume())?.attempt.status).toBe('submitted');
    expect(await queue.flush()).toEqual({ sent: 0, pending: 1 });
  });
  it('crosses real HTTP using the shared fetch client and durable repository', async () => {
    const { service } = await setup(); const server = createHttpServer(service);
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
    try {
      const port = (server.address() as AddressInfo).port;
      const transport = createFetchTransport(`http://127.0.0.1:${port}`, fetch, true);
      const api = createPlatformApi({ getSession: async () => session, signOut: async () => {} }, transport, () => Date.parse(now));
      await api.submitAttempt(attempt); await api.submitAttempt(attempt);
      expect((await api.getAttempt('attempt')).attempt.score?.total).toBe(3);
      expect(() => createFetchTransport('http://example.com', fetch)).toThrow('HTTPS');
    } finally { await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())); }
  });
  it('uses the Web/Expo composition seam with an injected service and loads a service catalog for the runtime', async () => {
    const { service, options } = await setup(); const disk = storage();
    // The fixture clock is supplied at the provider boundary; app composition uses real time.
    const liveSession = { ...session, expiresAt: new Date(Date.now() + 60_000).toISOString() } as AuthSession;
    const liveService = createService({ ...options, now: Date.now, verifier: { verify: async () => liveSession } });
    const connected = await createServiceJourney(catalog, disk, 'learner', {
      auth: { getSession: async () => liveSession, signOut: async () => {} }, transport: liveService,
    });
    const delivered = await createCatalogSource(connected.api, catalog).load('development');
    expect(delivered.registry.questions).toHaveLength(3);
    await connected.journey.start(delivered.blueprints[0].id);
    await connected.journey.submit();
    expect(await connected.synchronize()).toEqual({ sent: 1, pending: 0 });
    expect((await service.send({ method: 'GET', path: '/v1/catalog/production', headers: request().headers })).status).toBe(200);
  });
  it('preserves an acknowledged write if the response is lost and retries with refreshed credentials', async () => {
    const { service } = await setup(); const disk = storage(); let dropResponse = true; let activeToken = 'expired-token';
    const api = createPlatformApi({ getSession: async () => ({ ...session, accessToken: activeToken }), signOut: async () => {} }, {
      async send(value) {
        const response = await service.send(value);
        if (response.status === 200 && dropResponse) { dropResponse = false; throw new Error('Response lost'); }
        return response;
      },
    }, () => Date.parse(now));
    const queue = new AttemptOutbox(disk, 'learner', { push: value => api.submitAttempt(value) });
    await queue.enqueue(attempt);
    expect(await queue.flush()).toEqual({ sent: 0, pending: 1 });
    activeToken = 'fixture-token';
    expect(await queue.flush()).toEqual({ sent: 0, pending: 1 });
    expect(await queue.flush()).toEqual({ sent: 1, pending: 0 });
    const unavailable = createService({ ...(await setup()).options, repository: {
      find: async () => { throw new Error('storage offline'); }, insert: async () => { throw new Error('storage offline'); },
    } });
    expect((await unavailable.send(request())).status).toBe(503);
  });
});

