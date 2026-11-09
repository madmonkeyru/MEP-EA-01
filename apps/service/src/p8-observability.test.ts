import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createFileAttemptRepository } from './repository';
import { Logger, sanitizeLogContext } from './logger';
import { createTelemetryEvent } from '@mep-ea/analytics';

describe('P8 Operational Hardening: Persistence & Observability', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'p8-repo-test-'));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('records and deduplicates telemetry events idempotently in repository', async () => {
    const repo = createFileAttemptRepository(tempDir);
    const event1 = createTelemetryEvent({
      name: 'diagnostic_started',
      platform: 'web',
      anonymousSessionId: 'sess_1',
      learnerId: 'learner_p8',
      payload: { attemptId: 'att_1', questionCount: 20 },
      idempotencyKey: 'idemp_key_1',
    });
    const event2 = createTelemetryEvent({
      name: 'question_answered',
      platform: 'web',
      anonymousSessionId: 'sess_1',
      learnerId: 'learner_p8',
      payload: { questionId: 'q_1', index: 0 },
      idempotencyKey: 'idemp_key_2',
    });

    const batch1 = await repo.recordTelemetry([event1, event2]);
    expect(batch1.accepted).toBe(2);
    expect(batch1.duplicate).toBe(0);

    const batch2 = await repo.recordTelemetry([event1]);
    expect(batch2.accepted).toBe(0);
    expect(batch2.duplicate).toBe(1);

    const count = await repo.getTelemetryCount();
    expect(count).toBe(2);

    const diag = await repo.getDiagnostics();
    expect(diag.type).toBe('file_memory');
    expect(diag.totalTelemetryEvents).toBe(2);
  });

  it('scrubs sensitive credentials, tokens, and PII in logger context', () => {
    const rawContext: any = {
      action: 'login',
      password: 'password123',
      bearerToken: 'ey...',
      secretKey: 'xyz',
      authCode: '1234',
      userEmail: 'student@example.com',
      cedula: '1-1234-5678',
      safeMetric: 99,
      nested: {
        safeFlag: true,
        accessToken: 'forbidden',
      },
    };

    const sanitized = sanitizeLogContext(rawContext);
    expect(sanitized?.action).toBe('login');
    expect(sanitized?.safeMetric).toBe(99);
    expect(sanitized?.password).toBeUndefined();
    expect(sanitized?.bearerToken).toBeUndefined();
    expect(sanitized?.secretKey).toBeUndefined();
    expect(sanitized?.authCode).toBeUndefined();
    expect(sanitized?.userEmail).toBeUndefined();
    expect(sanitized?.cedula).toBeUndefined();
    expect(sanitized?.nested).toEqual({ safeFlag: true });
  });

  it('outputs structured log entries with correlation tracking', () => {
    const logger = new Logger('test-subsystem').withCorrelationId('req_corr_abc123');
    const entry = logger.info('Test operational event', { component: 'assessment_runner' });

    expect(entry.level).toBe('info');
    expect(entry.message).toContain('[test-subsystem] Test operational event');
    expect(entry.correlationId).toBe('req_corr_abc123');
    expect(entry.context).toEqual({ component: 'assessment_runner' });
    expect(entry.timestamp).toBeDefined();
  });
});
