import React, { useState, useCallback } from 'react';
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

import type { ChatStackParamList } from '../../navigation/types';

import { BellIcon } from '../../assets/icons/common/BellIcon';
import { PinnedIcon } from '../../assets/icons/common/PinnedIcon';
import { DeleteIcon } from '../../assets/icons/common/DeleteIcon';
import { STRINGS } from '../../constants/strings';
import { colors } from '../../theme';
import { styles } from './styles';

type ChatItem = {
  id: string;
  name: string;
  avatar: number;
  preview: string;
  previewDraft?: string; // if set, show "Draft: " + this in purple
  time: string;
  unreadCount?: number;
  pinned?: boolean;
};

const AVATAR_IMAGE = require('../../assets/images/Profile1.png');

const TAB_BAR_VISIBLE_HEIGHT = 56 + 24;

const INITIAL_DATA: ChatItem[] = [
  { id: '1', name: 'Kelsey Scott', avatar: AVATAR_IMAGE, preview: STRINGS.CHAT.PREVIEW_HEY, time: STRINGS.CHAT.JUST_NOW, unreadCount: 3 },
  { id: '2', name: 'Kelsey Scott', avatar: AVATAR_IMAGE, preview: STRINGS.CHAT.DRAFT_PREVIEW, previewDraft: STRINGS.CHAT.DRAFT_PREVIEW, time: '4:54 pm', pinned: true },
  { id: '3', name: 'Kelsey Scott', avatar: AVATAR_IMAGE, preview: STRINGS.CHAT.PREVIEW_HEY, time: '4:54 pm' },
  { id: '4', name: 'Kelsey Scott', avatar: AVATAR_IMAGE, preview: STRINGS.CHAT.PREVIEW_HEY, time: STRINGS.CHAT.YESTERDAY },
  { id: '5', name: 'Kelsey Scott', avatar: AVATAR_IMAGE, preview: STRINGS.CHAT.PREVIEW_HEY, time: '10/02/26' },
  { id: '6', name: 'Kelsey Scott', avatar: AVATAR_IMAGE, preview: STRINGS.CHAT.PREVIEW_HEY, time: '10/02/26' },
];

export const ChatScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<ChatStackParamList, 'ChatList'>>();
  const listBottomPadding = TAB_BAR_VISIBLE_HEIGHT + insets.bottom;

  const [data, setData] = useState<ChatItem[]>(INITIAL_DATA);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuChatId, setMenuChatId] = useState<string | null>(null);

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
    const previewText = isDraft
      ? `${STRINGS.CHAT.DRAFT_PREFIX} ${item.previewDraft}`
      : item.preview;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('ChatDetail', { chatId: item.id, name: item.name, avatar: item.avatar })}
        onLongPress={() => openContextMenu(item)}
      >
        <Image source={item.avatar} style={styles.avatar} resizeMode="cover" />
        <View style={styles.body}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
            {item.unreadCount != null && item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>{item.unreadCount}</Text>
              </View>
            )}
          </View>
          <View style={styles.previewRow}>
            <Text
              style={[
                styles.preview,
                isDraft && styles.previewDraft,
              ]}
              numberOfLines={1}
            >
              {previewText}
            </Text>
            <View style={styles.rightCol}>
              <Text style={styles.time}>{item.time}</Text>
              {item.pinned && (
                <View style={styles.pinnedIconWrap}>
                  <PinnedIcon size={18} color={colors.neutral[600]} />
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.primary[50]}
        translucent={Platform.OS === 'android'}
      />
      <View style={styles.screenFill} pointerEvents="none" />
      <View style={[styles.safe, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={[colors.primary[50], colors.white]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerRow}>
            <Text style={styles.title}>{STRINGS.CHAT.TITLE}</Text>
            <TouchableOpacity style={styles.notifButton} activeOpacity={0.7}>
              <BellIcon size={20} color={colors.black} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <FlatList
          style={styles.list}
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={{ paddingBottom: listBottomPadding }}
        />

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
