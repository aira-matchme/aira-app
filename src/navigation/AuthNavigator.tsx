import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { EnableNotificationsScreen } from '../screens/permissions/EnableNotificationsScreen';
import { EnableLocationScreen } from '../screens/permissions/EnableLocationScreen';
import { ProfileIntroScreen } from '../screens/profile/ProfileIntroScreen';
import { BasicDetailsNameScreen } from '../screens/profile/BasicDetailsNameScreen';
import { BasicDetailsDobScreen } from '../screens/profile/BasicDetailsDobScreen';
import { BasicDetailsWeightScreen } from '../screens/profile/BasicDetailsWeightScreen';
import { BasicDetailsHeightScreen } from '../screens/profile/BasicDetailsHeightScreen';
import { BasicDetailsEducationScreen } from '../screens/profile/BasicDetailsEducationScreen';
import { BasicDetailsEmploymentScreen } from '../screens/profile/BasicDetailsEmploymentScreen';
import { BasicDetailsIncomeScreen } from '../screens/profile/BasicDetailsIncomeScreen';
import { BasicDetailsReligionScreen } from '../screens/profile/BasicDetailsReligionScreen';
import { BasicDetailsPincodeScreen } from '../screens/profile/BasicDetailsPincodeScreen';
import { FaceVerificationScreen } from '../screens/profile/FaceVerificationScreen';
import { SelfieCameraScreen } from '../screens/profile/SelfieCameraScreen';
import { VideoVerificationScreen } from '../screens/profile/VideoVerificationScreen';
import { OnboardingIntroScreen } from '../screens/onboarding/OnboardingIntroScreen';
import { OnboardingRadioQuestionScreen } from '../screens/onboarding/OnboardingRadioQuestionScreen';
import { OnboardingMultiSelectQuestionScreen } from '../screens/onboarding/OnboardingMultiSelectQuestionScreen';
import { OnboardingCardQuestionScreen } from '../screens/onboarding/OnboardingCardQuestionScreen';
import { OnboardingBooleanQuestionScreen } from '../screens/onboarding/OnboardingBooleanQuestionScreen';
import { OnboardingPhotoQuestionScreen } from '../screens/onboarding/OnboardingPhotoQuestionScreen';
import { AuthStackParamList } from './types';
import { useAuthStore } from '../store/auth.store';

const Stack = createNativeStackNavigator<AuthStackParamList>();

// Full screen options for all profile screens
const profileScreenOptions = {
  headerShown: false,
  presentation: 'card' as const,
  animation: 'slide_from_right' as const,
  // Ensure full screen presentation
  contentStyle: {
    flex: 1,
  },
  // Full screen on iOS
  fullScreenGestureEnabled: false,
};

export const AuthNavigator = () => {
  const { isAuthenticated, user } = useAuthStore();

  // When profile has profilePhoto, go to VideoVerification; else normal flow
  const initialRouteName: keyof AuthStackParamList = !isAuthenticated
    ? 'Welcome'
    : !user?.isProfileComplete
    ? 'ProfileIntro'
    : user?.profilePhoto
    ? 'VideoVerification'
    : 'FaceVerification';

  // Set initial route based on auth state, but SplashScreen/AuthProvider will override with navigation
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={initialRouteName}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />

      <Stack.Screen name="EnableNotifications" component={EnableNotificationsScreen} />
      <Stack.Screen name="EnableLocation" component={EnableLocationScreen} />

      <Stack.Screen
        name="ProfileIntro"
        component={ProfileIntroScreen}
        options={profileScreenOptions}
      />
      <Stack.Screen
        name="BasicDetailsName"
        component={BasicDetailsNameScreen}
        options={profileScreenOptions}
      />
      <Stack.Screen
        name="BasicDetailsDob"
        component={BasicDetailsDobScreen}
        options={profileScreenOptions}
      />
      <Stack.Screen
        name="BasicDetailsWeight"
        component={BasicDetailsWeightScreen}
        options={profileScreenOptions}
      />
      <Stack.Screen
        name="BasicDetailsHeight"
        component={BasicDetailsHeightScreen}
        options={profileScreenOptions}
      />
      <Stack.Screen
        name="BasicDetailsEducation"
        component={BasicDetailsEducationScreen}
        options={profileScreenOptions}
      />
      <Stack.Screen
        name="BasicDetailsEmployment"
        component={BasicDetailsEmploymentScreen}
        options={profileScreenOptions}
      />
      <Stack.Screen
        name="BasicDetailsIncome"
        component={BasicDetailsIncomeScreen}
        options={profileScreenOptions}
      />
      <Stack.Screen
        name="BasicDetailsReligion"
        component={BasicDetailsReligionScreen}
        options={profileScreenOptions}
      />
      <Stack.Screen
        name="BasicDetailsPincode"
        component={BasicDetailsPincodeScreen}
        options={profileScreenOptions}
      />
      <Stack.Screen
        name="FaceVerification"
        component={FaceVerificationScreen}
        options={profileScreenOptions}
      />
      <Stack.Screen
        name="SelfieCamera"
        component={SelfieCameraScreen}
        options={profileScreenOptions}
      />
      <Stack.Screen
        name="VideoVerification"
        component={VideoVerificationScreen}
        options={profileScreenOptions}
      />
      <Stack.Screen
        name="OnboardingIntro"
        component={OnboardingIntroScreen}
        options={profileScreenOptions}
      />
      <Stack.Screen
        name="OnboardingRadioQuestion"
        component={OnboardingRadioQuestionScreen}
        options={profileScreenOptions}
      />
      <Stack.Screen
        name="OnboardingMultiSelectQuestion"
        component={OnboardingMultiSelectQuestionScreen}
        options={profileScreenOptions}
      />
      <Stack.Screen
        name="OnboardingCardQuestion"
        component={OnboardingCardQuestionScreen}
        options={profileScreenOptions}
      />
      <Stack.Screen
        name="OnboardingBooleanQuestion"
        component={OnboardingBooleanQuestionScreen}
        options={profileScreenOptions}
      />
      <Stack.Screen
        name="OnboardingPhotoQuestion"
        component={OnboardingPhotoQuestionScreen}
        options={profileScreenOptions}
      />
    </Stack.Navigator>
  );
};
