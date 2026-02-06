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

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<NameFormData>({
    resolver: zodResolver(nameSchema),
    mode: 'onChange',
    defaultValues: { name: name ?? '' },
  });

  const onSubmit = (data: NameFormData) => {
    setName(data.name.trim());
    setCurrentStep(CURRENT_STEP + 1);
    navigation.navigate('BasicDetailsDob');
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
     <LinearGradient
  colors={[
    'rgba(221, 170, 249, 0)',     // top fade
    'rgba(221, 170, 249, 0.12)',  // start glow
    'rgba(221, 170, 249, 0.22)',  // strongest center
    'rgba(221, 170, 249, 0.12)',  // end glow
    'rgba(221, 170, 249, 0)',     // bottom fade
  ]}
  locations={[0, 0.25, 0.5, 0.75, 1]}
  start={{ x: 0.5, y: 0 }}
  end={{ x: 0.5, y: 1 }}
  style={styles.backgroundGlow}
/>

      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={{ paddingTop: 16, paddingHorizontal: 20 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <BackArrowIcon size={48} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>
            {STRINGS.PROFILE_SETUP.NAME.TITLE}
          </Text>
          <Text style={styles.subtitle}>
            {STRINGS.PROFILE_SETUP.NAME.SUBTITLE}
          </Text>

          <View style={styles.inputWrapper}>
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
            title={STRINGS.PROFILE_SETUP.COMMON.CONTINUE}
            onPress={handleSubmit(onSubmit)}
            disabled={!isValid}
            variant="primary"
            style={styles.button}
          />
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

