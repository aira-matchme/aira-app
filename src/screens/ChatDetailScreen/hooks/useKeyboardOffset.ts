import { useEffect, useRef, useState, useCallback } from 'react';
import { Keyboard, Platform, ScrollView, type KeyboardEvent } from 'react-native';
import type { RefObject } from 'react';
import { keyboardOverlapFromEvent } from '../utils/helpers';

interface UseKeyboardOffsetParams {
  windowHeight: number;
  scrollViewRef: RefObject<ScrollView | null>;
}

interface UseKeyboardOffsetResult {
  keyboardHeight: number;
  isKeyboardVisible: boolean;
  composerBottomOffset: number;
  resetKeyboard: () => void;
}

export function useKeyboardOffset({
  windowHeight,
  scrollViewRef,
}: UseKeyboardOffsetParams): UseKeyboardOffsetResult {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const keyboardHideDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keyboardHeightRef = useRef(0);
  const androidBaseWindowHeightRef = useRef(windowHeight);

  const resetKeyboard = useCallback(() => {
    if (keyboardHideDebounceRef.current) {
      clearTimeout(keyboardHideDebounceRef.current);
      keyboardHideDebounceRef.current = null;
    }
    setIsKeyboardVisible(false);
    setKeyboardHeight(0);
    keyboardHeightRef.current = 0;
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    if (!isKeyboardVisible && windowHeight > androidBaseWindowHeightRef.current) {
      androidBaseWindowHeightRef.current = windowHeight;
    }
  }, [isKeyboardVisible, windowHeight]);

  useEffect(() => {
    const cancelKeyboardHideDebounce = () => {
      if (keyboardHideDebounceRef.current) {
        clearTimeout(keyboardHideDebounceRef.current);
        keyboardHideDebounceRef.current = null;
      }
    };

    const applyOverlap = (e: KeyboardEvent) => {
      cancelKeyboardHideDebounce();

      const overlap = keyboardOverlapFromEvent(windowHeight, e);

      const finalHeight =
        Platform.OS === 'android'
          ? overlap < 120
            ? 280
            : overlap
          : overlap;

      keyboardHeightRef.current = finalHeight;
      setIsKeyboardVisible(finalHeight > 0);
      setKeyboardHeight(finalHeight);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        });
      });
    };

    if (Platform.OS === 'ios') {
      const frameSub = Keyboard.addListener('keyboardWillChangeFrame', applyOverlap);
      return () => {
        cancelKeyboardHideDebounce();
        frameSub.remove();
      };
    }

    const showSub = Keyboard.addListener('keyboardDidShow', applyOverlap);

    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      cancelKeyboardHideDebounce();

      keyboardHideDebounceRef.current = setTimeout(() => {
        if (keyboardHeightRef.current < 100) return;

        setIsKeyboardVisible(false);
        setKeyboardHeight(0);

        keyboardHideDebounceRef.current = null;
      }, 180);
    });

    return () => {
      cancelKeyboardHideDebounce();
      showSub.remove();
      hideSub.remove();
    };
  }, [windowHeight, scrollViewRef]);

  const isAndroid = Platform.OS === 'android';
  const androidWindowShrink = androidBaseWindowHeightRef.current - windowHeight;
  const isKeyboardHandledBySystem = isAndroid && androidWindowShrink > 100;

  const composerBottomOffset =
    Platform.OS === 'ios'
      ? keyboardHeight
      : isKeyboardHandledBySystem
      ? androidWindowShrink
      : keyboardHeight;

  return { keyboardHeight, isKeyboardVisible, composerBottomOffset, resetKeyboard };
}
