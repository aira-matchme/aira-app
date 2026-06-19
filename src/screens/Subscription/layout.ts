/**
 * Figma node 4285:14401 — "Plan details" (375×812)
 * Values extracted via Figma MCP get_design_context + get_metadata.
 */

export const SUBSCRIPTION_FIGMA_WIDTH = 375;
export const SUBSCRIPTION_FIGMA_HEIGHT = 812;

/** violet/violet_800 */
export const SUBSCRIPTION_BASE_COLOR = '#22075F';

/** Rectangle 41 — full-screen overlay */
export const SUBSCRIPTION_OVERLAY_COLOR = 'rgba(0,0,0,0.3)';

/** Frame 837 — top mesh layer */
export const SUBSCRIPTION_BG_TOP_HEIGHT = 436;

/** Frame 838 — bottom mesh layer (y=436) */
export const SUBSCRIPTION_BG_BOTTOM_Y = 436;
export const SUBSCRIPTION_BG_BOTTOM_HEIGHT = 376;

/** Frame 851 — header block */
export const SUBSCRIPTION_HEADER_LEFT = 24;
/** 72px artboard Y − 48px status bar */
export const SUBSCRIPTION_HEADER_TOP = 24;
export const SUBSCRIPTION_HEADER_GAP = 8;
export const SUBSCRIPTION_LOGO_BLOCK_GAP = 16;
export const SUBSCRIPTION_LOGO_ROW_GAP = 10;
export const SUBSCRIPTION_LOGO_WIDTH = 118.487;
export const SUBSCRIPTION_LOGO_HEIGHT = 56;
export const SUBSCRIPTION_PLUS_BADGE_HEIGHT = 30;
export const SUBSCRIPTION_PLUS_PAD_LEFT = 10;
export const SUBSCRIPTION_PLUS_PAD_RIGHT = 2;
export const SUBSCRIPTION_PLUS_PAD_V = 2;
export const SUBSCRIPTION_PLUS_INNER_GAP = 4;
export const SUBSCRIPTION_PLUS_GEM_SIZE = 26;
export const SUBSCRIPTION_SUBTITLE_MAX_WIDTH = 176;

/** Frame 4285:14439 — close control */
export const SUBSCRIPTION_CLOSE_SIZE = 24;
export const SUBSCRIPTION_CLOSE_RIGHT = 24;

/** Frame 848 — features list (y=230, px=16, gap=20) */
export const SUBSCRIPTION_FEATURES_PADDING_H = 16;
export const SUBSCRIPTION_FEATURES_GAP = 20;
/** 230 − (72 + 134) */
export const SUBSCRIPTION_FEATURES_TOP_GAP = 24;

/** Frame 843 — feature row */
export const SUBSCRIPTION_FEATURE_ROW_GAP = 12;
export const SUBSCRIPTION_FEATURE_ROW_HEIGHT = 56;
export const SUBSCRIPTION_FEATURE_ICON_SIZE = 38;
export const SUBSCRIPTION_FEATURE_ICON_RADIUS = 14.25;
export const SUBSCRIPTION_FEATURE_ICON_BORDER = 1.188;
export const SUBSCRIPTION_FEATURE_ICON_INNER = 19;
export const SUBSCRIPTION_FEATURE_TEXT_GAP = 6;

/** Frame 852 — bottom purchase panel (y=614, h=198) */
export const SUBSCRIPTION_BOTTOM_PANEL_HEIGHT = 198;
export const SUBSCRIPTION_BOTTOM_PANEL_RADIUS = 40;
export const SUBSCRIPTION_BOTTOM_PANEL_PAD_TOP = 56;
export const SUBSCRIPTION_BOTTOM_PANEL_PAD_H = 24;
export const SUBSCRIPTION_BOTTOM_PANEL_PAD_BOTTOM = 32;
export const SUBSCRIPTION_BOTTOM_PANEL_GAP = 20;
export const SUBSCRIPTION_BOTTOM_GRADIENT_TOP = 'rgba(17,4,47,0.7)';
export const SUBSCRIPTION_BOTTOM_GRADIENT_BOTTOM = 'rgba(54,13,149,0.7)';

/** Frame 849 — price pill (x=81, y=−32, 213×68) */
export const SUBSCRIPTION_PRICE_PILL_WIDTH = 213;
export const SUBSCRIPTION_PRICE_PILL_HEIGHT = 68;
export const SUBSCRIPTION_PRICE_PILL_OVERLAP = 32;
export const SUBSCRIPTION_PRICE_PILL_PAD_H = 24;
export const SUBSCRIPTION_PRICE_PILL_PAD_V = 12;
export const SUBSCRIPTION_PRICE_PILL_GAP = 6;
export const SUBSCRIPTION_PRICE_GRADIENT_TOP = 'rgba(17,4,47,0.55)';
export const SUBSCRIPTION_PRICE_GRADIENT_BOTTOM = 'rgba(54,13,149,0.55)';

/** Button instance 4285:14453 — 327×54 */
export const SUBSCRIPTION_CTA_HEIGHT = 54;
export const SUBSCRIPTION_CTA_PAD_H = 32;
export const SUBSCRIPTION_CTA_PAD_V = 16;

/** Legal text 4285:14454 — width 324 */
export const SUBSCRIPTION_LEGAL_MAX_WIDTH = 324;

/** Primary gradient stops */
export const SUBSCRIPTION_GRADIENT_START = '#7742F0';
export const SUBSCRIPTION_GRADIENT_END = '#CB7BF5';

export function scaleSubscription(value: number, screenWidth: number): number {
  const ratio = screenWidth / SUBSCRIPTION_FIGMA_WIDTH;
  const clamped = Math.min(Math.max(ratio, 0.85), 1.15);
  return Math.round(value * clamped);
}
