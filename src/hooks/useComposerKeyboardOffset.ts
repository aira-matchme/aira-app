import { useEffect, useRef, useState, useCallback } from 'react';
import { Keyboard, Platform, ScrollView, type KeyboardEvent } from 'react-native';
import type { RefObject } from 'react';
import {
  keyboardOverlapFromEvent,
  resolveAndroidComposerBottomOffset,
  resolveAndroidKeyboardHeight,
} from '../utils/keyboard';

interface UseComposerKeyboardOffsetParams {
  windowHeight: number;
  scrollViewRef: RefObject<ScrollView | null>;
}

interface UseComposerKeyboardOffsetResult {
  keyboardHeight: number;
  isKeyboardVisible: boolean;
  composerBottomOffset: number;
  resetKeyboard: () => void;
}

const ANDROID_METRICS_REFRESH_DELAYS_MS = [0, 60, 140, 280] as const;

export function useComposerKeyboardOffset({
  windowHeight,
  scrollViewRef,
}: UseComposerKeyboardOffsetParams): UseComposerKeyboardOffsetResult {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const keyboardHideDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const metricsRefreshTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const keyboardHeightRef = useRef(0);
  const androidBaseWindowHeightRef = useRef(windowHeight);
  const latestWindowHeightRef = useRef(windowHeight);

  latestWindowHeightRef.current = windowHeight;

  const clearMetricsRefreshTimers = useCallback(() => {
    metricsRefreshTimersRef.current.forEach(clearTimeout);
    metricsRefreshTimersRef.current = [];
  }, []);

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      });
    });
  }, [scrollViewRef]);

  const applyKeyboardHeight = useCallback(
    (nextHeight: number) => {
      const normalized = Math.max(0, Math.round(nextHeight));
      if (normalized <= 0) return;
      if (normalized <= keyboardHeightRef.current) return;

      keyboardHeightRef.current = normalized;
      setIsKeyboardVisible(true);
      setKeyboardHeight(normalized);
      scrollToEnd();
    },
    [scrollToEnd],
  );

  const refreshAndroidKeyboardHeight = useCallback(
    (event?: KeyboardEvent) => {
      const height = resolveAndroidKeyboardHeight(latestWindowHeightRef.current, event);
      applyKeyboardHeight(height);
    },
    [applyKeyboardHeight],
  );

  const scheduleAndroidMetricsRefresh = useCallback(
    (event?: KeyboardEvent) => {
      clearMetricsRefreshTimers();
      metricsRefreshTimersRef.current = ANDROID_METRICS_REFRESH_DELAYS_MS.map((delay) =>
        setTimeout(() => {
          refreshAndroidKeyboardHeight(event);
        }, delay),
      );
    },
    [clearMetricsRefreshTimers, refreshAndroidKeyboardHeight],
  );

  const resetKeyboard = useCallback(() => {
    if (keyboardHideDebounceRef.current) {
      clearTimeout(keyboardHideDebounceRef.current);
      keyboardHideDebounceRef.current = null;
    }
    clearMetricsRefreshTimers();
    setIsKeyboardVisible(false);
    setKeyboardHeight(0);
    keyboardHeightRef.current = 0;
  }, [clearMetricsRefreshTimers]);

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

      if (Platform.OS === 'android') {
        refreshAndroidKeyboardHeight(e);
        scheduleAndroidMetricsRefresh(e);
        return;
      }

      const finalHeight = keyboardOverlapFromEvent(windowHeight, e);
      keyboardHeightRef.current = finalHeight;
      setIsKeyboardVisible(finalHeight > 0);
      setKeyboardHeight(finalHeight);
      scrollToEnd();
    };

    if (Platform.OS === 'ios') {
      const frameSub = Keyboard.addListener('keyboardWillChangeFrame', applyOverlap);
      const hideSub = Keyboard.addListener('keyboardWillHide', resetKeyboard);
      return () => {
        cancelKeyboardHideDebounce();
        clearMetricsRefreshTimers();
        frameSub.remove();
        hideSub.remove();
      };
    }

    const showSub = Keyboard.addListener('keyboardDidShow', applyOverlap);
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      cancelKeyboardHideDebounce();
      clearMetricsRefreshTimers();
      keyboardHideDebounceRef.current = setTimeout(() => {
        if (keyboardHeightRef.current < 100) return;
        resetKeyboard();
        keyboardHideDebounceRef.current = null;
      }, 180);
    });

    return () => {
      cancelKeyboardHideDebounce();
      clearMetricsRefreshTimers();
      showSub.remove();
      hideSub.remove();
    };
  }, [
    clearMetricsRefreshTimers,
    refreshAndroidKeyboardHeight,
    resetKeyboard,
    scheduleAndroidMetricsRefresh,
    scrollToEnd,
    windowHeight,
  ]);

  const androidWindowShrink = Math.max(0, androidBaseWindowHeightRef.current - windowHeight);

  const composerBottomOffset =
    Platform.OS === 'ios'
      ? keyboardHeight
      : resolveAndroidComposerBottomOffset(
          keyboardHeight,
          androidWindowShrink,
          windowHeight,
          isKeyboardVisible,
        );

  return { keyboardHeight, isKeyboardVisible, composerBottomOffset, resetKeyboard };
}
