import React, { useState } from 'react';
import {
  View,
  Text,
  ImageBackground,
  StatusBar,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Button } from '../../../components/Button';
import { LoginOptionsBottomSheet } from '../../../components/LoginOptionsBottomSheet';
import { LogoWordmark } from '../../../assets/icons/branding/LogoWordmark';
import { styles } from './styles';

const IMAGE_BACKGROUND = require('../../../assets/images/welcomescreen.png');

export const WelcomeScreen: React.FC = () => {
  const [showLoginOptions, setShowLoginOptions] = useState(false);

  const handleGetStarted = () => {
    setShowLoginOptions(true);
  };

  const handleCloseLoginOptions = () => {
    setShowLoginOptions(false);
  };

  const handleTermsPress = () => {
    Linking.openURL('https://example.com/terms');
  };

  const handlePrivacyPress = () => {
    Linking.openURL('https://example.com/privacy');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ImageBackground
        source={IMAGE_BACKGROUND}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={[
            'rgba(0, 0, 0, 0)',
            'rgba(0, 0, 0, 0.7)',
            'rgba(0, 0, 0, 0.9)',
          ]}
          locations={[0, 0.47, 1]}
          style={styles.overlay}
        >
          <View style={styles.logoContainer}>
            <LogoWordmark />
          </View>

          <View style={styles.contentContainer}>
            <Text style={styles.heading}>
              Meaningful connections, intelligently matched.
            </Text>

            <View style={styles.buttonContainer}>
              <Button
                title="Get Started"
                onPress={handleGetStarted}
                variant="primary"
              />
            </View>

            <Text style={styles.termsText}>
              <Text>By continuing you agree to our </Text>
              <Text style={styles.link} onPress={handleTermsPress}>
                T&C
              </Text>
              <Text> and </Text>
              <Text style={styles.link} onPress={handlePrivacyPress}>
                Privacy Policy
              </Text>
            </Text>
          </View>
        </LinearGradient>
      </ImageBackground>

      <LoginOptionsBottomSheet
        isOpen={showLoginOptions}
        onClose={handleCloseLoginOptions}
      />
    </SafeAreaView>
  );
};

