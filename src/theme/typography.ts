// Font family name - replace with your actual font name after linking
// Common names: 'ClashGrotesk-Regular', 'ClashGrotesk-Medium', etc.
// To find your font name: Check the font file name or use Font Book on Mac
const FONT_FAMILY = 'ClashGrotesk-Regular'; // Update this after adding your font file

export const typography = {
  // Heading styles - Based on Figma design
  h1: {
    fontSize: 32,
    fontWeight: '600' as const,
    lineHeight: 40,
    fontFamily: FONT_FAMILY,
    letterSpacing: 0,
  },
  h2: {
    fontSize: 28,
    fontWeight: '500' as const,
    lineHeight: 36,
    letterSpacing: 0,
    fontFamily: FONT_FAMILY,
  },
  h3: {
    fontSize: 24,
    fontWeight: '500' as const,
    lineHeight: 32,
    fontFamily: FONT_FAMILY,
    letterSpacing: 0,
  },
  h4: {
    fontSize: 20,
    fontWeight: '500' as const,
    lineHeight: 28,
    fontFamily: FONT_FAMILY,
    letterSpacing: 0,
  },
  
  // Body styles
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    fontFamily: FONT_FAMILY,
    letterSpacing: 0,
  },
  bodyMedium: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 22,
    letterSpacing: 0.32,
    fontFamily: FONT_FAMILY,
  },
  bodyLarge: {
    fontSize: 18,
    fontWeight: '400' as const,
    lineHeight: 26,
    fontFamily: FONT_FAMILY,
    letterSpacing: 0,
  },
  
  // Button text
  button: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 22,
    letterSpacing: 0.32,
    fontFamily: FONT_FAMILY,
  },
  buttonLarge: {
    fontSize: 18,
    fontWeight: '500' as const,
    lineHeight: 24,
    letterSpacing: 0.36,
    fontFamily: FONT_FAMILY,
  },
  
  // Small text
  small: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 14,
    letterSpacing: 0.48,
    fontFamily: FONT_FAMILY,
  },
  caption: {
    fontSize: 10,
    fontWeight: '400' as const,
    lineHeight: 12,
    letterSpacing: 0.4,
    fontFamily: FONT_FAMILY,
  },
  
  // Label styles
  label: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
    letterSpacing: 0.28,
    fontFamily: FONT_FAMILY,
  },
  
  // Font families helper (for when you have multiple font weights)
  fontFamily: {
    regular: FONT_FAMILY,
    medium: FONT_FAMILY, // Use same font, React Native will apply fontWeight
    semibold: FONT_FAMILY,
    bold: FONT_FAMILY,
  },
};

