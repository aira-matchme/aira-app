import { create } from 'zustand';

export type ApiErrorVariant = 'generic' | 'network';

interface ApiErrorState {
  visible: boolean;
  message: string | undefined;
  variant: ApiErrorVariant;
  showError: (
    message?: string,
    options?: { variant?: ApiErrorVariant }
  ) => void;
  hideError: () => void;
}

export const useApiErrorStore = create<ApiErrorState>((set) => ({
  visible: false,
  message: undefined,
  variant: 'generic',
  showError: (message, options) =>
    set({
      visible: true,
      message: message ?? undefined,
      variant: options?.variant ?? 'generic',
    }),
  hideError: () =>
    set({ visible: false, message: undefined, variant: 'generic' }),
}));
