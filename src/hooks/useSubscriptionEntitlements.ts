import { useCallback, useEffect, useState } from 'react';

import { getIapEntitlementsApi } from '../modules/iap/api';
import {
  normalizeEntitlements,
  pickPrimaryEntitlement,
} from '../modules/iap/entitlements';
import type { IapEntitlement } from '../modules/iap/types';
import { useSubscriptionStore } from '../store/subscription.store';

export function useSubscriptionEntitlements(enabled: boolean) {
  const setEntitlements = useSubscriptionStore((s) => s.setEntitlements);
  const setEntitlementsLoaded = useSubscriptionStore((s) => s.setEntitlementsLoaded);
  const [isLoading, setIsLoading] = useState(false);
  const [primaryEntitlement, setPrimaryEntitlement] = useState<IapEntitlement | null>(null);

  const loadEntitlements = useCallback(async () => {
    if (!enabled) return null;

    setIsLoading(true);

    try {
      const response = await getIapEntitlementsApi();
      const items = normalizeEntitlements(response);
      const primary = pickPrimaryEntitlement(items);
      setEntitlements(items);
      setPrimaryEntitlement(primary);
      return primary;
    } catch (err) {
      setEntitlements([]);
      setPrimaryEntitlement(null);
      return null;
    } finally {
      setIsLoading(false);
      setEntitlementsLoaded(true);
    }
  }, [enabled, setEntitlements, setEntitlementsLoaded]);

  useEffect(() => {
    if (!enabled) return;
    void loadEntitlements();
  }, [enabled, loadEntitlements]);

  return {
    isLoading,
    primaryEntitlement,
    reload: loadEntitlements,
  };
}
