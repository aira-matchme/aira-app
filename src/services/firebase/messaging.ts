import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import * as Sentry from '@sentry/react-native';

const GET_TOKEN_RETRY_DELAY_MS = 1000;
/** iOS cold start / APNs can lag; empty `getToken()` is common for many seconds without retries. */
const MAX_GET_TOKEN_ATTEMPTS = 20;

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Concurrent callers await the same resolution (one permission flow, one retry loop). */
let inFlight: Promise<string | null> | null = null;

async function resolveDeviceTokenOnce(): Promise<string | null> {
  try {
    const authStatus = await messaging().requestPermission();

    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      Sentry.captureMessage('FCM permission not granted while requesting device token', {
        level: 'warning',
        tags: { area: 'auth', flow: 'otp-verify' },
        extra: { platform: Platform.OS, authStatus },
      });
      return null;
    }

    if (Platform.OS === 'ios') {
      await messaging().registerDeviceForRemoteMessages();
    }

    for (let attempt = 0; attempt < MAX_GET_TOKEN_ATTEMPTS; attempt += 1) {
      try {
        const raw = await messaging().getToken();
        const token = typeof raw === 'string' ? raw.trim() : '';
        if (token) return token;
      } catch (error) {
        if (__DEV__) {
          console.warn('[getDeviceToken] getToken failed', attempt + 1, error);
        }
      }
      if (attempt < MAX_GET_TOKEN_ATTEMPTS - 1) {
        await wait(GET_TOKEN_RETRY_DELAY_MS);
      }
    }

    if (__DEV__) {
      console.warn('[getDeviceToken] No non-empty FCM token after retries');
    }
    Sentry.captureMessage('FCM token empty after retries', {
      level: 'warning',
      tags: { area: 'auth', flow: 'otp-verify' },
      extra: {
        platform: Platform.OS,
        attempts: MAX_GET_TOKEN_ATTEMPTS,
        retryDelayMs: GET_TOKEN_RETRY_DELAY_MS,
      },
    });
    return null;
  } catch (error) {
    if (__DEV__) {
      console.warn('[getDeviceToken] Failed to obtain FCM token', error);
    }
    Sentry.captureException(error, {
      tags: { area: 'auth', flow: 'otp-verify' },
      extra: { platform: Platform.OS },
    });
    return null;
  }
}

/**
 * FCM registration token for this install, or null if notifications are off / token not ready.
 * Retries `getToken()` to work around iOS APNs delays; coalesces parallel callers.
 */
export const getDeviceToken = async (): Promise<string | null> => {
  if (inFlight) {
    return inFlight;
  }
  inFlight = resolveDeviceTokenOnce();
  try {
    return await inFlight;
  } finally {
    inFlight = null;
  }
};
