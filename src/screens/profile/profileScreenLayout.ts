import type { Edge } from 'react-native-safe-area-context';

/** Profile onboarding/edit screens: keep primary CTAs above the home indicator on all devices. */
export const PROFILE_SCREEN_EDGES: readonly Edge[] = [
  'top',
  'left',
  'right',
  'bottom',
];
