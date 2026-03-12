import React, { useMemo } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../../../components/Button';
import { ProfileScreenGradient } from '../../../components/ProfileScreenGradient';
import { BackArrowIcon } from '../../../assets/icons/common/BackArrowIcon';
import { ShapeMatchesIcon } from '../../../assets/icons/common/ShapeMatchesIcon';
import { STRINGS } from '../../../constants/strings';
import type { AuthStackParamList } from '../../../navigation/types';
import type { ProfileStackParamList } from '../../../navigation/types';
import { colors } from '../../../theme';
import { usePreferencesStore } from '../../../store/preferences.store';
import { useAuthStore } from '../../../store/auth.store';
import { RELIGION_OPTIONS } from '../../../constants/profile';
import type { EducationOption, EmploymentOption } from '../../../store/preferences.store';
import {
  addPreference,
  buildAddPreferencePayload,
  patchEditPreference,
} from '../../../modules/preferences/api';
import { styles } from './styles';

/** Param list that includes only screens we navigate to from summary (used in both Auth and Profile stacks) */
type PreferencesSummaryNavList =
  Pick<
    AuthStackParamList,
    | 'PreferencesSummary'
    | 'PreferencesMatch'
    | 'PreferencesAge'
    | 'PreferencesHeight'
    | 'PreferencesDistance'
    | 'PreferencesEducation'
    | 'PreferencesEmployment'
    | 'PreferencesIncome'
    | 'PreferencesReligion'
    | 'PreferencesMaritalStatus'
    | 'PreferencesRelationshipIntent'
    | 'PreferencesBodyType'
    | 'ReferenceImageIntro'
    | 'ReferenceImagePreference'
    | 'Likes'
  > &
  Pick<ProfileStackParamList, 'ProfileMain'>;

type PreferencesSummaryNavigationProp = NativeStackNavigationProp<
  PreferencesSummaryNavList,
  'PreferencesSummary'
>;

function getGenderDisplay(gender: string[]): string {
  if (gender.length === 0) return '—';
  const labels = gender.map((g) =>
    g === 'man' ? STRINGS.PREFERENCES_GENDER.MAN : STRINGS.PREFERENCES_GENDER.WOMAN
  );
  return labels.join(', ');
}

function getEducationDisplay(value: EducationOption | null): string {
  if (!value) return '—';
  const map: Record<string, keyof typeof STRINGS.PREFERENCES_EDUCATION> = {
    phd_dr: 'PHD_DR',
    masters_or_equivalent: 'MASTER',
    degree_or_equivalent: 'A_LEVEL',
    gcse_or_equivalent: 'GCSE',
    other: 'OTHER',
  };
  return STRINGS.PREFERENCES_EDUCATION[map[value] ?? 'OTHER'] ?? '—';
}

function getEmploymentDisplay(value: EmploymentOption[]): string {
  if (!value.length) return '—';
  const map: Record<string, keyof typeof STRINGS.PREFERENCES_EMPLOYMENT> = {
    employed: 'EMPLOYED',
    self_employed: 'SELF_EMPLOYED',
    student: 'STUDENT',
    unemployed: 'UNEMPLOYED',
    prefer_not_to_say: 'PREFER_NOT_TO_SAY',
  };
  const labels = value.map((v) => STRINGS.PREFERENCES_EMPLOYMENT[map[v] ?? 'PREFER_NOT_TO_SAY'] ?? '—');
  return labels.join(', ');
}

function getIncomeDisplay(
  value: ReturnType<typeof usePreferencesStore.getState>['preferredIncome']
): string {
  if (!value) return '—';
  const map: Record<string, keyof typeof STRINGS.PREFERENCES_INCOME> = {
    eur_20k_30k: 'RANGE_20_30',
    eur_30k_40k: 'RANGE_30_40',
    eur_40k_50k: 'RANGE_40_50',
    eur_50k_plus: 'ABOVE_50',
    prefer_not_to_say: 'PREFER_NOT_TO_SAY',
  };
  return STRINGS.PREFERENCES_INCOME[map[value] ?? 'PREFER_NOT_TO_SAY'] ?? '—';
}

