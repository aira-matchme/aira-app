import React, { Suspense } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileTabScreen } from '../screens/ProfileTabScreen';
import { BlockedUsersScreen } from '../screens/profile/BlockedUsersScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { BasicDetailsNameScreen } from '../screens/profile/BasicDetailsNameScreen';
import { BasicDetailsDobScreen } from '../screens/profile/BasicDetailsDobScreen';
import { BasicDetailsWeightScreen } from '../screens/profile/BasicDetailsWeightScreen';
import { BasicDetailsBodyTypeScreen } from '../screens/profile/BasicDetailsBodyTypeScreen';
import { BasicDetailsHeightScreen } from '../screens/profile/BasicDetailsHeightScreen';
import { BasicDetailsEducationScreen } from '../screens/profile/BasicDetailsEducationScreen';
import { BasicDetailsEmploymentScreen } from '../screens/profile/BasicDetailsEmploymentScreen';
import { BasicDetailsIncomeScreen } from '../screens/profile/BasicDetailsIncomeScreen';
import { BasicDetailsReligionScreen } from '../screens/profile/BasicDetailsReligionScreen';
import { BasicDetailsMaritalStatusScreen } from '../screens/profile/BasicDetailsMaritalStatusScreen';
import { BasicDetailsChildrenScreen } from '../screens/profile/BasicDetailsChildrenScreen';
import { BasicDetailsEthnicityScreen } from '../screens/profile/BasicDetailsEthnicityScreen';
import { BasicDetailsInterestsScreen } from '../screens/profile/BasicDetailsInterestsScreen';
import { BasicDetailsPincodeScreen } from '../screens/profile/BasicDetailsPincodeScreen';
import { PreferencesSummaryScreen } from '../screens/preferences/PreferencesSummaryScreen';
import { PreferencesMatchScreen } from '../screens/preferences/PreferencesMatchScreen';
import { PreferencesAgeScreen } from '../screens/preferences/PreferencesAgeScreen';
import { PreferencesHeightScreen } from '../screens/preferences/PreferencesHeightScreen';
import { PreferencesDistanceScreen } from '../screens/preferences/PreferencesDistanceScreen';
import { PreferencesEducationScreen } from '../screens/preferences/PreferencesEducationScreen';
import { PreferencesEmploymentScreen } from '../screens/preferences/PreferencesEmploymentScreen';
import { PreferencesIncomeScreen } from '../screens/preferences/PreferencesIncomeScreen';
import { PreferencesReligionScreen } from '../screens/preferences/PreferencesReligionScreen';
import { PreferencesMaritalStatusScreen } from '../screens/preferences/PreferencesMaritalStatusScreen';
import { PreferencesRelationshipIntentScreen } from '../screens/preferences/PreferencesRelationshipIntentScreen';
import { ReferenceImageIntroScreen } from '../screens/preferences/ReferenceImageIntroScreen';
import { ReferenceImagePreferenceScreen } from '../screens/preferences/ReferenceImagePreferenceScreen';
import { SubscriptionScreen } from '../screens/Subscription';
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
      name="BlockedUsers"
      component={BlockedUsersScreen}
      options={profileScreenOptions}
    />
    <Stack.Screen
      name="EditProfile"
      component={EditProfileScreen}
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
      name="BasicDetailsBodyType"
      component={BasicDetailsBodyTypeScreen}
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
      name="BasicDetailsMaritalStatus"
      component={BasicDetailsMaritalStatusScreen}
      options={profileScreenOptions}
    />
    <Stack.Screen
      name="BasicDetailsChildren"
      component={BasicDetailsChildrenScreen}
      options={profileScreenOptions}
    />
    <Stack.Screen
      name="BasicDetailsEthnicity"
      component={BasicDetailsEthnicityScreen}
      options={profileScreenOptions}
    />
    <Stack.Screen
      name="BasicDetailsInterests"
      component={BasicDetailsInterestsScreen}
      options={profileScreenOptions}
    />
    <Stack.Screen
      name="BasicDetailsPincode"
      component={BasicDetailsPincodeScreen}
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
      name="PreferencesReligion"
      component={PreferencesReligionScreen}
      options={profileScreenOptions}
    />
    <Stack.Screen
      name="PreferencesMaritalStatus"
      component={PreferencesMaritalStatusScreen}
      options={profileScreenOptions}
    />
    <Stack.Screen
      name="PreferencesRelationshipIntent"
      component={PreferencesRelationshipIntentScreen}
      options={profileScreenOptions}
    />
    <Stack.Screen
      name="PreferencesBodyType"
      component={PreferencesBodyTypeScreenWithSuspense}
      options={profileScreenOptions}
    />
    <Stack.Screen
      name="ReferenceImageIntro"
      component={ReferenceImageIntroScreen}
      options={profileScreenOptions}
    />
    <Stack.Screen
      name="ReferenceImagePreference"
      component={ReferenceImagePreferenceScreen}
      options={profileScreenOptions}
    />
    <Stack.Screen
      name="Subscription"
      component={SubscriptionScreen}
      options={profileScreenOptions}
    />
  </Stack.Navigator>
);
