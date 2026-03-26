import { apiClient } from './client';
import { useAuthStore } from '../../store/auth.store';
import { useApiErrorStore } from '../../store/apiError.store';
import { useApiTimeoutStore } from '../../store/apiTimeout.store';
import { env } from '../../config/env';

const isTimeoutError = (error: { code?: string; message?: string }) =>
  error.code === 'ECONNABORTED' || error.message?.toLowerCase().includes('timeout');

const isNetworkError = (error: {
  message?: string;
  code?: string;
  response?: unknown;
  request?: unknown;
}) => {
  if (isTimeoutError(error)) return false;
  return (
    error.message === 'Network Error' ||
    error.code === 'ERR_NETWORK' ||
    (!error.response && !!error.request)
  );
};

export const setupInterceptors = () => {
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

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = useAuthStore.getState().refreshToken;
          if (refreshToken) {
            // Attempt to refresh token
            const response = await apiClient.post('/auth/refresh', {
              refreshToken,
            });

            // Handle both response structures (wrapped in data or direct)
            const responseData = response.data?.data || response.data;
            const { accessToken, refreshToken: newRefreshToken } = responseData;
            useAuthStore.getState().setTokens(accessToken, newRefreshToken);

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            // Ensure API key is still present after retry
            if (env.API_KEY) {
              originalRequest.headers['x-api-key'] = env.API_KEY;
            }
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, logout user
          useAuthStore.getState().logout();
          return Promise.reject(refreshError);
        }
      }

      // Request timed out: show Retry modal; on Retry re-call the same request and close popup
      if (isTimeoutError(error) && originalRequest) {
        useApiTimeoutStore.getState().showTimeout(() => {
          apiClient(originalRequest);
        });
        return Promise.reject(error);
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

