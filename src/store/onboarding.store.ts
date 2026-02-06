import { create } from 'zustand';

export interface QuestionAnswer {
  questionOrder: number;
  answer: number | number[] | null;
  dimension: string;
}

interface OnboardingState {
  answers: QuestionAnswer[];
  currentQuestionOrder: number | null;
  isOnboardingInProgress: boolean;
  saveAnswer: (answer: QuestionAnswer) => void;
  setCurrentQuestionOrder: (order: number | null) => void;
  getAnswer: (questionOrder: number) => QuestionAnswer | undefined;
  clearOnboarding: () => void;
  getLastAnsweredQuestionOrder: () => number | null;
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  answers: [],
  currentQuestionOrder: null,
  isOnboardingInProgress: false,

  saveAnswer: (answer) => {
    set((state) => {
      const existingIndex = state.answers.findIndex(
        (a) => a.questionOrder === answer.questionOrder,
      );
      const newAnswers =
        existingIndex >= 0
          ? state.answers.map((a, idx) =>
              idx === existingIndex ? answer : a,
            )
          : [...state.answers, answer];

      return {
        answers: newAnswers,
        isOnboardingInProgress: true,
      };
    });
  },

  setCurrentQuestionOrder: (order) => {
    set({ currentQuestionOrder: order, isOnboardingInProgress: true });
  },

  getAnswer: (questionOrder) => {
    return get().answers.find((a) => a.questionOrder === questionOrder);
  },

  clearOnboarding: () => {
    set({
      answers: [],
      currentQuestionOrder: null,
      isOnboardingInProgress: false,
    });
  },

  getLastAnsweredQuestionOrder: () => {
    const answers = get().answers;
    if (answers.length === 0) return null;
    return Math.max(...answers.map((a) => a.questionOrder));
  },
}));

