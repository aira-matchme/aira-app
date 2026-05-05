declare module '@env' {
  /** Sentry project DSN; leave empty to disable Sentry in local builds. */
  export const SENTRY_DSN: string | undefined;
  export const API_BASE_URL: string;
  export const NODE_ENV: string;
  export const API_KEY: string;
  export const GOOGLE_CLIENT_ID: string;
  export const IOS_CLIENT_ID: string;
  export const TENOR_API_KEY: string;
  /** Optional — numeric App Store app id for update deep link fallback on iOS. */
  export const IOS_APP_STORE_ID: string | undefined;
  /**
   * Optional — set to `true` in `.env` so {@link StoreUpdatePrompt} runs while Metro
   * is in dev mode (for UI / store-check debugging only; remove before shipping).
   */
  export const STORE_UPDATE_CHECK_IN_DEV: string | undefined;
  export const AGORA_APP_ID: string | undefined;
}

