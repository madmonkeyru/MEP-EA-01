export type FunnelStage = 'activation' | 'learning' | 'assessment' | 'commercial';

export type ActivationEventName =
  | 'landing_viewed'
  | 'onboarding_started'
  | 'diagnostic_started'
  | 'diagnostic_completed'
  | 'first_practice_started';

export type LearningEventName =
  | 'lesson_started'
  | 'lesson_completed'
  | 'practice_started'
  | 'practice_completed'
  | 'mastery_changed';

export type AssessmentEventName =
  | 'simulation_started'
  | 'simulation_completed'
  | 'remediation_launched'
  | 'retest_completed';

export type CommercialEventName =
  | 'premium_viewed'
  | 'checkout_intent'
  | 'subscription_updated'
  | 'continued_usage';

export type TelemetryEventName =
  | ActivationEventName
  | LearningEventName
  | AssessmentEventName
  | CommercialEventName;

export interface TelemetryEvent {
  event_id: string;
  event_name: TelemetryEventName;
  funnel_stage: FunnelStage;
  user_id: string;
  session_id: string;
  timestamp: string;
  program_id?: string;
  properties?: Record<string, string | number | boolean | null | undefined>;
}

export interface FunnelStepMetric {
  event_name: TelemetryEventName;
  total_events: number;
  unique_learners: number;
  conversion_from_previous_step: number; // 0.0 - 1.0 (or 100%)
  dropoff_from_previous_step: number;
}

export interface FunnelAnalysisReport {
  funnel_stage: FunnelStage;
  total_learners_entered: number;
  steps: FunnelStepMetric[];
  stage_completion_rate: number;
  generated_at: string;
}
