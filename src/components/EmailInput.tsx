import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  Platform,
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
      <View style={styles.errorSlot}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
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
    letterSpacing: 0,
    fontFamily: Platform.OS === 'ios' ? typography.fontFamily.regular : undefined,
    color: colors.neutral[900], // #1A1A1A - text color when typing (per Figma)
    backgroundColor: colors.white,
  },
  inputFocused: {
    borderColor: colors.primary.purple, // #7742F0 - purple border when focused (per Figma)
  },
  inputError: {
    borderColor: colors.semantic.error, // red(alert) per Figma - from theme
  },
  errorSlot: {
    height: spacing.xs + 20, // Fixed height so button position never shifts
    justifyContent: 'flex-end',
  },
  errorText: {
    marginTop: spacing.xs,
    marginLeft: spacing.lg + 4,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.28,
    color: colors.semantic.error,
    fontFamily: typography.fontFamily.regular,
  },
});

