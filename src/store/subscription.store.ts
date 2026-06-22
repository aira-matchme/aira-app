import { create } from 'zustand';

import type { IapEntitlement } from '../modules/iap/types';
import {
  resolveHasActiveSubscription,
  resolvePremiumUntil,
} from '../modules/subscription/subscriptionAccess';

interface SubscriptionState {
  /** From GET /auth/profile `hasActiveSubscription` — source of truth for premium gates. */
  isSubscribed: boolean;
  subscriptionType: 'free' | 'premium' | null;
  premiumUntil: string | null;
  entitlements: IapEntitlement[];
  entitlementsLoaded: boolean;
  setEntitlements: (items: IapEntitlement[]) => void;
  setEntitlementsLoaded: (loaded: boolean) => void;
  clearSubscription: () => void;
  syncFromProfile: (profile: Record<string, unknown>) => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  isSubscribed: false,
  subscriptionType: null,
  premiumUntil: null,
  entitlements: [],
  entitlementsLoaded: false,

  setEntitlements: (items) => set({ entitlements: items, entitlementsLoaded: true }),

  setEntitlementsLoaded: (loaded) => set({ entitlementsLoaded: loaded }),

  clearSubscription: () =>
    set({
      isSubscribed: false,
      subscriptionType: null,
      premiumUntil: null,
      entitlements: [],
      entitlementsLoaded: false,
    }),

  syncFromProfile: (profile) => {
    const active = resolveHasActiveSubscription(profile);
    set({
      isSubscribed: active,
      subscriptionType: active ? 'premium' : 'free',
      premiumUntil: resolvePremiumUntil(profile),
    });
  },
}));
