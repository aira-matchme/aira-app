import { apiClient } from '../../services/api/client';
import { endpoints } from '../../services/api/endpoints';
import {
  LoginRequest,
  AuthResponse,
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  SocialLoginRequest,
  UserProfileResponse,
  SelfieResponse,
  LivenessRequest,
  LivenessResponse,
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

export const getProfileApi = async (): Promise<UserProfileResponse> => {
  const { data } = await apiClient.get<UserProfileResponse>(endpoints.user.profile);
  return data;
};

export const uploadSelfieApi = async (
  photoUri: string,
): Promise<SelfieResponse> => {
  try {
    const formData = new FormData();

    formData.append('file', {
      uri: photoUri.startsWith('file://')
        ? photoUri
        : `file://${photoUri}`,
      type: 'image/jpeg',
      name: `selfie_${Date.now()}.jpg`,
    } as any);

    const { data } = await apiClient.post<SelfieResponse>(
      endpoints.user.selfie,
      formData,
      {
        timeout: 60000,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    console.log('📥 uploadSelfieApi - Response Data:', data);
    return data;
  } catch (error) {
    console.error('uploadSelfieApi error:', error);
    throw error;
  }
};

export const submitLivenessApi = async (
  payload: LivenessRequest
): Promise<LivenessResponse> => {
  const { data } = await apiClient.post<LivenessResponse>(
    endpoints.auth.liveness,
    payload
  );
  return data;
};
