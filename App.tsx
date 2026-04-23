import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { QueryProvider } from './src/app/QueryProvider';
import { AppProvider } from './src/app/AppProvider';
import { AuthProvider } from './src/app/AuthProvider';
import { RootNavigator } from './src/navigation/RootNavigator';
import * as Sentry from '@sentry/react-native';
import { getSentryDist, getSentryRelease } from './src/services/sentry/release';
import { syncSentryDeviceContext } from './src/services/sentry/deviceContext';

Sentry.init({
  dsn: 'https://21d056737c05cfb00b3a0c1188669429@o4511193937739776.ingest.us.sentry.io/4511193938788352',
  release: getSentryRelease(),
  dist: getSentryDist(),

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,
  debug: __DEV__,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [
    Sentry.mobileReplayIntegration(),
    Sentry.feedbackIntegration(),
  ],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

const App = () => {
  useEffect(() => {
    void syncSentryDeviceContext();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <QueryProvider>
        <AppProvider>
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
        </AppProvider>
      </QueryProvider>

      <Toast />
    </SafeAreaProvider>
  );
};

export default Sentry.wrap(App);
