declare module '@env' {
  export const API_BASE_URL: string;
  export const NODE_ENV: string;
  export const API_KEY: string;
  export const GOOGLE_CLIENT_ID: string;
  export const IOS_CLIENT_ID: string;

  // Sentry (optional)
  export const SENTRY_DSN: string | undefined;
  export const SENTRY_ENVIRONMENT: string | undefined;
  export const SENTRY_TRACES_SAMPLE_RATE: string | undefined;
  export const SENTRY_PROFILES_SAMPLE_RATE: string | undefined;
}
