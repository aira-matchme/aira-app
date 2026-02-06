import { apiClient } from './client';
import { useAuthStore } from '../../store/auth.store';
import { env } from '../../config/env';

export const setupInterceptors = () => {
  // Request interceptor - add auth token and API key
  apiClient.interceptors.request.use(
    (config) => {
      console.log('📤 Request Interceptor: Intercepting request');
      console.log('📤 Request Interceptor: URL:', config.url);
      console.log('📤 Request Interceptor: Method:', config.method);
      console.log('📤 Request Interceptor: Base URL:', config.baseURL);
      console.log('📤 Request Interceptor: Full URL:', `${config.baseURL}${config.url}`);
      
      // Add API key header
      if (env.API_KEY) {
        config.headers['x-api-key'] = env.API_KEY;
        console.log('📤 Request Interceptor: API key added');
      } else {
        console.log('⚠️ Request Interceptor: No API key found');
      }
      
      // Add auth token
      const token = useAuthStore.getState().accessToken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('📤 Request Interceptor: Auth token added');
      } else {
        console.log('⚠️ Request Interceptor: No auth token found');
      }
      
      console.log('📤 Request Interceptor: Headers:', {
        'x-api-key': config.headers['x-api-key'] ? 'present' : 'missing',
        'Authorization': config.headers.Authorization ? 'present' : 'missing',
        'Content-Type': config.headers['Content-Type'],
      });

      // Log headers and payload for sendOtp endpoint
      if (config.url?.includes('/auth/send-otp') || config.url?.includes('/auth/sendOtp')) {
        const fullUrl = `${config.baseURL}${config.url}`;
        console.log('📤 sendOtpApi - Full URL:', fullUrl);
        console.log('📤 sendOtpApi - Base URL:', config.baseURL);
        console.log('📤 sendOtpApi - Endpoint:', config.url);
        console.log('📤 sendOtpApi - Method:', config.method?.toUpperCase());
        console.log('📤 sendOtpApi - Headers:', {
          'x-api-key': config.headers['x-api-key'],
          'Authorization': config.headers.Authorization,
          'Content-Type': config.headers['Content-Type'],
          'All Headers': config.headers,
        });
        console.log('📤 sendOtpApi - Payload:', config.data);
      }

      // Log for profile endpoint
      if (config.url?.includes('/user/profile') || config.url?.includes('/auth/profile')) {
        const fullUrl = `${config.baseURL}${config.url}`;
        console.log('👤 Profile API Request - Full URL:', fullUrl);
        console.log('👤 Profile API Request - Base URL:', config.baseURL);
        console.log('👤 Profile API Request - Endpoint:', config.url);
        console.log('👤 Profile API Request - Method:', config.method?.toUpperCase());
        console.log('👤 Profile API Request - Has Auth Token:', !!config.headers.Authorization);
        console.log('👤 Profile API Request - Has API Key:', !!config.headers['x-api-key']);
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - handle token refresh
  apiClient.interceptors.response.use(
    (response) => {
      const isProfileEndpoint = response.config?.url?.includes('/user/profile') || 
                                response.config?.url?.includes('/auth/profile');
      
      if (isProfileEndpoint) {
        console.log('👤 Profile API Response: SUCCESS');
        console.log('👤 Profile API Response: Status:', response.status);
        console.log('👤 Profile API Response: Data:', JSON.stringify(response.data, null, 2));
      } else {
        console.log('📥 Response Interceptor: Success response');
        console.log('📥 Response Interceptor: URL:', response.config?.url);
        console.log('📥 Response Interceptor: Status:', response.status);
      }
      return response;
    },
    async (error) => {
      const isProfileEndpoint = error.config?.url?.includes('/user/profile') || 
                                error.config?.url?.includes('/auth/profile');
      
      if (isProfileEndpoint) {
        console.log('👤 Profile API Response: ERROR');
        console.log('👤 Profile API Response: Status:', error.response?.status);
        console.log('👤 Profile API Response: Error message:', error.message);
        console.log('👤 Profile API Response: Error code:', error.code);
        console.log('👤 Profile API Response: Error data:', error.response?.data);
      } else {
        console.log('📥 Response Interceptor: Error response');
        console.log('📥 Response Interceptor: URL:', error.config?.url);
        console.log('📥 Response Interceptor: Status:', error.response?.status);
        console.log('📥 Response Interceptor: Error data:', error.response?.data);
      }
      // Log network errors for debugging
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        console.error('🚨 Network error occurred:', {
          error,
          message: error.message,
          code: error.code,
        });
      }
      
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

      return Promise.reject(error);
    }
  );
};

