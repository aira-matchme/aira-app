import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { ProfileScreenGradient } from '../../components/ProfileScreenGradient';
import { LogoWordmarkGradient } from '../../assets/icons/home/LogoWordmarkGradient';
import { HomeFilterIcon } from '../../assets/icons/home/HomeFilterIcon';
import { HomeLikeFilledIcon } from '../../assets/icons/home/HomeLikeFilledIcon';
import { ToggleChatHeartIcon } from '../../assets/icons/home/ToggleChatHeartIcon';
import { ToggleHeartIcon } from '../../assets/icons/home/ToggleHeartIcon';
import { BellIcon } from '../../assets/icons/common/BellIcon';
import { VerifiedIcon } from '../../assets/icons/common/VerifiedIcon';
import { MoreHorizIcon } from '../../assets/icons/common/MoreHorizIcon';
import { MatchEmptyIllustration } from '../../assets/icons/home_figma/MatchEmptyIllustration';

import { colors } from '../../theme';
import { styles } from './styles';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CARD_HEIGHT_RATIO = 0.9;
const SLIDE_GAP = 5;

const CARD_IMAGES = [
  require('../../assets/images/Profile1.png'),
  require('../../assets/images/Profile2.png'),
  require('../../assets/images/Profile3.png'),
];

const PHOTO_COUNT = 5;
const PHOTO_INTERVAL_MS = 4000;

type MatchItem = {
  id: string;
  name: string;
  age: number;
  overallPercent: number;
  lifestylePercent: number;
  personalityPercent: number;
  otherPercent: number;
  image: number;
  /** Multiple photos for auto-rotating card (story-style). If present, progress segments and timer use this. */
  images?: number[];
};

const SAMPLE_MATCHES: MatchItem[] = [
  {
    id: '1',
    name: 'Priya',
    age: 28,
    overallPercent: 92,
    lifestylePercent: 88,
    personalityPercent: 95,
    otherPercent: 90,
    image: CARD_IMAGES[0],
    images: [CARD_IMAGES[0], CARD_IMAGES[1], CARD_IMAGES[2], CARD_IMAGES[0], CARD_IMAGES[1]],
  },
  {
    id: '2',
    name: 'Ananya',
    age: 26,
    overallPercent: 87,
    lifestylePercent: 82,
    personalityPercent: 91,
    otherPercent: 85,
    image: CARD_IMAGES[1],
    images: [CARD_IMAGES[1], CARD_IMAGES[2], CARD_IMAGES[0], CARD_IMAGES[1], CARD_IMAGES[2]],
  },
  {
    id: '3',
    name: 'Riya',
    age: 29,
    overallPercent: 89,
    lifestylePercent: 90,
    personalityPercent: 86,
    otherPercent: 88,
    image: CARD_IMAGES[2],
    images: [CARD_IMAGES[2], CARD_IMAGES[0], CARD_IMAGES[1], CARD_IMAGES[2], CARD_IMAGES[0]],
  },
];

