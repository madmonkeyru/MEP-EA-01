import { createServer } from 'node:http';
import type { ApiRequest, ApiResponse } from '@mep-ea/api';

/** Loopback development host, no CORS credentials, no credential/request-body logging. */
export function createHttpServer(service: { send(request: ApiRequest): Promise<ApiResponse> }) {
  return createServer(async (request, response) => {
    response.setHeader('Content-Type', 'application/json');
    response.setHeader('Cache-Control', 'no-store');
    try {
      if (request.method !== 'GET' && request.method !== 'PUT') { response.writeHead(405).end(); return; }
      const chunks: Buffer[] = []; let bytes = 0;
      for await (const chunk of request) {
        bytes += chunk.length;
        if (bytes > 1_048_576) { response.writeHead(413).end(); return; }
        chunks.push(Buffer.from(chunk));
      }
      const headers = Object.fromEntries(Object.entries(request.headers).filter((entry): entry is [string, string] => typeof entry[1] === 'string'));
      const body = Buffer.concat(chunks).toString('utf8');
      const result = await service.send({ method: request.method, path: request.url ?? '/', headers, ...(body ? { body } : {}) });
      response.writeHead(result.status).end(JSON.stringify(result.body));
    } catch { response.writeHead(503).end(JSON.stringify({ error: 'service_unavailable' })); }
  });
}
