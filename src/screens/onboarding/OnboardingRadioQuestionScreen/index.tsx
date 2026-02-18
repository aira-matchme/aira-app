import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StatusBar, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

import { BackArrowIcon } from '../../../assets/icons/common/BackArrowIcon';
import { ForwardArrowIcon } from '../../../assets/icons/common/ForwardArrowIcon';
import type { AuthStackParamList } from '../../../navigation/types';
import {
  navigateToNextQuestion,
  navigateToPreviousQuestion,
} from '../../../modules/onboarding/questionManager';
import { useOnboardingStore } from '../../../store/onboarding.store';
import { styles } from './styles';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';

type NavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'OnboardingRadioQuestion'
>;

type RouteProps = RouteProp<AuthStackParamList, 'OnboardingRadioQuestion'>;

export const OnboardingRadioQuestionScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { saveAnswer, getAnswer } = useOnboardingStore();

  const { question, step, totalSteps, questionOrder } = route.params;

  const scrollRef = useRef<ScrollView | null>(null);

  // Local selection state, kept in sync with store when question changes
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  useEffect(() => {
    // Reset scroll to top when question changes
    scrollRef.current?.scrollTo({ y: 0, animated: false });

    const saved = getAnswer(questionOrder);
    setSelectedOption((saved?.answer as number | null) ?? null);
  }, [questionOrder, getAnswer]);

  const handleOptionPress = (value: number) => {
    setSelectedOption(value);
  };

  const handleNext = () => {
    if (selectedOption === null) return;

    // Save answer
    saveAnswer({
      questionOrder,
      answer: selectedOption,
      dimension: question.dimension,
    });

    // Navigate to next question
    navigateToNextQuestion(navigation, questionOrder);
  };

  return (
    <View style={styles.wrapper}>
     <View style={styles.backgroundGlow}>
  <Svg height="100%" width="100%" style={{ position: 'absolute' }}>
    <Defs>
      {/*
        RadialGradient usage:
        - id="grad"       : Unique ID for referencing (used in fill="url(#grad)")
        - cx="50%"        : Center X of ellipse (horizontally centered)
        - cy="30%"        : Center Y of ellipse (30% from top)
        - rx="60%"        : Radius X of ellipse (horizontal spread)
        - ry="60%"        : Radius Y of ellipse (vertical spread)
        - fx="50%"        : Focus X (gradient radiates from this point)
        - fy="40%"        : Focus Y (slightly below center for top-down glow)
        - Stop offset="0%": Inner color #C87BF5 at 80% opacity
        - Stop offset="100%": Outer color #FFFFFF at full opacity
      */}
     <RadialGradient
      id="grad"
      cx="50%"
      cy="40%"      // move slightly lower
      rx="65%"      // wider horizontal spread
      ry="85%"      // full vertical spread
      fx="40%"
      fy="35%"
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
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => navigateToPreviousQuestion(navigation, questionOrder)}
          >
            <BackArrowIcon size={48} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.card}>
            <ScrollView
              ref={scrollRef}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 16 }}
            >
              <View style={styles.stepRow}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>
                    {step}/{totalSteps}
                  </Text>
                </View>
                <View style={styles.stepDotLarge} />
                <View style={styles.stepDotLarge} />
                <View style={styles.stepDotSmall} />
                <View style={styles.stepDotSmall} />
              </View>

              <Text style={styles.title}>{question.questionText}</Text>

              <View style={styles.optionsContainer}>
                {question.options.map((option) => {
                  const selected = selectedOption === option.value;
                  return (
                    <TouchableOpacity
                      key={`${questionOrder}-${option.value}`}
                      style={[
                        styles.option,
                        selected && styles.optionSelected,
                      ]}
                      activeOpacity={0.85}
                      onPress={() => handleOptionPress(option.value)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          selected && styles.optionTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>

        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity
            onPress={handleNext}
            disabled={selectedOption === null}
            style={[
              styles.circularButton,
              selectedOption === null && styles.circularButtonDisabled,
            ]}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#CB7BF5', '#7742F0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0.88, y: 1 }}
              style={styles.circularButtonGradient}
            >
              <ForwardArrowIcon size={24} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};


