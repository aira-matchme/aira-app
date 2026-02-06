import { create } from 'zustand';

interface SubscriptionState {
  isSubscribed: boolean;
  subscriptionType: 'free' | 'premium' | null;
  setSubscription: (type: 'free' | 'premium') => void;
  clearSubscription: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  isSubscribed: false,
  subscriptionType: null,
  setSubscription: (type) => set({ isSubscribed: true, subscriptionType: type }),
  clearSubscription: () => set({ isSubscribed: false, subscriptionType: null }),
}));

