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
  EnableLocation: undefined;
  ProfileIntro: undefined;
  BasicDetailsName: undefined;
  BasicDetailsDob: undefined;
  BasicDetailsWeight: undefined;
  BasicDetailsHeight: undefined;
  BasicDetailsEducation: undefined;
  BasicDetailsEmployment: undefined;
  BasicDetailsIncome: undefined;
  BasicDetailsReligion: undefined;
  BasicDetailsMaritalStatus: undefined;
  BasicDetailsChildren: undefined;
  BasicDetailsInterests: undefined;
  BasicDetailsPincode: undefined;
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
  PreferencesMaritalStatus: { returnToSummary?: boolean };
  PreferencesBodyType: { returnToSummary?: boolean };
  PreferencesSummary: undefined;
  Likes: undefined;
};

export type TabStackParamList = {
  Home: undefined;
  Chat: undefined;
  Match: undefined; // Center "ai" tab
  Likes: undefined;
  Profile: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  PreferencesSummary: undefined;
  PreferencesMatch: { returnToSummary?: boolean };
  PreferencesAge: { returnToSummary?: boolean };
  PreferencesHeight: { returnToSummary?: boolean };
  PreferencesDistance: { returnToSummary?: boolean };
  PreferencesEducation: { returnToSummary?: boolean };
  PreferencesEmployment: { returnToSummary?: boolean };
  PreferencesIncome: { returnToSummary?: boolean };
  PreferencesMaritalStatus: { returnToSummary?: boolean };
  PreferencesBodyType: { returnToSummary?: boolean };
};

export type ChatStackParamList = {
  ChatList: undefined;
  ChatDetail: {
    chatId: string;
    name: string;
    avatar?: number | { uri: string };
  };
};

