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
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  contentScroll: {
    paddingBottom: spacing.xl,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: colors.primary.purple,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '500',
    lineHeight: 36,
    letterSpacing: 0,
    color: colors.black,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.bodyMedium,
    fontSize: 14,
    color: colors.neutral[600],
    marginBottom: 4,
  },
  subtitleNote: {
    ...typography.small,
    fontSize: 12,
    color: colors.neutral[600],
    letterSpacing: 0.48,
    marginBottom: spacing.xl,
  },
  listContainer: {
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  rowLabel: {
    flex: 1,
  },
  rowLabelTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  rowLabelText: {
    ...typography.body,
    fontSize: 14,
    color: colors.neutral[500],
  },
  requiredBadge: {
    ...typography.small,
    fontSize: 11,
    color: colors.neutral[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rowValue: {
    ...typography.bodyMedium,
    fontSize: 16,
    color: colors.primary.purple,
  },
  rowValueMissing: {
    color: colors.semantic.error,
  },
  separator: {
    height: 1,
    backgroundColor: colors.neutral[100],
  },
  chevron: {
    width: 24,
    alignItems: 'flex-end',
  },
  chevronText: {
    fontSize: 16,
    color: colors.neutral[400],
  },
  actions: {
    width: '100%',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  primaryButton: {
    width: '100%',
    height: 54,
    borderRadius: 100,
  },
});
