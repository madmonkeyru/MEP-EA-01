import { describe, expect, it, vi } from 'vitest';
import { createFoundationAssessment } from '@mep-ea/content/preview';
import { initializeAttempt, submitAttempt } from '@mep-ea/learning-runtime';
import { createPlatformApi, type AuthSession } from './index';

const now = '2026-11-08T12:00:00.000Z';
const assessment = createFoundationAssessment();
const attempt = submitAttempt(assessment, initializeAttempt(assessment, 'attempt', 'learner', now), now);
const authenticated: AuthSession = { kind: 'authenticated', learnerId: 'learner', tier: 'free', roles: ['learner'], accessToken: 'example-token', expiresAt: '2026-11-08T13:00:00Z' };
function setup(session: AuthSession) {
  const send = vi.fn().mockResolvedValue({ status: 204, body: null });
  return { send, api: createPlatformApi({ getSession: async () => session, signOut: async () => {} }, { send }, () => Date.parse(now)) };
}
describe('auth and API boundary', () => {
  it.each<AuthSession>([
    { kind: 'anonymous', learnerId: 'learner', tier: 'free' },
    { ...authenticated, expiresAt: '2020-01-01' },
    { ...authenticated, learnerId: 'another' },
    { ...authenticated, roles: ['content_admin'] },
  ])('rejects unauthenticated, expired or unauthorized writes before transport', async session => {
    const { api, send } = setup(session); await expect(api.submitAttempt(attempt)).rejects.toThrow(); expect(send).not.toHaveBeenCalled();
  });
  it('injects credentials at transport time and uses stable idempotency keys', async () => {
    const { api, send } = setup(authenticated); await api.submitAttempt(attempt);
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ method: 'PUT', path: '/v1/attempts/attempt',
      headers: expect.objectContaining({ Authorization: 'Bearer example-token', 'Idempotency-Key': 'learner:attempt' }) }));
    send.mockResolvedValue({ status: 503 }); await expect(api.submitAttempt(attempt)).rejects.toThrow('503');
  });
});
