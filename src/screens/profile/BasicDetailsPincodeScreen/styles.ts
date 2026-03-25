import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../../theme';

export const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.white,
  },
  backgroundGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '50%',
    height: 280,
  },
  middleGradient: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    height: 480,
  },
  safeArea: {
    flex: 1,
  },
  mainColumn: {
    flex: 1,
    minHeight: 0,
    justifyContent: 'space-between',
  },
  formSection: {
    flexShrink: 0,
    paddingHorizontal: spacing.lg,
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
    alignSelf: 'center',
    width: '100%',
    maxWidth: 343,
    marginBottom: spacing.sm,
  },
  inputWrapperWithError: {
    marginBottom: spacing.xl,
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
    flexShrink: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  button: {
    height: 56,
    borderRadius: 28,
  },
});
