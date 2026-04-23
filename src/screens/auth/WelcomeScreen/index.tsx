import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ImageBackground,
  StatusBar,
  Linking,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Button } from '../../../components/Button';
import { ReusableBottomSheet } from '../../../components/BottomSheet';
import { EmailInput, validateEmail } from '../../../components/EmailInput';
import { LogoWordmark } from '../../../assets/icons/branding/LogoWordmark';
import { GoogleIcon, AppleIcon, EmailIcon } from '../../../assets/icons/social';
import { styles } from './styles';
import { colors, spacing, typography } from '../../../theme';
import type { AuthStackParamList } from '../../../navigation/types';
import { env } from '../../../config/env';
import { useAuthStore } from '../../../store/auth.store';
import {
  checkNotificationPermission,
} from '../../../config/permissions';
import { getPostAuthScreen } from '../../../navigation/getPostAuthScreen';
import appleAuth from '@invertase/react-native-apple-authentication';
import { apiClient } from '../../../services/api/client';
import { endpoints } from '../../../services/api/endpoints';
import { getDeviceToken } from '../../../services/firebase/messaging';
import { getNativeDeviceId } from '../../../utils/getNativeDeviceId';
import { useSendOtp } from '../../../modules/auth/hooks';
import Toast from 'react-native-toast-message';
import { STRINGS } from '../../../constants/strings';

const IMAGE_BACKGROUND = require('../../../assets/images/welcomescreen.png');

