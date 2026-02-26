import { create } from 'zustand';

export type GenderOption = 'man' | 'woman';
// These keys MUST match backend enums (same as `src/constants/profile.ts`)
export type EducationOption =
  | 'phd_dr'
  | 'masters_or_equivalent'
  | 'degree_or_equivalent'
  | 'gcse_or_equivalent'
  | 'other';
export type EmploymentOption =
  | 'employed'
  | 'self_employed'
  | 'student'
  | 'unemployed'
  | 'prefer_not_to_say';
export type IncomeOption =
  | 'eur_20k_30k'
  | 'eur_30k_40k'
  | 'eur_40k_50k'
  | 'eur_50k_plus'
  | 'prefer_not_to_say';
export type MaritalStatusOption =
  | 'never_married'
  | 'divorced'
  | 'widowed'
  | 'separated';

export interface PreferencesState {
  lookingForGender: GenderOption[];
  preferredMinAge: number;
  preferredMaxAge: number;
  preferredMinHeightcm: number;
  preferredMaxHeightcm: number;
  distanceMilesLow: number;
  distanceMilesHigh: number;
  preferredEducation: EducationOption | null;
  preferredEmployment: EmploymentOption[];
  preferredIncome: IncomeOption | null;
  preferredMaritalStatus: MaritalStatusOption | null;
  preferredReligions: string[];
  preferredBodyTypes: string[];
  setLookingForGender: (value: GenderOption[]) => void;
  setAgeRange: (min: number, max: number) => void;
  setHeightRange: (min: number, max: number) => void;
  setDistanceMiles: (low: number, high: number) => void;
  setPreferredEducation: (value: EducationOption | null) => void;
  setPreferredEmployment: (value: EmploymentOption[]) => void;
  setPreferredIncome: (value: IncomeOption | null) => void;
  setPreferredMaritalStatus: (value: MaritalStatusOption | null) => void;
  setPreferredReligions: (value: string[]) => void;
  setPreferredBodyTypes: (value: string[]) => void;
  reset: () => void;
  /** When true, the current preference edit screen was opened from PreferencesSummary; save should goBack() instead of navigating to next screen */
  openedEditFromSummary: boolean;
  setOpenedEditFromSummary: (value: boolean) => void;
}

const defaultState = {
  lookingForGender: [] as GenderOption[],
  preferredMinAge: 18,
  preferredMaxAge: 30,
  preferredMinHeightcm: 155,
  preferredMaxHeightcm: 170,
  distanceMilesLow: 10,
  distanceMilesHigh: 20,
  preferredEducation: null as EducationOption | null,
  preferredEmployment: [] as EmploymentOption[],
  preferredIncome: null as IncomeOption | null,
  preferredMaritalStatus: null as MaritalStatusOption | null,
  preferredReligions: [] as string[],
  preferredBodyTypes: [] as string[],
  openedEditFromSummary: false,
};

export const usePreferencesStore = create<PreferencesState>((set) => ({
  ...defaultState,
  setLookingForGender: (lookingForGender) => set({ lookingForGender }),
  setAgeRange: (preferredMinAge, preferredMaxAge) =>
    set({ preferredMinAge, preferredMaxAge }),
  setHeightRange: (preferredMinHeightcm, preferredMaxHeightcm) =>
    set({ preferredMinHeightcm, preferredMaxHeightcm }),
  setDistanceMiles: (distanceMilesLow, distanceMilesHigh) =>
    set({ distanceMilesLow, distanceMilesHigh }),
  setPreferredEducation: (preferredEducation) => set({ preferredEducation }),
  setPreferredEmployment: (preferredEmployment) => set({ preferredEmployment }),
  setPreferredIncome: (preferredIncome) => set({ preferredIncome }),
  setPreferredMaritalStatus: (preferredMaritalStatus) =>
    set({ preferredMaritalStatus }),
  setPreferredReligions: (preferredReligions) => set({ preferredReligions }),
  setPreferredBodyTypes: (preferredBodyTypes) => set({ preferredBodyTypes }),
  reset: () => set(defaultState),
  setOpenedEditFromSummary: (openedEditFromSummary) => set({ openedEditFromSummary }),
}));
