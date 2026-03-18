import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../../theme';

const PICKER_ROW_HEIGHT = 52;
const PICKER_VISIBLE_HEIGHT = 180; // 3 rows visible, center selected

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
    width: '100%',
    height: 320,
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
    color: colors.neutral[900],
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
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  pickerColumn: {
    height: PICKER_VISIBLE_HEIGHT,
    minWidth: 80,
  },
  scrollContent: {
    paddingVertical: (PICKER_VISIBLE_HEIGHT - PICKER_ROW_HEIGHT) / 2,
  },
  pickerRow: {
    height: PICKER_ROW_HEIGHT,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  pickerRowSelected: {
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing.lg,
  },
  pickerText: {
    fontSize: 22,
    fontFamily: typography.fontFamily.regular,
    paddingHorizontal: spacing.lg,
    color: colors.neutral[400],
    lineHeight: 28,
  },
  pickerTextSelected: {
    fontSize: 28,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary.purple,
    lineHeight: 36,
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
