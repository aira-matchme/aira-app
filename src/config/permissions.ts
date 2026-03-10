import { Platform, PermissionsAndroid } from 'react-native';
import { Camera } from 'react-native-vision-camera';
import {
  check as checkPermission,
  request as requestPermission,
  PERMISSIONS,
  RESULTS,
} from 'react-native-permissions';

export type NotificationPermissionStatus =
  | 'granted'
  | 'denied'
  | 'notDetermined';

/** Check notification permission status without requesting */
export const checkNotificationPermission =
  async (): Promise<NotificationPermissionStatus> => {
    if (Platform.OS === 'android') {
      try {
        const apiLevel = Platform.Version;
        if (typeof apiLevel === 'number' && apiLevel >= 33) {
          const granted = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );
          return granted ? 'granted' : 'denied';
        }
        return 'granted'; // Android < 33 has notifications enabled by default
      } catch {
        return 'denied';
      }
    }

    // iOS: Use @react-native-community/push-notification-ios
    try {
      const PushNotificationIOS = require('@react-native-community/push-notification-ios').default;
      const permissions = await new Promise<{ alert?: boolean }>((resolve) => {
        PushNotificationIOS.checkPermissions((p: { alert?: boolean }) => resolve(p || {}));
      });
      if (permissions?.alert === true) {
        return 'granted';
      }
      return permissions?.alert === false ? 'denied' : 'notDetermined';
    } catch {
      return 'notDetermined'; // Assume need to show EnableNotifications
    }
  };

/** Request notification permission (shows system prompt) */
export const requestNotificationPermission =
  async (): Promise<NotificationPermissionStatus> => {
    if (Platform.OS === 'android') {
      try {
        const apiLevel = Platform.Version;
        if (typeof apiLevel === 'number' && apiLevel >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            {
              title: 'Enable Notifications',
              message: 'Aira uses notifications to keep you updated on matches and messages.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED
            ? 'granted'
            : 'denied';
        }
        return 'granted';
      } catch {
        return 'denied';
      }
    }

    // iOS
    try {
      const PushNotificationIOS = require('@react-native-community/push-notification-ios').default;
      const permissions = await PushNotificationIOS.requestPermissions();
      return permissions?.alert === true ? 'granted' : 'denied';
    } catch {
      return 'denied';
    }
  };

export type CameraPermissionStatus =
  | 'granted'
  | 'denied'
  | 'notDetermined';

/** Check camera permission status without requesting */
export const checkCameraPermission =
  async (): Promise<CameraPermissionStatus> => {
    if (Platform.OS === 'ios') {
      try {
        const status = await Camera.getCameraPermissionStatus();
        if (status === 'granted') return 'granted';
        if (status === 'denied' || status === 'restricted') return 'denied';
        return 'notDetermined';
      } catch {
        return 'notDetermined';
      }
    }
    try {
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );
      return granted ? 'granted' : 'denied';
    } catch {
      return 'denied';
    }
  };

export const requestCameraPermission = async (): Promise<CameraPermissionStatus> => {
  if (Platform.OS === 'ios') {
    try {
      const status = await Camera.getCameraPermissionStatus();

      if (status === 'granted') {
        return 'granted';
      }

      if (status === 'denied' || status === 'restricted') {
        return 'denied';
      }

      if (status === 'not-determined') {
        const newStatus = await Camera.requestCameraPermission();

        return newStatus === 'granted' ? 'granted' : 'denied';
      }

      return 'denied';
    } catch (error) {
      return 'notDetermined';
    }
  }

  // ANDROID
  try {
    const checkResult = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.CAMERA
    );

    if (checkResult) return 'granted';

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED
      ? 'granted'
      : 'denied';
  } catch (error) {
    return 'denied';
  }
};

export type PhotoLibraryPermissionStatus =
  | 'granted'
  | 'denied'
  | 'notDetermined'
  | 'blocked'
  | 'limited';

function getPhotoLibraryPermission() {
  if (Platform.OS === 'ios') return PERMISSIONS.IOS.PHOTO_LIBRARY;
  const apiLevel = Platform.Version;
  if (typeof apiLevel === 'number' && apiLevel >= 33) {
    return PERMISSIONS.ANDROID.READ_MEDIA_IMAGES;
  }
  return PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
}

/** Check photo library permission without requesting */
export const checkPhotoLibraryPermission =
  async (): Promise<PhotoLibraryPermissionStatus> => {
    try {
      const permission = getPhotoLibraryPermission();
      const status = await checkPermission(permission);

      if (status === RESULTS.GRANTED || status === RESULTS.LIMITED) {
        return status === RESULTS.LIMITED ? 'limited' : 'granted';
      }
      if (status === RESULTS.BLOCKED) return 'blocked';
      if (status === RESULTS.DENIED) return 'denied';
      if (status === RESULTS.UNAVAILABLE) return 'denied';

      return 'notDetermined';
    } catch {
      return 'denied';
    }
  };

/** Request photo library permission */
export const requestPhotoLibraryPermission =
  async (): Promise<PhotoLibraryPermissionStatus> => {
    try {
      const permission = getPhotoLibraryPermission();
      const status = await requestPermission(permission);

      if (status === RESULTS.GRANTED || status === RESULTS.LIMITED) {
        return status === RESULTS.LIMITED ? 'limited' : 'granted';
      }
      if (status === RESULTS.BLOCKED) return 'blocked';
      return 'denied';
    } catch {
      return 'denied';
    }
  };

export type MicrophonePermissionStatus = 'granted' | 'denied' | 'notDetermined';

/** Check microphone permission (for voice recording) */
export const checkMicrophonePermission =
  async (): Promise<MicrophonePermissionStatus> => {
    try {
      const permission =
        Platform.OS === 'ios'
          ? PERMISSIONS.IOS.MICROPHONE
          : PERMISSIONS.ANDROID.RECORD_AUDIO;
      const status = await checkPermission(permission);
      if (status === RESULTS.GRANTED) return 'granted';
      if (status === RESULTS.DENIED || status === RESULTS.BLOCKED) return 'denied';
      return 'notDetermined';
    } catch {
      return 'denied';
    }
  };

/** Request microphone permission */
export const requestMicrophonePermission =
  async (): Promise<MicrophonePermissionStatus> => {
    try {
      const permission =
        Platform.OS === 'ios'
          ? PERMISSIONS.IOS.MICROPHONE
          : PERMISSIONS.ANDROID.RECORD_AUDIO;
      const status = await requestPermission(permission);
      return status === RESULTS.GRANTED ? 'granted' : 'denied';
    } catch {
      return 'denied';
    }
  };
