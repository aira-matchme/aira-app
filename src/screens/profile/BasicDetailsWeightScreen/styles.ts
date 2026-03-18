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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
    top: '28%',
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
    marginBottom: spacing.sm * 2,
  },
  optionsScrollView: {
    flex: 1,

  },
  optionsScrollContainer: {
    paddingBottom: spacing.lg,
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
    paddingBottom: spacing.sm * 2,
  },
  optionsContainer: {
    gap: spacing.sm,
  },
  option: {
    height: 64,
    borderRadius: 40,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  optionSelected: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.primary.purple,
  },
  optionText: {
    fontSize: 16,
    fontFamily: typography.fontFamily.medium,
    color: colors.black,
  },
  optionTextSelected: {
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

