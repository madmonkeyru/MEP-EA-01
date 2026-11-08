import type { ApiTransport, ApiRequest } from './index';

export interface FetchPort {
  (url: string, init: { method: string; headers: Record<string, string>; body?: string }): Promise<{
    status: number; json(): Promise<unknown>;
  }>;
}
/** Platform supplies fetch. HTTPS is mandatory except explicit loopback development. */
export function createFetchTransport(baseUrl: string, fetch: FetchPort, allowLoopbackDevelopment = false): ApiTransport {
  if (!/^https:\/\/[a-z0-9.-]+(?::\d+)?$/i.test(baseUrl) &&
    !(allowLoopbackDevelopment && /^http:\/\/127\.0\.0\.1:\d+$/.test(baseUrl))) throw new Error('Service origin must use HTTPS');
  return { async send(request: ApiRequest) {
    if (!request.path.startsWith('/v1/') || request.path.includes('..') || request.path.includes('#')) throw new Error('Invalid service path');
    const response = await fetch(`${baseUrl}${request.path}`, { method: request.method, headers: request.headers, ...(request.body ? { body: request.body } : {}) });
    return { status: response.status, body: response.status === 204 ? null : await response.json() };
  } };
}
