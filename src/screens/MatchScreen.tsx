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

  const QUICK_ACTIONS = [
    {
      title: 'Help Me Break the Ice',
      subtitle: "I’ll suggest something natural to say.",
    },
    {
      title: 'Plan a Great Date',
      subtitle: "Tell me where you are - I’ll handle the rest.",
    },
    {
      title: 'Revive a Quiet Chat',
      subtitle: "I’ll suggest something to keep things flowing.",
    },
    {
      title: 'Ask Aira for Advice',
      subtitle: "Feeling stuck? Let’s talk it through.",
    },
  ];

type AiraBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'divider' }
  | { type: 'ordered'; index: number; text: string }
  | { type: 'bullet'; indent: 0 | 1; text: string };

type ChatItem =
  | { id: string; from: 'user'; text: string }
  | { id: string; from: 'aira'; blocks: AiraBlock[] };

function getAiraReplyBlocks(prompt: string): AiraBlock[] {
  const key = prompt.trim();
  if (key === 'Plan a Great Date') {
    return [
      {
        type: 'paragraph',
        text:
          "Here’s a great, thoughtfully structured date plan—romantic, modern, and memorable. I’ll give you a core plan plus smart variations so you can adapt based on vibe, budget, or time.",
      },
      { type: 'divider' },
      { type: 'paragraph', text: '🌤️ The Ideal “Balanced” Date (Emotion + Fun + Connection)' },
      { type: 'ordered', index: 1, text: 'Soft Start — Coffee / Mocktails (45–60 min)' },
      { type: 'bullet', indent: 1, text: 'Why: Low pressure, easy conversation, instant comfort.' },
      { type: 'bullet', indent: 1, text: 'Choose a quiet café with good seating (no loud music).' },
      { type: 'bullet', indent: 1, text: 'Order something shareable (dessert or snack) — subtle bonding hack.' },
      { type: 'bullet', indent: 1, text: 'Conversation starters:' },
      { type: 'bullet', indent: 1, text: '“What’s something you’re obsessed with lately?”' },
      { type: 'bullet', indent: 1, text: '“What does a perfect Sunday look like for you?”' },
    ];
  }
  if (key === 'Help Me Break the Ice') {
    return [
      {
        type: 'paragraph',
        text: 'Tell me what you two have in common (or share a screenshot of the chat), and I’ll craft 3 icebreakers that sound like you.',
      },
    ];
  }
  if (key === 'Revive a Quiet Chat') {
    return [
      {
        type: 'paragraph',
        text: 'No worries — quiet chats are normal. Tell me the last thing they said (or what your last message was) and I’ll suggest a smooth follow‑up.',
      },
    ];
  }
  return [
    {
      type: 'paragraph',
      text: 'What’s the situation? Give me a little context and I’ll help you with the next message.',
    },
  ];
}

export const MatchScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [message, setMessage] = React.useState('');
  const [composerHeight, setComposerHeight] = React.useState(0);
  const [chatItems, setChatItems] = React.useState<ChatItem[]>([]);
  const scrollRef = React.useRef<ScrollView>(null);

  const hasText = message.trim().length > 0;
  const hasChat = chatItems.length > 0;

  const handleSend = React.useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const userId = `${Date.now()}_u`;
      const airaId = `${Date.now()}_a`;
      const blocks = getAiraReplyBlocks(trimmed);
      setChatItems((prev) => [
        ...prev,
        { id: userId, from: 'user', text: trimmed },
        { id: airaId, from: 'aira', blocks },
      ]);
      setMessage('');

      requestAnimationFrame(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      });
    },
    [setChatItems]
  );

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
              {!hasChat ? (
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
                          return (
                            <Text key={`${item.id}_${idx}`} style={styles.airaParagraph}>
                              {b.text}
                            </Text>
                          );
                        })}
                      </View>
                    );
                  })}
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
              {!hasChat && message.trim().length === 0 && (
                <View style={styles.quickActionsWrap}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.quickActions}
                    keyboardShouldPersistTaps="handled"
                  >
                    {QUICK_ACTIONS.map((item) => (
                      <TouchableOpacity
                        key={item.title}
                        activeOpacity={0.85}
                        style={styles.quickActionCard}
                        onPress={() => {
                          handleSend(item.title);
                        }}
                      >
                        <Text style={styles.quickActionTitle}>{item.title}</Text>
                        <Text style={styles.quickActionSubtitle}>{item.subtitle}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

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
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.07,
      shadowRadius: 14,
      elevation: 4,
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
      minHeight: 48,
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
