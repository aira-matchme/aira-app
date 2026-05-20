import { StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  titleContainer: {
    marginTop: 24,
    marginBottom: spacing.xl,
    gap: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '500' as const,
    lineHeight: 36,
    letterSpacing: 0,
    color: colors.text.dark,
    
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 22,
    letterSpacing: 0.32,
    color: colors.neutral[700],
    fontFamily: typography.fontFamily.regular,
  },
  formContainer: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  inputWrapper: {
    width: '100%',
  },
  buttonContainer: {
    marginTop: spacing.xl,
  },
  continueButton: {
    width: '100%',
    height: 54,
  },
  continueButtonDisabled: {
    width: '100%',
    height: 54,
    backgroundColor: colors.neutral[50],
    borderRadius: 100,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.2,
  },
  continueButtonTextDisabled: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 22,
    letterSpacing: 0.32,
    color: colors.neutral[500],
    
  },
});

