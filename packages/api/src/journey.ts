import { LearnerJourney, AttemptOutbox, type JourneyCatalog, type StringStorage } from '@mep-ea/learning-runtime';
import { createPlatformApi, type AuthProvider, type ApiTransport } from './index';
import { createCatalogSource } from './catalog';
import type { CatalogPackage } from './contracts';

/** Shared Web/Expo composition seam. Local execution needs no session or reachable service. */
export function createOfflineJourney(catalog: JourneyCatalog, storage: StringStorage, learnerId: string,
  service?: { auth: AuthProvider; transport: ApiTransport }) {
  const api = service ? createPlatformApi(service.auth, service.transport) : null;
  const outbox = api ? new AttemptOutbox(storage, learnerId, { push: attempt => api.submitAttempt(attempt) }) : undefined;
  const journey = new LearnerJourney(catalog, storage, learnerId, undefined, undefined, outbox);
  return { journey, synchronize: () => journey.synchronize(), api };
}

/** Resolve service/cached content before starting a new journey; never swap an active assessment. */
export async function createServiceJourney(cached: CatalogPackage, storage: StringStorage, learnerId: string,
  service?: { auth: AuthProvider; transport: ApiTransport }, channel = cached.channel) {
  const api = service ? createPlatformApi(service.auth, service.transport) : null;
  const content = await createCatalogSource(api, cached).load(channel);
  return createOfflineJourney({ registry: content.registry, blueprints: content.blueprints,
    allowDraftPreview: content.channel === 'development' }, storage, learnerId, service);
}
