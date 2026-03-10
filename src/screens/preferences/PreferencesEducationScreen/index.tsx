import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Pressable,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { Button } from '../../../components/Button';
import { ProfileScreenGradient } from '../../../components/ProfileScreenGradient';
import { BackArrowIcon } from '../../../assets/icons/common/BackArrowIcon';
import { STRINGS } from '../../../constants/strings';
import type { AuthStackParamList } from '../../../navigation/types';
import { usePreferencesStore } from '../../../store/preferences.store';
import { buildAddPreferencePayload, patchEditPreference } from '../../../modules/preferences/api';
import { styles } from './styles';

export type EducationOption =
  | 'phd_dr'
  | 'masters_or_equivalent'
  | 'degree_or_equivalent'
  | 'gcse_or_equivalent'
  | 'other';

const EDUCATION_OPTIONS: { value: EducationOption; labelKey: keyof typeof STRINGS.PREFERENCES_EDUCATION }[] = [
  { value: 'phd_dr', labelKey: 'PHD_DR' },
  { value: 'masters_or_equivalent', labelKey: 'MASTER' },
  { value: 'degree_or_equivalent', labelKey: 'A_LEVEL' },
  { value: 'gcse_or_equivalent', labelKey: 'GCSE' },
  { value: 'other', labelKey: 'OTHER' },
];

type PreferencesEducationNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'PreferencesEducation'
>;
type PreferencesEducationRouteProp = RouteProp<
  AuthStackParamList,
  'PreferencesEducation'
>;

export const PreferencesEducationScreen: React.FC = () => {
  const navigation = useNavigation<PreferencesEducationNavigationProp>();
  const route = useRoute<PreferencesEducationRouteProp>();
  const openedEditFromSummary = usePreferencesStore((s) => s.openedEditFromSummary);
  const returnToSummary = (route.params?.returnToSummary ?? false) || openedEditFromSummary;
  const preferredEducation = usePreferencesStore((s) => s.preferredEducation);
  const setPreferredEducation = usePreferencesStore((s) => s.setPreferredEducation);
  const setOpenedEditFromSummary = usePreferencesStore((s) => s.setOpenedEditFromSummary);
  const [selected, setSelected] = useState<EducationOption | null>(preferredEducation);

  useEffect(() => {
    setSelected(preferredEducation);
  }, [preferredEducation]);

  const handleSelect = (value: EducationOption) => {
    setSelected((prev) => (prev === value ? null : value));
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSave = async () => {
    if (selected === null) return;
    setPreferredEducation(selected);
    if (returnToSummary) {
      setOpenedEditFromSummary(false);
      try {
        const payload = buildAddPreferencePayload(usePreferencesStore.getState());
        await patchEditPreference(payload);
      } catch {
        // Ignore; global error UI handles failures.
      }
      navigation.goBack();
    } else {
      navigation.navigate('PreferencesEmployment', {});
    }
  };

  return (
    <View style={styles.wrapper}>
      <ProfileScreenGradient />
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'top']}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
          >
            <BackArrowIcon size={48} backgroundColor="#FFFFFF" strokeColor="#000000" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>
            {STRINGS.PREFERENCES_EDUCATION.TITLE}
          </Text>
          <Text style={styles.subtitle}>
            {STRINGS.PREFERENCES_EDUCATION.SUBTITLE}
          </Text>

          <ScrollView
            style={styles.optionsContainer}
            contentContainerStyle={styles.optionsContent}
            showsVerticalScrollIndicator={false}
          >
            {EDUCATION_OPTIONS.map(({ value, labelKey }) => (
              <Pressable
                key={value}
                onPress={() => handleSelect(value)}
                style={[
                  styles.optionRow,
                  selected === value ? styles.optionRowSelected : styles.optionRowUnselected,
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    selected === value && styles.optionTextSelected,
                  ]}
                >
                  {STRINGS.PREFERENCES_EDUCATION[labelKey]}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.actions}>
          <Button
            title={STRINGS.PREFERENCES.SAVE}
            onPress={handleSave}
            variant="primary"
            style={styles.primaryButton}
            disabled={selected === null}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};
