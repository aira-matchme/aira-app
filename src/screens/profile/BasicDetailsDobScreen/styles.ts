import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../../theme';

const PICKER_ITEM_HEIGHT = 52;

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
    height: 480,
  },
  content: {
    flex: 1,
    minHeight: 0,
    paddingHorizontal: spacing.lg,
    // Align title vertically with other profile screens
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
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[600],
    lineHeight: 22,
    letterSpacing: 0.32,
  },
  datePickerContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  dateColumn: {
    flex: 1,
    height: 180,
    position: 'relative',
  },
  selectionHighlight: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: PICKER_ITEM_HEIGHT,
    borderRadius: 40,
    backgroundColor: colors.primary[50],
  },
  scrollContent: {
    // Symmetric vertical padding so the selected row sits in the middle.
    paddingVertical: (180 - (52 + spacing.sm)) / 2,
  },
  dateOption: {
    height: 52,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dateOptionSelected: {},
  dateText: {
    fontSize: 28,
    
    color: 'rgba(0,0,0,0.15)',
    lineHeight: 36,
  },
  dateTextSelected: {
    color: colors.primary.purple,
  },
  buttonContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    paddingTop: spacing.md,
  },
  button: {
    width: '100%',
    height: 54,
  },
});

