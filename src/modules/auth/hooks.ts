import { useMutation, useQuery } from '@tanstack/react-query';
import { loginApi, sendOtpApi, resendOtpApi, verifyOtpApi, socialLoginApi } from './api';
import {
  LoginRequest,
  AuthResponse,
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  SocialLoginRequest,
  UserProfileResponse,
} from './types';
import { apiClient } from '../../services/api/client';
import { endpoints } from '../../services/api/endpoints';

export const useLogin = () =>
  useMutation<AuthResponse, Error, LoginRequest>({
    mutationFn: loginApi,
  });

export const useSendOtp = () =>
  useMutation<SendOtpResponse, Error, SendOtpRequest>({
    mutationFn: sendOtpApi,
  });

export const useResendOtp = () =>
  useMutation<SendOtpResponse, Error, SendOtpRequest>({
    mutationFn: resendOtpApi,
  });

export const useVerifyOtp = () =>
  useMutation<AuthResponse, Error, VerifyOtpRequest>({
    mutationFn: verifyOtpApi,
  });

export const useSocialLogin = () =>
  useMutation<AuthResponse, Error, SocialLoginRequest>({
    mutationFn: socialLoginApi,
  });

const fetchMe = async (): Promise<UserProfileResponse> => {
  console.log('═══════════════════════════════════════════════════════');
  console.log('📞 CALLING /auth/profile API');
  console.log('═══════════════════════════════════════════════════════');
  console.log('📞 fetchMe: Function called');
  console.log('📞 fetchMe: Endpoint path:', endpoints.user.profile);
  console.log('📞 fetchMe: Base URL:', apiClient.defaults.baseURL);
  console.log('📞 fetchMe: Full URL:', `${apiClient.defaults.baseURL}${endpoints.user.profile}`);
  console.log('📞 fetchMe: API Client timeout:', apiClient.defaults.timeout);
  console.log('📞 fetchMe: About to call apiClient.get()...');
  
  try {
    console.log('📞 fetchMe: Calling apiClient.get() NOW...');
    console.log('📞 fetchMe: Request will be:', {
      method: 'GET',
      url: endpoints.user.profile,
      baseURL: apiClient.defaults.baseURL,
      fullURL: `${apiClient.defaults.baseURL}${endpoints.user.profile}`,
    });
    
    const response = await apiClient.get<UserProfileResponse>(endpoints.user.profile);
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ /auth/profile API CALL SUCCESSFUL');
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ fetchMe: API call completed successfully');
    console.log('✅ fetchMe: Response status:', response.status);
    console.log('✅ fetchMe: Response headers:', response.headers);
    console.log('✅ fetchMe: Response data:', JSON.stringify(response.data, null, 2));
    console.log('✅ fetchMe: Returning data...');
    
    return response.data;
  } catch (error: any) {
    console.log('═══════════════════════════════════════════════════════');
    console.log('❌ /auth/profile API CALL FAILED');
    console.log('═══════════════════════════════════════════════════════');
    console.error('❌ fetchMe: API call failed');
    console.error('❌ fetchMe: Error type:', error?.constructor?.name);
    console.error('❌ fetchMe: Error message:', error?.message);
    console.error('❌ fetchMe: Error code:', error?.code);
    console.error('❌ fetchMe: Error response status:', error?.response?.status);
    console.error('❌ fetchMe: Error response statusText:', error?.response?.statusText);
    console.error('❌ fetchMe: Error response data:', error?.response?.data);
    console.error('❌ fetchMe: Error config:', {
      url: error?.config?.url,
      method: error?.config?.method,
      baseURL: error?.config?.baseURL,
      headers: error?.config?.headers,
    });
    console.error('❌ fetchMe: Full error object:', error);
    throw error;
  }
};

export const useMe = (enabled: boolean = false) => {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🔄 useMe HOOK CALLED');
  console.log('═══════════════════════════════════════════════════════');
  console.log('🔄 useMe: Hook invoked');
  console.log('🔄 useMe: enabled parameter:', enabled);
  console.log('🔄 useMe: Will fetch profile if enabled is true');
  
  const query = useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
    enabled,
    retry: false, // Don't retry on 401, just fail
  });

  console.log('🔄 useMe: React Query state after initialization:', {
    enabled,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    isSuccess: query.isSuccess,
    hasData: !!query.data,
    hasError: !!query.error,
    error: query.error,
  });
  
  if (enabled) {
    console.log('🔄 useMe: Query is ENABLED - React Query will call fetchMe()');
  } else {
    console.log('🔄 useMe: Query is DISABLED - React Query will NOT call fetchMe()');
  }

  return query;
};
