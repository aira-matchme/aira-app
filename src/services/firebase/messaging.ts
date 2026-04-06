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

    // iOS: getToken() requires registerForRemoteNotifications to have completed; otherwise native
    // getToken rejects with "unregistered". Await explicit registration before FCM token.
    if (Platform.OS === 'ios') {
      await messaging().registerDeviceForRemoteMessages();
    }

    const fcmToken = await messaging().getToken();
    return fcmToken;
  } catch (error) {
    if (__DEV__) {
      console.warn('[getDeviceToken] Failed to obtain FCM token', error);
    }
    return null;
  }
};
