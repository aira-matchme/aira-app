import React, { useCallback, useEffect, useRef } from 'react';
import { BackHandler, Platform } from 'react-native';
import {
  CommonActions,
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthNavigator } from './AuthNavigator';
import { TabNavigator } from './TabNavigator';
import { SplashScreen } from '../screens/SplashScreen';
import { MatchDetailsScreen } from '../screens/MatchDetailsScreen';
import { LostAccessEmailScreen } from '../screens/auth/LostAccessEmailScreen';
import { OTPVerificationScreen } from '../screens/auth/OTPVerificationScreen';
import { useAuthStore } from '../store/auth.store';
import { useApiErrorStore } from '../store/apiError.store';
import { getPostAuthScreen } from './getPostAuthScreen';
import { ApiErrorModal } from '../components/ApiErrorModal';
import ConnectivityWatcher from '../components/ConnectivityWatcher';
import SocketLifecycleManager from '../components/SocketLifecycleManager';
import CallLifecycleManager from '../components/CallLifecycleManager';
import { RequestTimeoutModal } from '../components/RequestTimeoutModal';
import { StoreUpdatePrompt } from '../components/StoreUpdatePrompt';
import { WaitlistScreen } from '../screens/WaitlistScreen';
import { isWaitlistEnabled } from '../config/env';
import { useWaitlistStore } from '../store/waitlist.store';
import type { RootStackParamList } from './types';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const rootNavigationRef = createNavigationContainerRef<RootStackParamList>();

type RootAuthDestination = 'AuthStack' | 'Tabs' | 'Waitlist';

export const RootNavigator = () => {
  const { isAuthenticated, isLoading, user, shouldShowEnableNotifications, preferenceFlowCompleted } =
    useAuthStore();
  const {
    visible: apiErrorVisible,
    message: apiErrorMessage,
    variant: apiErrorVariant,
    onRetry: apiErrorRetry,
    hideError: hideApiError,
  } = useApiErrorStore();
  const postAuthScreen = getPostAuthScreen(user ?? null, shouldShowEnableNotifications);
  const waitlistActive = isWaitlistEnabled();
  const hasEnteredWaitlistApp = useWaitlistStore((s) => s.hasEnteredApp);
  const waitlistGateOpen = waitlistActive && !hasEnteredWaitlistApp;
  const shouldShowWaitlist = isAuthenticated && waitlistGateOpen;
  const shouldShowTabs =
    isAuthenticated &&
    !waitlistGateOpen &&
    (postAuthScreen === 'Likes' || preferenceFlowCompleted);

  const authDestination: RootAuthDestination | null = isLoading
    ? null
    : shouldShowWaitlist
      ? 'Waitlist'
      : shouldShowTabs
        ? 'Tabs'
        : 'AuthStack';

  const lastAuthDestinationRef = useRef<RootAuthDestination | null>(null);

  const applyAuthDestination = useCallback(() => {
    if (isLoading || !authDestination || !rootNavigationRef.isReady()) {
      return;
    }

    const rootState = rootNavigationRef.getRootState();
    const routeNames = rootState?.routes.map((route) => route.name) ?? [];
    const hasStaleAuthOverlay = routeNames.some(
      (name) => name === 'OTPVerification' || name === 'LostAccessEmail',
    );
    const destinationChanged = lastAuthDestinationRef.current !== authDestination;

    if (!destinationChanged && !hasStaleAuthOverlay) {
      return;
    }

    lastAuthDestinationRef.current = authDestination;
    rootNavigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: authDestination }],
      }),
    );
  }, [authDestination, isLoading]);

  useEffect(() => {
    if (isLoading) {
      lastAuthDestinationRef.current = null;
    }
  }, [isLoading]);

  useEffect(() => {
    applyAuthDestination();
  }, [applyAuthDestination]);

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
    <NavigationContainer ref={rootNavigationRef} onReady={applyAuthDestination}>
      <ConnectivityWatcher />
      <SocketLifecycleManager />
      <CallLifecycleManager />
      <ApiErrorModal
        visible={apiErrorVisible}
        onClose={hideApiError}
        onRetry={apiErrorRetry}
        message={apiErrorMessage}
        variant={apiErrorVariant}
      />
      <RequestTimeoutModal />
      <StoreUpdatePrompt />
      <RootStack.Navigator
        initialRouteName={isLoading ? 'Splash' : authDestination ?? 'AuthStack'}
        screenOptions={{ headerShown: false }}
      >
        {isLoading ? (
          <RootStack.Screen name="Splash" component={SplashScreen} />
        ) : (
          <>
            <RootStack.Screen name="AuthStack" component={AuthNavigator} />
            <RootStack.Screen name="Tabs" component={TabNavigator} />
            {waitlistActive ? (
              <RootStack.Screen name="Waitlist" component={WaitlistScreen} />
            ) : null}
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
            <RootStack.Screen name="MatchDetails" component={MatchDetailsScreen} />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};
