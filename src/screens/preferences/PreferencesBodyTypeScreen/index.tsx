import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Image,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { Button } from '../../../components/Button';
import { ProfileScreenGradient } from '../../../components/ProfileScreenGradient';
import { BackArrowIcon } from '../../../assets/icons/common/BackArrowIcon';
import { InterestChipCheckIcon } from '../../../assets/icons/common/InterestChipCheckIcon';
import { STRINGS } from '../../../constants/strings';
import type { AuthStackParamList } from '../../../navigation/types';
import { usePreferencesStore } from '../../../store/preferences.store';
import { buildAddPreferencePayload, patchEditPreference } from '../../../modules/preferences/api';
import { styles } from './styles';

export type BodyTypeId =
  | 'mesomorph'
  | 'ectomorph'
  | 'medium_build'
  | 'endomorph'
  | 'thick_build';

export type BodyTypeItem = {
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

type NavProp = NativeStackNavigationProp<AuthStackParamList, 'PreferencesBodyType'>;
type RouteProps = RouteProp<AuthStackParamList, 'PreferencesBodyType'>;

export const PreferencesBodyTypeScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const openedEditFromSummary = usePreferencesStore((s) => s.openedEditFromSummary);
  const returnToSummary = (route.params?.returnToSummary ?? false) || openedEditFromSummary;
  const preferredBodyTypes = usePreferencesStore((s) => s.preferredBodyTypes);
  const lookingForGender = usePreferencesStore((s) => s.lookingForGender);
  const setPreferredBodyTypes = usePreferencesStore((s) => s.setPreferredBodyTypes);
  const setOpenedEditFromSummary = usePreferencesStore((s) => s.setOpenedEditFromSummary);

  const normalizedPreferredGender = (lookingForGender[0] ?? null) as ('man' | 'woman' | null);
  const bodyTypeOptions =
    normalizedPreferredGender === 'man'
      ? BODY_TYPE_OPTIONS_MALE
      : BODY_TYPE_OPTIONS_DEFAULT;

  const [selected, setSelected] = useState<BodyTypeId[]>(
    preferredBodyTypes.length ? (preferredBodyTypes as BodyTypeId[]) : []
  );

  useEffect(() => {
    setSelected(preferredBodyTypes.length ? ([...preferredBodyTypes] as BodyTypeId[]) : []);
  }, [preferredBodyTypes]);
  

  const handleSelect = (id: BodyTypeId) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSave = async () => {
    // Require all available body types to be selected before proceeding
    if (selected.length !== bodyTypeOptions.length) return;
    setPreferredBodyTypes(selected);
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
      navigation.navigate('PreferencesSummary');
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
          <Text style={styles.title}>{STRINGS.PREFERENCES_BODY_TYPE.TITLE}</Text>
          <Text style={styles.subtitle}>{STRINGS.PREFERENCES_BODY_TYPE.SUBTITLE}</Text>
          <View style={styles.howItWorks}>
            <Text style={styles.howItWorksText}>
              Select and rank all 5 body types in the order you&apos;re open to them. You need to select all 5 to continue.
            </Text>
          </View>

          <View style={[styles.optionsContainer, styles.optionsContent]}>
            {bodyTypeOptions.map((item) => {
              const isSelected = selected.includes(item.id);
              const rank = selected.indexOf(item.id) + 1;

              return (
                <Pressable
                  key={item.id}
                  onPress={() => handleSelect(item.id)}
                  style={[
                    styles.optionRow,
                    isSelected ? styles.optionRowSelected : styles.optionRowUnselected,
                  ]}
                >
                  <View style={styles.rowImageWrap}>
                    <Image source={item.image} style={styles.rowImageImg} resizeMode="contain" />
                  </View>
                  <Text
                    style={[styles.optionText, isSelected && styles.optionTextSelected]}
                    numberOfLines={1}
                  >
                    {item.label}
                  </Text>
                  <View
                    style={[styles.checkbox, isSelected && styles.checkboxSelected]}
                  >
                    {isSelected && (
                      <Text style={styles.checkboxRankText}>{rank}</Text>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            title={STRINGS.PREFERENCES.SAVE}
            onPress={handleSave}
            variant="primary"
            style={styles.primaryButton}
            disabled={selected.length !== bodyTypeOptions.length}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};
