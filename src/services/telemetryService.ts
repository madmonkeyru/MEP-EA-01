import { STORAGE_KEYS } from './storageRegistry';
import type {
  ActivationEventName,
  AssessmentEventName,
  CommercialEventName,
  FunnelAnalysisReport,
  FunnelStage,
  FunnelStepMetric,
  LearningEventName,
  TelemetryEvent,
  TelemetryEventName,
} from '../types/telemetry';

const STORAGE_TELEMETRY_KEY = STORAGE_KEYS.telemetry;
const MAX_LOCAL_EVENTS = 500;
const DEDUPLICATION_WINDOW_MS = 2000; // 2 seconds idempotency guard for identical semantic events

export class TelemetryService {
  private sessionId: string;
  private anonymousUserId: string;
  private eventBuffer: TelemetryEvent[] = [];
  private recentDispatches: Map<string, number> = new Map();
  private subscribers: Array<(event: TelemetryEvent) => void> = [];

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.anonymousUserId = this.getOrCreateAnonymousUserId();
    this.loadPersistedEvents();
  }

  private getOrCreateSessionId(): string {
    try {
      const key = STORAGE_KEYS.telemetrySession;
      let sid = sessionStorage.getItem(key);
      if (!sid) {
        sid = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        sessionStorage.setItem(key, sid);
      }
      return sid;
    } catch {
      return `sess_fallback_${Date.now()}`;
    }
  }

  private getOrCreateAnonymousUserId(): string {
    try {
      const key = STORAGE_KEYS.anonymousUser;
      let uid = localStorage.getItem(key);
      if (!uid) {
        uid = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem(key, uid);
      }
      return uid;
    } catch {
      return `anon_fallback_${Date.now()}`;
    }
  }

  private loadPersistedEvents(): void {
    try {
      const raw = localStorage.getItem(STORAGE_TELEMETRY_KEY);
      if (raw) {
        this.eventBuffer = JSON.parse(raw);
      }
    } catch {
      this.eventBuffer = [];
    }
  }

  private persistEvents(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const slice = this.eventBuffer.slice(-MAX_LOCAL_EVENTS);
        localStorage.setItem(STORAGE_TELEMETRY_KEY, JSON.stringify(slice));
      }
    } catch {
      // Telemetry failure should never break runtime
    }
  }

  public getUserId(): string {
    return this.anonymousUserId;
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Dispatches a privacy-conscious, deduplicated telemetry event.
   */
  public track(
    eventName: TelemetryEventName,
    funnelStage: FunnelStage,
    properties?: Record<string, string | number | boolean | null | undefined>,
    userIdOverride?: string
  ): boolean {
    try {
      const now = Date.now();
      const userId = userIdOverride || this.anonymousUserId;

      // Idempotency check: eventName + stage + userId + key props within DEDUPLICATION_WINDOW_MS
      const propKey = properties?.lesson_id || properties?.attempt_id || properties?.evidence_id || '';
      const dedupeKey = `${eventName}:${funnelStage}:${userId}:${propKey}`;

      const lastDispatch = this.recentDispatches.get(dedupeKey);
      if (lastDispatch && now - lastDispatch < DEDUPLICATION_WINDOW_MS) {
        return false; // Deduplicated
      }

      this.recentDispatches.set(dedupeKey, now);

      // Clean old dedupe entries
      if (this.recentDispatches.size > 200) {
        for (const [key, ts] of this.recentDispatches.entries()) {
          if (now - ts > 10000) {
            this.recentDispatches.delete(key);
          }
        }
      }

      const event: TelemetryEvent = {
        event_id: `evt_${now}_${Math.random().toString(36).substring(2, 7)}`,
        event_name: eventName,
        funnel_stage: funnelStage,
        user_id: userId,
        session_id: this.sessionId,
        timestamp: new Date(now).toISOString(),
        program_id: (properties?.program_id as string) || 'bxm',
        properties: properties || {},
      };

      this.eventBuffer.push(event);
      this.persistEvents();

      // Dispatch to external or testing subscribers
      this.subscribers.forEach((sub) => {
        try {
          sub(event);
        } catch {
          // ignore subscriber error
        }
      });

      return true;
    } catch {
      return false;
    }
  }

  // Convenient Stage Helpers
  public trackActivation(
    name: ActivationEventName,
    properties?: Record<string, string | number | boolean | null | undefined>
  ): boolean {
    return this.track(name, 'activation', properties);
  }

  public trackLearning(
    name: LearningEventName,
    properties?: Record<string, string | number | boolean | null | undefined>
  ): boolean {
    return this.track(name, 'learning', properties);
  }

  public trackAssessment(
    name: AssessmentEventName,
    properties?: Record<string, string | number | boolean | null | undefined>
  ): boolean {
    return this.track(name, 'assessment', properties);
  }

  public trackCommercial(
    name: CommercialEventName,
    properties?: Record<string, string | number | boolean | null | undefined>
  ): boolean {
    return this.track(name, 'commercial', properties);
  }

  public subscribe(listener: (event: TelemetryEvent) => void): () => void {
    this.subscribers.push(listener);
    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== listener);
    };
  }

  public getEvents(filterStage?: FunnelStage): TelemetryEvent[] {
    if (!filterStage) return [...this.eventBuffer];
    return this.eventBuffer.filter((e) => e.funnel_stage === filterStage);
  }

  public clear(): void {
    this.eventBuffer = [];
    this.recentDispatches.clear();
    try {
      localStorage.removeItem(STORAGE_TELEMETRY_KEY);
    } catch {
      // ignore
    }
  }

  /**
   * Analyzes step-by-step conversion and dropoff along canonical funnel stages.
   */
  public analyzeFunnel(stage: FunnelStage, expectedSteps: TelemetryEventName[]): FunnelAnalysisReport {
    const stageEvents = this.getEvents(stage);
    const steps: FunnelStepMetric[] = [];

    const learnersAtStep: Array<Set<string>> = expectedSteps.map(() => new Set<string>());

    expectedSteps.forEach((stepName, idx) => {
      const stepEvts = stageEvents.filter((e) => e.event_name === stepName);
      stepEvts.forEach((e) => learnersAtStep[idx].add(e.user_id));

      const currentUnique = learnersAtStep[idx].size;
      const prevUnique = idx === 0 ? currentUnique : learnersAtStep[idx - 1].size;

      const conversion = prevUnique > 0 ? Number((currentUnique / prevUnique).toFixed(3)) : 1.0;
      const dropoff = prevUnique > 0 ? Number((Math.max(0, prevUnique - currentUnique) / prevUnique).toFixed(3)) : 0.0;

      steps.push({
        event_name: stepName,
        total_events: stepEvts.length,
        unique_learners: currentUnique,
        conversion_from_previous_step: conversion,
        dropoff_from_previous_step: dropoff,
      });
    });

    const entered = steps.length > 0 ? steps[0].unique_learners : 0;
    const completed = steps.length > 0 ? steps[steps.length - 1].unique_learners : 0;
    const stageCompletionRate = entered > 0 ? Number((completed / entered).toFixed(3)) : 0.0;

    return {
      funnel_stage: stage,
      total_learners_entered: entered,
      steps,
      stage_completion_rate: stageCompletionRate,
      generated_at: new Date().toISOString(),
    };
  }
}

export const telemetryService = new TelemetryService();
