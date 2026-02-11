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
  'BasicDetailsIncome'
>;

const TOTAL_STEPS = 9;
const CURRENT_STEP = 7;

// Keys are backend values
const INCOME_OPTIONS = [
  { key: 'eur_20k_30k', label: STRINGS.PROFILE_SETUP.FINAL.OPTIONS.BETWEEN_20000_AND_30000 },
  { key: 'eur_30k_40k', label: STRINGS.PROFILE_SETUP.FINAL.OPTIONS.BETWEEN_30000_AND_40000 },
  { key: 'eur_40k_50k', label: STRINGS.PROFILE_SETUP.FINAL.OPTIONS.BETWEEN_40000_AND_50000 },
  { key: 'eur_50k_plus', label: STRINGS.PROFILE_SETUP.FINAL.OPTIONS.OVER_50000 },
  { key: 'prefer_not_to_say', label: STRINGS.PROFILE_SETUP.EMPLOYMENT.OPTIONS.PREFER_NOT_TO_SAY },
];

const incomeSchema = z.object({
  income: z.string().min(1, 'Please select an option'),
});

type IncomeFormData = z.infer<typeof incomeSchema>;

export const BasicDetailsIncomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { finalChoice, setFinalChoice, setCurrentStep } = useProfileStore();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isValid },
  } = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    mode: 'onChange',
    defaultValues: {
      income: finalChoice || '',
    },
  });

  const onSubmit = (data: IncomeFormData) => {
    setFinalChoice(data.income);
    setCurrentStep(CURRENT_STEP + 1);
    navigation.navigate('BasicDetailsReligion');
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

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {STRINGS.PROFILE_SETUP.FINAL.TITLE}
            </Text>
            <Text style={styles.subtitle}>
              { STRINGS.PROFILE_SETUP.FINAL.SUBTITLE}
            </Text>
            <Text style={styles.subtitlesecondary}>
              { STRINGS.PROFILE_SETUP.FINAL.SUBTITLE_SECONDARY}
            </Text>
          </View>

          <ScrollView
            contentContainerStyle={styles.optionsScrollContainer}
            showsVerticalScrollIndicator={false}
            style={styles.optionsScrollView}
          >
            <Controller
              control={control}
              name="income"
              render={({ field: { value } }) => (
                <View style={styles.optionsContainer}>
                  {INCOME_OPTIONS.map(option => {
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
                          setValue('income', option.key, {
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

