import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Keyboard,
  Platform,
  TextInput,
  LayoutChangeEvent,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { TabStackParamList } from '../navigation/types';
import { useComposerKeyboardOffset } from '../hooks/useComposerKeyboardOffset';

import { BackArrowIcon } from '../assets/icons/common/BackArrowIcon';
import { TabAICenterIcon } from '../assets/icons/tabs/TabAICenterIcon';
// import { PlusIcon } from '../assets/icons/common/PlusIcon';
// import { MicIcon } from '../assets/icons/common/MicIcon';
import { GradientText } from '../components/GradientText';
import { colors, typography } from '../theme';
import { ProfileScreenGradient } from '../components/ProfileScreenGradient';
import { ForwardArrowIcon } from '../assets/icons/common/ForwardArrowIcon';
import { apiClient } from '../services/api/client';
import { endpoints } from '../services/api/endpoints';

type AiraBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'divider' }
  | { type: 'ordered'; index: number; text: string }
  | { type: 'bullet'; indent: 0 | 1; text: string }
  | { type: 'heading'; text: string }
  | { type: 'bullet_item'; title: string; description: string }
  | { type: 'follow_up'; text: string }
  | {
      type: 'missing_info_list';
      options: Array<{
        _id: string;
        name?: string;
        nickName?: string;
        photos?: Array<{ url?: string; order?: number }>;
      }>;
    };

type ChatItem =
  | {
      id: string;
      from: 'user';
      text: string;
      profileSelection?: {
        nickname: string;
        profileUrl?: string;
      };
    }
  | { id: string; from: 'aira'; blocks: AiraBlock[] };

/** Split `**bold**` segments (markdown-style) for inline bold in React Native `Text`. */
function splitMarkdownBoldSegments(text: string): Array<{ text: string; bold: boolean }> {
  const out: Array<{ text: string; bold: boolean }> = [];
  let rest = text;
  while (rest.length > 0) {
    const start = rest.indexOf('**');
    if (start === -1) {
      out.push({ text: rest, bold: false });
      break;
    }
    if (start > 0) {
      out.push({ text: rest.slice(0, start), bold: false });
    }
    const afterOpen = rest.slice(start + 2);
    const end = afterOpen.indexOf('**');
    if (end === -1) {
      out.push({ text: rest.slice(start), bold: false });
      break;
    }
    out.push({ text: afterOpen.slice(0, end), bold: true });
    rest = afterOpen.slice(end + 2);
  }
  return out;
}

function paragraphChildrenWithBold(text: string) {
  return splitMarkdownBoldSegments(text).map((seg, i) =>
    seg.bold ? (
      <Text key={i} style={{ fontWeight: '700' }}>
        {seg.text}
      </Text>
    ) : (
      seg.text
    )
  );
}

