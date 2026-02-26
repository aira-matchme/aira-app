import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Pressable,
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
import { styles } from './styles';

type PreferencesMatchNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'PreferencesMatch'
>;
type PreferencesMatchRouteProp = RouteProp<AuthStackParamList, 'PreferencesMatch'>;

export type GenderOption = 'man' | 'woman';

export const PreferencesMatchScreen: React.FC = () => {
  const navigation = useNavigation<PreferencesMatchNavigationProp>();
  const route = useRoute<PreferencesMatchRouteProp>();
  const openedEditFromSummary = usePreferencesStore((s) => s.openedEditFromSummary);
  const returnToSummary = (route.params?.returnToSummary ?? false) || openedEditFromSummary;
  const lookingForGender = usePreferencesStore((s) => s.lookingForGender);
  const setLookingForGender = usePreferencesStore((s) => s.setLookingForGender);
  const setOpenedEditFromSummary = usePreferencesStore((s) => s.setOpenedEditFromSummary);
  const [selected, setSelected] = useState<GenderOption | null>(
    lookingForGender.length > 0 ? lookingForGender[0] : null
  );

  useEffect(() => {
    setSelected(lookingForGender.length > 0 ? lookingForGender[0] : null);
  }, [lookingForGender]);

  const handleSelect = (value: GenderOption) => {
    setSelected((prev) => (prev === value ? null : value));
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSave = () => {
    setLookingForGender(selected ? [selected] : []);
    if (returnToSummary) {
      setOpenedEditFromSummary(false);
      navigation.goBack();
    } else {
      navigation.navigate('PreferencesAge', {});
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
            {STRINGS.PREFERENCES_GENDER.TITLE}
          </Text>
          <Text style={styles.subtitle}>
            {STRINGS.PREFERENCES_GENDER.SUBTITLE}
          </Text>

          <View style={styles.optionsContainer}>
            <Pressable
              onPress={() => handleSelect('man')}
              style={[
                styles.optionRow,
                selected === 'man' ? styles.optionRowSelected : styles.optionRowUnselected,
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  selected === 'man' && styles.optionTextSelected,
                ]}
              >
                {STRINGS.PREFERENCES_GENDER.MAN}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => handleSelect('woman')}
              style={[
                styles.optionRow,
                selected === 'woman' ? styles.optionRowSelected : styles.optionRowUnselected,
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  selected === 'woman' && styles.optionTextSelected,
                ]}
              >
                {STRINGS.PREFERENCES_GENDER.WOMAN}
              </Text>
            </Pressable>
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