function getReligionDisplay(
  values: ReturnType<typeof usePreferencesStore.getState>['preferredReligions']
): string {
  if (!values.length) return '—';
  type ReligionKey = (typeof RELIGION_OPTIONS)[number]['key'];
  const labelMap = new Map<ReligionKey, string>(
    RELIGION_OPTIONS.map((opt) => [opt.key, opt.label])
  );
  return values.map((v) => labelMap.get(v as ReligionKey) ?? v).join(', ');
}

function getMaritalStatusDisplay(
  value: ReturnType<typeof usePreferencesStore.getState>['preferredMaritalStatus']
): string {
  if (!value) return '—';
  const map: Record<string, keyof typeof STRINGS.PREFERENCES_MARITAL_STATUS> = {
    never_married: 'NEVER_MARRIED',
    divorced: 'DIVORCED',
    widowed: 'WIDOWED',
    separated: 'SEPARATED',
  };
  return STRINGS.PREFERENCES_MARITAL_STATUS[map[value] ?? 'NEVER_MARRIED'] ?? '—';
}

function getBodyTypeDisplay(orderedIds: string[]): string {
  if (!orderedIds.length) return '—';
  const labels: Record<string, string> = {
    mesomorph: STRINGS.PREFERENCES_BODY_TYPE.TONED,
    ectomorph: STRINGS.PREFERENCES_BODY_TYPE.SLIM,
    medium_build: STRINGS.PREFERENCES_BODY_TYPE.MEDIUM,
    endomorph: STRINGS.PREFERENCES_BODY_TYPE.CURVY,
    thick_build: STRINGS.PREFERENCES_BODY_TYPE.PLUS_SIZED,
  };
  return orderedIds.map((id) => labels[id] ?? id).join(', ');
}

