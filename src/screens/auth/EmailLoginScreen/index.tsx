import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Keyboard,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ReusableBottomSheet } from '../../../components/BottomSheet';
import { EmailInput, validateEmail } from '../../../components/EmailInput';
import { Button } from '../../../components/Button';
import { spacing } from '../../../theme';
import { STRINGS } from '../../../constants/strings';
import type { AuthStackParamList } from '../../../navigation/types';
import { useSendOtp } from '../../../modules/auth/hooks';
import Toast from 'react-native-toast-message';
import { styles } from './styles';

type EmailLoginNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'EmailLogin'>;

export const EmailLoginScreen: React.FC = () => {
  const navigation = useNavigation<EmailLoginNavigationProp>();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const sendOtpMutation = useSendOtp();

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!email.trim()) {
      setEmailError(undefined);
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      const validation = validateEmail(email);
      if (!validation.isValid) {
        setEmailError(STRINGS.EMAIL_LOGIN.ERROR_INCORRECT_EMAIL);
      } else {
        setEmailError(undefined);
      }
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [email]);

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) {
      setEmailError(undefined);
    }
  };

  const handleContinue = async () => {
    const validation = validateEmail(email);
    if (!validation.isValid) {
      setEmailError(validation.error);
      return;
    }

    try {
      const response = await sendOtpMutation.mutateAsync({ email });
      
      if (response.statusCode === 200) {
        Toast.show({
          type: 'success',
          text1: 'OTP Sent',
          text2: 'Please check your email for the verification code',
        });
        navigation.navigate('OTPVerification', { email });
      }
    } catch (error: any) {
      // Send OTP failed
    }
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const handleLostAccess = () => {
    navigation.navigate('LostAccessEmail');
  };

  const isEmailValid = validateEmail(email).isValid;

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const dynamicSpacing = keyboardHeight > 0 ? spacing.xxl * 3 : spacing.md;

  return (
    <View style={styles.container}>
      <ReusableBottomSheet
        isOpen={true}
        onClose={handleClose}
        snapPoints={['60%']}
        showDragHandle={true}
        showCloseButton={true}
        enablePanDownToClose={true}
      >
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{STRINGS.EMAIL_LOGIN.TITLE}</Text>
          <Text style={styles.subtitle}>
            {STRINGS.EMAIL_LOGIN.SUBTITLE}
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <EmailInput
            value={email}
            onChangeText={handleEmailChange}
            placeholder={STRINGS.EMAIL_LOGIN.PLACEHOLDER}
            error={emailError || ''}
            autoFocus={true}
          />
        </View>

        <View style={[styles.actionContainer, { marginTop: dynamicSpacing }]}>
          {isEmailValid ? (
            <Button
              title={STRINGS.EMAIL_LOGIN.CONTINUE}
              onPress={handleContinue}
              variant="primary"
              disabled={sendOtpMutation.isPending}
              loading={sendOtpMutation.isPending}
              style={styles.continueButtonActive}
            />
          ) : (
            <TouchableOpacity
              style={styles.continueButtonDisabled}
              disabled={true}
              activeOpacity={1}
            >
              <Text style={styles.continueButtonTextDisabled}>
                {STRINGS.EMAIL_LOGIN.CONTINUE}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.lostAccessLink}
            onPress={handleLostAccess}
            activeOpacity={0.7}
          >
            <Text style={styles.lostAccessText}>
              {STRINGS.EMAIL_LOGIN.LOST_ACCESS}
            </Text>
          </TouchableOpacity>
        </View>
      </ReusableBottomSheet>
    </View>
  );
};

