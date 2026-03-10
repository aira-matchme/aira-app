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
import LinearGradient from 'react-native-linear-gradient';

import { Button } from '../../../components/Button';
import { BackArrowIcon } from '../../../assets/icons/common/BackArrowIcon';
import { useProfileStore } from '../../../store/profile.store';
import type { AuthStackParamList } from '../../../navigation/types';
import { RELIGION_OPTIONS } from '../../../constants/profile';
import { STRINGS } from '../../../constants/strings';
import { apiClient } from '../../../services/api/client';
import { endpoints } from '../../../services/api/endpoints';
import { getProfileApi } from '../../../modules/auth/api';
import { useAuthStore } from '../../../store/auth.store';
import { styles } from './styles';
import { ProfileScreenGradient } from '../../../components/ProfileScreenGradient';

type NavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'BasicDetailsReligion'
>;

const TOTAL_STEPS = 9;
const CURRENT_STEP = 9;

const religionSchema = z.object({
  religion: z.string().min(1),
});

type ReligionFormData = z.infer<typeof religionSchema>;

export const BasicDetailsReligionScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { religion, setReligion, setCurrentStep } = useProfileStore();
  const route = useRoute<any>();
  const fromEditProfile = route.params?.fromEditProfile === true;
  const authUser = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [isSaving, setIsSaving] = React.useState(false);

  const initialReligion = React.useMemo(() => {
    if (fromEditProfile && authUser) {
      const raw = (authUser as any)?.religion;
      if (typeof raw === 'string') return raw;
    }
    return religion || '';
  }, [fromEditProfile, authUser, religion]);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isValid },
  } = useForm<ReligionFormData>({
    resolver: zodResolver(religionSchema),
    mode: 'onChange',
    defaultValues: {
      religion: initialReligion,
    },
  });

  useEffect(() => {
    setValue('religion', initialReligion);
  }, [initialReligion, setValue]);

  const onSubmit = async (data: ReligionFormData) => {
    if (fromEditProfile) {
      try {
        setIsSaving(true);
        await apiClient.patch(endpoints.user.editProfile, {
          religion: data.religion,
        });

        const profile = await getProfileApi();
        if ((profile as any)?.data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setUser((profile as any).data);
        }

        navigation.goBack();
      } catch (error: any) {
        // Error handled silently
      } finally {
        setIsSaving(false);
      }
      return;
    }

    setReligion(data.religion);
    setCurrentStep(CURRENT_STEP + 1);
    navigation.navigate('BasicDetailsMaritalStatus');
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
            <Text style={styles.title}>What are your religious beliefs?</Text>
            <Text style={styles.subtitle}>
              Choose the option that best describes you. This helps us understand your
              background and preferences.
            </Text>
          </View>

          <ScrollView
            contentContainerStyle={styles.optionsScrollContainer}
            showsVerticalScrollIndicator={false}
            style={styles.optionsScrollView}
          >
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
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={fromEditProfile ? STRINGS.PREFERENCES.SAVE : STRINGS.PROFILE_SETUP.COMMON.CONTINUE}
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


