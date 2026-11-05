import type { AttemptEvent, ObservationQualification } from './types';

/**
 * Evaluates whether an attempt event is a qualifying observation for evidence mastery.
 *
 * Rules (from CONSOLIDATED DECISIONS v1 Section 6):
 * 1. Must be a first response (responseIndex === 0).
 * 2. Must be unassisted: no hints used before response (hintsUsedBeforeResponse === 0)
 *    and no explanation seen prior.
 * 3. Both correct and incorrect responses qualify.
 * 4. Must not be an official benchmark item (provenance !== 'official_reference').
 * 5. Must have known authorship eligibility (provenance !== 'legacy_unknown').
 * 6. Timestamp must be within the observation window (default 30 days) relative to reference clock.
 */
export function qualifyAttemptObservation(
  event: AttemptEvent,
  nowUtc: Date,
  windowDays = 30
): ObservationQualification {
  if (event.responseIndex > 0) {
    return { eligible: false, reason: 'retry_after_first' };
  }

  if (event.hintsUsedBeforeResponse > 0 || event.exposureFlags?.hasSeenExplanationBefore) {
    return { eligible: false, reason: 'hint_used' };
  }

  if (event.provenance === 'official_reference' || event.exposureFlags?.isBenchmarkItem) {
    return { eligible: false, reason: 'benchmark_item' };
  }

  if (event.provenance === 'legacy_unknown') {
    return { eligible: false, reason: 'legacy_unknown' };
  }

  const eventTime = new Date(event.timestamp).getTime();
  if (Number.isNaN(eventTime)) {
    return { eligible: false, reason: 'window_expired' };
  }

  const windowMs = windowDays * 24 * 60 * 60 * 1000;
  const ageMs = nowUtc.getTime() - eventTime;

  if (ageMs < 0 || ageMs > windowMs) {
    return { eligible: false, reason: 'window_expired' };
  }

  return { eligible: true, reason: 'unassisted_first_response' };
}
