import React, { useEffect, useState } from 'react';
import { View, Text, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { BackArrowIcon } from '../../../assets/icons/common/BackArrowIcon';
import { ForwardArrowIcon } from '../../../assets/icons/common/ForwardArrowIcon';
import type { AuthStackParamList } from '../../../navigation/types';
import {
  navigateToNextQuestion,
  navigateToPreviousQuestion,
} from '../../../modules/onboarding/questionManager';
import { useOnboardingStore } from '../../../store/onboarding.store';
import { styles } from './styles';

type NavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'OnboardingBooleanQuestion'
>;

type RouteProps = RouteProp<AuthStackParamList, 'OnboardingBooleanQuestion'>;

export const OnboardingBooleanQuestionScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { saveAnswer, getAnswer } = useOnboardingStore();

  const { question, step, totalSteps, questionOrder } = route.params;

  // Find Yes and No options
  const yesOption = question.options.find(opt => opt.value === 1);
  const noOption = question.options.find(opt => opt.value === 0);

  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    const saved = getAnswer(questionOrder);
    setSelected((saved?.answer as number | null) ?? null);
  }, [questionOrder, getAnswer]);

  const handleSelect = (value: number) => {
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

  const handleSkip = () => {
    if (!question.isRequired) {
      // Save null answer for optional questions
      saveAnswer({
        questionOrder,
        answer: null,
        dimension: question.dimension,
      });
      navigateToNextQuestion(navigation, questionOrder);
    }
  };

  return (
    <View style={styles.wrapper}>


      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}> */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigateToPreviousQuestion(navigation, questionOrder)}
          >
          <BackArrowIcon size={48} backgroundColor='#F1ECFE' />
          </TouchableOpacity>
          {!question.isRequired && (
            <TouchableOpacity onPress={handleSkip}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          )}
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

            <View style={styles.optionsRow}>
              {yesOption && (
                <TouchableOpacity
                  style={[
                    styles.pill,
                    selected === yesOption.value && styles.pillSelectedYes,
                  ]}
                  activeOpacity={0.85}
                  onPress={() => handleSelect(yesOption.value)}
                >
                  <Text
                    style={[
                      styles.pillText,
                      selected === yesOption.value && styles.pillTextYesSelected,
                    ]}
                  >
                    {yesOption.label}
                  </Text>
                </TouchableOpacity>
              )}

              {noOption && (
                <TouchableOpacity
                  style={[
                    styles.pill,
                    selected === noOption.value && styles.pillSelectedNo,
                  ]}
                  activeOpacity={0.85}
                  onPress={() => handleSelect(noOption.value)}
                >
                  <Text style={styles.pillText}>{noOption.label}</Text>
                </TouchableOpacity>
              )}
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
      {/* </SafeAreaView> */}
    </View>
  );
};


