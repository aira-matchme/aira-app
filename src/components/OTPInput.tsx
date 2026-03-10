import React, { useRef, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TextInputProps,
} from 'react-native';
import { colors, typography, spacing } from '../theme';

export interface OTPInputProps
  extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  value: string;
  onChangeText: (text: string) => void;
  error?: string | undefined;
  success?: boolean | undefined; // For verified state (green border)
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
  const inputRef = useRef<TextInput>(null);

  const handleChangeText = (text: string) => {
    // Only allow numeric input
    const numericText = text.replace(/[^0-9]/g, '');
    // Limit to OTP length
    const limitedText = numericText.slice(0, length);
    onChangeText(limitedText);
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
    ? colors.semantic.error // Error red from Figma
    : success
    ? colors.semantic.success // Green (success) from Figma
    : isFocused
    ? colors.primary.purple // #7742F0 - purple border when focused
    : colors.border.light; // neutral.100

  return (
    <View style={styles.container}>
      <TextInput
        ref={inputRef}
        style={[
          styles.input,
          { borderColor },
          error && styles.inputError,
          success && styles.inputSuccess,
        ]}
        value={value}
        onChangeText={handleChangeText}
        placeholderTextColor={colors.neutral[500]} // #8C8C8C
        keyboardType="number-pad"
        maxLength={length}
        autoFocus={rest.autoFocus}
        onFocus={handleFocus}
        onBlur={handleBlur}
        editable={!success} // Disable input when verified
        {...rest}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
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
    borderRadius: 100, // Fully rounded
    paddingHorizontal: spacing.lg + 4, // 20px (px-[20px])
    paddingVertical: spacing.md, // 16px (py-[16px])
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.32,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[900], // #1A1A1A - text color when typing
    backgroundColor: colors.white,
    textAlign: 'center',
  },
  inputError: {
    borderColor: colors.semantic.error, // Error red from Figma
  },
  inputSuccess: {
    borderColor: colors.semantic.success, // Green (success) from Figma
  },
  errorText: {
    marginTop: spacing.xs, // 4px (py-[4px] in Figma)
    marginLeft: spacing.lg + 4, // 20px (pl-[20px] in Figma)
    marginRight: spacing.sm, // 8px (pr-[8px] in Figma)
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.28,
    color: '#E50000', // Error red from Figma
    fontFamily: typography.fontFamily.regular,
    alignSelf: 'flex-start', // Align to left
  },
});

