import React, { useEffect, useState } from 'react';
import { View, Text, StatusBar, TouchableOpacity, Pressable, ScrollView } from 'react-native';
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
import type { RelationshipIntentOption } from '../../../store/preferences.store';
import {
  buildAddPreferencePayload,
  patchEditPreference,
} from '../../../modules/preferences/api';
import { styles } from './styles';

const OPTIONS: { value: RelationshipIntentOption; label: string }[] = [
  { value: 'serious', label: 'Serious' },
  { value: 'flexible', label: 'Flexible' },
  { value: 'casual', label: 'Casual' },
];

type NavProp = NativeStackNavigationProp<AuthStackParamList, 'PreferencesRelationshipIntent'>;
type RouteProps = RouteProp<AuthStackParamList, 'PreferencesRelationshipIntent'>;

export const PreferencesRelationshipIntentScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const openedEditFromSummary = usePreferencesStore((s) => s.openedEditFromSummary);
  const returnToSummary = (route.params?.returnToSummary ?? false) || openedEditFromSummary;

  const relationshipIntentLabel = usePreferencesStore((s) => s.relationshipIntentLabel);
  const setRelationshipIntentLabel = usePreferencesStore((s) => s.setRelationshipIntentLabel);
  const setOpenedEditFromSummary = usePreferencesStore((s) => s.setOpenedEditFromSummary);

  const [selected, setSelected] = useState<RelationshipIntentOption | null>(relationshipIntentLabel);

  useEffect(() => {
    setSelected(relationshipIntentLabel);
  }, [relationshipIntentLabel]);

  const handleSelect = (value: RelationshipIntentOption) => {
    setSelected((prev) => (prev === value ? null : value));
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSave = async () => {
    if (selected === null) return;
    setRelationshipIntentLabel(selected);

    if (returnToSummary) {
      setOpenedEditFromSummary(false);
      try {
        const payload = buildAddPreferencePayload(usePreferencesStore.getState());
        await patchEditPreference(payload);
      } catch {
        // Ignore; global error UI handles failures.
      }
      navigation.goBack();
      return;
    }

    navigation.navigate('PreferencesBodyType', {});
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
          <Text style={styles.title}>Relationship intent preference</Text>
          <Text style={styles.subtitle}>
            {/* {STRINGS.PREFERENCES_SUMMARY.SUBTITLE_NOTE ||
              'Choose what kind of relationship you’re looking for.'} */}
          </Text>

          <ScrollView
            style={styles.optionsContainer}
            contentContainerStyle={styles.optionsContent}
            showsVerticalScrollIndicator={false}
          >
            {OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => handleSelect(opt.value)}
                style={[
                  styles.optionRow,
                  selected === opt.value ? styles.optionRowSelected : styles.optionRowUnselected,
                ]}
              >
                <Text
                  style={[styles.optionText, selected === opt.value && styles.optionTextSelected]}
                  numberOfLines={1}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.actions}>
          <Button
            title={STRINGS.PREFERENCES.SAVE}
            onPress={handleSave}
            variant="primary"
            style={styles.primaryButton}
            disabled={selected === null}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

