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
    width: '100%',
    height: 320,
  },
  content: {
    flex: 1,
    minHeight: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm * 2,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 36,
    fontWeight: '500',
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral[900],
    lineHeight: 44,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[600],
    marginTop: spacing.xs,
  },
  scrollContent: {
    paddingBottom: spacing.xl * 2,
  },
  categoryCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  categoryChevron: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral[900],
  },
  categoryCountText: {
    fontSize: 13,
    fontFamily: typography.fontFamily.medium,
  },
  categoryTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 100,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    gap: 8,
  },
  chipSelected: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary.purple,
  },
  chipText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral[900],
  },
  chipTextSelected: {
    color: colors.primary.purple,
  },
  chipIconSlot: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
