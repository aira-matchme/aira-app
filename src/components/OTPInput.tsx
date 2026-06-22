import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TextInputProps,
  Platform,
  NativeSyntheticEvent,
  TextInputSelectionChangeEventData,
} from 'react-native';
import { colors, typography, spacing } from '../theme';

export interface OTPInputProps
  extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  value: string;
  onChangeText: (text: string) => void;
  error?: string | undefined;
  success?: boolean | undefined;
  length?: number;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  value,
  onChangeText,
  error,
  success = false,
  length = 6,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [selection, setSelection] = useState({ start: 0, end: 0 });

  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    // keep cursor at end whenever value changes
    setSelection({
      start: value.length,
      end: value.length,
    });
  }, [value]);

  const handleChangeText = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    const limitedText = numericText.slice(0, length);

    onChangeText(limitedText);
  };

  const handleSelectionChange = (
    e: NativeSyntheticEvent<TextInputSelectionChangeEventData>,
  ) => {
    setSelection(e.nativeEvent.selection);
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (rest.onFocus) {
      rest.onFocus({} as any);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (rest.onBlur) {
      rest.onBlur({} as any);
    }
  };

  const borderColor = error
    ? colors.semantic.error
    : success
    ? colors.semantic.success
    : isFocused
    ? colors.primary.purple
    : colors.border.light;

  return (
    <View style={styles.container}>
      <TextInput
        cursorColor={colors.textField.cursor}
        selectionColor={colors.textField.selection}
        ref={inputRef}
        style={[
          styles.input,
          { borderColor },
          error && styles.inputError,
          success && styles.inputSuccess,
        ]}
        value={value}
        onChangeText={handleChangeText}
        selection={selection}
        onSelectionChange={handleSelectionChange}
        placeholderTextColor={colors.neutral[500]}
        keyboardType="number-pad"
        maxLength={length}
        autoFocus={rest.autoFocus}
        onFocus={handleFocus}
        onBlur={handleBlur}
        editable={!success}
        textAlign="center"
        {...rest}
      />

      <View style={styles.errorSlot}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    height: 54,
    borderWidth: 1,
    borderRadius: 100,
    paddingHorizontal: spacing.lg + 4,
    paddingVertical: spacing.md,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0,
    fontFamily:
      Platform.OS === 'ios' ? typography.fontFamily.regular : undefined,
    color: colors.neutral[900],
    backgroundColor: colors.white,
    textAlign: 'center',
  },
  inputError: {
    borderColor: colors.semantic.error,
  },
  inputSuccess: {
    borderColor: colors.semantic.success,
  },
  errorSlot: {
    height: spacing.xs + 20,
    justifyContent: 'flex-end',
  },
  errorText: {
    marginTop: spacing.xs,
    marginLeft: spacing.lg + 4,
    marginRight: spacing.sm,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.28,
    color: '#E50000',
    fontFamily: typography.fontFamily.regular,
    alignSelf: 'flex-start',
  },
});