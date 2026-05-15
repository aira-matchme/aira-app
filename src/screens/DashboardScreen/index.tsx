import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  StatusBar,
  ImageSourcePropType,
  Modal,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Alert,
  RefreshControl,
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
import { colors } from '../../theme';
import { styles } from './styles';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { postAIMessagesApi, blockUserApi, reportUserApi } from '../../modules/chat/api';
import { useTabWalkthrough } from '../../navigation/TabWalkthroughContext';
import { apiClient } from '../../services/api/client';
import { endpoints } from '../../services/api/endpoints';
import { STRINGS } from '../../constants/strings';
import { useAuthStore } from '../../store/auth.store';
import { markAppTourCompleted } from '../../services/appTour/markAppTourCompleted';
import { showErrorToast, showSuccessToast } from '../../services/toast.srvice';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const getCardHeightRatio = (screenHeight: number, screenWidth: number) => {
  // Tune card height by device class so cards do not look too tall/short.
  if (screenHeight <= 700) return 0.72; // compact phones
  if (screenHeight <= 820) return 0.76; // standard phones
  if (screenHeight >= 940 || screenWidth >= 430) return 0.82; // larger phones
  return 0.8; // default
};
const SLIDE_GAP = 5;

/** Only cards within this index distance of the focused snap slide mount `Image` (remote decode). */
const CARD_IMAGE_WINDOW_RADIUS = 2;

const PHOTO_COUNT = 5;
const PHOTO_INTERVAL_MS = 4000;

type MatchItem = {
  id: string;
  /** Cursor id used by /matches/cursor save + paging. */
  matchId?: string;
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
  _id?: string;
  matchId?: string;
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
    hasNext?: boolean;
    hasPrev?: boolean;
    nextCursor?: string;
    prevCursor?: string;
    centerMatchId?: string;
  };
};

type CursorPageResult = {
  items: MatchItem[];
  hasNext: boolean;
  hasPrev: boolean;
  nextCursor: string | null;
  prevCursor: string | null;
};

