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
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { ReusableBottomSheet } from './BottomSheet';
import { GoogleIcon, AppleIcon, EmailIcon } from '../assets/icons/social';
import { colors, typography, spacing } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import { env } from '../config/env';
import { useSocialLogin } from '../modules/auth/hooks';
import { useAuthStore } from '../store/auth.store';
import type { SocialLoginRequest } from '../modules/auth/types';
import { Alert } from 'react-native';

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
  const { setTokens, setUser } = useAuthStore();

  // Configure Google Sign-In once when this module is loaded
  // GoogleSignin.configure({
  //   webClientId: env.GOOGLE_CLIENT_ID,
  // });
  // console.log('🔑 Google Client ID:', env.GOOGLE_CLIENT_ID);

  const handleGoogleLogin = async () => {
    try {
      // Ensure Google Play Services are available (Android)
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Trigger Google Sign-In
      const userInfo = await GoogleSignin.signIn();
      console.log('📱 Google Sign-In User Info:', userInfo);

      const { user } = userInfo;

      const providerId = user.id ?? '';
      const email = user.email ?? '';
      const name =
        user.name ??
        [user.givenName, user.familyName].filter(Boolean).join(' ') ??
        '';
      const profilePicture = user.photo ?? '';

      if (!providerId || !email) {
        // Alert.alert('Google Login Error', 'Could not retrieve Google account information.');
        return;
      }

      const payload: SocialLoginRequest = {
        provider: 'google',
        providerId,
        email,
        name,
        profilePicture,
        // If the user can log in with Google, the email is considered verified by Google
        emailVerified: true,
        googleId: providerId,
        // device info can be added later when FCM is integrated
        deviceType: Platform.OS === 'android' ? 'android' : 'ios',
      };

      const response = await socialLoginMutation.mutateAsync(payload);

      // Store tokens and user data in auth store
      if (response.data?.accessToken && response.data?.refreshToken) {
        await setTokens(response.data.accessToken, response.data.refreshToken);
        // Also set user data from response
        if (response.data?.user) {
          setUser(response.data.user);
        }
      }

      onClose();
      // Navigate to ProfileIntro after successful login
      navigation.navigate('AuthStack', { screen: 'ProfileIntro' });
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // User cancelled the sign-in; no need to show an error
        return;
      }
      if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert('Google Login', 'Sign-in already in progress.');
        return;
      }
      if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Google Login Error', 'Google Play Services not available or outdated.');
        return;
      }

      console.error('Google login error:', error);
    }
  };

  const handleAppleLogin = () => {
    // TODO: Implement Apple OAuth
    console.log('Apple login');
    onClose();
  };

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

