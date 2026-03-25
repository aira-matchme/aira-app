import type { NavigatorScreenParams } from '@react-navigation/native';
import type { OnboardingQuestion } from '../modules/onboarding/questions.data';

export type RootStackParamList = {
  AuthStack: NavigatorScreenParams<AuthStackParamList> | undefined;
  LoginOptionsModal: undefined;
  EmailLogin: undefined;
  LostAccessEmail: undefined;
  OTPVerification: { email: string };
  Splash: undefined;
  Auth: undefined;
  Login: undefined;
  Dashboard: undefined;
  MatchDetails: { userId: string };
};

export type AuthStackParamList = {
  Welcome: undefined;
  LoginOptions: undefined;
  Login: undefined;
  Register: undefined;
  EmailLogin: undefined;
  LostAccessEmail: undefined;
  OTPVerification: { email: string };
  EnableNotifications: undefined;
  ProfileIntro: undefined;
  BasicDetailsName: { fromEditProfile?: boolean } | undefined;
  BasicDetailsDob: { fromEditProfile?: boolean } | undefined;
  BasicDetailsWeight: { fromEditProfile?: boolean } | undefined;
  BasicDetailsBodyType:
    | { fromEditProfile?: boolean; continueToOnboarding?: boolean }
    | undefined;
  BasicDetailsHeight: { fromEditProfile?: boolean } | undefined;
  BasicDetailsEducation: { fromEditProfile?: boolean } | undefined;
  BasicDetailsEmployment: { fromEditProfile?: boolean } | undefined;
  BasicDetailsIncome: { fromEditProfile?: boolean } | undefined;
  BasicDetailsReligion: { fromEditProfile?: boolean } | undefined;
  BasicDetailsMaritalStatus: { fromEditProfile?: boolean } | undefined;
  BasicDetailsChildren: { fromEditProfile?: boolean } | undefined;
  BasicDetailsEthnicity: { fromEditProfile?: boolean } | undefined;
  BasicDetailsInterests: { fromEditProfile?: boolean } | undefined;
  BasicDetailsPincode: { fromEditProfile?: boolean } | undefined;
  FaceVerification: undefined;
  SelfieCamera: undefined;
  VideoVerification: undefined;
  ProfilePhotos: undefined;
  OnboardingIntro: undefined;
  OnboardingRadioQuestion: {
    question: OnboardingQuestion;
    step: number;
    totalSteps: number;
    questionOrder: number;
  };
  OnboardingMultiSelectQuestion: {
    question: OnboardingQuestion;
    step: number;
    totalSteps: number;
    questionOrder: number;
    minSelections?: number;
    maxSelections?: number;
  };
  OnboardingCardQuestion: {
    question: OnboardingQuestion;
    step: number;
    totalSteps: number;
    questionOrder: number;
  };
  OnboardingBooleanQuestion: {
    question: OnboardingQuestion;
    step: number;
    totalSteps: number;
    questionOrder: number;
  };
  OnboardingPhotoQuestion: {
    question: OnboardingQuestion;
    step: number;
    totalSteps: number;
    questionOrder: number;
  };
  PreferencesStart: undefined;
  PreferencesMatch: { returnToSummary?: boolean };
  PreferencesAge: { returnToSummary?: boolean };
  PreferencesHeight: { returnToSummary?: boolean };
  PreferencesDistance: { returnToSummary?: boolean };
  PreferencesEducation: { returnToSummary?: boolean };
  PreferencesEmployment: { returnToSummary?: boolean };
  PreferencesIncome: { returnToSummary?: boolean };
  PreferencesReligion: { returnToSummary?: boolean };
  PreferencesMaritalStatus: { returnToSummary?: boolean };
  PreferencesRelationshipIntent: { returnToSummary?: boolean };
  PreferencesBodyType: { returnToSummary?: boolean };
  PreferencesSummary: undefined;
  ReferenceImageIntro: { returnToProfileMain?: boolean } | undefined;
  ReferenceImagePreference: { returnToProfileMain?: boolean } | undefined;
  Likes: undefined;
};

export type ChatStackParamList = {
  ChatList: undefined;
  ChatDetail: {
    chatId: string;
    name: string;
    avatar?: number | { uri: string };
    /** When true, show Accept / Decline / Block & Report (request mode) */
    isRequest?: boolean;
    /** Other user's id (for block API); required when isRequest is true */
    otherUserId?: string;
  };
};

export type TabStackParamList = {
  Home: undefined;
  Chat: NavigatorScreenParams<ChatStackParamList> | undefined;
  Match: undefined; // Center "ai" tab
  Likes: undefined;
  Profile: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  BasicDetailsName: { fromEditProfile?: boolean } | undefined;
  BasicDetailsDob: { fromEditProfile?: boolean } | undefined;
  BasicDetailsWeight: { fromEditProfile?: boolean } | undefined;
  BasicDetailsBodyType:
    | { fromEditProfile?: boolean; continueToOnboarding?: boolean }
    | undefined;
  BasicDetailsHeight: { fromEditProfile?: boolean } | undefined;
  BasicDetailsEducation: { fromEditProfile?: boolean } | undefined;
  BasicDetailsEmployment: { fromEditProfile?: boolean } | undefined;
  BasicDetailsIncome: { fromEditProfile?: boolean } | undefined;
  BasicDetailsReligion: { fromEditProfile?: boolean } | undefined;
  BasicDetailsMaritalStatus: { fromEditProfile?: boolean } | undefined;
  BasicDetailsChildren: { fromEditProfile?: boolean } | undefined;
  BasicDetailsEthnicity: { fromEditProfile?: boolean } | undefined;
  BasicDetailsInterests: { fromEditProfile?: boolean } | undefined;
  BasicDetailsPincode: { fromEditProfile?: boolean } | undefined;
  PreferencesSummary: undefined;
  PreferencesMatch: { returnToSummary?: boolean };
  PreferencesAge: { returnToSummary?: boolean };
  PreferencesHeight: { returnToSummary?: boolean };
  PreferencesDistance: { returnToSummary?: boolean };
  PreferencesEducation: { returnToSummary?: boolean };
  PreferencesEmployment: { returnToSummary?: boolean };
  PreferencesIncome: { returnToSummary?: boolean };
  PreferencesReligion: { returnToSummary?: boolean };
  PreferencesMaritalStatus: { returnToSummary?: boolean };
  PreferencesRelationshipIntent: { returnToSummary?: boolean };
  PreferencesBodyType: { returnToSummary?: boolean };
  ReferenceImageIntro: { returnToProfileMain?: boolean } | undefined;
  ReferenceImagePreference: { returnToProfileMain?: boolean } | undefined;
};
