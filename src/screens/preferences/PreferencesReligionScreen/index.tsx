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
import { RELIGION_OPTIONS, type ReligionApiValue } from '../../../constants/profile';
import type { AuthStackParamList } from '../../../navigation/types';
import { usePreferencesStore } from '../../../store/preferences.store';
import { buildAddPreferencePayload, patchEditPreference } from '../../../modules/preferences/api';
import { styles } from './styles';

type PreferencesReligionNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'PreferencesReligion'
>;

type PreferencesReligionRouteProp = RouteProp<
  AuthStackParamList,
  'PreferencesReligion'
>;

export const PreferencesReligionScreen: React.FC = () => {
  const navigation = useNavigation<PreferencesReligionNavigationProp>();
  const route = useRoute<PreferencesReligionRouteProp>();
  const openedEditFromSummary = usePreferencesStore((s) => s.openedEditFromSummary);
  const returnToSummary = (route.params?.returnToSummary ?? false) || openedEditFromSummary;
  const preferredReligions = usePreferencesStore((s) => s.preferredReligions);
  const setPreferredReligions = usePreferencesStore((s) => s.setPreferredReligions);
  const setOpenedEditFromSummary = usePreferencesStore((s) => s.setOpenedEditFromSummary);

  const [selected, setSelected] = useState<ReligionApiValue[]>(
    (preferredReligions as ReligionApiValue[]) ?? []
  );

  useEffect(() => {
    setSelected((preferredReligions as ReligionApiValue[]) ?? []);
  }, [preferredReligions]);

  const handleSelect = (value: ReligionApiValue) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSave = async () => {
    if (selected.length === 0) return;
    setPreferredReligions(selected);
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
      navigation.navigate('PreferencesMaritalStatus', {});
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
            {STRINGS.PREFERENCES_RELIGION.TITLE}
          </Text>
          <Text style={styles.subtitle}>
            {STRINGS.PREFERENCES_RELIGION.SUBTITLE}
          </Text>

          <ScrollView
            style={styles.optionsContainer}
            contentContainerStyle={styles.optionsContent}
            showsVerticalScrollIndicator={false}
          >
            {RELIGION_OPTIONS.map((option) => (
              <Pressable
                key={option.key}
                onPress={() => handleSelect(option.key)}
                style={[
                  styles.optionRow,
                  selected.includes(option.key)
                    ? styles.optionRowSelected
                    : styles.optionRowUnselected,
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    selected.includes(option.key) && styles.optionTextSelected,
                  ]}
                  numberOfLines={1}
                >
                  {option.label}
                </Text>
                <View
                  style={[
                    styles.checkbox,
                    selected.includes(option.key) && styles.checkboxSelected,
                  ]}
                >
                  {selected.includes(option.key) && (
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

