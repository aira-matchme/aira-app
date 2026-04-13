import React, { useState } from 'react';
import { View, Text, StatusBar, TouchableOpacity, Pressable, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ReusableBottomSheet } from '../../../components/BottomSheet';
import { Button } from '../../../components/Button';
import { STRINGS } from '../../../constants/strings';
import { requestNotificationPermission } from '../../../config/permissions';
import { useAuthStore } from '../../../store/auth.store';
import type { AuthStackParamList } from '../../../navigation/types';
import Mockup from '../../../assets/icons/common/Mockup';
import { FIGMA_ENABLE_NOTIFICATIONS, styles } from './styles';
import { GradientBackground } from '../../../components/GradientBackground';

type EnableNotificationsNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'EnableNotifications'>;

/** Figma Y is from frame top; `figmaCanvas` starts at safe-area top, so absolute top = figmaY − insets.top. */
function figmaYToLayoutTop(figmaY: number, safeTop: number): number {
  return Math.max(0, figmaY - safeTop);
}

export const EnableNotificationsScreen = () => {
  const navigation = useNavigation<EnableNotificationsNavigationProp>();
  const insets = useSafeAreaInsets();
  const { width: winW } = useWindowDimensions();
  const setShouldShowEnableNotifications = useAuthStore((s) => s.setShouldShowEnableNotifications);
  const [isRequesting, setIsRequesting] = useState(false);
  const [showPermissionSheet, setShowPermissionSheet] = useState(false);

  const { TITLE_TOP, PRIMARY_BUTTON_TOP, GAP_PRIMARY_SECONDARY, PRIMARY_H, HORIZONTAL_INSET, CONTENT_W } =
    FIGMA_ENABLE_NOTIFICATIONS;

  const contentW = Math.min(CONTENT_W, winW - HORIZONTAL_INSET * 2);
  const contentLeft = (winW - contentW) / 2;

  const copyTop = figmaYToLayoutTop(TITLE_TOP, insets.top);
  const primaryTop = figmaYToLayoutTop(PRIMARY_BUTTON_TOP, insets.top);
  const secondaryTop = primaryTop + PRIMARY_H + GAP_PRIMARY_SECONDARY;

  const absContentStyle = { left: contentLeft, width: contentW } as const;

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
    } catch {
      // Request failed
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDontAllow = () => {
    setShowPermissionSheet(false);
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
      {/* <View style={styles.orbLeft} pointerEvents="none" />
      <View style={styles.orbRight} pointerEvents="none" /> */}
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.figmaCanvas}>
          <View style={styles.mockupPad} pointerEvents="none">
            <Mockup />
          </View>

          <View style={[styles.absBlock, absContentStyle, { top: copyTop }]}>
            <View style={styles.copyBlock}>
              <Text style={styles.title}>{STRINGS.ENABLE_NOTIFICATIONS.TITLE}</Text>
              <Text style={styles.subtitle}>{STRINGS.ENABLE_NOTIFICATIONS.SUBTITLE}</Text>
            </View>
          </View>

          <View style={[styles.absBlock, styles.bottomSafePad, absContentStyle, { top: primaryTop }]}>
            <View style={styles.actions}>
              <Button
                title={STRINGS.ENABLE_NOTIFICATIONS.PRIMARY_CTA}
                onPress={handleEnableNotifications}
                variant="primary"
                disabled={isRequesting}
                loading={isRequesting}
                style={styles.primaryButton}
              />
            </View>
          </View>

          <View style={[styles.absBlock, styles.bottomSafePad, absContentStyle, { top: secondaryTop }]}>
            <Pressable
              onPress={handleMayBeLater}
              hitSlop={{ top: 25, bottom: 25, left: 25, right: 25 }}
              style={({ pressed }) => [styles.maybeLaterButton, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.secondaryText}>{STRINGS.ENABLE_NOTIFICATIONS.SECONDARY_CTA}</Text>
            </Pressable>
          </View>

        </View>
      </SafeAreaView>
      </GradientBackground>

      <ReusableBottomSheet
        isOpen={showPermissionSheet}
        onClose={handleCloseSheet}
        snapPoints={['55%']}
        showDragHandle={true}
        showCloseButton={true}
        enablePanDownToClose={true}
        backgroundStyle={styles.bottomSheetBackground}
        scrollEnabled={false}
      >
        <View style={styles.permissionSheetContent}>
          <Text style={styles.permissionTitle}>{STRINGS.ENABLE_NOTIFICATIONS.SHEET_TITLE}</Text>

          <Text style={styles.permissionDescription}>{STRINGS.ENABLE_NOTIFICATIONS.SHEET_DESCRIPTION}</Text>

          <View style={styles.permissionButtons}>
            <View style={styles.allowButtonWrap}>
              <Button title={STRINGS.ENABLE_NOTIFICATIONS.SHEET_ALLOW} onPress={handleAllow} variant="primary" />
            </View>

            <TouchableOpacity
              onPress={handleDontAllow}
              activeOpacity={0.7}
              style={styles.dontAllowButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.dontAllowButtonText}>{STRINGS.ENABLE_NOTIFICATIONS.SHEET_DONT_ALLOW}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ReusableBottomSheet>
    </View>
  );
};
