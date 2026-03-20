import { apiClient } from '../../services/api/client';
import { endpoints } from '../../services/api/endpoints';

export type ReferenceImageOption = {
  value: string;
  image: string;
};

export type ReferenceNextData = {
  currentSelection: Record<string, unknown>;
  currentField: string;
  nextField?: string | null;
  options: ReferenceImageOption[];
  isComplete: boolean;
};

export async function getReferenceNextApi(): Promise<ReferenceNextData> {
  const { data } = await apiClient.get<{ statusCode?: number; message?: string; data: ReferenceNextData }>(
    endpoints.question.getrefereceImages,
  );
  return data.data;
}

export async function postReferenceImageAnswerApi(params: {
  field: string;
  value: Array<Record<string, number>>;
}): Promise<{ statusCode?: number; message?: string; data?: unknown }> {
  const { data } = await apiClient.post(endpoints.question.postReferenceImages, {
    field: params.field,
    value: params.value,
  });
  return data;
}

