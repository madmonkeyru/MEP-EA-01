/**
 * P13 Platform Capability Contracts & Agnostic Adapters
 *
 * Defines platform-agnostic abstractions for:
 * 1. Storage / Persistence
 * 2. Navigation / Routing
 * 3. Network / Connectivity State
 * 4. Session & Platform Lifecycle
 */

export interface PlatformStorage {
  getItem(key: string): string | null | Promise<string | null>;
  setItem(key: string, value: string): void | Promise<void>;
  removeItem(key: string): void | Promise<void>;
}

export type PlatformTarget = 'web' | 'mobile' | 'test';

export interface EducationalRoute {
  tab: 'aprender' | 'practicar' | 'progreso';
  programId?: string;
  subjectId?: string;
  evidenceKey?: string;
}

export interface PlatformNavigation {
  getRoute(): EducationalRoute;
  setRoute(route: EducationalRoute): void;
  subscribe(listener: (route: EducationalRoute) => void): () => void;
}

export interface NetworkStatus {
  isOnline: boolean;
  type?: 'wifi' | 'cellular' | 'ethernet' | 'other' | 'none' | 'unknown';
}

export interface PlatformNetwork {
  getStatus(): NetworkStatus;
  subscribe(listener: (status: NetworkStatus) => void): () => void;
}

export interface PlatformCapabilities {
  target: PlatformTarget;
  storage: PlatformStorage;
  navigation: PlatformNavigation;
  network: PlatformNetwork;
}

/** Web Browser platform adapter with injected/safely detected browser globals */
export function createWebPlatformCapabilities(
  domWindow?: {
    location?: { hash: string };
    history?: { replaceState(data: unknown, unused: string, url?: string | null): void };
    localStorage?: { getItem(k: string): string | null; setItem(k: string, v: string): void; removeItem(k: string): void };
    addEventListener?(type: string, listener: () => void): void;
    navigator?: { onLine: boolean };
  }
): PlatformCapabilities {
  const win = domWindow ?? (typeof globalThis !== 'undefined' ? (globalThis as unknown as {
    location?: { hash: string };
    history?: { replaceState(data: unknown, unused: string, url?: string | null): void };
    localStorage?: { getItem(k: string): string | null; setItem(k: string, v: string): void; removeItem(k: string): void };
    addEventListener?(type: string, listener: () => void): void;
    navigator?: { onLine: boolean };
  }) : undefined);

  const listeners = new Set<(route: EducationalRoute) => void>();
  const netListeners = new Set<(status: NetworkStatus) => void>();

  const parseHash = (hash: string): EducationalRoute => {
    const raw = hash.startsWith('#') ? hash.slice(1) : hash;
    const parts = raw.split('/').filter(Boolean);
    let tab: EducationalRoute['tab'] = 'aprender';
    let programId: string | undefined;
    let subjectId: string | undefined;
    let evidenceKey: string | undefined;

    for (let i = 0; i < parts.length; i += 2) {
      const key = parts[i];
      const val = parts[i + 1];
      if (key === 'tab' && (val === 'aprender' || val === 'practicar' || val === 'progreso')) {
        tab = val;
      } else if (key === 'program') {
        programId = val;
      } else if (key === 'subject') {
        subjectId = val;
      } else if (key === 'evidence') {
        evidenceKey = decodeURIComponent(val || '');
      }
    }
    return { tab, programId, subjectId, evidenceKey };
  };

  const serializeHash = (route: EducationalRoute): string => {
    const parts: string[] = [];
    if (route.programId) parts.push('program', route.programId);
    if (route.subjectId) parts.push('subject', route.subjectId);
    parts.push('tab', route.tab);
    if (route.evidenceKey) parts.push('evidence', encodeURIComponent(route.evidenceKey));
    return `#/${parts.join('/')}`;
  };

  if (win && typeof win.addEventListener === 'function') {
    win.addEventListener('hashchange', () => {
      const route = parseHash(win.location?.hash ?? '');
      for (const listener of listeners) listener(route);
    });
    win.addEventListener('online', () => {
      for (const listener of netListeners) listener({ isOnline: true, type: 'other' });
    });
    win.addEventListener('offline', () => {
      for (const listener of netListeners) listener({ isOnline: false, type: 'none' });
    });
  }

  const storage: PlatformStorage = {
    getItem(key) {
      if (!win?.localStorage) return null;
      return win.localStorage.getItem(key);
    },
    setItem(key, value) {
      if (!win?.localStorage) return;
      win.localStorage.setItem(key, value);
    },
    removeItem(key) {
      if (!win?.localStorage) return;
      win.localStorage.removeItem(key);
    },
  };

  const navigation: PlatformNavigation = {
    getRoute() {
      if (!win?.location?.hash) {
        return { tab: 'aprender' };
      }
      return parseHash(win.location.hash);
    },
    setRoute(route) {
      if (!win?.location) return;
      const targetHash = serializeHash(route);
      if (win.location.hash !== targetHash && win.history?.replaceState) {
        win.history.replaceState(null, '', targetHash);
      }
      for (const listener of listeners) listener(route);
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
  };

  const network: PlatformNetwork = {
    getStatus() {
      if (!win?.navigator) return { isOnline: true };
      return { isOnline: win.navigator.onLine };
    },
    subscribe(listener) {
      netListeners.add(listener);
      return () => { netListeners.delete(listener); };
    },
  };

  return {
    target: 'web',
    storage,
    navigation,
    network,
  };
}

/** In-memory mock platform adapter for testing and hermetic validation */
export function createMemoryPlatformCapabilities(initialRoute?: EducationalRoute): PlatformCapabilities {
  const store = new Map<string, string>();
  const listeners = new Set<(route: EducationalRoute) => void>();
  const netListeners = new Set<(status: NetworkStatus) => void>();
  let currentRoute: EducationalRoute = initialRoute ?? { tab: 'aprender' };
  const currentNetwork: NetworkStatus = { isOnline: true, type: 'wifi' };

  return {
    target: 'test',
    storage: {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, val) => { store.set(key, val); },
      removeItem: (key) => { store.delete(key); },
    },
    navigation: {
      getRoute: () => ({ ...currentRoute }),
      setRoute: (r) => {
        currentRoute = { ...r };
        for (const l of listeners) l({ ...currentRoute });
      },
      subscribe: (l) => {
        listeners.add(l);
        return () => { listeners.delete(l); };
      },
    },
    network: {
      getStatus: () => ({ ...currentNetwork }),
      subscribe: (l) => {
        netListeners.add(l);
        return () => { netListeners.delete(l); };
      },
    },
  };
}

