import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ReusableBottomSheet } from './BottomSheet';
import { GoogleIcon, AppleIcon, EmailIcon } from '../assets/icons/social';
import { colors, typography, spacing } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import { env } from '../config/env';
import { useSocialLogin } from '../modules/auth/hooks';
import { useAuthStore } from '../store/auth.store';
import { checkNotificationPermission } from '../config/permissions';
import { getPostAuthScreen } from '../navigation/getPostAuthScreen';
import type { SocialLoginRequest } from '../modules/auth/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import appleAuth from '@invertase/react-native-apple-authentication';
import { apiClient } from '../services/api/client';
import { endpoints } from '../services/api/endpoints';

const DEVICE_ID_KEY = '@device_id';

const generateInstallId = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

const getDeviceId = async (): Promise<string> => {
  try {
    const { getUniqueId } = require('react-native-device-info');
    const deviceId = await getUniqueId();
    if (deviceId) return deviceId;
  } catch {
    // DeviceInfo not available or failed
  }
  try {
    let id = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = generateInstallId();
      await AsyncStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch {
    return generateInstallId();
  }
};

type LoginOptionsNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface LoginOptionsBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}



export const LoginOptionsBottomSheet: React.FC<LoginOptionsBottomSheetProps> = ({
  isOpen,
  onClose,
}) => {
  const navigation = useNavigation<LoginOptionsNavigationProp>();
  const socialLoginMutation = useSocialLogin();
  const { setTokens, setUser, setShouldShowEnableNotifications } = useAuthStore();

  const resolvePostLoginScreen = async (
    user: { isProfileComplete?: boolean; profilePhoto?: unknown; livenessCheck?: boolean; galleryPhotosUploaded?: boolean; questionnaireCompleted?: boolean } | null
  ) => {
    let shouldShowNotifications = false;
    try {
      const notificationStatus = await checkNotificationPermission();
      shouldShowNotifications = notificationStatus !== 'granted';
      if (shouldShowNotifications) setShouldShowEnableNotifications(true);
    } catch {
      shouldShowNotifications = true;
      setShouldShowEnableNotifications(true);
    }
    return getPostAuthScreen(user, shouldShowNotifications);
  };

  const handleGoogleLogin = async () => {
  try {
    const { GoogleSignin } = require('@react-native-google-signin/google-signin');
    GoogleSignin.configure({
      webClientId: env.GOOGLE_CLIENT_ID || '',
      iosClientId: env.IOS_CLIENT_ID || undefined,
      offlineAccess: true,
    });
    await GoogleSignin.hasPlayServices({
      showPlayServicesUpdateDialog: true,
    });
    await GoogleSignin.signOut().catch(() => {});
    await GoogleSignin.revokeAccess().catch(() => {});
    const userInfo = await GoogleSignin.signIn();
    console.log('📱 Google Sign-In User Info:', userInfo);

    const { idToken } = userInfo;
    console.log(idToken)

    if (!idToken) {
      Alert.alert('Google Login Error', 'No ID token received.');
      return;
    }

    const payload = {
      idToken: idToken,
      deviceType: Platform.OS === 'android' ? 'android' : 'ios',
      deviceId: await getDeviceId(),
    };
console.log('🔑 Google Login Payload:', payload);
    const response = await apiClient.post(endpoints.auth.googleLogin, payload);
    console.log('🔑 Google Login Response:', response);
    const authData = response.data?.data ?? response.data;
    if (authData?.accessToken && authData?.refreshToken) {
      await setTokens(authData.accessToken, authData.refreshToken);
      if (authData?.user) {
        setUser(authData.user);
        const screen = await resolvePostLoginScreen(authData.user);
        onClose();
        navigation.navigate('AuthStack', { screen });
        return;
      }
    }

    onClose();
    navigation.navigate('AuthStack', { screen: 'EnableNotifications' });
  } catch (error: any) {
    console.error('Google login error:', error);
    if (error?.message?.includes('RNGoogleSignin') || error?.message?.includes('TurboModuleRegistry')) {
      Alert.alert(
        'Google Sign-In Not Available',
        'Please rebuild the app: run "cd android && ./gradlew clean" then "npx react-native run-android"',
      );
    }
  }
};


  async function handleAppleLogin() {
    try {
      const isSupported = appleAuth.isSupported;
      if (!isSupported) {
        Alert.alert('Apple login not supported on this device');
        return;
      }

      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [
          appleAuth.Scope.EMAIL,
          appleAuth.Scope.FULL_NAME,
        ],
      });

      const { identityToken } = appleAuthRequestResponse;

      if (!identityToken) {
        Alert.alert('Apple Login failed - No identity token');
        return;
      }

      const payload = {
        idToken:identityToken,
        deviceType: Platform.OS === 'android' ? 'android' : 'ios',
        deviceId: await getDeviceId(),
      };

      const response = await apiClient.post(endpoints.auth.appleLogin, payload);
      const authData = response.data?.data ?? response.data;
      if (authData?.accessToken && authData?.refreshToken) {
        await setTokens(authData.accessToken, authData.refreshToken);
        if (authData?.user) {
          setUser(authData.user);
          const screen = await resolvePostLoginScreen(authData.user);
          onClose();
          navigation.navigate('AuthStack', { screen });
          return;
        }
      }

      onClose();
      navigation.navigate('AuthStack', { screen: 'EnableNotifications' });
    } catch (error: any) {
      if (error.code === appleAuth.Error.CANCELED) {
        // User canceled - no need to alert
      } else {
        console.error('Apple login error:', error);
        Alert.alert('Apple login failed');
      }
    }
  }

  const handleEmailLogin = () => {
    onClose();
    navigation.navigate('EmailLogin');
  };

  // Don't render anything if not open
  if (!isOpen) {
    return null;
  }

  return (
      <ReusableBottomSheet
        isOpen={isOpen}
        onClose={onClose}
        snapPoints={['60%']} // Same height as other bottom sheets
        showDragHandle={true}
        showCloseButton={true}
        enablePanDownToClose={true}
      >
      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>
          Welcome to <Text style={styles.titleGradient}>aira</Text>
        </Text>
        <Text style={styles.subtitle}>
          Choose a method to login
        </Text>
      </View>

      {/* Login Buttons */}
      <View style={styles.buttonsContainer}>
        {/* Google Button */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleGoogleLogin}
          activeOpacity={0.8}
        >
          <View style={styles.iconContainer}>
            <GoogleIcon size={24} />
          </View>
          <Text style={styles.buttonText}>Continue With Google</Text>
        </TouchableOpacity>

        {/* Apple Button - Only on iOS */}
        {Platform.OS === 'ios' && (
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleAppleLogin}
            activeOpacity={0.8}
          >
            <View style={styles.iconContainer}>
              <AppleIcon size={24} color={colors.text.dark} />
            </View>
            <Text style={styles.buttonText}>Continue With Apple</Text>
          </TouchableOpacity>
        )}

        {/* Email Button */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleEmailLogin}
          activeOpacity={0.8}
        >
          <View style={styles.iconContainer}>
            <EmailIcon size={24} color={colors.text.dark} />
          </View>
          <Text style={styles.buttonText}>Continue With Email</Text>
        </TouchableOpacity>
      </View>
    </ReusableBottomSheet>
  );
};

