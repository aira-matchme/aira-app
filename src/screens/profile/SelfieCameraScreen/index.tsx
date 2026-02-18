import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
  Image,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import LinearGradient from 'react-native-linear-gradient';

import { BackArrowIcon } from '../../../assets/icons/common/BackArrowIcon';
import { VerifiedIcon } from '../../../assets/icons/common/VerifiedIcon';
import { STRINGS } from '../../../constants/strings';
import { colors } from '../../../theme';
import type { AuthStackParamList } from '../../../navigation/types';
import { uploadSelfieApi } from '../../../modules/auth/api';
import { styles } from './styles';

type NavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'SelfieCamera'
>;

type ScreenState = 'camera' | 'verifying' | 'verified';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const SelfieCameraScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [screenState, setScreenState] = useState<ScreenState>('camera');
  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const camera = useRef<Camera>(null);
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('front');

  React.useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  const handleTakePhoto = async () => {
    if (!camera.current || !device) {
      Alert.alert('Error', 'Camera not ready. Please try again.');
      return;
    }

    if (!hasPermission) {
      Alert.alert('Permission Required', 'Camera permission is required to take a photo.');
      return;
    }
    setIsCapturing(true);
    try {
      const photo = await camera.current.takePhoto({ flash: 'off' });
      setIsCapturing(false);
      const photoUri = photo.path.startsWith('file://') ? photo.path : `file://${photo.path}`;
      setCapturedPhotoUri(photoUri);
      setScreenState('verifying');
      try {
        await uploadSelfieApi(photo.path);
        setScreenState('verified');
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data
            ?.message ||
          (err as { message?: string })?.message ||
          'Verification failed. Please try again.';
        Alert.alert('Verification Failed', message, [
          { text: 'OK', onPress: () => { setScreenState('camera'); setCapturedPhotoUri(null); } },
        ]);
      }
    } catch (error) {
      setIsCapturing(false);
      console.error('Error capturing photo:', error);
      Alert.alert(
        'Error',
        'Failed to capture photo. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleContinue = () => {
    navigation.navigate('VideoVerification');
  };

  if (!hasPermission) {
    return (
      <View style={styles.wrapper}>
        <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'top']}>
          <View style={styles.headerContainer}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <BackArrowIcon size={48} backgroundColor="rgba(255, 255, 255, 0.2)" strokeColor="white" />
            </TouchableOpacity>
          </View>
          <View style={styles.content}>
            <Text style={styles.title}>Camera Permission Required</Text>
            <Text style={styles.subtitle}>Please grant camera permission to continue</Text>
          </View>
        </SafeAreaView>
      </View>
    );
    
  }

  if (!device) {
    return (
      <View style={styles.wrapper}>
        <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'top']}>
          <View style={styles.headerContainer}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <BackArrowIcon size={48} backgroundColor="rgba(255, 255, 255, 0.2)" strokeColor="white" />
            </TouchableOpacity>
          </View>
          <View style={styles.content}>
            <Text style={styles.title}>Camera Not Available</Text>
            <Text style={styles.subtitle}>Camera is not available on this device</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Verifying screen – Figma 886-3797: blurred selfie bg, white circle with photo, dark button at bottom
  if (screenState === 'verifying' && capturedPhotoUri) {
    return (
      <View style={styles.wrapper}>
        <Image
          source={{ uri: capturedPhotoUri }}
          style={styles.verifyingBackgroundImage}
          resizeMode="cover"
        />
        <View style={styles.verifyingBackgroundOverlay} />
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'top']}>
          <View style={styles.verifyingContent}>
            <View style={styles.verifyingSelfieCircle}>
              <Image
                source={{ uri: capturedPhotoUri }}
                style={styles.verifyingSelfieImage}
                resizeMode="cover"
              />
            </View>
          </View>
          <View style={styles.verifyingButtonContainer}>
            <View style={styles.verifyingButton}>
              <ActivityIndicator size="small" color={colors.white} />
              <Text style={styles.verifyingButtonText}>Verifying...</Text>
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Verified success screen (Figma 886-3849: blurred selfie, green circle + checkmark, green Verified button)
  if (screenState === 'verified') {
    return (
      <View style={styles.wrapper}>
        {capturedPhotoUri ? (
          <>
            <Image
              source={{ uri: capturedPhotoUri }}
              style={styles.verifiedBackgroundImage}
              resizeMode="cover"
            />
            <View style={styles.verifiedBackgroundOverlay} />
          </>
        ) : (
          <LinearGradient
            colors={[
              'rgba(221, 170, 249, 0)',
              'rgba(221, 170, 249, 0.18)',
              'rgba(221, 170, 249, 0.18)',
              'rgba(221, 170, 249, 0)',
            ]}
            locations={[0, 0.38, 0.62, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.backgroundGlow}
          />
        )}
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'top']}>
          <View style={styles.verifiedContent}>
            <View style={styles.verifiedGreenCircle}>
              <View style={styles.verifiedCheckmarkWrapper}>
                <VerifiedIcon size={48} color={colors.white} />
              </View>
            </View>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleContinue}
              style={styles.verifiedButton}
            >
              <VerifiedIcon size={24} color={colors.white} />
              <Text style={styles.verifiedButtonText}>Verified</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Camera screen – Figma 814-3543: instruction, circle, tip box, circular capture button
  return (
    <View style={styles.wrapper}>
      <View style={styles.cameraFullScreen}>
        <Camera
          ref={camera}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          photo={true}
        />
        <View style={styles.cameraOverlay} pointerEvents="none" />
      </View>

      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'top']}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <BackArrowIcon size={48} backgroundColor="rgba(255, 255, 255, 0.2)" strokeColor="white" />
          </TouchableOpacity>
        </View>

        <Text style={styles.instructionText}>
          {STRINGS.PROFILE_SETUP.SELFIE_CAMERA.SUBTITLE}
        </Text>

        <View style={styles.cameraContainer}>
          <View style={styles.cameraFrame}>
            <View style={styles.circleFrame}>
              <View style={styles.circleBorder} />
            </View>
            <View style={styles.overlayTop} />
            <View style={styles.overlayBottom} />
            <View style={styles.overlayLeft} />
            <View style={styles.overlayRight} />
          </View>
        </View>

        <View style={styles.tipBox}>
          <Text style={styles.tipBullet}>• {STRINGS.PROFILE_SETUP.SELFIE_CAMERA.TIP_1}</Text>
          <Text style={styles.tipBullet}>• {STRINGS.PROFILE_SETUP.SELFIE_CAMERA.TIP_2}</Text>
        </View>

        <View style={styles.captureButtonContainer}>
          <TouchableOpacity
            style={styles.captureButtonOuter}
            onPress={handleTakePhoto}
            disabled={isCapturing}
            activeOpacity={0.85}
          >
            {isCapturing ? (
              <ActivityIndicator size="small" color={colors.white} style={styles.captureButtonSpinner} />
            ) : (
              <View style={styles.captureButtonInner} />
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};
