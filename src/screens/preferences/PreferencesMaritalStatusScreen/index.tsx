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
import { usePreferencesStore } from '../../../store/preferences.store';
import { buildAddPreferencePayload, patchEditPreference } from '../../../modules/preferences/api';
import { styles } from './styles';

export type MaritalStatusOption =
  | 'never_married'
  | 'divorced'
  | 'widowed'
  | 'separated';

const MARITAL_STATUS_OPTIONS: {
  value: MaritalStatusOption;
  labelKey: keyof typeof STRINGS.PREFERENCES_MARITAL_STATUS;
}[] = [
  { value: 'never_married', labelKey: 'NEVER_MARRIED' },
  { value: 'divorced', labelKey: 'DIVORCED' },
  { value: 'widowed', labelKey: 'WIDOWED' },
  { value: 'separated', labelKey: 'SEPARATED' },
];

type PreferencesMaritalStatusNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'PreferencesMaritalStatus'
>;
type PreferencesMaritalStatusRouteProp = RouteProp<
  AuthStackParamList,
  'PreferencesMaritalStatus'
>;

export const PreferencesMaritalStatusScreen: React.FC = () => {
  const navigation = useNavigation<PreferencesMaritalStatusNavigationProp>();
  const route = useRoute<PreferencesMaritalStatusRouteProp>();
  const openedEditFromSummary = usePreferencesStore((s) => s.openedEditFromSummary);
  const returnToSummary = (route.params?.returnToSummary ?? false) || openedEditFromSummary;
  const preferredMaritalStatus = usePreferencesStore((s) => s.preferredMaritalStatus);
  const setPreferredMaritalStatus = usePreferencesStore((s) => s.setPreferredMaritalStatus);
  const setOpenedEditFromSummary = usePreferencesStore((s) => s.setOpenedEditFromSummary);

  const normalizePreferred = (raw: unknown): MaritalStatusOption[] => {
    if (!Array.isArray(raw)) return [];
    // API may send [["never_married"]] or ["never_married"]
    const first = raw[0];
    if (Array.isArray(first)) {
      return (first as unknown[]).filter(
        (v): v is MaritalStatusOption => typeof v === 'string'
      );
    }
    return (raw as unknown[]).filter(
      (v): v is MaritalStatusOption => typeof v === 'string'
    );
  };

  const [selected, setSelected] = useState<MaritalStatusOption[]>(() =>
    normalizePreferred(preferredMaritalStatus)
  );

  useEffect(() => {
    setSelected(normalizePreferred(preferredMaritalStatus));
  }, [preferredMaritalStatus]);

  const handleSelect = (value: MaritalStatusOption) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSave = async () => {
    if (selected.length === 0) return;
    setPreferredMaritalStatus(selected as any);
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
      navigation.navigate('PreferencesRelationshipIntent', {});
    }
  };

  return (
    <View style={styles.wrapper}>
      <ProfileScreenGradient />
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.safeArea} edges={['left', 'right','top']}>
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
            {STRINGS.PREFERENCES_MARITAL_STATUS.TITLE}
          </Text>
          <Text style={styles.subtitle}>
            {STRINGS.PREFERENCES_MARITAL_STATUS.SUBTITLE}
          </Text>

          <ScrollView
            style={styles.optionsContainer}
            contentContainerStyle={styles.optionsContent}
            showsVerticalScrollIndicator={false}
          >
            {MARITAL_STATUS_OPTIONS.map(({ value, labelKey }) => (
              <Pressable
                key={value}
                onPress={() => handleSelect(value)}
                style={[
                  styles.optionRow,
                  selected.includes(value)
                    ? styles.optionRowSelected
                    : styles.optionRowUnselected,
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    selected.includes(value) && styles.optionTextSelected,
                  ]}
                  numberOfLines={1}
                >
                  {STRINGS.PREFERENCES_MARITAL_STATUS[labelKey]}
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
