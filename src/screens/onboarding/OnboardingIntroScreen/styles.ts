import { StyleSheet } from 'react-native';
import { colors, typography } from '../../../theme';

/** Figma Personalise v2 — node 3312:15595 (375×812 reference). */
export const FIGMA_ONBOARDING_INTRO = {
  FRAME_H: 812,
  CONTENT_W: 343,
  TITLE_MAX_W: 263,
  PRIVACY_MAX_W: 231,
  H_INSET: 16,
  GAP_TITLE_TO_BODY: 12,
  GAP_DESC_TO_TIME: 8,
  /** Space between primary CTA and privacy line */
  GAP_BUTTON_TO_PRIVACY: 16,
  /** Padding under footer copy (Figma ~42pt above home indicator) */
  FOOTER_PADDING_BOTTOM: 42,
  /** Hero illustration — ~42% of frame on 812pt */
  IMAGE_HEIGHT_RATIO: 0.42,
  IMAGE_MAX_H: 380,
  IMAGE_MIN_H: 260,
  /** Breathing room between hero and headline */
  GAP_IMAGE_TO_COPY: 16,
} as const;

export const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  imageSection: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  gradientSvg: {
    ...StyleSheet.absoluteFillObject,
  },
  onboardingImage: {
    width: '92%',
    height: '92%',
    zIndex: 2,
  },
  /**
   * Fills remaining space; headline stays under hero, CTA + privacy pinned to bottom
   * (matches Figma: copy mid-lower, button bottom ~92, privacy ~42).
   */
  contentSection: {
    flex: 1,
    paddingHorizontal: FIGMA_ONBOARDING_INTRO.H_INSET,
    justifyContent: 'space-between',
  },
  copyWrap: {
    width: '100%',
    alignItems: 'center',
    paddingTop: FIGMA_ONBOARDING_INTRO.GAP_IMAGE_TO_COPY,
  },
  /** Centered column — max 343 */
  content: {
    width: '100%',
    maxWidth: FIGMA_ONBOARDING_INTRO.CONTENT_W,
    alignItems: 'center',
    gap: FIGMA_ONBOARDING_INTRO.GAP_TITLE_TO_BODY,
  },
  title: {
    ...typography.h2,
    color: colors.black,
    textAlign: 'center',
    maxWidth: FIGMA_ONBOARDING_INTRO.TITLE_MAX_W,
  },
  descriptionContainer: {
    width: '100%',
    gap: FIGMA_ONBOARDING_INTRO.GAP_DESC_TO_TIME,
    alignItems: 'center',
  },
  description: {
    fontSize: 14,
    fontFamily: typography.fontFamily.regular,
    fontWeight: '400',
    color: colors.neutral[700],
    lineHeight: 20,
    letterSpacing: 0.28,
    textAlign: 'center',
    width: '100%',
  },
  timeEstimate: {
    fontSize: 14,
    fontFamily: typography.fontFamily.regular,
    fontWeight: '400',
    color: colors.neutral[700],
    lineHeight: 20,
    letterSpacing: 0.28,
    textAlign: 'center',
    width: '100%',
  },
  footerStack: {
    width: '100%',
    maxWidth: FIGMA_ONBOARDING_INTRO.CONTENT_W,
    alignSelf: 'center',
    alignItems: 'center',
    gap: FIGMA_ONBOARDING_INTRO.GAP_BUTTON_TO_PRIVACY,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    width: '100%',
    height: 54,
    borderRadius: 100,
  },
  privacyNote: {
    fontSize: 12,
    fontFamily: typography.fontFamily.regular,
    fontWeight: '400',
    color: colors.neutral[700],
    textAlign: 'center',
    lineHeight: 18,
    letterSpacing: 0.48,
    maxWidth: FIGMA_ONBOARDING_INTRO.PRIVACY_MAX_W,
    paddingHorizontal: 8,
  },
});
