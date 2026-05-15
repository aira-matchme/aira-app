import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  NativeModules,
  DeviceEventEmitter,
  requireNativeComponent,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';

import { Button } from '../../../components/Button';
import FrameIcon from '../../../assets/icons/common/FrameIcon';
import { ReusableBottomSheet } from '../../../components/BottomSheet';
import { STRINGS } from '../../../constants/strings';
import {
  checkCameraPermission,
  requestCameraPermission,
} from '../../../config/permissions';
import {
  verifyLivenessSelfieApi,
  completeLivenessCheckApi,
} from '../../../modules/auth/api';
import type { AuthStackParamList } from '../../../navigation/types';
import { styles } from './styles';
import { PROFILE_SCREEN_EDGES } from '../profileScreenLayout';
import { ProfileScreenGradient } from '../../../components/ProfileScreenGradient';
import { useAuthStore } from '../../../store/auth.store';

const { FaceDetection } = NativeModules;

const cameraStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Platform.OS === 'android' ? 'transparent' : '#000',
  },
  header: {
    position: 'absolute',
    top: 120,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  title: { color: '#fff', fontSize: 16, fontWeight: '600' },
  progressContainer: {
    position: 'absolute',
    bottom: 110,
    flexDirection: 'row',
    alignSelf: 'center',
  },
  progressDot: {
    width: 18,
    height: 6,
    borderRadius: 4,
    backgroundColor: '#555',
    marginHorizontal: 6,
  },
  progressDone: { backgroundColor: '#34C759' },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successText: { color: '#34C759', fontSize: 22, fontWeight: '700' },
  errorText: { color: '#E50000', fontSize: 16, textAlign: 'center', paddingHorizontal: 24 },
});

let FaceDetectionView: any = null;

if (Platform.OS === 'ios') {
  FaceDetectionView = requireNativeComponent('FaceDetectionView');
}

type LivenessStep =
  | 'ALIGN_FACE'
  | 'HOLD_STEADY'
  | 'TURN_LEFT'
  | 'TURN_RIGHT'
  | 'VERIFIED';

const LIVENESS_STEP_TEXT: Record<
  Exclude<LivenessStep, 'VERIFIED'>,
  string
> = {
  ALIGN_FACE: 'Position your face clearly in front of the camera',
  HOLD_STEADY: 'Hold steady',
  TURN_LEFT: 'Slowly turn your head to the left',
  TURN_RIGHT: 'Now turn your head to the right',
};

const LIVENESS_STEP_INDEX: Record<LivenessStep, number> = {
  ALIGN_FACE: 0,
  HOLD_STEADY: 1,
  TURN_LEFT: 2,
  TURN_RIGHT: 3,
  VERIFIED: 4,
};

/** User-facing instruction for the current native step. Android: swap left/right so copy matches mirrored front-camera + native head-pose checks. */
function getLivenessInstructionLabel(step: LivenessStep): string {
  if (step === 'VERIFIED') {
    return 'Verifying your identity...';
  }
  if (Platform.OS === 'android') {
    if (step === 'TURN_LEFT') return LIVENESS_STEP_TEXT.TURN_RIGHT;
    if (step === 'TURN_RIGHT') return LIVENESS_STEP_TEXT.TURN_LEFT;
  }
  return LIVENESS_STEP_TEXT[step];
}

function closeLivenessCamera() {
  if (Platform.OS === 'android') {
    FaceDetection?.stopCamera();
  }
  StatusBar.setHidden(false);
}

