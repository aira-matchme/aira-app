import { apiClient } from '../../services/api/client';
import { endpoints } from '../../services/api/endpoints';
import type { EditPreferencePayload } from './types';
import type {
  GenderOption,
  EducationOption,
  EmploymentOption,
  IncomeOption,
  PreferencesState,
} from '../../store/preferences.store';

const MILES_TO_KM = 1.60934;

function mapGenderToApi(gender: GenderOption): string {
  return gender === 'man' ? 'male' : 'female';
}

function mapEducationToApi(value: EducationOption): string {
  // Preference enums align with backend (same keys as profile constants)
  return value ?? 'other';
}

function mapEmploymentToApi(value: EmploymentOption): string {
  return value ?? 'prefer_not_to_say';
}

function mapIncomeToApi(value: IncomeOption): string {
  return value ?? 'prefer_not_to_say';
}

export function buildEditPreferencePayload(
  state: PreferencesState
): EditPreferencePayload {
  const lookingForGender =
    state.lookingForGender.length > 0
      ? mapGenderToApi(state.lookingForGender[0])
      : 'female';
  const preferredRadiusKm = Math.round(
    state.distanceMilesHigh * MILES_TO_KM
  );
  const preferredEducationLevels = state.preferredEducation
    ? mapEducationToApi(state.preferredEducation)
    : 'other';
  const preferredEmploymentStatuses =
    state.preferredEmployment.length > 0
      ? mapEmploymentToApi(state.preferredEmployment[0])
      : 'prefer_not_to_say';
  const preferredIncomeRanges = state.preferredIncome
    ? mapIncomeToApi(state.preferredIncome)
    : 'prefer_not_to_say';

  return {
    lookingForGender,
    preferredRadiusKm,
    preferredReligions: state.preferredReligions,
    preferredEducationLevels,
    preferredEmploymentStatuses,
    preferredIncomeRanges,
    preferredMinAge: state.preferredMinAge,
    preferredMaxAge: state.preferredMaxAge,
    preferredMinHeightcm: state.preferredMinHeightcm,
    preferredMaxHeightcm: state.preferredMaxHeightcm,
    preferredBodyTypes: state.preferredBodyTypes,
  };
}

export async function patchEditPreference(
  payload: EditPreferencePayload
): Promise<unknown> {
  const { data } = await apiClient.patch<unknown>(
    endpoints.preferences.editPreference,
    payload
  );
  return data;
}
