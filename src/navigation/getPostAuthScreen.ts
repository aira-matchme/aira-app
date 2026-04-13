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
  visualAttributesCompleted?: boolean;
  onboardingVisualAttributesCompleted?: boolean;
  /** API returns camelCase */
  preferenceIsCompleted?: boolean;
  /** @deprecated use preferenceIsCompleted */
  PreferenceIsCompleted?: boolean;
}

export type PostAuthScreen = keyof Pick<
  AuthStackParamList,
  | 'EnableNotifications'
  | 'ProfileIntro'
  | 'FaceVerification'
  | 'ProfilePhotos'
  | 'OnboardingIntro'
  | 'PreferencesMatch'
  | 'VideoVerification'
  | 'ReferenceImageIntro'
  | 'ReferenceImagePreference'
  | 'PreferencesStart'
  | 'PreferencesSummary'
  | 'Likes'
>;

/**
 * Central logic for post-login / post-auth navigation.
 * Used by AuthNavigator (initial route), LoginOptionsBottomSheet, OTPVerificationScreen, etc.
 *
 * Order: notifications → profile → face verification → gallery photos → questionnaire → main app.
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
  if (!user) return 'ProfileIntro';
  if (!user.isProfileComplete) return 'ProfileIntro';
  if (!user.livenessCheck) return 'FaceVerification';
  if (!user.galleryPhotosUploaded) return 'ProfilePhotos';
  if (!user.questionnaireCompleted) return 'OnboardingIntro';
  if (!user.preferenceIsCompleted && !user.PreferenceIsCompleted) return 'PreferencesStart';
  if (!user.onboardingVisualAttributesCompleted) return 'ReferenceImageIntro';

// return 'EnableNotifications'
  // Show main app with bottom tabs; RootNavigator shows TabNavigator and initial tab is Home (Dashboard)
  return 'Likes';
// return 'ProfileIntro'
// return 'ProfilePhotos';
  // return 'ReferenceImageIntro';
  // return 'FaceVerification';
  // return 'OnboardingIntro'
  // return 'PreferencesStart'
  // return 'PreferencesSummary';

}
