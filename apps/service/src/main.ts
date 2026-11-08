import { timingSafeEqual } from 'node:crypto';
import { resolve } from 'node:path';
import { createLearningPreviewCatalog } from '@mep-ea/content/expansion';
import { createService } from './service';
import { createFileAttemptRepository } from './repository';
import { createHttpServer } from './http';

const token = process.env.MEP_DEV_TOKEN;
if (!token || token.length < 32) throw new Error('Set MEP_DEV_TOKEN to at least 32 random characters; development use only.');
const learnerId = process.env.MEP_DEV_LEARNER_ID ?? 'p3-development';
const catalog = createLearningPreviewCatalog();
const service = createService({
  catalog: { schemaVersion: 1, version: 'p2-development-v1', channel: 'development', registry: catalog.registry, blueprints: catalog.blueprints },
  allowDevelopment: process.env.MEP_ALLOW_DRAFT_PREVIEW === 'true',
  repository: createFileAttemptRepository(resolve(process.env.MEP_DATA_DIR ?? 'artifacts/p3-service-data')),
  verifier: { async verify(candidate) {
    const expected = Buffer.from(token); const received = Buffer.from(candidate);
    return expected.length === received.length && timingSafeEqual(expected, received)
      ? { kind: 'authenticated', learnerId, tier: 'free', roles: ['learner'], accessToken: candidate,
        expiresAt: new Date(Date.now() + 60_000).toISOString() } : null;
  } },
});
const port = Number(process.env.MEP_SERVICE_PORT ?? 8787);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid service port');
createHttpServer(service).listen(port, '127.0.0.1', () => console.log(`P3 development service listening on http://127.0.0.1:${port}`));
