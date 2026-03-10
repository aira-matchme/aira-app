import React, { useState } from 'react';
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

import { Button } from '../../../components/Button';
import { BackArrowIcon } from '../../../assets/icons/common/BackArrowIcon';
import { STRINGS } from '../../../constants/strings';
import { GENDER_OPTIONS } from '../../../constants/profile';
import { useProfileStore } from '../../../store/profile.store';
import type { AuthStackParamList } from '../../../navigation/types';
import { styles } from './styles';
import { ProfileScreenGradient } from '../../../components/ProfileScreenGradient';

type NavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'BasicDetailsWeight'
>;

const TOTAL_STEPS = 8;
const CURRENT_STEP = 3;

export const BasicDetailsWeightScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { gender, setGender, setCurrentStep } = useProfileStore();
  // Map legacy values to API keys (male, female, other)
  const legacyMap: Record<string, string> = {
    man: 'male', woman: 'female',
    Man: 'male', Woman: 'female'
  };
  const resolvedGender = gender
    ? (legacyMap[gender] ?? GENDER_OPTIONS.find(o => o.key === gender || o.label === gender)?.key ?? null)
    : null;
  const [selectedGender, setSelectedGender] = useState<string | null>(resolvedGender);

  const onSubmit = () => {
    if (selectedGender) {
      setGender(selectedGender);
      setCurrentStep(CURRENT_STEP + 1);
      navigation.navigate('BasicDetailsBodyType');
    }
  };

  return (
    <View style={styles.wrapper}>
      <ProfileScreenGradient />
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'top']}>
        <View style={{ paddingTop: 16, paddingHorizontal: 20 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <BackArrowIcon size={48} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {STRINGS.PROFILE_SETUP.GENDER.TITLE}
            </Text>
            <Text style={styles.subtitle}>
              {STRINGS.PROFILE_SETUP.GENDER.SUBTITLE}
            </Text>
          </View>

          <ScrollView
            // contentContainerStyle={styles.optionsScrollContainer}
            showsVerticalScrollIndicator={false}
            style={styles.optionsScrollView}
          >
            <View style={styles.optionsContainer}>
              {GENDER_OPTIONS.map((option) => {
                const isSelected = selectedGender === option.key;
                return (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.option,
                      isSelected && styles.optionSelected,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => setSelectedGender(option.key)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={STRINGS.PROFILE_SETUP.COMMON.CONTINUE}
            onPress={onSubmit}
            variant="primary"
            disabled={!selectedGender}
            style={styles.button}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

