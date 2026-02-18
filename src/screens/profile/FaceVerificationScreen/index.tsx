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
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

type NavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'FaceVerification'
>;

export const FaceVerificationScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [showPermissionSheet, setShowPermissionSheet] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  const handleStartVerification = () => {
    setShowPermissionSheet(true);
  };

  const handleAllow = async () => {
    // navigation.navigate('OnboardingIntro');
    setIsRequesting(true);
    try {
      const status = await requestCameraPermission();
      console.log('status', status);
      
      if (status === 'granted') {
        setShowPermissionSheet(false);
        navigation.navigate('SelfieCamera');
      } else if (status === 'denied') {
        Alert.alert(
          'Camera Permission Required',
          'To verify your face, please enable camera access in Settings.',
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
        // On iOS, notDetermined usually means permission wasn't requested yet
        // But if we're here, it means the permission library isn't available
        Alert.alert(
          'Camera Permission Required',
          Platform.OS === 'ios' 
            ? 'Camera permission is required. Please enable it in Settings to continue with face verification.'
            : 'Camera permission is required. Please enable it in Settings to continue with face verification.',
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
      'Face verification requires camera access. Please enable it to continue.',
      [
        {
          text: 'OK',
          onPress: () => {
            // Keep the sheet open - user must grant permission
          },
        },
      ]
    );
  };

  const handleCloseSheet = () => {
    // Prevent closing without granting permission
    Alert.alert(
      'Permission Required',
      'Camera permission is required for face verification. Please grant access to continue.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.wrapper}>
           <View style={styles.backgroundGlow}>
        <Svg height="100%" width="100%" style={{ position: 'absolute' }}>
          <Defs>
            <RadialGradient
              id="nameScreenGrad"
              cx="0%"
              cy="0%"
              rx="120%"
              ry="120%"
              fx="0%"
              fy="0%"
            >
              <Stop offset="0%" stopColor="#C87BF5" stopOpacity="0.2" />
              <Stop offset="70%" stopColor="#C87BF5" stopOpacity="0.06" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#nameScreenGrad)" />
        </Svg>
      </View>
      
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
              <View style={styles.bulletPoint}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  {STRINGS.PROFILE_SETUP.FACE_VERIFICATION.BULLET_3}
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

