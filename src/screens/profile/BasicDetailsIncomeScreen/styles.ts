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
    height:680,
  },
  content: {
    flex: 1,
    minHeight: 0,
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
    paddingBottom: spacing.xl,
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
  },
  subtitlesecondary: {
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

