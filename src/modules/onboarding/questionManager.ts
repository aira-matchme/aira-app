import type { NavigationProp as StackNavigationProp } from '@react-navigation/native';
import type { AuthStackParamList } from '../../navigation/types';
import type { OnboardingQuestion } from './questions.data';
import {
  getActiveQuestions,
  getNextQuestion,
  getPreviousQuestion,
  getTotalQuestions,
  getQuestionByOrder,
  dummyQuestions,
} from './questions.data';
import { useOnboardingStore } from '../../store/onboarding.store';
import { fetchOnboardingQuestions, submitOnboardingAnswers } from './api';
import { useQuery } from '@tanstack/react-query';

type NavigationProp = StackNavigationProp<AuthStackParamList>;

let currentQuestions: OnboardingQuestion[] = dummyQuestions;

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
) => {
  const allQuestions = currentQuestions;
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
      navigation.navigate('OnboardingRadioQuestion', params);
  }
};

export const navigateToNextQuestion = (
  navigation: NavigationProp,
  currentQuestionOrder: number,
): void => {
  const { setCurrentQuestionOrder } = useOnboardingStore.getState();
  const allQuestions = currentQuestions;
  const nextQuestion = getNextQuestion(allQuestions, currentQuestionOrder);
  if (nextQuestion) {
    setCurrentQuestionOrder(nextQuestion.questionOrder);
    navigateToQuestion(navigation, nextQuestion);
  } else {
    // All questions completed - submit answers
    const { answers, clearOnboarding } = useOnboardingStore.getState();
    const questionsByOrder = new Map(
      currentQuestions.map((q) => [q.questionOrder, q]),
    );

    (async () => {
      try {
        const payloadAnswers = answers
          .map((answer) => {
            const question = questionsByOrder.get(answer.questionOrder);
            if (!question?.id || answer.answer === null) {
              return null;
            }

            return {
              questionId: question.id,
              value: answer.answer,
              dimension: answer.dimension,
            };
          })
          .filter(
            (item): item is import('./api').QuestionAnswerPayload =>
              item !== null,
          );

        if (payloadAnswers.length > 0) {
          await submitOnboardingAnswers({ answers: payloadAnswers });
        }
      } catch (error) {
        // Submit failed
      } finally {
        clearOnboarding();
        navigation.navigate('PreferencesStart');
      }
    })();
  }
};

export const navigateToPreviousQuestion = (
  navigation: NavigationProp,
  currentQuestionOrder: number,
): void => {
  const { setCurrentQuestionOrder } = useOnboardingStore.getState();
  const allQuestions = currentQuestions;
  const previousQuestion = getPreviousQuestion(allQuestions, currentQuestionOrder);

  if (previousQuestion) {
    setCurrentQuestionOrder(previousQuestion.questionOrder);
    navigateToQuestion(navigation, previousQuestion);
  } else {
    // If there is no previous question, go back to previous screen (e.g. intro)
    navigation.goBack();
  }
};

export const navigateToFirstQuestion = (
  navigation: NavigationProp,
  allQuestions: OnboardingQuestion[] = dummyQuestions,
): void => {
  currentQuestions = allQuestions;
  const { setCurrentQuestionOrder } = useOnboardingStore.getState();
  const activeQuestions = getActiveQuestions(allQuestions);
  if (activeQuestions.length > 0) {
    setCurrentQuestionOrder(activeQuestions[0].questionOrder);
    navigateToQuestion(navigation, activeQuestions[0]);
  }
};

/**
 * Resume onboarding from where the user left off
 * Returns the question order to resume from, or null if starting fresh
 */
export const getResumeQuestion = (
  allQuestions: OnboardingQuestion[] = dummyQuestions,
): OnboardingQuestion | null => {
  currentQuestions = allQuestions;
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
): void => {
  currentQuestions = allQuestions;
  const resumeQuestion = getResumeQuestion(allQuestions);
  if (resumeQuestion) {
    const { setCurrentQuestionOrder } = useOnboardingStore.getState();
    setCurrentQuestionOrder(resumeQuestion.questionOrder);
    navigateToQuestion(navigation, resumeQuestion);
  } else {
    // No resume point, start from beginning
    navigateToFirstQuestion(navigation, allQuestions);
  }
};

export const useOnboardingQuestions = () => {
  const query = useQuery({
    queryKey: ['onboardingQuestions'],
    queryFn: fetchOnboardingQuestions,
  });

  return {
    questions: query.data ?? dummyQuestions,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};


