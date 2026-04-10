import DeviceInfo from 'react-native-device-info';

/**
 * Sentry release identifier: bundleId@version+build (per platform).
 * Matches native version/build so events align with uploaded source maps.
 */
export function getSentryRelease(): string {
  try {
    const bundleId = DeviceInfo.getBundleId();
    const version = DeviceInfo.getVersion();
    const build = DeviceInfo.getBuildNumber();
    return `${bundleId}@${version}+${build}`;
  } catch {
    return 'com.unknown@0.0.0+0';
  }
}

/** Native build number — used as Sentry `dist` for symbolication. */
export function getSentryDist(): string {
  try {
    return DeviceInfo.getBuildNumber();
  } catch {
    return '0';
  }
}
