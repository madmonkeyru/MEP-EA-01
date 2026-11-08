import type { PracticeConfig } from '../types';
import { createCapabilityProvider, type ProductCapability } from './capabilityModel';
import { entitlementService } from './entitlementService';

export function legacyActivityCapability(config: PracticeConfig): ProductCapability {
  if (config.remediation || config.mode === 'dynamic_mock') return 'configurable_mock_sessions';
  if (config.mode === 'simulation') return 'official_reference_benchmark';
  if (config.mode === 'diagnostic') return 'initial_diagnostic_and_basic_results';
  return 'extended_authored_practice';
}

export function canStartLegacyActivity(config: PracticeConfig) {
  return createCapabilityProvider(entitlementService.getTier()).canAccess(legacyActivityCapability(config));
}
