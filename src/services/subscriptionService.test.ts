import { describe, it, expect, beforeEach } from 'vitest';
import { subscriptionService, PLANS } from './subscriptionService';

describe('subscriptionService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to free tier', () => {
    expect(subscriptionService.getTier()).toBe('free');
    expect(subscriptionService.isPremium()).toBe(false);
  });

  it('updates tier and persists to storage', () => {
    subscriptionService.setTier('premium');
    expect(subscriptionService.getTier()).toBe('premium');
    expect(subscriptionService.isPremium()).toBe(true);
    expect(localStorage.getItem('mep_ea_subscription_tier')).toBe('premium');
  });

  it('toggles tier back and forth', () => {
    expect(subscriptionService.toggleTier()).toBe('premium');
    expect(subscriptionService.isPremium()).toBe(true);
    expect(subscriptionService.toggleTier()).toBe('free');
    expect(subscriptionService.isPremium()).toBe(false);
  });

  it('allows free access to official reference exam and gates premium features', () => {
    subscriptionService.setTier('free');

    // Official exam is free
    const examCheck = subscriptionService.checkFeatureAccess('official_exam');
    expect(examCheck.hasAccess).toBe(true);

    // Dynamic mock is premium
    const mockCheck = subscriptionService.checkFeatureAccess('dynamic_mock');
    expect(mockCheck.hasAccess).toBe(false);
    expect(mockCheck.requiredTier).toBe('premium');

    // Switch to premium
    subscriptionService.setTier('premium');
    expect(subscriptionService.checkFeatureAccess('dynamic_mock').hasAccess).toBe(true);
  });

  it('exposes well-formed subscription plans with pricing in CRC', () => {
    expect(PLANS.length).toBeGreaterThanOrEqual(2);
    PLANS.forEach(plan => {
      expect(plan.id).toBeDefined();
      expect(plan.priceCRC).toBeGreaterThan(0);
      expect(plan.features.length).toBeGreaterThan(0);
    });
  });
});
