import React, { useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Platform,
  InteractionManager,
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
import type { AuthStackParamList } from '../../../navigation/types';
import { styles } from './styles';
import { PROFILE_SCREEN_EDGES } from '../profileScreenLayout';
import { ProfileScreenGradient } from '../../../components/ProfileScreenGradient';

type NavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'FaceVerification'
>;

export const FaceVerificationScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [showPermissionSheet, setShowPermissionSheet] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  const showCameraDeniedSettingsAlert = () => {
    const s = STRINGS.PROFILE_SETUP.FACE_VERIFICATION;
    Alert.alert(s.CAMERA_DENIED_TITLE, s.CAMERA_DENIED_MESSAGE, [
      { text: s.CAMERA_DENIED_CANCEL, style: 'cancel' },
      { text: s.OPEN_SETTINGS, onPress: () => void Linking.openSettings() },
    ]);
  };

  const handleStartVerification = async () => {
    setIsRequesting(true);
    try {
      const existing = await checkCameraPermission();
      if (existing === 'granted') {
        navigation.navigate('SelfieCamera');
        return;
      }
      // iOS: if the user already denied (or restricted) camera, the system will not show the
      // prompt again — only Settings can fix it. Our custom sheet cannot change that.
      if (Platform.OS === 'ios' && existing === 'denied') {
        showCameraDeniedSettingsAlert();
        return;
      }
      setShowPermissionSheet(true);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleAllow = async () => {
    setIsRequesting(true);
    // iOS will often not present the system camera alert while a RN Modal (this sheet) is visible.
    setShowPermissionSheet(false);
    try {
      if (Platform.OS === 'ios') {
        await new Promise<void>((resolve) => {
          InteractionManager.runAfterInteractions(() => {
            setTimeout(resolve, 200);
          });
        });
      }
      const status = await requestCameraPermission();
      if (status === 'granted') {
        navigation.navigate('SelfieCamera');
      } else if (status === 'denied' && Platform.OS === 'ios') {
        showCameraDeniedSettingsAlert();
      }
    } catch {
      // Sheet already closed
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDontAllow = () => {
    setShowPermissionSheet(false);

    // Keep the sheet open - user must grant permission
  };

  const handleCloseSheet = () => {
    setShowPermissionSheet(false);
    // Prevent closing without granting permission
  };

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
              {STRINGS.PROFILE_SETUP.FACE_VERIFICATION.TITLE}
            </Text>
            <Text style={styles.description}>
              {STRINGS.PROFILE_SETUP.FACE_VERIFICATION.DESCRIPTION}
            </Text>

            <View style={styles.bulletPointsContainer}>
              <View style={styles.bulletPoint}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  {STRINGS.PROFILE_SETUP.FACE_VERIFICATION.BULLET_1}
                </Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  {STRINGS.PROFILE_SETUP.FACE_VERIFICATION.BULLET_2}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <Button
            title={STRINGS.PROFILE_SETUP.FACE_VERIFICATION.BUTTON}
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
            {STRINGS.PROFILE_SETUP.FACE_VERIFICATION.PERMISSION_TITLE}
          </Text>
          
          <Text style={styles.permissionDescription}>
            {STRINGS.PROFILE_SETUP.FACE_VERIFICATION.PERMISSION_DESCRIPTION}
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

