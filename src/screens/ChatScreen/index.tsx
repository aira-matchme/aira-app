import React, { useState, useCallback, useEffect } from 'react';
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
import { useNavigation } from '@react-navigation/native';
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
import { getChatListApi, mapChatResponseToItem } from '../../modules/chat/api';

type ChatItem = {
  id: string;
  name: string;
  avatar: { uri: string } | null;
  preview: string;
  previewDraft?: string; // if set, show "Draft: " + this in purple
  time: string;
  unreadCount?: number;
  pinned?: boolean;
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

  const [data, setData] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextPage, setNextPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuChatId, setMenuChatId] = useState<string | null>(null);

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

  const handlePinChat = useCallback(() => {
    if (!menuChatId) return;
    setData((prev) =>
      prev.map((item) =>
        item.id === menuChatId ? { ...item, pinned: !item.pinned } : item
      )
    );
    setMenuVisible(false);
    setMenuChatId(null);
  }, [menuChatId]);

  const handleDelete = useCallback(() => {
    if (!menuChatId) return;
    setData((prev) => prev.filter((item) => item.id !== menuChatId));
    setSelectedChatId((id) => (id === menuChatId ? null : id));
    setMenuVisible(false);
    setMenuChatId(null);
  }, [menuChatId]);

  const openContextMenu = useCallback((item: ChatItem) => {
    setMenuChatId(item.id);
    setMenuVisible(true);
  }, []);

  const renderItem = ({ item }: { item: ChatItem }) => {
    const isDraft = !!item.previewDraft;
    const rawPreview = isDraft
      ? `${STRINGS.CHAT.DRAFT_PREFIX} ${item.previewDraft}`
      : item.preview;
    const previewText = typeof rawPreview === 'string' ? rawPreview : '';

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('ChatDetail', { chatId: item.id, name: item.name, avatar: item.avatar ?? undefined })}
        onLongPress={() => openContextMenu(item)}
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

        {loading ? (
          <View style={[styles.emptyState, { paddingBottom: listBottomPadding }]}>
            <ActivityIndicator size="large" color={colors.primary[500]} />
          </View>
        ) : data.length === 0 ? (
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
            renderItem={renderItem}
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
