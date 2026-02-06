export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface SendOtpRequest {
  email: string;
}

export interface SendOtpResponseData {
  message: string;
  expiresIn: number;
}

export interface SendOtpResponse {
  data: SendOtpResponseData;
  message: string;
  statusCode: number;
}

export type SocialProvider = 'google' | 'apple';

export interface SocialLoginRequest {
  provider: SocialProvider;
  providerId: string;
  email: string;
  name: string;
  profilePicture?: string;
  emailVerified: boolean;
  googleId?: string;
  appleUserIdentifier?: string;
  deviceId?: string;
  deviceToken?: string;
  deviceType?: 'android' | 'ios' | 'web';
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface AuthResponse {
  statusCode: number;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    keyId?: string;
    user: {
      id: string;
      email: string;
      name: string;
      emailVerified?: boolean;
      provider?: string;
      profilePicture?: string;
      phoneNumber?: string;
    };
  };
}

export interface UserProfileResponse {
  statusCode: number;
  message: string;
  data: {
    id: string;
    email: string;
    name: string;
    emailVerified?: boolean;
    provider?: string;
    profilePicture?: string;
    phoneNumber?: string;
  };
}

