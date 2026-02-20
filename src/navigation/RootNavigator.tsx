import React, { useEffect } from 'react';
import { BackHandler, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthNavigator } from './AuthNavigator';
import { TabNavigator } from './TabNavigator';
import { SplashScreen } from '../screens/SplashScreen';
import { EmailLoginScreen } from '../screens/auth/EmailLoginScreen';            
import { LostAccessEmailScreen } from '../screens/auth/LostAccessEmailScreen';
import { OTPVerificationScreen } from '../screens/auth/OTPVerificationScreen';
import { useAuthStore } from '../store/auth.store';
import { getPostAuthScreen } from './getPostAuthScreen';

const RootStack = createNativeStackNavigator();

export const RootNavigator = () => {
  const { isAuthenticated, isLoading, user, shouldShowEnableNotifications } = useAuthStore();
  console.log('🚀 RootNavigator - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);
  const postAuthScreen = getPostAuthScreen(user ?? null, shouldShowEnableNotifications);
  const shouldShowTabs = isAuthenticated && postAuthScreen === 'Likes';

  useEffect(() => {
    // Disable Android back button behavior
    if (Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          // Return true to prevent default back behavior
          return true;
        },
      );

      return () => backHandler.remove();
    }
  }, []);

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {/* Show SplashScreen while checking authentication */}
        {isLoading ? (
          <RootStack.Screen name="Splash" component={SplashScreen} />
        ) : (
          <>
            {shouldShowTabs ? (
              <RootStack.Screen name="Tabs" component={TabNavigator} />
            ) : (
              <RootStack.Screen name="AuthStack" component={AuthNavigator} />
            )}
            <RootStack.Screen
              name="EmailLogin"
              component={EmailLoginScreen}
              options={{ presentation: 'transparentModal' }}
            />
            <RootStack.Screen
              name="LostAccessEmail"
              component={LostAccessEmailScreen}
              options={{ presentation: 'transparentModal' }}
            />
            <RootStack.Screen
              name="OTPVerification"
              component={OTPVerificationScreen}
              options={{ presentation: 'transparentModal' }}
            />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};
