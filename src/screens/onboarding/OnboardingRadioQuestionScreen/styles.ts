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
  headerContainer: {
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 32,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg * 1.5,
    paddingBottom: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
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
    marginBottom: spacing.xl,
  },
  optionsContainer: {
    gap: spacing.sm,
  },
  option: {
    height: 64,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: colors.neutral[50],
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
  },
  optionSelected: {
    borderWidth: 2,
    borderColor: colors.primary.purple,
  },
  optionText: {
    fontSize: 16,
    fontFamily: typography.fontFamily.medium,
    letterSpacing: 0.32,
    color: colors.black,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
});


