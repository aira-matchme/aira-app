import React, { useState } from 'react';
import {
  TextInput as RNTextInput,
  StyleSheet,
  View,
  Text,
  TextInputProps as RNTextInputProps,
} from 'react-native';
import { colors, typography, spacing } from '../theme';

interface TextInputProps extends RNTextInputProps {
  error?: string;
  type?: 'text' | 'number';
}

export const TextInput: React.FC<TextInputProps> = ({
  error,
  onBlur,
  onFocus,
  onChangeText,
  keyboardType,
  type = 'text',
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) {
      onFocus(e);
    }
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) {
      onBlur(e);
    }
  };

  const borderColor = error
    ? colors.semantic.error // Error red from Figma
    : isFocused
    ? colors.primary.purple
    : colors.border.light; // neutral.100

  const resolvedKeyboardType =
    keyboardType || (type === 'number' ? 'numeric' : 'default');

  const handleChangeText = (text: string) => {
    let next = text;

    if (type === 'number') {
      // Allow digits and a single decimal point
      next = text.replace(/[^0-9.]/g, '');
      const parts = next.split('.');
      if (parts.length > 2) {
        next = `${parts[0]}.${parts.slice(1).join('')}`;
      }
    }

    if (onChangeText) {
      onChangeText(next);
    }
  };

  return (
    <View style={styles.container}>
      <RNTextInput
        style={[
          styles.input,
          { borderColor },
          error && styles.inputError,
        ]}
        placeholderTextColor={colors.neutral[500]} // #8C8C8C
        onFocus={handleFocus}
        onBlur={handleBlur}
        keyboardType={resolvedKeyboardType}
        onChangeText={handleChangeText}
        {...rest}
      />
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}
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
  },
  inputError: {
    borderColor: colors.semantic.error, // Error red from Figma
  },
  errorText: {
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    marginLeft: spacing.lg + 4,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.28,
    color: colors.semantic.error,
    fontFamily: typography.fontFamily.regular,
    maxWidth: '100%',
  },
});

