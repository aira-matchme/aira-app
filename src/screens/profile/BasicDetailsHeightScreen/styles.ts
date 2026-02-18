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
    width: '50%',
    height: 280,
  },
  middleGradient: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    height:480,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm * 2,
  },
  header: {
    marginBottom: spacing.xl * 2,
  },
  title: {
    fontSize: 36,
    fontWeight: '500',
    fontFamily: typography.fontFamily.medium,
    color: colors.black,
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
  inputWrapper: {
    width: '100%',
    maxWidth: 343,
    alignSelf: 'center',
  },
  inputContainer: {
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.white,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  input: {
    height: 52,
    paddingHorizontal: 20,
    paddingRight: 96,
    fontSize: 16,
    color: colors.black,
  },
  unitToggle: {
    position: 'absolute',
    right: 6,
    top: 6,
    bottom: 6,
    flexDirection: 'row',
    backgroundColor: colors.neutral[50],
    borderRadius: 100,
    padding: 2,
  },
  unitButton: {
    paddingHorizontal: 12,
    borderRadius: 100,
    justifyContent: 'center',
  },
  unitButtonActive: {
    backgroundColor: colors.white,
  },
  unitText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[500],
  },
  unitTextActive: {
    fontFamily: typography.fontFamily.medium,
    color: colors.black,
  },
  buttonContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl * 1.5,
  },
  button: {
    width: '100%',
    height: 54,
  },
});

