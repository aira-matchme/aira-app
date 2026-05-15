import { create } from 'zustand';

interface ApiTimeoutState {
  visible: boolean;
  /** When user taps Retry, this is called (e.g. re-run the failed request), then modal closes */
  retry: (() => void) | null;
  /** Invoked when the sheet is dismissed without a successful retry (e.g. pan down / backdrop). */
  onCancel: (() => void) | null;
  showTimeout: (retry: () => void, onCancel?: () => void) => void;
  hideTimeout: (opts?: { cancelled?: boolean }) => void;
}

export const useApiTimeoutStore = create<ApiTimeoutState>((set, get) => ({
  visible: false,
  retry: null,
  onCancel: null,
  showTimeout: (retry, onCancel) => set({ visible: true, retry, onCancel: onCancel ?? null }),
  hideTimeout: (opts) => {
    if (opts?.cancelled) {
      get().onCancel?.();
    }
    set({ visible: false, retry: null, onCancel: null });
  },
}));
