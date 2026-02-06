import React from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
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
import { useProfileStore } from '../../../store/profile.store';
import type { AuthStackParamList } from '../../../navigation/types';
import { styles } from './styles';

type NavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'BasicDetailsWeight'
>;

const TOTAL_STEPS = 8;
const CURRENT_STEP = 3;

const weightSchema = z.object({
  weight: z
    .string()
    .min(1, 'Weight is required')
    .refine(v => {
      const n = parseFloat(v);
      return !isNaN(n) && n > 0;
    }, 'Weight must be a positive number'),
  unit: z.enum(['kg', 'lbs']),
});

type WeightFormData = z.infer<typeof weightSchema>;

export const BasicDetailsWeightScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { weight, setWeight, setCurrentStep } = useProfileStore();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isValid },
  } = useForm<WeightFormData>({
    resolver: zodResolver(weightSchema),
    mode: 'onChange',
    defaultValues: {
      weight: weight?.value ? weight.value.toString() : '',
      unit: weight?.unit || 'kg',
    },
  });

  const onSubmit = (data: WeightFormData) => {
    setWeight(parseFloat(data.weight), data.unit);
    setCurrentStep(CURRENT_STEP + 1);
    navigation.navigate('BasicDetailsHeight');
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
              {STRINGS.PROFILE_SETUP.WEIGHT.TITLE}
            </Text>
            <Text style={styles.subtitle}>
              {STRINGS.PROFILE_SETUP.WEIGHT.SUBTITLE}
            </Text>
          </View>

          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <Controller
                control={control}
                name="weight"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder={STRINGS.PROFILE_SETUP.WEIGHT.PLACEHOLDER}
                    keyboardType="numeric"
                    autoFocus
                    style={styles.input}
                  />
                )}
              />

              <Controller
                control={control}
                name="unit"
                render={({ field: { value } }) => (
                  <View style={styles.unitToggle}>
                    {['kg', 'lbs'].map(unit => (
                      <TouchableOpacity
                        key={unit}
                        style={[
                          styles.unitButton,
                          value === unit && styles.unitButtonActive,
                        ]}
                        onPress={() =>
                          setValue('unit', unit as 'kg' | 'lbs', {
                            shouldValidate: true,
                          })
                        }
                      >
                        <Text
                          style={[
                            styles.unitText,
                            value === unit && styles.unitTextActive,
                          ]}
                        >
                          {unit}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              />
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={STRINGS.PROFILE_SETUP.COMMON.CONTINUE}
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

