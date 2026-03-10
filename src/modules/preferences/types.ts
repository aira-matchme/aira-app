export interface AddPreferencePayload {
  lookingForGender: string;
  preferredRadiusKm: number;
  preferredReligions: string[];
  preferredEducationLevels: string;
  preferredEmploymentStatuses: string[];
  preferredIncomeRanges: string;
  preferredMinAge: number;
  preferredMaxAge: number;
  preferredMinHeightFt: number;
  preferredMaxHeightFt: number;
  preferredMinHeightIn: number;
  preferredMaxHeightIn: number;
  preferredBodyTypes: string[];
  preferredMaritalStatus: string[];
  preferredChildren: string;
}
