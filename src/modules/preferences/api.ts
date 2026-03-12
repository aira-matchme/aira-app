import { apiClient } from '../../services/api/client';
import { endpoints } from '../../services/api/endpoints';
import type { AddPreferencePayload } from './types';
import type {
  GenderOption,
  EducationOption,
  EmploymentOption,
  IncomeOption,
  PreferencesState,
} from '../../store/preferences.store';
import type { MaritalStatusOption } from '../../store/preferences.store';
import type { RelationshipIntentOption } from '../../store/preferences.store';
import { usePreferencesStore } from '../../store/preferences.store';

const MILES_TO_KM = 1.60934;
const KM_TO_MILES = 1 / MILES_TO_KM;
const CM_PER_INCH = 2.54;
const INCHES_PER_FOOT = 12;

function mapGenderToApi(gender: GenderOption): string {
  return gender === 'man' ? 'male' : 'female';
}

function mapEducationToApi(value: EducationOption): string {
  return value ?? 'other';
}

function mapIncomeToApi(value: IncomeOption): string {
  return value ?? 'prefer_not_to_say';
}

function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm / CM_PER_INCH;
  const feet = Math.floor(totalInches / INCHES_PER_FOOT);
  const inches = Math.round(totalInches % INCHES_PER_FOOT);
  return { feet: Math.max(0, Math.min(8, feet)), inches: Math.max(0, Math.min(11, inches)) };
}

function feetInchesToCm(feet: number, inches: number): number {
  const totalInches = feet * INCHES_PER_FOOT + inches;
  return Math.round(totalInches * CM_PER_INCH);
}

function mapGenderFromApi(gender: string | null | undefined): GenderOption | null {
  if (!gender) return null;
  if (gender === 'male') return 'man';
  if (gender === 'female') return 'woman';
  return null;
}

type GetPreferencesResponse = Partial<{
  lookingForGender: string;
  preferredRadiusKm: number;
  preferredReligions: string[];
  preferredEducationLevels: string;
  preferrededucationlevelrank: number;
  preferredEmploymentStatuses: string[];
  preferredIncomeRanges: string;
  prefferedincomerangeorder: number;
  preferredMinAge: number;
  preferredMaxAge: number;
  preferredMinHeightFt: number;
  preferredMaxHeightFt: number;
  preferredMinHeightIn: number;
  preferredMaxHeightIn: number;
  preferredBodyTypes: string[];
  preferredMaritalStatus: string[] | string;
  relationshipIntentLabel: string;
}>;

function educationFromRank(rank: number): EducationOption {
  // Backend ranks:
  // phd_dr: 5, masters_or_equivalent: 4, degree_or_equivalent: 3,
  // a_level_or_equivalent: 2, gcse_or_equivalent: 1, other: 0
  // Our app currently models "A level or equivalent" as `degree_or_equivalent` in preferences.
  if (rank >= 5) return 'phd_dr';
  if (rank === 4) return 'masters_or_equivalent';
  if (rank === 3) return 'degree_or_equivalent';
  if (rank === 2) return 'degree_or_equivalent';
  if (rank === 1) return 'gcse_or_equivalent';
  return 'other';
}

function incomeFromOrder(order: number): IncomeOption {
  // Backend order:
  // eur_50k_plus: 4, eur_40k_50k: 3, eur_30k_40k: 2, eur_20k_30k: 1, prefer_not_to_say: 0
  if (order >= 4) return 'eur_50k_plus';
  if (order === 3) return 'eur_40k_50k';
  if (order === 2) return 'eur_30k_40k';
  if (order === 1) return 'eur_20k_30k';
  return 'prefer_not_to_say';
}

