import * as Sentry from '@sentry/react-native';

import { env } from '../../config/env';

function parseSampleRate(value: unknown, fallback: number) {
  if (typeof value !== 'string') return fallback;
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return fallback;
  // Sentry expects a value between 0.0 and 1.0
  return Math.min(1, Math.max(0, parsed));
}

export const sentryDsn = env.SENTRY_DSN;
export const isSentryEnabled = Boolean(sentryDsn);

export function initSentry() {
  if (!sentryDsn) return;

  Sentry.init({
    dsn: sentryDsn,
    environment: env.SENTRY_ENVIRONMENT ?? env.NODE_ENV,
    debug: __DEV__,
    enableNative: true,
    enableAutoSessionTracking: true,
    sendDefaultPii: false,
    tracesSampleRate: parseSampleRate(env.SENTRY_TRACES_SAMPLE_RATE, 0),
    profilesSampleRate: parseSampleRate(env.SENTRY_PROFILES_SAMPLE_RATE, 0),
  });
}

export function wrapRootComponent<T>(RootComponent: T): T {
  if (!isSentryEnabled) return RootComponent;
  return Sentry.wrap(RootComponent as any) as any;
}
