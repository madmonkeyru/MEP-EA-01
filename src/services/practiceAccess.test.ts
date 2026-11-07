import { beforeEach, describe, expect, it } from 'vitest';
import type { PracticeConfig, PracticeMode } from '../types';
import { canStartLegacyActivity } from './practiceAccess';
import { subscriptionService } from './subscriptionService';
import { entitlementService } from './entitlementService';

describe('shared practice policy', () => {
  beforeEach(() => localStorage.clear());
  const config = (mode: PracticeMode): PracticeConfig => ({ mode, itemCount: 10, enableTimer: false, timerDurationMinutes: 30 });
  it.each(['area', 'topic', 'random_practice', 'concept_drilldown', 'dynamic_mock'] as const)('requires Pro for %s', mode => {
    expect(canStartLegacyActivity(config(mode))).toBe(false);
    subscriptionService.setTier('premium');
    expect(canStartLegacyActivity(config(mode))).toBe(true);
  });
  it.each(['diagnostic', 'simulation'] as const)('keeps %s free', mode => {
    expect(canStartLegacyActivity(config(mode))).toBe(true);
  });
  it('shares tier notifications between both compatibility services', () => {
    const tiers: string[] = [];
    const unsubscribe = subscriptionService.subscribe(tier => tiers.push(tier));
    entitlementService.setTier('premium');
    expect(subscriptionService.getTier()).toBe('premium');
    subscriptionService.setTier('free');
    expect(entitlementService.getTier()).toBe('free');
    expect(tiers).toEqual(['premium', 'free']);
    unsubscribe();
  });
});
