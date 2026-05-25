import { create } from 'zustand';

interface SubscriptionState {
  isSubscribed: boolean;
  subscriptionType: 'free' | 'premium' | null;
  setSubscription: (type: 'free' | 'premium') => void;
  clearSubscription: () => void;
  /** Sync from profile API: `hasActiveSubscription` / `subscription.isActive` / `isPremium` */
  syncFromProfile: (profile: Record<string, unknown>) => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  isSubscribed: false,
  subscriptionType: null,
  setSubscription: (type) => set({ isSubscribed: true, subscriptionType: type }),
  clearSubscription: () => set({ isSubscribed: false, subscriptionType: null }),
  syncFromProfile: (profile) => {
    const active =
      profile?.hasActiveSubscription === true ||
      (profile?.subscription as any)?.isActive === true ||
      profile?.isPremium === true;
    set({
      isSubscribed: active,
      subscriptionType: active ? 'premium' : 'free',
    });
  },
}));

