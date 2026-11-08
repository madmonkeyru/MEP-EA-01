import type {
  ProvenanceStatus,
} from './qbe';

/**
 * M5.1 Content Lifecycle Stages
 * raw -> ingested -> parsed -> mapped -> validated -> reviewed -> approved -> published
 */
export type ContentLifecycleStage =
  | 'raw'
  | 'ingested'
  | 'parsed'
  | 'mapped'
  | 'validated'
  | 'reviewed'
  | 'approved'
  | 'published';

export type LifecycleSeverity = 'blocker' | 'warning' | 'info';

export interface LifecycleIssue {
  code: string;
  stage: ContentLifecycleStage;
  severity: LifecycleSeverity;
  message: string;
  field?: string;
  timestamp: string;
}

export interface LifecycleSignoff {
  reviewer_id: string;
  stage: 'reviewed' | 'approved';
  timestamp: string;
  notes?: string;
  signature?: string;
}

export interface LifecycleRecord {
  item_id: string;
  current_stage: ContentLifecycleStage;
  stage_history: {
    stage: ContentLifecycleStage;
    entered_at: string;
    completed_at?: string;
  }[];
  unresolved_blockers: LifecycleIssue[];
  warnings: LifecycleIssue[];
  signoffs: LifecycleSignoff[];
  is_publishable: boolean;
  provenance_status: ProvenanceStatus;
  last_transition_at: string;
}

export interface StageTransitionResult {
  success: boolean;
  item_id: string;
  previous_stage: ContentLifecycleStage;
  target_stage: ContentLifecycleStage;
  blockers: LifecycleIssue[];
  warnings: LifecycleIssue[];
  record: LifecycleRecord;
}
