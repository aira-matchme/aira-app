import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { BackArrowIcon } from '../../../assets/icons/common/BackArrowIcon';
import { STRINGS } from '../../../constants/strings';
import { colors } from '../../../theme';
import type { ProfileStackParamList } from '../../../navigation/types';
import { blockUserApi, getBlockedUsersApi } from '../../../modules/chat/api';
import { showErrorToast, showSuccessToast } from '../../../services/toast.srvice';
import { PROFILE_SCREEN_EDGES } from '../profileScreenLayout';
import { styles } from './styles';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'BlockedUsers'>;

type BlockedRow = { id: string; name: string; avatarUri: string | null; subtitle: string };

const PAGE_SIZE = 20;

function firstNonEmptyString(...values: Array<unknown>): string | undefined {
  for (const value of values) {
    if (typeof value === 'string') {
      const t = value.trim();
      if (t.length > 0) return t;
    }
  }
  return undefined;
}

function parseBlockedDate(o: Record<string, unknown>): Date | null {
  const keys = ['blockedAt', 'blockedOn', 'createdAt', 'blockedDate', 'updatedAt'];
  for (const k of keys) {
    const v = o[k];
    if (typeof v === 'string' && v.trim()) {
      const d = new Date(v);
      if (!Number.isNaN(d.getTime())) return d;
    }
    if (typeof v === 'number' && v > 0) {
      const d = new Date(v);
      if (!Number.isNaN(d.getTime())) return d;
    }
  }
  return null;
}