export const MatchScreen = () => {
  const navigation = useNavigation<BottomTabNavigationProp<TabStackParamList, 'Match'>>();
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [message, setMessage] = React.useState('');
  const [inputResetKey, setInputResetKey] = React.useState(0);
  const [chatItems, setChatItems] = React.useState<ChatItem[]>([]);
  const scrollRef = React.useRef<ScrollView>(null);
  const lastUserMessageRef = React.useRef<string>('');
  const [isTyping, setIsTyping] = React.useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = React.useState(false);
  const historyPageRef = React.useRef(1);
  const historyHasMoreRef = React.useRef(true);
  const isLoadingMoreHistoryRef = React.useRef(false);
  const historyLimit = 10;
  const scrollYRef = React.useRef(0);
  const lastScrollYRef = React.useRef(0);
  const userHasScrolledRef = React.useRef(false);
  const shouldAutoScrollRef = React.useRef(true);
  const reenableAutoScrollTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentHeightRef = React.useRef(0);
  const pendingRestoreScrollRef = React.useRef<{
    beforeY: number;
    beforeContentH: number;
  } | null>(null);
  const [composerHeight, setComposerHeight] = React.useState(100);
  const bottomSafeInset = insets.bottom;
  const { composerBottomOffset, isKeyboardVisible, resetKeyboard } = useComposerKeyboardOffset({
    windowHeight,
    scrollViewRef: scrollRef,
  });

  const hasText = message.trim().length > 0;
  const isInputEmpty = message.length === 0;
  const isMultilineComposer = message.includes('\n');
  const isCompactComposer = isInputEmpty && !isMultilineComposer;
  const hasChat = chatItems.length > 0;
  const lastUserText = React.useMemo(() => {
    // When the user picks a `missing_info` card, we need "the last user message".
    // Prefer the last `chatItems` user bubble; fall back to whatever was stored
    // during the latest manual send.
    for (let i = chatItems.length - 1; i >= 0; i--) {
      const item = chatItems[i];
      if (item.from === 'user') return item.text;
    }
    return lastUserMessageRef.current;
  }, [chatItems]);

  const loadChatHistory = React.useCallback(async (opts?: { page?: number; mode?: 'replace' | 'prepend' }) => {
    try {
      const page = opts?.page ?? 1;
      const mode = opts?.mode ?? 'replace';
      if (mode === 'replace') {
        setIsLoadingHistory(true);
      } else {
        isLoadingMoreHistoryRef.current = true;
      }
      const response = await apiClient.post(
        endpoints.chatbot.getChatbotMessages,
        { page, limit: historyLimit },
        { timeout: 60000 }
      );

      const rawList =
        response.data?.data?.list ??
        response.data?.list ??
        [];

      const receivedCount = Array.isArray(rawList) ? rawList.length : 0;
      historyHasMoreRef.current = receivedCount >= historyLimit;
      historyPageRef.current = page;

      // Backend returns newest first; sort by _id so we always render oldest → newest.
      const items = Array.isArray(rawList)
        ? [...rawList].sort((a, b) => {
            const aId = String(a._id ?? a.id ?? '');
            const bId = String(b._id ?? b.id ?? '');
            if (aId === bId) return 0;
            return aId < bId ? -1 : 1;
          })
        : [];

      const mapped: ChatItem[] = items.length
        ? items.map((item: any, index: number) => {
            const role = (item.role ?? '').toString().toLowerCase();
            const from: 'user' | 'aira' = role === 'user' ? 'user' : 'aira';

            if (from === 'user') {
              const userContent = item.content;
              const profileSelection =
                Array.isArray(userContent)
                  ? userContent.find((entry: any) => entry?.type === 'profile_selection')
                  : undefined;
              const text: string =
                typeof userContent === 'string'
                  ? userContent
                  : profileSelection?.nickname ??
                    profileSelection?.name ??
                    item.message ??
                    item.text ??
                    '';
              return {
                id: String(item._id ?? item.id ?? index),
                from: 'user',
                text,
                profileSelection: profileSelection
                  ? {
                      nickname: String(
                        profileSelection?.nickname ?? profileSelection?.name ?? 'Selected profile'
                      ),
                      profileUrl:
                        typeof profileSelection?.profileUrl === 'string'
                          ? profileSelection.profileUrl
                          : undefined,
                    }
                  : undefined,
              };
            }

            const blocks: AiraBlock[] = [];
            const rawContentCandidate =
              item.content ?? item?.data?.content ?? item?.data?.data?.content ?? undefined;
            const rawResponseTypeCandidate =
              item.response_type ??
              item?.data?.response_type ??
              item?.data?.data?.response_type ??
              (typeof item?.content === 'object' && item?.content != null
                ? (item.content as any).response_type
                : undefined);

            const responseType = String(rawResponseTypeCandidate ?? '').toLowerCase();
            // Backend sometimes nests the real payload under `content.content`.
            const contentArray: any[] | undefined = Array.isArray(rawContentCandidate)
              ? rawContentCandidate
              : rawContentCandidate &&
                  typeof rawContentCandidate === 'object' &&
                  Array.isArray((rawContentCandidate as any).content)
                ? (rawContentCandidate as any).content
                : rawContentCandidate &&
                    typeof rawContentCandidate === 'object' &&
                    Array.isArray((rawContentCandidate as any).content?.content)
                  ? (rawContentCandidate as any).content.content
                : undefined;

            if (responseType === 'missing_info' && contentArray) {
              const options = contentArray
                .map((opt: any) => {
                  const id = String(opt?._id ?? opt?.id ?? '');
                  if (!id) return null;
                  return {
                    _id: id,
                    name: opt?.name,
                    nickName: opt?.nickName,
                    photos: Array.isArray(opt?.photos)
                      ? opt.photos.map((p: any) => ({ url: p?.url, order: p?.order }))
                      : undefined,
                  };
                })
                .filter((x): x is NonNullable<typeof x> => x != null);

              if (options.length > 0) {
                blocks.push({ type: 'missing_info_list', options });
              } else {
                // Backend can return missing_info as explanatory text blocks (e.g. type: info_missing).
                for (const block of contentArray) {
                  const infoText =
                    typeof block?.text === 'string'
                      ? block.text
                      : typeof block?.message === 'string'
                        ? block.message
                        : '';
                  if (infoText) {
                    blocks.push({ type: 'paragraph', text: infoText });
                  }
                }
              }
            } else if (responseType === 'rich_content' && contentArray) {
              for (const block of contentArray) {
                if (block.type === 'heading' && block.text) {
                  blocks.push({ type: 'heading', text: block.text });
                } else if (block.type === 'bullet_list' && Array.isArray(block.items)) {
                  for (const it of block.items) {
                    if (!it) continue;
                    blocks.push({
                      type: 'bullet_item',
                      title: it.title ?? '',
                      description: it.description ?? '',
                    });
                  }
                } else if (block.type === 'follow_up' && block.text) {
                  blocks.push({ type: 'follow_up', text: block.text });
                } else if (block.type === 'paragraph' && block.text) {
                  blocks.push({ type: 'paragraph', text: block.text });
                }
              }
            } else {
              const fallbackText: string =
                typeof rawContentCandidate === 'string'
                  ? rawContentCandidate
                  : item.message ?? item.text ?? '';
              if (fallbackText) {
                blocks.push({ type: 'paragraph', text: fallbackText });
              }
            }

            // If backend returned something we don't parse into blocks, fall back to a string payload.
            if (blocks.length === 0) {
              const fallbackText: string =
                typeof rawContentCandidate === 'string'
                  ? rawContentCandidate
                  : item?.message ?? item?.text ?? item?.data?.message ?? item?.data?.text ?? '';
              if (fallbackText) {
                blocks.push({ type: 'paragraph', text: fallbackText });
              }
            }

            return {
              id: String(item._id ?? item.id ?? index),
              from: 'aira',
              blocks,
            };
          })
        : [];

      setChatItems((prev) => {
        if (mode === 'replace') return mapped;
        if (mapped.length === 0) return prev;
        const seen = new Set<string>();
        const merged = [...mapped, ...prev].filter((it) => {
          if (seen.has(it.id)) return false;
          seen.add(it.id);
          return true;
        });
        return merged;
      });
    } catch {
      // ignore history errors for now
    } finally {
      setIsLoadingHistory(false);
      isLoadingMoreHistoryRef.current = false;
    }
  }, []);

  const buildBlocksFromBotResponse = React.useCallback(
    (item: any): AiraBlock[] => {
      const blocks: AiraBlock[] = [];

      const rawContentCandidate =
        item?.content ?? item?.data?.content ?? item?.data?.data?.content ?? undefined;
      const rawResponseTypeCandidate =
        item?.response_type ??
        item?.data?.response_type ??
        item?.data?.data?.response_type ??
        (typeof item?.content === 'object' && item?.content != null
          ? (item.content as any).response_type
          : undefined);

      const responseType = String(rawResponseTypeCandidate ?? '').toLowerCase();

      // Backend sometimes nests the real payload under `content.content`.
      const contentArray: any[] | undefined = Array.isArray(rawContentCandidate)
        ? rawContentCandidate
        : rawContentCandidate &&
            typeof rawContentCandidate === 'object' &&
            Array.isArray((rawContentCandidate as any).content)
          ? (rawContentCandidate as any).content
          : rawContentCandidate &&
              typeof rawContentCandidate === 'object' &&
              Array.isArray((rawContentCandidate as any).content?.content)
            ? (rawContentCandidate as any).content.content
          : undefined;

      if (responseType === 'missing_info' && contentArray) {
        const options = contentArray
          .map((opt: any) => {
            const id = String(opt?._id ?? opt?.id ?? '');
            if (!id) return null;
            return {
              _id: id,
              name: opt?.name,
              nickName: opt?.nickName,
              photos: Array.isArray(opt?.photos)
                ? opt.photos.map((p: any) => ({ url: p?.url, order: p?.order }))
                : undefined,
            };
          })
          .filter((x): x is NonNullable<typeof x> => x != null);

        if (options.length > 0) {
          blocks.push({ type: 'missing_info_list', options });
        } else {
          // Handle text-only missing_info payloads returned by backend.
          for (const block of contentArray) {
            const infoText =
              typeof block?.text === 'string'
                ? block.text
                : typeof block?.message === 'string'
                  ? block.message
                  : '';
            if (infoText) {
              blocks.push({ type: 'paragraph', text: infoText });
            }
          }
        }
      } else if (responseType === 'rich_content' && contentArray) {
        for (const block of contentArray) {
          if (block?.type === 'heading' && block?.text) {
            blocks.push({ type: 'heading', text: block.text });
          } else if (block?.type === 'bullet_list' && Array.isArray(block.items)) {
            for (const it of block.items) {
              if (!it) continue;
              blocks.push({
                type: 'bullet_item',
                title: it.title ?? '',
                description: it.description ?? '',
              });
            }
          } else if (block?.type === 'follow_up' && block?.text) {
            blocks.push({ type: 'follow_up', text: block.text });
          } else if (block?.type === 'paragraph' && block?.text) {
            blocks.push({ type: 'paragraph', text: block.text });
          }
        }
      } else {
        const fallbackText: string =
          typeof rawContentCandidate === 'string' ? rawContentCandidate : item?.message ?? item?.text ?? '';
        if (fallbackText) {
          blocks.push({ type: 'paragraph', text: fallbackText });
        }
      }

      // If rich_content was parsed but produced no blocks, still try to show a fallback text.
      if (blocks.length === 0) {
        const fallbackText: string =
          typeof rawContentCandidate === 'string'
            ? rawContentCandidate
            : item?.message ?? item?.text ?? item?.data?.message ?? item?.data?.text ?? '';
        if (fallbackText) {
          blocks.push({ type: 'paragraph', text: fallbackText });
        }
      }

      return blocks;
    },
    []
  );

  const handleSend = React.useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      if (isTyping) return;
      lastUserMessageRef.current = trimmed;
      // Optimistically show the user's message immediately
      const tempId = `temp_${Date.now()}`;
      setChatItems((prev) => [
        ...prev,
        { id: tempId, from: 'user', text: trimmed },
      ]);
      setIsTyping(true);
      setMessage('');
      setInputResetKey((k) => k + 1);

      requestAnimationFrame(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      });

      try {

        const response = await apiClient.post(
          endpoints.chatbot.postChatbotMessages,
          {
            message: trimmed,
            receiverId: '',
          },
          { timeout: 60000 }
        );

        const postData = response?.data?.data ?? response?.data ?? response;
        const blocks = buildBlocksFromBotResponse(postData);
        if (blocks.length > 0) {
          setChatItems((prev) => [
            ...prev,
            {
              id: `aira_${Date.now()}`,
              from: 'aira',
              blocks,
            },
          ]);
        }

        setIsTyping(false);
        requestAnimationFrame(() => {
          scrollRef.current?.scrollToEnd({ animated: true });
        });
      } catch {
        setIsTyping(false);
      }
    },
    [isTyping, buildBlocksFromBotResponse]
  );

  const sendChatWithReceiver = React.useCallback(
    async (messageText: string, receiverId: string) => {
      const bubbleText = messageText.trim();
      if (!bubbleText) return;
      const payloadMessage = lastUserMessageRef.current.trim() || bubbleText;
      if (isTyping) return;

      const tempId = `temp_${Date.now()}`;
      setChatItems((prev) => [
        ...prev,
        { id: tempId, from: 'user', text: bubbleText },
      ]);
      setIsTyping(true);
      setMessage('');
      setInputResetKey((k) => k + 1);

      requestAnimationFrame(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      });

      try {
        const shouldLog = (globalThis as any).__DEV__ ?? false;
        if (shouldLog) {
          // Debug: verify the exact payload we send to the chatbot
          console.log('[MatchScreen] sendChatWithReceiver payload', {
            message: payloadMessage,
            bubbleMessage: bubbleText,
            receiverId,
          });
        }

        const response = await apiClient.post(
          endpoints.chatbot.postChatbotMessages,
          {
            message: payloadMessage,
            receiverId,
          },
          { timeout: 60000 }
        );

        const postData = response?.data?.data ?? response?.data ?? response;
        const blocks = buildBlocksFromBotResponse(postData);
        if (blocks.length > 0) {
          setChatItems((prev) => [
            ...prev,
            {
              id: `aira_${Date.now()}`,
              from: 'aira',
              blocks,
            },
          ]);
        }

        setIsTyping(false);
        requestAnimationFrame(() => {
          scrollRef.current?.scrollToEnd({ animated: true });
        });
      } catch {
        setIsTyping(false);
      }
    },
    [isTyping, buildBlocksFromBotResponse]
  );

  useFocusEffect(
    React.useCallback(() => {
      historyPageRef.current = 1;
      historyHasMoreRef.current = true;
      pendingRestoreScrollRef.current = null;
      shouldAutoScrollRef.current = true;
      if (reenableAutoScrollTimeoutRef.current) {
        clearTimeout(reenableAutoScrollTimeoutRef.current);
        reenableAutoScrollTimeoutRef.current = null;
      }
      void loadChatHistory({ page: 1, mode: 'replace' });
      return () => {
        if (reenableAutoScrollTimeoutRef.current) {
          clearTimeout(reenableAutoScrollTimeoutRef.current);
          reenableAutoScrollTimeoutRef.current = null;
        }
        resetKeyboard();
        Keyboard.dismiss();
      };
    }, [loadChatHistory, resetKeyboard])
  );

  // React.useEffect(() => {
  //   if (!hasChat) return;
  //   if (suppressAutoScrollToEndRef.current) return;
  //   const id = setTimeout(() => {
  //     scrollRef.current?.scrollToEnd({ animated: true });
  //   }, 120);
  //   return () => clearTimeout(id);
  // }, [hasChat, chatItems.length]);

  React.useEffect(() => {
    if (!hasChat) return;
    // Never auto-scroll while we're prepending older history (prevents jump-to-bottom).
    if (pendingRestoreScrollRef.current) return;
    if (!shouldAutoScrollRef.current) return;
    const id = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 120);
    return () => clearTimeout(id);
  }, [chatItems]);

  const handleComposerLayout = React.useCallback((event: LayoutChangeEvent) => {
    const nextHeight = Math.round(event.nativeEvent.layout.height);
    if (nextHeight > 0) {
      setComposerHeight((prev) => (prev === nextHeight ? prev : nextHeight));
    }
  }, []);

  return (
      <View style={styles.screen}>
              <ProfileScreenGradient />
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('Chat', { screen: 'ChatList' });
            }}
            activeOpacity={0.7}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Open chat list"
          >
            <BackArrowIcon size={48} backgroundColor="rgba(255,255,255,0.5)" strokeColor={colors.black} />
          </TouchableOpacity>
          <View style={styles.flex}>
            <ScrollView
              ref={scrollRef}
              style={styles.flex}
              contentContainerStyle={{
                flexGrow: 1,
                paddingHorizontal: 16,
                paddingTop: 36,
                paddingBottom: composerHeight + 12,
              }}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}
              scrollEventThrottle={16}
              onScrollBeginDrag={() => {
                userHasScrolledRef.current = true;
              }}
              onScroll={(e) => {
                const y = e.nativeEvent.contentOffset.y;
                scrollYRef.current = y;
                const isScrollingUp = y < lastScrollYRef.current;
                lastScrollYRef.current = y;

                // Load older messages only when the user scrolls up near the top.
                // Prevents accidental pagination when content doesn't fill the screen (y stays 0 at "bottom").
                if (userHasScrolledRef.current && isScrollingUp && y < 80 && hasChat) {
                  if (isLoadingHistory) return;
                  if (isLoadingMoreHistoryRef.current) return;
                  if (!historyHasMoreRef.current) return;
                  const nextPage = historyPageRef.current + 1;
                  shouldAutoScrollRef.current = false;
                  pendingRestoreScrollRef.current = {
                    beforeY: y,
                    beforeContentH: contentHeightRef.current,
                  };
                  void loadChatHistory({ page: nextPage, mode: 'prepend' });
                }
              }}
              onContentSizeChange={(_, h) => {
                const prevH = contentHeightRef.current;
                contentHeightRef.current = h;
                const restore = pendingRestoreScrollRef.current;
                if (!restore) return;
                // Restore viewport after prepending older items.
                const delta = h - restore.beforeContentH;
                if (delta > 0) {
                  requestAnimationFrame(() => {
                    scrollRef.current?.scrollTo({
                      y: restore.beforeY + delta,
                      animated: false,
                    });
                  });
                }
                pendingRestoreScrollRef.current = null;
                // Re-enable auto scroll AFTER restore has applied (next tick),
                // otherwise the chatItems effect can still scroll-to-end.
                if (reenableAutoScrollTimeoutRef.current) {
                  clearTimeout(reenableAutoScrollTimeoutRef.current);
                }
                reenableAutoScrollTimeoutRef.current = setTimeout(() => {
                  shouldAutoScrollRef.current = true;
                  reenableAutoScrollTimeoutRef.current = null;
                }, 250);
              }}
            >
              {!hasChat && !isLoadingHistory ? (
                <View style={styles.hero}>
                  <View style={styles.aiBadgeShadow} pointerEvents="none" />
                  <View style={styles.aiBadge}>
                    <TabAICenterIcon width={138} height={138} />
                  </View>

                  <View style={styles.heroText}>
                    <View style={{ alignItems: 'center' }}>
                      <GradientText
                        style={{
                          fontSize: typography.h2.fontSize,
                          fontWeight: '500',
                          fontFamily: typography.h2.fontFamily,
                        }}
                      >
                        Hi , I’m Aira.
                      </GradientText>
                    </View>
                    <Text style={styles.subtitle}>
                      Your dating wingman - here to help you connect better.
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.thread}>
                  {chatItems.map((item) => {
                    if (item.from === 'user') {
                      if (item.profileSelection) {
                        const nickname =
                          item.profileSelection.nickname?.trim() || 'Selected profile';
                        const avatarText = nickname.slice(0, 1).toUpperCase();
                        return (
                          <View key={item.id} style={styles.userMessageRow}>
                            <View style={styles.userProfileSelectionCard}>
                              <View style={styles.userProfileSelectionThumbWrap}>
                                {item.profileSelection.profileUrl ? (
                                  <Image
                                    source={{ uri: item.profileSelection.profileUrl }}
                                    style={styles.userProfileSelectionThumb}
                                  />
                                ) : (
                                  <View style={styles.userProfileSelectionThumbFallback}>
                                    <Text style={styles.userProfileSelectionThumbFallbackText}>
                                      {avatarText}
                                    </Text>
                                  </View>
                                )}
                              </View>
                              <View style={styles.userProfileSelectionTextWrap}>
                                <Text style={styles.userProfileSelectionLabel}>Selected profile</Text>
                                <Text style={styles.userProfileSelectionName}>{nickname}</Text>
                              </View>
                            </View>
                          </View>
                        );
                      }

                      return (
                        <View key={item.id} style={styles.userMessageRow}>
                          <View style={styles.userBubble}>
                            <Text style={styles.userBubbleText}>{item.text}</Text>
                          </View>
                        </View>
                      );
                    }

                    return (
                      <View key={item.id} style={styles.airaMessageWrap}>
                        {item.blocks.map((b, idx) => {
                          switch (b.type) {
                            case 'heading':
                              return (
                                <Text key={idx} style={styles.airaHeading}>
                                  {b.text}
                                </Text>
                              );
                            case 'paragraph':
                              return (
                                <Text key={idx} style={styles.airaParagraph}>
                                  {paragraphChildrenWithBold(b.text)}
                                </Text>
                              );
                            case 'divider':
                              return <View key={idx} style={styles.airaDivider} />;
                            case 'ordered':
                              return (
                                <View key={idx} style={styles.airaListRow}>
                                  <Text style={styles.airaOrderedIndex}>{b.index}.</Text>
                                  <Text style={styles.airaOrderedText}>{b.text}</Text>
                                </View>
                              );
                            case 'bullet':
                              return (
                                <View
                                  key={idx}
                                  style={[styles.airaListRow, b.indent === 1 ? styles.airaListRowIndented : null]}
                                >
                                  <Text style={styles.airaBullet}>•</Text>
                                  <Text style={styles.airaBulletText}>{b.text}</Text>
                                </View>
                              );
                            case 'bullet_item':
                              return (
                                <View key={idx} style={styles.airaListRow}>
                                  <Text style={styles.airaBullet}>•</Text>
                                  <View style={{ flex: 1 }}>
                                    {b.title ? <Text style={styles.airaBulletItemTitle}>{b.title}</Text> : null}
                                    {b.description ? (
                                      <Text style={styles.airaBulletItemText}>{b.description}</Text>
                                    ) : null}
                                  </View>
                                </View>
                              );
                            case 'follow_up':
                              return (
                                <View key={idx} style={styles.followUpCard}>
                                  <Text style={styles.followUpLabel}>Next</Text>
                                  <Text style={styles.followUpText}>{b.text}</Text>
                                </View>
                              );
                            case 'missing_info_list':
                              return (
                                <View key={idx} style={styles.missingInfoWrap}>
                                  {b.options.map((opt) => {
                                    const sortedPhotos = Array.isArray(opt.photos)
                                      ? [...opt.photos].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                                      : [];
                                    const photoUrl = sortedPhotos[0]?.url;
                                    const thumbFallbackText =
                                      (opt.nickName ?? opt.name ?? '?').toString().trim().slice(0, 1) || '?';

                                    const title = opt.nickName ?? opt.name ?? 'Profile';
                                    const subtitle = opt.name && opt.nickName && opt.name !== opt.nickName ? opt.name : opt.nickName;

                                    return (
                                      <TouchableOpacity
                                        key={opt._id}
                                        style={styles.missingInfoCard}
                                        activeOpacity={0.85}
                                        disabled={!lastUserText || isTyping}
                                        onPress={() => {
                                          if (!lastUserText) return;
                                          // Pass receiver id + last user message into the chatbot.
                                          void sendChatWithReceiver(lastUserText, opt._id);
                                        }}
                                      >
                                        <View style={styles.missingInfoThumbWrap}>
                                          {photoUrl ? (
                                            <Image source={{ uri: photoUrl }} style={styles.missingInfoThumb} />
                                          ) : (
                                            <View style={styles.missingInfoThumbFallback}>
                                              <Text style={styles.missingInfoThumbFallbackText}>{thumbFallbackText}</Text>
                                            </View>
                                          )}
                                        </View>
                                        <View style={styles.missingInfoTextBlock}>
                                          <Text style={styles.missingInfoTitle}>{title}</Text>
                                          {subtitle ? <Text style={styles.missingInfoSubtitle}>{subtitle}</Text> : null}
                                        </View>
                                      </TouchableOpacity>
                                    );
                                  })}
                                </View>
                              );
                            default:
                              return null;
                          }
                        })}
                      </View>
                    );
                  })}

                  {isTyping && (
                    <View style={styles.airaMessageWrap}>
                      <Text style={styles.airaParagraph}>Aira is typing…</Text>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>

            <View
              onLayout={handleComposerLayout}
              style={[
                styles.composerFooter,
                composerBottomOffset > 0 && { marginBottom: composerBottomOffset },
                Platform.OS === 'android' &&
                  isKeyboardVisible &&
                  composerBottomOffset <= 0 && { marginBottom: Math.round(windowHeight * 0.36) },
                {
                  paddingBottom: 12 + (isKeyboardVisible ? 0 : bottomSafeInset),
                },
              ]}
            >
              <View
                style={[
                  styles.composerRow,
                  { paddingBottom: 12 },
                  isMultilineComposer && styles.composerRowExpanded,
                ]}
              >
                <View
                  style={[
                    styles.inputPill,
                    isCompactComposer && styles.inputPillEmpty,
                    isMultilineComposer && styles.inputPillMultiline,
                  ]}
                >
                  <View
                    style={[
                      styles.inputFieldOuter,
                      isCompactComposer && styles.inputFieldOuterCompact,
                      !isCompactComposer && styles.inputFieldOuterExpanded,
                    ]}
                  >
                    {isInputEmpty && (
                      <View style={styles.inputPlaceholderWrap} pointerEvents="none">
                        <Text style={styles.inputPlaceholderText} numberOfLines={1}>
                          Ask me anything...
                        </Text>
                      </View>
                    )}
                    <TextInput
                      key={inputResetKey}
                      value={message}
                      onChangeText={setMessage}
                      placeholder=""
                      placeholderTextColor={colors.neutral[600]}
                      style={styles.input}
                      multiline
                      blurOnSubmit={false}
                      scrollEnabled
                      textAlignVertical="top"
                    />
                  </View>
                </View>

                <TouchableOpacity
                  disabled={!hasText || isTyping}
                  onPress={() => {
                    if (!hasText || isTyping) return;
                    handleSend(message);
                  }}
                  style={[
                    hasText && !isTyping
                      ? styles.sendButton
                      : [styles.sendButton, styles.sendButtonDisabled],
                    isMultilineComposer && styles.sendButtonExpanded,
                  ]}
                >
                  <ForwardArrowIcon
                    size={22}
                    color={hasText && !isTyping ? colors.white : colors.neutral[500]}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

        </SafeAreaView>
      </View>
    );
  };

const MATCH_INPUT_BAR_HEIGHT = 56;
const MATCH_INPUT_MIN_HEIGHT = 36;
const MATCH_INPUT_MAX_HEIGHT = 120;
const MATCH_INPUT_WRAP_MAX = 142;

  const styles = StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.white,
    },
    flex: { flex: 1 },
    safeArea: {
      flex: 1,
    },
    backButton: {
      marginLeft: 16,
      marginTop: 4,
      width: 48,
      height: 48,
      borderRadius: 16,
      shadowColor: '#000',
      // shadowOffset: { width: 0, height: 4 }
      // shadowOpacity: 0.07,
      // shadowRadius: 14,
      // elevation: 4,
    },
    topGlowWrap: {
      position: 'absolute',
      left: '50%',
      top: -59,
      width: 213,
      height: 213,
      marginLeft: -213 / 2,
      transform: [{ rotate: '90deg' }],
      opacity: 0.18,
    },
    topGlow: {
      width: 213,
      height: 213,
      borderRadius: 9999,
    },
    content: {
      paddingHorizontal: 16,
      paddingTop: 36,
      flexGrow: 1,
      alignItems: 'center',
    },

    hero: {
      width: '100%',
      alignItems: 'center',
      marginTop: 52,
    },
    aiBadge: {
      width: 164,
      height: 164,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
    },
    aiBadgeShadow: {
      position: 'absolute',
      width: 128,
      height: 128,
      borderRadius: 9999,
      opacity: 0.5,
      top: 20,
      backgroundColor: colors.primary.purple,
      shadowColor: colors.primary.purple,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 36,
    },
    heroText: {
      marginTop: 16,
      alignItems: 'center',
      paddingHorizontal: 24,
      alignSelf: 'stretch',
    },
    subtitle: {
      ...typography.bodyMedium,
      fontWeight: '400',
      color: colors.neutral[800],
      textAlign: 'center',
      marginTop: 5,
      maxWidth: 270,
    },
    thread: {
      width: '100%',
      alignSelf: 'stretch',
      paddingTop: 54,
      paddingBottom: 12,
      gap: 16,
    },
    userMessageRow: {
      width: '100%',
      alignItems: 'flex-end',
    },
    userBubble: {
      backgroundColor: colors.primary.purple,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 10,
      maxWidth: 289,
    },
    userBubbleText: {
      ...typography.body,
      color: colors.white,
      letterSpacing: 0.32,
      lineHeight: 22,
    },
    userProfileSelectionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      width: 230,
      borderRadius: 18,
      padding: 10,
      gap: 10,
      backgroundColor: colors.primary.purple,
    },
    userProfileSelectionThumbWrap: {
      width: 52,
      height: 52,
      borderRadius: 14,
      overflow: 'hidden',
      backgroundColor: 'rgba(255,255,255,0.28)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    userProfileSelectionThumb: {
      width: '100%',
      height: '100%',
    },
    userProfileSelectionThumbFallback: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    userProfileSelectionThumbFallbackText: {
      ...typography.h4,
      color: colors.white,
      fontWeight: '700',
    },
    userProfileSelectionTextWrap: {
      flex: 1,
      gap: 2,
    },
    userProfileSelectionLabel: {
      ...typography.label,
      color: 'rgba(255,255,255,0.82)',
    },
    userProfileSelectionName: {
      ...typography.bodyMedium,
      color: colors.white,
      fontWeight: '600',
    },
    airaMessageWrap: {
      width: '100%',
      maxWidth: 290,
      alignSelf: 'flex-start',
    },
    airaParagraph: {
      ...typography.body,
      color: colors.black,
      letterSpacing: 0.32,
      lineHeight: 22,
      marginBottom: 12,
    },
    airaHeading: {
      ...typography.h4,
      color: colors.black,
      marginBottom: 12,
      alignSelf: 'flex-start',
    },
    airaDivider: {
      width: '100%',
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.neutral[200],
      marginVertical: 12,
    },
    airaListRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    airaListRowIndented: {
      paddingLeft: 24,
    },
    airaOrderedIndex: {
      ...typography.bodyMedium,
      fontWeight: '500',
      color: colors.black,
      width: 20,
      lineHeight: 22,
    },
    airaOrderedText: {
      ...typography.bodyMedium,
      fontWeight: '500',
      color: colors.black,
      flex: 1,
      lineHeight: 22,
      letterSpacing: 0.32,
    },
    airaBullet: {
      width: 20,
      lineHeight: 22,
      color: colors.black,
      fontSize: 16,
    },
    airaBulletText: {
      ...typography.body,
      color: colors.black,
      flex: 1,
      lineHeight: 22,
      letterSpacing: 0.32,
    },
    airaBulletItemText: {
      flex: 1,
      lineHeight: 22,
    },
    airaBulletItemTitle: {
      ...typography.bodyMedium,
      color: colors.black,
      lineHeight: 22,
    },
    followUpCard: {
      marginTop: 16,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 14,
      backgroundColor: colors.neutral[50],
      alignSelf: 'stretch',
      gap: 4,
    },
    followUpLabel: {
      ...typography.label,
      color: colors.neutral[700],
    },
    followUpText: {
      ...typography.body,
      color: colors.neutral[900],
      lineHeight: 20,
    },
    quickActionsWrap: {
      width: '100%',
      paddingTop: 8,
      paddingBottom: 4,
      marginBottom: 8,
    },
    quickActions: {
      paddingHorizontal: 12,
      gap: 4,
    },
    quickActionCard: {
      width: 163,
      backgroundColor: colors.neutral[50],
      borderRadius: 20,
      padding: 16,
    },
    quickActionTitle: {
      ...typography.label,
      color: colors.secondary[400],
    },
    quickActionSubtitle: {
      marginTop: 2,
      fontSize: 12,
      lineHeight: 18,
      letterSpacing: 0.48,
      fontFamily: typography.fontFamily.regular,
      color: colors.neutral[700],
    },
    missingInfoWrap: {
      marginTop: 12,
      alignSelf: 'stretch',
      gap: 10,
    },
    missingInfoCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.neutral[50],
      borderRadius: 18,
      padding: 12,
      gap: 12,
    },
    missingInfoThumbWrap: {
      width: 52,
      height: 52,
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: colors.neutral[200],
      alignItems: 'center',
      justifyContent: 'center',
    },
    missingInfoThumb: {
      width: '100%',
      height: '100%',
    },
    missingInfoThumbFallback: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    missingInfoThumbFallbackText: {
      ...typography.h3,
      color: colors.neutral[900],
      fontWeight: '600',
    },
    missingInfoTextBlock: {
      flex: 1,
      flexDirection: 'column',
      gap: 2,
    },
    missingInfoTitle: {
      ...typography.bodyMedium,
      fontWeight: '600',
      color: colors.neutral[900],
      lineHeight: 20,
      letterSpacing: 0.32,
    },
    missingInfoSubtitle: {
      ...typography.body,
      fontSize: 12,
      color: colors.neutral[700],
      lineHeight: 18,
      letterSpacing: 0.28,
    },
    composerFooter: {
      backgroundColor: colors.white,
      flexShrink: 0,
      width: '100%',
      zIndex: 5,
    },
    composerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
    },
    composerRowExpanded: {
      alignItems: 'flex-end',
    },
    composerIconButton: {
      width: 48,
      height: 48,
      borderRadius: 128,
      backgroundColor: '#F3F3F3',
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendButton: {
      width: 48,
      height: 48,
      borderRadius: 128,
      backgroundColor: colors.black,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendButtonDisabled: {
      backgroundColor: '#F3F3F3',
      borderWidth: 1,
      borderColor: colors.neutral[200],
    },
    sendButtonExpanded: {
      alignSelf: 'flex-end',
      marginBottom: 2,
    },
    inputPill: {
      flex: 1,
      borderRadius: 999,
      backgroundColor: '#F3F3F3',
      justifyContent: 'flex-start',
      paddingHorizontal: 16,
      minHeight: MATCH_INPUT_BAR_HEIGHT,
      maxHeight: MATCH_INPUT_WRAP_MAX,
      overflow: 'hidden',
    },
    inputPillEmpty: {
      justifyContent: 'center',
      minHeight: MATCH_INPUT_BAR_HEIGHT,
    },
    inputPillMultiline: {
      borderRadius: 24,
      paddingTop: 12,
      paddingBottom: 10,
      justifyContent: 'flex-start',
    },
    inputFieldOuter: {
      minHeight: MATCH_INPUT_MIN_HEIGHT,
      alignSelf: 'stretch',
      position: 'relative',
    },
    inputFieldOuterCompact: {
      justifyContent: 'center',
      maxHeight: MATCH_INPUT_MIN_HEIGHT,
      overflow: 'hidden',
    },
    inputFieldOuterExpanded: {
      maxHeight: MATCH_INPUT_MAX_HEIGHT,
      overflow: 'hidden',
    },
    inputPlaceholderWrap: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
    },
    inputPlaceholderText: {
      fontSize: 16,
      lineHeight: 22,
      letterSpacing: 0.32,
      fontFamily: typography.body.fontFamily,
      color: colors.neutral[600],
    },
    input: {
      width: '100%',
      alignSelf: 'stretch',
      minHeight: MATCH_INPUT_MIN_HEIGHT,
      maxHeight: MATCH_INPUT_MAX_HEIGHT,
      fontSize: 16,
      lineHeight: 22,
      letterSpacing: 0.32,
      fontFamily: typography.body.fontFamily,
      color: colors.black,
      margin: 0,
      paddingTop: Platform.OS === 'ios' ? 7 : 5,
      paddingBottom: Platform.OS === 'ios' ? 7 : 5,
      paddingHorizontal: 0,
      backgroundColor: 'transparent',
      ...Platform.select({
        android: {
          includeFontPadding: false,
          textAlignVertical: 'top',
        },
        default: {
          textAlignVertical: 'top',
        },
      }),
    },
    homeIndicatorArea: {
      height: 24,
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingBottom: 8,
    },
    homeIndicator: {
      width: 100,
      height: 5,
      borderRadius: 100,
      backgroundColor: colors.neutral[200],
    },
  });
