import { Keyboard, Platform, type KeyboardEvent } from 'react-native';

/** Keyboard overlap with the app window — works across iOS/Android OEM quirks. */
export function keyboardOverlapFromEvent(windowHeight: number, e: KeyboardEvent): number {
  const ec = e.endCoordinates;
  if (!ec || windowHeight <= 0) return 0;

  if (Platform.OS === 'ios') {
    const fromHeight = typeof ec.height === 'number' && ec.height > 0 ? ec.height : 0;
    if (fromHeight > 0) {
      return fromHeight;
    }
    const screenY = typeof ec.screenY === 'number' ? ec.screenY : windowHeight;
    return Math.max(0, Math.min(windowHeight, windowHeight - screenY));
  }

  return resolveAndroidKeyboardHeight(windowHeight, e);
}

/**
 * Best-effort keyboard height on Android (Gboard, Samsung, Vivo, etc.).
 * Uses the largest sane value from event coordinates and Keyboard.metrics().
 */
export function resolveAndroidKeyboardHeight(
  windowHeight: number,
  e?: KeyboardEvent,
): number {
  const ec = e?.endCoordinates;
  const fromHeight = typeof ec?.height === 'number' && ec.height > 0 ? ec.height : 0;
  const fromScreenY =
    typeof ec?.screenY === 'number' ? Math.max(0, windowHeight - ec.screenY) : 0;
  const metricsHeight = Keyboard.metrics()?.height ?? 0;

  const maxReasonable = Math.floor(windowHeight * 0.62);
  const minReasonable = 72;
  const candidates = [fromHeight, fromScreenY, metricsHeight].filter(
    (value) => value >= minReasonable && value <= maxReasonable,
  );

  if (candidates.length > 0) {
    return Math.max(...candidates);
  }

  const raw = Math.max(fromHeight, fromScreenY, metricsHeight);
  if (raw >= minReasonable) {
    return Math.min(raw, maxReasonable);
  }

  // OEMs like Vivo sometimes report 0 — use a typical portrait keyboard ratio.
  return Math.round(windowHeight * 0.36);
}

/**
 * How much extra bottom inset the composer needs above the keyboard on Android.
 * Accounts for adjustResize (full, partial, or missing on OEM ROMs).
 */
export function resolveAndroidComposerBottomOffset(
  keyboardHeight: number,
  windowShrink: number,
  windowHeight: number,
  isKeyboardVisible: boolean,
): number {
  if (!isKeyboardVisible) return 0;

  const fallbackKeyboard = Math.round(windowHeight * 0.36);
  const effectiveKeyboard = Math.max(
    keyboardHeight,
    windowShrink > 48 ? windowShrink : 0,
    fallbackKeyboard,
  );

  if (windowShrink >= effectiveKeyboard - 20) {
    return 0;
  }

  return Math.max(0, effectiveKeyboard - windowShrink);
}
