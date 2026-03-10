import React, { useState } from 'react';
import { View, Text, StatusBar, Platform, TouchableOpacity, Linking, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import { GradientBackground } from '../../../components/GradientBackground';
import { ReusableBottomSheet } from '../../../components/BottomSheet';
import { Button } from '../../../components/Button';
import { STRINGS } from '../../../constants/strings';
import { requestNotificationPermission } from '../../../config/permissions';
import { useAuthStore } from '../../../store/auth.store';
import type { AuthStackParamList } from '../../../navigation/types';
import Mockup from '../../../assets/icons/common/Mockup';
import { styles } from './styles';

type EnableNotificationsNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'EnableNotifications'>;

export const EnableNotificationsScreen = () => {
  const navigation = useNavigation<EnableNotificationsNavigationProp>();
  const setShouldShowEnableNotifications = useAuthStore((s) => s.setShouldShowEnableNotifications);
  const [isRequesting, setIsRequesting] = useState(false);
  const [showPermissionSheet, setShowPermissionSheet] = useState(false);

  const handleEnableNotifications = async () => {
    setShowPermissionSheet(true);
  };

  const handleAllow = async () => {
    setShowPermissionSheet(false);
    setIsRequesting(true);
    try {
      const status = await requestNotificationPermission();
      if (status === 'granted') {
        setShouldShowEnableNotifications(false);
        navigation.navigate('ProfileIntro');
      } else if (status === 'denied') {
        // User denied - no action
      }
    } catch (error) {
      // Request failed
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDontAllow = () => {
    setShowPermissionSheet(false);
    setShouldShowEnableNotifications(false);
    navigation.navigate('ProfileIntro');
  };

  const handleMayBeLater = () => {
    setShouldShowEnableNotifications(false);
    navigation.navigate('ProfileIntro');
  };

  const handleCloseSheet = () => {
    setShowPermissionSheet(false);
  };

  return (
    <View style={styles.wrapper}>
      <GradientBackground style={styles.gradientBackground}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
          <View style={styles.container} pointerEvents="box-none">
            <View style={styles.mockupContainer} pointerEvents="none">
              <Mockup />
            </View>
            <View style={styles.content}>
              <Text style={styles.title}>
                {STRINGS.ENABLE_NOTIFICATIONS.TITLE}
              </Text>
              <Text style={styles.subtitle}>
                {STRINGS.ENABLE_NOTIFICATIONS.SUBTITLE}
              </Text>

              <View style={styles.actions}>
                <Button
                  title={STRINGS.ENABLE_NOTIFICATIONS.PRIMARY_CTA}
                  onPress={handleEnableNotifications}
                  variant="primary"
                  disabled={isRequesting}
                  loading={isRequesting}
                  style={styles.primaryButton}
                />
                <Pressable
                  onPress={handleMayBeLater}
                  hitSlop={{ top: 25, bottom: 25, left: 25, right: 25 }}
                  style={({ pressed }) => [
                    styles.maybeLaterButton,
                    pressed && { opacity: 0.7 }
                  ]}
                >
                  <Text style={styles.secondaryText}>
                    {STRINGS.ENABLE_NOTIFICATIONS.SECONDARY_CTA}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </GradientBackground>

      <ReusableBottomSheet
        isOpen={showPermissionSheet}
        onClose={handleCloseSheet}
        snapPoints={['50%']}
        showDragHandle={true}
        showCloseButton={true}
        enablePanDownToClose={true}
        backgroundStyle={styles.bottomSheetBackground}
      >
        <View style={styles.permissionSheetContent}>
          <Text style={styles.permissionTitle}>
            "Aira" Would Like to Send You Notifications
          </Text>
          
          <Text style={styles.permissionDescription}>
            Notifications may include alerts, sounds, and icon badges. These can be configured in Settings.
          </Text>

          <View style={styles.permissionButtons}>
            <TouchableOpacity
              onPress={handleAllow}
              activeOpacity={0.8}
              style={styles.allowButtonWrapper}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <LinearGradient
                colors={['#C671F4', '#7640F0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.allowButton}
              >
                <View style={styles.allowButtonInner}>
                  <Text style={styles.allowButtonText}>Allow</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDontAllow}
              activeOpacity={0.7}
              style={styles.dontAllowButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.dontAllowButtonText}>Don't Allow</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ReusableBottomSheet>
    </View>
  );
};

