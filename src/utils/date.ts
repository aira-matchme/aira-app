export interface DateParts {
  day: number;
  month: number; // 1-12
  year: number;
}

/** Returns the date (day, month, year) for someone who is exactly `minAgeYears` years old today. */
export const getDobForMinimumAge = (minAgeYears: number, referenceDate = new Date()): DateParts => {
  const year = referenceDate.getFullYear() - minAgeYears;
  const month = referenceDate.getMonth() + 1; // JS months are 0-based
  const day = referenceDate.getDate();

  return { day, month, year };
};

/** Checks if the given DOB is at least `minAgeYears` years before `referenceDate`. */
export const isAtLeastAge = (
  dob: DateParts,
  minAgeYears: number,
  referenceDate = new Date()
): boolean => {
  const birthDate = new Date(dob.year, dob.month - 1, dob.day);

  if (Number.isNaN(birthDate.getTime())) {
    return false;
  }

  let age = referenceDate.getFullYear() - birthDate.getFullYear();
  const m = referenceDate.getMonth() - birthDate.getMonth();

  if (m < 0 || (m === 0 && referenceDate.getDate() < birthDate.getDate())) {
    age--;
  }

  return age >= minAgeYears;
};


