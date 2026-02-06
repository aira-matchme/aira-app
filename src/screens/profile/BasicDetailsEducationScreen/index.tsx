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
import { STRINGS } from '../../../constants/strings';
import { useProfileStore } from '../../../store/profile.store';
import type { AuthStackParamList } from '../../../navigation/types';
import { styles } from './styles';

type NavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'BasicDetailsEducation'
>;

const TOTAL_STEPS = 8;
const CURRENT_STEP = 5;

// Keys are backend values
const EDUCATION_OPTIONS = [
  { key: 'phd_dr', label: STRINGS.PROFILE_SETUP.EDUCATION.OPTIONS.PHD },
  { key: 'masters_or_equivalent', label: STRINGS.PROFILE_SETUP.EDUCATION.OPTIONS.MASTER },
  { key: 'degree_or_equivalent', label: STRINGS.PROFILE_SETUP.EDUCATION.OPTIONS.A_LEVEL },
  { key: 'a_level_or_equivalent', label: STRINGS.PROFILE_SETUP.EDUCATION.OPTIONS.A_LEVEL },
  { key: 'gcse_or_equivalent', label: STRINGS.PROFILE_SETUP.EDUCATION.OPTIONS.GCSE },
  { key: 'other', label: STRINGS.PROFILE_SETUP.EDUCATION.OPTIONS.OTHER },
];

const educationSchema = z.object({
  education: z.string().min(1),
});

type EducationFormData = z.infer<typeof educationSchema>;

export const BasicDetailsEducationScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { education, setEducation, setCurrentStep } = useProfileStore();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isValid },
  } = useForm<EducationFormData>({
    resolver: zodResolver(educationSchema),
    mode: 'onChange',
    defaultValues: {
      education: education || '',
    },
  });

  const onSubmit = (data: EducationFormData) => {
    setEducation(data.education);
    setCurrentStep(CURRENT_STEP + 1);
    navigation.navigate('BasicDetailsEmployment');
  };

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={[
          'rgba(221,170,249,0)',
          'rgba(221,170,249,0.20)',
          'rgba(221,170,249,0.20)',
          'rgba(221,170,249,0)',
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
            <Text style={styles.title}>
              {STRINGS.PROFILE_SETUP.EDUCATION.TITLE}
            </Text>
            <Text style={styles.subtitle}>
              {STRINGS.PROFILE_SETUP.EDUCATION.SUBTITLE}
            </Text>
          </View>

          <Controller
            control={control}
            name="education"
            render={({ field: { value } }) => (
              <View style={styles.optionsContainer}>
                {EDUCATION_OPTIONS.map(option => {
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
                        setValue('education', option.key, {
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
            title={STRINGS.PROFILE_SETUP.COMMON.CONTINUE}
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

