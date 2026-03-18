import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';

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
  | { type: 'follow_up'; text: string };

type ChatItem =
  | { id: string; from: 'user'; text: string }
  | { id: string; from: 'aira'; blocks: AiraBlock[] };

export const MatchScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [message, setMessage] = React.useState('');
  const [composerHeight, setComposerHeight] = React.useState(0);
  const [chatItems, setChatItems] = React.useState<ChatItem[]>([]);
  const scrollRef = React.useRef<ScrollView>(null);
  const [isTyping, setIsTyping] = React.useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = React.useState(false);

  const hasText = message.trim().length > 0;
  const hasChat = chatItems.length > 0;

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
            const content = item.content;
            const responseType = (item.response_type ?? '').toString().toLowerCase();

            if (
              responseType === 'rich_content' &&
              Array.isArray(content)
            ) {
              for (const block of content as any[]) {
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
                typeof content === 'string'
                  ? content
                  : item.message ?? item.text ?? '';
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

  const handleSend = React.useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      if (isTyping) return;
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

        // After sending, always refresh from server so
        // the UI reflects backend history only.
        setTimeout(() => {
          loadChatHistory().finally(() => {
            setIsTyping(false);
            requestAnimationFrame(() => {
              scrollRef.current?.scrollToEnd({ animated: true });
            });
          });
        }, 800);
      } catch {
        setIsTyping(false);
      }
    },
    [isTyping, loadChatHistory]
  );

  React.useEffect(() => {
    loadChatHistory();
  }, [loadChatHistory]);

  React.useEffect(() => {
    if (!hasChat) return;
    const id = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 120);
    return () => clearTimeout(id);
  }, [hasChat, chatItems.length]);

    return (
      <View style={styles.screen}>
              <ProfileScreenGradient />
        {/* Soft top gradient background */}
        {/* <LinearGradient
          colors={colors.gradients.onboardingIntro.colors as unknown as string[]}
          start={colors.gradients.onboardingIntro.start}
          end={colors.gradients.onboardingIntro.end}
          style={StyleSheet.absoluteFill}
        /> */}
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right','top']}>
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
            keyboardVerticalOffset={0}
          >
            <ScrollView
              ref={scrollRef}
              style={styles.flex}
              contentContainerStyle={[
                styles.content,
                {
                  paddingBottom: Math.max(16, composerHeight + 16),
                },
              ]}
              showsVerticalScrollIndicator={false}
              bounces={false}
              keyboardShouldPersistTaps="handled"
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
                          if (b.type === 'divider') {
                            return <View key={`${item.id}_${idx}`} style={styles.airaDivider} />;
                          }
                          if (b.type === 'heading') {
                            return (
                              <Text key={`${item.id}_${idx}`} style={styles.airaHeading}>
                                {b.text}
                              </Text>
                            );
                          }
                          if (b.type === 'ordered') {
                            return (
                              <View key={`${item.id}_${idx}`} style={styles.airaListRow}>
                                <Text style={styles.airaOrderedIndex}>{b.index}.</Text>
                                <Text style={styles.airaOrderedText}>{b.text}</Text>
                              </View>
                            );
                          }
                          if (b.type === 'bullet') {
                            return (
                              <View
                                key={`${item.id}_${idx}`}
                                style={[styles.airaListRow, b.indent === 1 && styles.airaListRowIndented]}
                              >
                                <Text style={styles.airaBullet}>{'•'}</Text>
                                <Text style={styles.airaBulletText}>{b.text}</Text>
                              </View>
                            );
                          }
                          if (b.type === 'bullet_item') {
                            return (
                              <View
                                key={`${item.id}_${idx}`}
                                style={[styles.airaListRow, styles.airaListRowIndented]}
                              >
                                <Text style={styles.airaBullet}>{'•'}</Text>
                                <Text style={styles.airaBulletItemText}>
                                  <Text style={styles.airaBulletItemTitle}>{b.title}</Text>
                                  {b.description ? ` ${b.description}` : ''}
                                </Text>
                              </View>
                            );
                          }
                          if (b.type === 'follow_up') {
                            return (
                              <View key={`${item.id}_${idx}`} style={styles.followUpCard}>
                                <Text style={styles.followUpLabel}>Follow-up idea</Text>
                                <Text style={styles.followUpText}>{b.text}</Text>
                              </View>
                            );
                          }
                          return (
                            <Text key={`${item.id}_${idx}`} style={styles.airaParagraph}>
                              {b.text}
                            </Text>
                          );
                        })}
                      </View>
                    );
                  })}
                  {isTyping && (
                    <View style={styles.airaMessageWrap}>
                      <Text style={styles.airaParagraph}>
                        Aira is typing…
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>

            {/* Bottom fixed section: suggestions + composer */}
            <View
              style={styles.composerWrap}
              onLayout={(e) => {
                setComposerHeight(e.nativeEvent.layout.height);
              }}
            >
              <View style={[styles.composerRow, { paddingBottom: 12 + insets.bottom }]}>
                <View style={styles.inputPill}>
                  <TextInput
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Ask me anything..."
                    placeholderTextColor={colors.neutral[600]}
                    style={styles.input}
                    returnKeyType="send"
                    onSubmitEditing={() => handleSend(message)}
                  />
                </View>

                <TouchableOpacity
                  activeOpacity={hasText ? 0.85 : 1}
                  style={hasText ? styles.sendButton : [styles.sendButton, styles.sendButtonDisabled]}
                  accessibilityRole="button"
                  accessibilityLabel="Send"
                  disabled={!hasText}
                  onPress={() => {
                    if (!hasText) return;
                    handleSend(message);
                  }}
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
      flexGrow: 1,
      paddingHorizontal: 16,
      paddingTop: 36,
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
    composerWrap: {
      backgroundColor: colors.white,
      alignSelf: 'stretch',
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
      justifyContent: 'center',
      paddingHorizontal: 16,
      minHeight: 56,
    },
    input: {
      ...typography.body,
      color: colors.black,
      letterSpacing: 0.32,
      lineHeight: 22,
      paddingVertical: 13,
      paddingHorizontal: 0,
      textAlignVertical: 'center',
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