export const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const insets = useSafeAreaInsets();
  const [showLoginOptions, setShowLoginOptions] = useState(false);
  const [showEmailLoginSheet, setShowEmailLoginSheet] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const emailDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sheetTransitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { setTokens, setUser, setShouldShowEnableNotifications } = useAuthStore();
  const sendOtpMutation = useSendOtp();

  useEffect(() => {
    return () => {
      if (sheetTransitionTimerRef.current) {
        clearTimeout(sheetTransitionTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (emailDebounceTimerRef.current) {
      clearTimeout(emailDebounceTimerRef.current);
    }

    if (!email.trim()) {
      setEmailError(undefined);
      return;
    }

    emailDebounceTimerRef.current = setTimeout(() => {
      const validation = validateEmail(email);
      setEmailError(validation.isValid ? undefined : STRINGS.EMAIL_LOGIN.ERROR_INCORRECT_EMAIL);
    }, 500);

    return () => {
      if (emailDebounceTimerRef.current) {
        clearTimeout(emailDebounceTimerRef.current);
      }
    };
  }, [email]);

  useFocusEffect(
    React.useCallback(() => {
      // Always reset modal state when coming back to Welcome.
      setShowLoginOptions(false);
      setShowEmailLoginSheet(false);
      return undefined;
    }, [])
  );

  const fetchLatestProfile = async () => {
    try {
      const profileRes = await apiClient.get(endpoints.user.profile);
      return profileRes?.data?.data ?? profileRes?.data ?? null;
    } catch {
      return null;
    }
  };

  const resolvePostLoginScreen = async (
    user: {
      isProfileComplete?: boolean;
      profilePhoto?: unknown;
      livenessCheck?: boolean;
      galleryPhotosUploaded?: boolean;
      questionnaireCompleted?: boolean;
      onboardingVisualAttributesCompleted?: boolean;
      preferenceIsCompleted?: boolean;
      PreferenceIsCompleted?: boolean;
    } | null
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

  const handleGetStarted = () => {
    setShowLoginOptions(true);
  };

  const handleCloseLoginOptions = () => {
    setShowLoginOptions(false);
  };

  const handleTermsPress = () => {
    Linking.openURL('https://airamatchme.com/terms');
  };

  const handlePrivacyPress = () => {
    Linking.openURL('https://airamatchme.com/privacy');
  };

  const requestClose = () => {
    setShowLoginOptions(false);
  };

  const handleGoogleLogin = async () => {
    requestClose();
    try {
      const { GoogleSignin } = require('@react-native-google-signin/google-signin');
      GoogleSignin.configure({
        webClientId: env.GOOGLE_CLIENT_ID || '',
        iosClientId: env.IOS_CLIENT_ID || undefined,
        offlineAccess: true,
      });
      console.log('Checking Google Play Services...');
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      // await GoogleSignin.signOut().catch(() => {});
      // await GoogleSignin.revokeAccess().catch(() => {});
      const userInfo = await GoogleSignin.signIn();
      console.log('Google Sign-In successful, user info:', userInfo);

      const { idToken } = userInfo;
      if (!idToken) return;

      const deviceId = await getNativeDeviceId();
      const rawDeviceToken = await getDeviceToken();
      const deviceToken = String(rawDeviceToken ?? '').trim() || undefined;

      const payload = {
        idToken,
        deviceType: Platform.OS === 'android' ? 'android' : 'ios',
        deviceId,
        deviceToken,
      };

      const response = await apiClient.post(endpoints.auth.googleLogin, payload);
      const authData = response.data?.data ?? response.data;
      if (authData?.accessToken && authData?.refreshToken) {
        await setTokens(authData.accessToken, authData.refreshToken);
        const latestUser = (await fetchLatestProfile()) ?? authData?.user ?? null;
        if (latestUser) setUser(latestUser);
        const screen = await resolvePostLoginScreen(latestUser);
        navigation.navigate(screen as any);
        return;
      }
      navigation.navigate('ProfileIntro');
    } catch(e) {
      console.log('Google Sign-In error:', e);
      console.log('Google Sign-In failed');

      // Google login error
    }
  };

  const handleAppleLogin = async () => {
    requestClose();
    try {
      if (!appleAuth.isSupported) return;

      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      const { identityToken } = appleAuthRequestResponse;
      if (!identityToken) return;

      const deviceId = await getNativeDeviceId();
      const rawDeviceToken = await getDeviceToken();
      const deviceToken = String(rawDeviceToken ?? '').trim() || undefined;

      const payload = {
        idToken: identityToken,
        deviceType: Platform.OS === 'android' ? 'android' : 'ios',
        deviceId,
        deviceToken,
      };

      const response = await apiClient.post(endpoints.auth.appleLogin, payload);
      const authData = response.data?.data ?? response.data;
      if (authData?.accessToken && authData?.refreshToken) {
        await setTokens(authData.accessToken, authData.refreshToken);
        const latestUser = (await fetchLatestProfile()) ?? authData?.user ?? null;
        if (latestUser) setUser(latestUser);
        const screen = await resolvePostLoginScreen(latestUser);
        navigation.navigate(screen as any);
        return;
      }
      navigation.navigate('ProfileIntro');
    } catch (error: any) {
      if (error?.code !== appleAuth.Error.CANCELED) {
        // Apple login failed
      }
    }
  };

  const handleEmailLogin = () => {
    setShowLoginOptions(false);
    sheetTransitionTimerRef.current = setTimeout(() => {
      setShowEmailLoginSheet(true);
    }, 320);
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) {
      setEmailError(undefined);
    }
  };

  const handleEmailSheetClose = () => {
    setShowEmailLoginSheet(false);
    setEmail('');
    setEmailError(undefined);
  };

  const handleEmailContinue = async () => {
    const validation = validateEmail(email);
    if (!validation.isValid) {
      setEmailError(validation.error);
      return;
    }

    try {
      const response = await sendOtpMutation.mutateAsync({ email });
      if (response.statusCode === 200) {
        setShowEmailLoginSheet(false);
        void getDeviceToken().catch(() => {});
        navigation.navigate('OTPVerification', { email });
      }
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to send OTP. Please try again.',
      });
    }
  };

  const handleLostAccess = () => {
    setShowEmailLoginSheet(false);
    navigation.navigate('LostAccessEmail');
  };

  const isEmailValid = validateEmail(email).isValid;

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ImageBackground
        source={IMAGE_BACKGROUND}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={[
            'rgba(0, 0, 0, 0)',
            'rgba(0, 0, 0, 0.7)',
            'rgba(0, 0, 0, 0.9)',
          ]}
          locations={[0, 0.47, 1]}
          style={styles.overlay}
        >
          <View style={styles.logoContainer}>
            <LogoWordmark />
          </View>

          <View
            style={[
              styles.contentContainer,
              { paddingBottom: Math.max(insets.bottom, 20) + 16 },
            ]}
          >
            <Text style={styles.heading}>
              Meaningful connections, intelligently matched.
            </Text>

            <View style={styles.buttonContainer}>
              <Button
                title="Get Started"
                onPress={handleGetStarted}
                variant="primary"
              />
            </View>

            <Text
              style={styles.termsText}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              <Text>By continuing you agree to our </Text>
              <Text style={styles.link} onPress={handleTermsPress}>
                T&C
              </Text>
              <Text> and </Text>
              <Text style={styles.link} onPress={handlePrivacyPress}>
                Privacy Policy
              </Text>
            </Text>
          </View>
        </LinearGradient>
      </ImageBackground>
      <ReusableBottomSheet
        isOpen={showLoginOptions}
        onClose={handleCloseLoginOptions}
        snapPoints={Platform.OS === 'ios' ? ['60%'] : ['48%']}
        showDragHandle={true}
        showCloseButton={true}
        scrollEnabled={false}
        enablePanDownToClose={true}
      >
        <View style={sheetStyles.titleContainer}>
          <Text style={sheetStyles.title}>
            Welcome to <Text style={sheetStyles.titleGradient}>aira</Text>
          </Text>
          <Text style={sheetStyles.subtitle}>Choose a method to login</Text>
        </View>

        <View style={sheetStyles.buttonsContainer}>
          <TouchableOpacity style={sheetStyles.loginButton} onPress={handleGoogleLogin} activeOpacity={0.8}>
            <View style={sheetStyles.buttonContent}>
              <View style={sheetStyles.iconContainer}>
                <GoogleIcon size={24} />
              </View>
              <View style={sheetStyles.buttonTextWrapper}>
                <Text style={sheetStyles.buttonText}>Continue With Google</Text>
              </View>
            </View>
          </TouchableOpacity>

          {Platform.OS === 'ios' && (
            <TouchableOpacity style={sheetStyles.loginButton} onPress={handleAppleLogin} activeOpacity={0.8}>
              <View style={sheetStyles.buttonContent}>
                <View style={sheetStyles.iconContainer}>
                  <AppleIcon size={24} color={colors.text.dark} />
                </View>
                <View style={sheetStyles.buttonTextWrapper}>
                  <Text style={sheetStyles.buttonText}>Continue With Apple</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={sheetStyles.loginButton} onPress={handleEmailLogin} activeOpacity={0.8}>
            <View style={sheetStyles.buttonContent}>
              <View style={sheetStyles.iconContainer}>
                <EmailIcon size={24} color={colors.text.dark} />
              </View>
              <View style={sheetStyles.buttonTextWrapper}>
                <Text style={sheetStyles.buttonText}>Continue With Email</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ReusableBottomSheet>
      <ReusableBottomSheet
        isOpen={showEmailLoginSheet}
        onClose={handleEmailSheetClose}
        snapPoints={['60%']}
        showDragHandle={true}
        showCloseButton={true}
        scrollEnabled={false}
        enablePanDownToClose={true}
      >
        <View style={sheetStyles.titleContainer}>
          <Text style={sheetStyles.title}>{STRINGS.EMAIL_LOGIN.TITLE}</Text>
          <Text style={sheetStyles.subtitle}>{STRINGS.EMAIL_LOGIN.SUBTITLE}</Text>
        </View>

        <View style={sheetStyles.emailInputContainer}>
          <EmailInput
            value={email}
            onChangeText={handleEmailChange}
            placeholder={STRINGS.EMAIL_LOGIN.PLACEHOLDER}
            error={emailError || ''}
            autoFocus={true}
          />
        </View>

        <View style={sheetStyles.emailActionContainer}>
          {isEmailValid ? (
            <Button
              title={STRINGS.EMAIL_LOGIN.CONTINUE}
              onPress={handleEmailContinue}
              variant="primary"
              disabled={sendOtpMutation.isPending}
              loading={sendOtpMutation.isPending}
              style={sheetStyles.continueButtonActive}
            />
          ) : (
            <TouchableOpacity style={sheetStyles.continueButtonDisabled} disabled={true} activeOpacity={1}>
              <Text style={sheetStyles.continueButtonTextDisabled}>{STRINGS.EMAIL_LOGIN.CONTINUE}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={sheetStyles.lostAccessLink} onPress={handleLostAccess} activeOpacity={0.7}>
            <Text style={sheetStyles.lostAccessText}>{STRINGS.EMAIL_LOGIN.LOST_ACCESS}</Text>
          </TouchableOpacity>
        </View>
      </ReusableBottomSheet>
    </SafeAreaView>
  );
};

const sheetStyles = StyleSheet.create({
  titleContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '500',
    lineHeight: 36,
    letterSpacing: 0,
    color: colors.text.dark,
    textAlign: 'center',
    fontFamily: typography.fontFamily.medium,
    marginBottom: spacing.sm,
  },
  titleGradient: {
    fontSize: 28,
    fontWeight: '500',
    lineHeight: 36,
    letterSpacing: 0,
    color: colors.primary.purple,
    fontFamily: typography.fontFamily.medium,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
    letterSpacing: 0.32,
    color: colors.neutral[400],
    textAlign: 'center',
    fontFamily: typography.fontFamily.regular,
  },
  buttonsContainer: {
    gap: 12,
  },
  emailInputContainer: {
    marginBottom: 0,
    minHeight: 78,
  },
  emailActionContainer: {
    gap: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.md,
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
  continueButtonActive: {
    width: '100%',
    height: 54,
  },
  continueButtonDisabled: {
    width: '100%',
    height: 54,
    backgroundColor: colors.neutral[50],
    borderRadius: 100,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonTextDisabled: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
    letterSpacing: 0.32,
    color: colors.neutral[500],
    fontFamily: typography.fontFamily.medium,
  },
  lostAccessLink: {
    paddingVertical: spacing.xs,
  },
  lostAccessText: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0.28,
    color: colors.neutral[500],
    fontFamily: typography.fontFamily.regular,
    textAlign: 'center',
  },
});

