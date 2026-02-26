import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button } from '../../../components/Button';
import { BackArrowIcon } from '../../../assets/icons/common/BackArrowIcon';
import { STRINGS } from '../../../constants/strings';
import { useProfileStore } from '../../../store/profile.store';
import type { AuthStackParamList } from '../../../navigation/types';
import { colors } from '../../../theme';
import { styles } from './styles';
import { ProfileScreenGradient } from '../../../components/ProfileScreenGradient';

type BasicDetailsHeightNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'BasicDetailsHeight'
>;

const CURRENT_STEP = 4;
const ROW_HEIGHT = 52;
const PICKER_VISIBLE_HEIGHT = 180;

const FEET_OPTIONS = [3, 4, 5, 6, 7];
const INCHES_OPTIONS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

function feetInchesToCm(feet: number, inches: number): number {
  const totalInches = feet * 12 + inches;
  return Math.round(totalInches * 2.54 * 10) / 10;
}

function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet: Math.max(3, Math.min(7, feet)), inches: Math.max(0, Math.min(11, inches)) };
}

export const BasicDetailsHeightScreen: React.FC = () => {
  const navigation = useNavigation<BasicDetailsHeightNavigationProp>();
  const { height, setHeight, setCurrentStep } = useProfileStore();

  const feetScrollRef = useRef<ScrollView | null>(null);
  const inchesScrollRef = useRef<ScrollView | null>(null);

  const [feetIndex, setFeetIndex] = React.useState(2);
  const [inchesIndex, setInchesIndex] = React.useState(4);

  useEffect(() => {
    if (height?.value != null && height.unit === 'cm') {
      const { feet, inches } = cmToFeetInches(height.value);
      const fi = FEET_OPTIONS.indexOf(feet);
      const ii = INCHES_OPTIONS.indexOf(inches);
      if (fi >= 0) setFeetIndex(fi);
      if (ii >= 0) setInchesIndex(ii);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      feetScrollRef.current?.scrollTo({
        y: feetIndex * ROW_HEIGHT + feetIndex * 8,
        animated: false,
      });
      inchesScrollRef.current?.scrollTo({
        y: inchesIndex * ROW_HEIGHT + inchesIndex * 8,
        animated: false,
      });
    }, 50);
    return () => clearTimeout(t);
  }, [feetIndex, inchesIndex]);

  const feet = FEET_OPTIONS[feetIndex] ?? 5;
  const inches = INCHES_OPTIONS[inchesIndex] ?? 4;

  const onSubmit = () => {
    const cm = feetInchesToCm(feet, inches);
    setHeight(cm, 'cm');
    setCurrentStep(CURRENT_STEP + 1);
    navigation.navigate('BasicDetailsEducation');
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <ProfileScreenGradient />
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'top']}>
        <View style={styles.content}>
        <View style={{ paddingBottom: 16}}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <BackArrowIcon size={48} />
          </TouchableOpacity>
        </View>
          <View style={styles.header}>
            <Text style={styles.title}>{STRINGS.PROFILE_SETUP.HEIGHT.TITLE}</Text>
            <Text style={styles.subtitle}>
              {STRINGS.PROFILE_SETUP.HEIGHT.SUBTITLE}
            </Text>
          </View>

          <View style={styles.pickerContainer}>
            <View style={styles.pickerColumn}>
              <ScrollView
                ref={feetScrollRef}
                showsVerticalScrollIndicator={false}
                snapToInterval={ROW_HEIGHT + 8}
                decelerationRate="fast"
                contentContainerStyle={styles.scrollContent}
                onMomentumScrollEnd={(e) => {
                  const offsetY = e.nativeEvent.contentOffset.y;
                  let index = Math.round(offsetY / (ROW_HEIGHT + 8));
                  index = Math.max(0, Math.min(FEET_OPTIONS.length - 1, index));
                  setFeetIndex(index);
                  feetScrollRef.current?.scrollTo({
                    y: index * (ROW_HEIGHT + 8),
                    animated: false,
                  });
                }}
              >
                {FEET_OPTIONS.map((ft, index) => {
                  const selected = index === feetIndex;
                  return (
                    <TouchableOpacity
                      key={ft}
                      style={[
                        styles.pickerRow,
                        selected && styles.pickerRowSelected,
                      ]}
                      onPress={() => setFeetIndex(index)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.pickerText,
                          selected && styles.pickerTextSelected,
                        ]}
                      >
                        {ft}ft
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.pickerColumn}>
              <ScrollView
                ref={inchesScrollRef}
                showsVerticalScrollIndicator={false}
                snapToInterval={ROW_HEIGHT + 8}
                decelerationRate="fast"
                contentContainerStyle={styles.scrollContent}
                onMomentumScrollEnd={(e) => {
                  const offsetY = e.nativeEvent.contentOffset.y;
                  let index = Math.round(offsetY / (ROW_HEIGHT + 8));
                  index = Math.max(0, Math.min(INCHES_OPTIONS.length - 1, index));
                  setInchesIndex(index);
                  inchesScrollRef.current?.scrollTo({
                    y: index * (ROW_HEIGHT + 8),
                    animated: false,
                  });
                }}
              >
                {INCHES_OPTIONS.map((inch, index) => {
                  const selected = index === inchesIndex;
                  return (
                    <TouchableOpacity
                      key={inch}
                      style={[
                        styles.pickerRow,
                        selected && styles.pickerRowSelected,
                      ]}
                      onPress={() => setInchesIndex(index)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.pickerText,
                          selected && styles.pickerTextSelected,
                        ]}
                      >
                        {inch}in
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={STRINGS.PROFILE_SETUP.COMMON.CONTINUE}
            onPress={onSubmit}
            variant="primary"
            style={styles.button}
          />
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};
