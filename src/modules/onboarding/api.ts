import { apiClient } from '../../services/api/client';
import { endpoints } from '../../services/api/endpoints';
import type { OnboardingQuestion } from './questions.data';

export interface QuestionOptionApi {
  label: string;
  value: number;
  id: string;
}

export interface OnboardingQuestionApi {
  questionOrder: number;
  dimension: string;
  isActive: boolean;
  isDeleted: boolean;
  isRequired: boolean;
  options: QuestionOptionApi[];
  questionText: string;
  questionType: 'radio' | 'boolean' | 'multiSelect' | 'card' | 'photo';
  id: string;
}

export interface GetQuestionsResponse {
  statusCode: number;
  message: string;
  data: OnboardingQuestionApi[];
}

const mapApiQuestionToOnboardingQuestion = (
  apiQuestion: OnboardingQuestionApi,
): OnboardingQuestion => ({
  id: apiQuestion.id,
  questionText: apiQuestion.questionText,
  questionType: apiQuestion.questionType,
  options: apiQuestion.options.map((opt) => ({
    label: opt.label,
    value: opt.value,
  })),
  dimension: apiQuestion.dimension,
  questionOrder: apiQuestion.questionOrder,
  isRequired: apiQuestion.isRequired,
  isActive: apiQuestion.isActive,
});

export const fetchOnboardingQuestions = async (): Promise<OnboardingQuestion[]> => {
  const { data } = await apiClient.get<GetQuestionsResponse>(
    endpoints.question.getQuestions,
  );

  const questions = data.data ?? [];

  return questions.map(mapApiQuestionToOnboardingQuestion);
};

export interface QuestionAnswerPayload {
  questionId: string;
  value: number | number[];
  dimension: string;
}

export interface SubmitAnswersRequest {
  answers: QuestionAnswerPayload[];
}

export interface SubmitAnswersResponse {
  statusCode: number;
  message: string;
}

export const submitOnboardingAnswers = async (
  payload: SubmitAnswersRequest,
): Promise<SubmitAnswersResponse> => {
  const { data } = await apiClient.post<SubmitAnswersResponse>(
    endpoints.question.answerQuestion,
    payload,
  );
  return data;
};