export const DashboardScreen = () => {
  const insets = useSafeAreaInsets();
  const [toggleLikes, setToggleLikes] = useState<'chat' | 'likes'>('chat');
  const [matches, setMatches] = useState<MatchItem[]>(SAMPLE_MATCHES);
  /** Current photo index per match (for multi-photo auto-rotate). Key = match.id, value = 0..images.length-1 */
  const [photoIndexByMatchId, setPhotoIndexByMatchId] = useState<Record<string, number>>({});
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setPhotoIndexByMatchId((prev) => {
        const next: Record<string, number> = {};
        matches.forEach((match) => {
          const images = match.images ?? [match.image];
          const current = prev[match.id] ?? 0;
          next[match.id] = (current + 1) % images.length;
        });
        return next;
      });
    }, PHOTO_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [matches]);

  const slideHeight = useMemo(() => {
    const headerApprox = 60 + insets.top;
    return Math.min(
      (SCREEN_HEIGHT - headerApprox) * CARD_HEIGHT_RATIO,
      SCREEN_HEIGHT * 0.95
    );
  }, [insets.top]);

  const contentHeight = useMemo(
    () =>
      matches.length * (slideHeight + SLIDE_GAP) +
      SLIDE_GAP +
      (matches.length > 0 ? 80 : 0),
    [matches.length, slideHeight]
  );

  const handleLike = (id: string) => {
    setMatches((prev) => prev.filter((m) => m.id !== id));
  };

  const handleDislike = (id: string) => {
    setMatches((prev) => prev.filter((m) => m.id !== id));
  };

  const emptyState = matches.length === 0;

  return (
    
    <View style={styles.container}>
    
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
           
      <View style={[styles.header, { paddingTop: Math.max(12, insets.top) }]}>
        <View style={styles.logoWrap}>
          <LogoWordmarkGradient />
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.headerButton} activeOpacity={0.8}>
            <HomeFilterIcon />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} activeOpacity={0.8}>
            <BellIcon color={colors.neutral[800]} size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardContainer}>
        {emptyState ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIllustrationWrap}>
              <MatchEmptyIllustration width={180} height={180} />
            </View>
            <Text style={styles.emptyTitle}>
              Finding your next great match...
            </Text>
            <Text style={styles.emptySubtitle}>
              Aira is refining matches based on your preferences. New profiles
              will appear here soon.
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              { height: contentHeight },
            ]}
            showsVerticalScrollIndicator={false}
            snapToInterval={slideHeight + SLIDE_GAP}
            snapToAlignment="start"
            decelerationRate="fast"
          >
            {matches.map((match) => (
              <View
                key={match.id}
                style={[
                  styles.slide,
                  {
                    height: slideHeight + SLIDE_GAP,
                    marginBottom: SLIDE_GAP,
                  },
                ]}
              >
                <View
                  style={[
                    styles.cardSection,
                    { height: slideHeight },
                  ]}
                >
                  <View style={styles.card}>
                    <View style={StyleSheet.absoluteFill}>
                      <Image
                        source={
                          (match.images && match.images.length > 0)
                            ? match.images[
                                (photoIndexByMatchId[match.id] ?? 0) % match.images.length
                              ]
                            : match.image
                        }
                        style={styles.cardImage}
                        resizeMode="cover"
                      />
                      <LinearGradient
                        colors={[
                          'transparent',
                          'rgba(0,0,0,0.1)',
                          'rgba(0,0,0,0.7)',
                        ]}
                        style={styles.cardImageGradient}
                      />
                    </View>
                    <View
                      style={[
                        styles.cardTopOverlayWrap,
                        StyleSheet.absoluteFillObject,
                      ]}
                      pointerEvents="box-none"
                    >
                    <LinearGradient
                      colors={['rgba(0,0,0,0.5)', 'transparent']}
                      style={styles.cardTopOverlayGradient}
                    />
                    <View style={styles.cardTopOverlay}>
                      <View style={styles.cardTopRow}>
                        <View style={styles.nameBlock}>
                          <View style={styles.nameRow}>
                            <Text style={styles.name} numberOfLines={1}>
                              {match.name}, {match.age}
                            </Text>
                            <View style={styles.verifiedBadge}>
                              <VerifiedIcon
                                size={12}
                                color={colors.white}
                              />
                            </View>
                          </View>
                          <View style={styles.nameProgressSegments}>
                            {(match.images ?? [match.image]).slice(0, PHOTO_COUNT).map((_, i) => {
                              const photoCount = (match.images ?? [match.image]).length;
                              const currentIndex = (photoIndexByMatchId[match.id] ?? 0) % photoCount;
                              const filled = i === currentIndex;
                              return (
                                <View
                                  key={i}
                                  style={[
                                    styles.nameProgressSegment,
                                    filled && styles.nameProgressSegmentFilled,
                                  ]}
                                />
                              );
                            })}
                          </View>
                        </View>
                        <TouchableOpacity
                          style={styles.optionsButton}
                          activeOpacity={0.8}
                        >
                          <MoreHorizIcon
                            size={20}
                            color={colors.white}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                    <View style={styles.cardOverlay} pointerEvents="box-none">
                    <View style={styles.matchOverlay}>
                      <View style={styles.overallRow}>
                        <Text style={styles.overallLabel}>
                          Overall Match
                        </Text>
                        <Text style={styles.overallPercent}>
                          {match.overallPercent}%
                        </Text>
                      </View>
                      <View style={styles.progressTrack}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${match.overallPercent}%`,
                              backgroundColor: colors.primary.purple,
                            },
                          ]}
                        />
                      </View>
                      <View style={styles.chipsRow}>
                        <View style={styles.chip}>
                          <Text style={styles.chipLabel}>Lifestyle</Text>
                          <Text style={styles.chipPercent}>
                            {match.lifestylePercent}%
                          </Text>
                        </View>
                        <View style={styles.chip}>
                          <Text style={styles.chipLabel}>Personality</Text>
                          <Text style={styles.chipPercent}>
                            {match.personalityPercent}%
                          </Text>
                        </View>
                        <View style={styles.chip}>
                          <Text style={styles.chipLabel}>Others</Text>
                          <Text style={styles.chipPercent}>
                            {match.otherPercent}%
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.knowMoreRow}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.knowMoreText}>Know More</Text>
                        <Text style={styles.knowMoreArrow}>→</Text>
                      </TouchableOpacity>
                    
                    </View>
                    <View style={styles.toggleContainer}>
                        <TouchableOpacity
                          style={[
                            styles.toggleButton,
                            toggleLikes === 'chat' && styles.toggleButtonGradient,
                            toggleLikes === 'likes' && styles.toggleButtonInactive,
                          ]}
                          onPress={() => setToggleLikes('chat')}
                          activeOpacity={0.8}
                        >
                          {toggleLikes === 'chat' ? (
                            <LinearGradient
                              colors={[
                                colors.primary.purple,
                                colors.secondary.lavender,
                              ]}
                              style={StyleSheet.absoluteFill}
                            />
                          ) : null}
                          <ToggleChatHeartIcon
                            color={toggleLikes === 'chat' ? colors.white : colors.neutral[500]}
                            size={24}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.toggleButton,
                            toggleLikes === 'likes' && styles.toggleButtonGradient,
                            toggleLikes === 'chat' && styles.toggleButtonInactive,
                          ]}
                          onPress={() => setToggleLikes('likes')}
                          activeOpacity={0.8}
                        >
                          {toggleLikes === 'likes' ? (
                            <LinearGradient
                              colors={[
                                colors.primary.purple,
                                colors.secondary.lavender,
                              ]}
                              style={StyleSheet.absoluteFill}
                            />
                          ) : null}
                          <ToggleHeartIcon
                            color={toggleLikes === 'likes' ? colors.white : colors.neutral[500]}
                            size={24}
                          />
                        </TouchableOpacity>
                      </View>
                  </View>
                  </View>
                </View>
              </View>
            ))}
            {matches.length > 0 && (
              <View
                style={[
                  styles.peekStrip,
                  { paddingVertical: 20, marginBottom: 24 },
                ]}
              >
                <Text style={styles.peekStripText}>
                  No more matches below
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
};
