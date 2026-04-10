import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ReusableBottomSheet } from '../../../components/BottomSheet';
import { TextInput } from '../../../components/TextInput';
import { Button } from '../../../components/Button';
import { STRINGS } from '../../../constants/strings';
import type { AuthStackParamList } from '../../../navigation/types';
import { appConfig } from '../../../config/app.config';
import { env } from '../../../config/env';
import { endpoints } from '../../../services/api/endpoints';
import { styles } from './styles';

type LostAccessEmailNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'LostAccessEmail'
>;

const lostAccessEmailSchema = z
  .object({
    registeredEmail: z
      .string()
      .min(1, STRINGS.LOST_ACCESS_EMAIL.ERROR_REQUIRED)
      .email(STRINGS.LOST_ACCESS_EMAIL.ERROR_INVALID_EMAIL),
    phoneNumber: z
      .string()
      .min(1, STRINGS.LOST_ACCESS_EMAIL.ERROR_REQUIRED)
      .regex(/^\+?[1-9]\d{1,14}$/, STRINGS.LOST_ACCESS_EMAIL.ERROR_INVALID_PHONE),
    newEmail: z
      .string()
      .min(1, STRINGS.LOST_ACCESS_EMAIL.ERROR_REQUIRED)
      .email(STRINGS.LOST_ACCESS_EMAIL.ERROR_INVALID_EMAIL),
  })
  .refine(
    ({ registeredEmail, newEmail }) =>
      registeredEmail.trim().toLowerCase() !== newEmail.trim().toLowerCase(),
    {
      path: ['newEmail'],
      message: 'New email must be different from registered email',
    },
  );

type LostAccessEmailFormData = z.infer<typeof lostAccessEmailSchema>;

export const LostAccessEmailScreen: React.FC = () => {
  const navigation = useNavigation<LostAccessEmailNavigationProp>();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LostAccessEmailFormData>({
    resolver: zodResolver(lostAccessEmailSchema),
    mode: 'onChange',
    defaultValues: {
      registeredEmail: '',
      phoneNumber: '',
      newEmail: '',
    },
  });

  const onSubmit = async (data: LostAccessEmailFormData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await axios.post(
        `${appConfig.apiBaseUrl}${endpoints.auth.supportEmailChange}`,
        {
          oldEmail: data.registeredEmail.trim().toLowerCase(),
          newEmail: data.newEmail.trim().toLowerCase(),
          phoneNumber: data.phoneNumber.trim(),
        },
        {
          timeout: 30000,
          headers: {
            'Content-Type': 'application/json',
            ...(env.API_KEY ? { 'x-api-key': env.API_KEY } : {}),
          },
        },
      );

      navigation.navigate('OTPVerification', { email: data.newEmail.trim().toLowerCase() });
    } catch (error: any) {
      const message =
        error?.response?.data?.message ??
        error?.message ??
        STRINGS.GENERAL.ERROR_TRY_AGAIN;
      Alert.alert('Unable to continue', String(message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ReusableBottomSheet
        isOpen={true}
        onClose={handleClose}
        snapPoints={['63%']}
        scrollEnabled={false}
        showDragHandle={true}
        showCloseButton={true}
        enablePanDownToClose={true}
      >
        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            {STRINGS.LOST_ACCESS_EMAIL.TITLE}
          </Text>
          <Text style={styles.subtitle}>
            {STRINGS.LOST_ACCESS_EMAIL.SUBTITLE}
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputWrapper}>
            <Controller
              control={control}
              name="registeredEmail"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder={STRINGS.LOST_ACCESS_EMAIL.REGISTERED_EMAIL_PLACEHOLDER}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="off"
                  textContentType="none"
                  importantForAutofill="no"
                  error={errors.registeredEmail?.message || ''}
                />
              )}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Controller
              control={control}
              name="phoneNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder={STRINGS.LOST_ACCESS_EMAIL.PHONE_NUMBER_PLACEHOLDER}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="off"
                  textContentType="none"
                  importantForAutofill="no"
                  error={errors.phoneNumber?.message || ''}
                />
              )}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Controller
              control={control}
              name="newEmail"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder={STRINGS.LOST_ACCESS_EMAIL.NEW_EMAIL_PLACEHOLDER}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="off"
                  textContentType="none"
                  importantForAutofill="no"
                  error={errors.newEmail?.message || ''}
                />
              )}
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          {isValid ? (
            <Button
              title={STRINGS.LOST_ACCESS_EMAIL.CONTINUE}
              onPress={handleSubmit(onSubmit)}
              variant="primary"
              disabled={false}
              loading={isSubmitting}
              style={styles.continueButton}
            />
          ) : (
            <TouchableOpacity
              style={styles.continueButtonDisabled}
              disabled={true}
              activeOpacity={1}
            >
              <Text style={styles.continueButtonTextDisabled}>
                {STRINGS.LOST_ACCESS_EMAIL.CONTINUE}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ReusableBottomSheet>
    </View>
  );
};

