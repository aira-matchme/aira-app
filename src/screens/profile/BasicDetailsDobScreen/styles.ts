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
    height: 480,
  },
  content: {
    flex: 1,
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
    height: 180, // 3 rows (52 + 8) so selected row is centered like Figma
  },
  scrollContent: {
    paddingVertical: 60, // centers the selected row in the 180px visible area
  },
  dateOption: {
    height: 52,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dateOptionSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  dateText: {
    fontSize: 28,
    fontFamily: typography.fontFamily.medium,
    color: 'rgba(0,0,0,0.15)',
    lineHeight: 36,
  },
  dateTextSelected: {
    color: colors.primary.purple,
  },
  buttonContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl * 1.5,
    paddingTop: spacing.md,
  },
  button: {
    width: '100%',
    height: 54,
  },
});

