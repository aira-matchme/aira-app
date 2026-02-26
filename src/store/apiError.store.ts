import { create } from 'zustand';

interface ApiErrorState {
  visible: boolean;
  message: string | undefined;
  showError: (message?: string) => void;
  hideError: () => void;
}

export const useApiErrorStore = create<ApiErrorState>((set) => ({
  visible: false,
  message: undefined,
  showError: (message) =>
    set({ visible: true, message: message ?? undefined }),
  hideError: () => set({ visible: false, message: undefined }),
}));
