import React, { useState } from 'react';
import { View, Text, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

import { BackArrowIcon } from '../../../assets/icons/common/BackArrowIcon';
import { ForwardArrowIcon } from '../../../assets/icons/common/ForwardArrowIcon';
import type { AuthStackParamList } from '../../../navigation/types';
import { navigateToNextQuestion } from '../../../modules/onboarding/questionManager';
import { useOnboardingStore } from '../../../store/onboarding.store';
import { styles } from './styles';

type NavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'OnboardingCardQuestion'
>;

type RouteProps = RouteProp<AuthStackParamList, 'OnboardingCardQuestion'>;

export const OnboardingCardQuestionScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { saveAnswer, getAnswer } = useOnboardingStore();

  const { question, step, totalSteps, questionOrder } = route.params;

  // Load saved answer if exists
  const savedAnswer = getAnswer(questionOrder);
  const [selected, setSelected] = useState<number | null>(
    savedAnswer?.answer as number | null ?? null,
  );

  const handleCardPress = (value: number) => {
    setSelected(value);
  };

  const handleNext = () => {
    if (selected === null) return;

    // Save answer
    saveAnswer({
      questionOrder,
      answer: selected,
      dimension: question.dimension,
    });

    // Navigate to next question
    navigateToNextQuestion(navigation, questionOrder);
  };

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={['#F3E8FF', '#F5E7FF', '#F3E8FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.backgroundGlow}
      />

      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <BackArrowIcon size={48} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.card}>
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

            <View style={styles.grid}>
              {question.options.map((option) => {
                const isSelected = selected === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                    activeOpacity={0.9}
                    onPress={() => handleCardPress(option.value)}
                  >
                    <View
                      style={[
                        styles.iconCircle,
                        isSelected && styles.iconCircleSelected,
                      ]}
                    >
                      <Text style={styles.iconText}>♥</Text>
                    </View>
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity
            onPress={handleNext}
            disabled={selected === null}
            style={[
              styles.circularButton,
              selected === null && styles.circularButtonDisabled,
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