/** Mobile platform adapter builder with injected native storage & network */
export function createMobilePlatformCapabilities(
  nativeStorage: {
    getItemSync?(key: string): string | null;
    getItem?(key: string): Promise<string | null> | string | null;
    setItemSync?(key: string, value: string): void;
    setItem?(key: string, value: string): Promise<void> | void;
    removeItemSync?(key: string): void;
    removeItem?(key: string): Promise<void> | void;
  },
  initialRoute?: EducationalRoute
): PlatformCapabilities {
  const listeners = new Set<(route: EducationalRoute) => void>();
  const netListeners = new Set<(status: NetworkStatus) => void>();
  let currentRoute: EducationalRoute = initialRoute ?? { tab: 'aprender' };
  const currentNetwork: NetworkStatus = { isOnline: true, type: 'wifi' };

  const storage: PlatformStorage = {
    getItem(key) {
      if (typeof nativeStorage.getItemSync === 'function') {
        return nativeStorage.getItemSync(key);
      }
      if (typeof nativeStorage.getItem === 'function') {
        return nativeStorage.getItem(key);
      }
      return null;
    },
    setItem(key, value) {
      if (typeof nativeStorage.setItemSync === 'function') {
        nativeStorage.setItemSync(key, value);
        return;
      }
      if (typeof nativeStorage.setItem === 'function') {
        nativeStorage.setItem(key, value);
      }
    },
    removeItem(key) {
      if (typeof nativeStorage.removeItemSync === 'function') {
        nativeStorage.removeItemSync(key);
        return;
      }
      if (typeof nativeStorage.removeItem === 'function') {
        nativeStorage.removeItem(key);
      }
    },
  };

  const navigation: PlatformNavigation = {
    getRoute: () => ({ ...currentRoute }),
    setRoute: (r) => {
      currentRoute = { ...r };
      for (const l of listeners) l({ ...currentRoute });
    },
    subscribe: (l) => {
      listeners.add(l);
      return () => { listeners.delete(l); };
    },
  };

  const network: PlatformNetwork = {
    getStatus: () => ({ ...currentNetwork }),
    subscribe: (l) => {
      netListeners.add(l);
      return () => { netListeners.delete(l); };
    },
  };

  return {
    target: 'mobile',
    storage,
    navigation,
    network,
  };
}