export const VideoVerificationScreen: React.FC = () => {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<AuthStackParamList, 'VideoVerification'>
    >();

  const [showPermissionSheet, setShowPermissionSheet] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [livenessStep, setLivenessStep] =
    useState<LivenessStep>('ALIGN_FACE');
  const [livenessSubmitting, setLivenessSubmitting] =
    useState(false);
  const [livenessError, setLivenessError] =
    useState<string | null>(null);
  const [livenessComplete, setLivenessComplete] = useState(false);

  const livenessSubmittedRef = useRef(false);
  const failureExitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** JPEG path from native on VERIFIED (post-turn); fallback if straight capture failed. */
  const [verifiedFrameUri, setVerifiedFrameUri] = useState<string | null>(null);
  /** Frontal frame after “hold steady” — sent to `/auth/liveness/verify`. */
  const [straightHeadFrameUri, setStraightHeadFrameUri] = useState<string | null>(
    null,
  );

  /** 1) Show error on camera overlay → 2) close camera → 3) VideoVerification intro with error */
  const exitCameraAfterFailure = (message: string) => {
    if (failureExitTimerRef.current) {
      clearTimeout(failureExitTimerRef.current);
    }
    setLivenessSubmitting(false);
    setLivenessComplete(false);
    livenessSubmittedRef.current = false;
    setLivenessError(message);

    failureExitTimerRef.current = setTimeout(() => {
      failureExitTimerRef.current = null;
      closeLivenessCamera();
      setShowCamera(false);
      setLivenessStep('ALIGN_FACE');
      setVerifiedFrameUri(null);
      setStraightHeadFrameUri(null);
    }, 2500);
  };

  useEffect(() => {
    return () => {
      if (failureExitTimerRef.current) {
        clearTimeout(failureExitTimerRef.current);
      }
    };
  }, []);

  const showCameraDeniedSettingsAlert = () => {
    Alert.alert(
      'Camera access is turned off',
      'To continue, allow camera access for Aira in Settings. You can turn it on and return here.',
      [
        { text: 'Not now', style: 'cancel' },
        { text: 'Open Settings', onPress: () => void Linking.openSettings() },
      ],
    );
  };

  useEffect(() => {
    if (!showCamera) return;
    setVerifiedFrameUri(null);
    setStraightHeadFrameUri(null);
    livenessSubmittedRef.current = false;
    setLivenessStep('ALIGN_FACE');
    setLivenessError(null);
    setLivenessComplete(false);
  }, [showCamera]);

  /* ------------------------------------------------------------------ */
  /* ---------------- ANDROID CAMERA LISTENER ------------------------- */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (!showCamera || Platform.OS !== 'android') return;

    const sub = DeviceEventEmitter.addListener(
      'LIVENESS_STEP',
      (e: {
        step?: string;
        imageUri?: string;
        straightHeadImageUri?: string;
      }) => {
        const step = (e?.step ?? '').toUpperCase();
        if (!step) return;
        const straight =
          typeof e?.straightHeadImageUri === 'string' &&
          e.straightHeadImageUri.trim().length > 0
            ? e.straightHeadImageUri.trim()
            : null;
        if (straight) {
          setStraightHeadFrameUri(straight);
        }
        if (step === 'VERIFIED') {
          setVerifiedFrameUri(
            typeof e?.imageUri === 'string' && e.imageUri.trim().length > 0
              ? e.imageUri.trim()
              : null,
          );
        }
        setLivenessStep(step as LivenessStep);
      },
    );

    FaceDetection?.startCamera();

    return () => {
      sub.remove();
      FaceDetection?.stopCamera();
    };
  }, [showCamera]);

  /* ------------------------------------------------------------------ */
  /* ---------------- LIVENESS API (iOS + Android) --------------------- */
  /* VERIFIED: verify selfie → if verified, liveness-check → success UI → next screen */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (livenessStep !== 'VERIFIED' || livenessSubmittedRef.current) return;

    const imageUri = straightHeadFrameUri ?? verifiedFrameUri;
    if (!imageUri) {
      exitCameraAfterFailure(
        'Could not capture verification photo. Please try again.',
      );
      return;
    }

    livenessSubmittedRef.current = true;
    setLivenessSubmitting(true);
    setLivenessError(null);
    setLivenessComplete(false);

    let navigateTimer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    verifyLivenessSelfieApi(imageUri)
      .then((verifyRes) => {
        if (verifyRes?.data?.verified !== true) {
          const details =
            verifyRes?.data?.details ??
            verifyRes?.message ??
            'Face verification failed. Please try again.';
          throw new Error(details);
        }
        return completeLivenessCheckApi({ livenessCheck: true });
      })
      .then(() => {
        if (cancelled) return;
        // Important: don't depend on `user` in this effect, otherwise updating the store
        // will re-run the effect and its cleanup will clear the navigation timeout.
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          useAuthStore.getState().setUser({ ...currentUser, livenessCheck: true });
        }
        setLivenessSubmitting(false);
        setLivenessComplete(true);
        navigateTimer = setTimeout(() => {
          closeLivenessCamera();
          setShowCamera(false);
          navigation.navigate('ProfilePhotos');
        }, 900);
      })
      .catch((err) => {
        if (cancelled) return;
        const message =
          err?.response?.data?.message ??
          err?.message ??
          'Liveness submission failed';
        exitCameraAfterFailure(message);
      });

    return () => {
      cancelled = true;
      if (navigateTimer) clearTimeout(navigateTimer);
    };
  }, [
    livenessStep,
    straightHeadFrameUri,
    verifiedFrameUri,
    navigation,
  ]);

  const handleAllow = async () => {
    setIsRequesting(true);
    try {
      const status = await requestCameraPermission();

      if (status === 'granted') {
        setShowPermissionSheet(false);
        setLivenessError(null);
        setShowCamera(true);
        StatusBar.setHidden(true);
      } else {
        setShowPermissionSheet(false);
        showCameraDeniedSettingsAlert();
      }
    } catch {
      setShowPermissionSheet(false);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleCloseSheet = () => {
    if (isRequesting) return;
    handleAllow().catch(() => {});
  };

  const handleStartVerification = async () => {
    setLivenessError(null);
    setIsRequesting(true);
    try {
      const existing = await checkCameraPermission();
      if (existing === 'granted') {
        setShowCamera(true);
        StatusBar.setHidden(true);
        return;
      }
      setShowPermissionSheet(true);
    } finally {
      setIsRequesting(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /* -------------------------- CAMERA SCREEN -------------------------- */
  /* ------------------------------------------------------------------ */

  if (showCamera) {
    return (
      <View style={cameraStyles.root}>
        <StatusBar hidden />

        {/* iOS Camera View */}
        {Platform.OS === 'ios' && (
          <FaceDetectionView
            style={StyleSheet.absoluteFill}
            onLivenessStep={(event: {
              nativeEvent: {
                step?: string;
                imageUri?: string;
                straightHeadImageUri?: string;
              };
            }) => {
              const ne = event?.nativeEvent;
              const step = (ne?.step ?? '').toUpperCase();
              if (!step) return;
              const straight =
                typeof ne?.straightHeadImageUri === 'string' &&
                ne.straightHeadImageUri.trim().length > 0
                  ? ne.straightHeadImageUri.trim()
                  : null;
              if (straight) {
                setStraightHeadFrameUri(straight);
              }
              const uri = ne?.imageUri;
              if (step === 'VERIFIED') {
                setVerifiedFrameUri(
                  typeof uri === 'string' && uri.trim().length > 0
                    ? uri.trim()
                    : null,
                );
              }
              setLivenessStep(step as LivenessStep);
            }}
          />
        )}

        {/* Header */}
        <View style={cameraStyles.header}>
          <Text style={cameraStyles.title}>
            {getLivenessInstructionLabel(livenessStep)}
          </Text>
        </View>

        {/* Progress */}
        <View style={cameraStyles.progressContainer}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={[
                cameraStyles.progressDot,
                LIVENESS_STEP_INDEX[livenessStep] > i &&
                  cameraStyles.progressDone,
              ]}
            />
          ))}
        </View>

        {/* API overlay: spinner → error (then exit) → success (then navigate) */}
        {livenessStep === 'VERIFIED' &&
          (livenessSubmitting || livenessComplete || livenessError) && (
          <View style={cameraStyles.successOverlay}>
            {livenessSubmitting ? (
              <ActivityIndicator size="large" color="#7742F0" />
            ) : livenessError ? (
              <Text style={cameraStyles.errorText}>{livenessError}</Text>
            ) : (
              <Text style={cameraStyles.successText}>
                Verification complete
              </Text>
            )}
          </View>
        )}

      </View>
    );
  }

  /* ------------------------------------------------------------------ */
  /* -------------------------- NORMAL SCREEN -------------------------- */
  /* ------------------------------------------------------------------ */

  return (
    <View style={styles.wrapper}>
      <ProfileScreenGradient />
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <SafeAreaView style={styles.safeArea} edges={PROFILE_SCREEN_EDGES}>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.iconContainer}>
            <View style={styles.iconWrapper}>
              <FrameIcon size={72} color="#7742F0" />
            </View>
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.title}>
              {STRINGS.PROFILE_SETUP.VIDEO_VERIFICATION.TITLE}
            </Text>
            {livenessError ? (
              <Text style={styles.verificationError}>{livenessError}</Text>
            ) : null}
            <Text style={styles.description}>
              {STRINGS.PROFILE_SETUP.VIDEO_VERIFICATION.DESCRIPTION}
            </Text>

            <View style={styles.bulletPointsContainer}>
              <View style={styles.bulletPoint}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  {STRINGS.PROFILE_SETUP.VIDEO_VERIFICATION.BULLET_1}
                </Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  {STRINGS.PROFILE_SETUP.VIDEO_VERIFICATION.BULLET_2}
                </Text>
              </View>
              {/* <View style={styles.bulletPoint}>
                <Text style={styles.bulletDot}>•</Text>
              </View> */}
            </View>
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <Button
            title={STRINGS.PROFILE_SETUP.VIDEO_VERIFICATION.BUTTON}
            onPress={handleStartVerification}
            variant="primary"
            disabled={isRequesting}
            loading={isRequesting}
            style={styles.button}
          />
        </View>
      </SafeAreaView>

      <ReusableBottomSheet
        isOpen={showPermissionSheet}
        onClose={handleCloseSheet}
        snapPoints={['55%']}
        showDragHandle={true}
        showCloseButton={false}
        enablePanDownToClose={false}
        backgroundStyle={styles.bottomSheetBackground}
        scrollEnabled={false}
      >
        <View style={styles.permissionSheetContent}>
          <Text style={styles.permissionTitle}>
            {STRINGS.PROFILE_SETUP.VIDEO_VERIFICATION.PERMISSION_TITLE}
          </Text>

          <Text style={styles.permissionDescription}>
            {STRINGS.PROFILE_SETUP.VIDEO_VERIFICATION.PERMISSION_DESCRIPTION}
          </Text>

          <View style={styles.permissionButtons}>
            <TouchableOpacity
              onPress={handleAllow}
              activeOpacity={0.8}
              style={styles.allowButtonWrapper}
              disabled={isRequesting}
            >
              <LinearGradient
                colors={['#C671F4', '#7640F0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.allowButton}
              >
                <View style={styles.allowButtonInner}>
                  <Text style={styles.allowButtonText}>
                    {isRequesting ? 'Requesting...' : 'Continue'}
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ReusableBottomSheet>
    </View>
  );
};
