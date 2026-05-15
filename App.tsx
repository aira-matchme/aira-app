import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { QueryProvider } from './src/app/QueryProvider';
import { ErrorBoundary } from './src/app/ErrorBoundary';
import { toastConfig } from './src/services/toast.srvice.tsx'
import { AppProvider } from './src/app/AppProvider';
import { AuthProvider } from './src/app/AuthProvider';
import { RootNavigator } from './src/navigation/RootNavigator';
import { SENTRY_DSN } from '@env';
import * as Sentry from '@sentry/react-native';
import { getSentryDist, getSentryRelease } from './src/services/sentry/release';
import { syncSentryDeviceContext } from './src/services/sentry/deviceContext';

const sentryDsn = typeof SENTRY_DSN === 'string' ? SENTRY_DSN.trim() : '';

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    release: getSentryRelease(),
    dist: getSentryDist(),

    // Adds more context data to events (IP address, cookies, user, etc.)
    // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
    sendDefaultPii: true,

    // Enable Logs
    enableLogs: true,
    /** When true, the SDK prints verbose internal logs (e.g. envelope serialization) to Metro — very noisy in local dev. */
    debug: false,

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
}

const App = () => {
  useEffect(() => {
    void syncSentryDeviceContext();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <ErrorBoundary>
        <QueryProvider>
          <AppProvider>
            <AuthProvider>
              <RootNavigator />
            </AuthProvider>
          </AppProvider>
        </QueryProvider>
      </ErrorBoundary>

      <Toast config={toastConfig} />
    </SafeAreaProvider>
  );
};

export default Sentry.wrap(App);
