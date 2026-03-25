/**
 * Preferences module constants.
 * Match preference categories and options for "Fine-tune your matches" screen.
 */

export const PREFERENCE_CATEGORIES = [
  { key: 'gender', label: 'Gender' },
  { key: 'distance', label: 'Distance' },
  { key: 'education', label: 'Education' },
  { key: 'age', label: 'Age' },
  { key: 'height', label: 'Height' },
  { key: 'employment', label: 'Employment' },
  { key: 'income', label: 'Income' },
] as const;

export type PreferenceCategoryKey = (typeof PREFERENCE_CATEGORIES)[number]['key'];

export const GENDER_PREFERENCE_OPTIONS = [
  { key: 'man', label: 'Man' },
  { key: 'woman', label: 'Woman' },
  { key: 'non_binary', label: 'Non-binary' },
  { key: 'prefer_not_to_say', label: 'Prefer not to say' },
] as const;

// Age range: 18–80 years
export const AGE_MIN = 18;
export const AGE_MAX = 80;

// Height range: 140–220 cm
export const HEIGHT_MIN = 140;
export const HEIGHT_MAX = 220;

// Distance range: 0–100 miles (low end of preference slider)
export const DISTANCE_MIN = 0;
export const DISTANCE_MAX = 100;
