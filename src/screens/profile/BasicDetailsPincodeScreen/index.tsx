import React from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import LinearGradient from 'react-native-linear-gradient';

import { TextInput } from '../../../components/TextInput';
import { Button } from '../../../components/Button';
import { BackArrowIcon } from '../../../assets/icons/common/BackArrowIcon';
import { STRINGS } from '../../../constants/strings';
import { apiClient } from '../../../services/api/client';
import { endpoints } from '../../../services/api/endpoints';
import { useProfileStore } from '../../../store/profile.store';
import type { AuthStackParamList } from '../../../navigation/types';
import { styles } from './styles';

type NavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'BasicDetailsPincode'
>;

const TOTAL_STEPS = 8;
const CURRENT_STEP = 8;

// Basic UK postcode validation (e.g. SW1A 1AA, M1 1AE, EH1 1BB)
// Accepts common UK formats, case-insensitive, with optional space
const UK_POSTCODE_REGEX = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

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
  const {
    setCurrentStep,
    name,
    dateOfBirth,
    height,
    education,
    employment,
    finalChoice,
    religion,
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

  const onSubmit = async (data: PincodeFormData) => {
    try {
      // Normalize postcode: uppercase, remove extra spaces
      const rawPostcode = data.pincode.trim().toUpperCase();
      const normalizedPostcode = rawPostcode.replace(/\s+/g, '');

      const response = await fetch(
        `https://api.postcodes.io/postcodes/${encodeURIComponent(normalizedPostcode)}`,
      );
      const json = await response.json();

      if (json.status !== 200 || !json.result) {
        Alert.alert('Invalid postcode', 'Please enter a valid UK postcode.');
        return;
      }

      const { latitude, longitude } = json.result;
      console.log('📍 Postcode lookup result:', {
        postcode: rawPostcode,
        latitude,
        longitude,
      });

      // Build payload for /edit/profile
      const formatDob = (): string | undefined => {
        if (!dateOfBirth?.day || !dateOfBirth.month || !dateOfBirth.year) return undefined;
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${dateOfBirth.year}-${pad(dateOfBirth.month)}-${pad(dateOfBirth.day)}`;
      };

      const payload: Record<string, any> = {
        nickName: name ?? '',
        dob: formatDob(),
        gender: '', // TODO: wire up when gender step is added
        height: height?.value != null ? String(height.value) : undefined,
        heightUnit: height?.unit ?? undefined,
        education: education ?? '',
        career: employment ?? '',
        income: finalChoice ?? '',
        latitude: latitude != null ? String(latitude) : undefined,
        longitude: longitude != null ? String(longitude) : undefined,
        religion: religion ?? '',
      };

      console.log('📤 Submitting profile to /edit/profile with payload:', payload);
      await apiClient.patch(endpoints.user.editProfile, payload);

      setCurrentStep(CURRENT_STEP + 1);
      navigation.navigate('FaceVerification');
    } catch (error) {
      console.error('❌ Error looking up postcode:', error);
      Alert.alert(
        'Network error',
        'Unable to verify postcode right now. Please check your connection and try again.',
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
        <LinearGradient
        colors={[
          'rgba(221,170,249,0)',
          'rgba(221,170,249,0.18)',
          'rgba(221,170,249,0.18)',
          'rgba(221,170,249,0)',
        ]}
        locations={[0, 0.38, 0.62, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.backgroundGlow}
      />
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'top']}>
        <View style={{ paddingTop: 16, paddingHorizontal: 20 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <BackArrowIcon size={48} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {STRINGS.PROFILE_SETUP.PINCODE?.TITLE || "Let's find people around you"}
            </Text>
            <Text style={styles.subtitle}>
              {STRINGS.PROFILE_SETUP.PINCODE?.SUBTITLE || "We use this to prioritize nearby matches."}
            </Text>
          </View>

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
                  maxLength={8}
                  error={errors.pincode?.message || ''}
                  style={styles.input}
                />
              )}
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={STRINGS.PROFILE_SETUP.COMMON.CONTINUE || "Next"}
            onPress={handleSubmit(onSubmit)}
            variant="primary"
            disabled={!isValid}
            style={styles.button}
          />
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

