import React from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextInput } from '../../../components/TextInput';
import { Button } from '../../../components/Button';
import { BackArrowIcon } from '../../../assets/icons/common/BackArrowIcon';
import { STRINGS } from '../../../constants/strings';
import { useProfileStore } from '../../../store/profile.store';
import type { AuthStackParamList } from '../../../navigation/types';
import { apiClient } from '../../../services/api/client';
import { endpoints } from '../../../services/api/endpoints';
import { getProfileApi } from '../../../modules/auth/api';
import { useAuthStore } from '../../../store/auth.store';
import { styles } from './styles';
import { ProfileScreenGradient } from '../../../components/ProfileScreenGradient';
import { PROFILE_SCREEN_EDGES } from '../profileScreenLayout';

type NavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'BasicDetailsName'
>;

const TOTAL_STEPS = 8;
const CURRENT_STEP = 1;

const nameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters'),
});

type NameFormData = z.infer<typeof nameSchema>;

export const BasicDetailsNameScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { name, setName, setCurrentStep } = useProfileStore();
  const route = useRoute<any>();
  const fromEditProfile = route.params?.fromEditProfile === true;
  const authUser = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [isSaving, setIsSaving] = React.useState(false);

  const initialName = React.useMemo(
    () =>
      fromEditProfile
        ? ((authUser as any)?.name as string | undefined) ?? name ?? ''
        : name ?? '',
    [fromEditProfile, authUser, name],
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<NameFormData>({
    resolver: zodResolver(nameSchema),
    mode: 'onChange',
    defaultValues: { name: initialName },
  });

  const onSubmit = async (data: NameFormData) => {
    const trimmedName = data.name.trim();

    if (fromEditProfile) {
      try {
        setIsSaving(true);
        const serverData: any = authUser ?? {};
        const payload: Record<string, any> = {
          nickName: trimmedName,
        };
        await apiClient.patch(endpoints.user.editProfile, payload);

        const updatedProfile = await getProfileApi();
        if ((updatedProfile as any)?.data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setUser((updatedProfile as any).data);
        }

        navigation.goBack();
      } catch (error: any) {
        // Error handled silently
      } finally {
        setIsSaving(false);
      }
      return;
    }

    setName(trimmedName);
    setCurrentStep(CURRENT_STEP + 1);
    navigation.navigate('BasicDetailsDob');
  };

  return (
    // <KeyboardAvoidingView
    //   style={styles.wrapper}
    //   behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    //   keyboardVerticalOffset={0}
    // >
    <KeyboardAvoidingView
  style={styles.wrapper}
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
>
      <ProfileScreenGradient />
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <SafeAreaView style={styles.safeArea} edges={PROFILE_SCREEN_EDGES}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
          >
            <BackArrowIcon size={48} backgroundColor="#F1ECFE" strokeColor="#000000" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.mainScroll}
          contentContainerStyle={styles.mainScrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formSection}>
            <Text style={styles.title}>
              {STRINGS.PROFILE_SETUP.NAME.TITLE}
            </Text>
            <Text style={styles.subtitle}>
              {STRINGS.PROFILE_SETUP.NAME.SUBTITLE}
            </Text>

            <View
              style={[
                styles.inputWrapper,
                errors.name?.message ? styles.inputWrapperWithError : null,
              ]}
            >
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder={STRINGS.PROFILE_SETUP.NAME.PLACEHOLDER}
                    autoFocus
                    error={errors.name?.message || ''}
                    style={styles.input}
                  />
                )}
              />
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title={fromEditProfile ? STRINGS.PREFERENCES.SAVE : STRINGS.PROFILE_SETUP.COMMON.CONTINUE}
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid || isSaving}
              variant="primary"
              loading={isSaving && fromEditProfile}
              style={styles.button}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

