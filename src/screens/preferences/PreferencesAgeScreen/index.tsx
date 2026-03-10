import React, { useState, useEffect } from 'react';
import { View, Text, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { Button } from '../../../components/Button';
import { ProfileScreenGradient } from '../../../components/ProfileScreenGradient';
import { BackArrowIcon } from '../../../assets/icons/common/BackArrowIcon';
import { RangeSliderWithLabels } from '../../../components/RangeSlider/RangeSliderWithLabels';
import { Thumb, Rail, RailSelected } from '../../../components/RangeSlider/RangeSliderParts';
import { STRINGS } from '../../../constants/strings';
import type { AuthStackParamList } from '../../../navigation/types';
import { usePreferencesStore } from '../../../store/preferences.store';
import { buildAddPreferencePayload, patchEditPreference } from '../../../modules/preferences/api';
import { styles } from './styles';

const AGE_MIN = 18;
const AGE_MAX = 60;
const AGE_STEP = 1;
const MIN_RANGE = 1;

type PreferencesAgeNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'PreferencesAge'
>;
type PreferencesAgeRouteProp = RouteProp<AuthStackParamList, 'PreferencesAge'>;

export const PreferencesAgeScreen: React.FC = () => {
  const navigation = useNavigation<PreferencesAgeNavigationProp>();
  const route = useRoute<PreferencesAgeRouteProp>();
  const openedEditFromSummary = usePreferencesStore((s) => s.openedEditFromSummary);
  const returnToSummary = (route.params?.returnToSummary ?? false) || openedEditFromSummary;
  const preferredMinAge = usePreferencesStore((s) => s.preferredMinAge);
  const preferredMaxAge = usePreferencesStore((s) => s.preferredMaxAge);
  const setAgeRange = usePreferencesStore((s) => s.setAgeRange);
  const setOpenedEditFromSummary = usePreferencesStore((s) => s.setOpenedEditFromSummary);
  const [low, setLow] = useState(preferredMinAge);
  const [high, setHigh] = useState(preferredMaxAge);

  useEffect(() => {
    setLow(preferredMinAge);
    setHigh(preferredMaxAge);
  }, [preferredMinAge, preferredMaxAge]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSave = async () => {
    setAgeRange(low, high);
    if (returnToSummary) {
      setOpenedEditFromSummary(false);
      try {
        const payload = buildAddPreferencePayload(usePreferencesStore.getState());
        await patchEditPreference(payload);
      } catch {
        // Ignore here; global handlers will surface errors.
      }
      navigation.goBack();
    } else {
      navigation.navigate('PreferencesHeight', {});
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
            {STRINGS.PREFERENCES_AGE.TITLE}
          </Text>
          <Text style={styles.subtitle}>
            {STRINGS.PREFERENCES_AGE.SUBTITLE}
          </Text>

          <View style={styles.sliderContainer}>
            <RangeSliderWithLabels
              min={AGE_MIN}
              max={AGE_MAX}
              step={AGE_STEP}
              minRange={MIN_RANGE}
              low={low}
              high={high}
              onValueChanged={(l, h) => {
                setLow(l);
                setHigh(h);
              }}
              formatLabel={(value) => STRINGS.PREFERENCES.AGE_YEARS(value)}
              renderThumb={() => <Thumb />}
              renderRail={() => <Rail />}
              renderRailSelected={() => <RailSelected />}
            />
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            title={STRINGS.PREFERENCES.SAVE}
            onPress={handleSave}
            variant="primary"
            style={styles.primaryButton}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};