function formatBlockedRelative(d: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  if (diffMs < 0) {
    return `Blocked ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }
  const days = Math.floor(diffMs / 86400000);
  if (days <= 0) {
    const hours = Math.floor(diffMs / 3600000);
    if (hours <= 0) return 'Blocked today';
    if (hours === 1) return 'Blocked 1 hour ago';
    return `Blocked ${hours} hours ago`;
  }
  if (days === 1) return 'Blocked yesterday';
  if (days < 7) return `Blocked ${days} days ago`;
  return `Blocked ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

function subtitleForBlockedUser(o: Record<string, unknown>, src: Record<string, unknown>): string {
  const pre = firstNonEmptyString(
    o.blockedLabel,
    o.blockSubtitle,
    o.blockedSubtitle,
    src.blockedLabel,
    src.blockSubtitle
  );
  if (pre) {
    const t = pre.trim();
    if (/^blocked\s/i.test(t)) return t;
    return `Blocked ${t}`;
  }
  const merged = { ...src, ...o };
  const d = parseBlockedDate(merged);
  if (d) return formatBlockedRelative(d);
  return 'Blocked';
}

function mapBlockedRow(item: unknown): BlockedRow | null {
  if (!item || typeof item !== 'object') return null;
  const o = item as Record<string, unknown>;
  const nestedUser =
    o.user && typeof o.user === 'object' ? (o.user as Record<string, unknown>) : null;
  const src = nestedUser ?? o;

  const id = firstNonEmptyString(
    src._id,
    src.id,
    src.userId,
    o.blockUserId,
    o.blockedUserId,
    o.userId
  );
  if (!id) return null;

  const name =
    firstNonEmptyString(src.name, src.nickName, src.nickname, src.email) ?? 'User';

  let avatarUri: string | null = null;
  const photo = src.profilePhoto ?? src.profilePicture ?? src.avatar ?? o.profilePhoto;
  if (typeof photo === 'string') {
    avatarUri = photo;
  } else if (photo && typeof photo === 'object') {
    const u = (photo as { url?: { medium?: string; original?: string } }).url;
    avatarUri = firstNonEmptyString(u?.medium, u?.original) ?? null;
  }

  const subtitle = subtitleForBlockedUser(o, src);

  return { id, name, avatarUri, subtitle };
}

export const BlockedUsersScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [rows, setRows] = useState<BlockedRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [unblockingId, setUnblockingId] = useState<string | null>(null);

  const fetchPage = useCallback(async (pageNum: number, append: boolean) => {
    const res = await getBlockedUsersApi({ page: pageNum, limit: PAGE_SIZE });
    const next = res.items.map(mapBlockedRow).filter((r): r is BlockedRow => r != null);
    if (append) {
      setRows((prev) => {
        const seen = new Set(prev.map((r) => r.id));
        const merged = [...prev];
        for (const r of next) {
          if (!seen.has(r.id)) {
            seen.add(r.id);
            merged.push(r);
          }
        }
        return merged;
      });
    } else {
      setRows(next);
    }
    setHasMore(res.hasMore);
    setPage(pageNum);
  }, []);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      await fetchPage(1, false);
    } catch {
      setRows([]);
      setHasMore(false);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [fetchPage]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setLoadError(false);
    try {
      await fetchPage(1, false);
    } catch {
      setRows([]);
      setHasMore(false);
      setLoadError(true);
    } finally {
      setRefreshing(false);
    }
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || loading) return;
    setLoadingMore(true);
    try {
      await fetchPage(page + 1, true);
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [fetchPage, hasMore, loadingMore, loading, page]);

  useFocusEffect(
    useCallback(() => {
      loadInitial();
    }, [loadInitial])
  );

  const onUnblock = useCallback(async (id: string) => {
    setUnblockingId(id);
    try {
      await blockUserApi({ blockUserId: id, type: 'unblock' });
      setRows((prev) => prev.filter((r) => r.id !== id));
      showSuccessToast(STRINGS.BLOCKED_USERS.UNBLOCKED);
    } catch {
      showErrorToast(STRINGS.BLOCKED_USERS.UNBLOCK_FAILED);
    } finally {
      setUnblockingId(null);
    }
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: BlockedRow }) => (
      <View style={styles.card}>
        <View style={styles.cardLeft}>
          {item.avatarUri ? (
            <Image source={{ uri: item.avatarUri }} style={styles.avatar} resizeMode="cover" />
          ) : (
            <View style={styles.avatar} />
          )}
          <View style={styles.textCol}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.subtitle} numberOfLines={2}>
              {item.subtitle}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.unblockPress}
          onPress={() => onUnblock(item.id)}
          disabled={unblockingId === item.id}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {unblockingId === item.id ? (
            <ActivityIndicator size="small" color={colors.primary.purple} />
          ) : (
            <Text style={styles.unblockLabel}>{STRINGS.BLOCKED_USERS.UNBLOCK}</Text>
          )}
        </TouchableOpacity>
      </View>
    ),
    [onUnblock, unblockingId]
  );

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.root} edges={PROFILE_SCREEN_EDGES}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.headerBlock}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            style={styles.backButtonWrap}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <BackArrowIcon size={48} backgroundColor="rgba(255,255,255,0.5)" strokeColor={colors.black} />
          </TouchableOpacity>
          <Text style={styles.sectionTitle}>{STRINGS.BLOCKED_USERS.SECTION_TITLE}</Text>
        </View>

        <View style={styles.mainBody}>
          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color={colors.primary.purple} />
            </View>
          ) : (
            <FlatList
              style={styles.list}
              data={rows}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              ItemSeparatorComponent={() => <View style={styles.rowSeparator} />}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={colors.primary.purple}
                />
              }
              onEndReached={loadMore}
              onEndReachedThreshold={0.35}
              ListEmptyComponent={
                <View style={styles.centered}>
                  {loadError ? (
                    <Text style={styles.errorText}>{STRINGS.BLOCKED_USERS.LOAD_ERROR}</Text>
                  ) : (
                    <Text style={styles.emptyText}>{STRINGS.BLOCKED_USERS.EMPTY}</Text>
                  )}
                </View>
              }
            />
          )}
        </View>

        <View style={styles.bottomFooter}>
          {loadingMore ? (
            <View style={styles.bottomFooterSpinner}>
              <ActivityIndicator size="small" color={colors.primary.purple} />
            </View>
          ) : null}
          <Text style={styles.footerNote}>{STRINGS.BLOCKED_USERS.NOTE}</Text>
        </View>
      </SafeAreaView>
    </View>
  );
};
