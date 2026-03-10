import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StatusBar,
  Platform,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ChatStackParamList } from '../../navigation/types';

import { BellIcon } from '../../assets/icons/common/BellIcon';
import { ChatEmptyIcon } from '../../assets/icons/home_figma/ChatEmptyIcon';
import { PinnedIcon } from '../../assets/icons/common/PinnedIcon';
import { DeleteIcon } from '../../assets/icons/common/DeleteIcon';
import { STRINGS } from '../../constants/strings';
import { colors } from '../../theme';
import { styles } from './styles';
import { ProfileScreenGradient } from '../../components/ProfileScreenGradient';
import { getChatListApi, getPendingChatsApi, mapChatResponseToItem, pinChatApi, unpinChatApi, deleteChatApi } from '../../modules/chat/api';

type ChatItem = {
  id: string;
  name: string;
  avatar: { uri: string } | null;
  preview: string;
  previewDraft?: string; // if set, show "Draft: " + this in purple
  time: string;
  unreadCount?: number;
  pinned?: boolean;
  otherUserId?: string; // for request mode (block API)
};

/** Capitalized initials from name: e.g. "Kelsey Scott" → "KS", "kkbhalani98" → "K" */
function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '?';
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const first = parts[0].charAt(0);
    const second = parts[1].charAt(0);
    return (first + second).toUpperCase();
  }
  return trimmed.charAt(0).toUpperCase();
}

const TAB_BAR_VISIBLE_HEIGHT = 56 + 24;
const PAGE_SIZE = 20;

