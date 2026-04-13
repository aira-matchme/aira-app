export const colors = {
  // Primary Violet palette from Figma design system
  primary: {
    50: '#F1ECFE',   // Violet / 50 - Very light violet
    100: '#DDD0FB',  // Violet / 100
    200: '#BBA0F8',  // Violet / 200
    300: '#9971F4',  // Violet / 300
    400: '#7742F0',  // Violet / 400 (P) - Primary violet
    500: '#5513EC',  // Violet / 500
    600: '#440FBD',  // Violet / 600
    700: '#330B8E',  // Violet / 700
    800: '#22075F',  // Violet / 800
    900: '#11042F',  // Violet / 900 - Very dark violet
    // Convenience aliases
    purple: '#7742F0',      // Alias for 400 (primary)
    purpleLight: '#CB7BF5', // From secondary.lavender.300 for gradients
    purpleDark: '#5513EC',  // Alias for 500
  },
  
  // Secondary / Lavender colors from Figma design system
  secondary: {
    50: '#F8ECFE',   // Lavender / 50 - Very light pastel lavender
    100: '#F0D9FC',  // Lavender / 100
    200: '#DDAAF9',  // Lavender / 200
    300: '#CB7BF5',  // Lavender / 300 (P) - Primary lavender (matches purpleLight)
    400: '#B84BF1',  // Lavender / 400
    500: '#A51BEE',  // Lavender / 500
    600: '#880FC7',  // Lavender / 600
    700: '#670B98',  // Lavender / 700
    800: '#470868',  // Lavender / 800
    900: '#20042F',  // Lavender / 900 - Very dark purple
    // Convenience aliases
    lavender: '#CB7BF5',      // Alias for 300 (primary)
    lavenderLight: '#F8ECFE', // Alias for 50
    lavenderDark: '#670B98',  // Alias for 700
  },
  
  // Neutral Gray palette from Figma design system
  neutral: {
    50: '#F2F2F2',   // Gray / 50 - Very light gray
    100: '#E6E6E6',  // Gray / 100
    200: '#CCCCCC',  // Gray / 200
    300: '#B3B3B3',  // Gray / 300
    400: '#999999',  // Gray / 400
    500: '#8C8C8C',  // Gray / 500
    600: '#737373',  // Gray / 600
    700: '#595959',  // Gray / 700
    800: '#404040',  // Gray / 800
    900: '#1A1A1A',  // Gray / 900 - Very dark gray
  },
  
  // Base colors
  white: '#FFFFFF',
  black: '#000000',
  
  // Text colors
  text: {
    primary: '#FFFFFF', // White text on dark backgrounds
    secondary: 'rgba(255, 255, 255, 0.7)', // 70% opacity white
    dark: '#000000', // Black text on light backgrounds
    muted: '#737373', // neutral.600
    disabled: '#B3B3B3', // neutral.300
  },
  
  // Background colors
  background: {
    base: '#FFFFFF',
    light: '#F2F2F2', // neutral.50
    dark: '#000000',
    darkOverlay: 'rgba(0, 0, 0, 0.7)',
    subtle: '#F9FAFB', // From Figma variable
  },
  
  // Border colors
  border: {
    /** Primary CTA — Figma: 2px inner stroke, white @ 20% */
    primaryButton: 'rgba(255, 255, 255, 0.2)',
    white: 'rgba(255, 255, 255, 0.1)',
    light: '#E6E6E6', // neutral.100
    default: '#CCCCCC', // neutral.200
    medium: '#B3B3B3', // neutral.300
    dark: '#999999', // neutral.400
  },
  
  // Figma Primary Gradient - from Color style details
  // Use for primary gradient backgrounds (e.g. Personalise, profile screens)
  gradients: {
    primary: {
      colors: ['#CB7BF5', '#7742F0'] as const,
      start: { x: 0, y: 0 } as const,
      end: { x: 1, y: 0 } as const,
    },
    /** Primary pill / Button — approximates Figma inner shadow (white 60%, blur 20) */
    primaryButtonSheen: {
      colors: [
        'rgba(255, 255, 255, 0.36)',
        'rgba(255, 255, 255, 0)',
        'rgba(255, 255, 255, 0)',
        'rgba(255, 255, 255, 0.16)',
      ] as const,
      locations: [0, 0.22, 0.78, 1] as const,
      start: { x: 0.5, y: 0 } as const,
      end: { x: 0.5, y: 1 } as const,
    },
    // Light gradient for Onboarding Intro and similar screens
    onboardingIntro: {
      colors: ['#DDD2FE', '#ffffff'] as const,
      start: { x: 0.5, y: 0 } as const,
      end: { x: 0.5, y: 1 } as const,
    },
    
  },

  // Status / Semantic colors (aligned with Figma)
  semantic: {
    success: '#009900', // #090 in 6-digit hex - success green from Figma
    error: '#E50000', // red(alert) from Figma
    warning: '#FF9800',
    info: '#2196F3',
  },
};

