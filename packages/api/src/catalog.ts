import type { CatalogPackage } from './contracts';
import { parseCatalogPackage } from './contracts';
import type { PlatformApi } from './index';

/** Explicit cached package fallback; a production request can never fall back to draft preview. */
export function createCatalogSource(api: PlatformApi | null, cached: CatalogPackage) {
  const local = parseCatalogPackage(cached);
  return { async load(channel: CatalogPackage['channel'] = 'production'): Promise<CatalogPackage> {
    if (api) {
      try {
        const remote = await api.getCatalog(channel);
        if (remote.channel !== channel) throw new Error('Catalog channel mismatch');
        return remote;
      } catch {
        if (local.channel !== channel) throw new Error('No eligible offline content package');
      }
    }
    if (local.channel !== channel) throw new Error('No eligible offline content package');
    return local;
  } };
}
