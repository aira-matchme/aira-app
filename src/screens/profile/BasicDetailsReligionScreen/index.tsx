import React from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import LinearGradient from 'react-native-linear-gradient';

import { Button } from '../../../components/Button';
import { BackArrowIcon } from '../../../assets/icons/common/BackArrowIcon';
import { useProfileStore } from '../../../store/profile.store';
import type { AuthStackParamList } from '../../../navigation/types';
import { styles } from './styles';

type NavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'BasicDetailsReligion'
>;

const TOTAL_STEPS = 9;
const CURRENT_STEP = 8;

const RELIGION_OPTIONS = [
  { key: 'christian', label: 'Christian' },
  { key: 'judaism', label: 'Judaism' },
  { key: 'islam', label: 'Islam' },
  { key: 'hinduism', label: 'Hinduism' },
  { key: 'buddhism', label: 'Buddhism' },
  { key: 'sikhism', label: 'Sikhism' },
  { key: 'agnostic', label: 'Agnostic' },
  { key: 'other', label: 'Other' },
  { key: 'none', label: 'No Religion' },
];

const religionSchema = z.object({
  religion: z.string().min(1),
});

type ReligionFormData = z.infer<typeof religionSchema>;

export const BasicDetailsReligionScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { religion, setReligion, setCurrentStep } = useProfileStore();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isValid },
  } = useForm<ReligionFormData>({
    resolver: zodResolver(religionSchema),
    mode: 'onChange',
    defaultValues: {
      religion: religion || '',
    },
  });

  const onSubmit = (data: ReligionFormData) => {
    setReligion(data.religion);
    setCurrentStep(CURRENT_STEP + 1);
    navigation.navigate('BasicDetailsPincode');
  };

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={[
          'rgba(221, 170, 249, 0)',
          'rgba(221, 170, 249, 0.18)',
          'rgba(221, 170, 249, 0.18)',
          'rgba(221, 170, 249, 0)',
        ]}
        locations={[0, 0.35, 0.65, 1]}
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

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>What are your religious beliefs?</Text>
            <Text style={styles.subtitle}>
              Choose the option that best describes you. This helps us understand your
              background and preferences.
            </Text>
          </View>

          <Controller
            control={control}
            name="religion"
            render={({ field: { value } }) => (
              <View style={styles.optionsContainer}>
                {RELIGION_OPTIONS.map(option => {
                  const selected = value === option.key;

                  return (
                    <TouchableOpacity
                      key={option.key}
                      style={[
                        styles.option,
                        selected && styles.optionSelected,
                      ]}
                      activeOpacity={0.8}
                      onPress={() =>
                        setValue('religion', option.key, {
                          shouldValidate: true,
                        })
                      }
                    >
                      <Text
                        style={[
                          styles.optionText,
                          selected && styles.optionTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          />
        </ScrollView>

        <View style={styles.buttonContainer}>
          <Button
            title="Next"
            onPress={handleSubmit(onSubmit)}
            variant="primary"
            disabled={!isValid}
            style={styles.button}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};


