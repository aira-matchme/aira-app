import { apiClient } from './client';
import { useAuthStore } from '../../store/auth.store';
import { useApiErrorStore } from '../../store/apiError.store';
import { useApiTimeoutStore } from '../../store/apiTimeout.store';
import { env } from '../../config/env';

const isTimeoutError = (error: { code?: string; message?: string }) =>
  error.code === 'ECONNABORTED' || error.message?.toLowerCase().includes('timeout');

/** True transport / DNS failures — not "server closed socket" (e.g. ECONNRESET) or other ambiguous cases. */
const isNetworkError = (error: {
  message?: string;
  code?: string;
  response?: unknown;
  request?: unknown;
}) => {
  if (isTimeoutError(error)) return false;
  if (error.response != null) return false;

  if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
    return true;
  }

  const code = error.code;
  if (typeof code === 'string') {
    return (
      code === 'ECONNREFUSED' ||
      code === 'ENOTFOUND' ||
      code === 'ENETUNREACH' ||
      code === 'EHOSTUNREACH' ||
      code === 'EAI_AGAIN'
    );
  }

  return false;
};

/** Prevents duplicate axios interceptors when `setupInterceptors()` runs more than once (e.g. React Strict Mode dev double-invoke of `useEffect`). */
let interceptorsAttached = false;

/** Single in-flight refresh so concurrent 401s do not POST /auth/refresh in parallel. */
let refreshInFlight: Promise<void> | null = null;

async function refreshAccessTokenSingleFlight(): Promise<void> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) {
          throw new Error('No refresh token');
        }
        const response = await apiClient.post('/auth/refresh', {
          refreshToken,
        });
        const responseData = response.data?.data || response.data;
        const { accessToken, refreshToken: newRefreshToken } = responseData;
        useAuthStore.getState().setTokens(accessToken, newRefreshToken);
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  await refreshInFlight;
}

/**
 * Resets the idempotency guard so `setupInterceptors()` runs again.
 * Use in tests after `jest.clearAllMocks()` when the axios client mocks are cleared but the module singleton would otherwise skip registration.
 */
export function resetInterceptorSetupGuard(): void {
  interceptorsAttached = false;
  refreshInFlight = null;
}

export const setupInterceptors = () => {
  if (interceptorsAttached) {
    return;
  }
  interceptorsAttached = true;

  // Request interceptor - add auth token and API key
  apiClient.interceptors.request.use(
    (config) => {
      // Add API key header
      if (env.API_KEY) {
        config.headers['x-api-key'] = env.API_KEY;
      }

      // Add auth token
      const token = useAuthStore.getState().accessToken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - handle token refresh
  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      const requestUrl = String(originalRequest?.url ?? '');

      // Logout failures should not trigger token refresh (avoids loops) or global error UI.
      if (requestUrl.includes('/auth/logout')) {
        return Promise.reject(error);
      }

      // Do not try to refresh the refresh call itself (avoids infinite loop).
      if (requestUrl.includes('/auth/refresh')) {
        return Promise.reject(error);
      }

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) {
          return Promise.reject(error);
        }

        try {
          await refreshAccessTokenSingleFlight();
          const token = useAuthStore.getState().accessToken;
          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            if (env.API_KEY) {
              originalRequest.headers['x-api-key'] = env.API_KEY;
            }
          }
          return apiClient(originalRequest);
        } catch (refreshError) {
          useAuthStore.getState().logout();
          return Promise.reject(refreshError);
        }
      }

      // Request timed out: keep the axios promise pending until Retry succeeds or the user dismisses.
      if (isTimeoutError(error) && originalRequest) {
        return new Promise((resolve, reject) => {
          useApiTimeoutStore.getState().showTimeout(
            () => {
              void apiClient(originalRequest).then(resolve).catch(reject);
            },
            () => reject(error),
          );
        });
      }

      // Offline / transport failure: Figma "no internet" sheet (not server error body)
      if (isNetworkError(error)) {
        useApiErrorStore.getState().showError(undefined, { variant: 'network' });
        return Promise.reject(error);
      }

      // Show global API error modal for other errors (not 401)
      const message =
        error.response?.data?.message ??
        error.response?.data?.error ??
        'Something went wrong. Please try again.';
      useApiErrorStore.getState().showError(message, { variant: 'generic' });

      return Promise.reject(error);
    }
  );
};
