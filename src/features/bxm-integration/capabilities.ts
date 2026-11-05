import { useMemo, useSyncExternalStore } from 'react';
import { subscriptionService } from '../../services/subscriptionService';
import { createCapabilityProvider } from '../bxm-progress/capabilities/capabilityModel';

const subscribe = (listener: () => void) => subscriptionService.subscribe(listener);
const getTier = () => subscriptionService.getTier();

/** Uses the existing presentation-tier source; it is not server authorization. */
export function useSubscriptionCapabilities() {
  const tier = useSyncExternalStore(subscribe, getTier, () => 'free' as const);
  return useMemo(() => createCapabilityProvider(tier), [tier]);
}
