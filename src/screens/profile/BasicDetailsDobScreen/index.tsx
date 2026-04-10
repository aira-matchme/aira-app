import React, { useRef, useEffect } from 'react';
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
import { ProfileScreenGradient } from '../../../components/ProfileScreenGradient';

import { Button } from '../../../components/Button';
import { BackArrowIcon } from '../../../assets/icons/common/BackArrowIcon';
import { getDobForMinimumAge } from '../../../utils/date';
import { STRINGS } from '../../../constants/strings';
import { DOB_DAYS, DOB_MONTHS, DOB_YEARS } from '../../../constants/profile';
import { useProfileStore } from '../../../store/profile.store';
import type { AuthStackParamList } from '../../../navigation/types';
import { spacing } from '../../../theme';
import { styles } from './styles';
import { PROFILE_SCREEN_EDGES } from '../profileScreenLayout';

type BasicDetailsDobNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'BasicDetailsDob'
>;

const CURRENT_STEP = 2;

const ITEM_HEIGHT = 52;
const ROW_HEIGHT = ITEM_HEIGHT + spacing.sm; // option height + margin for scroll/snap
const VISIBLE_ROWS = 3;
const PICKER_VISIBLE_HEIGHT = ROW_HEIGHT * VISIBLE_ROWS;
const TOP_BOTTOM_SPACER = (PICKER_VISIBLE_HEIGHT - ROW_HEIGHT) / 2;

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
    watch,
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

  const dayValue = watch('day');
  const monthValue = watch('month');
  const yearValue = watch('year');

  // Align all three columns once on mount so selected row starts centered.
  // Do NOT rerun on every value change, or it will fight with user scrolling.
  useEffect(() => {
    const id = setTimeout(() => {
      const initialDay = dayValue ?? 1;
      const initialMonth = monthValue ?? 1;
      const initialYear = yearValue ?? DOB_YEARS[0];

      const dayIndex = Math.min(Math.max(initialDay - 1, 0), DOB_DAYS.length - 1);
      const monthIndex = Math.min(Math.max(initialMonth - 1, 0), DOB_MONTHS.length - 1);
      const yearIndex = Math.max(0, DOB_YEARS.indexOf(initialYear));

      dayScrollRef.current?.scrollTo({
        y: TOP_BOTTOM_SPACER + dayIndex * ROW_HEIGHT,
        animated: false,
      });
      monthScrollRef.current?.scrollTo({
        y: TOP_BOTTOM_SPACER + monthIndex * ROW_HEIGHT,
        animated: false,
      });
      yearScrollRef.current?.scrollTo({
        y: TOP_BOTTOM_SPACER + yearIndex * ROW_HEIGHT,
        animated: false,
      });
    }, 50);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onContinue = (data: DobFormData) => {
    setDateOfBirth(data.day, data.month, data.year);
    setCurrentStep(CURRENT_STEP + 1);
    navigation.navigate('BasicDetailsWeight');
  };

  return (
    <View style={styles.wrapper}>
      <ProfileScreenGradient />
      {/* <LinearGradient
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
      /> */}

      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <SafeAreaView style={styles.safeArea} edges={PROFILE_SCREEN_EDGES}>
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
                    snapToInterval={ROW_HEIGHT}
                    // Match year column for smoother scrolling
                    decelerationRate="fast"
                    snapToAlignment='center'
                    scrollEventThrottle={16}
                    bounces={false}
                    contentContainerStyle={styles.scrollContent}
                    onMomentumScrollEnd={(e) => {
                      const offsetY = e.nativeEvent.contentOffset.y;
                      let index = Math.round((offsetY - TOP_BOTTOM_SPACER) / ROW_HEIGHT);
                      if (index < 0) index = 0;
                      if (index >= DOB_DAYS.length) index = DOB_DAYS.length - 1;
                      const snappedDay = DOB_DAYS[index]!;
                      setValue('day', snappedDay, { shouldValidate: true });
                      // dayScrollRef.current?.scrollTo({
                      //   y: TOP_BOTTOM_SPACER + index * ROW_HEIGHT,
                      //   animated: true,
                      // });
                    }}
                  >
                    <View style={{ height: TOP_BOTTOM_SPACER }} />
                    {DOB_DAYS.map((day) => {
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
                            const idx = Math.min(
                              Math.max(DOB_DAYS.indexOf(day), 0),
                              DOB_DAYS.length - 1,
                            );
                            dayScrollRef.current?.scrollTo({
                              y: TOP_BOTTOM_SPACER + idx * ROW_HEIGHT,
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
                    <View style={{ height: TOP_BOTTOM_SPACER }} />
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
                    snapToInterval={ROW_HEIGHT}
                    // Match day/year columns for consistent feel
                    decelerationRate="fast"
                    snapToAlignment='center'
                    scrollEventThrottle={16}
                    bounces={false}
                    contentContainerStyle={styles.scrollContent}
                    onMomentumScrollEnd={(e) => {
                      const offsetY = e.nativeEvent.contentOffset.y;
                      let index = Math.round((offsetY - TOP_BOTTOM_SPACER) / ROW_HEIGHT);
                      if (index < 0) index = 0;
                      if (index >= DOB_MONTHS.length) index = DOB_MONTHS.length - 1;
                      const snappedMonthValue = index + 1;
                      setValue('month', snappedMonthValue, {
                        shouldValidate: true,
                      });
                      // monthScrollRef.current?.scrollTo({
                      //   y: TOP_BOTTOM_SPACER + index * ROW_HEIGHT,
                      //   animated: true,
                      // });
                    }}
                  >
                    <View style={{ height: TOP_BOTTOM_SPACER }} />
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
                            const idx = Math.min(
                              Math.max(index, 0),
                              DOB_MONTHS.length - 1,
                            );
                            monthScrollRef.current?.scrollTo({
                              y: TOP_BOTTOM_SPACER + idx * ROW_HEIGHT,
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
                    <View style={{ height: TOP_BOTTOM_SPACER }} />
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
                    snapToInterval={ROW_HEIGHT}
                    // Slightly slower deceleration for smoother year scrolling
                    decelerationRate="fast"
                    snapToAlignment='center'
                    scrollEventThrottle={16}
                    bounces={false}
                    contentContainerStyle={styles.scrollContent}
                    onMomentumScrollEnd={(e) => {
                      const offsetY = e.nativeEvent.contentOffset.y;
                      let index = Math.round((offsetY - TOP_BOTTOM_SPACER) / ROW_HEIGHT);
                      if (index < 0) index = 0;
                      if (index >= DOB_YEARS.length) index = DOB_YEARS.length - 1;
                      const snappedYear = DOB_YEARS[index]!;
                      setValue('year', snappedYear, { shouldValidate: true });
                      // yearScrollRef.current?.scrollTo({
                      //   y: TOP_BOTTOM_SPACER + index * ROW_HEIGHT,
                      //   // Use a small animation so the final snap feels less jerky
                      //   animated: true,
                      // });
                    }}
                  >
                    <View style={{ height: TOP_BOTTOM_SPACER }} />
                    {DOB_YEARS.map((year) => {
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
                            const idx = Math.min(
                              Math.max(DOB_YEARS.indexOf(year), 0),
                              DOB_YEARS.length - 1,
                            );
                            yearScrollRef.current?.scrollTo({
                              y: TOP_BOTTOM_SPACER + idx * ROW_HEIGHT,
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
                    <View style={{ height: TOP_BOTTOM_SPACER }} />
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

