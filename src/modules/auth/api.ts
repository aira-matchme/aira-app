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
  LivenessVerifyResponse,
  LivenessCheckRequest,
  LivenessCheckResponse,
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

/** Ends server session. `apiClient` request interceptor adds `Authorization: Bearer <accessToken>`. */
export const logoutApi = async (): Promise<void> => {
  await apiClient.post(endpoints.auth.logout, {});
};

/** Permanently delete current account. */
export const deleteAccountApi = async (reason = ''): Promise<void> => {
  console.log('reason', reason);
  await apiClient.delete(endpoints.auth.deleteAccount, {
    data: { reason: String(reason ?? '').trim() },
  });
};

export const sendOtpApi = async (
  payload: SendOtpRequest
): Promise<SendOtpResponse> => {
  const { data } = await apiClient.post<SendOtpResponse>(
    endpoints.auth.sendOtp,
    payload
  );
  return data;
};

export const resendOtpApi = async (
  payload: SendOtpRequest
): Promise<SendOtpResponse> => {
  const { data } = await apiClient.post<SendOtpResponse>(
    endpoints.auth.resendOtp,
    payload
  );
  return data;
};

export const verifyOtpApi = async (
  payload: VerifyOtpRequest
): Promise<AuthResponse> => {
  const deviceToken = String(payload.deviceToken ?? '').trim();
  const body: VerifyOtpRequest = {
    ...payload,
    ...(deviceToken ? { deviceToken } : { deviceToken: undefined }),
  };
  const { data } = await apiClient.post<AuthResponse>(
    endpoints.auth.verifyOtp,
    body
  );
  return data;
};

export interface RegisterFcmTokenRequest {
  deviceId: string;
  deviceToken: string;
  deviceType: 'android' | 'ios' | 'web';
}

export const registerFcmTokenApi = async (payload: RegisterFcmTokenRequest): Promise<void> => {
  await apiClient.post(endpoints.auth.fcmToken, payload);
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
      uri: photoUri.startsWith('ph://')
        ? photoUri
        : photoUri.startsWith('file://')
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
    return data;
  } catch (error) {
    throw error;
  }
};

/** POST `/auth/liveness/verify` with multipart field `file` (JPEG). */
export const verifyLivenessSelfieApi = async (
  imageUri: string,
): Promise<LivenessVerifyResponse> => {
  const trimmed = String(imageUri ?? '').trim();
  if (!trimmed) {
    throw new Error('Missing liveness verification image');
  }

  const formData = new FormData();
  formData.append('file', {
    uri: trimmed.startsWith('ph://')
      ? trimmed
      : trimmed.startsWith('file://')
        ? trimmed
        : `file://${trimmed}`,
    type: 'image/jpeg',
    name: `liveness_${Date.now()}.jpg`,
  } as any);

  const { data } = await apiClient.post<LivenessVerifyResponse>(
    endpoints.auth.livenessVerify,
    formData,
    {
      timeout: 60000,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
  return data;
};

/** POST `/auth/liveness-check` — sets `livenessCheck` on the user profile. */
export const completeLivenessCheckApi = async (
  payload: LivenessCheckRequest,
): Promise<LivenessCheckResponse> => {
  const { data } = await apiClient.post<LivenessCheckResponse>(
    endpoints.auth.livenessCheck,
    payload,
  );
  return data;
};

export interface UploadProfilePhotoResponse {
  statusCode: number;
  message: string;
  data?: { imageUrl?: string; order?: number };
}

/** Upload a profile/reference image with order (1-based: 1st slot = 1, 6th slot = 6) */
export const uploadProfilePhotoApi = async (
  photoUri: string,
  order: number,
  isBlurred = false,
): Promise<UploadProfilePhotoResponse> => {
  const formData = new FormData();
  formData.append('photo', {
    uri: photoUri.startsWith('ph://')
      ? photoUri
      : photoUri.startsWith('file://')
        ? photoUri
        : `file://${photoUri}`,
    type: 'image/jpeg',
    name: `profile_photo_${order}_${Date.now()}.jpg`,
  } as any);
  formData.append('order', String(order));
  formData.append('isBlurred', String(isBlurred));

  const { data } = await apiClient.post<UploadProfilePhotoResponse>(
    endpoints.user.uploadPhotos,
    formData,
    {
      timeout: 60000,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return data;
};

/** Delete a gallery photo by id (from galleryImages[].id) */
export const deleteProfilePhotoApi = async (photoId: string): Promise<void> => {
  const url = endpoints.user.deletePhoto.replace('{id}', photoId);
  await apiClient.delete(url);
};
