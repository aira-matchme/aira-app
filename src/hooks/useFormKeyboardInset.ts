import { useEffect, useRef, useState } from 'react';
import { Keyboard, Platform, useWindowDimensions, type KeyboardEvent } from 'react-native';

import { keyboardOverlapFromEvent } from '../utils/keyboard';

type UseFormKeyboardInsetResult = {
  /** Bottom inset to apply above the keyboard (0 when the OS already resizes the window). */
  keyboardInset: number;
  isKeyboardVisible: boolean;
};

/**
 * Keyboard inset for fixed footers on form screens.
 * Android `adjustResize` shrinks the window — returns 0 to avoid double offset.
 */
export function useFormKeyboardInset(): UseFormKeyboardInsetResult {
  const { height: windowHeight } = useWindowDimensions();
  const [keyboardInset, setKeyboardInset] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const keyboardInsetRef = useRef(0);
  const androidBaseWindowHeightRef = useRef(windowHeight);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    if (!isKeyboardVisible && windowHeight > androidBaseWindowHeightRef.current) {
      androidBaseWindowHeightRef.current = windowHeight;
    }
  }, [isKeyboardVisible, windowHeight]);

  useEffect(() => {
    const clearKeyboard = () => {
      keyboardInsetRef.current = 0;
      setKeyboardInset(0);
      setIsKeyboardVisible(false);
    };

    const applyOverlap = (e: KeyboardEvent) => {
      const overlap = keyboardOverlapFromEvent(windowHeight, e);
      const finalHeight =
        Platform.OS === 'android' ? (overlap < 120 ? 280 : overlap) : overlap;

      keyboardInsetRef.current = finalHeight;
      setKeyboardInset(finalHeight);
      setIsKeyboardVisible(finalHeight > 0);
    };

    if (Platform.OS === 'ios') {
      const frameSub = Keyboard.addListener('keyboardWillChangeFrame', applyOverlap);
      const hideSub = Keyboard.addListener('keyboardWillHide', clearKeyboard);
      return () => {
        frameSub.remove();
        hideSub.remove();
      };
    }

    const showSub = Keyboard.addListener('keyboardDidShow', applyOverlap);
    const hideSub = Keyboard.addListener('keyboardDidHide', clearKeyboard);
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [windowHeight]);

  const androidWindowShrink = Math.max(
    0,
    androidBaseWindowHeightRef.current - windowHeight,
  );
  const isKeyboardHandledBySystem =
    Platform.OS === 'android' && androidWindowShrink > 100;

  const effectiveKeyboardInset =
    Platform.OS === 'ios'
      ? keyboardInset
      : isKeyboardHandledBySystem
        ? 0
        : keyboardInset;

  return {
    keyboardInset: effectiveKeyboardInset,
    isKeyboardVisible: effectiveKeyboardInset > 0,
  };
}
