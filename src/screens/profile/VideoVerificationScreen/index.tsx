import React, { useState } from 'react';
import { View, Text, StatusBar, TouchableOpacity, ScrollView, Platform, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';

import { Button } from '../../../components/Button';
import { BackArrowIcon } from '../../../assets/icons/common/BackArrowIcon';
import FrameIcon from '../../../assets/icons/common/FrameIcon';
import { ReusableBottomSheet } from '../../../components/BottomSheet';
import { STRINGS } from '../../../constants/strings';
import { requestCameraPermission } from '../../../config/permissions';
import type { AuthStackParamList } from '../../../navigation/types';
import { styles } from './styles';

type NavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'VideoVerification'
>;

export const VideoVerificationScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [showPermissionSheet, setShowPermissionSheet] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  const handleStartVerification = () => {
    setShowPermissionSheet(true);
  };

  const handleAllow = async () => {
    setIsRequesting(true);
    try {
      const status = await requestCameraPermission();
      if (status === 'granted') {
        setShowPermissionSheet(false);
      } else if (status === 'denied') {
        Alert.alert(
          'Camera Permission Required',
          'To verify with video, please enable camera access in Settings.',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => setShowPermissionSheet(false) },
            {
              text: 'Open Settings',
              onPress: () => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openSettings();
                }
              },
            },
          ]
        );
      } else if (status === 'notDetermined') {
        Alert.alert(
          'Camera Permission Required',
          'Camera permission is required. Please enable it in Settings to continue with video verification.',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => setShowPermissionSheet(false) },
            {
              text: 'Open Settings',
              onPress: () => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openSettings();
                }
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      Alert.alert(
        'Error',
        'Failed to request camera permission. Please enable camera access in Settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => {
              if (Platform.OS === 'ios') {
                Linking.openURL('app-settings:');
              } else {
                Linking.openSettings();
              }
            },
          },
        ]
      );
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDontAllow = () => {
    Alert.alert(
      'Camera Permission Required',
      'Video verification requires camera access. Please enable it to continue.',
      [{ text: 'OK' }]
    );
  };

  const handleCloseSheet = () => {
    Alert.alert(
      'Permission Required',
      'Camera permission is required for video verification. Please grant access to continue.',
      [{ text: 'OK' }]
    );
  };

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

      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'top']}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <BackArrowIcon size={48} backgroundColor="rgba(119, 66, 240, 0.2)" strokeColor="#7742F0" />
          </TouchableOpacity>
        </View>
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
