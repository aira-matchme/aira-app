import { Platform, type KeyboardEvent } from 'react-native';

/** Keyboard overlap with the app window — works across iOS/Android OEM quirks. */
export function keyboardOverlapFromEvent(windowHeight: number, e: KeyboardEvent): number {
  const ec = e.endCoordinates;
  if (!ec || windowHeight <= 0) return 0;

  if (Platform.OS === 'ios') {
    const screenY = typeof ec.screenY === 'number' ? ec.screenY : windowHeight;
    return Math.max(0, Math.min(windowHeight, windowHeight - screenY));
  }

  const fromHeight = typeof ec.height === 'number' && ec.height > 0 ? ec.height : 0;
  const fromScreenY =
    typeof ec.screenY === 'number' ? Math.max(0, windowHeight - ec.screenY) : 0;

  const maxReasonableKeyboard = Math.floor(windowHeight * 0.45);
  const minReasonableKeyboard = 80;
  const candidates = [fromHeight, fromScreenY].filter(
    (v) => v >= minReasonableKeyboard && v <= maxReasonableKeyboard,
  );
  if (candidates.length > 0) {
    return Math.min(...candidates);
  }

  const raw = Math.max(fromHeight, fromScreenY);
  if (raw <= 0) return 0;
  if (fromScreenY > 0) {
    return Math.min(maxReasonableKeyboard, fromScreenY);
  }
  return Math.min(maxReasonableKeyboard, Math.max(minReasonableKeyboard, raw));
}
