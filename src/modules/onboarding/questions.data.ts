// Dummy questions data for testing
// In production, this will be fetched from the backend

export interface QuestionOption {
  label: string;
  value: number;
}

export interface OnboardingQuestion {
  id?: string;
  questionText: string;
  questionType: 'radio' | 'boolean' | 'multiSelect' | 'card' | 'photo';
  options: QuestionOption[];
  dimension: string;
  questionOrder: number;
  isRequired: boolean;
  isActive: boolean;
}

export const dummyQuestions: OnboardingQuestion[] = [
  {
    questionText: 'I enjoy spending time alone to recharge.',
    questionType: 'radio',
    options: [
      { label: 'Strongly Disagree', value: 1 },
      { label: 'Disagree', value: 2 },
      { label: 'Agree', value: 3 },
      { label: 'Strongly Agree', value: 4 },
    ],
    dimension: 'SE',
    questionOrder: 1,
    isRequired: true,
    isActive: true,
  },
  {
    questionText: 'I prefer planning things in advance rather than being spontaneous.',
    questionType: 'radio',
    options: [
      { label: 'Strongly Disagree', value: 1 },
      { label: 'Disagree', value: 2 },
      { label: 'Agree', value: 3 },
      { label: 'Strongly Agree', value: 4 },
    ],
    dimension: 'LP',
    questionOrder: 2,
    isRequired: true,
    isActive: true,
  },
  {
    questionText: 'I feel energized when I am around people.',
    questionType: 'radio',
    options: [
      { label: 'Never', value: 1 },
      { label: 'Sometimes', value: 2 },
      { label: 'Often', value: 3 },
      { label: 'Always', value: 4 },
    ],
    dimension: 'EE',
    questionOrder: 3,
    isRequired: true,
    isActive: true,
  },
  {
    questionText: 'I like trying new experiences even if they feel uncertain.',
    questionType: 'radio',
    options: [
      { label: 'Never', value: 1 },
      { label: 'Sometimes', value: 2 },
      { label: 'Often', value: 3 },
      { label: 'Always', value: 4 },
    ],
    dimension: 'VO',
    questionOrder: 4,
    isRequired: true,
    isActive: true,
  },
  {
    questionText: 'I am comfortable sharing my feelings with others.',
    questionType: 'radio',
    options: [
      { label: 'Very Uncomfortable', value: 1 },
      { label: 'Uncomfortable', value: 2 },
      { label: 'Comfortable', value: 3 },
      { label: 'Very Comfortable', value: 4 },
    ],
    dimension: 'EE',
    questionOrder: 5,
    isRequired: true,
    isActive: true,
  },
  {
    questionText: 'I prefer logic over emotions when making decisions.',
    questionType: 'radio',
    options: [
      { label: 'Strongly Disagree', value: 1 },
      { label: 'Disagree', value: 2 },
      { label: 'Agree', value: 3 },
      { label: 'Strongly Agree', value: 4 },
    ],
    dimension: 'LP',
    questionOrder: 6,
    isRequired: true,
    isActive: true,
  },
  {
    questionText: 'I like taking leadership roles in group situations.',
    questionType: 'radio',
    options: [
      { label: 'Never', value: 1 },
      { label: 'Sometimes', value: 2 },
      { label: 'Often', value: 3 },
      { label: 'Always', value: 4 },
    ],
    dimension: 'SE',
    questionOrder: 7,
    isRequired: true,
    isActive: true,
  },
  {
    questionText: 'I adapt quickly when plans suddenly change.',
    questionType: 'radio',
    options: [
      { label: 'Very Poorly', value: 1 },
      { label: 'Poorly', value: 2 },
      { label: 'Well', value: 3 },
      { label: 'Very Well', value: 4 },
    ],
    dimension: 'VO',
    questionOrder: 8,
    isRequired: true,
    isActive: true,
  },
  {
    questionText: 'I reflect deeply before making important life decisions.',
    questionType: 'radio',
    options: [
      { label: 'Never', value: 1 },
      { label: 'Sometimes', value: 2 },
      { label: 'Often', value: 3 },
      { label: 'Always', value: 4 },
    ],
    dimension: 'RI',
    questionOrder: 9,
    isRequired: true,
    isActive: true,
  },
  {
    questionText: 'I feel comfortable expressing disagreement respectfully.',
    questionType: 'boolean',
    options: [
      { label: 'Yes', value: 1 },
      { label: 'No', value: 0 },
    ],
    dimension: 'SE',
    questionOrder: 10,
    isRequired: true,
    isActive: true,
  },
  {
    questionText: 'I enjoy working in teams rather than alone.',
    questionType: 'radio',
    options: [
      { label: 'Strongly Disagree', value: 1 },
      { label: 'Disagree', value: 2 },
      { label: 'Agree', value: 3 },
      { label: 'Strongly Agree', value: 4 },
    ],
    dimension: 'EE',
    questionOrder: 11,
    isRequired: true,
    isActive: true,
  },
  {
    questionText: 'I prefer structure over flexibility in my daily routine.',
    questionType: 'radio',
    options: [
      { label: 'Strongly Prefer Flexibility', value: 1 },
      { label: 'Prefer Flexibility', value: 2 },
      { label: 'Prefer Structure', value: 3 },
      { label: 'Strongly Prefer Structure', value: 4 },
    ],
    dimension: 'LP',
    questionOrder: 12,
    isRequired: true,
    isActive: true,
  },
  {
    questionText: 'I enjoy exploring creative hobbies.',
    questionType: 'boolean',
    options: [
      { label: 'Yes', value: 1 },
      { label: 'No', value: 0 },
    ],
    dimension: 'VO',
    questionOrder: 13,
    isRequired: true,
    isActive: true,
  },
  {
    questionText: 'I often analyze my past actions to improve.',
    questionType: 'radio',
    options: [
      { label: 'Never', value: 1 },
      { label: 'Sometimes', value: 2 },
      { label: 'Often', value: 3 },
      { label: 'Always', value: 4 },
    ],
    dimension: 'RI',
    questionOrder: 14,
    isRequired: true,
    isActive: true,
  },
  {
    questionText: 'I feel confident expressing my opinions publicly.',
    questionType: 'radio',
    options: [
      { label: 'Not Confident', value: 1 },
      { label: 'Somewhat Confident', value: 2 },
      { label: 'Confident', value: 3 },
      { label: 'Very Confident', value: 4 },
    ],
    dimension: 'SE',
    questionOrder: 15,
    isRequired: true,
    isActive: true,
  },
  {
    questionText: 'I prefer facts over assumptions.',
    questionType: 'boolean',
    options: [
      { label: 'Yes', value: 1 },
      { label: 'No', value: 0 },
    ],
    dimension: 'LP',
    questionOrder: 16,
    isRequired: true,
    isActive: true,
  },
];

