import React from 'react';
import { View, Text, StatusBar, Image, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { Button } from '../../../components/Button';
import { STRINGS } from '../../../constants/strings';
import type { AuthStackParamList } from '../../../navigation/types';
import {
  navigateToFirstQuestion,
  navigateToResumeQuestion,
  useOnboardingQuestions,
} from '../../../modules/onboarding/questionManager';
import { useOnboardingStore } from '../../../store/onboarding.store';
import { FIGMA_ONBOARDING_INTRO, styles } from './styles';

const ONBOARDING_IMAGE = require('../../../assets/images/onboardingintro.png');

type OnboardingIntroNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'OnboardingIntro'>;

export const OnboardingIntroScreen: React.FC = () => {
  const navigation = useNavigation<OnboardingIntroNavigationProp>();
  const insets = useSafeAreaInsets();
  const { height: winH } = useWindowDimensions();
  const { isOnboardingInProgress } = useOnboardingStore();
  const { questions, isLoading, isError } = useOnboardingQuestions();

  const handleBegin = () => {
    if (isLoading || isError) {
      return;
    }

    if (isOnboardingInProgress) {
      navigateToResumeQuestion(navigation, questions);
    } else {
      navigateToFirstQuestion(navigation, questions);
    }
  };

  const imageHeight = Math.round(
    Math.min(
      FIGMA_ONBOARDING_INTRO.IMAGE_MAX_H,
      Math.max(FIGMA_ONBOARDING_INTRO.IMAGE_MIN_H, winH * FIGMA_ONBOARDING_INTRO.IMAGE_HEIGHT_RATIO),
    ),
  );

  const footerPaddingBottom =
    insets.bottom + FIGMA_ONBOARDING_INTRO.FOOTER_PADDING_BOTTOM;

  return (
    <View style={styles.wrapper}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <View style={styles.gradientBackground}>
        <Svg height="100%" width="100%" style={styles.gradientSvg}>
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
          <Rect width="100%" height="100%" fill="url(#grad)" />
        </Svg>
      </View>

      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={[styles.imageSection, { height: imageHeight }]}>
          <Image
            source={ONBOARDING_IMAGE}
            style={styles.onboardingImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.contentSection}>
          <View style={styles.copyWrap}>
            <View style={styles.content}>
              <Text style={styles.title}>{STRINGS.ONBOARDING_INTRO.TITLE}</Text>

              <View style={styles.descriptionContainer}>
                <Text style={styles.description}>{STRINGS.ONBOARDING_INTRO.DESCRIPTION}</Text>
                <Text style={styles.timeEstimate}>{STRINGS.ONBOARDING_INTRO.TIME_ESTIMATE}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.footerStack, { paddingBottom: footerPaddingBottom }]}>
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

            <Text style={styles.privacyNote}>{STRINGS.ONBOARDING_INTRO.PRIVACY_NOTE}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};
