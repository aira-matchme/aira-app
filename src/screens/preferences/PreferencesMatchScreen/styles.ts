import { StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../../theme';

const HORIZONTAL_PADDING = 24;

export const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.white,
  },
  safeArea: {
    flex: 1,
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  headerContainer: {
    paddingTop: 16,
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  scrollContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 8,
    paddingBottom: spacing.lg,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral[900],
    lineHeight: 32,
    letterSpacing: 0,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[600],
    lineHeight: 20,
    letterSpacing: 0,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.white,
  },
  chipSelected: {
    borderColor: colors.primary.purple,
    backgroundColor: colors.white,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral[900],
  },
  chipTextSelected: {
    color: colors.primary.purple,
  },
  optionsSection: {
    marginBottom: 24,
  },
  sliderSection: {
    marginBottom: 24,
    minHeight: 340,
  },
  optionButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.white,
    marginBottom: 10,
  },
  optionButtonSelected: {
    borderColor: colors.primary.purple,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral[900],
  },
  optionTextSelected: {
    color: colors.primary.purple,
  },
  bottomContainer: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl * 1.5,
  },
  bottomButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 54,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral[900],
  },
  saveButton: {
    flex: 1,
    height: 54,
    minWidth: 0,
  },
});
