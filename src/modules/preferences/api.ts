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
  return value ?? 'any';
}

function normalizeEducationFromApi(raw: string): EducationOption {
  if (raw === 'other') return 'any';
  const allowed: EducationOption[] = [
    'phd_dr',
    'masters_or_above',
    'degree_or_above',
    'a_level_or_above',
    'gcse_or_above',
    'any',
  ];
  if ((allowed as string[]).includes(raw)) return raw as EducationOption;
  return 'any';
}

function mapIncomeToApi(value: IncomeOption): string {
  return value ?? 'prefer_not_to_say';
}

export function cmToFeetInches(cm: number): { feet: number; inches: number } {
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
  // phd_dr: 5, masters_or_above: 4, degree_or_above: 3,
  // a_level_or_above: 2, gcse_or_above: 1, any: 0
  if (rank >= 5) return 'phd_dr';
  if (rank === 4) return 'masters_or_above';
  if (rank === 3) return 'degree_or_above';
  if (rank === 2) return 'a_level_or_above';
  if (rank === 1) return 'gcse_or_above';
  return 'any';
}

const PREFERRED_EMPLOYMENT_VALUES: readonly EmploymentOption[] = [
  'employed',
  'self_employed',
  'student',
  'unemployed',
];

function normalizeEmploymentFromApi(statuses: string[]): EmploymentOption[] {
  const allowed = new Set<string>(PREFERRED_EMPLOYMENT_VALUES);
  return statuses.filter((s): s is EmploymentOption => allowed.has(s));
}

function incomeFromOrder(order: number): IncomeOption {
  // Backend order:
  // eur_50k_plus: 4, eur_40k_50k: 3, eur_30k_40k: 2, eur_20k_30k: 1, prefer_not_to_say: 0
  if (order >= 4) return 'eur_50k_plus';
  if (order === 3) return 'eur_40k_50k';
  if (order === 2) return 'eur_30k_40k';
  if (order === 1) return 'eur_20k_30k';
  return 'eur_0k_20k';
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
    usePreferencesStore.getState().setDistanceMiles(0, highMiles);
  }

  if (typeof data.preferredEducationLevels === 'string') {
    usePreferencesStore
      .getState()
      .setPreferredEducation(normalizeEducationFromApi(data.preferredEducationLevels));
  } else if (typeof data.preferrededucationlevelrank === 'number') {
    usePreferencesStore.getState().setPreferredEducation(educationFromRank(data.preferrededucationlevelrank));
  }

  if (Array.isArray(data.preferredEmploymentStatuses)) {
    usePreferencesStore
      .getState()
      .setPreferredEmployment(normalizeEmploymentFromApi(data.preferredEmploymentStatuses));
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

  if (Array.isArray(data.preferredMaritalStatus)) {
    const normalized = (data.preferredMaritalStatus as string[]).filter(
      (m) => typeof m === 'string' && m.length > 0
    ) as MaritalStatusOption[];
    if (normalized.length > 0) {
      // Store as first value for backwards compatibility in store typings
      usePreferencesStore.getState().setPreferredMaritalStatus(
        normalized[0] as MaritalStatusOption
      );
    }
  } else if (
    typeof data.preferredMaritalStatus === 'string' &&
    data.preferredMaritalStatus.length > 0
  ) {
    usePreferencesStore
      .getState()
      .setPreferredMaritalStatus(data.preferredMaritalStatus as MaritalStatusOption);
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
    : 'any';
  const preferredEmploymentStatuses =
    state.preferredEmployment.length > 0 ? state.preferredEmployment : [];
  const preferredIncomeRanges = state.preferredIncome
    ? mapIncomeToApi(state.preferredIncome)
    : 'prefer_not_to_say';

  const minFtIn = cmToFeetInches(state.preferredMinHeightcm);
  const maxFtIn = cmToFeetInches(state.preferredMaxHeightcm);

  // preferredMaritalStatus may be a single value or an array (from multi-select screen).
  // Normalize to string[] for the API.
  const preferredMaritalStatusRaw = state.preferredMaritalStatus as
    | MaritalStatusOption
    | MaritalStatusOption[]
    | null;
  const preferredMaritalStatus = Array.isArray(preferredMaritalStatusRaw)
    ? preferredMaritalStatusRaw
    : preferredMaritalStatusRaw != null
      ? [preferredMaritalStatusRaw]
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
