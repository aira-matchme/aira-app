import React from 'react';
import { View, Text, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../../../components/Button';
import { ProfileScreenGradient } from '../../../components/ProfileScreenGradient';
import { BackArrowIcon } from '../../../assets/icons/common/BackArrowIcon';
import { ShapeMatchesIcon } from '../../../assets/icons/common/ShapeMatchesIcon';
import { STRINGS } from '../../../constants/strings';
import { colors } from '../../../theme';
import type { AuthStackParamList } from '../../../navigation/types';
import { styles } from './styles';

type PreferencesStartNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'PreferencesStart'
>;

const ICON_SIZE = 40;

// Figma: content top 259.5px from frame; header row height 56px (back button row)
const CONTENT_TOP_FIGMA = 259.5;
const HEADER_ROW_HEIGHT = 56;

export const PreferencesStartScreen: React.FC = () => {
  const navigation = useNavigation<PreferencesStartNavigationProp>();
  const insets = useSafeAreaInsets();
  const contentPaddingTop = Math.max(0, CONTENT_TOP_FIGMA - insets.top - HEADER_ROW_HEIGHT);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleProceed = () => {
    navigation.navigate('PreferencesMatch', {});
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
            <BackArrowIcon
              size={48}
              backgroundColor={colors.white}
              strokeColor={colors.black}
            />
          </TouchableOpacity>
        </View>

        <View style={[styles.mainArea, { paddingTop: contentPaddingTop }]}>
          <View style={styles.contentBlock}>
            <View style={styles.iconCircle}>
              <ShapeMatchesIcon
                width={ICON_SIZE}
                height={ICON_SIZE}
                strokeColor={colors.primary.purple}
              />
            </View>
            <View style={styles.titleBlock}>
              <Text style={styles.title}>{STRINGS.PREFERENCES_START.TITLE}</Text>
              <Text style={styles.description}>
                {STRINGS.PREFERENCES_START.DESCRIPTION}
              </Text>
            </View>
          </View>

          <View style={styles.spacer} />

          <View style={styles.buttonContainer}>
            <Button
              title={STRINGS.PREFERENCES_START.PRIMARY_CTA}
              onPress={handleProceed}
              variant="primary"
              style={styles.primaryButton}
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};
