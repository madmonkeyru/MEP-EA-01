export class ValidationError extends Error {
  readonly path: string;
  constructor(path: string, message: string) {
    super(`${path}: ${message}`);
    this.name = 'ValidationError';
    this.path = path;
  }
}
export function ensure(condition: unknown, path: string, message: string): asserts condition {
  if (!condition) throw new ValidationError(path, message);
}
export function object(value: unknown, path: string): Record<string, unknown> {
  ensure(value !== null && typeof value === 'object' && !Array.isArray(value), path, 'expected object');
  return value as Record<string, unknown>;
}
export function text(value: unknown, path: string): string {
  ensure(typeof value === 'string' && value.trim().length > 0, path, 'expected nonempty string'); return value;
}
export function list(value: unknown, path: string): unknown[] {
  ensure(Array.isArray(value), path, 'expected array'); return value;
}
export function integer(value: unknown, path: string, minimum = 0): number {
  ensure(typeof value === 'number' && Number.isSafeInteger(value) && value >= minimum, path, `expected integer >= ${minimum}`); return value;
}
export function finite(value: unknown, path: string): number {
  ensure(typeof value === 'number' && Number.isFinite(value), path, 'expected finite number'); return value;
}
export function oneOf<T extends string>(value: unknown, values: readonly T[], path: string): T {
  ensure(typeof value === 'string' && values.includes(value as T), path, `expected ${values.join(' | ')}`); return value as T;
}
export function unique(values: string[], path: string) { ensure(new Set(values).size === values.length, path, 'duplicate identifiers'); }
export function timestamp(value: unknown, path: string): string {
  const result = text(value, path); ensure(Number.isFinite(Date.parse(result)), path, 'invalid timestamp'); return result;
}
