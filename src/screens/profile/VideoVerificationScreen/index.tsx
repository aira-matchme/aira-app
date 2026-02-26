import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  StyleSheet,
  ActivityIndicator,
  NativeModules,
  DeviceEventEmitter,
  requireNativeComponent,
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
import { requestCameraPermission } from '../../../config/permissions';
import { submitLivenessApi } from '../../../modules/auth/api';
import type { AuthStackParamList } from '../../../navigation/types';
import { colors } from '../../../theme';
import { styles } from './styles';
import { useAuthStore } from '../../../store/auth.store';
import { ProfileScreenGradient } from '../../../components/ProfileScreenGradient';

const { FaceDetection } = NativeModules;

const cameraStyles = StyleSheet.create({ root: { flex: 1, backgroundColor: '#000' }, header: { position: 'absolute', top: 120, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.65)', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14, }, title: { color: '#fff', fontSize: 16, fontWeight: '600', }, progressContainer: { position: 'absolute', bottom: 110, flexDirection: 'row', alignSelf: 'center', }, progressDot: { width: 18, height: 6, borderRadius: 4, backgroundColor: '#555', marginHorizontal: 6, }, progressDone: { backgroundColor: '#34C759' }, successOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', }, successText: { color: '#34C759', fontSize: 22, fontWeight: '700', }, errorText: { color: '#E50000', fontSize: 16, }, });

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

const LIVENESS_STEP_TEXT: Record<LivenessStep, string> = {
  ALIGN_FACE: 'Position your face clearly in front of the camera',
  HOLD_STEADY: 'Hold steady',
  TURN_LEFT: 'Slowly turn your head to the left',
  TURN_RIGHT: 'Now turn your head to the right',
  VERIFIED: '✅ Verification successful',
};

const LIVENESS_STEP_INDEX: Record<LivenessStep, number> = {
  ALIGN_FACE: 0,
  HOLD_STEADY: 1,
  TURN_LEFT: 2,
  TURN_RIGHT: 3,
  VERIFIED: 4,
};

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

  const livenessSubmittedRef = useRef(false);

  /* ------------------------------------------------------------------ */
  /* ---------------- ANDROID CAMERA LISTENER ------------------------- */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (!showCamera || Platform.OS !== 'android') return;

    const sub = DeviceEventEmitter.addListener(
      'LIVENESS_STEP',
      (e: { step?: string }) => {
        const step = (e?.step ?? '').toUpperCase();
        if (step) setLivenessStep(step as LivenessStep);
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
  /* Both platforms: when native emits VERIFIED, we call liveness-check API */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (livenessStep !== 'VERIFIED' || livenessSubmittedRef.current) return;

    livenessSubmittedRef.current = true;
    setLivenessSubmitting(true);
    setLivenessError(null);

    submitLivenessApi({ livenessCheck: true })
      .then(() => {
        setLivenessSubmitting(false);
        setShowCamera(false);
        navigation.navigate('ProfilePhotos');
      })
      .catch((err) => {
        setLivenessSubmitting(false);
        const message =
          err?.response?.data?.message ??
          err?.message ??
          'Liveness submission failed';
        setLivenessError(message);
      });
  }, [livenessStep]);

  const handleAllow = async () => {
    setIsRequesting(true);
    try {
      const status = await requestCameraPermission();

      if (status === 'granted') {
        setShowPermissionSheet(false);
        setShowCamera(true);
        StatusBar.setHidden(true);
      } else if (status === 'denied') {
        Alert.alert(
          'Camera Permission Required',
          'To verify your identity, please enable camera access in Settings.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => setShowPermissionSheet(false),
            },
            {
              text: 'Open Settings',
              onPress: () => {
                if (Platform.OS === 'ios') Linking.openURL('app-settings:');
                else Linking.openSettings();
              },
            },
          ],
        );
      } else if (status === 'notDetermined') {
        Alert.alert(
          'Camera Permission Required',
          'Camera permission is required. Please enable it in Settings to continue with video verification.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => setShowPermissionSheet(false),
            },
            {
              text: 'Open Settings',
              onPress: () => {
                if (Platform.OS === 'ios') Linking.openURL('app-settings:');
                else Linking.openSettings();
              },
            },
          ],
        );
      }
    } catch {
      Alert.alert(
        'Error',
        'Failed to request camera permission. Please enable camera access in Settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => {
              if (Platform.OS === 'ios') Linking.openURL('app-settings:');
              else Linking.openSettings();
            },
          },
        ],
      );
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDontAllow = () => {
    Alert.alert(
      'Camera Permission Required',
      'Video verification requires camera access. Please enable it to continue.',
      [{ text: 'OK' }],
    );
  };

  const handleCloseSheet = () => {
    Alert.alert(
      'Permission Required',
      'Camera permission is required for video verification. Please grant access to continue.',
      [{ text: 'OK' }],
    );
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
            onLivenessStep={(event: { nativeEvent: { step?: string } }) => {
              const step = (event?.nativeEvent?.step ?? '').toUpperCase();
              if (step) setLivenessStep(step as LivenessStep);
            }}
          />
        )}

        {/* Header */}
        <View style={cameraStyles.header}>
          <Text style={cameraStyles.title}>
            {LIVENESS_STEP_TEXT[livenessStep]}
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

        {/* Success Overlay */}
        {livenessStep === 'VERIFIED' && (
          <View style={cameraStyles.successOverlay}>
            {livenessSubmitting ? (
              <ActivityIndicator size="large" color="#7742F0" />
            ) : livenessError ? (
              <Text style={cameraStyles.errorText}>
                {livenessError}
              </Text>
            ) : (
              <Text style={cameraStyles.successText}>
                ✔ Identity Verified
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

      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'top']}>

        <ScrollView
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
              <View style={styles.bulletPoint}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  {STRINGS.PROFILE_SETUP.VIDEO_VERIFICATION.BULLET_3}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <Button
            title={STRINGS.PROFILE_SETUP.VIDEO_VERIFICATION.BUTTON}
            onPress={() => setShowPermissionSheet(true)}
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
                    {isRequesting ? 'Requesting...' : 'Allow'}
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDontAllow}
              activeOpacity={0.7}
              style={styles.dontAllowButton}
            >
              <Text style={styles.dontAllowButtonText}>Don't Allow</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ReusableBottomSheet>
    </View>
  );
};
