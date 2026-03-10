import React, { useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Pressable,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button } from '../../../components/Button';
import { ProfileScreenGradient } from '../../../components/ProfileScreenGradient';
import { BackArrowIcon } from '../../../assets/icons/common/BackArrowIcon';
import { InterestChipCheckIcon } from '../../../assets/icons/common/InterestChipCheckIcon';
import { STRINGS } from '../../../constants/strings';
import { useProfileStore } from '../../../store/profile.store';
import type { AuthStackParamList } from '../../../navigation/types';
import { styles } from './styles';

export type BodyTypeId =
  | 'mesomorph'
  | 'ectomorph'
  | 'medium_build'
  | 'endomorph'
  | 'thick_build';

type BodyTypeItem = {
  id: BodyTypeId;
  label: string;
  image: number;
};

const BODY_TYPE_OPTIONS: BodyTypeItem[] = [
  { id: 'mesomorph', label: STRINGS.PREFERENCES_BODY_TYPE.TONED, image: require('../../../assets/images/bodytypes/bodytype_toned.png') },
  { id: 'ectomorph', label: STRINGS.PREFERENCES_BODY_TYPE.SLIM, image: require('../../../assets/images/bodytypes/bodytype_slim.png') },
  { id: 'medium_build', label: STRINGS.PREFERENCES_BODY_TYPE.MEDIUM, image: require('../../../assets/images/bodytypes/bodytype_medium.png') },
  { id: 'endomorph', label: STRINGS.PREFERENCES_BODY_TYPE.CURVY, image: require('../../../assets/images/bodytypes/bodytype_curvy.png') },
  { id: 'thick_build', label: STRINGS.PREFERENCES_BODY_TYPE.PLUS_SIZED, image: require('../../../assets/images/bodytypes/bodytype_plus.png') },
];

type NavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'BasicDetailsBodyType'
>;

const CURRENT_STEP = 4;

export const BasicDetailsBodyTypeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { bodyType, setBodyType, setCurrentStep } = useProfileStore();
  const [selectedId, setSelectedId] = useState<BodyTypeId | null>(
    (bodyType as BodyTypeId) ?? null
  );

  const handleBack = () => {
    navigation.goBack();
  };

  const handleContinue = () => {
    if (selectedId) {
      setBodyType(selectedId);
      setCurrentStep(CURRENT_STEP + 1);
      navigation.navigate('BasicDetailsHeight');
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
          <Text style={styles.title}>{STRINGS.PROFILE_SETUP.BODY_TYPE.TITLE}</Text>
          <Text style={styles.subtitle}>{STRINGS.PROFILE_SETUP.BODY_TYPE.SUBTITLE}</Text>

          <ScrollView
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {BODY_TYPE_OPTIONS.map((item) => {
              const isSelected = selectedId === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setSelectedId(item.id)}
                  style={styles.row}
                >
                  <View style={styles.rowImageWrap}>
                    <Image
                      source={item.image}
                      style={styles.rowImageImg}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={styles.rowLabel} numberOfLines={1}>
                    {item.label}
                  </Text>
                  <View
                    style={[
                      styles.selectionBox,
                      isSelected && styles.selectionBoxSelected,
                    ]}
                  >
                    {isSelected && (
                      <InterestChipCheckIcon size={20} color="#FFFFFF" />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.actions}>
          <Button
            title={STRINGS.PROFILE_SETUP.COMMON.CONTINUE}
            onPress={handleContinue}
            variant="primary"
            style={styles.primaryButton}
            disabled={!selectedId}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};
