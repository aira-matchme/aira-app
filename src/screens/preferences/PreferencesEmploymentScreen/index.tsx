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
import { InterestChipCheckIcon } from '../../../assets/icons/common/InterestChipCheckIcon';
import { STRINGS } from '../../../constants/strings';
import type { AuthStackParamList } from '../../../navigation/types';
import {
  usePreferencesStore,
  type EmploymentOption,
} from '../../../store/preferences.store';
import { buildAddPreferencePayload, patchEditPreference } from '../../../modules/preferences/api';
import { styles } from './styles';

const EMPLOYMENT_OPTIONS: {
  value: EmploymentOption;
  labelKey: keyof typeof STRINGS.PREFERENCES_EMPLOYMENT;
}[] = [
  { value: 'employed', labelKey: 'EMPLOYED' },
  { value: 'self_employed', labelKey: 'SELF_EMPLOYED' },
  { value: 'student', labelKey: 'STUDENT' },
  { value: 'unemployed', labelKey: 'UNEMPLOYED' },
];

type PreferencesEmploymentNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'PreferencesEmployment'
>;
type PreferencesEmploymentRouteProp = RouteProp<
  AuthStackParamList,
  'PreferencesEmployment'
>;

export const PreferencesEmploymentScreen: React.FC = () => {
  const navigation = useNavigation<PreferencesEmploymentNavigationProp>();
  const route = useRoute<PreferencesEmploymentRouteProp>();
  const openedEditFromSummary = usePreferencesStore((s) => s.openedEditFromSummary);
  const returnToSummary = (route.params?.returnToSummary ?? false) || openedEditFromSummary;
  const preferredEmployment = usePreferencesStore((s) => s.preferredEmployment);
  const setPreferredEmployment = usePreferencesStore((s) => s.setPreferredEmployment);
  const setOpenedEditFromSummary = usePreferencesStore((s) => s.setOpenedEditFromSummary);
  const [selected, setSelected] = useState<EmploymentOption[]>(
    preferredEmployment.length ? preferredEmployment : []
  );

  useEffect(() => {
    setSelected(preferredEmployment.length ? [...preferredEmployment] : []);
  }, [preferredEmployment]);

  const handleSelect = (value: EmploymentOption) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSave = async () => {
    if (selected.length === 0) return;
    setPreferredEmployment(selected);
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
      navigation.navigate('PreferencesIncome', {});
    }
  };

  return (
    <View style={styles.wrapper}>
      <ProfileScreenGradient />
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'top', 'bottom']}>
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
            {STRINGS.PREFERENCES_EMPLOYMENT.TITLE}
          </Text>
          <Text style={styles.subtitle}>
            {STRINGS.PREFERENCES_EMPLOYMENT.SUBTITLE}
          </Text>

          <ScrollView
            style={styles.optionsContainer}
            contentContainerStyle={styles.optionsContent}
            showsVerticalScrollIndicator={false}
          >
            {EMPLOYMENT_OPTIONS.map(({ value, labelKey }) => (
              <Pressable
                key={value}
                onPress={() => handleSelect(value)}
                style={[
                  styles.optionRow,
                  selected.includes(value) ? styles.optionRowSelected : styles.optionRowUnselected,
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    selected.includes(value) && styles.optionTextSelected,
                  ]}
                  numberOfLines={1}
                >
                  {STRINGS.PREFERENCES_EMPLOYMENT[labelKey]}
                </Text>
                <View
                  style={[
                    styles.checkbox,
                    selected.includes(value) && styles.checkboxSelected,
                  ]}
                >
                  {selected.includes(value) && (
                    <InterestChipCheckIcon size={14} color="#FFFFFF" />
                  )}
                </View>
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
            disabled={selected.length === 0}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};
