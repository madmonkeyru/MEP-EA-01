import { describe, it, expect, beforeEach } from 'vitest';
import {
  entitlementService,
  createEntitlementProvider,
  ENTITLEMENT_DEFINITIONS,
  type Entitlement,
} from './entitlementService';

describe('M6: Capability Entitlements & Graceful Upgrade Boundaries', () => {
  beforeEach(() => {
    localStorage.clear();
    entitlementService.setTier('free');
  });

  it('provides all canonical free entitlements without paywall blocks in free tier', () => {
    const freeEntitlements: Entitlement[] = [
      'official_resources',
      'diagnostic',
      'reference_exam',
      'basic_results',
    ];

    for (const ent of freeEntitlements) {
      const decision = entitlementService.checkAccess(ent);
      expect(decision.hasAccess).toBe(true);
      expect(decision.requiredTier).toBe('free');
      expect(decision.reasonEs).toBeUndefined();
      expect(entitlementService.hasEntitlement(ent)).toBe(true);
    }
  });

  it('gracefully gates premium entitlements with informative upgrade reasons and CTAs in free tier', () => {
    const gatedEntitlements: Entitlement[] = [
      'lesson_library',
      'practice_bank',
      'adaptive_practice',
      'mock_exams',
      'advanced_progress',
      'study_sessions',
    ];

    for (const ent of gatedEntitlements) {
      const decision = entitlementService.checkAccess(ent);
      expect(decision.hasAccess).toBe(false);
      expect(decision.requiredTier).toBe('premium');
      expect(decision.reasonEs).toBeDefined();
      expect(decision.reasonEs).not.toContain('Access denied'); // Must be graceful educational copy
      expect(decision.upgradeCtaTextEs).toBeDefined();
      expect(entitlementService.hasEntitlement(ent)).toBe(false);
    }
  });

  it('unlocks all capabilities when user tier transitions to premium', () => {
    entitlementService.setTier('premium');
    expect(entitlementService.getTier()).toBe('premium');

    const allEntitlements = Object.keys(ENTITLEMENT_DEFINITIONS) as Entitlement[];
    for (const ent of allEntitlements) {
      const decision = entitlementService.checkAccess(ent);
      expect(decision.hasAccess).toBe(true);
      expect(decision.reasonEs).toBeUndefined();
      expect(entitlementService.hasEntitlement(ent)).toBe(true);
    }
  });

  it('supports isolated provider creation with defaults strictly resolving to free', () => {
    const corruptedProvider = createEntitlementProvider('unknown_tier_value');
    expect(corruptedProvider.getTier()).toBe('free');
    expect(corruptedProvider.hasEntitlement('mock_exams')).toBe(false);

    const premiumProvider = createEntitlementProvider('premium');
    expect(premiumProvider.getTier()).toBe('premium');
    expect(premiumProvider.hasEntitlement('mock_exams')).toBe(true);
  });

  it('notifies listeners on tier changes', () => {
    let observedTier = '';
    const unsubscribe = entitlementService.subscribe((tier) => {
      observedTier = tier;
    });

    entitlementService.setTier('premium');
    expect(observedTier).toBe('premium');

    entitlementService.toggleTier();
    expect(observedTier).toBe('free');

    unsubscribe();
  });
});
