import React, { useState } from 'react';
import { View, Text, StatusBar, Platform, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import { GradientBackground } from '../../../components/GradientBackground';
// import { GradientBackground } from '../../../components/GradientBackground';
import { ReusableBottomSheet } from '../../../components/BottomSheet';
import { Button } from '../../../components/Button';
import { STRINGS } from '../../../constants/strings';
import { requestLocationPermission } from '../../../config/permissions';
import type { AuthStackParamList } from '../../../navigation/types';
import LocationMockup from '../../../assets/icons/common/LocationMockup';
import { styles } from './styles';

type EnableLocationNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'EnableLocation'>;

export const EnableLocationScreen = () => {
  const navigation = useNavigation<EnableLocationNavigationProp>();
  const [isRequesting, setIsRequesting] = useState(false);
  const [showPermissionSheet, setShowPermissionSheet] = useState(false);

  const handleEnableLocation = async () => {
    setShowPermissionSheet(true);
  };

  const handleAllow = async () => {
    setShowPermissionSheet(false);
    setIsRequesting(true);
    try {
      const status = await requestLocationPermission();
      
      if (status === 'granted') {
        navigation.navigate('ProfileIntro');
      } else if (status === 'denied') {
        // User denied
      }
    } catch (error) {
      // Request failed
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDontAllow = () => {
    setShowPermissionSheet(false);
    navigation.navigate('ProfileIntro');
  };

  const handleMayBeLater = () => {
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
          <View style={styles.container}>
            <LocationMockup />
            <View style={styles.content}>
              <Text style={styles.title}>
                {STRINGS.ENABLE_LOCATION.TITLE}
              </Text>
              <Text style={styles.subtitle}>
                {STRINGS.ENABLE_LOCATION.SUBTITLE}
              </Text>

              <View style={styles.actions}>
                <Button
                  title={STRINGS.ENABLE_LOCATION.PRIMARY_CTA}
                  onPress={handleEnableLocation}
                  variant="primary"
                  disabled={isRequesting}
                  loading={isRequesting}
                  style={styles.primaryButton}
                />
                <TouchableOpacity
                  onPress={handleMayBeLater}
                  activeOpacity={0.7}
                >
                  <Text style={styles.secondaryText}>
                    {STRINGS.ENABLE_LOCATION.SECONDARY_CTA}
                  </Text>
                </TouchableOpacity>
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
            "Aira" Would Like to Access Your Location
          </Text>
          
          <Text style={styles.permissionDescription}>
            Aira uses your location to show you matches nearby and help you discover meaningful connections in your area.
          </Text>

          <View style={styles.permissionButtons}>
            <TouchableOpacity
              onPress={handleAllow}
              activeOpacity={0.8}
              style={styles.allowButtonWrapper}
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
            >
              <Text style={styles.dontAllowButtonText}>Don't Allow</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ReusableBottomSheet>
    </View>
  );
};

