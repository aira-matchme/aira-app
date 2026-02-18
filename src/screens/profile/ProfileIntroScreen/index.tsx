import React from 'react';
import { View, Text, Image, StatusBar, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import { Button } from '../../../components/Button';
import { colors } from '../../../theme';
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
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
        <View style={styles.container}>
          {/* Header Video Section */}
          <View style={styles.headerCard}>
            <Image
              source={PROFILE_IMAGE}
              style={styles.headerImage}
              resizeMode="cover"
            />
          </View>

          {/* Bottom Gradient Card Section */}
          <View style={styles.bottomGradient}>
            <LinearGradient
              colors={[colors.white, colors.secondary.lavenderLight, colors.secondary[200]]}
              locations={[0, 0.5, 1]}
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
