import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../../theme';

export const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.white,
  },
  backgroundGlow: {
    ...StyleSheet.absoluteFillObject,
  },
  safeArea: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  skipText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: colors.neutral[50],
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg * 1.5,
    paddingBottom: spacing.lg,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  stepBadge: {
    borderWidth: 0.5,
    borderColor: colors.neutral[800],
    borderRadius: 100,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 3,
  },
  stepBadgeText: {
    fontSize: 10,
    
    letterSpacing: 0.8,
    color: colors.black,
  },
  stepDotLarge: {
    width: 5,
    height: 5,
    borderRadius: 100,
    backgroundColor: colors.neutral[100],
    opacity: 0.8,
  },
  stepDotSmall: {
    width: 3,
    height: 3,
    borderRadius: 100,
    backgroundColor: colors.neutral[100],
    opacity: 0.8,
  },
  title: {
    fontSize: 28,
    
    color: colors.black,
    lineHeight: 36,
    marginBottom: spacing.lg,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pill: {
    flex: 1,
    height: 64,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: colors.neutral[50],
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  pillSelectedYes: {
    borderWidth: 2,
    borderColor: colors.primary.purple,
    backgroundColor: colors.primary[50],
  },
  pillSelectedNo: {
    borderWidth: 1,
    borderColor: colors.neutral[50],
    backgroundColor: colors.white,
  },
  pillText: {
    fontSize: 16,
    
    letterSpacing: 0.32,
    color: colors.black,
  },
  pillTextYesSelected: {
    color: colors.primary.purple,
  },
  bottomButtonContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    alignItems: 'flex-end',
  },
  circularButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  circularButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularButtonDisabled: {
    opacity: 0.5,
  },
});