export const PreferencesSummaryScreen: React.FC = () => {
  const navigation = useNavigation<PreferencesSummaryNavigationProp>();
  const [loading, setLoading] = React.useState(false);
  const {
    lookingForGender,
    preferredMinAge,
    preferredMaxAge,
    preferredMinHeightcm,
    preferredMaxHeightcm,
    distanceMilesHigh,
    preferredEducation,
    preferredEmployment,
    preferredIncome,
    preferredMaritalStatus,
    relationshipIntentLabel,
    preferredBodyTypes,
    preferredReligions,
    setOpenedEditFromSummary,
  } = usePreferencesStore();

  type PreferenceEditScreen = keyof Pick<
    AuthStackParamList,
    | 'PreferencesMatch'
    | 'PreferencesAge'
    | 'PreferencesHeight'
    | 'PreferencesDistance'
    | 'PreferencesEducation'
    | 'PreferencesEmployment'
    | 'PreferencesIncome'
    | 'PreferencesReligion'
    | 'PreferencesMaritalStatus'
    | 'PreferencesRelationshipIntent'
    | 'PreferencesBodyType'
  >;

  const allRequiredFilled =
    preferredEducation != null &&
    preferredEmployment.length > 0 &&
    preferredIncome != null &&
    preferredMaritalStatus != null &&
    relationshipIntentLabel != null;

  const rows = useMemo(
    (): {
      label: string;
      value: string;
      screen: PreferenceEditScreen;
      required: boolean;
    }[] => [
      {
        label: STRINGS.PREFERENCES_SUMMARY.LABEL_GENDER,
        value: getGenderDisplay(lookingForGender),
        screen: 'PreferencesMatch',
        required: false,
      },
      {
        label: STRINGS.PREFERENCES_SUMMARY.LABEL_AGE,
        value: `${preferredMinAge}-${preferredMaxAge} years`,
        screen: 'PreferencesAge',
        required: false,
      },
      {
        label: STRINGS.PREFERENCES_SUMMARY.LABEL_HEIGHT,
        value: `${preferredMinHeightcm}-${preferredMaxHeightcm} cm`,
        screen: 'PreferencesHeight',
        required: false,
      },
      {
        label: STRINGS.PREFERENCES_SUMMARY.LABEL_DISTANCE,
        value: STRINGS.PREFERENCES.DISTANCE_MILES(distanceMilesHigh),
        screen: 'PreferencesDistance',
        required: false,
      },
      {
        label: STRINGS.PREFERENCES_SUMMARY.LABEL_EDUCATION,
        value: getEducationDisplay(preferredEducation),
        screen: 'PreferencesEducation',
        required: true,
      },
      {
        label: STRINGS.PREFERENCES_SUMMARY.LABEL_EMPLOYMENT,
        value: getEmploymentDisplay(preferredEmployment),
        screen: 'PreferencesEmployment',
        required: true,
      },
      {
        label: STRINGS.PREFERENCES_SUMMARY.LABEL_INCOME,
        value: getIncomeDisplay(preferredIncome),
        screen: 'PreferencesIncome',
        required: true,
      },
      {
        label: STRINGS.PREFERENCES_SUMMARY.LABEL_RELIGION,
        value: getReligionDisplay(preferredReligions),
        screen: 'PreferencesReligion',
        required: false,
      },
      {
        label: STRINGS.PREFERENCES_SUMMARY.LABEL_MARITAL_STATUS,
        value: getMaritalStatusDisplay(preferredMaritalStatus),
        screen: 'PreferencesMaritalStatus',
        required: true,
      },
      {
        label: 'Relationship intent',
        value: relationshipIntentLabel ? relationshipIntentLabel : '—',
        screen: 'PreferencesRelationshipIntent',
        required: true,
      },
      {
        label: STRINGS.PREFERENCES_SUMMARY.LABEL_BODY_TYPE,
        value: getBodyTypeDisplay(preferredBodyTypes),
        screen: 'PreferencesBodyType',
        required: false,
      },
    ],
    [
      lookingForGender,
      preferredMinAge,
      preferredMaxAge,
      preferredMinHeightcm,
      preferredMaxHeightcm,
      distanceMilesHigh,
      preferredEducation,
      preferredEmployment,
      preferredIncome,
      preferredReligions,
      preferredMaritalStatus,
      relationshipIntentLabel,
      preferredBodyTypes,
    ]
  );

  const handleBack = () => {
    navigation.goBack();
  };

  const setPreferenceFlowCompleted = useAuthStore((s) => s.setPreferenceFlowCompleted);

  const handleGetStarted = async () => {
    setLoading(true);
    try {
      const payload = buildAddPreferencePayload(usePreferencesStore.getState());

      const routeNames = navigation.getState().routeNames ?? [];

      const isInProfileStack = routeNames.includes('ProfileMain');
      if (isInProfileStack) {
        await patchEditPreference(payload);
        setLoading(false);
        return;
      }

      await addPreference(payload);
      navigation.navigate('ReferenceImageIntro', {
        returnToProfileMain: false,
      });
    } catch (err) {
      // Save failed
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <ProfileScreenGradient />
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.safeArea} edges={['left', 'right','top','bottom']}>
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

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentScroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.iconCircle}>
            <ShapeMatchesIcon width={40} height={40} strokeColor={colors.primary.purple} />
          </View>
          <Text style={styles.title}>
            {STRINGS.PREFERENCES_SUMMARY.TITLE}
          </Text>
          <Text style={styles.subtitle}>
            {STRINGS.PREFERENCES_SUMMARY.SUBTITLE}
          </Text>
          <Text style={styles.subtitleNote}>
            {STRINGS.PREFERENCES_SUMMARY.SUBTITLE_NOTE}
          </Text>

          <View style={styles.listContainer}>
            {rows.map((row, index) => (
              <React.Fragment key={row.label}>
                <TouchableOpacity
                  style={styles.row}
                  onPress={() => {
                    setOpenedEditFromSummary(true);
                    navigation.push(row.screen, { returnToSummary: true });
                  }}
                  activeOpacity={0.7}
                  accessibilityLabel={`Edit ${row.label}`}
                  accessibilityRole="button"
                >
                  <View style={styles.rowLabel}>
                    <View style={styles.rowLabelTop}>
                      <Text style={styles.rowLabelText}>{row.label}</Text>
                    </View>
                    <Text
                      style={[
                        styles.rowValue,
                        row.required && row.value === '—' && styles.rowValueMissing
                      ]}
                    >
                      {row.value}
                    </Text>
                  </View>
                  <View style={styles.chevron}>
                    <Text style={styles.chevronText}>›</Text>
                  </View>
                </TouchableOpacity>
                {index < rows.length - 1 && <View style={styles.separator} />}
              </React.Fragment>
            ))}
          </View>
        </ScrollView>

        <View style={styles.actions}>
          <Button
            title={STRINGS.PREFERENCES_SUMMARY.GET_STARTED}
            onPress={handleGetStarted}
            variant="primary"
            style={styles.primaryButton}
            disabled={loading || !allRequiredFilled}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};
