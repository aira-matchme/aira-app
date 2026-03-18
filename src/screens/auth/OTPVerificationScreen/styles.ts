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
    gap: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: '500' as const,
    lineHeight: 36,
    letterSpacing: 0,
    color: colors.text.dark,
    fontFamily: typography.fontFamily.medium,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 22,
    letterSpacing: 0.32,
    color: colors.neutral[700],
    fontFamily: typography.fontFamily.regular,
    marginTop: spacing.sm,
  },
  inputContainer: {
    marginBottom: spacing.lg,
    minHeight: 78, // Input 54 + error slot 24 — keeps Verify button position fixed
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  resendText: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: 0.28,
    color: colors.neutral[700],
    fontFamily: typography.fontFamily.regular,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
    letterSpacing: 0.28,
    color: colors.neutral[900],
    fontFamily: typography.fontFamily.medium,
  },
  resendButton: {
    paddingVertical: spacing.xs,
  },
  resendButtonText: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: 0.28,
    color: colors.primary.purple,
    fontFamily: typography.fontFamily.regular,
  },
  buttonContainer: {
    marginTop: spacing.lg,
  },
  verifyButton: {
    width: '100%',
    height: 54,
  },
});

