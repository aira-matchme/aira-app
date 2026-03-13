import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ImageSourcePropType,
  Modal,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { ProfileScreenGradient } from '../../components/ProfileScreenGradient';
import { ReusableBottomSheet } from '../../components/BottomSheet';
import { GradientText } from '../../components/GradientText';
import { LogoWordmarkGradient } from '../../assets/icons/home/LogoWordmarkGradient';
import { HomeFilterIcon } from '../../assets/icons/home/HomeFilterIcon';
import { ToggleChatHeartIcon } from '../../assets/icons/home/ToggleChatHeartIcon';
import { ToggleHeartIcon } from '../../assets/icons/home/ToggleHeartIcon';
import { BellIcon } from '../../assets/icons/common/BellIcon';
import { MoreHorizIcon } from '../../assets/icons/common/MoreHorizIcon';
import { TabChatIcon } from '../../assets/icons/tabs/TabChatIcon';
// import { MatchEmptyIllustration } from '../../assets/icons/home_figma/MatchEmptyIllustration';
import { MatchesSearchEmptyIcon } from '../../assets/icons/home/MatchesSearchEmptyIcon';
import { TabAICenterIcon } from '../../assets/icons/tabs/TabAICenterIcon';
import { BlockIcon } from '../../assets/icons/common/BlockIcon';
import { ReportIcon } from '../../assets/icons/common/ReportIcon';
import { ForwardArrowIcon } from '../../assets/icons/common/ForwardArrowIcon';
import { CloseIcon } from '../../assets/icons/common/CloseIcon';
import {
  StatusSignalIcon,
  StatusConnectionIcon,
  StatusBatteryIcon,
} from '../../assets/icons/match/EssentialStatusIcons';

import { colors } from '../../theme';
import { styles } from './styles';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { postAIMessagesApi, blockUserApi, reportUserApi } from '../../modules/chat/api';
import { apiClient } from '../../services/api/client';
import { endpoints } from '../../services/api/endpoints';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CARD_HEIGHT_RATIO = 0.9;
const SLIDE_GAP = 5;

const PHOTO_COUNT = 5;
const PHOTO_INTERVAL_MS = 4000;

type MatchItem = {
  id: string;
  name: string;
  age: number;
  /** Existing chat id with this match, if any */
  chatId?: string;
  overallPercent: number;
  lifestylePercent: number;
  personalityPercent: number;
  otherPercent: number;
  image: ImageSourcePropType;
  /** Multiple photos for auto-rotating card (story-style). If present, progress segments and timer use this. */
  images?: ImageSourcePropType[];
  isLiked: boolean;
};

type GetMatchesItem = {
  userId: string;
  chatId?: string;
  name: string;
  galleryPhotos?: { order: number; url: string }[];
  verifiedStatus?: boolean;
  matchScore: number;
  preferenceScore: number;
  visualScore: number;
  personalityScore: number;
  relationshipIntentScore: number;
  isLiked: boolean;
};

type GetMatchesResponse = {
  statusCode?: number;
  message?: string;
  data?: {
    items: GetMatchesItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    fromCache?: boolean;
  };
};

