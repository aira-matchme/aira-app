/** Figma node 4215:16273 — "User on Plus Plan" (375×1067) */
export const MANAGE_PLAN_FIGMA_WIDTH = 375;

export const MANAGE_SCREEN_PAD_H = 16;
export const MANAGE_HEADER_TOP = 56;
export const MANAGE_BACK_SIZE = 48;
export const MANAGE_CONTENT_TOP = 136;
export const MANAGE_SECTION_GAP = 16;

export const MANAGE_HERO_HEIGHT = 420;
export const MANAGE_HERO_RADIUS = 32;

export const MANAGE_DETAILS_RADIUS = 24;
export const MANAGE_DETAILS_PAD = 20;

export const MANAGE_RENEWAL_BANNER_RADIUS = 16;

export const MANAGE_FOOTER_BUTTON_HEIGHT = 54;

export function scaleManage(value: number, screenWidth: number): number {
  const ratio = screenWidth / MANAGE_PLAN_FIGMA_WIDTH;
  const clamped = Math.min(Math.max(ratio, 0.85), 1.2);
  return Math.round(value * clamped);
}