function hydratePreferencesStoreFromApi(raw: unknown): void {
  const data = (raw ?? {}) as GetPreferencesResponse;

  const lookingFor = mapGenderFromApi(data.lookingForGender);
  if (lookingFor) {
    usePreferencesStore.getState().setLookingForGender([lookingFor]);
  }

  if (typeof data.preferredMinAge === 'number' && typeof data.preferredMaxAge === 'number') {
    usePreferencesStore.getState().setAgeRange(data.preferredMinAge, data.preferredMaxAge);
  }

  if (
    typeof data.preferredMinHeightFt === 'number' &&
    typeof data.preferredMinHeightIn === 'number' &&
    typeof data.preferredMaxHeightFt === 'number' &&
    typeof data.preferredMaxHeightIn === 'number'
  ) {
    const minCm = feetInchesToCm(data.preferredMinHeightFt, data.preferredMinHeightIn);
    const maxCm = feetInchesToCm(data.preferredMaxHeightFt, data.preferredMaxHeightIn);
    usePreferencesStore.getState().setHeightRange(minCm, maxCm);
  }

  if (typeof data.preferredRadiusKm === 'number') {
    // Distance screen enforces minRange=1, so ensure high >= 2 when hydrating.
    const highMiles = Math.max(2, Math.min(100, Math.round(data.preferredRadiusKm * KM_TO_MILES)));
    usePreferencesStore.getState().setDistanceMiles(1, highMiles);
  }

  if (typeof data.preferredEducationLevels === 'string') {
    usePreferencesStore.getState().setPreferredEducation(data.preferredEducationLevels as EducationOption);
  } else if (typeof data.preferrededucationlevelrank === 'number') {
    usePreferencesStore.getState().setPreferredEducation(educationFromRank(data.preferrededucationlevelrank));
  }

  if (Array.isArray(data.preferredEmploymentStatuses)) {
    usePreferencesStore.getState().setPreferredEmployment(data.preferredEmploymentStatuses as EmploymentOption[]);
  }

  if (typeof data.preferredIncomeRanges === 'string') {
    usePreferencesStore.getState().setPreferredIncome(data.preferredIncomeRanges as IncomeOption);
  } else if (typeof data.prefferedincomerangeorder === 'number') {
    usePreferencesStore.getState().setPreferredIncome(incomeFromOrder(data.prefferedincomerangeorder));
  }

  if (Array.isArray(data.preferredReligions)) {
    usePreferencesStore.getState().setPreferredReligions(data.preferredReligions);
  }

  if (Array.isArray(data.preferredBodyTypes)) {
    usePreferencesStore.getState().setPreferredBodyTypes(data.preferredBodyTypes);
  }

  const marital = Array.isArray(data.preferredMaritalStatus)
    ? data.preferredMaritalStatus[0]
    : data.preferredMaritalStatus;
  if (typeof marital === 'string' && marital.length > 0) {
    usePreferencesStore.getState().setPreferredMaritalStatus(marital as MaritalStatusOption);
  }

  const relIntentRaw =
    (data as any)?.relationshipIntentLabel ??
    (data as any)?.relationshipintentlabel ??
    (data as any)?.relationship_intent_label ??
    (data as any)?.relationshipIntent;

  if (typeof relIntentRaw === 'string' && relIntentRaw.length > 0) {
    usePreferencesStore
      .getState()
      .setRelationshipIntentLabel(relIntentRaw as RelationshipIntentOption);
  }
}

export function buildAddPreferencePayload(
  state: PreferencesState
): AddPreferencePayload {
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
      ? state.preferredEmployment
      : ['prefer_not_to_say'];
  const preferredIncomeRanges = state.preferredIncome
    ? mapIncomeToApi(state.preferredIncome)
    : 'prefer_not_to_say';

  const minFtIn = cmToFeetInches(state.preferredMinHeightcm);
  const maxFtIn = cmToFeetInches(state.preferredMaxHeightcm);

  const preferredMaritalStatus =
    state.preferredMaritalStatus != null
      ? [state.preferredMaritalStatus]
      : [];

  return {
    lookingForGender,
    preferredRadiusKm,
    preferredReligions: state.preferredReligions,
    preferredEducationLevels,
    preferredEmploymentStatuses,
    preferredIncomeRanges,
    preferredMinAge: state.preferredMinAge,
    preferredMaxAge: state.preferredMaxAge,
    preferredMinHeightFt: minFtIn.feet,
    preferredMaxHeightFt: maxFtIn.feet,
    preferredMinHeightIn: minFtIn.inches,
    preferredMaxHeightIn: maxFtIn.inches,
    preferredBodyTypes: state.preferredBodyTypes,
    preferredMaritalStatus,
    relationshipIntentLabel: state.relationshipIntentLabel ?? undefined,
    preferredChildren: 'no',
  };
}

export async function patchEditPreference(
  payload: AddPreferencePayload
): Promise<unknown> {
  const { data } = await apiClient.patch<unknown>(
    endpoints.preferences.editPreference,
    payload
  );
  return data;
}

export async function addPreference(
  payload: AddPreferencePayload
): Promise<unknown> {
  const { data } = await apiClient.post<unknown>(
    endpoints.preferences.addPreference,
    payload
  );
  return data;
}

export async function getPreferencesAndHydrateStore(): Promise<void> {
  const res = await apiClient.get<unknown>(endpoints.preferences.getPreferences);
  const top = (res as { data?: unknown })?.data ?? res;
  const raw = (top as { data?: unknown })?.data ?? top;
  hydratePreferencesStoreFromApi(raw);
}
