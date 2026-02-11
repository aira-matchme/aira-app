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
import { useProfileStore } from '../../../store/profile.store';
import type { AuthStackParamList } from '../../../navigation/types';
import { styles } from './styles';

type NavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'BasicDetailsWeight'
>;

const TOTAL_STEPS = 8;
const CURRENT_STEP = 3;

const GENDER_OPTIONS = [
  STRINGS.PROFILE_SETUP.GENDER.OPTIONS.MAN,
  STRINGS.PROFILE_SETUP.GENDER.OPTIONS.WOMAN,
  STRINGS.PROFILE_SETUP.GENDER.OPTIONS.NON_BINARY,
  STRINGS.PROFILE_SETUP.GENDER.OPTIONS.PREFER_NOT_TO_SAY,
];

export const BasicDetailsWeightScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { gender, setGender, setCurrentStep } = useProfileStore();
  const [selectedGender, setSelectedGender] = useState<string | null>(gender);

  const onSubmit = () => {
    if (selectedGender) {
      setGender(selectedGender);
      setCurrentStep(CURRENT_STEP + 1);
      navigation.navigate('BasicDetailsHeight');
    }
  };

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={[
          'rgba(221, 170, 249, 0)',
          'rgba(221, 170, 249, 0.18)',
          'rgba(221, 170, 249, 0.18)',
          'rgba(221, 170, 249, 0)',
        ]}
        locations={[0, 0.35, 0.65, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.backgroundGlow}
      />
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
            contentContainerStyle={styles.optionsScrollContainer}
            showsVerticalScrollIndicator={false}
            style={styles.optionsScrollView}
          >
            <View style={styles.optionsContainer}>
              {GENDER_OPTIONS.map((option, index) => {
                const isSelected = selectedGender === option;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.option,
                      isSelected && styles.optionSelected,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => setSelectedGender(option)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                      ]}
                    >
                      {option}
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

