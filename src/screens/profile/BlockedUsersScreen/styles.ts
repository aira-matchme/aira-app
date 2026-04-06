import { Platform, StyleSheet } from 'react-native';
import { colors, typography } from '../../../theme';

/** Spacing tokens from Figma node 3202:12172 (375×812 frame, 343px content width). */
const INSET = 16;
const GAP_TITLE_TO_LIST = 8;
const GAP_BACK_TO_SECTION = 24;
const CARD_GAP = 4;
const BACK_TOP_IN_HEADER = 4;

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  /** Header column: same 16px horizontal inset as list (w-[343px] centered in frame). */
  headerBlock: {
    paddingHorizontal: INSET,
    paddingTop: BACK_TOP_IN_HEADER,
    paddingBottom: 0,
  },
  /** 48×48, rx 16, frosted fill + border, shadow 0 0 28 @ 7% (approx shadowRadius 14). */
  backButtonWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    // borderWidth: 1,
    // borderColor: 'rgba(255, 255, 255, 0.5)',
    // ...Platform.select({
    //   ios: {
    //     shadowColor: '#000',
    //     shadowOffset: { width: 0, height: 0 },
    //     shadowOpacity: 0.07,
    //     shadowRadius: 14,
    //   },
    //   android: { elevation: 3 },
    // }),
  },
  /** Body/Medium/Medium 14/20, tracking 0.28px — below back row with ~24px gap in Figma. */
  sectionTitle: {
    marginTop: GAP_BACK_TO_SECTION,
    marginBottom: 0,
    width: '100%',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.28,
    fontFamily: typography.fontFamily.medium,
    fontWeight: '500',
    color: colors.neutral[600],
  },
  /** Fills space between header and fixed bottom note. */
  mainBody: {
    flex: 1,
    minHeight: 0,
  },
  list: {
    flex: 1,
  },
  /** gap-[8px] between section title and first card in Figma. List scrolls above fixed bottom note. */
  listContent: {
    paddingHorizontal: INSET,
    paddingTop: GAP_TITLE_TO_LIST,
    paddingBottom: 16,
    flexGrow: 1,
  },
  rowSeparator: {
    height: CARD_GAP,
  },
  /** Card: px 12 py 10, rx 16, full width of content area. */
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  cardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral[100],
    marginRight: 8,
  },
  textCol: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  name: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.28,
    fontFamily: typography.fontFamily.medium,
    fontWeight: '500',
    color: colors.black,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0.48,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[600],
  },
  unblockPress: {
    paddingVertical: 4,
    paddingLeft: 8,
    flexShrink: 0,
  },
  unblockLabel: {
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0.48,
    fontFamily: typography.fontFamily.medium,
    fontWeight: '500',
    color: colors.primary.purple,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    minHeight: 200,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[600],
    textAlign: 'center',
    lineHeight: 24,
  },
  errorText: {
    fontSize: 15,
    fontFamily: typography.fontFamily.regular,
    color: colors.semantic.error,
    textAlign: 'center',
    marginBottom: 12,
  },
  /** Pinned below the list; respects safe-area bottom via parent SafeAreaView. */
  bottomFooter: {
    flexShrink: 0,
    width: '100%',
    backgroundColor: colors.neutral[50],
  },
  bottomFooterSpinner: {
    paddingBottom: 8,
    alignItems: 'center',
  },
  /** Note: ~327px text block → horizontal padding 24 on 375pt frame. */
  footerNote: {
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0.48,
    fontFamily: typography.fontFamily.regular,
    color: colors.black,
    textAlign: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 8,
  },
});
