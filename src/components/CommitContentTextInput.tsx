import React, { useEffect, useRef, useState } from 'react';
import {
  Platform,
  TextInput,
  UIManager,
  type NativeSyntheticEvent,
  type TextInputProps,
  requireNativeComponent,
} from 'react-native';

export type CommitContentEvent = NativeSyntheticEvent<{ uri?: string; mimeType?: string }>;

type Props = TextInputProps & {
  onCommitContent?: (event: CommitContentEvent) => void;
};

const NATIVE_COMPONENT_NAME = 'AiraAndroidTextInput';
const hasNativeCommitTextInput =
  Platform.OS === 'android' &&
  typeof UIManager.getViewManagerConfig === 'function' &&
  !!UIManager.getViewManagerConfig(NATIVE_COMPONENT_NAME);

const NativeCommitTextInput = hasNativeCommitTextInput
  ? requireNativeComponent<Props>(NATIVE_COMPONENT_NAME)
  : null;

/**
 * Android-only: supports native keyboard commit-content (e.g. GIF/image insertion via Gboard).
 * Fallback: plain RN TextInput on iOS/when native component is not registered.
 */
export const CommitContentTextInput = React.forwardRef<any, Props>((props, ref) => {
  // Note: when using `requireNativeComponent`, we bypass RN's `<TextInput />`
  // JS wrapper logic that typically bridges native `onChange` events to
  // `onChangeText`. Without this, callers relying on `onChangeText` won't
  // see updates (placeholder/send-button won’t react).
  const { onChangeText, onChange, ...restProps } = props;
  const valueProp = props.value;
  const prevValueRef = useRef<string | undefined>(typeof valueProp === 'string' ? valueProp : undefined);
  const [clearKey, setClearKey] = useState(0);

  useEffect(() => {
    // Remount only when transitioning from non-empty -> empty.
    // This prevents visible "stale text" behind the placeholder when native
    // EditText doesn't fully honor prop-driven clearing.
    const prev = prevValueRef.current ?? '';
    const next = typeof valueProp === 'string' ? valueProp : '';
    if (prev.length > 0 && next.length === 0) {
      setClearKey((k) => k + 1);
    }
    prevValueRef.current = next;
  }, [valueProp]);

  useEffect(() => {
    // Some RN/native integration paths don't fully sync `value` -> native
    // text after updates. When we clear `value` after sending, make sure the
    // native view also clears its displayed text.
    if (Platform.OS !== 'android' || !NativeCommitTextInput) return;
    if (!ref || typeof (ref as any) !== 'object' || !(ref as any).current) return;
    if (valueProp == null) return;

    const current = (ref as any).current;
    if (typeof current?.setNativeProps === 'function') {
      current.setNativeProps({ text: String(valueProp), value: String(valueProp) });
    }
  }, [valueProp, ref]);

  if (Platform.OS !== 'android' || !NativeCommitTextInput) {
    return <TextInput ref={ref} {...props} />;
  }

  return (
    <NativeCommitTextInput
      // Only changes when input is cleared, so focus/typing are not disrupted.
      key={Platform.OS === 'android' ? `aira-clear-${clearKey}` : undefined}
      ref={ref}
      {...restProps}
      onChange={(event: any) => {
        onChange?.(event);
        const nextText =
          event?.nativeEvent?.text ??
          // Some RN/native emitters use `value` for the current text.
          event?.nativeEvent?.value;
        if (typeof onChangeText === 'function') onChangeText(nextText ?? '');
      }}
      // Some RN versions emit `onTextInput` instead of `onChange` for each keystroke.
      onTextInput={(event: any) => {
        const nextText =
          event?.nativeEvent?.text ??
          // Some RN/native emitters use `value` for the current text.
          event?.nativeEvent?.value;
        if (typeof onChangeText === 'function') onChangeText(nextText ?? '');
      }}
    />
  );
});

CommitContentTextInput.displayName = 'CommitContentTextInput';

