import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

export const getDeviceToken = async (): Promise<string | null> => {
  try {
    // Request permission (especially required for iOS)
    const authStatus = await messaging().requestPermission();

    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      return null;
    }

    // Get FCM token
    const fcmToken = await messaging().getToken();

    console.log('🔥 FCM Token:', fcmToken);

    return fcmToken;
  } catch (error) {
    console.error('FCM Token Error:', error);
    return null;
  }
};