const styles = StyleSheet.create({
  titleContainer: {
    alignItems: 'center',
    marginTop: 24, // Figma: top-[40px] from sheet top. Drag handle area ~16px (8px padding + 4px handle + 4px padding), so 40-16=24px
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 28, // Exact match with Figma: text-[28px]
    fontWeight: '500' as const, // Medium weight - matches Figma: font-['Clash_Grotesk:Medium']
    lineHeight: 36, // Exact match with Figma: leading-[36px]
    letterSpacing: 0,
    color: colors.text.dark,
    textAlign: 'center',
    fontFamily: typography.fontFamily.medium, // Clash Grotesk Medium
    marginBottom: spacing.sm, // 8px gap between title and subtitle
  },
  titleGradient: {
    fontSize: 28,
    fontWeight: '500' as const,
    lineHeight: 36,
    letterSpacing: 0,
    color: colors.primary.purple, // Gradient color - matches Figma gradient
    fontFamily: typography.fontFamily.medium,
  },
  subtitle: {
    fontSize: 16, // Exact match with Figma: text-[16px]
    fontWeight: '400' as const, // Regular weight - matches Figma: font-['Clash_Grotesk:Regular']
    lineHeight: 22, // Exact match with Figma: leading-[22px]
    letterSpacing: 0.32, // Exact match with Figma: tracking-[0.32px]
    color: colors.neutral[400], // #999 - matches Figma neutral/neutral_400
    textAlign: 'center',
    fontFamily: typography.fontFamily.regular, // Clash Grotesk Regular
  },
  buttonsContainer: {
    gap: 12, // 12px gap between buttons (per Figma: gap-[12px])
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[50],
    borderRadius: 100,
    paddingVertical: spacing.md, // 16px (py-[16px])
    paddingHorizontal: spacing.xl, // 32px (px-[32px])
    height: 54,
    gap: spacing.sm, // 8px gap between icon and text (gap-[8px])
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 16,
  },
  buttonText: {
    ...typography.button,
    color: colors.text.dark,
  },
});

