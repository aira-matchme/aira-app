import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ReusableBottomSheet } from '../../../components/BottomSheet';
import { OTPInput } from '../../../components/OTPInput';
import { Button } from '../../../components/Button';
import { VerifiedIcon } from '../../../assets/icons/common/VerifiedIcon';
import { colors } from '../../../theme';
import { STRINGS } from '../../../constants/strings';
import type { RootStackParamList, AuthStackParamList } from '../../../navigation/types';
import { useVerifyOtp, useSendOtp, useResendOtp } from '../../../modules/auth/hooks';
import { getProfileApi } from '../../../modules/auth/api';
import { useAuthStore } from '../../../store/auth.store';
import { useSubscriptionStore } from '../../../store/subscription.store';
import {
  checkNotificationPermission,
} from '../../../config/permissions';
import { getPostAuthScreen, type PostAuthUser } from '../../../navigation/getPostAuthScreen';
import Toast from 'react-native-toast-message';
import * as Sentry from '@sentry/react-native';
import { styles } from './styles';
import { getDeviceToken } from '../../../services/firebase/messaging';
import { getNativeDeviceId } from '../../../utils/getNativeDeviceId';

type OTPVerificationNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'OTPVerification'
>;

type OTPVerificationRouteProp = RouteProp<RootStackParamList, 'OTPVerification'>;

const otpSchema = z.object({
  otp: z
    .string()
    .min(1, STRINGS.OTP_VERIFICATION.ERROR_REQUIRED)
    .length(6, STRINGS.OTP_VERIFICATION.ERROR_INVALID_LENGTH)
    .regex(/^\d{6}$/, STRINGS.OTP_VERIFICATION.ERROR_INVALID_OTP),
});

type OTPFormData = z.infer<typeof otpSchema>;

const OTP_RESEND_TIMER = 50;

