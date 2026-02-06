import type { NavigationProp } from '@react-navigation/native';
import type { AuthStackParamList } from '../../navigation/types';
import type { OnboardingQuestion } from './questions.data';
import {
  getActiveQuestions,
  getNextQuestion,
  getTotalQuestions,
  getQuestionByOrder,
  dummyQuestions,
} from './questions.data';
import { useOnboardingStore } from '../../store/onboarding.store';

type NavigationProp = NavigationProp<AuthStackParamList>;

export interface QuestionAnswer {
  questionOrder: number;
  answer: number | number[] | null;
  dimension: string;
}

// Re-export for convenience
export { useOnboardingStore };

export const navigateToQuestion = (
  navigation: NavigationProp,
  question: OnboardingQuestion,
  allQuestions: OnboardingQuestion[] = dummyQuestions,
) => {
  const activeQuestions = getActiveQuestions(allQuestions);
  const currentIndex = activeQuestions.findIndex(q => q.questionOrder === question.questionOrder);
  const step = currentIndex + 1;
  const totalSteps = getTotalQuestions(allQuestions);

  const params = {
    question,
    step,
    totalSteps,
    questionOrder: question.questionOrder,
  };

  switch (question.questionType) {
    case 'radio':
      navigation.navigate('OnboardingRadioQuestion', params);
      break;
    case 'boolean':
      navigation.navigate('OnboardingBooleanQuestion', params);
      break;
    case 'multiSelect':
      navigation.navigate('OnboardingMultiSelectQuestion', params);
      break;
    case 'card':
      navigation.navigate('OnboardingCardQuestion', params);
      break;
    case 'photo':
      navigation.navigate('OnboardingPhotoQuestion', params);
      break;
    default:
      console.warn(`Unknown question type: ${question.questionType}`);
      // Default to radio for unknown types
      navigation.navigate('OnboardingRadioQuestion', params);
  }
};

export const navigateToNextQuestion = (
  navigation: NavigationProp,
  currentQuestionOrder: number,
  allQuestions: OnboardingQuestion[] = dummyQuestions,
) => {
  const { setCurrentQuestionOrder } = useOnboardingStore.getState();
  const nextQuestion = getNextQuestion(allQuestions, currentQuestionOrder);
  if (nextQuestion) {
    setCurrentQuestionOrder(nextQuestion.questionOrder);
    navigateToQuestion(navigation, nextQuestion, allQuestions);
  } else {
    // All questions completed - navigate to dashboard or completion screen
    const { answers, clearOnboarding } = useOnboardingStore.getState();
    console.log('All questions completed!', answers);
    // Clear onboarding state when completed
    clearOnboarding();
    // TODO: Navigate to completion screen or dashboard
    // navigation.navigate('Dashboard');
  }
};

export const navigateToFirstQuestion = (
  navigation: NavigationProp,
  allQuestions: OnboardingQuestion[] = dummyQuestions,
) => {
  const { setCurrentQuestionOrder } = useOnboardingStore.getState();
  const activeQuestions = getActiveQuestions(allQuestions);
  if (activeQuestions.length > 0) {
    setCurrentQuestionOrder(activeQuestions[0].questionOrder);
    navigateToQuestion(navigation, activeQuestions[0], allQuestions);
  }
};

/**
 * Resume onboarding from where the user left off
 * Returns the question order to resume from, or null if starting fresh
 */
export const getResumeQuestion = (
  allQuestions: OnboardingQuestion[] = dummyQuestions,
): OnboardingQuestion | null => {
  const { answers, getLastAnsweredQuestionOrder } = useOnboardingStore.getState();
  
  if (answers.length === 0) {
    // No answers yet, start from first question
    return null;
  }

  const lastAnsweredOrder = getLastAnsweredQuestionOrder();
  if (lastAnsweredOrder === null) {
    return null;
  }

  // Find the next unanswered question
  const activeQuestions = getActiveQuestions(allQuestions);
  const lastAnsweredIndex = activeQuestions.findIndex(
    (q) => q.questionOrder === lastAnsweredOrder,
  );

  if (lastAnsweredIndex === -1) {
    // Last answered question not found, start from beginning
    return null;
  }

  // Check if there's a next question
  if (lastAnsweredIndex < activeQuestions.length - 1) {
    const nextQuestion = activeQuestions[lastAnsweredIndex + 1];
    return nextQuestion;
  }

  // All questions answered, return null to indicate completion
  return null;
};

/**
 * Navigate to resume onboarding from where user left off
 */
export const navigateToResumeQuestion = (
  navigation: NavigationProp,
  allQuestions: OnboardingQuestion[] = dummyQuestions,
) => {
  const resumeQuestion = getResumeQuestion(allQuestions);
  if (resumeQuestion) {
    const { setCurrentQuestionOrder } = useOnboardingStore.getState();
    setCurrentQuestionOrder(resumeQuestion.questionOrder);
    navigateToQuestion(navigation, resumeQuestion, allQuestions);
  } else {
    // No resume point, start from beginning
    navigateToFirstQuestion(navigation, allQuestions);
  }
};

