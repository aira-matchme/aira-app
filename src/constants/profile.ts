/**
 * Profile module constants.
 * Use these across onboarding, edit-profile, and other profile-related screens.
 */

import { STRINGS } from './strings';

// ─── Religion (edit profile API: christian, judaism, islam, hinduism, buddhism, sikhism, agnostic, other, no_religion) ───
export const RELIGION_API_VALUES = [
  'christian',
  'judaism',
  'islam',
  'hinduism',
  'buddhism',
  'sikhism',
  'agnostic',
  'other',
  'no_religion',
] as const;

export type ReligionApiValue = (typeof RELIGION_API_VALUES)[number];

export const RELIGION_OPTIONS: { key: ReligionApiValue; label: string }[] = [
  { key: 'christian', label: 'Christian' },
  { key: 'judaism', label: 'Judaism' },
  { key: 'islam', label: 'Islam' },
  { key: 'hinduism', label: 'Hinduism' },
  { key: 'buddhism', label: 'Buddhism' },
  { key: 'sikhism', label: 'Sikhism' },
  { key: 'agnostic', label: 'Agnostic' },
  { key: 'other', label: 'Other' },
  { key: 'no_religion', label: 'No Religion' },
];

// ─── Gender (edit profile API: male, female, other) ───
export const GENDERS = ['male', 'female', 'other'] as const;

export type GenderApiValue = (typeof GENDERS)[number];

export const GENDER_OPTIONS: { key: GenderApiValue; label: string }[] = [
  { key: 'male', label: STRINGS.PROFILE_SETUP.GENDER.OPTIONS.MAN },
  { key: 'female', label: STRINGS.PROFILE_SETUP.GENDER.OPTIONS.WOMAN },
  { key: 'other', label: STRINGS.PROFILE_SETUP.GENDER.OPTIONS.PREFER_NOT_TO_SAY },
];

// ─── Education (keys are backend values) ───
export const EDUCATION_OPTIONS: { key: string; label: string }[] = [
  { key: 'phd_dr', label: STRINGS.PROFILE_SETUP.EDUCATION.OPTIONS.PHD },
  { key: 'masters_or_equivalent', label: STRINGS.PROFILE_SETUP.EDUCATION.OPTIONS.MASTER },
  { key: 'degree_or_equivalent', label: STRINGS.PROFILE_SETUP.EDUCATION.OPTIONS.A_LEVEL },
  { key: 'gcse_or_equivalent', label: STRINGS.PROFILE_SETUP.EDUCATION.OPTIONS.GCSE },
  { key: 'other', label: STRINGS.PROFILE_SETUP.EDUCATION.OPTIONS.OTHER },
];

// ─── Employment (keys are backend values) ───
export const EMPLOYMENT_OPTIONS: { key: string; label: string }[] = [
  { key: 'employed', label: STRINGS.PROFILE_SETUP.EMPLOYMENT.OPTIONS.EMPLOYED },
  { key: 'self_employed', label: STRINGS.PROFILE_SETUP.EMPLOYMENT.OPTIONS.SELF_EMPLOYED },
  { key: 'student', label: STRINGS.PROFILE_SETUP.EMPLOYMENT.OPTIONS.STUDENT },
  { key: 'unemployed', label: STRINGS.PROFILE_SETUP.EMPLOYMENT.OPTIONS.NOT_WORKING },
  { key: 'prefer_not_to_say', label: STRINGS.PROFILE_SETUP.EMPLOYMENT.OPTIONS.PREFER_NOT_TO_SAY },
];

// ─── Income (keys are backend values) ───
export const INCOME_OPTIONS: { key: string; label: string }[] = [
  { key: 'eur_20k_30k', label: STRINGS.PROFILE_SETUP.FINAL.OPTIONS.BETWEEN_20000_AND_30000 },
  { key: 'eur_30k_40k', label: STRINGS.PROFILE_SETUP.FINAL.OPTIONS.BETWEEN_30000_AND_40000 },
  { key: 'eur_40k_50k', label: STRINGS.PROFILE_SETUP.FINAL.OPTIONS.BETWEEN_40000_AND_50000 },
  { key: 'eur_50k_plus', label: STRINGS.PROFILE_SETUP.FINAL.OPTIONS.OVER_50000 },
  { key: 'prefer_not_to_say', label: STRINGS.PROFILE_SETUP.EMPLOYMENT.OPTIONS.PREFER_NOT_TO_SAY },
];

// ─── DOB picker ───
export const DOB_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export const DOB_DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

export const DOB_YEARS = Array.from(
  { length: 100 },
  (_, i) => new Date().getFullYear() - 18 - i
);

// ─── Pincode / Postcode ───
export const UK_POSTCODE_REGEX = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;
