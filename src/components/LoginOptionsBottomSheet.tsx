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
import AsyncStorage from '@react-native-async-storage/async-storage';
import appleAuth from '@invertase/react-native-apple-authentication';
import { apiClient } from '../services/api/client';
import { endpoints } from '../services/api/endpoints';
import { getDeviceToken } from '../services/firebase/messaging';

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

    const { idToken } = userInfo;

    if (!idToken) {
      return;
    }

    const payload = {
      idToken: idToken,
      deviceType: Platform.OS === 'android' ? 'android' : 'ios',
      deviceId: await getDeviceId(),
      deviceToken: await getDeviceToken(),

    };
    const response = await apiClient.post(endpoints.auth.googleLogin, payload);
    const authData = response.data?.data ?? response.data;
    if (authData?.accessToken && authData?.refreshToken) {
      await setTokens(authData.accessToken, authData.refreshToken);
      if (authData?.user) {
        setUser(authData.user);
        const screen = await resolvePostLoginScreen(authData.user);
        onClose();
        navigation.navigate('AuthStack', { screen } as any);
        return;
      }
    }

    onClose();
    navigation.navigate('AuthStack', { screen: 'EnableNotifications' });
  } catch (error: any) {
    // Google login error
  }
};


  async function handleAppleLogin() {
    try {
      const isSupported = appleAuth.isSupported;
      if (!isSupported) {
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
        return;
      }

      const payload = {
        idToken:identityToken,
        deviceType: Platform.OS === 'android' ? 'android' : 'ios',
        deviceId: await getDeviceId(),
        deviceToken: await getDeviceToken(),
      };

      const response = await apiClient.post(endpoints.auth.appleLogin, payload);
      const authData = response.data?.data ?? response.data;
      if (authData?.accessToken && authData?.refreshToken) {
        await setTokens(authData.accessToken, authData.refreshToken);
        if (authData?.user) {
          setUser(authData.user);
          const screen = await resolvePostLoginScreen(authData.user);
          onClose();
          navigation.navigate('AuthStack', { screen } as any);
          return;
        }
      }

      onClose();
      navigation.navigate('AuthStack', { screen: 'EnableNotifications' });
    } catch (error: any) {
      if (error.code !== appleAuth.Error.CANCELED) {
        // Apple login failed
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

  const hasApple = Platform.OS === 'ios';
  const snapPoints = hasApple ? ['60%'] : ['48%'];

  return (
      <ReusableBottomSheet
        isOpen={isOpen}
        onClose={onClose}
        snapPoints={snapPoints}
        showDragHandle={true}
        showCloseButton={true}
        scrollEnabled={false}
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
          <View style={styles.buttonContent}>
            <View style={styles.iconContainer}>
              <GoogleIcon size={24} />
            </View>
            <View style={styles.buttonTextWrapper}>
              <Text style={styles.buttonText}>Continue With Google</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Apple Button - Only on iOS */}
        {Platform.OS === 'ios' && (
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleAppleLogin}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <View style={styles.iconContainer}>
                <AppleIcon size={24} color={colors.text.dark} />
              </View>
              <View style={styles.buttonTextWrapper}>
                <Text style={styles.buttonText}>Continue With Apple</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Email Button */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleEmailLogin}
          activeOpacity={0.8}
        >
          <View style={styles.buttonContent}>
            <View style={styles.iconContainer}>
              <EmailIcon size={24} color={colors.text.dark} />
            </View>
            <View style={styles.buttonTextWrapper}>
              <Text style={styles.buttonText}>Continue With Email</Text>
            </View>
          </View>
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
    gap: 12,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[50],
    borderRadius: 100,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    height: 54,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonTextWrapper: {
    justifyContent: 'center',
  },
  buttonText: {
    ...typography.button,
    color: colors.text.dark,
  },
});

