import { describe, it, expect } from 'vitest';
import {
  createTelemetryEvent,
  sanitizeTelemetryPayload,
  getFunnelStageForEvent,
  BufferingAnalyticsSink,
  type TelemetryEvent,
} from './index';

describe('packages/analytics: Telemetry Taxonomy & Contracts', () => {
  it('correctly maps event names to canonical funnel stages', () => {
    expect(getFunnelStageForEvent('session_started')).toBe('activation');
    expect(getFunnelStageForEvent('diagnostic_completed')).toBe('activation');
    expect(getFunnelStageForEvent('lesson_opened')).toBe('learning');
    expect(getFunnelStageForEvent('remediation_selected')).toBe('learning');
    expect(getFunnelStageForEvent('mock_completed')).toBe('assessment');
    expect(getFunnelStageForEvent('question_flagged')).toBe('assessment');
    expect(getFunnelStageForEvent('entitlement_denied')).toBe('commercial');
    expect(getFunnelStageForEvent('sync_failed')).toBe('operational');
    expect(getFunnelStageForEvent('client_error_captured')).toBe('operational');
  });

  it('strictly scrubs sensitive fields (credentials, tokens, raw answers, PII)', () => {
    const dirtyPayload: any = {
      attemptId: 'att_123',
      password: 'super-secret-password',
      authToken: 'bearer-jwt-token',
      userEmail: 'student@example.com',
      cedula: '1-1234-5678',
      learnerName: 'Juan Perez',
      optionText: 'Authored answer text that should not leak',
      stem: 'Question stem text',
      nested: {
        safeField: 42,
        secretKey: 'topsecret',
      },
      questionCount: 20,
    };

    const sanitized = sanitizeTelemetryPayload(dirtyPayload);
    expect(sanitized.attemptId).toBe('att_123');
    expect(sanitized.questionCount).toBe(20);
    expect((sanitized as any).password).toBeUndefined();
    expect((sanitized as any).authToken).toBeUndefined();
    expect((sanitized as any).userEmail).toBeUndefined();
    expect((sanitized as any).cedula).toBeUndefined();
    expect((sanitized as any).learnerName).toBeUndefined();
    expect((sanitized as any).optionText).toBeUndefined();
    expect((sanitized as any).stem).toBeUndefined();
    expect(sanitized.nested).toEqual({ safeField: 42 });
  });

  it('creates sanitized telemetry events with required metadata', () => {
    const event = createTelemetryEvent({
      name: 'question_answered',
      platform: 'web',
      anonymousSessionId: 'sess_anon_999',
      learnerId: 'usr_abc',
      payload: {
        questionId: 'bxm-q-1',
        index: 3,
        durationMs: 4500,
        authToken: 'leaked-token',
      } as any,
    });

    expect(event.id).toBeDefined();
    expect(event.name).toBe('question_answered');
    expect(event.stage).toBe('assessment');
    expect(event.platform).toBe('web');
    expect(event.anonymousSessionId).toBe('sess_anon_999');
    expect(event.learnerId).toBe('usr_abc');
    expect(event.payload.questionId).toBe('bxm-q-1');
    expect(event.payload.index).toBe(3);
    expect((event.payload as any).authToken).toBeUndefined();
    expect(new Date(event.occurredAt).getTime()).toBeGreaterThan(0);
  });

  it('buffers and flushes events through BufferingAnalyticsSink', async () => {
    const flushedBatches: TelemetryEvent[][] = [];
    const sink = new BufferingAnalyticsSink({
      maxBufferSize: 3,
      onFlush: async (batch) => {
        flushedBatches.push(batch);
      },
    });

    const evt1 = createTelemetryEvent({
      name: 'diagnostic_started',
      platform: 'ios',
      anonymousSessionId: 'sess_1',
      payload: { attemptId: 'att_1', questionCount: 20 },
      idempotencyKey: 'k1',
    });
    const evt2 = createTelemetryEvent({
      name: 'question_answered',
      platform: 'ios',
      anonymousSessionId: 'sess_1',
      payload: { questionId: 'q1', index: 0 },
      idempotencyKey: 'k2',
    });

    await sink.enqueue(evt1);
    await sink.enqueue(evt2);
    expect(sink.bufferedCount).toBe(2);
    expect(flushedBatches.length).toBe(0);

    // Duplicate enqueue with same idempotency key is ignored
    await sink.enqueue(evt1);
    expect(sink.bufferedCount).toBe(2);

    const evt3 = createTelemetryEvent({
      name: 'diagnostic_completed',
      platform: 'ios',
      anonymousSessionId: 'sess_1',
      payload: { attemptId: 'att_1', durationSeconds: 600, scorePercentage: 80 },
      idempotencyKey: 'k3',
    });

    // Enqueue 3rd reaches maxBufferSize (3) and triggers auto flush
    await sink.enqueue(evt3);
    expect(sink.bufferedCount).toBe(0);
    expect(flushedBatches.length).toBe(1);
    expect(flushedBatches[0].length).toBe(3);
  });
});
