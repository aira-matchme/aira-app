import { Platform } from 'react-native';
import {
  getAndroidId,
  getAndroidIdSync,
  getUniqueId,
  getUniqueIdSync,
} from 'react-native-device-info';

const INVALID_IDS = new Set(['', 'unknown', 'null', 'undefined']);

function isValidDeviceId(value: string | null | undefined): value is string {
  if (value == null) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  return !INVALID_IDS.has(trimmed.toLowerCase());
}

/**
 * Device identifier from the OS (for pairing FCM/APNs tokens with a device).
 * Uses react-native-device-info only — no random install UUIDs.
 *
 * - iOS / default: `getUniqueId` (identifierForVendor semantics).
 * - Android: `getUniqueId` first, then `getAndroidId` if needed.
 */
export async function getNativeDeviceId(): Promise<string> {
  try {
    const unique = await getUniqueId();
    if (isValidDeviceId(unique)) return unique.trim();
  } catch {
    // native module unavailable
  }

  if (Platform.OS === 'android') {
    try {
      const androidId = await getAndroidId();
      if (isValidDeviceId(androidId)) return androidId.trim();
    } catch {
      // ignore
    }
  }

  try {
    const syncUnique = getUniqueIdSync();
    if (isValidDeviceId(syncUnique)) return syncUnique.trim();
  } catch {
    // ignore
  }

  if (Platform.OS === 'android') {
    try {
      const syncAndroid = getAndroidIdSync();
      if (isValidDeviceId(syncAndroid)) return syncAndroid.trim();
    } catch {
      // ignore
    }
  }

  return '';
}
