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
import { TextInput } from '../../../components/TextInput';
import { Button } from '../../../components/Button';
import { BackArrowIcon } from '../../../assets/icons/common/BackArrowIcon';
import LinearGradient from 'react-native-linear-gradient';
import { STRINGS } from '../../../constants/strings';
import { useProfileStore } from '../../../store/profile.store';
import type { AuthStackParamList } from '../../../navigation/types';
import { styles } from './styles';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';

type BasicDetailsHeightNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'BasicDetailsHeight'
>;

const TOTAL_STEPS = 8;
const CURRENT_STEP = 4;

const heightSchema = z.object({
  height: z
    .string()
    .min(1, 'Height is required')
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    }, 'Height must be a positive number'),
  unit: z.enum(['cm', 'ft']),
});

type HeightFormData = z.infer<typeof heightSchema>;

export const BasicDetailsHeightScreen: React.FC = () => {
  const navigation = useNavigation<BasicDetailsHeightNavigationProp>();
  const { height, setHeight, setCurrentStep } = useProfileStore();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isValid },
  } = useForm<HeightFormData>({
    resolver: zodResolver(heightSchema),
    mode: 'onChange',
    defaultValues: {
      height: height?.value ? height.value.toString() : '',
      unit: height?.unit || 'cm',
    },
  });

  const onSubmit = (data: HeightFormData) => {
    const numValue = parseFloat(data.height);
    setHeight(numValue, data.unit);
    setCurrentStep(CURRENT_STEP + 1);
    navigation.navigate('BasicDetailsEducation');
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
       <View style={styles.backgroundGlow}>
        <Svg height="100%" width="100%" style={{ position: 'absolute' }}>
          <Defs>
            <RadialGradient
              id="nameScreenGrad"
              cx="0%"
              cy="0%"
              rx="120%"
              ry="120%"
              fx="0%"
              fy="0%"
            >
              <Stop offset="0%" stopColor="#C87BF5" stopOpacity="0.2" />
              <Stop offset="70%" stopColor="#C87BF5" stopOpacity="0.06" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#nameScreenGrad)" />
        </Svg>
      </View>
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
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <BackArrowIcon size={48} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{STRINGS.PROFILE_SETUP.HEIGHT.TITLE}</Text>
            <Text style={styles.subtitle}>{STRINGS.PROFILE_SETUP.HEIGHT.SUBTITLE}</Text>
          </View>

          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <Controller
                control={control}
                name="height"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    type="number"
                    value={value}
                    onChangeText={onChange}
                    placeholder={STRINGS.PROFILE_SETUP.HEIGHT.PLACEHOLDER}
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
                    {['cm', 'ft'].map(unit => (
                      <TouchableOpacity
                        key={unit}
                        style={[
                          styles.unitButton,
                          value === unit && styles.unitButtonActive,
                        ]}
                        onPress={() =>
                          setValue('unit', unit as 'cm' | 'ft', {
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

