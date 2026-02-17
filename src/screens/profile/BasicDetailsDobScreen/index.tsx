import React, { useRef } from 'react';
import {
  View,
  Text,
  StatusBar,
  ScrollView,
  TouchableOpacity,
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
import { getDobForMinimumAge } from '../../../utils/date';
import { STRINGS } from '../../../constants/strings';
import { DOB_DAYS, DOB_MONTHS, DOB_YEARS } from '../../../constants/profile';
import { useProfileStore } from '../../../store/profile.store';
import type { AuthStackParamList } from '../../../navigation/types';
import { styles } from './styles';

type BasicDetailsDobNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'BasicDetailsDob'
>;

const CURRENT_STEP = 2;

const ITEM_HEIGHT = 52;

// Validation
const dobSchema = z
  .object({
    day: z.number().min(1).max(31),
    month: z.number().min(1).max(12),
    year: z.number().min(1900).max(new Date().getFullYear()),
  })
  .refine(
    (value) => {
      const { isAtLeastAge } = require('../../../utils/date');
      return isAtLeastAge(value, 18);
    },
    STRINGS.PROFILE_SETUP.DOB.ERROR_MIN_AGE
  );

type DobFormData = z.infer<typeof dobSchema>;

export const BasicDetailsDobScreen: React.FC = () => {
  const navigation = useNavigation<BasicDetailsDobNavigationProp>();
  const { dateOfBirth, setDateOfBirth, setCurrentStep } = useProfileStore();

  const dayScrollRef = useRef<ScrollView | null>(null);
  const monthScrollRef = useRef<ScrollView | null>(null);
  const yearScrollRef = useRef<ScrollView | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isValid },
  } = useForm<DobFormData>({
    resolver: zodResolver(dobSchema),
    mode: 'onChange',
    defaultValues:
      dateOfBirth && dateOfBirth.day && dateOfBirth.month && dateOfBirth.year
        ? {
            day: dateOfBirth.day,
            month: dateOfBirth.month,
            year: dateOfBirth.year,
          }
        : getDobForMinimumAge(18),
  });

  const onContinue = (data: DobFormData) => {
    setDateOfBirth(data.day, data.month, data.year);
    setCurrentStep(CURRENT_STEP + 1);
    navigation.navigate('BasicDetailsWeight');
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
        locations={[0, 0.4, 0.6, 1]}
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
              {STRINGS.PROFILE_SETUP.DOB.TITLE}
            </Text>
            <Text style={styles.subtitle}>
              {STRINGS.PROFILE_SETUP.DOB.SUBTITLE}
            </Text>
          </View>

          <View style={styles.datePickerContainer}>
            <Controller
              control={control}
              name="day"
              render={({ field: { value } }) => (
                <View style={styles.dateColumn}>
                  <ScrollView
                    ref={dayScrollRef}
                    showsVerticalScrollIndicator={false}
                    snapToInterval={ITEM_HEIGHT}
                    decelerationRate="fast"
                    contentContainerStyle={styles.scrollContent}
                    onMomentumScrollEnd={(e) => {
                      const offsetY = e.nativeEvent.contentOffset.y;
                      let index = Math.round(offsetY / ITEM_HEIGHT);
                      if (index < 0) index = 0;
                      if (index >= DOB_DAYS.length) index = DOB_DAYS.length - 1;
                      const snappedDay = DOB_DAYS[index]!;
                      setValue('day', snappedDay, { shouldValidate: true });
                      dayScrollRef.current?.scrollTo({
                        y: index * ITEM_HEIGHT,
                        animated: true,
                      });
                    }}
                  >
                    {DOB_DAYS.map((day, index) => {
                      const selected = day === value;
                      return (
                        <TouchableOpacity
                          key={day}
                          style={[
                            styles.dateOption,
                            selected && styles.dateOptionSelected,
                          ]}
                          onPress={() => {
                            setValue('day', day, { shouldValidate: true });
                            dayScrollRef.current?.scrollTo({
                              y: index * ITEM_HEIGHT,
                              animated: true,
                            });
                          }}
                        >
                          <Text
                            style={[
                              styles.dateText,
                              selected && styles.dateTextSelected,
                            ]}
                          >
                            {day.toString().padStart(2, '0')}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
            />

            <Controller
              control={control}
              name="month"
              render={({ field: { value } }) => (
                <View style={styles.dateColumn}>
                  <ScrollView
                    ref={monthScrollRef}
                    showsVerticalScrollIndicator={false}
                    snapToInterval={ITEM_HEIGHT}
                    decelerationRate="fast"
                    contentContainerStyle={styles.scrollContent}
                    onMomentumScrollEnd={(e) => {
                      const offsetY = e.nativeEvent.contentOffset.y;
                      let index = Math.round(offsetY / ITEM_HEIGHT);
                      if (index < 0) index = 0;
                      if (index >= DOB_MONTHS.length) index = DOB_MONTHS.length - 1;
                      const snappedMonthValue = index + 1;
                      setValue('month', snappedMonthValue, {
                        shouldValidate: true,
                      });
                      monthScrollRef.current?.scrollTo({
                        y: index * ITEM_HEIGHT,
                        animated: true,
                      });
                    }}
                  >
                    {DOB_MONTHS.map((month, index) => {
                      const monthValue = index + 1;
                      const selected = monthValue === value;
                      return (
                        <TouchableOpacity
                          key={month}
                          style={[
                            styles.dateOption,
                            selected && styles.dateOptionSelected,
                          ]}
                          onPress={() => {
                            setValue('month', monthValue, {
                              shouldValidate: true,
                            });
                            monthScrollRef.current?.scrollTo({
                              y: index * ITEM_HEIGHT,
                              animated: true,
                            });
                          }}
                        >
                          <Text
                            style={[
                              styles.dateText,
                              selected && styles.dateTextSelected,
                            ]}
                          >
                            {month}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
            />

            <Controller
              control={control}
              name="year"
              render={({ field: { value } }) => (
                <View style={styles.dateColumn}>
                  <ScrollView
                    ref={yearScrollRef}
                    showsVerticalScrollIndicator={false}
                    snapToInterval={ITEM_HEIGHT}
                    decelerationRate="fast"
                    contentContainerStyle={styles.scrollContent}
                    onMomentumScrollEnd={(e) => {
                      const offsetY = e.nativeEvent.contentOffset.y;
                      let index = Math.round(offsetY / ITEM_HEIGHT);
                      if (index < 0) index = 0;
                      if (index >= DOB_YEARS.length) index = DOB_YEARS.length - 1;
                      const snappedYear = DOB_YEARS[index]!;
                      setValue('year', snappedYear, { shouldValidate: true });
                      yearScrollRef.current?.scrollTo({
                        y: index * ITEM_HEIGHT,
                        animated: true,
                      });
                    }}
                  >
                    {DOB_YEARS.map((year, index) => {
                      const selected = year === value;
                      return (
                        <TouchableOpacity
                          key={year}
                          style={[
                            styles.dateOption,
                            selected && styles.dateOptionSelected,
                          ]}
                          onPress={() => {
                            setValue('year', year, {
                              shouldValidate: true,
                            });
                            yearScrollRef.current?.scrollTo({
                              y: index * ITEM_HEIGHT,
                              animated: true,
                            });
                          }}
                        >
                          <Text
                            style={[
                              styles.dateText,
                              selected && styles.dateTextSelected,
                            ]}
                          >
                            {year}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={STRINGS.PROFILE_SETUP.COMMON.CONTINUE}
            onPress={handleSubmit(onContinue as any)}
            variant="primary"
            disabled={!isValid}
            style={styles.button}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