export const DashboardScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [showFirstMovePopup, setShowFirstMovePopup] = useState(false);
  const [firstMoveStep, setFirstMoveStep] = useState<'choose' | 'sent'>('choose');
  const [firstMoveLoading, setFirstMoveLoading] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchItem | null>(null);
  const [optionsMatch, setOptionsMatch] = useState<MatchItem | null>(null);
  const [showMatchOptions, setShowMatchOptions] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  /** Current photo index per match (for multi-photo auto-rotate). Key = match.id, value = 0..images.length-1 */
  const [photoIndexByMatchId, setPhotoIndexByMatchId] = useState<Record<string, number>>({});
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshMatches = useCallback(async () => {
    try {
      const { data } = await apiClient.post<GetMatchesResponse>(
        endpoints.matches.getMatches
      );
      const items = data?.data?.items ?? [];
      const mapped: MatchItem[] = items.map((item) => {
        const sortedPhotos = [...(item.galleryPhotos ?? [])].sort(
          (a, b) => (a.order ?? 0) - (b.order ?? 0)
        );
        const imageSources: ImageSourcePropType[] = sortedPhotos.map((p) => ({
          uri: p.url,
        }));
        const primaryImage: ImageSourcePropType =
          imageSources[0] ?? require('../../assets/images/Profile1.png');

        return {
          id: item.userId,
          chatId: item.chatId,
          name: item.name,
          age: 0,
          overallPercent: item.matchScore,
          lifestylePercent: item.preferenceScore,
          personalityPercent: item.personalityScore,
          otherPercent: item.relationshipIntentScore,
          image: primaryImage,
          images: imageSources.length > 0 ? imageSources : undefined,
          isLiked: item.isLiked ?? false,
        };
      });
      setMatches(mapped);
    } catch (e) {
      // On failure, keep current matches.
    }
  }, []);

  useEffect(() => {
    refreshMatches();
  }, [refreshMatches]);

  useFocusEffect(
    useCallback(() => {
      refreshMatches();
    }, [refreshMatches]),
  );

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!matches.length) {
      return;
    }

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
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
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

  const handleLike = async (id: string) => {
    try {
      await apiClient.post(endpoints.matches.addLike, {
        likedUserId: id,
      });
      await refreshMatches();
    } catch {
      // Keep card state on failure
    }
  };

  const handleUnlike = async (id: string) => {
    try {
      await apiClient.post(endpoints.matches.removeLike, {
        likedUserId: id,
      });
      await refreshMatches();
    } catch {
      // Keep card state on failure
    }
  };

  const emptyState = matches.length === 0;

  const handleKnowMore = (match: MatchItem) => {
    navigation.navigate('MatchDetails', { userId: match.id });
  };

  return (
    
    <View style={styles.container}>
    
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
           
      <View style={[styles.header, { paddingTop: Math.max(12, insets.top) }]}>
        <View style={styles.logoWrap}>
          <LogoWordmarkGradient />
        </View>
        <View style={styles.headerButtons}>
          {/* <TouchableOpacity style={styles.headerButton} activeOpacity={0.8}>
            <HomeFilterIcon />
          </TouchableOpacity> */}
          <TouchableOpacity style={styles.headerButton} activeOpacity={0.8}>
            <BellIcon color={colors.neutral[800]} size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardContainer}>
        {emptyState ? (
          <View style={styles.emptyState}>
          <View style={styles.emptyIllustrationWrap}>
            <MatchesSearchEmptyIcon size={120} />
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
            {matches?.map((match) => (
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
                              {match.name}
                            </Text>
                            {/* <View style={styles.verifiedBadge}>
                              <VerifiedIcon
                                size={12}
                                color={colors.white}
                              />
                            </View> */}
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
                          onPress={() => {
                            setOptionsMatch(match);
                            setShowMatchOptions(true);
                          }}
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
                        onPress={() => handleKnowMore(match)}
                      >
                        <Text style={styles.knowMoreText}>Know More</Text>
                        <Text style={styles.knowMoreArrow}>→</Text>
                      </TouchableOpacity>
                    
                    </View>
                    <View style={styles.matchActionsContainer}>
                      <TouchableOpacity
                        style={styles.matchActionButton}
                        onPress={() => {
                          if (match.chatId) {
                            navigation.navigate('Chat', {
                              screen: 'ChatDetail',
                              params: {
                                chatId: match.chatId,
                                name: match.name,
                                avatar: match.image,
                                isRequest: false,
                                otherUserId: match.id,
                              },
                            });
                          } else {
                            setSelectedMatch(match);
                            setFirstMoveStep('choose');
                            setShowFirstMovePopup(true);
                          }
                        }}
                        activeOpacity={0.8}
                      >
                        <LinearGradient
                          colors={[colors.primary.purple, colors.secondary.lavender]}
                          style={StyleSheet.absoluteFill}
                        />
                        <ToggleChatHeartIcon color={colors.white} size={24} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.matchActionButton}
                        onPress={() => {
                          if (match.isLiked) {
                            handleUnlike(match.id);
                          } else {
                            handleLike(match.id);
                          }
                        }}
                        activeOpacity={0.8}
                      >
                        <View
                          style={[
                            StyleSheet.absoluteFill,
                            { backgroundColor: match.isLiked ? 'rgba(0,0,0,0.2)' : 'white', borderRadius: 24 },
                          ]}
                        />
                        {match.isLiked ? (
                          <CloseIcon size={22} color={colors.white} />
                        ) : (
                          <ToggleHeartIcon size={22} color={colors.primary.purple} />
                        )}
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

      <ReusableBottomSheet
        isOpen={showFirstMovePopup}
        onClose={() => setShowFirstMovePopup(false)}
        snapPoints={firstMoveStep === 'sent' ? ['30%'] : ['48%']}
        showDragHandle={true}
        showCloseButton={false}
        enablePanDownToClose={true}
        scrollEnabled={false}
      >
        {firstMoveStep === 'choose' ? (
          <View style={styles.firstMoveSheet}>
            <View style={styles.firstMoveHeader}>
              <View style={styles.firstMoveIconWrap}>
                <LinearGradient
                  colors={[colors.primary.purple, colors.secondary.lavender]}
                  style={StyleSheet.absoluteFill}
                />
                <ToggleChatHeartIcon color={colors.white} size={30} />
              </View>
              <View style={styles.firstMoveTextBlock}>
                <Text style={styles.firstMoveTitle}>Make your first move</Text>
                <Text style={styles.firstMoveSubtitle}>Your vibe, your call.</Text>
              </View>
              
            </View>
            <View style={styles.firstMoveButtonsRow}>
              <TouchableOpacity
                style={[styles.firstMoveButton, styles.firstMoveButtonSay]}
                activeOpacity={0.8}
                onPress={() => {
                  const m = selectedMatch;
                  if (!m) return;
                  setShowFirstMovePopup(false);
                  navigation.navigate('Chat', {
                    screen: 'ChatDetail',
                    params: {
                      chatId: m.id,
                      name: m.name,
                      avatar: m.image,
                      isRequest: false,
                    },
                  });
                }}
              >
                <View style={styles.firstMoveButtonIcon}>
                  <TabChatIcon color={colors.primary.purple} width={24} height={24} />
                </View>
                <Text style={styles.firstMoveButtonText}>Say it in your words</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.firstMoveButton, styles.firstMoveButtonAira]}
                activeOpacity={0.8}
                disabled={firstMoveLoading}
                onPress={async () => {
                  const m = selectedMatch;
                  if (!m || firstMoveLoading) return;
                  try {
                    setFirstMoveLoading(true);
                    await postAIMessagesApi({ receiverId: m.id });
                    setFirstMoveStep('sent');
                  } finally {
                    setFirstMoveLoading(false);
                  }
                }}
              >
                <View style={styles.firstMoveButtonIcon}>
                  <TabAICenterIcon width={44} height={44} />
                </View>
                <View style={{ alignItems: 'center', gap: 0 }}>
                  <GradientText
                    style={{ fontSize: 16, fontWeight: '500' }}
                    colors={[colors.primary.purpleLight, colors.primary.purple]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                  >
                    Let Aira break
                  </GradientText>
                  <GradientText
                    style={{ fontSize: 16, fontWeight: '500' }}
                    colors={[colors.primary.purpleLight, colors.primary.purple]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                  >
                    the ice
                  </GradientText>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={[styles.firstMoveSheet, { paddingTop: 8, paddingBottom: 16, gap: 10 }]}>
            <View style={[styles.firstMoveHeader, { gap: 16 }]}>
              <View
                style={[
                  styles.firstMoveIconWrap,
                  {
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: colors.primary[50],
                  },
                ]}
              >
                <ForwardArrowIcon size={24} color={colors.primary.purple} />
              </View>
              <View style={styles.firstMoveTextBlock}>
                <Text style={[styles.firstMoveTitle, { fontSize: 18, lineHeight: 24 }]}>
                  Request sent
                </Text>
                <Text style={[styles.firstMoveSubtitle, { fontSize: 12, lineHeight: 16 }]}>
                  Waiting for {selectedMatch?.name ?? 'them'} to respond. You'll get notified when they do.
                </Text>
              </View>
            </View>
          </View>
        )}
      </ReusableBottomSheet>

      <Modal
        visible={showMatchOptions}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (blockLoading || reportLoading) return;
          setShowMatchOptions(false);
          setOptionsMatch(null);
        }}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            if (blockLoading || reportLoading) return;
            setShowMatchOptions(false);
            setOptionsMatch(null);
          }}
        >
          <View style={styles.matchOptionsBackdrop}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.matchOptionsPopup}>
                <TouchableOpacity
                  style={styles.matchOptionsItem}
                  activeOpacity={0.8}
                  disabled={blockLoading || !optionsMatch}
                  onPress={async () => {
                    const m = optionsMatch;
                    if (!m || blockLoading) return;
                    try {
                      setBlockLoading(true);
                      const res = await blockUserApi({ blockUserId: m.id, type: 'block' });
                      const apiMessage =
                        (res as any)?.data?.message ??
                        (res as any)?.message ??
                        'User blocked successfully.';
                      setShowMatchOptions(false);
                      setOptionsMatch(null);
                      await refreshMatches();
                      Alert.alert('Blocked', apiMessage.toString());
                    } catch (e: any) {
                      const errMessage =
                        e?.response?.data?.message ??
                        e?.message ??
                        'Could not block this user. Please try again.';
                      Alert.alert('Error', errMessage.toString());
                    } finally {
                      setBlockLoading(false);
                    }
                  }}
                >
                  <View style={styles.matchOptionsIconWrap}>
                    {blockLoading ? (
                      <ActivityIndicator size="small" color={colors.black} />
                    ) : (
                      <BlockIcon size={20} color={colors.black} />
                    )}
                  </View>
                  <Text style={styles.matchOptionsLabel}>
                    {blockLoading ? 'Blocking…' : 'Block'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.matchOptionsItem}
                  activeOpacity={0.8}
                  disabled={reportLoading || !optionsMatch}
                  onPress={async () => {
                    const m = optionsMatch;
                    if (!m || reportLoading) return;
                    try {
                      setReportLoading(true);
                      const res = await reportUserApi({
                        reportedAgainst: m.id,
                        reportMessage: 'Reported from matches dashboard',
                      });
                      const apiMessage =
                        (res as any)?.data?.message ??
                        (res as any)?.message ??
                        'Report submitted successfully.';
                      setShowMatchOptions(false);
                      setOptionsMatch(null);
                      await refreshMatches();
                      Alert.alert('Reported', apiMessage.toString());
                    } catch (e: any) {
                      const errMessage =
                        e?.response?.data?.message ??
                        e?.message ??
                        'Could not submit report. Please try again.';
                      Alert.alert('Error', errMessage.toString());
                    } finally {
                      setReportLoading(false);
                    }
                  }}
                >
                  <View style={[styles.matchOptionsIconWrap, styles.matchOptionsIconWrapReport]}>
                    {reportLoading ? (
                      <ActivityIndicator size="small" color={colors.black} />
                    ) : (
                      <ReportIcon size={20} color={colors.black} />
                    )}
                  </View>
                  <Text style={styles.matchOptionsLabelReport}>
                    {reportLoading ? 'Reporting…' : 'Report'}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};
