import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StatusBar, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

import { BackArrowIcon } from '../../../assets/icons/common/BackArrowIcon';
import { OnboardingNextButtonIcon } from '../../../assets/icons/onboarding_next_button/OnboardingNextButtonIcon';
import type { AuthStackParamList } from '../../../navigation/types';
import {
  navigateToNextQuestion,
  navigateToPreviousQuestion,
} from '../../../modules/onboarding/questionManager';
import { useOnboardingStore } from '../../../store/onboarding.store';
import { styles } from './styles';

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

      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
          
            onPress={() => navigateToPreviousQuestion(navigation, questionOrder)}
          >
            <BackArrowIcon size={48} backgroundColor='#F1ECFE' />
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
            style={styles.circularButton}
            activeOpacity={0.85}
          >
            <OnboardingNextButtonIcon
              size={64}
              disabled={selectedOption === null}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};


