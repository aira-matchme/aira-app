import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme';

export const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.white,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontSize: 28,
    
    color: colors.black,
    lineHeight: 36,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[600],
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  featuresList: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featureDot: {
    fontSize: 14,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[600],
    lineHeight: 20,
    marginRight: spacing.xs,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[600],
    lineHeight: 20,
  },
  unavailableBlock: {
    marginBottom: spacing.md,
  },
  errorText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.regular,
    color: colors.semantic.error,
    textAlign: 'center',
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  hintText: {
    fontSize: 13,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[600],
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  retryButton: {
    alignSelf: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  retryText: {
    fontSize: 15,
    
    color: colors.primary[400],
  },
  planCard: {
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary[400],
    backgroundColor: colors.primary[50],
  },
  planCardDisabled: {
    opacity: 0.6,
  },
  planName: {
    fontSize: 18,
    
    color: colors.primary[600],
    textAlign: 'center',
  },
  planPrice: {
    fontSize: 32,
    
    color: colors.primary[400],
    marginTop: spacing.sm,
  },
  planPeriod: {
    fontSize: 13,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[600],
    marginTop: spacing.xs,
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  restoreText: {
    fontSize: 15,
    
    color: colors.primary[400],
  },
  legalText: {
    fontSize: 11,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[500],
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 16,
  },
  premiumEmoji: {
    fontSize: 56,
    marginBottom: spacing.md,
  },
  premiumTitle: {
    fontSize: 26,
    
    color: colors.primary[400],
    textAlign: 'center',
  },
  premiumSubtitle: {
    fontSize: 14,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[600],
    marginTop: spacing.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 14,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[600],
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
});
