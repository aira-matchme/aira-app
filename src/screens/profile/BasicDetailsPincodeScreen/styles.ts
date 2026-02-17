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
    top: '25%',
    width: '100%',
    height: 220,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    // Align title vertically with other profile screens
    // paddingTop: spacing.sm * 2,
  },
  header: {
    marginBottom: spacing.xl * 2,
  },
  title: {
    fontSize: 36,
    fontFamily: typography.fontFamily.medium,
    color: colors.black,
    lineHeight: 44,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[600],
    lineHeight: 22,
    letterSpacing: 0.32,
  },
  inputWrapper: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 343,
  },
  input: {
    height: 54,
    paddingHorizontal: 20,
    fontSize: 16,
    borderRadius: 100,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.neutral[100],
  },
  buttonContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical:spacing.md,
    // paddingTop: spacing.md,
    // paddingBottom: spacing.sm * 1.5,
  },
  button: {
    width: '100%',
    height: 54,
    borderRadius: 100,
  },
});

