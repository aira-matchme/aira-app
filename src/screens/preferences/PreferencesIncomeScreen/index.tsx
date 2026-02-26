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
import { styles } from './styles';

export type IncomeOption =
  | 'eur_20k_30k'
  | 'eur_30k_40k'
  | 'eur_40k_50k'
  | 'eur_50k_plus'
  | 'prefer_not_to_say';

const INCOME_OPTIONS: {
  value: IncomeOption;
  labelKey: keyof typeof STRINGS.PREFERENCES_INCOME;
}[] = [
  { value: 'eur_20k_30k', labelKey: 'RANGE_20_30' },
  { value: 'eur_30k_40k', labelKey: 'RANGE_30_40' },
  { value: 'eur_40k_50k', labelKey: 'RANGE_40_50' },
  { value: 'eur_50k_plus', labelKey: 'ABOVE_50' },
  { value: 'prefer_not_to_say', labelKey: 'PREFER_NOT_TO_SAY' },
];

type PreferencesIncomeNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'PreferencesIncome'
>;
type PreferencesIncomeRouteProp = RouteProp<
  AuthStackParamList,
  'PreferencesIncome'
>;

export const PreferencesIncomeScreen: React.FC = () => {
  const navigation = useNavigation<PreferencesIncomeNavigationProp>();
  const route = useRoute<PreferencesIncomeRouteProp>();
  const openedEditFromSummary = usePreferencesStore((s) => s.openedEditFromSummary);
  const returnToSummary = (route.params?.returnToSummary ?? false) || openedEditFromSummary;
  const preferredIncome = usePreferencesStore((s) => s.preferredIncome);
  const setPreferredIncome = usePreferencesStore((s) => s.setPreferredIncome);
  const setOpenedEditFromSummary = usePreferencesStore((s) => s.setOpenedEditFromSummary);
  const [selected, setSelected] = useState<IncomeOption | null>(preferredIncome);

  useEffect(() => {
    setSelected(preferredIncome);
  }, [preferredIncome]);

  const handleSelect = (value: IncomeOption) => {
    setSelected((prev) => (prev === value ? null : value));
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSave = () => {
    if (selected === null) return;
    setPreferredIncome(selected);
    if (returnToSummary) {
      setOpenedEditFromSummary(false);
      navigation.goBack();
    } else {
      navigation.navigate('PreferencesMaritalStatus', {});
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
            {STRINGS.PREFERENCES_INCOME.TITLE}
          </Text>
          <Text style={styles.subtitle}>
            {STRINGS.PREFERENCES_INCOME.SUBTITLE}
          </Text>

          <ScrollView
            style={styles.optionsContainer}
            contentContainerStyle={styles.optionsContent}
            showsVerticalScrollIndicator={false}
          >
            {INCOME_OPTIONS.map(({ value, labelKey }) => (
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
                  numberOfLines={1}
                >
                  {STRINGS.PREFERENCES_INCOME[labelKey]}
                </Text>
                {/* <View
                  style={[
                    styles.checkbox,
                    selected === value && styles.checkboxSelected,
                  ]}
                >
                  {selected === value && (
                    <InterestChipCheckIcon size={14} color="#FFFFFF" />
                  )}
                </View> */}
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
