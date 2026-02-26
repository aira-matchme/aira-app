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
  'OnboardingMultiSelectQuestion'
>;

type RouteProps = RouteProp<AuthStackParamList, 'OnboardingMultiSelectQuestion'>;

export const OnboardingMultiSelectQuestionScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { saveAnswer, getAnswer } = useOnboardingStore();

  const {
    question,
    step,
    totalSteps,
    questionOrder,
    minSelections = 1,
    maxSelections,
  } = route.params;

  const scrollRef = useRef<ScrollView | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);

  useEffect(() => {
    // Reset scroll to top when question changes
    scrollRef.current?.scrollTo({ y: 0, animated: false });

    const saved = getAnswer(questionOrder);
    setSelectedOptions(((saved?.answer as number[]) ?? []) as number[]);
  }, [questionOrder, getAnswer]);

  const toggleOption = (value: number) => {
    setSelectedOptions(prev => {
      const isSelected = prev.includes(value);
      if (isSelected) {
        return prev.filter(item => item !== value);
      }
      if (maxSelections && prev.length >= maxSelections) {
        return prev; // ignore if max reached
      }
      return [...prev, value];
    });
  };

  const handleNext = () => {
    if (selectedOptions.length < minSelections) return;

    // Save answer
    saveAnswer({
      questionOrder,
      answer: selectedOptions,
      dimension: question.dimension,
    });

    // Navigate to next question
    navigateToNextQuestion(navigation, questionOrder);
  };

  const canContinue = selectedOptions.length >= minSelections;

  return (
    <View style={styles.wrapper}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
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
                  const selected = selectedOptions.includes(option.value);
                  return (
                    <TouchableOpacity
                      key={`${questionOrder}-${option.value}`}
                      style={[
                        styles.option,
                        selected && styles.optionSelected,
                      ]}
                      activeOpacity={0.85}
                      onPress={() => toggleOption(option.value)}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          selected && styles.checkboxSelected,
                        ]}
                      >
                        {selected && <View style={styles.checkboxInner} />}
                      </View>
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
            disabled={!canContinue}
            style={[
              styles.circularButton,
              !canContinue && styles.circularButtonDisabled,
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


