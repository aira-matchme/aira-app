import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
} from 'react-native';
import { colors, typography, spacing } from '../theme';

interface EmailInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  autoFocus?: boolean;
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const EmailInput: React.FC<EmailInputProps> = ({
  value,
  onChangeText,
  placeholder = 'Enter your email',
  error,
  autoFocus = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);


  const handleChangeText = (text: string) => {
    onChangeText(text);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          error && styles.inputError,
        ]}
        value={value}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.neutral[500]} // #8C8C8C
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus={autoFocus}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

// Export validation function for use in parent components
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email.trim()) {
    return { isValid: false, error: 'Incorrect email address' };
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    return { isValid: false, error: 'Incorrect email address' }; // Match Figma error message
  }
  return { isValid: true };
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    height: 54,
    borderWidth: 1,
    borderColor: colors.neutral[100], // #E6E6E6 - default border
    borderRadius: 100, // Fully rounded
    paddingHorizontal: spacing.lg + 4, // 20px (px-[20px])
    paddingVertical: spacing.md, // 16px (py-[16px])
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0.32,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[900], // #1A1A1A - text color when typing (per Figma)
    backgroundColor: colors.white,
  },
  inputFocused: {
    borderColor: colors.primary.purple, // #7742F0 - purple border when focused (per Figma)
  },
  inputError: {
    borderColor: colors.semantic.error, // red(alert) per Figma - from theme
  },
  errorText: {
    marginTop: spacing.xs, // 4px (py-[4px] in Figma)
    marginLeft: spacing.lg + 4, // 20px (px-[20px] in Figma) - align with input padding
    fontSize: 14, // text-[14px] per Figma
    lineHeight: 20, // leading-[20px] per Figma
    letterSpacing: 0.28, // tracking-[0.28px] per Figma
    color: colors.semantic.error, // red(alert) per Figma - from theme
    fontFamily: typography.fontFamily.regular,
  },
});

