import * as Sentry from '@sentry/react-native';
import DeviceInfo from 'react-native-device-info';

import { getNativeDeviceId } from '../../utils/getNativeDeviceId';

/**
 * Attach stable device/app context to every Sentry event.
 * This runs once at app start and persists in scope.
 */
export async function syncSentryDeviceContext(): Promise<void> {
  let nativeDeviceId = '';
  try {
    nativeDeviceId = await getNativeDeviceId();
  } catch {
    nativeDeviceId = '';
  }

  const model = DeviceInfo.getModel();
  const brand = DeviceInfo.getBrand();
  const systemName = DeviceInfo.getSystemName();
  const systemVersion = DeviceInfo.getSystemVersion();
  const appVersion = DeviceInfo.getVersion();
  const buildNumber = DeviceInfo.getBuildNumber();
  const bundleId = DeviceInfo.getBundleId();

  Sentry.setTags({
    platform_os: systemName,
    app_version: appVersion,
    build_number: buildNumber,
    bundle_id: bundleId,
    ...(nativeDeviceId ? { device_id: nativeDeviceId } : {}),
  });

  Sentry.setContext('device', {
    id: nativeDeviceId || undefined,
    brand,
    model,
    os: systemName,
    osVersion: systemVersion,
  });

  Sentry.setContext('app', {
    version: appVersion,
    build: buildNumber,
    bundleId,
  });
}

