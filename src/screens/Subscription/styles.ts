import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme';

export const styles = StyleSheet.create({
  // ── Root ───────────────────────────────────────────────────────────────────
  wrapper: {
    flex: 1,
    backgroundColor: '#22075F',
  },

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
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  upgradeToText: {
    fontSize: 16,
    fontFamily: typography.fontFamily.medium,
    color: colors.white,
    lineHeight: 22,
  },
  closeButton: {
    position: 'absolute',
    top: 24,
    right: 24,
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
    lineHeight: 16,
    letterSpacing: 0.32,
    marginTop: 16,
    maxWidth: 176,
  },

  // ── Feature list ───────────────────────────────────────────────────────────
  featuresList: {
    flex: 1,
    marginTop: 24,
    paddingHorizontal: 24,
    gap: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureIconContainer: {
    width: 38,
    height: 38,
    borderWidth: 1.2,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
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
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[300],
    lineHeight: 14,
    letterSpacing: 0.28,
  },

  // ── Sticky bottom section ──────────────────────────────────────────────────
  stickyBottomOuter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'visible',
  },
  bottomCard: {
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: 'hidden',
    paddingTop: 56,
    paddingLeft: 24,
    paddingRight: 24,
    alignItems: 'center',
    gap: 20,
  },
  // Price pill floats 32px above the card
  pricePillAnchor: {
    position: 'absolute',
    top: -32,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  pricePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 24,
    paddingRight: 24,
    paddingTop: 12,
    paddingBottom: 12,
    borderRadius: 100,
    backgroundColor: 'rgba(17,4,47,0.35)',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 35,
    shadowOpacity: 0.15,
    elevation: 8,
  },
  priceAmount: {
    fontSize: 36,
    fontFamily: typography.fontFamily.semibold,
    color: colors.white,
    lineHeight: 44,
  },
  pricePeriod: {
    fontSize: 20,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[200],
    lineHeight: 28,
    letterSpacing: -0.2,
  },
  ctaButton: {
    width: '100%',
    height: 54,
    backgroundColor: colors.white,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  ctaButtonDisabled: {
    opacity: 0.5,
  },
  ctaButtonText: {
    fontSize: 16,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary.purple,
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
  legalText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[200],
    textAlign: 'center',
    lineHeight: 18,
    letterSpacing: 0.48,
    maxWidth: 324,
  },
  errorText: {
    fontSize: 13,
    fontFamily: typography.fontFamily.regular,
    color: 'rgba(255,120,120,0.9)',
    textAlign: 'center',
    lineHeight: 18,
  },
});
