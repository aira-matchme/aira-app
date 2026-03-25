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
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  cardsScroll: {
    flex: 1,
  },
  cardsContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    gap: 12,
    paddingVertical: spacing.xl,
  },
  title: {
    ...typography.h2,
    color: colors.black,
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: spacing.sm,
    alignSelf: 'stretch',
  },
  similarImagesHint: {
    ...typography.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.neutral[600],
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: spacing.md,
    alignSelf: 'stretch',
  },
  card: {
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.02,
    shadowRadius: 28,
    elevation: 4,
  },
  cardSelected: {
    borderWidth: 3,
    borderColor: colors.primary[400],
  },
  cardImageWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  cardImageBg: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImageLoader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 34,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  cardLabel: {
    fontSize: 16,
    fontFamily: typography.fontFamily.semibold,
    color: colors.white,
    flex: 1,
  },
  cardLabelSpacer: {
    flex: 1,
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.secondary.lavender,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    textAlign: 'center',
    marginTop: spacing.lg,
    color: colors.neutral[600],
  },
  tapYourChoiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: spacing.md,
  },
  tapYourChoice: {
    ...typography.bodyMedium,
    fontSize: 16,
    color: colors.neutral[800],
  },
});

