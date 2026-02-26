import { create } from 'zustand';

interface ApiTimeoutState {
  visible: boolean;
  /** When user taps Retry, this is called (e.g. re-run the failed request), then modal closes */
  retry: (() => void) | null;
  showTimeout: (retry: () => void) => void;
  hideTimeout: () => void;
}

export const useApiTimeoutStore = create<ApiTimeoutState>((set) => ({
  visible: false,
  retry: null,
  showTimeout: (retry) => set({ visible: true, retry }),
  hideTimeout: () => set({ visible: false, retry: null }),
}));
