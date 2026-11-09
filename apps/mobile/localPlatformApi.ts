import { createLocalPlatformApi, type StorageAdapter } from '@mep-ea/api';

export type MobileStorageAdapter = StorageAdapter;

export function createMobilePlatformApi(
  authProvider: any,
  catalog?: any,
  storage?: StorageAdapter
) {
  return createLocalPlatformApi(authProvider, catalog, storage);
}

export { createLocalPlatformApi, type StorageAdapter };