export const OTPVerificationScreen: React.FC = () => {
  const navigation = useNavigation<OTPVerificationNavigationProp>();
  const route = useRoute<OTPVerificationRouteProp>();
  const email = route.params?.email || '';

  const [resendTimer, setResendTimer] = useState(OTP_RESEND_TIMER);
  const [canResend, setCanResend] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [apiError, setApiError] = useState<string | undefined>();
  const [isSubmittingVerify, setIsSubmittingVerify] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  /** Warm FCM token while the user waits for the email; avoids verify-time races on iOS APNs. */
  const deviceTokenRef = useRef<string | null | undefined>(undefined);

  const verifyOtpMutation = useVerifyOtp();
  const sendOtpMutation = useSendOtp();
  const resendOtpMutation = useResendOtp();
  const { setTokens, setUser, setShouldShowEnableNotifications } = useAuthStore();
  const syncFromProfile = useSubscriptionStore((s) => s.syncFromProfile);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setError,
    clearErrors,
  } = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    mode: 'onChange',
    defaultValues: {
      otp: '',
    },
  });

  const handleOTPChange = (_text: string) => {
    if (apiError) {
      setApiError(undefined);
      clearErrors('otp');
    }
  };

  useEffect(() => {
    if (resendTimer > 0) {
      timerRef.current = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setCanResend(true);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [resendTimer]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const token = await getDeviceToken();
      if (!cancelled) {
        deviceTokenRef.current = token;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const resolveDeviceTokenForVerify = async (): Promise<string | null> => {
    const cached = deviceTokenRef.current;
    if (typeof cached === 'string' && cached.trim() !== '') {
      return cached.trim();
    }
    let token = (await getDeviceToken())?.trim() ?? null;
    if (token) {
      deviceTokenRef.current = token;
      return token;
    }
    // Extra beat if the first run raced the in-flight prefetch or APNs was still registering.
    await new Promise<void>((r) => setTimeout(r, 2500));
    token = (await getDeviceToken())?.trim() ?? null;
    if (token) {
      deviceTokenRef.current = token;
    }
    return token;
  };

  const formatTimer = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    try {
      const response = await resendOtpMutation.mutateAsync({ email });
      
      if (response.statusCode === 200) {
        Toast.show({
          type: 'success',
          text1: 'OTP Resent',
          text2: 'Please check your email for the new verification code',
        });
        setResendTimer(OTP_RESEND_TIMER);
        setCanResend(false);
      }
    } catch (error: any) {
      // Resend failed
    }
  };

  const onSubmit = async (data: OTPFormData) => {
    if (isSubmittingVerify || verifyOtpMutation.isPending || isVerified) {
      return;
    }
    setIsSubmittingVerify(true);
    setApiError(undefined);
    clearErrors('otp');

    try {
      const deviceId = await getNativeDeviceId();
      const resolvedDeviceToken = (await resolveDeviceTokenForVerify())?.trim() ?? '';
      const response = await verifyOtpMutation.mutateAsync({
        email,
        otp: data.otp,
        deviceId,
        deviceType: Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web',
        ...(resolvedDeviceToken ? { deviceToken: resolvedDeviceToken } : {}),
      });
      if (response.data?.accessToken && response.data?.refreshToken) {
        await setTokens(response.data.accessToken, response.data.refreshToken);
        let userData: PostAuthUser | null = (response.data?.user ?? null) as PostAuthUser | null;

        try {
          const profileResponse = await getProfileApi();
          if (profileResponse?.data) {
            userData = profileResponse.data as unknown as PostAuthUser;
            setUser(profileResponse.data as any);
            syncFromProfile(profileResponse.data as Record<string, unknown>);
          } else if (response.data?.user) {
            setUser(response.data.user as any);
          }
        } catch {
          if (response.data?.user) {
            userData = (response.data.user as PostAuthUser) ?? null;
            setUser(response.data.user as any);
          }
        }

        let shouldShowNotifications = false;
        try {
          const notificationStatus = await checkNotificationPermission();
          shouldShowNotifications = notificationStatus !== 'granted';
          if (shouldShowNotifications) setShouldShowEnableNotifications(true);
        } catch {
          shouldShowNotifications = true;
          setShouldShowEnableNotifications(true);
        }
        const screen = getPostAuthScreen(userData, shouldShowNotifications);

        setIsVerified(true);

        setTimeout(() => {
          setIsBottomSheetOpen(false);
          setTimeout(() => {
            if (screen === 'Likes') {
              // RootNavigator resets to Tabs when auth store updates.
              return;
            }
            navigation.reset({
              index: 0,
              routes: [{ name: 'AuthStack', params: { screen } }],
            });
          }, 350);
        }, 1000);
      }
    } catch (error: any) {
      Sentry.captureException(error, {
        tags: { area: 'auth', flow: 'email-otp' },
        extra: {
          emailDomain: email.split('@')[1] ?? null,
          verifyMutationPending: verifyOtpMutation.isPending,
        },
      });
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        STRINGS.OTP_VERIFICATION.ERROR_INVALID_OTP;
      
      setApiError(errorMessage);
      setError('otp', {
        type: 'manual',
        message: errorMessage,
      });
    } finally {
      setIsSubmittingVerify(false);
    }
  };

  const handleClose = () => {
    setIsBottomSheetOpen(false);
    setTimeout(() => {
      navigation.goBack();
    }, 350);
  };

  return (
    <View style={styles.container}>
      <ReusableBottomSheet
        isOpen={isBottomSheetOpen}
        onClose={handleClose}
        snapPoints={['60%']}
        scrollEnabled={false}
        showDragHandle={true}
        showCloseButton={true}
        enablePanDownToClose={true}
      >
        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            {STRINGS.OTP_VERIFICATION.TITLE_LINE_1}
          </Text>
          <Text style={styles.title}>
            {STRINGS.OTP_VERIFICATION.TITLE_LINE_2}
          </Text>
          <Text style={styles.subtitle}>
            {STRINGS.OTP_VERIFICATION.SUBTITLE_PREFIX} {email}
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Controller
            control={control}
            name="otp"
            render={({ field: { onChange, onBlur, value } }) => (
              <OTPInput
                value={value}
                onChangeText={(text) => {
                  handleOTPChange(text);
                  onChange(text);
                }}
                onBlur={onBlur}
                placeholder="123456"
                autoFocus={!isVerified}
                error={(errors.otp?.message || apiError) ?? undefined}
                success={isVerified}
                length={6}
              />
            )}
          />
        </View>

        <View style={styles.resendContainer}>
          {!canResend ? (
            <Text style={styles.resendText}>
              {STRINGS.OTP_VERIFICATION.RESEND_OTP_IN}{' '}
              <Text style={styles.timerText}>{formatTimer(resendTimer)}</Text>
            </Text>
          ) : (
            <TouchableOpacity
              onPress={handleResendOTP}
              activeOpacity={0.7}
              style={styles.resendButton}
            >
              <Text style={styles.resendButtonText}>
                {STRINGS.OTP_VERIFICATION.RESEND_OTP}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={
              isVerified
                ? STRINGS.OTP_VERIFICATION.VERIFIED
                : isSubmittingVerify || verifyOtpMutation.isPending
                ? STRINGS.OTP_VERIFICATION.VERIFYING
                : STRINGS.OTP_VERIFICATION.VERIFY
            }
            onPress={handleSubmit(onSubmit)}
            variant="primary"
            disabled={!isValid || isVerified || isSubmittingVerify || verifyOtpMutation.isPending}
            loading={isSubmittingVerify || verifyOtpMutation.isPending}
            success={isVerified}
            successIcon={
              isVerified ? (
                <VerifiedIcon size={24} color={colors.white} />
              ) : undefined
            }
            style={styles.verifyButton}
          />
        </View>
      </ReusableBottomSheet>
    </View>
  );
};

