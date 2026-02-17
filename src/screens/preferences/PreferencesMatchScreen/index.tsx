import React, { useState, useCallback } from 'react';
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
import LinearGradient from 'react-native-linear-gradient';

import { BackArrowIcon } from '../../../assets/icons/common/BackArrowIcon';
import { Button } from '../../../components/Button';
import { Thumb, Rail, RailSelected } from '../../../components/RangeSlider/RangeSliderParts';
import { RangeSliderWithLabels } from '../../../components/RangeSlider/RangeSliderWithLabels';
import { STRINGS } from '../../../constants/strings';
import {
  EDUCATION_OPTIONS,
  EMPLOYMENT_OPTIONS,
  INCOME_OPTIONS,
} from '../../../constants/profile';
import {
  PREFERENCE_CATEGORIES,
  GENDER_PREFERENCE_OPTIONS,
  AGE_MIN,
  AGE_MAX,
  HEIGHT_MIN,
  HEIGHT_MAX,
  DISTANCE_MIN,
  DISTANCE_MAX,
  type PreferenceCategoryKey,
} from '../../../modules/preferences/constants';
import type { AuthStackParamList } from '../../../navigation/types';
import { styles } from './styles';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'PreferencesMatch'>;

export const PreferencesMatchScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedCategory, setSelectedCategory] = useState<PreferenceCategoryKey>('gender');
  const [selectedGender, setSelectedGender] = useState<string | null>('man');
  const [selectedEducation, setSelectedEducation] = useState<string | null>(null);
  const [selectedEmployment, setSelectedEmployment] = useState<string | null>(null);
  const [selectedIncome, setSelectedIncome] = useState<string | null>(null);
  const [ageLow, setAgeLow] = useState(AGE_MIN);
  const [ageHigh, setAgeHigh] = useState(30);
  const [heightLow, setHeightLow] = useState(HEIGHT_MIN);
  const [heightHigh, setHeightHigh] = useState(180);
  const [distanceLow, setDistanceLow] = useState(DISTANCE_MIN);
  const [distanceHigh, setDistanceHigh] = useState(30);

  const renderThumb = useCallback(() => <Thumb />, []);
  const renderRail = useCallback(() => <Rail />, []);
  const renderRailSelected = useCallback(() => <RailSelected />, []);

  const formatAgeLabel = useCallback((v: number) => STRINGS.PREFERENCES.AGE_YEARS(v), []);
  const formatHeightLabel = useCallback((v: number) => STRINGS.PREFERENCES.HEIGHT_CM(v), []);
  const formatDistanceLabel = useCallback((v: number) => STRINGS.PREFERENCES.DISTANCE_MILES(v), []);

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleSave = () => {
    // TODO: Save preferences via API, then navigate to main app (Dashboard/Tabs)
    navigation.goBack();
  };

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={['#F3E8FF', '#F5E7FF', '#F3E8FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.4 }}
        style={styles.backgroundGradient}
      />

      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'top']}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <BackArrowIcon size={48} backgroundColor="#FFFFFF" strokeColor="#000000" />
          </TouchableOpacity>
        </View>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>
              {STRINGS.PREFERENCES.FINE_TUNE_TITLE}
            </Text>
            <Text style={styles.subtitle}>
              {STRINGS.PREFERENCES.FINE_TUNE_SUBTITLE}
            </Text>
          </View>

          <View style={styles.chipsRow}>
            {PREFERENCE_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                style={[styles.chip, selectedCategory === cat.key && styles.chipSelected]}
                onPress={() => setSelectedCategory(cat.key)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedCategory === cat.key && styles.chipTextSelected,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedCategory === 'gender' && (
            <View style={styles.optionsSection}>
              {GENDER_PREFERENCE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.optionButton,
                    selectedGender === opt.key && styles.optionButtonSelected,
                  ]}
                  onPress={() => setSelectedGender(opt.key)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedGender === opt.key && styles.optionTextSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {selectedCategory === 'education' && (
            <View style={styles.optionsSection}>
              {EDUCATION_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.optionButton,
                    selectedEducation === opt.key && styles.optionButtonSelected,
                  ]}
                  onPress={() => setSelectedEducation(opt.key)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedEducation === opt.key && styles.optionTextSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {selectedCategory === 'employment' && (
            <View style={styles.optionsSection}>
              {EMPLOYMENT_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.optionButton,
                    selectedEmployment === opt.key && styles.optionButtonSelected,
                  ]}
                  onPress={() => setSelectedEmployment(opt.key)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedEmployment === opt.key && styles.optionTextSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {selectedCategory === 'income' && (
            <View style={styles.optionsSection}>
              {INCOME_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.optionButton,
                    selectedIncome === opt.key && styles.optionButtonSelected,
                  ]}
                  onPress={() => setSelectedIncome(opt.key)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedIncome === opt.key && styles.optionTextSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {selectedCategory === 'age' && (
            <View style={styles.sliderSection}>
              <RangeSliderWithLabels
                min={AGE_MIN}
                max={AGE_MAX}
                step={1}
                minRange={1}
                low={ageLow}
                high={ageHigh}
                onValueChanged={(low, high) => {
                  setAgeLow(low);
                  setAgeHigh(high);
                }}
                formatLabel={formatAgeLabel}
                renderThumb={renderThumb}
                renderRail={renderRail}
                renderRailSelected={renderRailSelected}
              />
            </View>
          )}

          {selectedCategory === 'height' && (
            <View style={styles.sliderSection}>
              <RangeSliderWithLabels
                min={HEIGHT_MIN}
                max={HEIGHT_MAX}
                step={5}
                minRange={5}
                low={heightLow}
                high={heightHigh}
                onValueChanged={(low, high) => {
                  setHeightLow(low);
                  setHeightHigh(high);
                }}
                formatLabel={formatHeightLabel}
                renderThumb={renderThumb}
                renderRail={renderRail}
                renderRailSelected={renderRailSelected}
              />
            </View>
          )}

          {selectedCategory === 'distance' && (
            <View style={styles.sliderSection}>
              <RangeSliderWithLabels
                min={DISTANCE_MIN}
                max={DISTANCE_MAX}
                step={1}
                minRange={1}
                low={distanceLow}
                high={distanceHigh}
                onValueChanged={(low, high) => {
                  setDistanceLow(low);
                  setDistanceHigh(high);
                }}
                formatLabel={formatDistanceLabel}
                renderThumb={renderThumb}
                renderRail={renderRail}
                renderRailSelected={renderRailSelected}
              />
            </View>
          )}
        </ScrollView>

        <View style={styles.bottomContainer}>
          <View style={styles.bottomButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>
                {STRINGS.PREFERENCES.CANCEL}
              </Text>
            </TouchableOpacity>
            <Button
              title={STRINGS.PREFERENCES.SAVE}
              onPress={handleSave}
              variant="primary"
              style={styles.saveButton}
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};
