import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  StyleSheet,
  type LayoutChangeEvent,
} from 'react-native';
import { useWindowDimensions } from 'react-native';
import { colors } from '../../../theme';
import { styles } from '../styles';
import { STRINGS } from '../../../constants/strings';

import { CallVideoIncomingIcon } from '../../../assets/icons/common/CallVideoIncomingIcon';
import { CallVideoOutgoingIcon } from '../../../assets/icons/common/CallVideoOutgoingIcon';
import { CallVideoMissedIcon } from '../../../assets/icons/common/CallVideoMissedIcon';
import { CallVoiceIncomingIcon } from '../../../assets/icons/common/CallVoiceIncomingIcon';
import { CallVoiceOutgoingIcon } from '../../../assets/icons/common/CallVoiceOutgoingIcon';
import { CallVoiceDeclinedIcon } from '../../../assets/icons/common/CallVoiceDeclinedIcon';
import { ActionSheetFileIcon } from '../../../assets/icons/common/ActionSheetFileIcon';
import { PlayIcon } from '../../../assets/icons/common/PlayIcon';
import { PauseIcon } from '../../../assets/icons/common/PauseIcon';

import type { ChatMessage } from '../types';

const VOICE_WAVEFORM = [8, 12, 6, 14, 10, 16, 8, 14, 12, 10];

interface VoiceState {
  playingVoiceMessageKey: string | null;
  voiceListenPaused: boolean;
  toggleVoiceMessagePlayback: (uri: string, key: string) => Promise<void>;
}

export interface MessageListProps {
  messages: ChatMessage[];
  messagesLoading: boolean;
  messagesLoadingMore: boolean;
  scrollRef: React.RefObject<ScrollView | null>;
  contentContainerStyle: object;
  onScroll: (event: any) => void;
  onLayout: (event: LayoutChangeEvent) => void;
  onContentSizeChange: (w: number, h: number) => void;
  voice: VoiceState;
  name: string;
  handleMessageLongPress: (index: number) => void;
  setMessageBubbleRef: (index: number, node: View | null) => void;
  onImagePress: (uri: string) => void;
  onDocumentPress: (uri: string) => void;
}

function renderCallStateIcon(
  icon: 'videoOutgoing' | 'videoIncoming' | 'videoMissed' | 'voiceOutgoing' | 'voiceIncoming' | 'voiceMissed',
) {
  if (icon === 'videoOutgoing') return <CallVideoOutgoingIcon size={20} color={colors.primary.purple} />;
  if (icon === 'videoIncoming') return <CallVideoIncomingIcon size={20} color={colors.primary.purple} />;
  if (icon === 'videoMissed') return <CallVideoMissedIcon size={20} color={colors.semantic.error} />;
  if (icon === 'voiceOutgoing') return <CallVoiceOutgoingIcon size={20} color={colors.primary.purple} />;
  if (icon === 'voiceIncoming') return <CallVoiceIncomingIcon size={20} color={colors.primary.purple} />;
  return <CallVoiceDeclinedIcon size={20} color={colors.semantic.error} />;
}

function formatCallDurationSec(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  if (s < 60) return `${s} ${s === 1 ? 'sec' : 'secs'}`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  if (rem === 0) return `${m} ${m === 1 ? 'min' : 'mins'}`;
  return `${m} min ${rem} secs`;
}

type CallBubbleLayout = {
  title: string;
  subtitle: string;
  variant: 'sent' | 'received' | 'missed';
  icon: 'videoOutgoing' | 'videoIncoming' | 'videoMissed' | 'voiceOutgoing' | 'voiceIncoming' | 'voiceMissed';
};

