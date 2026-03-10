import { create } from 'zustand';

export interface ProfileSetupData {
  // Step 1: Name
  name: string | null;
  
  // Step 2: Date of Birth
  dateOfBirth: {
    day: number | null;
    month: number | null;
    year: number | null;
  } | null;
  
  // Step 3: Gender
  gender: string | null;

  // Step 4: Body type (single: e.g. endomorph)
  bodyType: string | null;
  
  // Step 5: Height
  height: {
    feet: number | null;
    inches: number | null;
  } | null;
  
  // Step 5: Education
  education: string | null;
  
  // Step 6: Employment / Work status
  employment: string | null;
  
  // Step 7: Final preference choice (income range)
  finalChoice: string | null;

  // Step 8: Religion
  religion: string | null;

  // Step 9: Marital status
  maritalStatus: string | null;

  // Step 10: Children
  children: string | null;

  // Step 11: Interests
  interests: string[] | null;
}

interface ProfileState extends ProfileSetupData {
  currentStep: number;
  totalSteps: number;
  
  // Actions
  setName: (name: string) => void;
  setDateOfBirth: (day: number, month: number, year: number) => void;
  setGender: (gender: string) => void;
  setBodyType: (bodyType: string) => void;
  setHeight: (feet: number, inches: number) => void;
  setEducation: (education: string) => void;
  setEmployment: (employment: string) => void;
  setFinalChoice: (finalChoice: string) => void;
  setReligion: (religion: string) => void;
  setMaritalStatus: (maritalStatus: string) => void;
  setChildren: (children: string) => void;
  setInterests: (interests: string[]) => void;
  setCurrentStep: (step: number) => void;
  resetProfile: () => void;
  isStepComplete: (step: number) => boolean;
}

const initialState: ProfileSetupData = {
  name: null,
  dateOfBirth: null,
  gender: null,
  bodyType: null,
  height: null,
  education: null,
  employment: null,
  finalChoice: null,
   religion: null,
  maritalStatus: null,
  children: null,
  interests: null,
};

export const useProfileStore = create<ProfileState>((set, get) => ({
  ...initialState,
  currentStep: 1,
  totalSteps: 13,

  setName: (name) => set({ name }),
  
  setDateOfBirth: (day, month, year) =>
    set({ dateOfBirth: { day, month, year } }),
  
  setGender: (gender) => set({ gender }),
  setBodyType: (bodyType) => set({ bodyType }),
  setHeight: (feet, inches) =>
    set({ height: { feet, inches } }),
  
  setEducation: (education) => set({ education }),
  
  setEmployment: (employment) => set({ employment }),

  setFinalChoice: (finalChoice) => set({ finalChoice }),
  
  setReligion: (religion) => set({ religion }),
  setMaritalStatus: (maritalStatus) => set({ maritalStatus }),
  setChildren: (children) => set({ children }),
  setInterests: (interests) => set({ interests }),

  setCurrentStep: (step) => set({ currentStep: step }),
  
  resetProfile: () => set({ ...initialState, currentStep: 1 }),
  
  isStepComplete: (step) => {
    const state = get();
    switch (step) {
      case 1:
        return !!state.name && state.name.trim().length > 0;
      case 2:
        return !!(
          state.dateOfBirth?.day &&
          state.dateOfBirth?.month &&
          state.dateOfBirth?.year
        );
      case 3:
        return !!state.gender && state.gender.trim().length > 0;
      case 4:
        return !!state.bodyType && state.bodyType.trim().length > 0;
      case 5:
        return !!(state.height?.feet != null && state.height?.inches != null);
      case 6:
        return !!state.education;
      case 7:
        return !!state.employment;
      case 8:
        return !!state.finalChoice;
      case 9:
        return !!state.religion;
      case 10:
        return !!state.maritalStatus;
      case 11:
        return !!state.children;
      case 12:
        return !!state.interests && state.interests.length > 0;
      default:
        return false;
    }
  },
}));

