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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button } from '../../../components/Button';
import { BackArrowIcon } from '../../../assets/icons/common/BackArrowIcon';
import FrameIcon from '../../../assets/icons/common/FrameIcon';
import { ReusableBottomSheet } from '../../../components/BottomSheet';
import { STRINGS } from '../../../constants/strings';
import { requestCameraPermission } from '../../../config/permissions';
import { submitLivenessApi } from '../../../modules/auth/api';
import type { AuthStackParamList } from '../../../navigation/types';
import { styles } from './styles';

const { FaceDetection } = NativeModules;

const cameraStyles = StyleSheet.create({ root: { flex: 1, backgroundColor: '#000' }, backButton: { position: 'absolute', top: 50, left: 16, zIndex: 10, }, header: { position: 'absolute', top: 120, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.65)', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14, }, title: { color: '#fff', fontSize: 16, fontWeight: '600', }, progressContainer: { position: 'absolute', bottom: 110, flexDirection: 'row', alignSelf: 'center', }, progressDot: { width: 18, height: 6, borderRadius: 4, backgroundColor: '#555', marginHorizontal: 6, }, progressDone: { backgroundColor: '#34C759' }, successOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', }, successText: { color: '#34C759', fontSize: 22, fontWeight: '700', }, errorText: { color: '#E50000', fontSize: 16, }, });

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
      (e) => setLivenessStep(e.step),
    );

    FaceDetection?.startCamera();

    return () => {
      sub.remove();
      FaceDetection?.stopCamera();
    };
  }, [showCamera]);

  /* ------------------------------------------------------------------ */
  /* ---------------- API SUBMIT AFTER VERIFIED ----------------------- */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (livenessStep !== 'VERIFIED' || livenessSubmittedRef.current)
      return;

    livenessSubmittedRef.current = true;
    setLivenessSubmitting(true);
    setLivenessError(null);

    submitLivenessApi({ livenessCheck: true })
      .then(() => {
        setLivenessSubmitting(false);
        setShowCamera(false);
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
      } else {
        Alert.alert(
          'Camera Permission Required',
          'Please enable camera access in Settings.',
        );
      }
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
            onLivenessStep={(event: any) =>
              setLivenessStep(event.nativeEvent.step)
            }
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

        {/* Back */}
        <TouchableOpacity
          onPress={() => {
            setShowCamera(false);
            StatusBar.setHidden(false);
          }}
          style={cameraStyles.backButton}
        >
          <BackArrowIcon
            size={48}
            backgroundColor="rgba(0,0,0,0.4)"
            strokeColor="#fff"
          />
        </TouchableOpacity>
      </View>
    );
  }

  /* ------------------------------------------------------------------ */
  /* -------------------------- NORMAL SCREEN -------------------------- */
  /* ------------------------------------------------------------------ */

  return (
    <View style={styles.wrapper}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <FrameIcon size={72} color="#7742F0" />
          <Text style={styles.title}>
            {STRINGS.PROFILE_SETUP.VIDEO_VERIFICATION.TITLE}
          </Text>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <Button
            title={STRINGS.PROFILE_SETUP.VIDEO_VERIFICATION.BUTTON}
            onPress={() => setShowPermissionSheet(true)}
            loading={isRequesting}
          />
        </View>
      </SafeAreaView>

      <ReusableBottomSheet
        isOpen={showPermissionSheet}
        onClose={() => {}}
        snapPoints={['55%']}
      >
        <View style={{ padding: 24 }}>
          <TouchableOpacity
            onPress={handleAllow}
            style={{
              backgroundColor: '#7742F0',
              padding: 14,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: '#fff', textAlign: 'center' }}>
              Allow
            </Text>
          </TouchableOpacity>
        </View>
      </ReusableBottomSheet>
    </View>
  );
};
