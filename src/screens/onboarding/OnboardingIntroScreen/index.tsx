import React from 'react';
import { View, Text, StatusBar, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../../../components/Button';
import { STRINGS } from '../../../constants/strings';
import type { AuthStackParamList } from '../../../navigation/types';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import {
  navigateToFirstQuestion,
  navigateToResumeQuestion,
  useOnboardingQuestions,
} from '../../../modules/onboarding/questionManager';
import { LinearGradient } from 'react-native-linear-gradient';
import { useOnboardingStore } from '../../../store/onboarding.store';
import { colors } from '../../../theme';
import { styles } from './styles';

// Placeholder for the onboarding image - replace with actual asset
const ONBOARDING_IMAGE = require('../../../assets/images/onboardingintro.png'); // TODO: Replace with actual onboarding image

type OnboardingIntroNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'OnboardingIntro'>;

export const OnboardingIntroScreen: React.FC = () => {
  const navigation = useNavigation<OnboardingIntroNavigationProp>();
  const { isOnboardingInProgress } = useOnboardingStore();
  const { questions, isLoading, isError } = useOnboardingQuestions();

  const handleBegin = () => {
    if (isLoading || isError) {
      return;
    }

    // Navigate to first question (or resume if in progress)
    if (isOnboardingInProgress) {
      navigateToResumeQuestion(navigation, questions);
    } else {
      navigateToFirstQuestion(navigation, questions);
    }
  };

  return (
    <View style={styles.wrapper}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <View style={styles.gradientBackground}>
  <Svg height="100%" width="100%" style={{ position: 'absolute' }}>
    <Defs>
      <RadialGradient
        id="grad"
        cx="50%"
        cy="35%"
        rx="70%"
        ry="50%"
        fx="40%"
        fy="32%"
      >
        <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
        <Stop offset="0%" stopColor="#C87BF5" stopOpacity="0.7" />
        <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
      </RadialGradient>
    </Defs>
    {/* Full-size rect filled with the radial gradient */}
    <Rect width="100%" height="100%" fill="url(#grad)" />
  </Svg>
</View>
        <View style={styles.container}>
          {/* Image Section - 60% */}
          <View style={styles.imageSection}>
            <Image
              source={ONBOARDING_IMAGE}
              style={styles.onboardingImage}
              resizeMode="cover"
            />
          </View>

          {/* Content Section - 40% */}
          <View style={styles.contentSection}>
            <View style={styles.content}>
              <Text style={styles.title}>
                {STRINGS.ONBOARDING_INTRO.TITLE}
              </Text>
              
              <View style={styles.descriptionContainer}>
                <Text style={styles.description}>
                  {STRINGS.ONBOARDING_INTRO.DESCRIPTION}
                </Text>
                <Text style={styles.timeEstimate}>
                  {STRINGS.ONBOARDING_INTRO.TIME_ESTIMATE}
                </Text>
              </View>
            </View>

            {/* Loading / Error state */}
            <View style={styles.buttonContainer}>
              {isLoading ? (
                <ActivityIndicator />
              ) : isError ? (
                <Text style={styles.description}>
                  {STRINGS.GENERAL.ERROR_TRY_AGAIN ?? 'Something went wrong. Please try again.'}
                </Text>
              ) : (
                <Button
                  title={STRINGS.ONBOARDING_INTRO.PRIMARY_CTA}
                  onPress={handleBegin}
                  variant="primary"
                  style={styles.button}
                />
              )}
            </View>

            {/* Privacy Note */}
            <Text style={styles.privacyNote}>
              {STRINGS.ONBOARDING_INTRO.PRIVACY_NOTE}
            </Text>
          </View>
        </View>
      {/* </SafeAreaView> */}
    </View>
  );
};

