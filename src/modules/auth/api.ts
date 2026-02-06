import { apiClient } from '../../services/api/client';
import { endpoints } from '../../services/api/endpoints';
import {
  LoginRequest,
  AuthResponse,
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  SocialLoginRequest,
} from './types';

export const loginApi = async (
  payload: LoginRequest
): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>(
    endpoints.auth.login,
    payload
  );
  return data;
};

export const sendOtpApi = async (
  payload: SendOtpRequest
): Promise<SendOtpResponse> => {
  console.log('📤 sendOtpApi - Request Payload:', payload);
  const { data } = await apiClient.post<SendOtpResponse>(
    endpoints.auth.sendOtp,
    payload
  );
  console.log('📥 sendOtpApi - Response Data:', data);
  return data;
};

export const resendOtpApi = async (
  payload: SendOtpRequest
): Promise<SendOtpResponse> => {
  console.log('📤 resendOtpApi - Request Payload:', payload);
  const { data } = await apiClient.post<SendOtpResponse>(
    endpoints.auth.resendOtp,
    payload
  );
  console.log('📥 resendOtpApi - Response Data:', data);
  return data;
};

export const verifyOtpApi = async (
  payload: VerifyOtpRequest
): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>(
    endpoints.auth.verifyOtp,
    payload
  );
  return data;
};

export const socialLoginApi = async (
  payload: SocialLoginRequest
): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>(
    endpoints.auth.socialLogin,
    payload
  );
  return data;
};