function buildCallLogLayout(m: Extract<ChatMessage, { type: 'call_log' }>): CallBubbleLayout {
  const status = m.callStatus.toUpperCase();
  const isVideo = m.callType === 'video';
  const summary = m.displayAsSummaryLine === true ? m.label.trim() : '';
  if (summary.length > 0) {
    if (['REJECTED', 'MISSED', 'NO_ANSWER', 'CANCELLED'].includes(status)) {
      return { title: summary, subtitle: '', variant: 'missed', icon: isVideo ? 'videoMissed' : 'voiceMissed' };
    }
    return {
      title: summary, subtitle: '',
      variant: m.sent ? 'sent' : 'received',
      icon: m.sent ? (isVideo ? 'videoOutgoing' : 'voiceOutgoing') : isVideo ? 'videoIncoming' : 'voiceIncoming',
    };
  }
  if (status === 'REJECTED') return { title: isVideo ? 'Video Call' : 'Voice Call', subtitle: 'Declined', variant: 'missed', icon: isVideo ? 'videoMissed' : 'voiceMissed' };
  if (status === 'ENDED') return { title: isVideo ? 'Video Call' : 'Voice Call', subtitle: formatCallDurationSec(m.durationSec), variant: m.sent ? 'sent' : 'received', icon: m.sent ? (isVideo ? 'videoOutgoing' : 'voiceOutgoing') : isVideo ? 'videoIncoming' : 'voiceIncoming' };
  if (['MISSED', 'NO_ANSWER', 'CANCELLED'].includes(status)) return { title: isVideo ? 'Missed Video Call' : 'Missed Voice Call', subtitle: '', variant: 'missed', icon: isVideo ? 'videoMissed' : 'voiceMissed' };
  const short = m.label.trim();
  return { title: short || (isVideo ? 'Video call' : 'Voice call'), subtitle: '', variant: 'received', icon: isVideo ? 'videoIncoming' : 'voiceIncoming' };
}

function parseCallStateText(text: string, sent: boolean): CallBubbleLayout | null {
  const raw = text.trim();
  if (!raw) return null;
  const lower = raw.toLowerCase();
  const durationMatch = raw.match(/\b\d+\s*(secs?|mins?|minutes?)\b/i);
  const agoMatch = raw.match(/\b\d+\s*(mins?|minutes?)\s*ago\b/i);

  if (lower.includes('missed video call')) return { title: 'Missed Video Call', subtitle: '', variant: 'missed', icon: 'videoMissed' };
  if (lower.includes('missed voice call')) return { title: 'Missed Voice Call', subtitle: '', variant: 'missed', icon: 'voiceMissed' };
  if (lower.includes('incoming voice call')) return { title: 'Incoming Voice Call', subtitle: 'Tap to receive', variant: 'received', icon: 'voiceIncoming' };
  if (lower.includes('incoming video call')) return { title: 'Incoming Video Call', subtitle: 'Tap to receive', variant: 'received', icon: 'videoIncoming' };
  if (lower.includes('voice call') && lower.includes('ring')) return { title: 'Voice Call', subtitle: 'Ringing..', variant: 'sent', icon: 'voiceOutgoing' };
  if (lower.includes('video call')) return { title: 'Video Call', subtitle: durationMatch?.[0] ?? agoMatch?.[0] ?? (sent ? '6 Secs' : '1 Min ago'), variant: sent ? 'sent' : 'received', icon: sent ? 'videoOutgoing' : 'videoIncoming' };
  if (lower.includes('voice call')) return { title: 'Voice Call', subtitle: durationMatch?.[0] ?? agoMatch?.[0] ?? '6 Secs', variant: sent ? 'sent' : 'received', icon: sent ? 'voiceOutgoing' : 'voiceIncoming' };
  return null;
}

