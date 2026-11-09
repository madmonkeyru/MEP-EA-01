import { describe, it, expect } from 'vitest';
import {
  createMemoryPlatformCapabilities,
  createMobilePlatformCapabilities,
  type EducationalRoute,
} from './platformCapabilities';

describe('P13 Platform Capability Abstraction & Agnostic Adapters', () => {
  it('hermetic memory capabilities support storage, navigation and network without DOM or native APIs', async () => {
    const caps = createMemoryPlatformCapabilities({ tab: 'aprender', subjectId: 'matematica' });
    expect(caps.target).toBe('test');

    // Navigation
    expect(caps.navigation.getRoute()).toEqual({ tab: 'aprender', subjectId: 'matematica' });
    const navChanges: EducationalRoute[] = [];
    const unsub = caps.navigation.subscribe(r => navChanges.push(r));

    caps.navigation.setRoute({ tab: 'practicar', programId: 'bxm', subjectId: 'civica' });
    expect(caps.navigation.getRoute()).toEqual({ tab: 'practicar', programId: 'bxm', subjectId: 'civica' });
    expect(navChanges).toHaveLength(1);
    expect(navChanges[0].tab).toBe('practicar');
    unsub();

    // Storage
    await caps.storage.setItem('user_session', JSON.stringify({ learnerId: 'learner_1' }));
    const saved = await caps.storage.getItem('user_session');
    expect(JSON.parse(saved!)).toEqual({ learnerId: 'learner_1' });
    await caps.storage.removeItem('user_session');
    expect(await caps.storage.getItem('user_session')).toBeNull();

    // Network
    expect(caps.network.getStatus().isOnline).toBe(true);
  });

  it('mobile capabilities wrap native storage and isolate platform specifics', async () => {
    const fakeExpoStore = new Map<string, string>();
    const mockStorage = {
      getItemSync: (k: string) => fakeExpoStore.get(k) ?? null,
      setItemSync: (k: string, v: string) => { fakeExpoStore.set(k, v); },
      removeItemSync: (k: string) => { fakeExpoStore.delete(k); },
    };

    const caps = createMobilePlatformCapabilities(mockStorage, { tab: 'progreso' });
    expect(caps.target).toBe('mobile');
    expect(caps.navigation.getRoute().tab).toBe('progreso');

    await caps.storage.setItem('draft_1', '{"saved":true}');
    expect(fakeExpoStore.get('draft_1')).toBe('{"saved":true}');
    expect(await caps.storage.getItem('draft_1')).toBe('{"saved":true}');
  });
});
