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

const DISTANCE_MIN_MILES = 0;
const DISTANCE_MAX_MILES = 100;
const DISTANCE_STEP = 1;
// Only "max distance" should be adjustable; minimum is fixed at 0.
const MIN_RANGE_MILES = 0;

type PreferencesDistanceNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'PreferencesDistance'
>;
type PreferencesDistanceRouteProp = RouteProp<
  AuthStackParamList,
  'PreferencesDistance'
>;

export const PreferencesDistanceScreen: React.FC = () => {
  const navigation = useNavigation<PreferencesDistanceNavigationProp>();
  const route = useRoute<PreferencesDistanceRouteProp>();
  const openedEditFromSummary = usePreferencesStore((s) => s.openedEditFromSummary);
  const returnToSummary = (route.params?.returnToSummary ?? false) || openedEditFromSummary;
  const distanceMilesHigh = usePreferencesStore((s) => s.distanceMilesHigh);
  const setDistanceMiles = usePreferencesStore((s) => s.setDistanceMiles);
  const setOpenedEditFromSummary = usePreferencesStore((s) => s.setOpenedEditFromSummary);
  const [high, setHigh] = useState(distanceMilesHigh);

  useEffect(() => {
    setHigh(distanceMilesHigh);
  }, [distanceMilesHigh]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSave = async () => {
    setDistanceMiles(DISTANCE_MIN_MILES, high);
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
      navigation.navigate('PreferencesEducation', {});
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
            {STRINGS.PREFERENCES_DISTANCE.TITLE}
          </Text>
          <Text style={styles.subtitle}>
            {STRINGS.PREFERENCES_DISTANCE.SUBTITLE}
          </Text>

          <View style={styles.sliderContainer}>
            <RangeSliderWithLabels
              min={DISTANCE_MIN_MILES}
              max={DISTANCE_MAX_MILES}
              step={DISTANCE_STEP}
              minRange={MIN_RANGE_MILES}
              mode="singleHigh"
              fixedLow={DISTANCE_MIN_MILES}
              low={DISTANCE_MIN_MILES}
              high={high}
              onValueChanged={(l, h) => {
                setHigh(h);
              }}
              formatLabel={(value) => STRINGS.PREFERENCES.DISTANCE_MILES(value)}
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
