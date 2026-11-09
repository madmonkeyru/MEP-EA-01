export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  correlationId?: string;
  context?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

const FORBIDDEN_LOG_KEYS = [
  /password/i,
  /token/i,
  /secret/i,
  /auth/i,
  /credential/i,
  /bearer/i,
  /cedula/i,
  /email/i,
];

export function sanitizeLogContext(context?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!context || typeof context !== 'object') return undefined;
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(context)) {
    if (FORBIDDEN_LOG_KEYS.some((pattern) => pattern.test(key))) {
      continue;
    }
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeLogContext(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export class Logger {
  private correlationId?: string;

  constructor(private readonly prefix?: string, correlationId?: string) {
    this.correlationId = correlationId;
  }

  withCorrelationId(id: string): Logger {
    return new Logger(this.prefix, id);
  }

  private write(level: LogLevel, message: string, context?: Record<string, unknown>, err?: unknown): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message: this.prefix ? `[${this.prefix}] ${message}` : message,
      correlationId: this.correlationId,
      context: sanitizeLogContext(context),
      ...(err instanceof Error ? { error: { name: err.name, message: err.message, stack: err.stack } } : {}),
    };

    const serialized = JSON.stringify(entry);
    if (level === 'error') {
      console.error(serialized);
    } else if (level === 'warn') {
      console.warn(serialized);
    } else {
      console.log(serialized);
    }
    return entry;
  }

  debug(message: string, context?: Record<string, unknown>): LogEntry {
    return this.write('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>): LogEntry {
    return this.write('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>, err?: unknown): LogEntry {
    return this.write('warn', message, context, err);
  }

  error(message: string, err?: unknown, context?: Record<string, unknown>): LogEntry {
    return this.write('error', message, context, err);
  }
}

export const defaultLogger = new Logger('service');
