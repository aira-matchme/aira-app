/**
 * Clash Grotesk — AIRA / Figma typography
 * (see design file typography, e.g. https://www.figma.com/design/FzV81n1GwiDC68GJhKdPMv/AIRA?node-id=150-1283)
 *
 * `fontFamily` strings must match the **PostScript name** of each linked font on iOS
 * (Font Book → Get Info, or open the TTF in a font inspector). Android uses the
 * font file name by default when linked via `react-native.config.js` → `./src/assets/fonts`.
 *
 * Standard Fontshare / ITF Clash Grotesk static files use these names:
 *   ClashGrotesk-Regular | -Medium | -Semibold | -Bold
 * If your files use different internal names, update `clash` below to match.
 */
const clash = {
  regular: 'ClashGrotesk-Regular',
  medium: 'ClashGrotesk-Medium',
  semibold: 'ClashGrotesk-Semibold',
  bold: 'ClashGrotesk-Bold',
} as const;

export const typography = {
  /**
   * Headings — Figma: Heading 1–3, Clash Grotesk, letterSpacing 0.
   * Each level: Semibold (600) and Medium (500) use the matching **font file**, not synthetic bold.
   */
  /** Heading 1 / Semibold — 32 / 40 */
  h1: {
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: 0,
    fontFamily: clash.semibold,
  },
  /** Heading 1 / Medium — 32 / 40 */
  h1Medium: {
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: 0,
    fontFamily: clash.medium,
  },
  /** Heading 2 / Semibold — 28 / 36 */
  h2Semibold: {
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: 0,
    fontFamily: clash.semibold,
  },
  /** Heading 2 / Medium — 28 / 36 */
  h2: {
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: 0,
    fontFamily: clash.medium,
  },
  /** Heading 3 / Semibold — 24 / 32 */
  h3Semibold: {
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0,
    fontFamily: clash.semibold,
  },
  /** Heading 3 / Medium — 24 / 32 */
  h3: {
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0,
    fontFamily: clash.medium,
  },
  /** Screen titles / subheads (not in H1–H3 scale) */
  h4: {
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0,
    fontFamily: clash.medium,
  },

  body: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: clash.regular,
    letterSpacing: 0,
  },
  /** Body/Large/Medium — Figma 16 / 22 / tracking 2% → 0.32px */
  bodyMedium: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.32,
    fontFamily: clash.medium,
  },
  bodyLarge: {
    fontSize: 18,
    lineHeight: 26,
    fontFamily: clash.regular,
    letterSpacing: 0,
  },

  /** Buttons Text / Medium — Figma 16 / 22 / tracking 2% */
  button: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.32,
    fontFamily: clash.medium,
  },
  buttonLarge: {
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0.36,
    fontFamily: clash.medium,
  },

  small: {
    fontSize: 12,
    lineHeight: 14,
    letterSpacing: 0.48,
    fontFamily: clash.regular,
  },
  caption: {
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 0.4,
    fontFamily: clash.regular,
  },

  label: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.28,
    fontFamily: clash.medium,
  },

  /** Explicit faces for StyleSheets that set weight + family separately */
  fontFamily: {
    regular: clash.regular,
    medium: clash.medium,
    semibold: clash.semibold,
    bold: clash.bold,
  },
};
