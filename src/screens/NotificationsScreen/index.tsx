import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  Pressable,
  RefreshControl,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import {
  CompositeNavigationProp,
  useNavigation,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackArrowIcon } from '../../assets/icons/common/BackArrowIcon';
import { ChatEmptyIcon } from '../../assets/icons/home_figma/ChatEmptyIcon';
import { ProfileScreenGradient } from '../../components/ProfileScreenGradient';
import { STRINGS } from '../../constants/strings';
import type { HomeStackParamList, TabStackParamList } from '../../navigation/types';
import { navigateToEditProfile } from '../../navigation/navigateToProfile';
import { navigateToSubscription } from '../../navigation/navigateToSubscription';
import {
  patchNotificationSeen,
  postNotificationsList,
  type NotificationsListMeta,
} from '../../modules/notifications/api';
import { showErrorToast } from '../../services/toast.srvice';
import { colors } from '../../theme';
import { NotificationListIcon } from './NotificationListIcon';
import {
  isGalleryCompletionReminder,
  isSubscriptionNotification,
  normalizeNotificationType,
  NOTIFICATION_TYPE,
  OPEN_CHAT_DETAIL_TYPES,
  resolveNotificationIconKind,
  shouldUseSenderAvatar,
  type NotificationIconKind,
} from './notificationTypes';
import { styles } from './styles';

type NotificationsNav = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList, 'Notifications'>,
  BottomTabNavigationProp<TabStackParamList>
>;

type FilterTab = 'all' | 'unread';

type NotificationRow = {
  id: string;
  title: string;
  body: string;
  timeLabel: string;
  avatarUri: string | null;
  unread: boolean;
  notificationType: string;
  iconKind: NotificationIconKind;
  /** From `options.chatId` / `data.chatId` */
  chatId: string | null;
  contactName: string;
  senderId: string | null;
  /** Other user id for `MATCH_FOUND` → MatchDetails */
  matchUserId: string | null;
};

function pickMatchUserId(
  o: Record<string, unknown>,
  nestedSender: Record<string, unknown> | null
): string | null {
  const from = (obj: unknown): string | null => {
    if (!obj || typeof obj !== 'object') return null;
    const x = obj as Record<string, unknown>;
    for (const k of ['userId', 'matchedUserId', 'matchUserId', 'profileId'] as const) {
      const v = x[k];
      if (typeof v === 'string' && v.trim()) return v.trim();
    }
    return null;
  };
  return (
    from(o.options) ??
    from(o.data) ??
    (nestedSender && typeof nestedSender.id === 'string' && nestedSender.id.trim()
      ? nestedSender.id.trim()
      : null)
  );
}

/** Root stack hosts `MatchDetails` (sibling of tab navigator). */
function navigateToMatchDetails(
  navigation: NotificationsNav,
  userId: string
) {
  const tabNav = navigation.getParent();
  const rootNav = tabNav?.getParent();
  if (rootNav && typeof (rootNav as { navigate?: unknown }).navigate === 'function') {
    (rootNav as { navigate: (name: string, p: { userId: string }) => void }).navigate(
      'MatchDetails',
      { userId }
    );
    return;
  }
  showErrorToast(STRINGS.NOTIFICATIONS.MATCH_OPEN_FAILED);
}

const PAGE_SIZE = 15;
/** Same bottom inset as ChatScreen list (tab bar + safe area). */
import { useTabBarOccupiedHeight } from '../../navigation/tabBarLayout';

function firstNonEmptyString(...values: Array<unknown>): string | undefined {
  for (const value of values) {
    if (typeof value === 'string') {
      const t = value.trim();
      if (t.length > 0) return t;
    }
  }
  return undefined;
}

function pickChatId(o: Record<string, unknown>): string | null {
  const from = (obj: unknown): string | null => {
    if (!obj || typeof obj !== 'object') return null;
    const id = (obj as { chatId?: unknown }).chatId;
    return typeof id === 'string' && id.trim() ? id.trim() : null;
  };
  return from(o.options) ?? from(o.data);
}

/** Other user id for chat deep-links when `sender` is only under options/data. */
function pickSenderIdFromPayload(o: Record<string, unknown>): string | null {
  const from = (obj: unknown): string | null => {
    if (!obj || typeof obj !== 'object') return null;
    const x = obj as Record<string, unknown>;
    const senderObj =
      x.sender && typeof x.sender === 'object'
        ? (x.sender as Record<string, unknown>)
        : null;
    return (
      firstNonEmptyString(
        x.senderId,
        x.fromUserId,
        typeof x.sender === 'string' ? x.sender : undefined,
        senderObj?._id,
        senderObj?.id,
        senderObj?.userId
      ) ?? null
    );
  };
  return from(o.options) ?? from(o.data);
}

