import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../../theme';

export const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.white,
  },
  safeArea: {
    flex: 1,
  },
  backgroundGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 320,
  },
  content: {
    flex: 1,
    minHeight: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm * 2,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  header: {
    marginBottom: spacing.md * 2,
  },
  title: {
    fontSize: 36,
    fontWeight: '500',
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral[900],
    lineHeight: 44,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[600],
    lineHeight: 22,
    letterSpacing: 0.32,
  },
  optionsScrollView: {
    flex: 1,
  },
  optionsScrollContainer: {
    paddingBottom: spacing.xl,
  },
  optionsContainer: {
    gap: spacing.sm,
  },
  option: {
    height: 64,
    borderRadius: 40,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  optionSelected: {
    borderWidth: 2,
    borderColor: colors.primary.purple,
  },
  optionText: {
    fontSize: 16,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral[900],
  },
  optionTextSelected: {
    color: colors.primary.purple,
  },
  buttonContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  button: {
    width: '100%',
    height: 54,
  },
});
