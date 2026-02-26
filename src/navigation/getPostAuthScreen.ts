import type { AuthStackParamList } from './types';

/**
 * Minimal user shape required for post-auth navigation.
 * Matches User from auth.store.
 */
export interface PostAuthUser {
  isProfileComplete?: boolean;
  profilePhoto?: unknown;
  livenessCheck?: boolean;
  galleryPhotosUploaded?: boolean;
  questionnaireCompleted?: boolean;
}

export type PostAuthScreen = keyof Pick<
  AuthStackParamList,
  | 'EnableNotifications'
  | 'ProfileIntro'
  | 'ProfilePhotos'
  | 'OnboardingIntro'
  | 'PreferencesMatch'
  | 'VideoVerification'
  | 'FaceVerification'
  | 'Likes'
>;

/**
 * Central logic for post-login / post-auth navigation.
 * Used by AuthNavigator (initial route), LoginOptionsBottomSheet, OTPVerificationScreen, etc.
 *
 * @param user - Current user from profile API or auth response
 * @param shouldShowEnableNotifications - Whether notification permission prompt is needed (caller checks permission)
 * @returns Screen name to navigate to
 */
export function getPostAuthScreen(
  user: PostAuthUser | null,
  shouldShowEnableNotifications: boolean
): PostAuthScreen {
  if (shouldShowEnableNotifications) return 'EnableNotifications';
  if (!user) return 'EnableNotifications';

  // if (user.questionnaireCompleted) return 'PreferencesMatch';
  // if (!user.isProfileComplete) return 'ProfileIntro';π
  // if (user.livenessCheck)
  //   return user.galleryPhotosUploaded ? 'OnboardingIntro' : 'ProfilePhotos';
  // if (user.profilePhoto) return 'VideoVerification';
  // return 'ProfileIntro';
  // return 'FaceVerification';
  // return 'OnboardingIntro';
  // return 'Likes';
  return 'PreferencesMatch';

}
