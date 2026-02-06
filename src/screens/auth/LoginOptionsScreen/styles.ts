import { StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../../theme';

export const styles = StyleSheet.create({
  titleContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h2,
    color: colors.text.dark,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  titleGradient: {
    ...typography.h2,
    color: colors.primary.purple,
  },
  subtitle: {
    ...typography.body,
    color: colors.neutral[400],
    textAlign: 'center',
    letterSpacing: 0.32,
  },
  buttonsContainer: {
    gap: spacing.md,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[50],
    borderRadius: 100,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    height: 54,
    gap: spacing.sm,
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 16,
  },
  buttonText: {
    ...typography.button,
    color: colors.text.dark,
  },
});

