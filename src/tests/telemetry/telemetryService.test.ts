import { describe, it, expect, beforeEach } from 'vitest';
import { TelemetryService } from '../../services/telemetryService';
import type { TelemetryEventName } from '../../types/telemetry';

describe('M8: Product Analytics & Learning Funnel Telemetry', () => {
  let telemetry: TelemetryService;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    telemetry = new TelemetryService();
    telemetry.clear();
  });

  it('records standard telemetry events across canonical stages with required metadata', () => {
    const tracked = telemetry.trackActivation('diagnostic_started', {
      program_id: 'bxm',
      attempt_id: 'diag-001',
    });
    expect(tracked).toBe(true);

    const events = telemetry.getEvents();
    expect(events).toHaveLength(1);
    expect(events[0].event_name).toBe('diagnostic_started');
    expect(events[0].funnel_stage).toBe('activation');
    expect(events[0].user_id).toBeDefined();
    expect(events[0].session_id).toBeDefined();
    expect(events[0].timestamp).toBeDefined();
    expect(events[0].properties?.attempt_id).toBe('diag-001');
  });

  it('deduplicates identical semantic events fired within the idempotency window', () => {
    // First trigger
    const first = telemetry.trackLearning('lesson_completed', {
      lesson_id: 'lesson_circunferencia_01',
    });
    expect(first).toBe(true);

    // Immediate duplicate trigger (e.g. fast React re-render)
    const duplicate = telemetry.trackLearning('lesson_completed', {
      lesson_id: 'lesson_circunferencia_01',
    });
    expect(duplicate).toBe(false);

    // Different lesson should be allowed
    const different = telemetry.trackLearning('lesson_completed', {
      lesson_id: 'lesson_funcion_lineal_02',
    });
    expect(different).toBe(true);

    const events = telemetry.getEvents('learning');
    expect(events).toHaveLength(2);
  });

  it('correctly calculates step-by-step conversion and dropoff in funnel analysis', () => {
    const u1 = 'learner_alpha';
    const u2 = 'learner_beta';
    const u3 = 'learner_gamma';

    // Step 1: landing_viewed (3 users)
    telemetry.track('landing_viewed', 'activation', {}, u1);
    telemetry.track('landing_viewed', 'activation', {}, u2);
    telemetry.track('landing_viewed', 'activation', {}, u3);

    // Step 2: diagnostic_started (2 users)
    telemetry.track('diagnostic_started', 'activation', {}, u1);
    telemetry.track('diagnostic_started', 'activation', {}, u2);

    // Step 3: diagnostic_completed (1 user)
    telemetry.track('diagnostic_completed', 'activation', {}, u1);

    const steps: TelemetryEventName[] = [
      'landing_viewed',
      'diagnostic_started',
      'diagnostic_completed',
    ];
    const analysis = telemetry.analyzeFunnel('activation', steps);

    expect(analysis.funnel_stage).toBe('activation');
    expect(analysis.total_learners_entered).toBe(3);
    expect(analysis.steps).toHaveLength(3);

    // Step 1: 3 unique
    expect(analysis.steps[0].unique_learners).toBe(3);
    expect(analysis.steps[0].conversion_from_previous_step).toBe(1.0);

    // Step 2: 2 unique (2/3 = 0.667)
    expect(analysis.steps[1].unique_learners).toBe(2);
    expect(analysis.steps[1].conversion_from_previous_step).toBe(0.667);
    expect(analysis.steps[1].dropoff_from_previous_step).toBe(0.333);

    // Step 3: 1 unique (1/2 = 0.5)
    expect(analysis.steps[2].unique_learners).toBe(1);
    expect(analysis.steps[2].conversion_from_previous_step).toBe(0.5);

    // Overall stage completion: 1 / 3 = 0.333
    expect(analysis.stage_completion_rate).toBe(0.333);
  });

  it('notifies subscribers asynchronously without throwing if a subscriber fails', () => {
    let capturedEventName = '';
    const unsubscribe = telemetry.subscribe((event) => {
      capturedEventName = event.event_name;
      throw new Error('Subscriber error simulation'); // Should be caught cleanly
    });

    const tracked = telemetry.trackCommercial('premium_viewed', { source: 'results_page' });
    expect(tracked).toBe(true);
    expect(capturedEventName).toBe('premium_viewed');

    unsubscribe();
  });
});
