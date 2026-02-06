import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
import { styles } from './styles';

type LostAccessEmailNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'LostAccessEmail'
>;

const lostAccessEmailSchema = z.object({
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
});

type LostAccessEmailFormData = z.infer<typeof lostAccessEmailSchema>;

export const LostAccessEmailScreen: React.FC = () => {
  const navigation = useNavigation<LostAccessEmailNavigationProp>();

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

  const onSubmit = (data: LostAccessEmailFormData) => {
    console.log('Form submitted:', data);
  };

  const handleClose = () => {
    navigation.goBack();
  };

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