// Helper function to get active questions sorted by order
export const getActiveQuestions = (questions: OnboardingQuestion[]): OnboardingQuestion[] => {
  return questions
    .filter(q => q.isActive)
    .sort((a, b) => a.questionOrder - b.questionOrder);
};

// Helper function to get question by order
export const getQuestionByOrder = (
  questions: OnboardingQuestion[],
  order: number,
): OnboardingQuestion | undefined => {
  const activeQuestions = getActiveQuestions(questions);
  return activeQuestions.find(q => q.questionOrder === order);
};

// Helper function to get next question
export const getNextQuestion = (
  questions: OnboardingQuestion[],
  currentOrder: number,
): OnboardingQuestion | undefined => {
  const activeQuestions = getActiveQuestions(questions);
  const currentIndex = activeQuestions.findIndex(q => q.questionOrder === currentOrder);
  if (currentIndex === -1 || currentIndex === activeQuestions.length - 1) {
    return undefined;
  }
  return activeQuestions[currentIndex + 1];
};

// Helper function to get previous question
export const getPreviousQuestion = (
  questions: OnboardingQuestion[],
  currentOrder: number,
): OnboardingQuestion | undefined => {
  const activeQuestions = getActiveQuestions(questions);
  const currentIndex = activeQuestions.findIndex(q => q.questionOrder === currentOrder);
  if (currentIndex <= 0) {
    return undefined;
  }
  return activeQuestions[currentIndex - 1];
};

// Helper function to get total number of active questions
export const getTotalQuestions = (questions: OnboardingQuestion[]): number => {
  return getActiveQuestions(questions).length;
};

