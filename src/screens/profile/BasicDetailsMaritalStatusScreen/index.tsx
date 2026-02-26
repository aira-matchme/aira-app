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

import { Button } from '../../../components/Button';
import { BackArrowIcon } from '../../../assets/icons/common/BackArrowIcon';
import { STRINGS } from '../../../constants/strings';
import { useProfileStore } from '../../../store/profile.store';
import type { AuthStackParamList } from '../../../navigation/types';
import { MARITAL_OPTIONS } from '../../../constants/profile';
import { styles } from './styles';
import { ProfileScreenGradient } from '../../../components/ProfileScreenGradient';

type NavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'BasicDetailsMaritalStatus'
>;

const CURRENT_STEP = 9;

const maritalSchema = z.object({
  maritalStatus: z.string().min(1),
});

type MaritalFormData = z.infer<typeof maritalSchema>;

export const BasicDetailsMaritalStatusScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { maritalStatus, setMaritalStatus, setCurrentStep } = useProfileStore();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isValid },
  } = useForm<MaritalFormData>({
    resolver: zodResolver(maritalSchema),
    mode: 'onChange',
    defaultValues: {
      maritalStatus: maritalStatus || '',
    },
  });

  const onSubmit = (data: MaritalFormData) => {
    setMaritalStatus(data.maritalStatus);
    setCurrentStep(CURRENT_STEP + 1);
    navigation.navigate('BasicDetailsChildren');
  };

  return (
    <View style={styles.wrapper}>
      <ProfileScreenGradient />
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'top']}>
        <View style={styles.content}>
        <View style={{ paddingBottom: 16}}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <BackArrowIcon size={48} />
          </TouchableOpacity>
        </View>
          <View style={styles.header}>
            <Text style={styles.title}>
              {STRINGS.PROFILE_SETUP.MARITAL.TITLE}
            </Text>
            <Text style={styles.subtitle}>
              {STRINGS.PROFILE_SETUP.MARITAL.SUBTITLE}
            </Text>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.optionsScrollView}
          >
            <Controller
              control={control}
              name="maritalStatus"
              render={({ field: { value } }) => (
                <View style={styles.optionsContainer}>
                  {MARITAL_OPTIONS.map((option) => {
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
                          setValue('maritalStatus', option.key, {
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
