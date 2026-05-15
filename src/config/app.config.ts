import DeviceInfo from 'react-native-device-info';
import { env } from './env';
import { getAdjustedApiUrl } from '../utils/network';

const packageJson = require('../../package.json') as { version?: string };

function trimOr(value: string | undefined | null, fallback: string): string {
  const t = typeof value === 'string' ? value.trim() : '';
  return t.length > 0 ? t : fallback;
}

/** Display name from the native app bundle (iOS CFBundleDisplayName / Android app_name). */
const DEFAULT_APP_NAME = 'Aira';

/**
 * Shared JS config. `version` comes from the **native** marketing version of the binary you are
 * running on this device — iOS (`CFBundleShortVersionString` / Xcode `MARKETING_VERSION`) and
 * Android (`versionName` in `android/app/build.gradle`) are **independent**, so they can show
 * different strings until you bump both for a release. To keep one user-facing number, align
 * those native values (and optionally `package.json` for the JS fallback when `getVersion()` is empty).
 */
export const appConfig = {
  apiBaseUrl: getAdjustedApiUrl(env.API_BASE_URL || ''),
  appName: trimOr(DeviceInfo.getApplicationName(), DEFAULT_APP_NAME),
  /** Marketing version for this install’s OS (see module note — iOS vs Android may differ). */
  version: trimOr(DeviceInfo.getVersion(), packageJson.version ?? '0.0.0'),
};
