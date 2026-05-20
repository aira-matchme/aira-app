import { create } from 'zustand';

export type ApiErrorVariant = 'generic' | 'network';

interface ApiErrorState {
  visible: boolean;
  message: string | undefined;
  variant: ApiErrorVariant;
  onRetry: (() => void) | undefined;
  showError: (
    message?: string,
    options?: { variant?: ApiErrorVariant; onRetry?: () => void }
  ) => void;
  hideError: () => void;
}

export const useApiErrorStore = create<ApiErrorState>((set) => ({
  visible: false,
  message: undefined,
  variant: 'generic',
  onRetry: undefined,
  showError: (message, options) =>
    set({
      visible: true,
      message: message ?? undefined,
      variant: options?.variant ?? 'generic',
      onRetry: options?.onRetry,
    }),
  hideError: () =>
    set({ visible: false, message: undefined, variant: 'generic', onRetry: undefined }),
}));
