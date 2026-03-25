import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

import { ProfileScreenGradient } from '../../../components/ProfileScreenGradient';
import { TapYourChoiceIcon } from '../../../assets/icons/common/TapYourChoiceIcon';
import { STRINGS } from '../../../constants/strings';
import type {
  AuthStackParamList,
  ProfileStackParamList,
} from '../../../navigation/types';
import { useAuthStore } from '../../../store/auth.store';

import {
  getReferenceNextApi,
  postReferenceImageAnswerApi,
  type ReferenceImageOption,
} from '../../../modules/reference/api';

import { colors } from '../../../theme';
import { styles } from './styles';

/** API may send `faceShape`, `face_shape`, etc. */
function isFaceShapeField(field: string | null | undefined): boolean {
  if (!field) return false;
  return field.replace(/_/g, '').toLowerCase() === 'faceshape';
}

type NavList = AuthStackParamList & ProfileStackParamList;

type NavProp = NativeStackNavigationProp<NavList, 'ReferenceImagePreference'>;
type RouteProps = RouteProp<NavList, 'ReferenceImagePreference'>;

/**
 * Generate all unique pairs
 * Example: A,B,C,D -> AB AC AD BC BD CD
 */
function generatePairs(
  options: ReferenceImageOption[],
): [ReferenceImageOption, ReferenceImageOption][] {
  const pairs: [ReferenceImageOption, ReferenceImageOption][] = [];

  for (let i = 0; i < options.length; i++) {
    for (let j = i + 1; j < options.length; j++) {
      pairs.push([options[i], options[j]]);
    }
  }

  // Shuffle pairs for randomness
  return pairs.sort(() => Math.random() - 0.5);
}

export const ReferenceImagePreferenceScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();

  const setPreferenceFlowCompleted = useAuthStore(
    (s) => s.setPreferenceFlowCompleted,
  );

  const returnToProfileMain = route.params?.returnToProfileMain === true;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [field, setField] = useState<string | null>(null);
  const [pairs, setPairs] = useState<
    [ReferenceImageOption, ReferenceImageOption][]
  >([]);

  const [pairIndex, setPairIndex] = useState(0);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({});
  const isProcessingRef = useRef(false);

  const exitFlow = () => {
    if (returnToProfileMain) {
      navigation.navigate('ProfileMain');
    } else {
      setPreferenceFlowCompleted(true);
    }
  };

  const loadStep = async () => {
    try {
      setLoading(true);

      const data = await getReferenceNextApi();

      if (data.isComplete || !data.options.length) {
        exitFlow();
        return;
      }

      setField(data.currentField);

      const generatedPairs = generatePairs(data.options);

      setPairs(generatedPairs);
      setPairIndex(0);
      setVotes({});
      setSelectedIndex(null);
    } catch (error) {
      exitFlow();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStep();
  }, []);

  const currentPair = pairs[pairIndex];

  const handleSelection = async (chosenIndex: number) => {
    if (!currentPair || !field) return;

    const chosen = currentPair[chosenIndex];

    const newVotes = {
      ...votes,
      [chosen.value]: (votes[chosen.value] ?? 0) + 1,
    };

    setVotes(newVotes);

    // Move to next pair
    if (pairIndex < pairs.length - 1) {
      setSelectedIndex(null);
      setPairIndex((prev) => prev + 1);
      return;
    }

    /**
     * Determine final winner
     */
    const maxVote = Math.max(...Object.values(newVotes));

    const winners = Object.keys(newVotes).filter(
      (k) => newVotes[k] === maxVote,
    );

    // If tie pick random
    const finalWinner =
      winners[Math.floor(Math.random() * winners.length)];

    try {
      setSubmitting(true);

      await postReferenceImageAnswerApi({
        field,
        value: Object.entries(newVotes)
          .sort((a, b) => b[1] - a[1])
          .map(([key, count]) => ({ [key]: count })),
      });

      await loadStep();
    } finally {
      setSubmitting(false);
    }
  };

  const onCardPress = (index: number) => {
    if (submitting || isProcessingRef.current) return;
    isProcessingRef.current = true;
    setSelectedIndex(index);
    const delay = 280;
    setTimeout(() => {
      handleSelection(index).finally(() => {
        isProcessingRef.current = false;
      });
    }, delay);
  };

  return (
    <View style={styles.wrapper}>
      {/* <ProfileScreenGradient /> */}

      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />

      <SafeAreaView
        style={styles.safeArea}
        edges={['left', 'right', 'top', 'bottom']}
      >
        <View style={styles.content}>
          <ScrollView
            style={styles.cardsScroll}
            contentContainerStyle={styles.cardsContent}
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <Text style={styles.loadingText}>
                {STRINGS.PREFERENCES_SUMMARY.SUBTITLE_NOTE ||
                  'Finding the best reference for you...'}
              </Text>
            ) : currentPair ? (
              <>
                {field ? (
                  <>
                    <Text style={styles.title} numberOfLines={2}>
                      {STRINGS.REFERENCE_IMAGE_PREFERENCE.TITLE}
                    </Text>
                    {isFaceShapeField(field) ? (
                      <Text style={styles.similarImagesHint}>
                        {STRINGS.REFERENCE_IMAGE_PREFERENCE.SIMILAR_IMAGES_HINT}
                      </Text>
                    ) : null}
                  </>
                ) : null}
                {currentPair.map((opt, index) => {
                  const selected = index === selectedIndex;
                  const imageKey = `${pairIndex}-${index}-${opt.value}`;
                  const isImageLoaded = imageLoaded[imageKey];

                  return (
                    <TouchableOpacity
                      key={`${field ?? ''}-${pairIndex}-${index}-${opt.value}`}
                      style={[
                        styles.card,
                        selected && styles.cardSelected,
                      ]}
                      activeOpacity={0.95}
                      disabled={submitting}
                      onPress={() => onCardPress(index)}
                    >
                      <View style={styles.cardImageWrap}>
                        <Image
                          source={{ uri: opt.image }}
                          style={styles.cardImage}
                          resizeMode="cover"
                          onLoad={() =>
                            setImageLoaded((prev) => ({
                              ...prev,
                              [imageKey]: true,
                            }))
                          }
                        />
                        {!isImageLoaded && (
                          <View style={styles.cardImageLoader}>
                            <ActivityIndicator
                              size="large"
                              color={colors.primary.purple}
                            />
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </>
            ) : (
              <Text>No comparison available</Text>
            )}
          </ScrollView>
          <View style={styles.tapYourChoiceRow}>
            <TapYourChoiceIcon size={24} />
            <Text style={styles.tapYourChoice}>Tap your choice</Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};