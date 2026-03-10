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
  const response = await apiClient.get<UserProfileResponse>(endpoints.user.profile);
  return response.data;
};

export const useMe = (enabled: boolean = false) => {
  return useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
    enabled,
    retry: false,
  });
};
