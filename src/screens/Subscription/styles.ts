import { Dimensions, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme';

// Scale vertical spacing proportionally to screen height.
// Design baseline is 812 px (iPhone X / 11). Clamped to ±25 % of the
// design value so nothing looks extreme on very tall or very short screens.
const { height: SCREEN_H } = Dimensions.get('window');
const vs = (size: number) =>
  Math.round(Math.max(size * 0.75, Math.min(size * 1.25, (SCREEN_H / 812) * size)));

export const styles = StyleSheet.create({
  // ── Root ───────────────────────────────────────────────────────────────────
  wrapper: {
    flex: 1,
    backgroundColor: '#22075F', // Violet/800 — exact Figma bg
  },

  // Exact Figma gradient background SVG (Gradient BG.svg)
  bgSvg: {
    ...StyleSheet.absoluteFillObject,
  },

  // ── Shared states ──────────────────────────────────────────────────────────
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 14,
    fontFamily: typography.fontFamily.medium,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 20,
  },
  premiumEmoji: {
    fontSize: 56,
    marginBottom: spacing.md,
  },
  premiumTitle: {
    fontSize: 26,
    fontFamily: typography.fontFamily.semibold,
    color: colors.white,
    textAlign: 'center',
  },
  premiumSubtitle: {
    fontSize: 14,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral[200],
    marginTop: spacing.sm,
    textAlign: 'center',
    lineHeight: 20,
  },

  // ── Layout ─────────────────────────────────────────────────────────────────
  safeArea: {
    flex: 1,
  },

  // ── Header ─────────────────────────────────────────────────────────────────
  header: {
    paddingHorizontal: 16,
    paddingTop: spacing.md,
  },
  upgradeToText: {
    fontSize: 16,
    fontFamily: typography.fontFamily.medium,
    color: colors.white,
    lineHeight: 22,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: 16,
    zIndex: 10,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  plusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.white,
    paddingLeft: 10,
    paddingRight: 2,
    paddingVertical: 2,
    borderRadius: 100,
  },
  plusText: {
    fontSize: 16,
    fontFamily: typography.fontFamily.semibold,
    lineHeight: 22,
    letterSpacing: -0.32,
  },
  plusTextHidden: {
    opacity: 0,
  },
  subtitleText: {
    fontSize: 16,
    fontFamily: typography.fontFamily.medium,
    color: colors.white,
    lineHeight: 22,
    letterSpacing: 0.32,
    marginTop: 20,
    maxWidth: 210,
  },

  // ── Feature card ───────────────────────────────────────────────────────────
  featureCardWrapper: {
    flex: 1,
    marginTop: vs(20),
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  featureCard: {
    flex: 1,
    paddingVertical: vs(32),
    paddingHorizontal: 24,
    gap: vs(20),
    justifyContent: 'center',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  featureIconContainer: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  featureTextContainer: {
    flex: 1,
    gap: 6,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: typography.fontFamily.semibold,
    color: colors.white,
    lineHeight: 22,
    letterSpacing: 0.32,
  },
  featureDescription: {
    fontSize: 14,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral[200],
    lineHeight: 20,
    letterSpacing: 0.28,
  },

  // ── Bottom section ─────────────────────────────────────────────────────────
  bottomSection: {
    paddingHorizontal: 16,
    paddingBottom: spacing.md,
    alignItems: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 5,
    marginTop: 12,
    marginBottom: 16,
  },
  priceAmount: {
    fontSize: 36,
    fontFamily: typography.fontFamily.semibold,
    color: colors.white,
    lineHeight: 44,
  },
  pricePeriod: {
    fontSize: 24,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral[200],
    lineHeight: 32,
    letterSpacing: -0.24,
    marginBottom: 4,
  },
  ctaButton: {
    width: '100%',
    height: 54,
    backgroundColor: colors.white,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaButtonDisabled: {
    opacity: 0.5,
  },
  ctaButtonText: {
    fontSize: 16,
    fontFamily: typography.fontFamily.medium,
    color: colors.black,
    letterSpacing: 0.32,
    lineHeight: 22,
  },
  retryButton: {
    marginTop: 8,
    paddingVertical: 4,
  },
  retryText: {
    fontSize: 13,
    fontFamily: typography.fontFamily.medium,
    color: 'rgba(255,255,255,0.5)',
  },
  restoreText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.medium,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 10,
  },
  legalText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[200],
    textAlign: 'center',
    lineHeight: 18,
    letterSpacing: 0.48,
    marginTop: 10,
    maxWidth: 324,
  },
  errorText: {
    fontSize: 13,
    fontFamily: typography.fontFamily.regular,
    color: 'rgba(255,120,120,0.9)',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
});