export const DashboardScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const isAppTourDone = useAuthStore((s) => s.user?.isAppTourDone);
  const { active: tabWalkthroughActive, startFromProfile } = useTabWalkthrough();
  const scrollRef = useRef<ScrollView | null>(null);
  /** Prevents calling start() again when the tab walkthrough modal causes a focus/blur cycle (resets welcome to step 1). */
  const walkthroughAutoStartLockRef = useRef(false);
  const [showWalkthroughWelcome, setShowWalkthroughWelcome] = useState(false);
  const [showFirstMovePopup, setShowFirstMovePopup] = useState(false);
  const [firstMoveStep, setFirstMoveStep] = useState<'choose' | 'sent'>('choose');
  const [firstMoveLoading, setFirstMoveLoading] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchItem | null>(null);
  const [optionsMatch, setOptionsMatch] = useState<MatchItem | null>(null);
  const [showMatchOptions, setShowMatchOptions] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [pagingLoading, setPagingLoading] = useState(false);
  /** Distinguishes prev vs next fetch so pull-refresh UI only reflects backward paging. */
  const [pagingKind, setPagingKind] = useState<'prev' | 'next' | null>(null);
  const [pagingBootstrapped, setPagingBootstrapped] = useState(false);
  /** Mirrors hasMore* refs so layout (extra scroll slack) updates when paging flags change. */
  const [hasMoreNext, setHasMoreNext] = useState(true);
  const [hasMorePrev, setHasMorePrev] = useState(true);
  const pagingInFlightRef = useRef(false);
  const lastSavedCursorRef = useRef<string | null>(null);
  const lastIndexHandledRef = useRef<number | null>(null);
  const hasMoreNextRef = useRef(true);
  const hasMorePrevRef = useRef(true);
  const topCursorRef = useRef<string | null>(null);
  const bottomCursorRef = useRef<string | null>(null);
  const nextCursorRef = useRef<string | null>(null);
  const prevCursorRef = useRef<string | null>(null);
  /** Lets ScrollView exceed viewport when only one card so user can scroll to trigger next-page. */
  const [scrollViewportH, setScrollViewportH] = useState(0);
  /** Current photo index per match (for multi-photo auto-rotate). Key = match.id, value = 0..images.length-1 */
  const [photoIndexByMatchId, setPhotoIndexByMatchId] = useState<Record<string, number>>({});
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentIndexRef = useRef(0);
  /** Snap-scroller center index; used to lazy-mount card photos (± window only). */
  const [imageWindowCenterIndex, setImageWindowCenterIndex] = useState(0);

  const CURSOR_PAGE_LIMIT = 4;

  useEffect(() => {
    setImageWindowCenterIndex((c) =>
      matches.length === 0 ? 0 : Math.min(c, matches.length - 1),
    );
  }, [matches.length]);

  const mapMatches = useCallback((items: GetMatchesItem[]): MatchItem[] => {
    return items.map((item) => {
      const sortedPhotos = [...(item.galleryPhotos ?? [])].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0)
      );
      const imageSources: ImageSourcePropType[] = sortedPhotos.map((p) => ({
        uri: p.url,
      }));
      const primaryImage: ImageSourcePropType =
        imageSources[0] ?? require('../../assets/images/Profile1.png');

      const matchId = item.matchId ?? item._id;

      return {
        id: item.userId,
        matchId,
        chatId: item.chatId,
        name: item.name,
        age: 0,
        overallPercent: item.matchScore,
        lifestylePercent: item.preferenceScore,
        personalityPercent: item.personalityScore,
        otherPercent: Math.round((item.relationshipIntentScore + item.visualScore) / 2),
        image: primaryImage,
        images: imageSources.length > 0 ? imageSources : undefined,
        isLiked: item.isLiked ?? false,
      };
    });
  }, []);

  const getCursorId = useCallback(async (): Promise<string | null> => {
    try {
      const res = await apiClient.get(endpoints.matches.getMatchesCursor);
      const matchId =
        res?.data?.data?.matchId ??
        res?.data?.data?._id ??
        res?.data?.matchId ??
        null;
      return typeof matchId === 'string' && matchId.length > 0 ? matchId : null;
    } catch {
      return null;
    }
  }, []);

  const fetchCursorPage = useCallback(
    async (cursor: string | null, direction: 'forward' | 'backward'): Promise<CursorPageResult> => {
      console.log('Fetching matches cursor page', { cursor, direction });
      const res = await apiClient.post(endpoints.matches.getMatchesCursorPage, {
        cursor,
        direction,
        limit: CURSOR_PAGE_LIMIT,
      });

      const payload = res?.data?.data;
      const items: GetMatchesItem[] = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.items)
          ? payload.items
          : [];

      const mapped = mapMatches(items);
      const hasNext =
        typeof payload?.hasNext === 'boolean' ? payload.hasNext : mapped.length > 0;
      const hasPrev =
        typeof payload?.hasPrev === 'boolean' ? payload.hasPrev : mapped.length > 0;

      const center =
        typeof payload?.centerMatchId === 'string' && payload.centerMatchId.length > 0
          ? payload.centerMatchId
          : null;
      const nextRaw =
        typeof payload?.nextCursor === 'string' && payload.nextCursor.length > 0
          ? payload.nextCursor
          : null;
      const prevRaw =
        typeof payload?.prevCursor === 'string' && payload.prevCursor.length > 0
          ? payload.prevCursor
          : null;

      return {
        items: mapped,
        hasNext,
        hasPrev,
        nextCursor: nextRaw ?? center,
        prevCursor: prevRaw ?? center,
      };
    },
    [mapMatches]
  );

  const saveCursor = useCallback(async (matchId: string) => {
    try {
      await apiClient.post(endpoints.matches.saveMatchesCursor, { matchId });
      lastSavedCursorRef.current = matchId;
    } catch {
      // non-blocking
    }
  }, []);

  const getRenderKey = useCallback((m: MatchItem, index?: number) => {
    // Must be stable across renders/pages, otherwise we can't reliably dedupe.
    // Backend-provided matchId should be unique per match; fallback to userId.
    if (m.matchId && m.matchId.length > 0) return m.matchId;
    return m.id;
  }, []);

  const getCursorFromMatch = useCallback((m: MatchItem | undefined | null) => {
    const cursor = m?.matchId ?? m?.id ?? null;
    return typeof cursor === 'string' && cursor.length > 0 ? cursor : null;
  }, []);

  const slideHeight = useMemo(() => {
    const headerApprox = 60 + insets.top;
    const cardHeightRatio = getCardHeightRatio(SCREEN_HEIGHT, SCREEN_WIDTH);
    return Math.min((SCREEN_HEIGHT - headerApprox) * cardHeightRatio, SCREEN_HEIGHT * 0.95);
  }, [insets.top]);

  const contentHeight = useMemo(
    () =>
      matches.length * (slideHeight + SLIDE_GAP) +
      SLIDE_GAP +
      (matches.length > 0 ? 80 : 0),
    [matches.length, slideHeight]
  );

  const scrollContentHeight = useMemo(() => {
    const base = contentHeight;
    if (matches.length === 0 || scrollViewportH <= 0) return base;
    if (hasMoreNext && base <= scrollViewportH) {
      return scrollViewportH + slideHeight + SLIDE_GAP;
    }
    return base;
  }, [contentHeight, matches.length, scrollViewportH, slideHeight, hasMoreNext]);

  const ensureMoreMatchesIfNeeded = useCallback(async () => {
    if (pagingInFlightRef.current) return;
    if (!hasMoreNextRef.current) return;
    // Only fetch when user reaches the end of loaded cards
    const atEnd = currentIndexRef.current >= Math.max(0, matches.length - 1);
    if (!atEnd) return;

    pagingInFlightRef.current = true;
    setPagingKind('next');
    setPagingLoading(true);
    try {
      const cursorId =
        nextCursorRef.current ?? bottomCursorRef.current ?? (await getCursorId());
      const page = await fetchCursorPage(cursorId, 'forward');
      const next = page.items;

      setMatches((prev) => {
        const seen = new Set<string>();
        prev.forEach((m, i) => {
          seen.add(getRenderKey(m));
        });
        const merged = [...prev];
        next.forEach((m) => {
          const key = getRenderKey(m);
          if (!seen.has(key)) {
            seen.add(key);
            merged.push(m);
          }
        });
        topCursorRef.current = getCursorFromMatch(merged[0]);
        bottomCursorRef.current = getCursorFromMatch(merged[merged.length - 1]);
        return merged;
      });

      hasMoreNextRef.current = !!page.hasNext;
      hasMorePrevRef.current = !!page.hasPrev;
      setHasMoreNext(!!page.hasNext);
      setHasMorePrev(!!page.hasPrev);
      if (page.nextCursor != null) nextCursorRef.current = page.nextCursor;
      if (page.prevCursor != null) prevCursorRef.current = page.prevCursor;
    } finally {
      setPagingLoading(false);
      setPagingKind(null);
      pagingInFlightRef.current = false;
    }
  }, [fetchCursorPage, getCursorFromMatch, getCursorId, getRenderKey, matches.length]);

  const ensurePreviousMatchesIfNeeded = useCallback(async () => {
    if (pagingInFlightRef.current) return;
    if (!hasMorePrevRef.current) return;
    // Only fetch when user reaches the top of loaded cards
    const atTop = currentIndexRef.current <= 0;
    if (!atTop) return;

    pagingInFlightRef.current = true;
    setPagingLoading(true);
    try {
      const cursorId =
        prevCursorRef.current ?? topCursorRef.current ?? (await getCursorId());
      const page = await fetchCursorPage(cursorId, 'backward');
      const prevItems = page.items;
      if (!prevItems.length) {
        hasMorePrevRef.current = !!page.hasPrev;
        hasMoreNextRef.current = !!page.hasNext;
        setHasMorePrev(!!page.hasPrev);
        setHasMoreNext(!!page.hasNext);
        if (page.nextCursor != null) nextCursorRef.current = page.nextCursor;
        if (page.prevCursor != null) prevCursorRef.current = page.prevCursor;
        return;
      }

      let addedCount = 0;
      setMatches((prev) => {
        const seen = new Set<string>();
        prev.forEach((m, i) => {
          seen.add(getRenderKey(m));
        });
        const toPrepend: MatchItem[] = [];
        prevItems.forEach((m) => {
          const key = getRenderKey(m);
          if (!seen.has(key)) {
            seen.add(key);
            toPrepend.push(m);
          }
        });
        addedCount = toPrepend.length;
        const merged = [...toPrepend, ...prev];
        topCursorRef.current = getCursorFromMatch(merged[0]);
        bottomCursorRef.current = getCursorFromMatch(merged[merged.length - 1]);
        return merged;
      });

      // Keep the currently visible card anchored after prepend.
      requestAnimationFrame(() => {
        if (addedCount <= 0) return;
        const deltaY = addedCount * (slideHeight + SLIDE_GAP);
        scrollRef.current?.scrollTo({ y: deltaY, animated: false });
        currentIndexRef.current = addedCount;
        lastIndexHandledRef.current = addedCount;
      });

      hasMorePrevRef.current = !!page.hasPrev;
      hasMoreNextRef.current = !!page.hasNext;
      setHasMorePrev(!!page.hasPrev);
      setHasMoreNext(!!page.hasNext);
      if (page.nextCursor != null) nextCursorRef.current = page.nextCursor;
      if (page.prevCursor != null) prevCursorRef.current = page.prevCursor;
    } finally {
      setPagingLoading(false);
      setPagingKind(null);
      pagingInFlightRef.current = false;
    }
  }, [fetchCursorPage, getCursorFromMatch, getCursorId, getRenderKey, slideHeight]);

  const bootstrapMatches = useCallback(async () => {
    if (pagingInFlightRef.current) return;
    pagingInFlightRef.current = true;
    setPagingKind(null);
    setPagingLoading(true);
    try {
      hasMoreNextRef.current = true;
      hasMorePrevRef.current = true;
      setHasMoreNext(true);
      setHasMorePrev(true);
      topCursorRef.current = null;
      bottomCursorRef.current = null;
      nextCursorRef.current = null;
      prevCursorRef.current = null;
      lastIndexHandledRef.current = null;
      const cursorId = await getCursorId();
      const firstPage = await fetchCursorPage(cursorId, 'forward');
      setMatches(() => {
        const items = firstPage.items;
        topCursorRef.current = getCursorFromMatch(items[0]);
        bottomCursorRef.current = getCursorFromMatch(items[items.length - 1]);
        return items;
      });
      hasMoreNextRef.current = !!firstPage.hasNext;
      hasMorePrevRef.current = !!firstPage.hasPrev;
      setHasMoreNext(!!firstPage.hasNext);
      setHasMorePrev(!!firstPage.hasPrev);
      if (firstPage.nextCursor != null) nextCursorRef.current = firstPage.nextCursor;
      if (firstPage.prevCursor != null) prevCursorRef.current = firstPage.prevCursor;
      setPagingBootstrapped(true);
      currentIndexRef.current = 0;
    } finally {
      setPagingLoading(false);
      setPagingKind(null);
      pagingInFlightRef.current = false;
    }
  }, [fetchCursorPage, getCursorFromMatch, getCursorId]);

  useFocusEffect(
    useCallback(() => {
      bootstrapMatches();
    }, [bootstrapMatches]),
  );

  useFocusEffect(
    useCallback(() => {
      if (tabWalkthroughActive) {
        return;
      }
      // Profile from GET /auth/profile: only auto-show when server says tour is not done.
      if (isAppTourDone !== false) return;
      let cancelled = false;
      const run = async () => {
        try {
          if (cancelled) return;
          if (walkthroughAutoStartLockRef.current) return;
          walkthroughAutoStartLockRef.current = true;

          await new Promise<void>((resolve) => setTimeout(resolve, 700));
          if (cancelled) {
            walkthroughAutoStartLockRef.current = false;
            return;
          }
          setShowWalkthroughWelcome(true);
        } catch {
          walkthroughAutoStartLockRef.current = false;
        }
      };
      void run();
      return () => {
        cancelled = true;
      };
    }, [tabWalkthroughActive, isAppTourDone]),
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

  const handleLike = async (id: string) => {
    try {
      await apiClient.post(endpoints.matches.addLike, {
        likedUserId: id,
      });
  
      // ✅ Update UI without reloading
      setMatches((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isLiked: true } : item
        )
      );
    } catch {}
  };
  
  const handleUnlike = async (id: string) => {
    try {
      await apiClient.post(endpoints.matches.removeLike, {
        likedUserId: id,
      });
  
      // ✅ Update UI without reloading
      setMatches((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isLiked: false } : item
        )
      );
    } catch {}
  };

  const emptyState = matches.length === 0;

  const handleKnowMore = (match: MatchItem) => {
    navigation.navigate('MatchDetails', { userId: match.id });
  };

  const handleWalkthroughSkip = useCallback(() => {
    setShowWalkthroughWelcome(false);
    walkthroughAutoStartLockRef.current = false;
    void (async () => {
      try {
        await markAppTourCompleted();
      } catch {
        // Welcome may reappear until PATCH succeeds and profile reflects `isAppTourDone: true`.
      }
    })();
  }, []);

  const handleWalkthroughGetStarted = useCallback(() => {
    setShowWalkthroughWelcome(false);
    startFromProfile();
  }, [startFromProfile]);

  return (
    
    <View style={styles.container}>
    
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
           
      <View style={[styles.header, { paddingTop: Math.max(12, insets.top) }]}>
        <View style={styles.logoWrap}>
          <LogoWordmarkGradient />
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Notifications')}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
          >
            <BellIcon color={colors.neutral[800]} size={20} />
          </TouchableOpacity>
        </View>
      </View>
      <Modal
        visible={showWalkthroughWelcome}
        transparent
        animationType="fade"
        onRequestClose={handleWalkthroughSkip}
      >
        <View style={styles.walkthroughWelcomeBackdrop}>
          <View style={styles.walkthroughWelcomeCard}>
            <Text style={styles.walkthroughWelcomeTitle}>
              {STRINGS.DASHBOARD_WALKTHROUGH.WELCOME_TITLE}
            </Text>
            <Text style={styles.walkthroughWelcomeBody}>
              {STRINGS.DASHBOARD_WALKTHROUGH.WELCOME_BODY}
            </Text>
            <View style={styles.walkthroughWelcomeActions}>
              <TouchableOpacity
                style={styles.walkthroughSkipButton}
                onPress={handleWalkthroughSkip}
                activeOpacity={0.8}
              >
                <Text style={styles.walkthroughSkipText}>{STRINGS.DASHBOARD_WALKTHROUGH.SKIP}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.walkthroughGetStartedButton}
                onPress={handleWalkthroughGetStarted}
                activeOpacity={0.9}
              >
                <Text style={styles.walkthroughGetStartedText}>
                  {STRINGS.DASHBOARD_WALKTHROUGH.GET_STARTED}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
            ref={(r) => {
              scrollRef.current = r;
            }}
            style={styles.scrollView}
            onLayout={(e) => setScrollViewportH(e.nativeEvent.layout.height)}
            contentContainerStyle={[
              styles.scrollContent,
              { height: scrollContentHeight },
            ]}
            showsVerticalScrollIndicator={false}
            snapToInterval={slideHeight + SLIDE_GAP}
            snapToAlignment="start"
            decelerationRate="fast"
            refreshControl={
              hasMorePrev ? (
                <RefreshControl
                  refreshing={pagingLoading && pagingKind === 'prev'}
                  onRefresh={() => void ensurePreviousMatchesIfNeeded()}
                  tintColor={colors.primary.purple}
                  colors={[colors.primary.purple]}
                />
              ) : undefined
            }
            onMomentumScrollEnd={(e) => {
              const y = e.nativeEvent.contentOffset.y ?? 0;
              const lh = e.nativeEvent.layoutMeasurement?.height ?? 0;
              const ch = e.nativeEvent.contentSize?.height ?? 0;
              const slideStep = slideHeight + SLIDE_GAP;
              const rawIdx = Math.round(y / slideStep);
              const idx = Math.max(0, rawIdx);
              const prevIdx = lastIndexHandledRef.current;
              const indexChanged = prevIdx !== idx;
              lastIndexHandledRef.current = idx;

              const lastMatchIdx = Math.max(0, matches.length - 1);
              const matchIdx = Math.min(idx, lastMatchIdx);
              currentIndexRef.current = matchIdx;
              setImageWindowCenterIndex(matchIdx);

              const m = matches[matchIdx];
              const matchIdToSave = m?.matchId ?? m?.id;
              if (
                indexChanged &&
                matchIdToSave &&
                lastSavedCursorRef.current !== matchIdToSave
              ) {
                saveCursor(matchIdToSave);
              }

              // Bidirectional paging: only after a scroll gesture ends (not on initial mount).
              const nearTop = y <= 24;
              const nearBottom = lh > 0 && ch > 0 && y + lh >= ch - 56;

              if (nearTop && hasMorePrevRef.current) {
                void ensurePreviousMatchesIfNeeded();
              }
              if (nearBottom && hasMoreNextRef.current) {
                const atLastCard = currentIndexRef.current >= lastMatchIdx;
                if (atLastCard) void ensureMoreMatchesIfNeeded();
              }
            }}
          >
            {matches?.map((match, index) => {
              const withinImageWindow =
                matches.length > 0 &&
                Math.abs(index - imageWindowCenterIndex) <= CARD_IMAGE_WINDOW_RADIUS;
              const cardImageSource =
                match.images && match.images.length > 0
                  ? match.images[
                      (photoIndexByMatchId[match.id] ?? 0) % match.images.length
                    ]
                  : match.image;
              return (
              <View
                key={getRenderKey(match, index)}
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
                      {withinImageWindow ? (
                      <Image
                        source={cardImageSource}
                        style={styles.cardImage}
                        resizeMode="cover"
                      />
                      ) : (
                        <View style={styles.cardImage} />
                      )}
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
                          if (match.chatId && match.chatId !== '' && match.chatId !== null) {
                            navigation.navigate('Chat', {
                              screen: 'ChatDetail',
                              params: {
                                chatId: match.chatId,
                                avatar: match.image,
                                name: match.name,
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
                            {
                              backgroundColor: match.isLiked
                                ? 'rgba(0,0,0,0.2)'
                                : 'white',
                              borderRadius: 24,
                            },
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
            );
            })}
            {pagingBootstrapped && pagingLoading && (
              <View style={{ paddingVertical: 14 }}>
                <ActivityIndicator size="small" color={colors.primary.purple} />
              </View>
            )}
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
              <Pressable
                style={({ pressed }) => [
                  styles.firstMoveButton,
                  styles.firstMoveButtonNeutral,
                  pressed && styles.firstMoveButtonActive,
                ]}
                onPress={() => {
                  const m = selectedMatch;
                  if (!m) return;
                  setShowFirstMovePopup(false);
                  navigation.navigate('Chat', {
                    screen: 'ChatDetail',
                    params: {
                      
                      // If a chat already exists, use its id; otherwise let ChatDetail
                      // handle creating the chat on first send.
                      chatId: m.chatId ?? null,
                      avatar: m.image,
                      name: m.name,
                      otherUserId: m.id,
                    },
                  });
                }}
              >
                <View style={styles.firstMoveButtonIcon}>
                  <TabChatIcon color={colors.primary.purple} width={24} height={24} />
                </View>
                <Text style={styles.firstMoveButtonText}>Say it in your words</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.firstMoveButton,
                  styles.firstMoveButtonNeutral,
                  (pressed || firstMoveLoading) && styles.firstMoveButtonActive,
                ]}
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
                   Aira Introduce
                  </GradientText>
                  <GradientText
                    style={{ fontSize: 16, fontWeight: '500' }}
                    colors={[colors.primary.purpleLight, colors.primary.purple]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                  >
                  Me
                  </GradientText>
                </View>
              </Pressable>
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
                  {selectedMatch?.name
                    ? `I've sent ${selectedMatch.name} a request. Once they reply, I'll let you know.`
                    : "I've sent them a request. Once they reply, I'll let you know."}
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
                      await bootstrapMatches();
                      showSuccessToast(apiMessage.toString());
                    } catch (e: any) {
                      const errMessage =
                        e?.response?.data?.message ??
                        e?.message ??
                        'Could not block this user. Please try again.';
                      showErrorToast(errMessage.toString());
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
                      await bootstrapMatches();
                      showSuccessToast(apiMessage.toString());
                    } catch (e: any) {
                      const errMessage =
                        e?.response?.data?.message ??
                        e?.message ??
                        'Could not submit report. Please try again.';
                      showErrorToast(errMessage.toString());
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
