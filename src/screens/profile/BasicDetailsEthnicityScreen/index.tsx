import React, { useEffect } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '../../../components/Button';
import { BackArrowIcon } from '../../../assets/icons/common/BackArrowIcon';
import { useProfileStore } from '../../../store/profile.store';
import type { AuthStackParamList } from '../../../navigation/types';
import { ETHNICITY_OPTIONS } from '../../../constants/profile';
import { apiClient } from '../../../services/api/client';
import { endpoints } from '../../../services/api/endpoints';
import { getProfileApi } from '../../../modules/auth/api';
import { useAuthStore } from '../../../store/auth.store';
// import { styles } from './styles';
import { styles } from '../BasicDetailsEducationScreen/styles';
import { ProfileScreenGradient } from '../../../components/ProfileScreenGradient';

type NavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'BasicDetailsEthnicity'
>;

const CURRENT_STEP = 12;

const ethnicitySchema = z.object({
  // Optional field – empty/undefined is allowed
  ethnicity: z.string().optional(),
});

type EthnicityFormData = z.infer<typeof ethnicitySchema>;

export const BasicDetailsEthnicityScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { ethnicity, setEthnicity, setCurrentStep } = useProfileStore();
  const route = useRoute<any>();
  const fromEditProfile = route.params?.fromEditProfile === true;
  const authUser = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [isSaving, setIsSaving] = React.useState(false);

  const initialEthnicity = React.useMemo(() => {
    if (fromEditProfile && authUser) {
      const raw = (authUser as any)?.ethnicity;
      if (typeof raw === 'string') return raw;
    }
    return ethnicity || '';
  }, [fromEditProfile, authUser, ethnicity]);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isValid },
  } = useForm<EthnicityFormData>({
    resolver: zodResolver(ethnicitySchema),
    mode: 'onChange',
    defaultValues: {
      ethnicity: initialEthnicity,
    },
  });

  useEffect(() => {
    setValue('ethnicity', initialEthnicity);
  }, [initialEthnicity, setValue]);

  const onSubmit = async (data: EthnicityFormData) => {
    const selected = ETHNICITY_OPTIONS.find((o) => o.key === data.ethnicity);
    const groups = selected?.groups;

    if (fromEditProfile) {
      try {
        setIsSaving(true);
        await apiClient.patch(endpoints.user.editProfile, {
          ethnicity: groups ?? null,
        });

        const profile = await getProfileApi();
        if ((profile as any)?.data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setUser((profile as any).data);
        }

        navigation.goBack();
      } catch (error: any) {
        // Silent failure for now
      } finally {
        setIsSaving(false);
      }
      return;
    }

    setEthnicity(data.ethnicity || null);
    setCurrentStep(CURRENT_STEP + 1);
    navigation.navigate('BasicDetailsInterests');
  };

  return (
    <View style={styles.wrapper}>
      <ProfileScreenGradient />
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'top']}>
        <View style={styles.content}>
          <View style={{ paddingBottom: 16 }}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <BackArrowIcon size={48} />
            </TouchableOpacity>
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>What&apos;s your ethnicity?</Text>
            <Text style={styles.subtitle}>Optional – you can skip this for now.</Text>
          </View>

          <ScrollView
            contentContainerStyle={styles.optionsContainer}
            showsVerticalScrollIndicator={false}
            style={styles.optionsScrollView}
          >
            <Controller
              control={control}
              name="ethnicity"
              render={({ field: { value } }) => (
                <View style={styles.optionsContainer}>
                  {ETHNICITY_OPTIONS.map((option) => {
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
                          setValue('ethnicity', option.key, {
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
            title="Continue"
            onPress={handleSubmit(onSubmit)}
            variant="primary"
            disabled={!isValid || (fromEditProfile && isSaving)}
            loading={fromEditProfile && isSaving}
            style={styles.button}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

