import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../../theme';

export const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  backgroundGlow: {
    position: 'absolute',
    top: '32%',
    width: '100%',
    height: 320,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    // Align title vertically with other profile screens
    // paddingTop: spacing.sm 
  },
  title: {
    fontSize: 34,
    fontWeight: '400',
    fontFamily: typography.fontFamily.regular,
    lineHeight: 42,
    color: colors.black,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[500],
    lineHeight: 22,
  },
  inputWrapper: {
    marginTop: spacing.xl * 2,
    marginBottom: spacing.lg, // add space below input + error to avoid overlap with button
    alignSelf: 'center',
    width: '100%',
    maxWidth: 343,
  },
  inputGradient: {
    padding: 1,
    borderRadius: 26,
  },
  input: {
    height: 52,
    paddingHorizontal: 20,
    fontSize: 16,
    borderRadius: 26,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  buttonContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    // paddingBottom: spacing.sm * 1.5,
  },
  button: {
    height: 56,
    borderRadius: 28,
  },
});

