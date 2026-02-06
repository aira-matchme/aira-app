import { Platform, PermissionsAndroid } from 'react-native';

export type NotificationPermissionStatus = 'granted' | 'denied' | 'notDetermined';

export const requestNotificationPermission = async (): Promise<NotificationPermissionStatus> => {
  if (Platform.OS === 'ios') {
    try {
      // Dynamically import to reduce initial bundle size
      // This ensures the library is only loaded when needed
      const PushNotificationIOS = require('@react-native-community/push-notification-ios').default;
      // Use native iOS permission request
      // This will show the native iOS permission dialog as shown in Figma
      const authStatus = await PushNotificationIOS.requestPermissions({
        alert: true,
        badge: true,
        sound: true,
      });
      
      if (authStatus.alert || authStatus.badge || authStatus.sound) {
        return 'granted';
      } else {
        return 'denied';
      }
    } catch (error) {
      console.warn('Error requesting notification permission:', error);
      return 'notDetermined';
    }
  } else if (Platform.OS === 'android') {
    // Android 13+ (API 33+) requires runtime notification permission
    if (Platform.Version >= 33) {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied';
      } catch (error) {
        console.warn('Error requesting notification permission:', error);
        return 'denied';
      }
    } else {
      // Android 12 and below - notifications are enabled by default
      return 'granted';
    }
  }
  return 'notDetermined';
};

export type LocationPermissionStatus = 'granted' | 'denied' | 'notDetermined';

export const requestLocationPermission = async (): Promise<LocationPermissionStatus> => {
  if (Platform.OS === 'ios') {
    try {
      // Dynamically import to reduce initial bundle size
      const Geolocation = require('@react-native-community/geolocation');
      // Request location permission on iOS
      return new Promise((resolve) => {
        Geolocation.requestAuthorization(
          () => {
            // Permission granted, verify by getting current position
            Geolocation.getCurrentPosition(
              () => resolve('granted'),
              (error: any) => {
                if (error.code === 1) {
                  // Permission denied
                  resolve('denied');
                } else {
                  resolve('notDetermined');
                }
              },
              { enableHighAccuracy: false, timeout: 1000, maximumAge: 10000 }
            );
          },
          () => resolve('denied')
        );
      });
    } catch (error) {
      console.warn('Error requesting location permission:', error);
      return 'notDetermined';
    }
  } else if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied';
    } catch (error) {
      console.warn('Error requesting location permission:', error);
      return 'denied';
    }
  }
  return 'notDetermined';
};

export type CameraPermissionStatus = 'granted' | 'denied' | 'notDetermined';

export const requestCameraPermission = async (): Promise<CameraPermissionStatus> => {
  if (Platform.OS === 'ios') {
    try {
      // Check if react-native-permissions is available
      let PermissionsModule;
      try {
        PermissionsModule = require('react-native-permissions');
      } catch (requireError) {
        console.warn('react-native-permissions not available:', requireError);
        return 'notDetermined';
      }

      const { PERMISSIONS, request, check } = PermissionsModule;
      
      // First check current status
      const checkResult = await check(PERMISSIONS.IOS.CAMERA);
      console.log('Camera permission check result:', checkResult);
      
      if (checkResult === 'granted') {
        return 'granted';
      } else if (checkResult === 'denied' || checkResult === 'blocked') {
        return 'denied';
      } else if (checkResult === 'unavailable') {
        // On iOS Simulator, camera is unavailable
        // We'll treat this as if permission needs to be granted on a real device
        // For simulator testing, we can allow proceeding
        console.warn('Camera unavailable (likely iOS Simulator). For testing, treating as granted.');
        return 'granted'; // Allow on simulator for testing purposes
      }
      
      // Request permission if not determined
      // Note: On iOS Simulator, the permission dialog may not appear,
      // but the permission will still be requestable
      const result = await request(PERMISSIONS.IOS.CAMERA);
      console.log('Camera permission request result:', result);
      
      if (result === 'granted') {
        return 'granted';
      } else if (result === 'denied' || result === 'blocked') {
        return 'denied';
      } else if (result === 'unavailable') {
        // On iOS Simulator, camera is unavailable
        // For simulator testing, we can allow proceeding
        console.warn('Camera unavailable (likely iOS Simulator). For testing, treating as granted.');
        return 'granted'; // Allow on simulator for testing purposes
      }
      // If still notDetermined after request, it means user dismissed the dialog
      // or we're on simulator (simulator may return 'notDetermined' even after request)
      // On simulator, we'll treat it as if permission was requested
      return 'denied';
    } catch (error) {
      console.warn('Error requesting camera permission:', error);
      // If library isn't properly set up, return notDetermined
      // This will prompt user to enable in Settings
      return 'notDetermined';
    }
  } else if (Platform.OS === 'android') {
    try {
      // First check if permission is already granted
      const checkResult = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );
      
      if (checkResult) {
        console.log('Camera permission already granted');
        return 'granted';
      }

      // Request permission
      console.log('Requesting camera permission...');
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'Aira needs access to your camera to verify your identity.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      
      console.log('Camera permission request result:', granted);
      
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return 'granted';
      } else if (granted === PermissionsAndroid.RESULTS.DENIED) {
        return 'denied';
      } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        // User selected "Don't ask again"
        return 'denied';
      }
      return 'denied';
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return 'denied';
    }
  }
  return 'notDetermined';
};

