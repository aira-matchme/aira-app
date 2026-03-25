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
import { cmToFeetInches } from '../../../modules/preferences/api';
import { buildAddPreferencePayload, patchEditPreference } from '../../../modules/preferences/api';
import { styles } from './styles';

const HEIGHT_MIN_CM = 120;
const HEIGHT_MAX_CM = 220;
const HEIGHT_STEP = 1;
const MIN_RANGE_CM = 1;

type PreferencesHeightNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'PreferencesHeight'
>;
type PreferencesHeightRouteProp = RouteProp<AuthStackParamList, 'PreferencesHeight'>;

export const PreferencesHeightScreen: React.FC = () => {
  const navigation = useNavigation<PreferencesHeightNavigationProp>();
  const route = useRoute<PreferencesHeightRouteProp>();
  const openedEditFromSummary = usePreferencesStore((s) => s.openedEditFromSummary);
  const returnToSummary = (route.params?.returnToSummary ?? false) || openedEditFromSummary;
  const preferredMinHeightcm = usePreferencesStore((s) => s.preferredMinHeightcm);
  const preferredMaxHeightcm = usePreferencesStore((s) => s.preferredMaxHeightcm);
  const setHeightRange = usePreferencesStore((s) => s.setHeightRange);
  const setOpenedEditFromSummary = usePreferencesStore((s) => s.setOpenedEditFromSummary);
  const [low, setLow] = useState(preferredMinHeightcm);
  const [high, setHigh] = useState(preferredMaxHeightcm);

  useEffect(() => {
    setLow(preferredMinHeightcm);
    setHigh(preferredMaxHeightcm);
  }, [preferredMinHeightcm, preferredMaxHeightcm]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSave = async () => {
    setHeightRange(low, high);
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
      navigation.navigate('PreferencesDistance', {});
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
            {STRINGS.PREFERENCES_HEIGHT.TITLE}
          </Text>
          <Text style={styles.subtitle}>
            {STRINGS.PREFERENCES_HEIGHT.SUBTITLE}
          </Text>

          <View style={styles.sliderContainer}>
            <RangeSliderWithLabels
              min={HEIGHT_MIN_CM}
              max={HEIGHT_MAX_CM}
              step={HEIGHT_STEP}
              minRange={MIN_RANGE_CM}
              low={low}
              high={high}
              onValueChanged={(l, h) => {
                setLow(l);
                setHigh(h);
              }}
              formatLabel={(value) => {
                const { feet, inches } = cmToFeetInches(value);
                return `${feet} ft ${inches} in`;
              }}
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