function pickNotificationType(o: Record<string, unknown>): string {
  if (typeof o.type === 'string' && o.type.trim()) return o.type.trim();
  const d = o.data;
  if (d && typeof d === 'object' && typeof (d as { type?: unknown }).type === 'string') {
    return ((d as { type: string }).type || '').trim();
  }
  return '';
}

function parseSeen(o: Record<string, unknown>): boolean | null {
  if (typeof o.isSeen === 'boolean') return o.isSeen;
  if (typeof o.seen === 'boolean') return o.seen;
  if (typeof o.read === 'boolean') return o.read;
  if (typeof o.isRead === 'boolean') return o.isRead;
  return null;
}

/**
 * Avatar from API user/sender shapes: `profilePicture` string, or `profilePhoto.url.{medium,original,thumb}`.
 */
function avatarFromObject(src: Record<string, unknown>): string | null {
  const photo = src.profilePhoto;
  if (photo && typeof photo === 'object') {
    const u = (photo as { url?: { medium?: string; original?: string; thumb?: string } }).url;
    const fromUrls = firstNonEmptyString(u?.medium, u?.original, u?.thumb);
    if (fromUrls) return fromUrls;
  }
  if (typeof photo === 'string') {
    const t = photo.trim();
    if (t) return t;
  }
  const pic = src.profilePicture;
  if (typeof pic === 'string') {
    const t = pic.trim();
    if (t) return t;
  }
  return firstNonEmptyString(
    typeof src.avatar === 'string' ? src.avatar : undefined,
    typeof src.image === 'string' ? src.image : undefined
  ) ?? null;
}

function mapNotificationItem(item: unknown): NotificationRow | null {
  if (!item || typeof item !== 'object') return null;
  const o = item as Record<string, unknown>;
  const nestedSender =
    o.sender && typeof o.sender === 'object' ? (o.sender as Record<string, unknown>) : null;
  const nestedUser =
    o.user && typeof o.user === 'object' ? (o.user as Record<string, unknown>) : null;
  const nestedFrom =
    o.fromUser && typeof o.fromUser === 'object'
      ? (o.fromUser as Record<string, unknown>)
      : null;
  /** Notifications API uses `sender`; older shapes used user/fromUser. */
  const src = nestedSender ?? nestedFrom ?? nestedUser ?? o;

  const id =
    firstNonEmptyString(o.id, o._id, o.notificationId) ??
    `${firstNonEmptyString(o.title, o.message) ?? 'n'}_${String(o.createdAt ?? '')}`;
  if (!id) return null;

  const title =
    firstNonEmptyString(
      o.title,
      o.heading,
      o.subject,
      nestedSender?.name,
      nestedSender?.nickName,
      src.name,
      src.nickName
    ) ?? STRINGS.NOTIFICATIONS.TITLE;

  const body = firstNonEmptyString(
    o.body,
    o.message,
    o.description,
    o.text,
    typeof o.content === 'string' ? o.content : undefined
  );

  const created =
    firstNonEmptyString(
      o.createdAt,
      o.updatedAt,
      o.sentAt,
      o.timestamp as string | undefined
    ) ?? null;

  const seen = parseSeen(o);
  const unread = seen === null ? false : !seen;

  const senderId =
    nestedSender && typeof nestedSender.id === 'string' && nestedSender.id.trim()
      ? nestedSender.id.trim()
      : null;

  const contactName =
    firstNonEmptyString(
      typeof nestedSender?.name === 'string' ? nestedSender.name : undefined,
      typeof nestedSender?.nickName === 'string' ? nestedSender.nickName : undefined,
      typeof src.name === 'string' ? src.name : undefined,
      typeof src.nickName === 'string' ? src.nickName : undefined
    ) ?? 'Chat';

  const notifType = normalizeNotificationType(pickNotificationType(o));

  return {
    id,
    title,
    body: body ?? '',
    timeLabel: formatNotificationTime(created),
    avatarUri:
      avatarFromObject(src) ?? firstNonEmptyString(o.imageUrl, o.iconUrl) ?? null,
    unread,
    notificationType: notifType,
    iconKind: resolveNotificationIconKind(notifType),
    chatId: pickChatId(o),
    contactName,
    senderId,
    matchUserId: pickMatchUserId(o, nestedSender),
  };
}

