import React from 'react';
import { View, Text, StatusBar, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import Video from 'react-native-video';
import { Button } from '../../../components/Button';
import { colors } from '../../../theme';
import { STRINGS } from '../../../constants/strings';
import type { AuthStackParamList } from '../../../navigation/types';
import { styles } from './styles';

const PROFILE_VIDEO = require('../../../assets/images/profilevideo.mp4');

type ProfileIntroNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'ProfileIntro'>;

export const ProfileIntroScreen: React.FC = () => {
  const navigation = useNavigation<ProfileIntroNavigationProp>();

  const handleContinue = () => {
    navigation.navigate('BasicDetailsName');
  };

  return (
    <View style={styles.wrapper}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
        <View style={styles.container}>
          {/* Header Video Section */}
          <View style={styles.headerCard}>
            {Platform.OS === 'ios' ? (
              <Video
                source={PROFILE_VIDEO}
                style={styles.headerImage}
                resizeMode="cover"
                repeat
                muted
                paused={false}
                controls={false}
              />
            ) : (
              // Fallback on Android (avoids RCTVideo native dependency issues)
              <View style={styles.headerImage} />
            )}
          </View>

          {/* Bottom Gradient Card Section */}
          <View style={styles.bottomGradient}>
            <LinearGradient
              colors={[colors.white, colors.secondary.lavenderLight, colors.secondary.lavender]}
              locations={[0, 0.5, 0.9]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            {/* Content */}
            <View style={styles.content} pointerEvents="none">
              <Text style={styles.title}>{STRINGS.PROFILE_INTRO.TITLE}</Text>
              <Text style={styles.subtitle}>{STRINGS.PROFILE_INTRO.SUBTITLE}</Text>
            </View>

            {/* Button */}
            <View style={styles.actions}>
              <Button
                title={STRINGS.PROFILE_INTRO.PRIMARY_CTA}
                onPress={handleContinue}
                variant="secondary"
                style={styles.primaryButton}
                textStyle={styles.primaryButtonText}
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};
