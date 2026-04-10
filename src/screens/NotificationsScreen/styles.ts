import { StyleSheet, Platform } from 'react-native';
import { colors, typography } from '../../theme';

/** Match ChatScreen — Figma chat list horizontal inset */
export const H_PADDING = 15;

/** Figma 2586-6121: unread row tint (press state) */
export const UNREAD_ROW_BG = '#F5F1FE';
const AVATAR_PLACEHOLDER = '#F7F7F7';
const AVATAR = 40;
const TITLE_TO_AVATAR_GAP = 10.2;
const BODY_GRAY = '#4D4D4D';
const TIME_READ = '#999999';

export const styles = StyleSheet.create({
  /** ChatScreen: neutral canvas */
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  screenFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.white,
  },
  safe: {
    flex: 1,
  },
  /** ChatScreen headerRow — back + title use same row as title + bell */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: H_PADDING,
    marginTop: 8,
  },
  /** Same shell as ChatScreen notifButton */
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.07,
        shadowRadius: 14,
      },
      android: { elevation: 3 },
    }),
  },
  /** ChatScreen title (h3) */
  title: {
    ...typography.h3,
    fontWeight: '600',
    color: colors.black,
    letterSpacing: -0.24,
    flex: 1,
    marginLeft: 8,
  },
  /** ChatScreen tabRow */
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginHorizontal: H_PADDING,
    gap: 4,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 17,
    minHeight: 34,
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: colors.primary.purple,
  },
  tabInactive: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  tabLabelActive: {
    ...typography.bodyMedium,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
    letterSpacing: 0.48,
    color: colors.white,
  },
  tabLabelInactive: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
    letterSpacing: 0.48,
    color: colors.black,
    fontFamily: typography.fontFamily.regular,
  },
  tabUnreadWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  requestsDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.primary.purple,
  },
  /** ChatScreen list chrome */
  list: {
    flex: 1,
    paddingHorizontal: H_PADDING,
    paddingTop: 12,
  },
  loadMoreFooter: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: H_PADDING,
  },
  emptyStateContent: {
    alignItems: 'center',
    maxWidth: 220,
  },
  emptyStateText: {
    marginTop: 16,
    ...typography.bodyMedium,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: 0.28,
    color: colors.neutral[900],
    textAlign: 'center',
  },
  /** List row: hairline divider on bottom only (no card shadow / full border). */
  rowCard: {
    // backgroundColor: colors.white,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral[200],
  },
  rowPressedTint: {
    backgroundColor: UNREAD_ROW_BG,
  },
  rowInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    backgroundColor: AVATAR_PLACEHOLDER,
    overflow: 'hidden',
  },
  avatarImage: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    backgroundColor: AVATAR_PLACEHOLDER,
    overflow: 'hidden',
  },
  rowTextCol: {
    flex: 1,
    marginLeft: TITLE_TO_AVATAR_GAP,
    minWidth: 0,
  },
  titleBodyGroup: {
    width: '100%',
  },
  titleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  rowTitle: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    fontFamily: typography.fontFamily.semibold,
    color: colors.black,
    letterSpacing: -0.65,
  },
  unreadDotInline: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary.purple,
    marginLeft: 6,
  },
  rowBody: {
    marginTop: 0,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '400',
    color: BODY_GRAY,
    fontFamily: typography.fontFamily.regular,
    letterSpacing: -0.056,
  },
  timeBelow: {
    marginTop: 4,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '400',
    textAlign: 'right',
    alignSelf: 'stretch',
    fontFamily: typography.fontFamily.regular,
  },
  timeBelowUnread: {
    color: colors.black,
  },
  timeBelowRead: {
    color: TIME_READ,
  },
  loadingBlock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: H_PADDING,
  },
});
