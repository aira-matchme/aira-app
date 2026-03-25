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
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button } from '../../../components/Button';
import { ProfileScreenGradient } from '../../../components/ProfileScreenGradient';
import { BackArrowIcon } from '../../../assets/icons/common/BackArrowIcon';
import { InterestChipCheckIcon } from '../../../assets/icons/common/InterestChipCheckIcon';
import { STRINGS } from '../../../constants/strings';
import { useProfileStore } from '../../../store/profile.store';
import type { AuthStackParamList } from '../../../navigation/types';
import { apiClient } from '../../../services/api/client';
import { endpoints } from '../../../services/api/endpoints';
import { getProfileApi } from '../../../modules/auth/api';
import { useAuthStore } from '../../../store/auth.store';
import { styles } from './styles';
import { PROFILE_SCREEN_EDGES } from '../profileScreenLayout';

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

const BODY_TYPE_OPTIONS_DEFAULT: BodyTypeItem[] = [
  { id: 'mesomorph', label: STRINGS.PREFERENCES_BODY_TYPE.TONED, image: require('../../../assets/images/bodytypes/bodytype_toned.png') },
  { id: 'ectomorph', label: STRINGS.PREFERENCES_BODY_TYPE.SLIM, image: require('../../../assets/images/bodytypes/bodytype_slim.png') },
  { id: 'medium_build', label: STRINGS.PREFERENCES_BODY_TYPE.MEDIUM, image: require('../../../assets/images/bodytypes/bodytype_medium.png') },
  { id: 'endomorph', label: STRINGS.PREFERENCES_BODY_TYPE.CURVY, image: require('../../../assets/images/bodytypes/bodytype_curvy.png') },
  { id: 'thick_build', label: STRINGS.PREFERENCES_BODY_TYPE.PLUS_SIZED, image: require('../../../assets/images/bodytypes/bodytype_plus.png') },
];

const BODY_TYPE_OPTIONS_MALE: BodyTypeItem[] = [
  { id: 'mesomorph', label: STRINGS.PREFERENCES_BODY_TYPE.TONED, image: require('../../../assets/images/bodytypes/bodytype_toned_man.png') },
  { id: 'ectomorph', label: STRINGS.PREFERENCES_BODY_TYPE.SLIM, image: require('../../../assets/images/bodytypes/bodytype_slim_man.png') },
  { id: 'medium_build', label: STRINGS.PREFERENCES_BODY_TYPE.MEDIUM, image: require('../../../assets/images/bodytypes/bodytype_medium_man.png') },
  { id: 'endomorph', label: STRINGS.PREFERENCES_BODY_TYPE.CURVY, image: require('../../../assets/images/bodytypes/bodytype_curvy_man.png') },
  { id: 'thick_build', label: STRINGS.PREFERENCES_BODY_TYPE.PLUS_SIZED, image: require('../../../assets/images/bodytypes/bodytype_plus_man.png') },
];

type NavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'BasicDetailsBodyType'
>;

const CURRENT_STEP = 4;

export const BasicDetailsBodyTypeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<any>();
  const fromEditProfile = route.params?.fromEditProfile === true;
  const continueToOnboarding = route.params?.continueToOnboarding === true;
  const { gender, bodyType, setBodyType, setCurrentStep } = useProfileStore();
  const setUser = useAuthStore((s) => s.setUser);
  const [isSaving, setIsSaving] = useState(false);
  const normalizedGender = gender?.toLowerCase() ?? null;
  const bodyTypeOptions =
    normalizedGender === 'male' || normalizedGender === 'man'
      ? BODY_TYPE_OPTIONS_MALE
      : BODY_TYPE_OPTIONS_DEFAULT;
  const [selectedId, setSelectedId] = useState<BodyTypeId | null>(
    (bodyType as BodyTypeId) ?? null
  );

  const handleBack = () => {
    navigation.goBack();
  };

  const handleContinue = async () => {
    if (selectedId) {
      setBodyType(selectedId);
      if (fromEditProfile) {
        try {
          setIsSaving(true);
          await apiClient.patch(endpoints.user.editProfile, {
            bodyType: selectedId,
          });

          const profile = await getProfileApi();
          if ((profile as any)?.data) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setUser((profile as any).data);
          }

          if (continueToOnboarding) {
            navigation.navigate('OnboardingIntro');
          } else {
            navigation.goBack();
          }
        } catch (error: any) {
          // Error handled silently
        } finally {
          setIsSaving(false);
        }
        return;
      }

      setCurrentStep(CURRENT_STEP + 1);
      navigation.navigate('BasicDetailsHeight');
    }
  };

  return (
    <View style={styles.wrapper}>
      <ProfileScreenGradient />
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.safeArea} edges={PROFILE_SCREEN_EDGES}>
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
            {bodyTypeOptions.map((item) => {
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
            title={fromEditProfile ? STRINGS.PREFERENCES.SAVE : STRINGS.PROFILE_SETUP.COMMON.CONTINUE}
            onPress={handleContinue}
            variant="primary"
            style={styles.primaryButton}
            loading={isSaving && fromEditProfile}
            disabled={!selectedId || (isSaving && fromEditProfile)}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};
