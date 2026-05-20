import React from 'react';
import { View, Text, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { Button } from '../../../components/Button';
import { STRINGS } from '../../../constants/strings';
import type { AuthStackParamList } from '../../../navigation/types';
import { styles } from './styles';

const PROFILE_IMAGE = require('../../../assets/images/ProfileImage.png');

type ProfileIntroNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'ProfileIntro'>;

export const ProfileIntroScreen: React.FC = () => {
  const navigation = useNavigation<ProfileIntroNavigationProp>();

  const handleContinue = () => {
    navigation.navigate('BasicDetailsName');
  };

  return (
    <View style={styles.wrapper}>
      {/* Bottom-right radial glow matching Figma ellipse */}
      <View style={styles.bottomGlow}>
        <Svg height="100%" width="100%">
          <Defs>
            <RadialGradient id="introGlow" cx="100%" cy="100%" rx="100%" ry="100%" fx="100%" fy="100%">
              <Stop offset="0%" stopColor="#C87BF5" stopOpacity="0.4" />
              <Stop offset="70%" stopColor="#C87BF5" stopOpacity="0.08" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#introGlow)" />
        </Svg>
      </View>

      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
        <View style={styles.container}>
          {/* Hero image */}
          <View style={styles.headerCard}>
            <Image
              source={PROFILE_IMAGE}
              style={styles.headerImage}
              resizeMode="cover"
            />
          </View>

          {/* Text + button below image */}
          <View style={styles.bottomSection}>
            <View style={styles.content}>
              <Text style={styles.title}>{STRINGS.PROFILE_INTRO.TITLE}</Text>
              <Text style={styles.subtitle}>{STRINGS.PROFILE_INTRO.SUBTITLE}</Text>
            </View>

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
