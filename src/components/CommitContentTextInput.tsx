import React from 'react';
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
  if (Platform.OS !== 'android' || !NativeCommitTextInput) {
    return <TextInput ref={ref} {...props} />;
  }

  return <NativeCommitTextInput ref={ref} {...props} />;
});

CommitContentTextInput.displayName = 'CommitContentTextInput';

