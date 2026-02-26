import React, { Suspense } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileTabScreen } from '../screens/ProfileTabScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { PreferencesSummaryScreen } from '../screens/preferences/PreferencesSummaryScreen';
import { PreferencesMatchScreen } from '../screens/preferences/PreferencesMatchScreen';
import { PreferencesAgeScreen } from '../screens/preferences/PreferencesAgeScreen';
import { PreferencesHeightScreen } from '../screens/preferences/PreferencesHeightScreen';
import { PreferencesDistanceScreen } from '../screens/preferences/PreferencesDistanceScreen';
import { PreferencesEducationScreen } from '../screens/preferences/PreferencesEducationScreen';
import { PreferencesEmploymentScreen } from '../screens/preferences/PreferencesEmploymentScreen';
import { PreferencesIncomeScreen } from '../screens/preferences/PreferencesIncomeScreen';
import { PreferencesMaritalStatusScreen } from '../screens/preferences/PreferencesMaritalStatusScreen';
import type { ProfileStackParamList } from './types';

const PreferencesBodyTypeScreenLazy = React.lazy(() =>
  import('../screens/preferences/PreferencesBodyTypeScreen').then((m) => ({
    default: m.PreferencesBodyTypeScreen,
  }))
);

function PreferencesBodyTypeScreenWithSuspense(props: object) {
  return (
    <Suspense
      fallback={
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      }
    >
      <PreferencesBodyTypeScreenLazy {...props} />
    </Suspense>
  );
}

const Stack = createNativeStackNavigator<ProfileStackParamList>();

const profileScreenOptions = {
  presentation: 'card' as const,
  animation: 'slide_from_right' as const,
};

export const ProfileStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileMain" component={ProfileTabScreen} />
    <Stack.Screen
      name="EditProfile"
      component={EditProfileScreen}
      options={profileScreenOptions}
    />
    <Stack.Screen
      name="PreferencesSummary"
      component={PreferencesSummaryScreen}
      options={profileScreenOptions}
    />
    <Stack.Screen
      name="PreferencesMatch"
      component={PreferencesMatchScreen}
      options={profileScreenOptions}
    />
    <Stack.Screen
      name="PreferencesAge"
      component={PreferencesAgeScreen}
      options={profileScreenOptions}
    />
    <Stack.Screen
      name="PreferencesHeight"
      component={PreferencesHeightScreen}
      options={profileScreenOptions}
    />
    <Stack.Screen
      name="PreferencesDistance"
      component={PreferencesDistanceScreen}
      options={profileScreenOptions}
    />
    <Stack.Screen
      name="PreferencesEducation"
      component={PreferencesEducationScreen}
      options={profileScreenOptions}
    />
    <Stack.Screen
      name="PreferencesEmployment"
      component={PreferencesEmploymentScreen}
      options={profileScreenOptions}
    />
    <Stack.Screen
      name="PreferencesIncome"
      component={PreferencesIncomeScreen}
      options={profileScreenOptions}
    />
    <Stack.Screen
      name="PreferencesMaritalStatus"
      component={PreferencesMaritalStatusScreen}
      options={profileScreenOptions}
    />
    <Stack.Screen
      name="PreferencesBodyType"
      component={PreferencesBodyTypeScreenWithSuspense}
      options={profileScreenOptions}
    />
  </Stack.Navigator>
);