export const MessageList = React.memo(function MessageList({
  messages,
  messagesLoading,
  messagesLoadingMore,
  scrollRef,
  contentContainerStyle,
  onScroll,
  onLayout,
  onContentSizeChange,
  voice,
  name,
  handleMessageLongPress,
  setMessageBubbleRef,
  onImagePress,
  onDocumentPress,
}: MessageListProps) {
  const { width: windowWidth } = useWindowDimensions();
  const imageBubbleSize = Math.max(160, Math.min(Math.round(windowWidth * 0.75), 320));

  const renderCallBubbleRow = useCallback((
    callState: CallBubbleLayout,
    isSent: boolean,
    timestamp: string,
    keyIndex: number,
  ) => (
    <React.Fragment key={keyIndex}>
      <View style={[styles.messageRow, isSent ? undefined : styles.messageRowReceived]}>
        <View ref={(r) => setMessageBubbleRef(keyIndex, r)} collapsable={false}>
          <TouchableOpacity
            style={[styles.chatCallBubble, callState.variant === 'sent' ? styles.chatCallBubbleSent : callState.variant === 'missed' ? styles.chatCallBubbleMissed : styles.chatCallBubbleReceived]}
            activeOpacity={0.9}
            onLongPress={() => handleMessageLongPress(keyIndex)}
          >
            <View style={styles.chatCallBubbleIconWrap}>{renderCallStateIcon(callState.icon)}</View>
            <View style={styles.chatCallBubbleTextWrap}>
              <Text style={[styles.chatCallBubbleTitle, callState.variant === 'sent' ? styles.chatCallBubbleTitleSent : callState.variant === 'missed' ? styles.chatCallBubbleTitleMissed : styles.chatCallBubbleTitleReceived]}>
                {callState.title}
              </Text>
              {callState.subtitle.trim().length > 0 ? (
                <Text style={[styles.chatCallBubbleSubtitle, callState.variant === 'sent' ? styles.chatCallBubbleSubtitleSent : styles.chatCallBubbleSubtitleReceived]}>
                  {callState.subtitle}
                </Text>
              ) : null}
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <View style={[styles.timeRow, isSent ? undefined : styles.timeRowReceived]}>
        <Text style={styles.timeText}>{timestamp}</Text>
      </View>
    </React.Fragment>
  ), [handleMessageLongPress, setMessageBubbleRef]);

  const renderMessage = useCallback((msg: ChatMessage, index: number) => {
    if (msg.type === 'call_log') {
      return renderCallBubbleRow(buildCallLogLayout(msg), msg.sent, msg.timestamp, index);
    }

    if (msg.type === 'text') {
      const callState = parseCallStateText(msg.text, msg.sent);
      if (callState) return renderCallBubbleRow(callState, msg.sent, msg.timestamp, index);
      return (
        <React.Fragment key={index}>
          <View style={[styles.messageRow, msg.sent ? undefined : styles.messageRowReceived]}>
            <View ref={(r) => setMessageBubbleRef(index, r)} collapsable={false}>
              <TouchableOpacity style={[styles.bubble, msg.sent ? styles.bubbleSent : styles.bubbleReceived]} activeOpacity={1} onLongPress={() => handleMessageLongPress(index)}>
                {msg.replyTo != null && (
                  <View style={[styles.bubbleReplyTo, msg.sent ? styles.bubbleReplyToSent : styles.bubbleReplyToReceived]}>
                    <Text style={[styles.bubbleReplyToLabel, msg.sent && styles.bubbleReplyToLabelSent]} numberOfLines={1}>{STRINGS.CHAT.REPLYING_TO} {msg.replyTo.senderName}</Text>
                    <Text style={[styles.bubbleReplyToPreview, msg.sent && styles.bubbleReplyToPreviewSent]} numberOfLines={2}>{msg.replyTo.preview}</Text>
                  </View>
                )}
                <Text style={[styles.bubbleText, msg.sent && styles.bubbleTextSent]}>{msg.text}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={[styles.timeRow, msg.sent ? undefined : styles.timeRowReceived]}>
            <Text style={styles.timeText}>{msg.timestamp}</Text>
          </View>
        </React.Fragment>
      );
    }

    if (msg.type === 'rich') {
      return (
        <React.Fragment key={index}>
          <View style={[styles.messageRow, msg.sent ? undefined : styles.messageRowReceived]}>
            <View ref={(r) => setMessageBubbleRef(index, r)} collapsable={false}>
              <TouchableOpacity style={[styles.bubble, msg.sent ? styles.bubbleSent : styles.bubbleReceived]} activeOpacity={1} onLongPress={() => handleMessageLongPress(index)}>
                {msg.blocks.map((block, blockIndex) => {
                  if (block.type === 'paragraph') {
                    return <Text key={`${index}_p_${blockIndex}`} style={[styles.bubbleText, msg.sent && styles.bubbleTextSent, { marginBottom: 8 }]}>{block.text}</Text>;
                  }
                  return (
                    <View key={`${index}_b_${blockIndex}`} style={{ marginBottom: 8 }}>
                      {block.items.map((item, itemIndex) => (
                        <View key={`${index}_${blockIndex}_${itemIndex}`} style={{ flexDirection: 'row', marginBottom: 6 }}>
                          <Text style={[styles.bubbleText, msg.sent && styles.bubbleTextSent]}>{'• '}</Text>
                          <Text style={[styles.bubbleText, msg.sent && styles.bubbleTextSent, { flex: 1 }]}>{item.title ? `${item.title}: ` : ''}{item.description ?? ''}</Text>
                        </View>
                      ))}
                    </View>
                  );
                })}
              </TouchableOpacity>
            </View>
          </View>
          <View style={[styles.timeRow, msg.sent ? undefined : styles.timeRowReceived]}>
            <Text style={styles.timeText}>{msg.timestamp}</Text>
          </View>
        </React.Fragment>
      );
    }

    if (msg.type === 'voice') {
      const messageKey = msg.messageId ?? `${index}_${msg.uri}`;
      const isCurrentPlaying = voice.playingVoiceMessageKey === messageKey;
      const isPlayingNow = isCurrentPlaying && !voice.voiceListenPaused;
      return (
        <React.Fragment key={index}>
          <View style={[styles.messageRow, msg.sent ? undefined : styles.messageRowReceived]}>
            <View ref={(r) => setMessageBubbleRef(index, r)} collapsable={false}>
              <TouchableOpacity style={[styles.voiceBubbleSent, msg.sent ? undefined : styles.voiceBubbleReceived]} activeOpacity={1} onLongPress={() => handleMessageLongPress(index)}>
                <TouchableOpacity style={styles.voiceBubblePlay} activeOpacity={0.8} onPress={() => { voice.toggleVoiceMessagePlayback(msg.uri, messageKey).catch(() => {}); }}>
                  {isPlayingNow ? (
                    <PauseIcon size={40} color={msg.sent ? colors.white : colors.primary.purple} />
                  ) : (
                    <PlayIcon size={40} color={msg.sent ? colors.white : colors.primary.purple} variant="voiceBubble" />
                  )}
                </TouchableOpacity>
                <View style={styles.voiceBubbleWaveform}>
                  {VOICE_WAVEFORM.map((h, i) => (
                    <View key={i} style={[styles.voiceBubbleWaveformBar, !msg.sent && styles.voiceBubbleWaveformBarReceived, { height: Math.max(6, h) }]} />
                  ))}
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <View style={[styles.timeRow, msg.sent ? undefined : styles.timeRowReceived]}>
            <Text style={styles.timeText}>{msg.timestamp}</Text>
          </View>
        </React.Fragment>
      );
    }

    if (msg.type === 'image') {
      return (
        <React.Fragment key={index}>
          <View style={[styles.messageRow, msg.sent ? undefined : styles.messageRowReceived]}>
            <View ref={(r) => setMessageBubbleRef(index, r)} collapsable={false}>
              <TouchableOpacity
                style={[styles.imageBubble, msg.sent ? undefined : styles.imageBubbleReceived, { width: imageBubbleSize, height: imageBubbleSize }]}
                activeOpacity={1}
                onPress={() => onImagePress(msg.uri)}
                onLongPress={() => handleMessageLongPress(index)}
              >
                <Image source={{ uri: msg.uri }} style={styles.imageBubbleImage} resizeMode="cover" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={[styles.timeRow, msg.sent ? undefined : styles.timeRowReceived]}>
            <Text style={styles.timeText}>{msg.timestamp}</Text>
          </View>
        </React.Fragment>
      );
    }

    if (msg.type === 'file') {
      return (
        <React.Fragment key={index}>
          <View style={[styles.messageRow, msg.sent ? undefined : styles.messageRowReceived]}>
            <View ref={(r) => setMessageBubbleRef(index, r)} collapsable={false}>
              <TouchableOpacity style={[styles.fileBubble, msg.sent ? undefined : styles.fileBubbleReceived]} activeOpacity={0.9} onPress={() => onDocumentPress(msg.uri)} onLongPress={() => handleMessageLongPress(index)}>
                <View style={styles.fileBubbleIcon}>
                  <ActionSheetFileIcon size={24} color={msg.sent ? colors.white : colors.primary.purple} />
                </View>
                <Text style={[styles.fileBubbleName, msg.sent ? undefined : styles.fileBubbleNameReceived]} numberOfLines={1}>{msg.name}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={[styles.timeRow, msg.sent ? undefined : styles.timeRowReceived]}>
            <Text style={styles.timeText}>{msg.timestamp}</Text>
          </View>
        </React.Fragment>
      );
    }

    return null;
  }, [handleMessageLongPress, setMessageBubbleRef, voice, imageBubbleSize, onImagePress, onDocumentPress, renderCallBubbleRow]);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        ref={scrollRef}
        style={styles.screen}
        onLayout={onLayout}
        contentContainerStyle={contentContainerStyle}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        onContentSizeChange={onContentSizeChange}
        scrollEventThrottle={16}
      >
        {messagesLoading ? (
          <View style={styles.messagesLoadingWrap}>
            <ActivityIndicator size="large" color={colors.primary.purple} />
            <Text style={styles.messagesLoadingText}>{STRINGS.CHAT.LOADING_MESSAGES}</Text>
          </View>
        ) : (
          <>
            {messagesLoadingMore && (
              <View style={styles.messagesLoadingMoreWrap}>
                <ActivityIndicator size="small" color={colors.primary.purple} />
              </View>
            )}
            <View style={styles.datePill}>
              <Text style={styles.datePillText}>{STRINGS.CHAT.TODAY}</Text>
            </View>
            {messages.map((msg, index) => renderMessage(msg, index))}
          </>
        )}
      </ScrollView>
    </View>
  );
});
