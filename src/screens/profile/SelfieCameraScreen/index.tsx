import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import LinearGradient from 'react-native-linear-gradient';

import { BackArrowIcon } from '../../../assets/icons/common/BackArrowIcon';
import { Button } from '../../../components/Button';
import { STRINGS } from '../../../constants/strings';
import type { AuthStackParamList } from '../../../navigation/types';
import { styles } from './styles';

type NavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'SelfieCamera'
>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const SelfieCameraScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
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
      const photo = await camera.current.takePhoto({
        // qualityPrioritization: 'speed',
        flash: 'off',
      });
      
      // TODO: Process the photo for face verification
      console.log('Photo captured:', photo.path);
      
      // Navigate to next screen after successful capture
      // navigation.navigate('OnboardingIntro');
    } catch (error) {
      console.error('Error capturing photo:', error);
      Alert.alert(
        'Error',
        'Failed to capture photo. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsCapturing(false);
    }
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

  return (
    <View style={styles.wrapper}>
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

      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'top']}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <BackArrowIcon size={48} backgroundColor="rgba(255, 255, 255, 0.2)" strokeColor="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>
            {STRINGS.PROFILE_SETUP.SELFIE_CAMERA.TITLE}
          </Text>
          <Text style={styles.subtitle}>
            {STRINGS.PROFILE_SETUP.SELFIE_CAMERA.SUBTITLE}
          </Text>

          <View style={styles.cameraContainer}>
            {/* Camera preview area with circular frame overlay */}
            <View style={styles.cameraFrame}>
              <Camera
                ref={camera}
                style={styles.camera}
                device={device}
                isActive={true}
                photo={true}
              />
              {/* Circular frame guide overlay */}
              <View style={styles.circleFrame}>
                <View style={styles.circleBorder} />
              </View>
              {/* Overlay outside the circle */}
              <View style={styles.overlayTop} />
              <View style={styles.overlayBottom} />
              <View style={styles.overlayLeft} />
              <View style={styles.overlayRight} />
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={STRINGS.PROFILE_SETUP.SELFIE_CAMERA.BUTTON}
            onPress={handleTakePhoto}
            variant="primary"
            disabled={isCapturing}
            loading={isCapturing}
            style={styles.button}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

