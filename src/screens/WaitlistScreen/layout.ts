/** Figma waitlist screen (375×812) — node 3697:14301 */
export const WAITLIST_DESIGN_WIDTH = 375;
export const WAITLIST_DESIGN_HEIGHT = 812;

export const WAITLIST_HORIZONTAL_PADDING = 16;

export const WAITLIST_LOGO_WIDTH = 84.634;
export const WAITLIST_LOGO_HEIGHT = 40;

export const WAITLIST_PREMIUM_CARD_HEIGHT = 106;
export const WAITLIST_INFO_CARD_HEIGHT = 190;

/** Figma Rectangle 40 export aspect (750×776 @2x) */
export const WAITLIST_BOTTOM_GRADIENT_ASPECT = 776 / 750;

export const scaleWaitlist = (windowWidth: number, value: number): number =>
  Math.round(value * Math.min(Math.max(windowWidth / WAITLIST_DESIGN_WIDTH, 0.88), 1.15));

export const scaleWaitlistByHeight = (windowHeight: number, value: number): number =>
  Math.round(value * Math.min(Math.max(windowHeight / WAITLIST_DESIGN_HEIGHT, 0.88), 1.15));
