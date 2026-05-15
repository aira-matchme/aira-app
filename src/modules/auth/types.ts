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
  deviceToken?: string;
  deviceId: string;
  deviceType?: 'android' | 'ios' | 'web';
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
    isProfileComplete?: boolean;
    profilePhoto?: SelfieResponseProfilePhoto & { id?: string };
    livenessCheck?: boolean;
    galleryPhotosUploaded?: boolean;
    questionnaireCompleted?: boolean;
    /** When `false`, show dashboard tab walkthrough until completed. */
    isAppTourDone?: boolean;
  };
}

export interface SelfieResponseProfilePhoto {
  key: {
    original: string;
    medium: string;
    thumb: string;
  };
  url: {
    original: string;
    medium: string;
    thumb: string;
  };
}

export interface SelfieResponseFaceAttributes {
  success: boolean;
  status_code: number;
  skintone?: { value: string; confidence: number };
  face_shape?: { value: string; confidence: number };
  eyes_color?: { value: string; confidence: number };
  eyes_shape?: { value: string; confidence: number };
  eye_size?: { value: string; confidence: number };
  eyebrow_shape?: { value: string; confidence: number };
  eyebrow_thickness?: { value: string; confidence: number };
  lip_shape?: { value: string; confidence: number };
  nose_shape?: { value: string; confidence: number };
  nose_size?: { value: string; confidence: number };
  cheekbones?: { value: string; confidence: number };
  hair_color?: { value: string; confidence: number };
  hair_type?: { value: string; confidence: number };
  face_bbox?: { x: number; y: number; width: number; height: number };
}

export interface SelfieResponse {
  statusCode: number;
  message: string;
  data: {
    profilePhoto: SelfieResponseProfilePhoto;
    faceAttributes: SelfieResponseFaceAttributes;
  };
}

export interface LivenessVerifyData {
  success?: boolean;
  verified?: boolean;
  all_match?: boolean;
  selfie_face_found?: boolean;
  details?: string;
}

export interface LivenessVerifyResponse {
  statusCode: number;
  message: string;
  data?: LivenessVerifyData;
}

export interface LivenessCheckRequest {
  livenessCheck: boolean;
}

export interface LivenessCheckResponse {
  statusCode: number;
  message: string;
  data?: Record<string, unknown>;
}
