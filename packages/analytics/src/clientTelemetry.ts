import type { PlatformId, TelemetryEventName, TelemetryEventPayloads } from './index';
import { createTelemetryEvent, BufferingAnalyticsSink } from './index';

export interface TelemetrySender {
  sendTelemetry(events: unknown[]): Promise<unknown>;
}

/**
 * Shared client telemetry controller for Web and Mobile foundation surfaces.
 * Enforces zero UI thread blocking, auto-buffering, and asynchronous background flushing.
 */
export class ClientTelemetryService {
  private sink: BufferingAnalyticsSink;
  private anonymousSessionId: string;
  private learnerId?: string;
  private readonly platform: PlatformId;

  constructor(options: {
    platform: PlatformId;
    api: TelemetrySender;
    anonymousSessionId?: string;
    learnerId?: string;
    maxBufferSize?: number;
  }) {
    this.platform = options.platform;
    this.anonymousSessionId = options.anonymousSessionId ?? `anon_${Math.random().toString(36).substring(2, 10)}`;
    this.learnerId = options.learnerId;

    this.sink = new BufferingAnalyticsSink({
      maxBufferSize: options.maxBufferSize ?? 10,
      onFlush: async (batch) => {
        try {
          await options.api.sendTelemetry(batch);
        } catch {
          // Non-blocking
        }
      },
    });
  }

  setLearnerId(id?: string) {
    this.learnerId = id;
  }

  setSessionId(id: string) {
    this.anonymousSessionId = id;
  }

  track<T extends TelemetryEventName>(
    name: T,
    payload: T extends keyof TelemetryEventPayloads ? TelemetryEventPayloads[T] : Record<string, unknown>
  ): void {
    const event = createTelemetryEvent({
      name,
      platform: this.platform,
      anonymousSessionId: this.anonymousSessionId,
      learnerId: this.learnerId,
      payload: payload as any,
    });

    this.sink.enqueue(event).catch(() => {});
  }

  async flush(): Promise<void> {
    try {
      await this.sink.flush();
    } catch {
      // ignore
    }
  }
}
