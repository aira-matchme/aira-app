import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Figma 2778-10903 — bottom nav frame (375×87, bottom: 0). */
export const TAB_BAR_HEIGHT = 87;
export const TAB_BAR_BORDER_RADIUS = 24;
export const TAB_BAR_PADDING_TOP = 8;
/** Bottom inset inside the 87px bar on devices without a home indicator. */
export const TAB_BAR_FALLBACK_BOTTOM_PAD = 24;
/** Figma gap between tab icon and label. */
export const TAB_BAR_ICON_LABEL_GAP = 6;

/** Icon + label row height inside the bar (constant across devices). */
export const TAB_BAR_ROW_HEIGHT =
  TAB_BAR_HEIGHT - TAB_BAR_PADDING_TOP - TAB_BAR_FALLBACK_BOTTOM_PAD;

export function getTabBarBottomPadding(safeAreaBottom: number): number {
  return safeAreaBottom > 0 ? safeAreaBottom : TAB_BAR_FALLBACK_BOTTOM_PAD;
}

/**
 * Total pixels the tab bar occupies from the screen bottom (flush).
 * Figma 87px includes 24px bottom pad; grows on devices with a larger home indicator.
 */
export function getTabBarOccupiedHeight(safeAreaBottom: number): number {
  const bottomPad = getTabBarBottomPadding(safeAreaBottom);
  return TAB_BAR_HEIGHT - TAB_BAR_FALLBACK_BOTTOM_PAD + bottomPad;
}

export function useTabBarOccupiedHeight(): number {
  const insets = useSafeAreaInsets();
  return getTabBarOccupiedHeight(insets.bottom);
}
