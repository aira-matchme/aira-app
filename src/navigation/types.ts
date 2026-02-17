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
  PreferencesMatch: undefined;
};

export type TabStackParamList = {
  Home: undefined;
  Profile: undefined;
};

