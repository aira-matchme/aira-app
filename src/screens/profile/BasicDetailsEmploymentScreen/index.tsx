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
import { EMPLOYMENT_OPTIONS } from '../../../constants/profile';
import { useProfileStore } from '../../../store/profile.store';
import type { AuthStackParamList } from '../../../navigation/types';
import { styles } from './styles';
import { ProfileScreenGradient } from '../../../components/ProfileScreenGradient';

type NavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'BasicDetailsEmployment'
>;

const TOTAL_STEPS = 8;
const CURRENT_STEP = 6;

const employmentSchema = z.object({
  employment: z.string().min(1, 'Please select an option'),
});

type EmploymentFormData = z.infer<typeof employmentSchema>;

export const BasicDetailsEmploymentScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { employment, setEmployment, setCurrentStep } = useProfileStore();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isValid },
  } = useForm<EmploymentFormData>({
    resolver: zodResolver(employmentSchema),
    mode: 'onChange',
    defaultValues: {
      employment: employment || '',
    },
  });

  const onSubmit = (data: EmploymentFormData) => {
    setEmployment(data.employment);
    setCurrentStep(CURRENT_STEP + 1);
    navigation.navigate('BasicDetailsIncome');
  };

  return (
    <View style={styles.wrapper}>
      <ProfileScreenGradient />
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
              {STRINGS.PROFILE_SETUP.EMPLOYMENT.TITLE}
            </Text>
            <Text style={styles.subtitle}>
              {STRINGS.PROFILE_SETUP.EMPLOYMENT.SUBTITLE}
            </Text>
          </View>

          <ScrollView
            contentContainerStyle={styles.optionsScrollContainer}
            showsVerticalScrollIndicator={false}
            style={styles.optionsScrollView}
          >
            <Controller
              control={control}
              name="employment"
              render={({ field: { value } }) => (
                <View style={styles.optionsContainer}>
                  {EMPLOYMENT_OPTIONS.map(option => {
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
                          setValue('employment', option.key, {
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
    </View>
  );
};

