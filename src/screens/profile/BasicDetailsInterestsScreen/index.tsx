import React from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button } from '../../../components/Button';
import { BackArrowIcon } from '../../../assets/icons/common/BackArrowIcon';
import { ChevronDownCircleIcon } from '../../../assets/icons/common/ChevronDownCircleIcon';
import { ChevronUpCircleIcon } from '../../../assets/icons/common/ChevronUpCircleIcon';
import { InterestChipCheckIcon } from '../../../assets/icons/common/InterestChipCheckIcon';
import { STRINGS } from '../../../constants/strings';
import { useProfileStore } from '../../../store/profile.store';
import type { AuthStackParamList } from '../../../navigation/types';
import { INTEREST_CATEGORIES } from '../../../constants/profile';
import { colors } from '../../../theme';
import { apiClient } from '../../../services/api/client';
import { endpoints } from '../../../services/api/endpoints';
import { getProfileApi } from '../../../modules/auth/api';
import { useAuthStore } from '../../../store/auth.store';
import { styles } from './styles';
import { ProfileScreenGradient } from '../../../components/ProfileScreenGradient';

type NavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'BasicDetailsInterests'
>;

const CURRENT_STEP = 12;

export const BasicDetailsInterestsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { interests, setInterests, setCurrentStep } = useProfileStore();
  const route = useRoute<any>();
  const fromEditProfile = route.params?.fromEditProfile === true;
  const authUser = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [isSaving, setIsSaving] = React.useState(false);

  const initialSelectedKeys = React.useMemo(() => {
    if (fromEditProfile && authUser) {
      const rawList = Array.isArray((authUser as any)?.hobbies)
        ? (authUser as any).hobbies
        : (authUser as any)?.interests;
      if (Array.isArray(rawList)) {
        const keys = rawList
          .map((item: unknown) => {
            if (typeof item === 'string') return item;
            if (item && typeof item === 'object') {
              return (item as any).id ?? (item as any).key ?? null;
            }
            return null;
          })
          .filter((v): v is string => typeof v === 'string');
        if (keys.length) return new Set(keys);
      }
    }
    return interests?.length ? new Set(interests) : new Set<string>();
  }, [fromEditProfile, authUser, interests]);

  const [selectedKeys, setSelectedKeys] = React.useState<Set<string>>(
    () => initialSelectedKeys,
  );
  const [expandedId, setExpandedId] = React.useState<string | null>(
    INTEREST_CATEGORIES[0]?.id ?? null
  );

  const toggleInterest = (key: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleCategory = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const MIN_TOTAL = 2;
  const categoryCounts = React.useMemo(() => {
    return INTEREST_CATEGORIES.map((category) => {
      const count = category.options.filter((opt) => selectedKeys.has(opt.key)).length;
      return { id: category.id, count };
    });
  }, [selectedKeys]);

  const totalSelected = selectedKeys.size;
  const isValid = totalSelected >= MIN_TOTAL;

  const onSubmit = async () => {
    const selected = Array.from(selectedKeys);

    if (fromEditProfile) {
      try {
        setIsSaving(true);
        await apiClient.patch(endpoints.user.editProfile, {
          interests: selected,
        });

        const profile = await getProfileApi();
        if ((profile as any)?.data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setUser((profile as any).data);
        }

        navigation.goBack();
      } catch (error: any) {
        // Error handled silently
      } finally {
        setIsSaving(false);
      }
      return;
    }

    setInterests(selected);
    setCurrentStep(CURRENT_STEP + 1);
    navigation.navigate('BasicDetailsPincode');
  };

  return (
    <View style={styles.wrapper}>
      <ProfileScreenGradient />
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'top']}>
        <View style={styles.content}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <BackArrowIcon
              size={48}
              backgroundColor="transparent"
              strokeColor="#1A1A1A"
            />
          </TouchableOpacity>
          <View style={styles.header}>
            <Text style={styles.title}>
              {STRINGS.PROFILE_SETUP.INTERESTS.TITLE}
            </Text>
            <Text style={styles.subtitle}>
              Choose at least {MIN_TOTAL}.
            </Text>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {INTEREST_CATEGORIES.map((category, index) => {
              const isExpanded = expandedId === category.id;
              const categoryState = categoryCounts[index];
              return (
                <View key={category.id} style={styles.categoryCard}>
                  <TouchableOpacity
                    style={styles.categoryHeader}
                    onPress={() => toggleCategory(category.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.categoryChevron}>
                      {isExpanded ? (
                        <ChevronUpCircleIcon
                          size={24}
                          strokeColor="#1A1A1A"
                        />
                      ) : (
                        <ChevronDownCircleIcon
                          size={24}
                          strokeColor="#1A1A1A"
                        />
                      )}
                    </View>
                    <Text style={styles.categoryLabel}>{category.label}</Text>
                  </TouchableOpacity>
                  {isExpanded && (
                    <View style={styles.categoryTags}>
                      {category.options.map((opt) => {
                        const selected = selectedKeys.has(opt.key);
                        return (
                          <TouchableOpacity
                            key={opt.key}
                            style={[
                              styles.chip,
                              selected && styles.chipSelected,
                            ]}
                            onPress={() => toggleInterest(opt.key)}
                            activeOpacity={0.8}
                          >
                            <Text
                              style={[
                                styles.chipText,
                                selected && styles.chipTextSelected,
                              ]}
                            >
                              {opt.label}
                            </Text>
                            <View style={styles.chipIconSlot}>
                              {selected && (
                                <InterestChipCheckIcon
                                  size={16}
                                  color={colors.primary.purple}
                                />
                              )}
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={fromEditProfile ? STRINGS.PREFERENCES.SAVE : STRINGS.PROFILE_SETUP.COMMON.CONTINUE}
            onPress={onSubmit}
            variant="primary"
            disabled={!isValid || (fromEditProfile && isSaving)}
            loading={fromEditProfile && isSaving}
            style={styles.button}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};
