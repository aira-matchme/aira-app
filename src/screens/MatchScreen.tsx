import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  TextInput,
  LayoutChangeEvent,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

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
  | { id: string; from: 'user'; text: string }
  | { id: string; from: 'aira'; blocks: AiraBlock[] };

export const MatchScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [message, setMessage] = React.useState('');
  const [chatItems, setChatItems] = React.useState<ChatItem[]>([]);
  const scrollRef = React.useRef<ScrollView>(null);
  const lastUserMessageRef = React.useRef<string>('');
  const [isTyping, setIsTyping] = React.useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = React.useState(false);
  const [composerHeight, setComposerHeight] = React.useState(120);
  const bottomSafeInset = Platform.OS === 'ios' ? insets.bottom : 0;

  const hasText = message.trim().length > 0;
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

  const loadChatHistory = React.useCallback(async () => {
    try {
      setIsLoadingHistory(true);
      const response = await apiClient.post(
        endpoints.chatbot.getChatbotMessages,
        { page: 1, limit: 10 },
        { timeout: 60000 }
      );

      const rawList =
        response.data?.data?.list ??
        response.data?.list ??
        [];

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
              const text: string =
                typeof item.content === 'string'
                  ? item.content
                  : item.message ?? item.text ?? '';
              return {
                id: String(item._id ?? item.id ?? index),
                from: 'user',
                text,
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

      setChatItems(mapped);
    } catch {
      // ignore history errors for now
    } finally {
      setIsLoadingHistory(false);
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
      loadChatHistory();
    }, [loadChatHistory])
  );

  React.useEffect(() => {
    if (!hasChat) return;
    const id = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 120);
    return () => clearTimeout(id);
  }, [hasChat, chatItems.length]);

  // Android keyboard transitions can leave ScrollView in an incorrect position
  // after show/hide. Re-sync to bottom with multiple attempts.
  React.useEffect(() => {
    if (Platform.OS !== 'android') return;

    const sub = Keyboard.addListener('keyboardDidHide', () => {
      scrollRef.current?.scrollToEnd({ animated: false });
    });

    return () => sub.remove();
  }, []);

  const handleComposerLayout = React.useCallback((event: LayoutChangeEvent) => {
    const nextHeight = Math.round(event.nativeEvent.layout.height);
    if (nextHeight > 0 && nextHeight !== composerHeight) {
      setComposerHeight(nextHeight);
    }
  }, [composerHeight]);

  // Keep the thread scrolled when the keyboard opens (pairs with KeyboardAvoidingView on iOS).
  React.useEffect(() => {
    const eventName = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const sub = Keyboard.addListener(eventName, () => {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      });
    });
    return () => sub.remove();
  }, []);

  return (
      <View style={styles.screen}>
              <ProfileScreenGradient />
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <TouchableOpacity
            onPress={() => {
              // When opened from a tab press, there may be no back stack.
              // In that case, go back to Home tab.
              if ((navigation as { canGoBack?: () => boolean }).canGoBack?.()) {
                (navigation as { goBack: () => void }).goBack();
              } else {
                (navigation as { navigate: (name: string) => void }).navigate('Home');
              }
            }}
            activeOpacity={0.7}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <BackArrowIcon size={48} backgroundColor="rgba(255,255,255,0.5)" strokeColor={colors.black} />
          </TouchableOpacity>
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 8}
          >
            <ScrollView
              ref={scrollRef}
              style={styles.flex}
              contentContainerStyle={{
                flexGrow: 1,
                paddingHorizontal: 16,
                paddingTop: 36,
                // Keep last message visible above dynamic composer height.
                paddingBottom: composerHeight + 12,
              }}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}
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
                          fontWeight: typography.h2.fontWeight,
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
                                  {b.text}
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
                styles.composerWrapFixed,
                {
                  paddingBottom: 12 + bottomSafeInset,
                },
              ]}
            >
              <View style={[styles.composerRow, { paddingBottom: 12 }]}>
                <View style={styles.inputPill}>
                  <TextInput
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Ask me anything..."
                    placeholderTextColor={colors.neutral[600]}
                    style={[
                      styles.input,
                      { textAlignVertical: hasText ? 'top' : 'center' },
                    ]}
                    multiline
                  />
                </View>

                <TouchableOpacity
                  disabled={!hasText}
                  onPress={() => {
                    if (!hasText) return;
                    handleSend(message);
                  }}
                  style={
                    hasText
                      ? styles.sendButton
                      : [styles.sendButton, styles.sendButtonDisabled]
                  }
                >
                  <ForwardArrowIcon
                    size={22}
                    color={hasText ? colors.white : colors.neutral[500]}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>

        </SafeAreaView>
      </View>
    );
  };

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
    composerWrap: {
      backgroundColor: colors.white,
      alignSelf: 'stretch',
      zIndex: 5,
    },
    composerWrapFixed: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.white,
      alignSelf: 'stretch',
      zIndex: 5,
    },
    composerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
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
    inputPill: {
      flex: 1,
      borderRadius: 22,
      backgroundColor: '#F3F3F3',
      justifyContent: 'flex-start',
      paddingHorizontal: 16,
      minHeight: 56,
      // Allow the composer to grow but stop it from covering too much of the screen.
      maxHeight: 200,
    },
    input: {
      ...typography.body,
      color: colors.black,
      letterSpacing: 0.32,
      lineHeight: 22,
      paddingVertical: 13,
      paddingHorizontal: 0,
      includeFontPadding: false,
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
