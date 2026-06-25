import {
  API_BASE_URL,
  SOCKET_URL,
  NODE_ENV,
  API_KEY,
  GOOGLE_CLIENT_ID,
  IOS_CLIENT_ID,
  TENOR_API_KEY,
  IOS_APP_STORE_ID,
  STORE_UPDATE_CHECK_IN_DEV,
  AGORA_APP_ID,
  WAITLIST,
} from '@env';

export const env = {
  API_BASE_URL,
  SOCKET_URL,
  NODE_ENV,
  API_KEY,
  GOOGLE_CLIENT_ID,
  IOS_CLIENT_ID,
  TENOR_API_KEY,
  /** Numeric App Store id — optional iOS fallback if lookup omits `trackViewUrl`. */
  IOS_APP_STORE_ID,
  /** When `true` / `1`, run store update checks while `__DEV__` is true (local testing only). */
  STORE_UPDATE_CHECK_IN_DEV,
  AGORA_APP_ID,
  /** When `true` / `1`, logged-in users see the waitlist screen instead of the main app. */
  WAITLIST,
};

/** Returns true when `.env` has `WAITLIST=true` or `WAITLIST=1`. */
export function isWaitlistEnabled(): boolean {
  const v = String(WAITLIST ?? '').toLowerCase();
  return v === 'true' || v === '1';
}


