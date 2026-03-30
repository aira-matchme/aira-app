import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme';

export const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.white,
  },
  safeArea: {
    flex: 1,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerPill: {
    backgroundColor: colors.neutral[50],
    borderRadius: 16,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconBackContainer: {
    transform: [{ rotate: '180deg' }],
  },

  scrollBody: {
    flex: 1,
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    // Extra bottom padding: report link + room above floating chat/like overlay (~80px) + safe inset handled in overlay
    paddingBottom: spacing.xxl * 2 + 100,
  },

  // Name + distance
  nameSection: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  name: {
    ...typography.h2,
    color: colors.black,
    marginRight: spacing.xs,
  },
  verifyDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary.purple,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    ...typography.bodyMedium,
    color: colors.neutral[600],
    marginLeft: spacing.xs,
  },

  // Photos carousel
  photosRow: {
    paddingVertical: spacing.md,
    paddingRight: spacing.md,
  },
  photoCard: {
    width: 253,
    height: 295,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
    marginRight: spacing.sm,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    flex: 1,
    backgroundColor: colors.neutral[100],
  },

  // Segment control
  segmentWrapper: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  segmentBackground: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutral[50],
    borderRadius: 1000,
    padding: 4,
    width: '100%',
  },
  segmentInactiveContainer: {
    flex: 1,
  },
  segmentInactive: {
    flex: 1,
    height: 48,
    borderRadius: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentInactiveText: {
    ...typography.button,
    color: colors.black,
  },
  segmentActive: {
    flex: 1,
    height: 48,
    borderRadius: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActiveText: {
    ...typography.button,
    color: colors.white,
  },

  // Cards
  cardsWrapper: {
    gap: spacing.md,
  },
  cardEssentials: {
    backgroundColor: colors.secondary.lavenderLight,
    // backgroundColor: colors.primary[50],
    borderRadius: 22,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.04,
    shadowRadius: 30,
    elevation: 2,
  },
  cardInterests: {
    backgroundColor: colors.secondary.lavenderLight,
    borderRadius: 22,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.04,
    shadowRadius: 30,
    elevation: 2,
  },
  cardInsights: {
    backgroundColor: colors.secondary.lavenderLight,
    borderRadius: 22,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.04,
    shadowRadius: 30,
    elevation: 2,
  },
  cardTitle: {
    ...typography.bodyMedium,
    color: colors.neutral[900],
    marginBottom: spacing.sm,
  },
  personalitySubtitle: {
    ...typography.body,
    color: colors.neutral[700],
    marginBottom: spacing.sm,
  },
  personalityBody: {
    ...typography.body,
    color: colors.neutral[800],
    marginBottom: spacing.sm,
  },
  personalitySectionTitle: {
    ...typography.label,
    color: colors.neutral[900],
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },

  essentialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: spacing.sm,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary[100],
  },
  essentialRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  essentialBullet: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primary[300],
    marginRight: spacing.sm,
  },
  essentialText: {
    ...typography.bodyMedium,
    color: colors.black,
  },

  interestsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  interestChipText: {
    ...typography.small,
    fontWeight: '500',
    letterSpacing: 0.48,
    color: '#333333',
  },

  insightChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    backgroundColor: colors.white,
  },
  insightChipText: {
    ...typography.small,
    fontWeight: '500',
    color: colors.primary.purple,
  },
  insightEmptyText: {
    ...typography.body,
    color: colors.neutral[500],
    marginTop: spacing.sm,
  },

  /** Match options popup menu (More icon tap) – mirror DashboardScreen */
  matchOptionsBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  matchOptionsPopup: {
    marginTop: 80,
    marginRight: 24,
    minWidth: 160,
    borderRadius: 16,
    backgroundColor: colors.white,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  matchOptionsTitle: {
    ...typography.bodyMedium,
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  matchOptionsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    // marginBottom: 8,
    marginTop: 8,
    gap: 8,
  },
  matchOptionsIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchOptionsIconWrapReport: {
    // backgroundColor: 'rgba(230, 0, 0, 0.16)',
  },
  matchOptionsLabel: {
    ...typography.bodyMedium,
    fontSize: 16,
    fontWeight: '500',
    color: colors.black,
  },
  matchOptionsLabelReport: {
    ...typography.bodyMedium,
    fontSize: 16,
    fontWeight: '500',
    color: colors.black,
  },

  // Report
  reportContainer: {
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xxl,
  },
  reportText: {
    ...typography.label,
    color: colors.black,
  },

  // Bottom navigation (overlay — must not live inside ScrollView or it changes content height and flickers)
  bottomNavWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary.lavenderLight,
    padding: 8,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    gap: 8,
  },
  bottomChatButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  bottomLikeButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // First move sheet (same as Dashboard)
  firstMoveSheet: {
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 16,
    gap: 24,
  },
  firstMoveHeader: {
    alignItems: 'center',
    gap: 14,
  },
  firstMoveIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  firstMoveTextBlock: {
    alignItems: 'center',
    gap: 2,
  },
  firstMoveTitle: {
    fontSize: 24,
    fontWeight: '500',
    color: colors.black,
    textAlign: 'center',
  },
  firstMoveSubtitle: {
    fontSize: 14,
    color: colors.neutral[600],
    textAlign: 'center',
  },
  firstMoveButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  firstMoveButton: {
    flex: 1,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  /** Default look for both first-move options (no selection until pressed). */
  firstMoveButtonNeutral: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.neutral[100],
  },
  /** Shown only while the option is pressed / active (e.g. Aira request in flight). */
  firstMoveButtonActive: {
    backgroundColor: colors.secondary[50],
    borderWidth: 1,
    borderColor: colors.secondary[300],
  },
  firstMoveButtonIcon: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  firstMoveButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.black,
    textAlign: 'center',
  },
});


