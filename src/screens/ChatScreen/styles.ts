import { StyleSheet, Dimensions, Platform } from 'react-native';
import { colors, typography } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Figma 2101-27838: Chat list item
export const H_PADDING = 15;
export const CARD_RADIUS = 20;
export const AVATAR_SIZE = 44;
export const CARD_VERTICAL_PADDING = 12;
export const CARD_HORIZONTAL_PADDING = 15;
export const CARD_AVATAR_GAP = 8;
export const CARD_NAME_PREVIEW_GAP = 2;

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  screenFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.neutral[50],
  },
  safe: {
    flex: 1,

  },
  headerGradient: {
    paddingHorizontal: H_PADDING,
    paddingBottom: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: H_PADDING,
    marginTop: 8,
  },
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
  tabRequestsWrap: {
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
  title: {
    ...typography.h3,
    fontWeight: '600',
    color: colors.black,
    letterSpacing: -0.24,
  },
  notifButton: {
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: colors.white,
    paddingVertical: CARD_VERTICAL_PADDING,
    paddingHorizontal: CARD_HORIZONTAL_PADDING,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  backgroundGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 280,
  },
  cardPinned: {
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  cardSelected: {
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  // Figma 1690-8757: long-press context menu
  contextMenuBackdrop: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contextMenu: {
    position: 'absolute',
    right: H_PADDING,
    top: 220,
    backgroundColor: colors.white,
    borderRadius: 12,
    minWidth: 160,
    paddingVertical: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
  contextMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  contextMenuLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.black,
  },
  contextMenuLabelDanger: {
    color: colors.semantic.error,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: colors.neutral[200],
  },
  avatarPlaceholder: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: colors.primary[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    ...typography.bodyMedium,
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary.purple,
  },
  body: {
    flex: 1,
    marginLeft: CARD_AVATAR_GAP,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  bodyTextCol: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: CARD_NAME_PREVIEW_GAP,
    flexWrap: 'nowrap',
  },
  nameWrap: {
    flex: 1,
    minWidth: 0,
    marginRight: 6,
  },
  name: {
    ...typography.bodyMedium,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
    letterSpacing: 0.32,
    color: colors.black,
  },
  unreadBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.secondary[400],
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
    letterSpacing: 0.48,
    color: colors.white,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  previewThumb: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: colors.neutral[200],
    flexShrink: 0,
  },
  preview: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
    letterSpacing: 0.32,
    color: colors.neutral[600],
  },
  previewText: {
    flex: 1,
    minWidth: 0,
  },
  previewCallInner: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  previewCallMissed: {
    color: colors.semantic.error,
  },
  previewCallDefault: {
    color: colors.neutral[600],
  },
  previewDraft: {
    color: colors.primary.purple,
  },
  timeCol: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    marginLeft: 8,
  },
  time: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
    letterSpacing: 0.48,
    color: colors.neutral[500],
  },
  pinnedIconWrap: {
    marginTop: 2,
  },
});
