import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Keyboard,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useFormKeyboardInset } from '../../hooks/useFormKeyboardInset';
import type { ProfileStackParamList } from '../../navigation/types';
import { colors, typography } from '../../theme';
import {
  CANCEL_SUBSCRIPTION_REASONS,
  type CancelSubscriptionReasonId,
} from './cancelSubscription';
import { SubscriptionScreenHeader } from './components/SubscriptionScreenHeader';
import { MANAGE_FOOTER_BUTTON_HEIGHT, MANAGE_SCREEN_PAD_H } from './manageLayout';

const KEYBOARD_SCROLL_DELAY_MS = Platform.OS === 'ios' ? 120 : 220;

export const CancelSubscriptionReasonScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const insets = useSafeAreaInsets();
  const { keyboardInset, isKeyboardVisible } = useFormKeyboardInset();
  const scrollRef = useRef<ScrollView>(null);
  const otherInputRef = useRef<TextInput>(null);
  const [selectedReason, setSelectedReason] = useState<CancelSubscriptionReasonId | null>(
    null,
  );
  const [otherReason, setOtherReason] = useState('');

  const canContinue = useMemo(() => {
    if (!selectedReason) return false;
    if (selectedReason === 'other') {
      return otherReason.trim().length > 0;
    }
    return true;
  }, [otherReason, selectedReason]);

  const scrollToOtherInput = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  }, []);

  const handleSelectReason = useCallback(
    (reasonId: CancelSubscriptionReasonId) => {
      setSelectedReason(reasonId);
      if (reasonId === 'other') {
        setTimeout(() => {
          otherInputRef.current?.focus();
          scrollToOtherInput();
        }, KEYBOARD_SCROLL_DELAY_MS);
      } else {
        Keyboard.dismiss();
      }
    },
    [scrollToOtherInput],
  );

  const handleContinue = useCallback(() => {
    if (!canContinue || !selectedReason) return;
    Keyboard.dismiss();
    navigation.navigate('CancelSubscriptionConfirm', {
      reason: selectedReason,
      ...(selectedReason === 'other' ? { otherReason: otherReason.trim() } : {}),
    });
  }, [canContinue, navigation, otherReason, selectedReason]);

  useEffect(() => {
    if (selectedReason !== 'other' || !isKeyboardVisible) return;
    const timer = setTimeout(scrollToOtherInput, KEYBOARD_SCROLL_DELAY_MS);
    return () => clearTimeout(timer);
  }, [isKeyboardVisible, scrollToOtherInput, selectedReason]);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        <SubscriptionScreenHeader
          title="Cancel Subscription"
          onBack={() => navigation.goBack()}
        />

        <View style={styles.flex}>
          <ScrollView
            ref={scrollRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          >
            <Text style={styles.subtitle}>
              Please tell us why you want to cancel your subscription. It's really
              important to us to know the reason.
            </Text>

            <View style={styles.options}>
              {CANCEL_SUBSCRIPTION_REASONS.map((reason) => {
                const selected = selectedReason === reason.id;
                const isOther = reason.id === 'other';
                return (
                  <TouchableOpacity
                    key={reason.id}
                    style={[
                      styles.option,
                      selected && (isOther ? styles.optionOtherSelected : styles.optionSelected),
                    ]}
                    onPress={() => handleSelectReason(reason.id)}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                      {selected ? <View style={styles.checkboxInner} /> : null}
                    </View>
                    <Text
                      style={[
                        styles.optionLabel,
                        selected && isOther && styles.optionLabelOtherSelected,
                      ]}
                    >
                      {reason.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {selectedReason === 'other' ? (
              <View style={styles.otherInputWrap}>
                <TextInput
                  ref={otherInputRef}
                  value={otherReason}
                  onChangeText={setOtherReason}
                  placeholder="Enter reason"
                  placeholderTextColor={colors.neutral[500]}
                  style={styles.otherInput}
                  multiline
                  textAlignVertical="top"
                  onFocus={scrollToOtherInput}
                />
              </View>
            ) : null}
          </ScrollView>

          <View
            style={[
              styles.footer,
              {
                paddingBottom: isKeyboardVisible ? 8 : Math.max(insets.bottom, 16),
                marginBottom: keyboardInset,
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.continueButton,
                canContinue ? styles.continueButtonActive : styles.continueButtonDisabled,
              ]}
              onPress={handleContinue}
              disabled={!canContinue}
              activeOpacity={0.9}
            >
              <Text
                style={[
                  styles.continueButtonText,
                  canContinue
                    ? styles.continueButtonTextActive
                    : styles.continueButtonTextDisabled,
                ]}
              >
                Cancel Subscription
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  flex: { flex: 1 },
  scrollView: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: MANAGE_SCREEN_PAD_H,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 16,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.28,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral[700],
  },
  options: { gap: 8 },
  option: {
    minHeight: 64,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    paddingHorizontal: 24,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.white,
  },
  optionSelected: {
    borderColor: colors.primary.purple,
    backgroundColor: colors.primary[50],
  },
  optionOtherSelected: {
    borderWidth: 2,
    borderColor: colors.primary.purple,
    backgroundColor: colors.white,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    borderColor: colors.primary.purple,
    backgroundColor: colors.primary.purple,
  },
  checkboxInner: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: colors.white,
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.32,
    fontFamily: typography.fontFamily.medium,
    color: colors.black,
  },
  optionLabelOtherSelected: {
    color: colors.primary.purple,
  },
  otherInputWrap: {
    width: '100%',
  },
  otherInput: {
    minHeight: 110,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.32,
    fontFamily: typography.fontFamily.regular,
    color: colors.black,
  },
  footer: {
    paddingHorizontal: MANAGE_SCREEN_PAD_H,
    paddingTop: 8,
    backgroundColor: colors.white,
  },
  continueButton: {
    height: MANAGE_FOOTER_BUTTON_HEIGHT,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  continueButtonDisabled: {
    backgroundColor: colors.neutral[50],
  },
  continueButtonActive: {
    backgroundColor: '#CC0000',
  },
  continueButtonText: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.32,
    fontFamily: typography.fontFamily.medium,
  },
  continueButtonTextDisabled: {
    color: colors.neutral[500],
  },
  continueButtonTextActive: {
    color: colors.white,
  },
});
