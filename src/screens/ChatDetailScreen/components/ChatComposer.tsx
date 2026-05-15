import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
  type LayoutChangeEvent,
} from 'react-native';
import type { Ref } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../../../theme';
import { styles, CHAT_INPUT_MIN_HEIGHT, CHAT_INPUT_MAX_HEIGHT, H_PADDING } from '../styles';
import { STRINGS } from '../../../constants/strings';
import { PlusIcon } from '../../../assets/icons/common/PlusIcon';
import { ForwardArrowIcon } from '../../../assets/icons/common/ForwardArrowIcon';
import { MicIcon } from '../../../assets/icons/common/MicIcon';
import { GeneratingCloseIcon } from '../../../assets/icons/common/GeneratingCloseIcon';
import type { PendingAttachment, ChatMessage } from '../types';

type ReplyingTo = {
  index: number;
  message: ChatMessage;
  senderName: string;
  messageId?: string;
};

export interface ChatComposerProps {
  inputRef: Ref<TextInput | null>;
  inputText: string;
  setInputText: (text: string) => void;
  pendingAttachments: PendingAttachment[];
  setPendingAttachments: React.Dispatch<React.SetStateAction<PendingAttachment[]>>;
  replyingTo: ReplyingTo | null;
  setReplyingTo: React.Dispatch<React.SetStateAction<ReplyingTo | null>>;
  sendLoading: boolean;
  voiceSendLoading: boolean;
  composerInputHeight: number;
  setComposerInputHeight: (h: number) => void;
  composerSelection: { start: number; end: number };
  setComposerSelection: (s: { start: number; end: number }) => void;
  bottomSafeInset: number;
  otherUserTyping: boolean;
  onLayout?: (event: LayoutChangeEvent) => void;
  onSendPress: () => void;
  onMicPress: () => void;
  onAttachPress: () => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
  getMessagePreview: (msg: ChatMessage) => string;
  getFileTypeLabel: (name: string) => string;
}

export const ChatComposer = React.memo(function ChatComposer({
  inputRef,
  inputText,
  setInputText,
  pendingAttachments,
  setPendingAttachments,
  replyingTo,
  setReplyingTo,
  sendLoading,
  voiceSendLoading,
  composerInputHeight,
  setComposerInputHeight,
  composerSelection,
  setComposerSelection,
  bottomSafeInset,
  otherUserTyping,
  onLayout,
  onSendPress,
  onMicPress,
  onAttachPress,
  onTypingStart,
  onTypingStop,
  getMessagePreview,
  getFileTypeLabel,
}: ChatComposerProps) {
  const hasSendContent = inputText.trim().length > 0 || pendingAttachments.length > 0;

  return (
    <View onLayout={onLayout}>
      {replyingTo != null && (
        <View style={[styles.replyToBar, { paddingHorizontal: H_PADDING }]}>
          <LinearGradient
            colors={[...colors.gradients.primary.colors]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.replyToBarGradientBorder}
          />
          <View style={styles.replyToBarContent}>
            <Text style={styles.replyToBarLabel}>
              {STRINGS.CHAT.REPLYING_TO} {replyingTo.senderName}
            </Text>
            <Text style={styles.replyToBarPreview} numberOfLines={2}>
              {getMessagePreview(replyingTo.message)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.replyToBarDismiss}
            onPress={() => setReplyingTo(null)}
            activeOpacity={0.8}
          >
            <GeneratingCloseIcon size={22} color={colors.black} />
          </TouchableOpacity>
        </View>
      )}

      <View style={[styles.inputBar, { paddingBottom: 12 + bottomSafeInset }]}>
        <View style={styles.inputWrap}>
          {pendingAttachments.length > 0 && (
            <View style={styles.attachmentsInsidePill}>
              {pendingAttachments.map((att, i) => (
                <View key={i} style={styles.attachmentPreviewWrapper}>
                  <View style={att.type === 'image' ? styles.attachmentPreview : styles.attachmentPreviewFileCard}>
                    {att.type === 'image' ? (
                      <Image source={{ uri: att.uri }} style={styles.attachmentPreviewImage} resizeMode="cover" />
                    ) : (
                      <>
                        <Text style={styles.attachmentPreviewFileType}>{getFileTypeLabel(att.name)}</Text>
                        <Text style={styles.attachmentPreviewFileName} numberOfLines={2}>
                          {att.name}
                        </Text>
                      </>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.attachmentRemove}
                    onPress={() => setPendingAttachments((p) => p.filter((_, idx) => idx !== i))}
                  >
                    <Text style={{ color: colors.white, fontSize: 12, fontWeight: '600' }}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <View style={styles.inputRow}>
            <TouchableOpacity style={styles.attachButton} activeOpacity={0.7} onPress={onAttachPress}>
              <PlusIcon size={20} color={colors.black} />
            </TouchableOpacity>
            <View style={styles.composerInputOuter}>
              {inputText.length === 0 && (
                <Text pointerEvents="none" style={styles.composerPlaceholder} numberOfLines={1}>
                  {otherUserTyping ? 'typing…' : STRINGS.CHAT.START_CHAT_PLACEHOLDER}
                </Text>
              )}
              <TextInput
                style={[styles.chatInput, Platform.OS === 'android' && { height: composerInputHeight }]}
                ref={inputRef}
                placeholder=""
                value={inputText}
                selection={composerSelection}
                autoCorrect={false}
                onChangeText={setInputText}
                onSelectionChange={(event) => {
                  const { start, end } = event.nativeEvent.selection;
                  setComposerSelection({ start, end });
                }}
                onKeyPress={(event) => {
                  if (Platform.OS !== 'ios' || event.nativeEvent.key !== 'Enter') return;
                  const { start, end } = composerSelection;
                  const safeStart = Math.max(0, Math.min(start, inputText.length));
                  const safeEnd = Math.max(safeStart, Math.min(end, inputText.length));
                  const nextText = `${inputText.slice(0, safeStart)}\n${inputText.slice(safeEnd)}`;
                  const nextCursor = safeStart + 1;
                  setInputText(nextText);
                  setComposerSelection({ start: nextCursor, end: nextCursor });
                }}
                onContentSizeChange={(event) => {
                  const height = event.nativeEvent.contentSize.height;
                  const newHeight = Math.max(CHAT_INPUT_MIN_HEIGHT, Math.min(CHAT_INPUT_MAX_HEIGHT, height));
                  setComposerInputHeight(newHeight);
                }}
                onFocus={onTypingStart}
                onBlur={onTypingStop}
                multiline
                blurOnSubmit={false}
                scrollEnabled={composerInputHeight >= CHAT_INPUT_MAX_HEIGHT}
                underlineColorAndroid="transparent"
                textAlignVertical="top"
                disableFullscreenUI
                returnKeyType="default"
                keyboardType="default"
                cursorColor={colors.primary.purple}
                selectionColor={colors.primary[50]}
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.sendButton, !hasSendContent && styles.sendButtonMic]}
          activeOpacity={0.8}
          onPress={() => {
            if (!hasSendContent) {
              void onMicPress();
              return;
            }
            void onSendPress();
          }}
          disabled={sendLoading || voiceSendLoading}
        >
          {sendLoading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : !hasSendContent ? (
            <MicIcon size={22} color={colors.black} />
          ) : (
            <ForwardArrowIcon size={22} color={colors.white} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
});