function formatNotificationTime(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return STRINGS.CHAT.JUST_NOW;
  if (mins < 60) {
    if (mins <= 1) return STRINGS.NOTIFICATIONS.TIME_ONE_MIN_AGO;
    return STRINGS.NOTIFICATIONS.TIME_N_MINS_AGO.replace('{n}', String(mins));
  }
  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    if (hours <= 1) return STRINGS.NOTIFICATIONS.TIME_ONE_HOUR_AGO;
    return STRINGS.NOTIFICATIONS.TIME_N_HOURS_AGO.replace('{n}', String(hours));
  }
  if (hours < 48) return STRINGS.CHAT.YESTERDAY;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export const NotificationsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NotificationsNav>();
  const listBottomPadding = useTabBarOccupiedHeight();
  const [filter, setFilter] = useState<FilterTab>('all');
  const [rows, setRows] = useState<NotificationRow[]>([]);
  const [meta, setMeta] = useState<NotificationsListMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const pageRef = useRef(1);
  const inFlightRef = useRef(false);

  const loadPage = useCallback(
    async (page: number, mode: 'replace' | 'append') => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;
      if (mode === 'replace') setLoading(true);
      if (mode === 'append') setLoadingMore(true);
      try {
        const body: Parameters<typeof postNotificationsList>[0] = {
          page,
          limit: PAGE_SIZE,
          types: [],
        };
        if (filter === 'unread') {
          body.isSeen = false;
        }
        const res = await postNotificationsList(body);
        const raw = res.data?.list ?? [];
        const mapped = raw.map(mapNotificationItem).filter(Boolean) as NotificationRow[];
        if (mode === 'append') {
          setRows((prev) => {
            const seen = new Set(prev.map((r) => r.id));
            const next = [...prev];
            for (const r of mapped) {
              if (!seen.has(r.id)) next.push(r);
            }
            return next;
          });
        } else {
          setRows(mapped);
        }
        setMeta(res.data?.meta ?? null);
        pageRef.current = page;
      } catch {
        showErrorToast(STRINGS.NOTIFICATIONS.LOAD_ERROR);
        if (mode === 'replace') setRows([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
        inFlightRef.current = false;
      }
    },
    [filter]
  );

  useEffect(() => {
    loadPage(1, 'replace');
  }, [filter, loadPage]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadPage(1, 'replace');
  }, [loadPage]);

  const onEndReached = useCallback(() => {
    const m = meta;
    if (!m || loading || loadingMore) return;
    const cur = m.currentPage ?? m.pageNo ?? pageRef.current;
    const totalPages = m.totalPages ?? 1;
    if (cur >= totalPages) return;
    loadPage(cur + 1, 'append');
  }, [meta, loadPage, loading, loadingMore]);

  const displayRows =
    filter === 'unread' ? rows.filter((r) => r.unread) : rows;

  const hasUnreadInList = rows.some((r) => r.unread);

  const markNotificationSeen = useCallback((notificationId: string) => {
    patchNotificationSeen(notificationId)
      .then(() => {
        setRows((prev) =>
          prev.map((r) => (r.id === notificationId ? { ...r, unread: false } : r))
        );
      })
      .catch(() => {
        /* silent — user already navigated */
      });
  }, []);

  const handleNotificationPress = useCallback(
    (item: NotificationRow) => {
      markNotificationSeen(item.id);

      if (isSubscriptionNotification(item.notificationType)) {
        navigateToSubscription(navigation);
        return;
      }

      if (isGalleryCompletionReminder(item.notificationType)) {
        navigateToEditProfile(navigation);
        return;
      }

      if (item.notificationType === NOTIFICATION_TYPE.MATCH_FOUND) {
        const uid = item.matchUserId;
        if (!uid) {
          showErrorToast(STRINGS.NOTIFICATIONS.MATCH_OPEN_FAILED);
          return;
        }
        navigateToMatchDetails(navigation, uid);
        return;
      }

      if (OPEN_CHAT_DETAIL_TYPES.has(item.notificationType)) {
        if (!item.chatId) {
          showErrorToast(STRINGS.NOTIFICATIONS.OPEN_CHAT_FAILED);
          return;
        }
        const otherUserId = firstNonEmptyString(item.senderId, item.matchUserId);
        navigation.navigate('Chat', {
          screen: 'ChatDetail',
          params: {
            chatId: item.chatId,
            name: item.contactName,
            ...(otherUserId ? { otherUserId } : {}),
            avatar: item.avatarUri ? { uri: item.avatarUri } : undefined,
          },
        });
      }
    },
    [markNotificationSeen, navigation]
  );

  const renderItem = useCallback(
    ({ item }: { item: NotificationRow }) => {
    const showUnreadChrome = item.unread;
    const showAvatar = shouldUseSenderAvatar(item.iconKind, item.avatarUri);
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${item.title}. ${item.body ?? ''}`}
        onPress={() => handleNotificationPress(item)}
        style={(state) => [
          styles.rowCard,
          showUnreadChrome && styles.rowCardUnread,
          (state.pressed ||
            ('hovered' in state && (state as { hovered?: boolean }).hovered)) &&
            !showUnreadChrome &&
            styles.rowPressedTint,
        ]}
      >
        <View style={styles.rowInner}>
          {showAvatar && item.avatarUri ? (
            <Image source={{ uri: item.avatarUri }} style={styles.avatarImage} />
          ) : (
            <NotificationListIcon kind={item.iconKind} />
          )}
          <View style={styles.rowTextCol}>
            <View style={styles.titleLine}>
              <Text style={styles.rowTitle} numberOfLines={2}>
                {item.title}
              </Text>
              {showUnreadChrome ? <View style={styles.unreadDotInline} /> : null}
            </View>
            {item.body ? (
              <Text style={styles.rowBody} numberOfLines={3}>
                {item.body}
              </Text>
            ) : null}
          </View>
        </View>
      </Pressable>
    );
  },
    [handleNotificationPress]
  );

  const listEmpty =
    !loading && displayRows.length === 0 ? (
      <View style={[styles.emptyState, { paddingBottom: listBottomPadding }]}>
        <View style={styles.emptyStateContent}>
          <ChatEmptyIcon width={72} height={72} />
          <Text style={styles.emptyStateText}>
            {filter === 'unread'
              ? STRINGS.NOTIFICATIONS.EMPTY_UNREAD
              : STRINGS.NOTIFICATIONS.EMPTY_ALL}
          </Text>
        </View>
      </View>
    ) : null;

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={Platform.OS === 'android'}
      />
      <View style={styles.screenFill} pointerEvents="none" />
      <View style={[styles.safe, { paddingTop: insets.top }]}>
        <View style={styles.topChrome}>
          <ProfileScreenGradient />
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Back"
            >
              <BackArrowIcon
                size={48}
                backgroundColor={colors.white}
                strokeColor={colors.black}
              />
            </TouchableOpacity>
            <Text style={styles.title} numberOfLines={1}>
              {STRINGS.NOTIFICATIONS.TITLE}
            </Text>
          </View>

          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tab, filter === 'all' ? styles.tabActive : styles.tabInactive]}
              onPress={() => setFilter('all')}
              activeOpacity={0.8}
            >
              <Text style={filter === 'all' ? styles.tabLabelActive : styles.tabLabelInactive}>
                {STRINGS.NOTIFICATIONS.TAB_ALL}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, filter === 'unread' ? styles.tabActive : styles.tabInactive]}
              onPress={() => setFilter('unread')}
              activeOpacity={0.8}
            >
              <View style={styles.tabUnreadWrap}>
                <Text
                  style={
                    filter === 'unread'
                      ? styles.tabLabelActive
                      : styles.tabLabelUnreadInactive
                  }
                >
                  {STRINGS.NOTIFICATIONS.TAB_UNREAD}
                </Text>
                {filter === 'all' && hasUnreadInList ? (
                  <View style={styles.requestsDot} />
                ) : null}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {loading && rows.length === 0 ? (
          <View style={[styles.loadingBlock, { paddingBottom: listBottomPadding }]}>
            <ActivityIndicator size="large" color={colors.primary[500]} />
          </View>
        ) : (
          <FlatList
            style={styles.list}
            data={displayRows}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator
            ListEmptyComponent={listEmpty}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary[500]}
                colors={
                  Platform.OS === 'android' ? [colors.primary[500]] : undefined
                }
              />
            }
            onEndReached={onEndReached}
            onEndReachedThreshold={0.4}
            contentContainerStyle={[
              styles.listContent,
              {
                paddingBottom: listBottomPadding,
                flexGrow: 1,
              },
            ]}
            ListFooterComponent={
              loadingMore ? (
                <View style={styles.loadMoreFooter}>
                  <ActivityIndicator size="small" color={colors.primary[500]} />
                </View>
              ) : null
            }
          />
        )}
      </View>
    </View>
  );
};
