import { Platform, StyleSheet } from 'react-native';
import { colors, typography } from '../../theme';
import { NOTIFICATIONS_FIGMA } from './notificationsLayout';

const {
  H_PADDING,
  LIST_TOP,
  ROW_PADDING_V,
  ROW_PADDING_H,
  ICON_SIZE,
  ICON_GAP,
  TITLE_SIZE,
  TITLE_LINE,
  TITLE_LETTER,
  BODY_SIZE,
  BODY_LINE,
  BODY_LETTER,
  UNREAD_DOT,
  TAB_TOP,
  TAB_BOTTOM,
  HEADER_TOP,
} = NOTIFICATIONS_FIGMA;

/** Figma 2652-24244 — unread row tint */
export const UNREAD_ROW_BG = '#F5F1FE';
const BODY_GRAY = '#4D4D4D';

export const styles = StyleSheet.create({
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
    minHeight: 0,
  },
  topChrome: {
    zIndex: 2,
    ...Platform.select({
      android: { elevation: 2 },
      default: {},
    }),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: H_PADDING,
    marginTop: HEADER_TOP,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.24,
    fontFamily: typography.fontFamily.semibold,
    color: colors.black,
    flex: 1,
    marginLeft: 8,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: TAB_TOP,
    marginBottom: TAB_BOTTOM,
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
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0.48,
    fontFamily: typography.fontFamily.medium,
    color: colors.white,
  },
  tabLabelInactive: {
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0.48,
    fontFamily: typography.fontFamily.regular,
    color: colors.black,
  },
  tabLabelUnreadInactive: {
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0.48,
    fontFamily: typography.fontFamily.regular,
    color: colors.primary.purple,
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
  list: {
    flex: 1,
    minHeight: 0,
    zIndex: 0,
  },
  listContent: {
    paddingTop: LIST_TOP,
    paddingBottom: 4,
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
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.28,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral[900],
    textAlign: 'center',
  },
  /** Figma 2652-24244 — flat list row, hairline divider only */
  rowCard: {
    paddingVertical: ROW_PADDING_V,
    paddingHorizontal: ROW_PADDING_H,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral[200],
    backgroundColor: colors.white,
  },
  rowCardUnread: {
    backgroundColor: UNREAD_ROW_BG,
  },
  rowPressedTint: {
    backgroundColor: UNREAD_ROW_BG,
  },
  rowInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
  },
  avatarImage: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    backgroundColor: colors.primary[50],
    overflow: 'hidden',
  },
  typeIconBadge: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  typeIconBadgeSubscription: {
    backgroundColor: colors.primary[50],
  },
  typeIconBadgeGallery: {
    backgroundColor: colors.primary[50],
  },
  typeIconBadgeMatch: {
    backgroundColor: colors.primary[50],
  },
  typeIconBadgeChat: {
    backgroundColor: colors.primary[50],
  },
  typeIconBadgeDefault: {
    backgroundColor: colors.neutral[100],
  },
  rowTextCol: {
    flex: 1,
    marginLeft: ICON_GAP,
    minWidth: 0,
  },
  titleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  rowTitle: {
    flexShrink: 1,
    fontSize: TITLE_SIZE,
    lineHeight: TITLE_LINE,
    fontFamily: typography.fontFamily.semibold,
    color: colors.black,
    letterSpacing: TITLE_LETTER,
  },
  unreadDotInline: {
    width: UNREAD_DOT,
    height: UNREAD_DOT,
    borderRadius: UNREAD_DOT / 2,
    backgroundColor: colors.primary.purple,
    marginLeft: 6,
    flexShrink: 0,
  },
  rowBody: {
    marginTop: 2,
    fontSize: BODY_SIZE,
    lineHeight: BODY_LINE,
    fontFamily: typography.fontFamily.regular,
    color: BODY_GRAY,
    letterSpacing: BODY_LETTER,
  },
  loadingBlock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: H_PADDING,
  },
});
