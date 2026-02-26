import React from 'react';
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
import { styles } from './styles';
import { ProfileScreenGradient } from '../../../components/ProfileScreenGradient';

type NavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'BasicDetailsInterests'
>;

const CURRENT_STEP = 11;

export const BasicDetailsInterestsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { interests, setInterests, setCurrentStep } = useProfileStore();

  const [selectedKeys, setSelectedKeys] = React.useState<Set<string>>(() =>
    interests?.length ? new Set(interests) : new Set()
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

  const isValid = selectedKeys.size > 0;

  const onSubmit = () => {
    setInterests(Array.from(selectedKeys));
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
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {INTEREST_CATEGORIES.map((category) => {
              const isExpanded = expandedId === category.id;
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
                            {selected && (
                              <InterestChipCheckIcon
                                size={16}
                                color={colors.primary.purple}
                              />
                            )}
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
            title={STRINGS.PROFILE_SETUP.COMMON.CONTINUE}
            onPress={onSubmit}
            variant="primary"
            disabled={!isValid}
            style={styles.button}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};
