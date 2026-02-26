export interface EditPreferencePayload {
  lookingForGender: string;
  preferredRadiusKm: number;
  preferredReligions: string[];
  preferredEducationLevels: string;
  preferredEmploymentStatuses: string;
  preferredIncomeRanges: string;
  preferredMinAge: number;
  preferredMaxAge: number;
  preferredMinHeightcm: number;
  preferredMaxHeightcm: number;
  preferredBodyTypes: string[];
}
