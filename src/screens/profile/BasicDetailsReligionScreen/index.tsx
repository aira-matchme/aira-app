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
import { RELIGION_OPTIONS } from '../../../constants/profile';
import { styles } from './styles';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

type NavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'BasicDetailsReligion'
>;

const TOTAL_STEPS = 9;
const CURRENT_STEP = 8;

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


