import { Platform, PermissionsAndroid } from 'react-native';
import { Camera } from 'react-native-vision-camera';

export type CameraPermissionStatus =
  | 'granted'
  | 'denied'
  | 'notDetermined';

export const requestCameraPermission = async (): Promise<CameraPermissionStatus> => {
  if (Platform.OS === 'ios') {
    try {
      const status = await Camera.getCameraPermissionStatus();
      console.log('VisionCamera current status:', status);

      if (status === 'granted') {
        return 'granted';
      }

      if (status === 'denied' || status === 'restricted') {
        return 'denied';
      }

      if (status === 'not-determined') {
        const newStatus = await Camera.requestCameraPermission();
        console.log('VisionCamera request result:', newStatus);

        return newStatus === 'granted' ? 'granted' : 'denied';
      }

      return 'denied';
    } catch (error) {
      console.warn('Error requesting camera permission:', error);
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
    console.error('Error requesting camera permission:', error);
    return 'denied';
  }
};
