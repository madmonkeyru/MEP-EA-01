import type { AssessmentMode } from '@mep-ea/domain';
/** No answers, tokens, names or raw learner identifiers in telemetry contracts. */
export interface LearningEvent {
  id: string; occurredAt: string; name: 'assessment_started' | 'assessment_resumed' | 'assessment_submitted';
  anonymousSessionId: string; mode: AssessmentMode; platform: 'web' | 'ios' | 'android';
}
export interface AnalyticsSink { enqueue(event: LearningEvent): Promise<void>; flush(): Promise<void> }
