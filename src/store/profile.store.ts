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
  
  // Step 3: Weight
  weight: {
    value: number | null;
    unit: 'kg' | 'lbs';
  } | null;
  
  // Step 4: Height
  height: {
    value: number | null;
    unit: 'cm' | 'ft';
  } | null;
  
  // Step 5: Education
  education: string | null;
  
  // Step 6: Employment / Work status
  employment: string | null;
  
  // Step 7: Final preference choice (income range)
  finalChoice: string | null;

  // Step 8: Religion
  religion: string | null;
}

interface ProfileState extends ProfileSetupData {
  currentStep: number;
  totalSteps: number;
  
  // Actions
  setName: (name: string) => void;
  setDateOfBirth: (day: number, month: number, year: number) => void;
  setWeight: (value: number, unit: 'kg' | 'lbs') => void;
  setHeight: (value: number, unit: 'cm' | 'ft') => void;
  setEducation: (education: string) => void;
  setEmployment: (employment: string) => void;
  setFinalChoice: (finalChoice: string) => void;
  setReligion: (religion: string) => void;
  setCurrentStep: (step: number) => void;
  resetProfile: () => void;
  isStepComplete: (step: number) => boolean;
}

const initialState: ProfileSetupData = {
  name: null,
  dateOfBirth: null,
  weight: null,
  height: null,
  education: null,
  employment: null,
  finalChoice: null,
   religion: null,
};

export const useProfileStore = create<ProfileState>((set, get) => ({
  ...initialState,
  currentStep: 1,
  totalSteps: 9,

  setName: (name) => set({ name }),
  
  setDateOfBirth: (day, month, year) =>
    set({ dateOfBirth: { day, month, year } }),
  
  setWeight: (value, unit) =>
    set({ weight: { value, unit } }),
  
  setHeight: (value, unit) =>
    set({ height: { value, unit } }),
  
  setEducation: (education) => set({ education }),
  
  setEmployment: (employment) => set({ employment }),

  setFinalChoice: (finalChoice) => set({ finalChoice }),
  
  setReligion: (religion) => set({ religion }),
  
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
        return !!state.weight?.value && state.weight.value > 0;
      case 4:
        return !!state.height?.value && state.height.value > 0;
      case 5:
        return !!state.education;
      case 6:
        return !!state.employment;
      case 7:
        return !!state.finalChoice;
      case 8:
        return !!state.religion;
      default:
        return false;
    }
  },
}));

