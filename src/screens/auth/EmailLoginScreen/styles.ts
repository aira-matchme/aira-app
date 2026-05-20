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
  inputContainer: {
    marginBottom: 0,
    minHeight: 78, // Input 54 + error slot 24 — keeps Continue button position fixed
  },
  actionContainer: {
    width: '100%',
    marginTop: spacing.lg,
    gap: spacing.sm,
    alignItems: 'center',
  },
  /** Figma email login — full-width pill CTA (disabled + enabled) */
  continueButton: {
    width: '100%',
    alignSelf: 'stretch',
  },
  continueButtonTextDisabled: {
    color: colors.neutral[500],
  },
  lostAccessLink: {
    paddingVertical: spacing.xs,
  },
  lostAccessText: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: 0.28,
    color: colors.neutral[500],
    fontFamily: typography.fontFamily.regular,
    textAlign: 'center',
  },
});