export const ChatScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<ChatStackParamList, 'ChatList'>>();
  const listBottomPadding = TAB_BAR_VISIBLE_HEIGHT + insets.bottom;

  type ActiveTab = 'chats' | 'requests';
  const [activeTab, setActiveTab] = useState<ActiveTab>('chats');
  const [requestsCount, setRequestsCount] = useState(0);

  const [data, setData] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextPage, setNextPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuChatId, setMenuChatId] = useState<string | null>(null);

  const [requestsData, setRequestsData] = useState<ChatItem[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsLoadingMore, setRequestsLoadingMore] = useState(false);
  const [requestsNextPage, setRequestsNextPage] = useState(1);
  const [requestsHasMore, setRequestsHasMore] = useState(true);

  const fetchPage = useCallback((page: number) => {
    return getChatListApi({ page, limit: PAGE_SIZE }).then((res) => {
      const inner = res.data;
      const raw = inner?.list ?? [];
      const list = Array.isArray(raw)
        ? raw.map((item) => mapChatResponseToItem(item, 0))
        : [];
      const meta = inner?.meta;
      const hasMorePages = meta
        ? meta.currentPage < meta.totalPages
        : list.length >= PAGE_SIZE;
      return { list, hasMore: hasMorePages };
    });
  }, []);

  const fetchPendingPage = useCallback((page: number) => {
    return getPendingChatsApi({ page, limit: PAGE_SIZE }).then((res) => {
      const inner = res.data;
      const raw = inner?.list ?? [];
      const list = Array.isArray(raw)
        ? raw.map((item) => mapChatResponseToItem(item, 0))
        : [];
      const meta = inner?.meta;
      const hasMorePages = meta
        ? meta.currentPage < meta.totalPages
        : list.length >= PAGE_SIZE;
      const total = meta?.total ?? list.length;
      return { list, hasMore: hasMorePages, total };
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNextPage(1);
    setHasMore(true);
    fetchPage(1)
      .then(({ list, hasMore: more }) => {
        if (cancelled) return;
        setData(list);
        setHasMore(more);
        setNextPage(2);
      })
      .catch(() => {
        if (!cancelled) setData([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [fetchPage]);

  useEffect(() => {
    let cancelled = false;
    setRequestsLoading(true);
    setRequestsNextPage(1);
    setRequestsHasMore(true);
    fetchPendingPage(1)
      .then(({ list, hasMore: more, total }) => {
        if (cancelled) return;
        setRequestsData(list);
        setRequestsHasMore(more);
        setRequestsNextPage(2);
        setRequestsCount(total);
      })
      .catch(() => {
        if (!cancelled) {
          setRequestsData([]);
          setRequestsCount(0);
        }
      })
      .finally(() => {
        if (!cancelled) setRequestsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [fetchPendingPage]);

  const isFirstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      let cancelled = false;
      fetchPage(1).then(({ list, hasMore: more }) => {
        if (cancelled) return;
        setData(list);
        setHasMore(more);
        setNextPage(2);
      }).catch(() => {});
      fetchPendingPage(1).then(({ list, hasMore: more, total }) => {
        if (cancelled) return;
        setRequestsData(list);
        setRequestsHasMore(more);
        setRequestsNextPage(2);
        setRequestsCount(total);
      }).catch(() => {});
      return () => { cancelled = true; };
    }, [fetchPage, fetchPendingPage])
  );

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;
    const page = nextPage;
    setLoadingMore(true);
    fetchPage(page)
      .then(({ list, hasMore: more }) => {
        setData((prev) => [...prev, ...list]);
        setHasMore(more);
        setNextPage((p) => p + 1);
      })
      .catch(() => {})
      .finally(() => setLoadingMore(false));
  }, [loading, loadingMore, hasMore, nextPage, fetchPage]);

  const loadMoreRequests = useCallback(() => {
    if (requestsLoading || requestsLoadingMore || !requestsHasMore) return;
    const page = requestsNextPage;
    setRequestsLoadingMore(true);
    fetchPendingPage(page)
      .then(({ list, hasMore: more }) => {
        setRequestsData((prev) => [...prev, ...list]);
        setRequestsHasMore(more);
        setRequestsNextPage((p) => p + 1);
      })
      .catch(() => {})
      .finally(() => setRequestsLoadingMore(false));
  }, [requestsLoading, requestsLoadingMore, requestsHasMore, requestsNextPage, fetchPendingPage]);

  const handlePinChat = useCallback(() => {
    if (!menuChatId) return;
    const item = data.find((c) => c.id === menuChatId);
    const currentlyPinned = item?.pinned ?? false;
    const apiCall = currentlyPinned ? unpinChatApi(menuChatId) : pinChatApi(menuChatId);
    setMenuVisible(false);
    setMenuChatId(null);
    apiCall
      .then(() => {
        setData((prev) =>
          prev.map((c) =>
            c.id === menuChatId ? { ...c, pinned: !currentlyPinned } : c
          )
        );
      })
      .catch(() => {
        // Pin update failed
      });
  }, [menuChatId, data]);

  const handleDelete = useCallback(() => {
    if (!menuChatId) return;
    const chatIdToDelete = menuChatId;
    setMenuVisible(false);
    setMenuChatId(null);
    deleteChatApi(chatIdToDelete)
      .then(() => {
        setData((prev) => prev.filter((item) => item.id !== chatIdToDelete));
        setSelectedChatId((id) => (id === chatIdToDelete ? null : id));
      })
      .catch(() => {
        // Delete failed
      });
  }, [menuChatId]);

  const openContextMenu = useCallback((item: ChatItem) => {
    setMenuChatId(item.id);
    setMenuVisible(true);
  }, []);

  const openChatDetail = useCallback(
    (item: ChatItem, fromRequests: boolean) => {
      navigation.navigate('ChatDetail', {
        chatId: item.id,
        name: item.name,
        avatar: item.avatar ?? undefined,
        otherUserId: item.otherUserId,
        ...(fromRequests && { isRequest: true }),
      });
    },
    [navigation],
  );

  const renderItem = ({ item }: { item: ChatItem }, fromRequests = false) => {
    const isDraft = !!item.previewDraft;
    const rawPreview = isDraft
      ? `${STRINGS.CHAT.DRAFT_PREFIX} ${item.previewDraft}`
      : item.preview;
    const previewText = typeof rawPreview === 'string' ? rawPreview : '';

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => openChatDetail(item, fromRequests)}
        onLongPress={() => !fromRequests && openContextMenu(item)}
      >
        {item.avatar ? (
          <Image source={item.avatar} style={styles.avatar} resizeMode="cover" />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitials}>{getInitials(item.name)}</Text>
          </View>
        )}
        <View style={styles.body}>
          <View style={styles.bodyTextCol}>
            <View style={styles.nameRow}>
              <View style={styles.nameWrap}>
                <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
                  {item.name}
                </Text>
              </View>
              {item.unreadCount != null && item.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadCount}>{item.unreadCount}</Text>
                </View>
              )}
            </View>
            <Text
              style={[styles.preview, isDraft && styles.previewDraft]}
              numberOfLines={1}
            >
              {previewText}
            </Text>
          </View>
          <View style={styles.timeCol}>
            <Text style={styles.time}>{item.time}</Text>
            {item.pinned && (
              <View style={styles.pinnedIconWrap}>
                <PinnedIcon size={18} color={colors.neutral[600]} />
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor='transparent'
        translucent={Platform.OS === 'android'}
      />
      <View style={styles.screenFill} pointerEvents="none" />
      <View style={[styles.safe, { paddingTop: insets.top }]}>
        <ProfileScreenGradient/>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{STRINGS.CHAT.TITLE}</Text>
            <TouchableOpacity style={styles.notifButton} activeOpacity={0.7}>
              <BellIcon size={20} color={colors.black} />
            </TouchableOpacity>
          </View>

          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'chats' ? styles.tabActive : styles.tabInactive]}
              onPress={() => setActiveTab('chats')}
              activeOpacity={0.8}
            >
              <Text style={activeTab === 'chats' ? styles.tabLabelActive : styles.tabLabelInactive}>
                {STRINGS.CHAT.TAB_CHATS}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'requests' ? styles.tabActive : styles.tabInactive]}
              onPress={() => setActiveTab('requests')}
              activeOpacity={0.8}
            >
              <View style={styles.tabRequestsWrap}>
                <Text style={activeTab === 'requests' ? styles.tabLabelActive : styles.tabLabelInactive}>
                  {STRINGS.CHAT.TAB_REQUESTS}
                </Text>
                {requestsCount > 0 && <View style={styles.requestsDot} />}
              </View>
            </TouchableOpacity>
          </View>

        {activeTab === 'requests' ? (
          requestsLoading ? (
            <View style={[styles.emptyState, { paddingBottom: listBottomPadding }]}>
              <ActivityIndicator size="large" color={colors.primary[500]} />
            </View>
          ) : requestsData.length === 0 ? (
            <View style={[styles.emptyState, { paddingBottom: listBottomPadding }]}>
              <View style={styles.emptyStateContent}>
                <ChatEmptyIcon width={72} height={72} />
                <Text style={styles.emptyStateText}>
                  {STRINGS.CHAT.REQUESTS_EMPTY_MESSAGE}
                </Text>
              </View>
            </View>
          ) : (
            <FlatList
              style={styles.list}
              data={requestsData}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => renderItem({ item }, true)}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={{ paddingBottom: listBottomPadding }}
              onEndReached={loadMoreRequests}
              onEndReachedThreshold={0.4}
              ListFooterComponent={
                requestsLoadingMore ? (
                  <View style={styles.loadMoreFooter}>
                    <ActivityIndicator size="small" color={colors.primary[500]} />
                  </View>
                ) : null
              }
            />
          )
        ) : loading ? (
          <View style={[styles.emptyState, { paddingBottom: listBottomPadding }]}>
            <ActivityIndicator size="large" color={colors.primary[500]} />
          </View>
        ) : !loading && data.length === 0 ? (
          <View style={[styles.emptyState, { paddingBottom: listBottomPadding }]}>
            <View style={styles.emptyStateContent}>
              <ChatEmptyIcon width={72} height={72} />
              <Text style={styles.emptyStateText}>
                {STRINGS.CHAT.EMPTY_MESSAGE}
              </Text>
            </View>
          </View>
        ) : (
          <FlatList
            style={styles.list}
            data={data}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => renderItem({ item }, false)}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{ paddingBottom: listBottomPadding }}
            onEndReached={loadMore}
            onEndReachedThreshold={0.4}
            ListFooterComponent={
              loadingMore ? (
                <View style={styles.loadMoreFooter}>
                  <ActivityIndicator size="small" color={colors.primary[500]} />
                </View>
              ) : null
            }
          />
        )}

        <Modal
          visible={menuVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setMenuVisible(false)}
        >
          <Pressable
            style={styles.contextMenuBackdrop}
            onPress={() => setMenuVisible(false)}
          >
            <View style={styles.contextMenu}>
              <TouchableOpacity
                style={styles.contextMenuItem}
                onPress={handlePinChat}
                activeOpacity={0.7}
              >
                <PinnedIcon size={20} color={colors.black} />
                <Text style={styles.contextMenuLabel}>{STRINGS.CHAT.PIN_CHAT}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.contextMenuItem}
                onPress={handleDelete}
                activeOpacity={0.7}
              >
                <DeleteIcon size={20} color={colors.semantic.error} />
                <Text style={[styles.contextMenuLabel, styles.contextMenuLabelDanger]}>
                  {STRINGS.CHAT.DELETE}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
      </View>
    </View>
  );
};
