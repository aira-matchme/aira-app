import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../../theme';

export const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.primary.purple,
  },
  backgroundGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  card: {
    flex: 1,
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
    fontFamily: typography.fontFamily.medium,
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
    fontFamily: typography.fontFamily.medium,
    color: colors.black,
    lineHeight: 36,
    marginBottom: spacing.sm,
  },
  helperText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[600],
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: spacing.sm,
    rowGap: spacing.sm,
    marginTop: spacing.md,
  },
  photoCard: {
    width: '48%',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.neutral[50],
    backgroundColor: colors.white,
    padding: spacing.xs,
  },
  photoCardSelected: {
    borderWidth: 2,
    borderColor: colors.primary.purple,
    backgroundColor: colors.primary[50],
  },
  photoImageWrapper: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    backgroundColor: colors.neutral[50],
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  optionText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.medium,
    letterSpacing: 0.28,
    color: colors.neutral[800],
  },
  optionTextSelected: {
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


