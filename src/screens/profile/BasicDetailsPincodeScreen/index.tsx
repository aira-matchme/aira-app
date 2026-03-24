import React, { useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import LinearGradient from 'react-native-linear-gradient';

import { TextInput } from '../../../components/TextInput';
import { Button } from '../../../components/Button';
import { BackArrowIcon } from '../../../assets/icons/common/BackArrowIcon';
import { STRINGS } from '../../../constants/strings';
import { UK_POSTCODE_REGEX } from '../../../constants/profile';
import { apiClient } from '../../../services/api/client';
import { endpoints } from '../../../services/api/endpoints';
import { useProfileStore } from '../../../store/profile.store';
import { ETHNICITY_OPTIONS } from '../../../constants/profile';
import { useApiErrorStore } from '../../../store/apiError.store';
import type { AuthStackParamList } from '../../../navigation/types';
import { styles } from './styles';
import { ProfileScreenGradient } from '../../../components/ProfileScreenGradient';

type NavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'BasicDetailsPincode'
>;

const TOTAL_STEPS = 13;
const CURRENT_STEP = 13;

const pincodeSchema = z.object({
  pincode: z
    .string()
    .trim()
    .min(1, 'Postcode is required')
    .regex(UK_POSTCODE_REGEX, 'Please enter a valid UK postcode'),
});

type PincodeFormData = z.infer<typeof pincodeSchema>;

export const BasicDetailsPincodeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [isLoading, setIsLoading] = useState(false);
  const {
    setCurrentStep,
    name,
    dateOfBirth,
    gender,
    bodyType,
    height,
    education,
    employment,
    finalChoice,
    religion,
    maritalStatus,
    children,
    ethnicity,
    interests,
  } = useProfileStore();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<PincodeFormData>({
    resolver: zodResolver(pincodeSchema),
    mode: 'onChange',
    defaultValues: { pincode: '' },
  });

  // Prevent back navigation while loading
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (isLoading) {
          return true; // Prevent back navigation
        }
        return false; // Allow back navigation
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => subscription.remove();
    }, [isLoading]),
  );

  const onSubmit = async (data: PincodeFormData) => {
    setIsLoading(true);
    try {
      // Normalize postcode: uppercase, remove extra spaces
      const rawPostcode = data.pincode.trim().toUpperCase();
      const normalizedPostcode = rawPostcode.replace(/\s+/g, '');

      const postcodeResponse = await fetch(
        `https://api.postcodes.io/postcodes/${encodeURIComponent(normalizedPostcode)}`,
      );
      const json = await postcodeResponse.json();

      // Only proceed if postcode API is successful (status 200)
      if (json.status !== 200 || !json.result) {
        setIsLoading(false);
        useApiErrorStore.getState().showError(
          STRINGS.PROFILE_SETUP.PINCODE?.ERROR_NOT_FOUND ??
            "We couldn't find this postcode. Please check it and try again.",
        );
        return;
      }

      const { latitude, longitude, ttwa      } = json.result;

      // Build payload for /edit/profile
      const formatDob = (): string | undefined => {
        if (!dateOfBirth?.day || !dateOfBirth.month || !dateOfBirth.year) return undefined;
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${dateOfBirth.year}-${pad(dateOfBirth.month)}-${pad(dateOfBirth.day)}`;
      };

      const selectedEthnicity = ETHNICITY_OPTIONS.find((o) => o.key === ethnicity);
      const ethnicityGroups = selectedEthnicity?.groups;

      const payload: Record<string, any> = {
        nickName: name ?? '',
        dob: formatDob(),
        gender: gender ?? '',
        bodyType: bodyType ?? 'medium_build',
        heightFeet:
          height?.feet != null
            ? String(height.feet)
            : undefined,
        heightInches:
          height?.inches != null
            ? String(height.inches)
            : undefined,
        education: education ?? '',
        career: employment ?? '',
        income: finalChoice ?? '',
        latitude: latitude != null ? String(latitude) : undefined,
        longitude: longitude != null ? String(longitude) : undefined,
        city: ttwa ?? '',
        religion: religion ?? '',
        maritalStatus: maritalStatus ?? undefined,
        children: children ?? undefined,
        ethnicity: ethnicityGroups ?? undefined,
        hobbies: interests?.length ? interests : undefined,
      };

      const profileResponse = await apiClient.post(endpoints.user.addprofile, payload);
      // Check if the API response is successful
      if (profileResponse.data?.statusCode === 201) {
        setIsLoading(false);
        setCurrentStep(CURRENT_STEP + 1);
        navigation.navigate('FaceVerification');
      } else {
        setIsLoading(false);
      }
    } catch (error: any) {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <ProfileScreenGradient />
      <LinearGradient
        colors={[
          'rgba(203, 123, 245, 0)',
          'rgba(203, 123, 245, 0.08)',
          'rgba(203, 123, 245, 0.14)',
          'rgba(203, 123, 245, 0.08)',
          'rgba(203, 123, 245, 0)',
        ]}
        locations={[0, 0.15, 0.3, 0.5, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.middleGradient}
      />
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'top']}>
        <View style={{ paddingTop: 16, paddingHorizontal: 20 }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            disabled={isLoading}
            style={{ opacity: isLoading ? 0.5 : 1 }}
          >
            <BackArrowIcon size={48} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>
            {STRINGS.PROFILE_SETUP.PINCODE?.TITLE || "Let's find people around you"}
          </Text>
          <Text style={styles.subtitle}>
            {STRINGS.PROFILE_SETUP.PINCODE?.SUBTITLE || "We use this to prioritize nearby matches."}
          </Text>

          <View style={styles.inputWrapper}>
            <Controller
              control={control}
              name="pincode"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder={STRINGS.PROFILE_SETUP.PINCODE?.PLACEHOLDER || 'Enter your postcode'}
                  keyboardType="default"
                  autoCapitalize="characters"
                  autoCorrect={false}
                  autoFocus
                  maxLength={8}
                  error={errors.pincode?.message || ''}
                  style={styles.input}
                />
              )}
            />
          </View>
        </View>

        <View style={Platform.OS === 'ios' ? styles.buttonContainer : styles.buttonContainerAndroid}>
          <Button
            title={STRINGS.PROFILE_SETUP.COMMON.CONTINUE || "Next"}
            onPress={handleSubmit(onSubmit)}
            variant="primary"
            disabled={!isValid || isLoading}
            loading={isLoading}
            style={styles.button}
          />
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

