import { create } from 'zustand';

interface WaitlistState {
  /** User tapped "Enter Aira Match" — bypass env waitlist gate for this session. */
  hasEnteredApp: boolean;
  setHasEnteredApp: (value: boolean) => void;
  reset: () => void;
}

export const useWaitlistStore = create<WaitlistState>((set) => ({
  hasEnteredApp: false,
  setHasEnteredApp: (value) => set({ hasEnteredApp: value }),
  reset: () => set({ hasEnteredApp: false }),
}));
