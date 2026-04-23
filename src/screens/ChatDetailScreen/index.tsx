import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Keyboard,
  Platform,
  Modal,
  TouchableWithoutFeedback,
  StyleSheet,
  Alert,
  Linking,
  StatusBar,
  ActivityIndicator,
  LayoutChangeEvent,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { pick } from '@react-native-documents/picker';
import { Button } from '../../components/Button';
import { ReusableBottomSheet } from '../../components/BottomSheet';
import {
  checkCameraPermission,
  requestCameraPermission,
  checkPhotoLibraryPermission,
  requestPhotoLibraryPermission,
  checkMicrophonePermission,
  requestMicrophonePermission,
} from '../../config/permissions';
import { BackArrowIcon } from '../../assets/icons/common/BackArrowIcon';
import { MoreVertIcon } from '../../assets/icons/common/MoreVertIcon';
import { ChatHeaderVideoCallIcon } from '../../assets/icons/common/ChatHeaderVideoCallIcon';
import { ChatHeaderVoiceCallIcon } from '../../assets/icons/common/ChatHeaderVoiceCallIcon';
import { CallVideoIncomingIcon } from '../../assets/icons/common/CallVideoIncomingIcon';
import { CallVideoOutgoingIcon } from '../../assets/icons/common/CallVideoOutgoingIcon';
import { CallVideoMissedIcon } from '../../assets/icons/common/CallVideoMissedIcon';
import { CallVoiceIncomingIcon } from '../../assets/icons/common/CallVoiceIncomingIcon';
import { CallVoiceOutgoingIcon } from '../../assets/icons/common/CallVoiceOutgoingIcon';
import { CallVoiceDeclinedIcon } from '../../assets/icons/common/CallVoiceDeclinedIcon';
import { VoiceControlEndIcon } from '../../assets/icons/common/VoiceControlEndIcon';
import { VoiceControlSpeakerIcon } from '../../assets/icons/common/VoiceControlSpeakerIcon';
import { VoiceControlVideoOffIcon } from '../../assets/icons/common/VoiceControlVideoOffIcon';
import { VoiceControlMicIcon } from '../../assets/icons/common/VoiceControlMicIcon';
import { VoiceControlMicOffIcon } from '../../assets/icons/common/VoiceControlMicOffIcon';
import { VoiceControlMessageIcon } from '../../assets/icons/common/VoiceControlMessageIcon';
import { AudioBluetoothIcon } from '../../assets/icons/common/AudioBluetoothIcon';
import { AudioEarpieceIcon } from '../../assets/icons/common/AudioEarpieceIcon';
import { AudioOptionCheckIcon } from '../../assets/icons/common/AudioOptionCheckIcon';
import { CameraIcon } from '../../assets/icons/common/CameraIcon';
import { BlockIcon } from '../../assets/icons/common/BlockIcon';
import { ReportIcon } from '../../assets/icons/common/ReportIcon';
import { InterestChipCheckIcon } from '../../assets/icons/common/InterestChipCheckIcon';
import { PlusIcon } from '../../assets/icons/common/PlusIcon';
import { ForwardArrowIcon } from '../../assets/icons/common/ForwardArrowIcon';
import { DeleteIcon } from '../../assets/icons/common/DeleteIcon';
import { MicIcon } from '../../assets/icons/common/MicIcon';
import { PlayIcon } from '../../assets/icons/common/PlayIcon';
import { PauseIcon } from '../../assets/icons/common/PauseIcon';
import { ReplyIcon } from '../../assets/icons/common/ReplyIcon';
import { AskAiraIcon } from '../../assets/icons/common/AskAiraIcon';
import { AskAiraSendIcon } from '../../assets/icons/common/AskAiraSendIcon';
import { GeneratingCloseIcon } from '../../assets/icons/common/GeneratingCloseIcon';
import { InformativeIcon } from '../../assets/icons/common/InformativeIcon';
import { ActionSheetFileIcon } from '../../assets/icons/common/ActionSheetFileIcon';
import { AttachmentOptionsBottomSheet, type AttachmentOption } from '../../components/AttachmentOptionsBottomSheet';
import { GradientText } from '../../components/GradientText';
import LinearGradient from 'react-native-linear-gradient';
import { STRINGS } from '../../constants/strings';
import { colors, typography } from '../../theme';
import type { ChatStackParamList } from '../../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { setChatRequestActionApi, blockUserApi, reportUserApi, getChatMessagesApi, mapApiMessageToChatMessage, markChatSeenApi, sendMessageApi, uploadChatFileApi, postAIMessagesApi, getAiSuggestionsApi, deleteMessageApi, extractChatMessageFromSendResponse, type ChatMessageApiItem } from '../../modules/chat/api';
import { useAuthStore } from '../../store/auth.store';
import socketService, {
  type MessageReceivePayload,
  type MessageDeletePayload,
  type TypingPayload,
  type IncomingCallPayload,
  type CallLifecyclePayload,
  type CallPartnerAudioPayload,
  type CallPartnerVideoPayload,
} from '../../services/socket/socketService';
import { styles, H_PADDING, CHAT_INPUT_MIN_HEIGHT, CHAT_INPUT_MAX_HEIGHT } from './styles';
import { TabAICenterIcon } from '../../assets/icons/tabs/TabAICenterIcon';
import { apiClient } from '../../services/api/client';
import { endpoints } from '../../services/api/endpoints';
import { showErrorToast, showSuccessToast } from '../../services/toast.srvice';
import type { ChatMessage, PendingAttachment } from './types';
import {
  now,
  extractChatIdFromAddChatResponse,
  firstNonEmptyString,
  formatMessageTimestamp,
} from './utils/helpers';
import { useKeyboardOffset } from './hooks/useKeyboardOffset';
import { useAiraSuggestions } from './hooks/useAiraSuggestions';
import { useVoiceRecording } from './hooks/useVoiceRecording';

type Props = NativeStackScreenProps<ChatStackParamList, 'ChatDetail'>;

const VOICE_WAVEFORM = [8, 12, 6, 14, 10, 16, 8, 14, 12, 10];

const DONT_SHOW_ASK_AIRA_CONFIRM_KEY = 'dont_show_ask_aira_confirm';
const MESSAGES_PAGE_SIZE = 10;
const APPROX_MORE_MENU_HEIGHT = 124;
const MORE_MENU_GAP = 8;
const APPROX_MESSAGE_CONTEXT_HEIGHT = 132;
const MESSAGE_CONTEXT_GAP = 8;
const MESSAGE_CONTEXT_MIN_WIDTH = 172;
type ActiveCallMode = 'voice' | 'video';
type IncomingCallPrompt = {
  callerName: string;
  mode: ActiveCallMode;
  callId?: string;
};
type AudioDevice = 'speaker' | 'earpiece' | 'bluetooth' | 'wired';

const REPORT_REASONS: { value: string; label: string }[] = [
  { value: 'inappropriate_messages', label: 'Inappropriate messages' },
  { value: 'fake_or_spam', label: 'Fake or spam account' },
  { value: 'harassment_or_bullying', label: 'Harassment or bullying' },
  { value: 'offensive_profile', label: 'Offensive profile content' },
  { value: 'underage_user', label: 'Underage user' },
  { value: 'something_else', label: "It's something else" },
];

export const ChatDetailScreen = ({ route, navigation }: Props) => {
  const {
    chatId: initialChatId,
    avatar: initialAvatar,
    name: initialName,
    isRequest: initialIsRequest,
    otherUserId: initialOtherUserId,
  } = route.params;
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const bottomSafeInset = insets.bottom;
  const imageBubbleSize = Math.max(160, Math.min(Math.round(windowWidth * 0.75), 320));
  const currentUserId = useAuthStore((s) => s.user?.id);
  const [chatId, setChatId] = useState<string | null>(initialChatId ?? null);
  const [name, setName] = useState<string>(initialName ?? 'Chat');
  const [avatar, setAvatar] = useState<typeof initialAvatar | undefined>(initialAvatar);
  const [isRequest, setIsRequest] = useState<boolean>(!!initialIsRequest);
  const [otherUserId, setOtherUserId] = useState<string | undefined>(initialOtherUserId);
  const [requestActionLoading, setRequestActionLoading] = useState<'accept' | 'decline' | 'block' | null>(null);
  const [messagesLoading, setMessagesLoading] = useState(!!chatId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagesPage, setMessagesPage] = useState(1);
  const [messagesHasMore, setMessagesHasMore] = useState(true);
  const [messagesLoadingMore, setMessagesLoadingMore] = useState(false);
  const [inputText, setInputText] = useState('');
  const [attachmentSheetOpen, setAttachmentSheetOpen] = useState(false);

  const [showCameraPermissionSheet, setShowCameraPermissionSheet] = useState(false);
  const [showGalleryPermissionSheet, setShowGalleryPermissionSheet] = useState(false);
  const [showMicrophonePermissionSheet, setShowMicrophonePermissionSheet] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
  const [moreMenuVisible, setMoreMenuVisible] = useState(false);
  /** Screen-space placement for the header overflow menu (below / aligned to the ⋮ control). */
  const [moreMenuScreenPos, setMoreMenuScreenPos] = useState<{ top: number; right: number } | null>(
    null,
  );
  const moreMenuButtonRef = useRef<View>(null);
  const [blockConfirmVisible, setBlockConfirmVisible] = useState(false);
  const [blockConfirmLoading, setBlockConfirmLoading] = useState(false);
  const [showReportSheet, setShowReportSheet] = useState(false);
  const [reportSheetMode, setReportSheetMode] = useState<'report' | 'blockReport'>('report');
  const [selectedReportReason, setSelectedReportReason] = useState<string | null>(null);
  const [reportMessageInput, setReportMessageInput] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [messageContextIndex, setMessageContextIndex] = useState<number | null>(null);
  /** Screen-space anchor for Reply/Delete menu (aligned to the long-pressed bubble). */
  const [messageContextAnchor, setMessageContextAnchor] = useState<{
    top: number;
    left?: number;
    right?: number;
  } | null>(null);
  const messageBubbleRefsRef = useRef<Map<number, View>>(new Map());
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
  const [activeCallMode, setActiveCallMode] = useState<ActiveCallMode>('voice');
  const [callStateVisible, setCallStateVisible] = useState(false);
  const [callAudioEnabled, setCallAudioEnabled] = useState(true);
  const [callVideoEnabled, setCallVideoEnabled] = useState(true);
  const [partnerAudioEnabled, setPartnerAudioEnabled] = useState(true);
  const [partnerVideoEnabled, setPartnerVideoEnabled] = useState(true);
  const [videoCallUiHidden, setVideoCallUiHidden] = useState(false);
  const [incomingVoiceCallVisible, setIncomingVoiceCallVisible] = useState(false);
  const [incomingVoiceCallerName, setIncomingVoiceCallerName] = useState('');
  const [incomingVoiceCallId, setIncomingVoiceCallId] = useState<string | null>(null);
  const [incomingVideoCallVisible, setIncomingVideoCallVisible] = useState(false);
  const [incomingVideoCallerName, setIncomingVideoCallerName] = useState('');
  const [incomingVideoCallId, setIncomingVideoCallId] = useState<string | null>(null);
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [isOutgoingVoiceRinging, setIsOutgoingVoiceRinging] = useState(false);
  const [isSwitchingVoiceToVideo, setIsSwitchingVoiceToVideo] = useState(false);
  const [callConnectedAtMs, setCallConnectedAtMs] = useState<number | null>(null);
  const [callDurationSec, setCallDurationSec] = useState(0);
  const [audioDeviceSheetVisible, setAudioDeviceSheetVisible] = useState(false);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<AudioDevice>('speaker');
  const [switchToVideoPopupVisible, setSwitchToVideoPopupVisible] = useState(false);
  const videoLocalPreviewTop = Math.round((500 / 812) * windowHeight);
  const videoLocalPreviewHiddenTop = Math.round((580 / 812) * windowHeight);
  const videoControlsTop = Math.round((716 / 812) * windowHeight);
  const incomingVoiceActionsBottomInset = Math.max(22, bottomSafeInset + 8);
  const incomingVoiceCenterBottomInset = Math.max(
    34,
    Math.min(62, Math.round((46 * windowHeight) / 812)),
  );

  const showSettingsAlert = (permissionName: 'camera' | 'photos' | 'microphone') => {
    const titleMap = {
      camera: 'Camera access is turned off',
      photos: 'Photo access is turned off',
      microphone: 'Microphone access is turned off',
    };
    const messageMap = {
      camera: 'To continue, allow camera access for Aira in Settings.',
      photos: 'To continue, allow photo library access for Aira in Settings.',
      microphone: 'To continue, allow microphone access for Aira in Settings.',
    };
    Alert.alert(titleMap[permissionName], messageMap[permissionName], [
      { text: 'Not now', style: 'cancel' },
      { text: 'Open Settings', onPress: () => void Linking.openSettings() },
    ]);
  };

  /** Send-message responses often omit `content` or nest the document; merge so the bubble shows immediately. */
  const enrichOutgoingTextPayload = (
    partial: ChatMessageApiItem | undefined,
    sentText: string,
  ): ChatMessageApiItem => {
    const merged: ChatMessageApiItem = {
      messageType: 'text',
      ...partial,
      isSentByMe: partial?.isSentByMe ?? true,
    };
    const fromApi =
      (typeof merged.content === 'string' && merged.content.trim()) ||
      (merged.content &&
        typeof merged.content === 'object' &&
        merged.content !== null &&
        'text' in merged.content &&
        String((merged.content as { text?: unknown }).text ?? '').trim()) ||
      (typeof (merged as { text?: string }).text === 'string' &&
        (merged as { text: string }).text.trim()) ||
      '';
    if (!fromApi && sentText.trim()) {
      merged.content = sentText.trim();
    }
    return merged;
  };

  const enrichOutgoingMediaPayload = (
    partial: ChatMessageApiItem | undefined,
    messageType: ChatMessageApiItem['messageType'] | 'video',
    fileUrl: string,
  ): ChatMessageApiItem =>
    ({
      ...partial,
      messageType: messageType ?? partial?.messageType,
      isSentByMe: partial?.isSentByMe ?? true,
      messageTimeStamp: partial?.messageTimeStamp ?? new Date().toISOString(),
      files:
        partial?.files && partial.files.length > 0
          ? partial.files
          : [{ url: fileUrl, uri: fileUrl }],
    }) as ChatMessageApiItem;

  const isPickingFileRef = useRef(false);
  const [replyingTo, setReplyingTo] = useState<{ index: number; message: ChatMessage; senderName: string; messageId?: string } | null>(null);
  const [sendLoading, setSendLoading] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [otherUserOnline, setOtherUserOnline] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [composerHeight, setComposerHeight] = useState(120);
  /** Growing multiline composer: expands until CHAT_INPUT_MAX_HEIGHT, then scrolls inside. */
  const [composerInputHeight, setComposerInputHeight] = useState(CHAT_INPUT_MIN_HEIGHT);
  const [imagePreviewUri, setImagePreviewUri] = useState<string | null>(null);
  const [imagePreviewZoomed, setImagePreviewZoomed] = useState(false);
  const imagePreviewLastTapRef = useRef<number>(0);
  const typingStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const otherUserTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const { keyboardHeight, composerBottomOffset, resetKeyboard } = useKeyboardOffset({
    windowHeight,
    scrollViewRef,
  });
  const {
    askAiraGenerating,
    generatedReplies,
    askAiraConfirmVisible,
    setAskAiraConfirmVisible,
    dontShowAskAiraAgain,
    setDontShowAskAiraAgain,
    dontShowAskAiraPersisted,
    askAiraConfirmLoading,
    airaLimitReachedVisible,
    setAiraLimitReachedVisible,
    airaLimitCountdown,
    airaSuggestionsLimitLeft,
    airaSuggestionsTotalLimit,
    selectedReplyIndex,
    setSelectedReplyIndex,
    setDontShowAskAiraPersisted,
    setGeneratedReplies,
    requestAiSuggestions,
    handleCancelAiSuggestions,
    handleInsertReply,
  } = useAiraSuggestions({ chatId, setInputText });
  // Prevent the "auto scroll to bottom" effect from running when we prepend older messages.
  // (When pagination prepends items, ScrollView tends to jump if we always scrollToEnd.)
  const isPrependingOlderMessagesRef = useRef(false);
  const contentHeightRef = useRef(0);
  const scrollYRef = useRef(0);
  const layoutHeightRef = useRef(0);
  const didInitialScrollToBottomRef = useRef(false);
  const pendingPrependScrollRef = useRef<{ prevScrollY: number; prevContentHeight: number } | null>(null);
  /** Bumped after we append our own message(s) so we scroll once layout has the new content (refs in the other effect are often stale on that frame). */
  const [scrollAfterLocalSendNonce, setScrollAfterLocalSendNonce] = useState(0);
  const bumpScrollAfterLocalSend = useCallback(() => {
    setScrollAfterLocalSendNonce((n) => n + 1);
  }, []);

  const onSendVoice = useCallback(async (filePath: string) => {
    if (!currentUserId || !otherUserId) return;
    let effectiveChatId = chatId;
    if (!effectiveChatId) {
      const addRes = await apiClient.post(endpoints.chat.addChat, {
        senderId: currentUserId,
        receiverId: otherUserId,
        firstMessage: '',
      });
      effectiveChatId = extractChatIdFromAddChatResponse(addRes);
      if (!effectiveChatId) return;
      setChatId(effectiveChatId);
      navigation.setParams({ chatId: effectiveChatId } as any);
    }
    const fileName = `voice_${Date.now()}.m4a`;
    const { url, key } = await uploadChatFileApi(filePath, { mimeType: 'audio/m4a', fileName });
    const res = await sendMessageApi({
      chatId: effectiveChatId!,
      content: '',
      messageType: 'audio',
      files: [{ url, key }],
      replyTo: replyingTo?.messageId ?? null,
    });
    const extracted = extractChatMessageFromSendResponse(res);
    const apiMessage = enrichOutgoingMediaPayload(extracted, 'audio', url);
    const ui = mapApiMessageToChatMessage(apiMessage, currentUserId, {
      chatStatus: isRequest ? 'pending' : undefined,
    });
    if (ui) {
      setMessages((prev) => [...prev, ui as ChatMessage]);
      bumpScrollAfterLocalSend();
    }
    socketService.messageSendFromApi(
      currentUserId,
      otherUserId,
      apiMessage as unknown as Record<string, unknown>,
    );
    setReplyingTo(null);
  }, [chatId, currentUserId, otherUserId, replyingTo, isRequest, enrichOutgoingMediaPayload, bumpScrollAfterLocalSend]);

  const voice = useVoiceRecording({ onSendVoice });

  const handleComposerLayout = useCallback((event: LayoutChangeEvent) => {
    const nextHeight = Math.round(event.nativeEvent.layout.height);
    if (nextHeight > 0) {
      setComposerHeight((prev) => (prev === nextHeight ? prev : nextHeight));
    }
  }, []);

  const scrollToBottom = (animated = true) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated });
    }, 50);
  };

  useFocusEffect(
    useCallback(() => {
      return () => {
        voice.resetVoiceState();
        resetKeyboard();
        Keyboard.dismiss();
      };
    }, [voice.resetVoiceState, resetKeyboard])
  );

  const isOtherUserOnlineFromPayload = useCallback(
    (payload: unknown): boolean | null => {
      if (!payload || !otherUserId) return null;
      // Some backends emit arrays or nested objects for presence updates.
      if (Array.isArray(payload)) {
        const ids = payload
          .map((x) => {
            if (typeof x === 'string' || typeof x === 'number') return String(x);
            if (x && typeof x === 'object') {
              const o = x as Record<string, unknown>;
              return String(o.userId ?? o.user_id ?? o.id ?? o._id ?? o.memberId ?? o.member_id ?? '');
            }
            return '';
          })
          .filter(Boolean);
        return ids.includes(String(otherUserId));
      }

      const data = payload as Record<string, unknown>;

      const directUserId = String(
        data.userId ?? data.user_id ?? data.id ?? data.memberId ?? data.member_id ?? ''
      );
      const directOnline = data.online ?? data.isOnline ?? data.status;
      if (directUserId === otherUserId && directOnline != null) {
        if (typeof directOnline === 'string') {
          const normalized = directOnline.toLowerCase();
          return normalized === 'online' || normalized === 'true' || normalized === '1';
        }
        return Boolean(directOnline);
      }

      const rawOnlineList =
        data.users ??
        data.onlineUserIds ??
        data.onlineUsers ??
        data.online_users ??
        data.userIds ??
        data.user_ids;
      if (Array.isArray(rawOnlineList)) {
        const onlineIds = rawOnlineList
          .map((entry) => {
            if (typeof entry === 'string' || typeof entry === 'number') return String(entry);
            if (entry && typeof entry === 'object') {
              const obj = entry as Record<string, unknown>;
              return String(
                obj.userId ?? obj.user_id ?? obj.id ?? obj._id ?? obj.memberId ?? obj.member_id ?? ''
              );
            }
            return '';
          })
          .filter(Boolean);
        return onlineIds.includes(String(otherUserId));
      }
      return null;
    },
    [otherUserId]
  );

  const parseIncomingCallPayload = useCallback(
    (data: IncomingCallPayload): IncomingCallPrompt | null => {
      if (otherUserId && data.senderId && data.senderId !== otherUserId) {
        return null;
      }
      const mode: ActiveCallMode = data.callType === 'video' ? 'video' : 'voice';
      const callerName =
        String(data.callerName ?? name ?? '').trim() || 'Incoming call';
      return { callerName, mode, callId: data.callId };
    },
    [name, otherUserId]
  );


  const getMessageTypeFromAttachment = (
    att: PendingAttachment
  ): 'image' | 'audio' | 'video' | 'document' => {
    if (att.type === 'image') return 'image';
    const name = (att as { type: 'file'; name: string }).name?.toLowerCase() ?? '';
    const ext = name.split('.').pop() ?? '';
    if (['mp4', 'mov', 'webm', 'mkv'].includes(ext)) return 'video';
    if (['mp3', 'm4a', 'wav', 'aac', 'ogg'].includes(ext)) return 'audio';
    return 'document';
  };

  const getMimeTypeFromAttachment = (
    att: PendingAttachment
  ): string => {
    if (att.type === 'image') {
      const explicit = firstNonEmptyString(att.mimeType);
      if (explicit && explicit.startsWith('image/')) return explicit;
      const name = firstNonEmptyString(att.name, att.uri)?.toLowerCase() ?? '';
      const ext = name.split('.').pop() ?? '';
      if (ext === 'png') return 'image/png';
      if (ext === 'webp') return 'image/webp';
      if (ext === 'gif') return 'image/gif';
      return 'image/jpeg';
    }
    const name = (att as { type: 'file'; name: string }).name?.toLowerCase() ?? '';
    const ext = name.split('.').pop() ?? '';
    if (['mp4', 'mov', 'webm', 'mkv'].includes(ext)) return 'video/mp4';
    if (['mp3', 'm4a', 'wav', 'aac', 'ogg'].includes(ext)) return 'audio/mpeg';
    if (ext === 'pdf') return 'application/pdf';
    if (['doc', 'docx'].includes(ext)) return 'application/msword';
    if (['xls', 'xlsx'].includes(ext)) return 'application/vnd.ms-excel';
    if (['ppt', 'pptx'].includes(ext)) return 'application/vnd.ms-powerpoint';
    if (ext === 'txt') return 'text/plain';
    return 'application/octet-stream';
  };

  const getFileTypeLabel = (name: string) => {
    const ext = name.split('.').pop()?.toUpperCase() ?? 'FILE';
    return ext.length <= 4 ? ext : 'FILE';
  };




  useEffect(() => {
    if (!chatId) return;
    markChatSeenApi(chatId).catch(() => {});
  }, [chatId]);

  useEffect(() => {
    if (!chatId) {
      setMessagesLoading(false);
      return;
    }
    let cancelled = false;
    setMessagesLoading(true);
    setMessagesPage(1);
    setMessagesHasMore(true);

    getChatMessagesApi({ chatId, page: 1, limit: MESSAGES_PAGE_SIZE })
      .then((res) => {
        if (cancelled) return;
        // Hydrate header + otherUserId from chat payload when caller only passed chatId/avatar.
        // Your API returns: data.chat.participants.{sender,receiver}
        const chatPayload = res.data?.chat as Record<string, unknown> | undefined;
        const participantsRaw =
          chatPayload && typeof chatPayload.participants === 'object'
            ? (chatPayload.participants as Record<string, unknown>)
            : null;
        const senderRaw =
          participantsRaw && typeof participantsRaw.sender === 'object'
            ? (participantsRaw.sender as Record<string, unknown>)
            : null;
        const receiverRaw =
          participantsRaw && typeof participantsRaw.receiver === 'object'
            ? (participantsRaw.receiver as Record<string, unknown>)
            : null;

        const pickOtherParticipant = (): Record<string, unknown> | null => {
          const me = typeof currentUserId === 'string' && currentUserId.trim() ? currentUserId.trim() : null;
          if (me && senderRaw && firstNonEmptyString(senderRaw._id, senderRaw.id) === me) return receiverRaw;
          if (me && receiverRaw && firstNonEmptyString(receiverRaw._id, receiverRaw.id) === me) return senderRaw;
          // Fallback: if we can't tell, prefer receiver as "other"
          return receiverRaw ?? senderRaw;
        };

        const other = pickOtherParticipant();
        if (other) {
          const pid = firstNonEmptyString(other._id, other.id, other.userId);
          if (!otherUserId && pid) setOtherUserId(pid);

          const pname = firstNonEmptyString(other.nickName, other.name);
          if ((name ?? '').trim().length === 0 || name === 'Chat') {
            if (pname) setName(pname);
          }

          if (!avatar) {
            const photo = other.profilePhoto;
            let avatarUrl: string | undefined;
            if (typeof photo === 'string') avatarUrl = photo;
            if (photo && typeof photo === 'object') {
              const u = (photo as { url?: Record<string, unknown> }).url as
                | { medium?: unknown; thumb?: unknown; original?: unknown }
                | undefined;
              avatarUrl = firstNonEmptyString(u?.medium, u?.thumb, u?.original);
            }
            const pic = typeof other.profilePicture === 'string' ? other.profilePicture : undefined;
            const picked = firstNonEmptyString(avatarUrl, pic);
            if (picked) setAvatar({ uri: picked } as any);
          }
        }

        const receiverParticipantId = receiverRaw
          ? firstNonEmptyString(receiverRaw._id, receiverRaw.id, receiverRaw.userId)
          : undefined;
        const senderParticipantId = senderRaw
          ? firstNonEmptyString(senderRaw._id, senderRaw.id, senderRaw.userId)
          : undefined;

        // Derive request mode from chat status when not supplied.
        // addChat uses senderId = initiator and receiverId = person who must accept.
        // Only the receiver should see Accept / Decline, not the sender.
        if (!initialIsRequest && chatPayload) {
          const status = String((chatPayload.status as unknown) ?? '').toLowerCase();
          const isPendingStatus = status.includes('pending') || status.includes('request');
          const me =
            typeof currentUserId === 'string' && currentUserId.trim() ? currentUserId.trim() : '';
          if (!isPendingStatus) {
            setIsRequest(false);
          } else if (receiverParticipantId && me && me === receiverParticipantId) {
            setIsRequest(true);
          } else if (senderParticipantId && me && me === senderParticipantId) {
            setIsRequest(false);
          } else {
            setIsRequest(false);
          }
        }
        const raw = res.data?.list ?? res.data?.messages ?? [];
        const list = Array.isArray(raw)
          ? raw
              .map((item) =>
                mapApiMessageToChatMessage(item, currentUserId ?? undefined, {
                  chatStatus: String(((res.data?.chat as { status?: unknown } | undefined)?.status) ?? ''),
                })
              )
              .filter((m): m is ChatMessage => m != null)
              // Backend returns newest first; reverse so UI shows oldest -> newest.
              .reverse()
          : [];
        setMessages(list);

        const meta = res.data?.meta;
        const currentPage = meta?.currentPage ?? meta?.pageNo ?? 1;
        const totalPages = meta?.totalPages ?? 1;
        setMessagesPage(currentPage);
        setMessagesHasMore(currentPage < totalPages);
      })
      .catch(() => {
        if (!cancelled) {
          setMessages([]);
          setMessagesHasMore(false);
        }
      })
      .finally(() => {
        if (!cancelled) setMessagesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [chatId, currentUserId]);

  useEffect(() => {
    if (!chatId || !currentUserId || !otherUserId) return;
    setSocketConnected(socketService.isConnected());
    socketService.join(chatId);
    const unsubMessage = socketService.on<MessageReceivePayload>('message_send', (data) => {
      const apiMessage = (data.message ?? {}) as ChatMessageApiItem;
      const senderId = (apiMessage.sender as string | undefined) ?? data.sender;
      const receiverId = (apiMessage.receiver as string | undefined) ?? data.receiver;
      const isForMe = receiverId === currentUserId;
      const isFromMe = senderId === currentUserId;
      const isFromOtherInThisChat = senderId === otherUserId;
      if (!isForMe || isFromMe) return;
      if (!isFromOtherInThisChat) return;

      // For socket messages, backend may set isSentByMe from the sender's perspective.
      // Override it here so the UI uses the current device's user id.
      const adjusted: ChatMessageApiItem = {
        ...apiMessage,
        isSentByMe: senderId === currentUserId,
      };

      const ui = mapApiMessageToChatMessage(adjusted, currentUserId, {
        chatStatus: isRequest ? 'pending' : undefined,
      });
      if (!ui) return;
      setMessages((prev) => [...prev, ui as ChatMessage]);
      // Mark this chat as seen so unread counts are cleared on other screens.
      if (chatId) {
        markChatSeenApi(chatId).catch(() => {});
      }
    });
    const unsubDelete = socketService.on<MessageDeletePayload>('message_delete', (data) => {
      if (!data?.messageId) return;
      setMessages((prev) =>
        prev.filter((m) => (m as { messageId?: string }).messageId !== data.messageId)
      );
    });
    const unsubTyping = socketService.on<TypingPayload>('typing', (data) => {
      const applies =
        data.sender === otherUserId &&
        (data.receiver === currentUserId || !data.receiver);
      if (!applies) return;

      // Some backends only emit "typing=true" and never send "typing=false".
      // Auto-expire typing so the UI can fall back to "Online".
      if (otherUserTypingTimeoutRef.current) {
        clearTimeout(otherUserTypingTimeoutRef.current);
        otherUserTypingTimeoutRef.current = null;
      }

      setOtherUserTyping(Boolean(data.isTyping));
      if (data.isTyping) {
        otherUserTypingTimeoutRef.current = setTimeout(() => {
          setOtherUserTyping(false);
          otherUserTypingTimeoutRef.current = null;
        }, 2500);
      }
    });
    const unsubJoinSuccess = socketService.on<unknown>('join_success', (data) => {
      const presence = isOtherUserOnlineFromPayload(data);
      const shouldLog = (globalThis as any).__DEV__ ?? false;
      if (shouldLog) {
        console.log('[ChatDetail] presence event', {
          chatId,
          currentUserId,
          otherUserId,
          raw: data,
          parsedPresence: presence,
        });
      }
      if (presence !== null) {
        setOtherUserOnline(presence);
      }
    });
    const unsubConnection = socketService.onConnectionChange((connected) => {
      setSocketConnected(connected);
      const shouldLog = (globalThis as any).__DEV__ ?? false;
      if (shouldLog) {
        console.log('[ChatDetail] socket connection change', {
          connected,
          chatId,
          currentUserId,
          otherUserId,
        });
      }
      if (!connected) {
        setOtherUserOnline(false);
      }
      if (connected) {
        // Ensure we (re)join the chat room after reconnect so
        // incoming messages are received reliably (especially on iOS).
        if (chatId) {
          socketService.join(chatId);
        }

        getChatMessagesApi({ chatId })
          .then((res) => {
            const raw = res.data?.list ?? res.data?.messages ?? [];
            const list = Array.isArray(raw)
              ? raw
                  .map((item) =>
                    mapApiMessageToChatMessage(item, currentUserId ?? undefined, {
                      chatStatus: String(((res.data?.chat as { status?: unknown } | undefined)?.status) ?? ''),
                    })
                  )
                  .filter((m): m is ChatMessage => m != null)
                  .reverse()
              : [];
            setMessages(list);
          })
          .catch(() => {});
      }
    });
    const showIncomingCallPrompt = (payload: IncomingCallPayload) => {
      const parsed = parseIncomingCallPayload(payload);
      if (!parsed) return;
      if (parsed.mode === 'video') {
        setIncomingVideoCallerName(parsed.callerName);
        setIncomingVideoCallId(parsed.callId ?? null);
        setIncomingVideoCallVisible(true);
        return;
      }
      setIncomingVoiceCallerName(parsed.callerName);
      setIncomingVoiceCallId(parsed.callId ?? null);
      setIncomingVoiceCallVisible(true);
    };
    const onCallAccepted = (payload: CallLifecyclePayload) => {
      if (!payload.callId) return;
      setActiveCallId(payload.callId);
      if (isSwitchingVoiceToVideo) {
        setActiveCallMode('video');
        setCallVideoEnabled(true);
        setVideoCallUiHidden(false);
      }
      setIsSwitchingVoiceToVideo(false);
      setAudioDeviceSheetVisible(false);
      setPartnerAudioEnabled(true);
      setPartnerVideoEnabled(true);
      setIsOutgoingVoiceRinging(false);
      setCallConnectedAtMs(Date.now());
      setCallStateVisible(true);
      setIncomingVoiceCallVisible(false);
      setIncomingVideoCallVisible(false);
      setSwitchToVideoPopupVisible(false);
    };
    const onCallRejected = (payload: CallLifecyclePayload) => {
      if (!payload.callId) return;
      if (activeCallId && payload.callId !== activeCallId) return;
      setIncomingVoiceCallVisible(false);
      setIncomingVideoCallVisible(false);
      setCallStateVisible(false);
      setActiveCallId(null);
      setPartnerAudioEnabled(true);
      setPartnerVideoEnabled(true);
      setIsOutgoingVoiceRinging(false);
      setIsSwitchingVoiceToVideo(false);
      setSwitchToVideoPopupVisible(false);
      setCallConnectedAtMs(null);
      setCallDurationSec(0);
      showErrorToast('Call was declined.');
    };
    const onCallEnded = (payload: CallLifecyclePayload) => {
      if (!payload.callId) return;
      if (activeCallId && payload.callId !== activeCallId) return;
      setIncomingVoiceCallVisible(false);
      setIncomingVideoCallVisible(false);
      setCallStateVisible(false);
      setActiveCallId(null);
      setPartnerAudioEnabled(true);
      setPartnerVideoEnabled(true);
      setIsOutgoingVoiceRinging(false);
      setIsSwitchingVoiceToVideo(false);
      setSwitchToVideoPopupVisible(false);
      setCallConnectedAtMs(null);
      setCallDurationSec(0);
      showSuccessToast('Call ended.');
    };
    const onCallPartnerAudio = (payload: CallPartnerAudioPayload) => {
      if (!payload.userId || payload.userId !== otherUserId) return;
      if (activeCallId && payload.callId && payload.callId !== activeCallId) return;
      setPartnerAudioEnabled(payload.enabled);
    };
    const onCallPartnerVideo = (payload: CallPartnerVideoPayload) => {
      if (!payload.userId || payload.userId !== otherUserId) return;
      if (activeCallId && payload.callId && payload.callId !== activeCallId) return;
      setPartnerVideoEnabled(payload.enabled);
    };
    const unsubIncomingCall = socketService.on<IncomingCallPayload>('incoming_call', showIncomingCallPrompt);
    const unsubCallAccepted = socketService.on<CallLifecyclePayload>('call_accepted', onCallAccepted);
    const unsubCallRejected = socketService.on<CallLifecyclePayload>('call_rejected', onCallRejected);
    const unsubCallEnded = socketService.on<CallLifecyclePayload>('call_ended', onCallEnded);
    const unsubCallPartnerAudio = socketService.on<CallPartnerAudioPayload>('call_partner_audio', onCallPartnerAudio);
    const unsubCallPartnerVideo = socketService.on<CallPartnerVideoPayload>('call_partner_video', onCallPartnerVideo);
    return () => {
      unsubMessage();
      unsubDelete();
      unsubTyping();
      unsubJoinSuccess();
      unsubConnection();
      unsubIncomingCall();
      unsubCallAccepted();
      unsubCallRejected();
      unsubCallEnded();
      unsubCallPartnerAudio();
      unsubCallPartnerVideo();
    };
  }, [activeCallId, chatId, currentUserId, isOtherUserOnlineFromPayload, isSwitchingVoiceToVideo, otherUserId, parseIncomingCallPayload]);

  useEffect(() => {
    return () => {
      if (otherUserTypingTimeoutRef.current) {
        clearTimeout(otherUserTypingTimeoutRef.current);
        otherUserTypingTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!chatId || !currentUserId || !otherUserId) return;
    if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
    if (typingStopRef.current) clearTimeout(typingStopRef.current);
    if (inputText.trim().length > 0) {
      typingDebounceRef.current = setTimeout(() => {
        socketService.typing(currentUserId, otherUserId, true);
        if (typingStopRef.current) clearTimeout(typingStopRef.current);
        typingStopRef.current = setTimeout(() => {
          socketService.typing(currentUserId, otherUserId, false);
        }, 2000);
      }, 300);
    } else {
      socketService.typing(currentUserId, otherUserId, false);
    }
    return () => {
      if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
      if (typingStopRef.current) clearTimeout(typingStopRef.current);
    };
  }, [chatId, currentUserId, otherUserId, inputText]);

  const loadMoreMessages = useCallback(async () => {
    if (!chatId || messagesLoading || messagesLoadingMore || !messagesHasMore) {
      return;
    }
    setMessagesLoadingMore(true);
    pendingPrependScrollRef.current = {
      prevScrollY: scrollYRef.current,
      prevContentHeight: contentHeightRef.current,
    };
    const nextPage = messagesPage + 1;
    try {
      const res = await getChatMessagesApi({ chatId, page: nextPage, limit: MESSAGES_PAGE_SIZE });
      const raw = res.data?.list ?? res.data?.messages ?? [];
      const list = Array.isArray(raw)
        ? raw
            .map((item) =>
              mapApiMessageToChatMessage(item, currentUserId ?? undefined, {
                chatStatus: String(((res.data?.chat as { status?: unknown } | undefined)?.status) ?? ''),
              })
            )
            .filter((m): m is ChatMessage => m != null)
            .reverse()

        : [];

      if (list.length > 0) {
        // Tell the auto-scroll effect that we are prepending older messages,
        // so it should NOT jump to the bottom.
        isPrependingOlderMessagesRef.current = true;
        setMessages((prev) => [...list, ...prev]);
        const meta = res.data?.meta;
        const currentPage = meta?.currentPage ?? meta?.pageNo ?? nextPage;
        const totalPages = meta?.totalPages ?? nextPage;
        setMessagesPage(currentPage);
        setMessagesHasMore(currentPage < totalPages);
      } else {
        pendingPrependScrollRef.current = null;
        setMessagesHasMore(false);
      }
    } catch {
      // keep existing messages; stop further loads on repeated failure
      pendingPrependScrollRef.current = null;
      setMessagesHasMore(false);
    } finally {
      setMessagesLoadingMore(false);
    }
  }, [chatId, currentUserId, messagesHasMore, messagesLoading, messagesLoadingMore, messagesPage]);

  // useEffect(() => {
  //   if (messagesLoading || messages.length === 0) return;
  //   if (isPrependingOlderMessagesRef.current) {
  //     // We prepended older messages due to pagination; keep the current scroll position.
  //     // Next message update (e.g. new incoming/append) can scroll as normal.
  //     isPrependingOlderMessagesRef.current = false;
  //     const pending = pendingPrependScrollRef.current;
  //     pendingPrependScrollRef.current = null;
  //     if (pending) {
  //       // After React prepends content, adjust scrollY by the added content height.
  //       requestAnimationFrame(() => {
  //         const newContentHeight = contentHeightRef.current;
  //         const delta = newContentHeight - pending.prevContentHeight;
  //         if (delta > 0) {
  //           scrollViewRef.current?.scrollTo({
  //             y: pending.prevScrollY + delta,
  //             animated: false,
  //           });
  //         }
  //       });
  //     }
  //     return;
  //   }
  //   const distanceFromBottom =
  //     (contentHeightRef.current ?? 0) -
  //     ((scrollYRef.current ?? 0) + (layoutHeightRef.current ?? 0));
  //   const isNearBottom = distanceFromBottom < 120;
  //   const shouldScrollNow = !didInitialScrollToBottomRef.current || isNearBottom;
  //   if (!shouldScrollNow) return;
  //   didInitialScrollToBottomRef.current = true;
  //   const id = setTimeout(() => {
  //     scrollViewRef.current?.scrollToEnd({ animated: false });
  //   }, 100);
  //   return () => clearTimeout(id);
  // }, [messagesLoading, messages.length]);
  useEffect(() => {
    if (messagesLoading || messages.length === 0) return;
  
    if (isPrependingOlderMessagesRef.current) {
      isPrependingOlderMessagesRef.current = false;
  
      const pending = pendingPrependScrollRef.current;
      pendingPrependScrollRef.current = null;
  
      if (pending) {
        requestAnimationFrame(() => {
          const newContentHeight = contentHeightRef.current;
          const delta = newContentHeight - pending.prevContentHeight;
  
          if (delta > 0) {
            scrollViewRef.current?.scrollTo({
              y: pending.prevScrollY + delta,
              animated: false,
            });
          }
        });
      }
      return;
    }
  
    // ✅ ALWAYS scroll
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: false });
    }, 80);
  
  }, [messagesLoading, messages.length]);
  useLayoutEffect(() => {
    if (scrollAfterLocalSendNonce === 0 || messagesLoading) return;
    const id = requestAnimationFrame(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
      requestAnimationFrame(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      });
    });
    return () => cancelAnimationFrame(id);
  }, [scrollAfterLocalSendNonce, messagesLoading]);

  useEffect(() => {
    if (inputText.length > 0) return;
    setComposerInputHeight(CHAT_INPUT_MIN_HEIGHT);
  }, [inputText]);

  const getMessagePreview = (msg: ChatMessage): string => {
    if (msg.type === 'text') return msg.text;
    if (msg.type === 'rich') {
      const paragraph = msg.blocks.find((b) => b.type === 'paragraph');
      if (paragraph?.type === 'paragraph' && paragraph.text) return paragraph.text;
      const bullet = msg.blocks.find((b) => b.type === 'bullet_list');
      if (bullet?.type === 'bullet_list' && bullet.items.length > 0) {
        return bullet.items[0]?.title ?? bullet.items[0]?.description ?? 'Message';
      }
      return 'Message';
    }
    if (msg.type === 'voice') return 'Voice message';
    if (msg.type === 'image') return 'Photo';
    if (msg.type === 'file') return msg.name;
    return '';
  };

  const handleMicPress = async () => {
    if (inputText.trim() || pendingAttachments.length || sendLoading) return;
    const status = await checkMicrophonePermission();
    if (status !== 'granted') {
      setShowMicrophonePermissionSheet(true);
      return;
    }
    await voice.beginVoiceRecording();
  };

  const handleAllowMicrophonePermission = async () => {
    setIsRequestingPermission(true);
    try {
      const requested = await requestMicrophonePermission();
      setShowMicrophonePermissionSheet(false);
      if (requested === 'granted') {
        await voice.beginVoiceRecording();
      } else {
        showSettingsAlert('microphone');
      }
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const openCamera = () => {
    launchCamera(
      { mediaType: 'photo', quality: 0.8 },
      (response) => {
        if (response.didCancel || response.errorCode) return;
        const asset = response.assets?.[0];
        const uri = asset?.uri;
        if (uri) {
          setPendingAttachments((p) => [
            ...p,
            { type: 'image', uri, name: asset?.fileName, mimeType: asset?.type },
          ]);
        }
      }
    );
  };

  const openGallery = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        // `0` means "no limit" in react-native-image-picker.
        selectionLimit: 0,
        assetRepresentationMode: 'current',
      },
      (response) => {
        if (response.didCancel || response.errorCode) return;
        const pickedImages: PendingAttachment[] = [];
        (response.assets ?? []).forEach((a) => {
          const uri = a?.uri;
          if (!uri) return;
          const mimeType = a?.type;
          if (typeof mimeType === 'string') {
            if (!mimeType.startsWith('image/')) return;
          }
          pickedImages.push({
            type: 'image',
            uri,
            name: a?.fileName,
            mimeType,
          });
        });
        if (!pickedImages.length) return;
        setPendingAttachments((prev) => {
          const existing = new Set(prev.map((p) => p.uri));
          const next = [...prev];
          pickedImages.forEach((img) => {
            if (!existing.has(img.uri)) {
              existing.add(img.uri);
              next.push(img);
            }
          });
          return next;
        });
      }
    );
  };

  const openFilePicker = async () => {
    // Prevent overlapping pickers (iOS throws: previous promise did not settle)
    if (isPickingFileRef.current) return;
    isPickingFileRef.current = true;
    try {
      const results = await pick({ allowMultiSelection: false, copyTo: 'cachesDirectory' } as any);
      if (results?.length && results[0]) {
        const item: any = results[0];
        const uri: string | undefined = item.fileCopyUri ?? item.uri;
        const fileName: string | undefined = item.name;
        if (uri) {
          setPendingAttachments((p) => [...p, { type: 'file', uri, name: fileName ?? 'File' }]);
        }
      }
    } catch (error) {
      // User cancelled or error
    } finally {
      isPickingFileRef.current = false;
    }
  };

  const handleCamera = async () => {
    setAttachmentSheetOpen(false);
    const status = await checkCameraPermission();
    if (status === 'granted') {
      openCamera();
      return;
    }
    setShowCameraPermissionSheet(true);
  };

  const handleAllowCameraPermission = async () => {
    setIsRequestingPermission(true);
    try {
      const status = await requestCameraPermission();
      setShowCameraPermissionSheet(false);
      if (status === 'granted') {
        openCamera();
      } else {
        showSettingsAlert('camera');
      }
    } catch {
      setShowCameraPermissionSheet(false);
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const handleGallery = async () => {
    setAttachmentSheetOpen(false);
    const status = await checkPhotoLibraryPermission();
    const hasAccess = status === 'granted' || status === 'limited';
    if (hasAccess) {
      openGallery();
      return;
    }
    setShowGalleryPermissionSheet(true);
  };

  const handleAllowGalleryPermission = async () => {
    setIsRequestingPermission(true);
    try {
      const status = await requestPhotoLibraryPermission();
      setShowGalleryPermissionSheet(false);
      const hasAccess = status === 'granted' || status === 'limited';
      if (hasAccess) {
        openGallery();
      } else {
        showSettingsAlert('photos');
      }
    } catch {
      setShowGalleryPermissionSheet(false);
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const handleSend = async () => {
    
    const trimmed = inputText.trim();
    const hasAttachments = pendingAttachments.length > 0;
    if (!trimmed && !hasAttachments) return;
    if (!currentUserId || !otherUserId) return;
    setSendLoading(true);
    const replyToPayload = replyingTo?.messageId ?? null;
    try {
      let appendedOutgoing = false;
      let effectiveChatId = chatId;
      let justCreatedChatViaAdd = false;

      // If there is no existing chat, create it first with the first message
      if (!effectiveChatId) {
        const addRes = await apiClient.post(endpoints.chat.addChat, {
          senderId: currentUserId,
          receiverId: otherUserId,
          firstMessage: trimmed,
        });
        effectiveChatId = extractChatIdFromAddChatResponse(addRes);

        if (!effectiveChatId) {
          setSendLoading(false);
          return;
        }
        

        setChatId(effectiveChatId);
        // Update navigation params so future navigations have the chat id
        navigation.setParams({ chatId: effectiveChatId } as any);
        justCreatedChatViaAdd = true;
      }

      const clearComposerNative = () => {
        // For the Android native input we sometimes need to explicitly clear the
        // underlying EditText so the UI + placeholder stay in sync.
        const anyRef = inputRef as any;
        const current = anyRef?.current;
        if (current?.setNativeProps) {
          current.setNativeProps({ text: '', value: '' });
        }
      };
      const clearComposer = () => {
        clearComposerNative();
        setInputText('');
        if (Platform.OS === 'android') {
          requestAnimationFrame(() => clearComposerNative());
        }
      };

      if (trimmed) {
        socketService.typing(currentUserId, otherUserId, false);
        if (justCreatedChatViaAdd) {
          // firstMessage is already stored by addChat — avoid duplicate sendMessage + clear UI now
          clearComposer();
          setReplyingTo(null);
          try {
            const msgRes = await getChatMessagesApi({
              chatId: effectiveChatId!,
              page: 1,
              limit: MESSAGES_PAGE_SIZE,
            });
            const raw = msgRes.data?.list ?? msgRes.data?.messages ?? [];
            const list = Array.isArray(raw)
              ? raw
                  .map((item) =>
                    mapApiMessageToChatMessage(item, currentUserId ?? undefined, {
                      chatStatus: String(((msgRes.data?.chat as { status?: unknown } | undefined)?.status) ?? ''),
                    })
                  )
                  .filter((m): m is ChatMessage => m != null)
                  .reverse()
              : [];
            // Right after addChat, history can be briefly empty; still show what the user sent.
            if (list.length === 0 && trimmed) {
              setMessages([
                {
                  type: 'text',
                  text: trimmed,
                  timestamp: now(),
                  sent: true,
                },
              ]);
              appendedOutgoing = true;
              bumpScrollAfterLocalSend();
            } else {
              setMessages(list);
              appendedOutgoing = list.length > 0;
            }
            const meta = msgRes.data?.meta;
            const currentPage = meta?.currentPage ?? meta?.pageNo ?? 1;
            const totalPages = meta?.totalPages ?? 1;
            setMessagesPage(currentPage);
            setMessagesHasMore(currentPage < totalPages);
          } catch {
            // useEffect on chatId will still try to load messages
          }
        } else {
          const res = await sendMessageApi({
            chatId: effectiveChatId!,
            content: trimmed,
            messageType: 'text',
            files: [],
            replyTo: replyToPayload,
          });
          const extracted = extractChatMessageFromSendResponse(res);
          const apiMessage = enrichOutgoingTextPayload(extracted, trimmed);
          const ui = mapApiMessageToChatMessage(apiMessage, currentUserId, {
            chatStatus: isRequest ? 'pending' : undefined,
          });
          if (ui) {
            setMessages((prev) => [...prev, ui as ChatMessage]);
            appendedOutgoing = true;
            setTimeout(() => {
              scrollToBottom(true);
            }, 100);
          }
          if (currentUserId && otherUserId) {
            socketService.messageSendFromApi(
              currentUserId,
              otherUserId,
              apiMessage as unknown as Record<string, unknown>
            );
          }
          clearComposer();
          setReplyingTo(null);
        }
      }
      for (const att of pendingAttachments) {
        const messageType = getMessageTypeFromAttachment(att);
        const mimeType = getMimeTypeFromAttachment(att);
        const fileName = att.type === 'image'
          ? firstNonEmptyString(att.name, `image_${Date.now()}.jpg`)!
          : att.name;
        const { url, key } = await uploadChatFileApi(att.uri, { mimeType, fileName });
        const res = await sendMessageApi({
          chatId: effectiveChatId!,
          content: '',
          messageType,
          files: [{ url, key }],
          replyTo: replyToPayload,
        });
        const extracted = extractChatMessageFromSendResponse(res);
        const base = enrichOutgoingMediaPayload(extracted, messageType, url);
        const firstFile = Array.isArray(base.files) ? base.files[0] : undefined;
        const normalizedApiMessage: ChatMessageApiItem = {
          ...base,
          files: [
            {
              ...(firstFile ?? {}),
              url: firstNonEmptyString(firstFile?.url, firstFile?.uri, url),
              uri: firstNonEmptyString(firstFile?.uri, firstFile?.url, url),
              name: firstNonEmptyString(firstFile?.name, firstFile?.filename, fileName),
            },
          ],
          name: firstNonEmptyString(
            base.name,
            firstFile?.name,
            firstFile?.filename,
            fileName,
          ),
        };
        const ui = mapApiMessageToChatMessage(normalizedApiMessage, currentUserId, {
          chatStatus: isRequest ? 'pending' : undefined,
        });
        if (ui) {
          setMessages((prev) => [...prev, ui]);
          appendedOutgoing = true;
          bumpScrollAfterLocalSend();
        }
        if (currentUserId && otherUserId) {
          socketService.messageSendFromApi(
            currentUserId,
            otherUserId,
            normalizedApiMessage as unknown as Record<string, unknown>
          );
        }
      }

      // Clear composer text/reply state after sending attachments too.
      clearComposer();
      setReplyingTo(null);

      if (pendingAttachments.length > 0) {
        setPendingAttachments([]);
      }

      if (appendedOutgoing) {
        bumpScrollAfterLocalSend();
      }
    } catch (err: unknown) {
      // Send failed
    } finally {
      setSendLoading(false);
    }
  };

  const handleRequestAccept = async () => {
    if (!chatId) return;
    setRequestActionLoading('accept');
    try {
      await setChatRequestActionApi({ chatId, action: 'accept' });
      navigation.setParams({ isRequest: false } as any);
      setIsRequest(false);
      setMessagesLoading(true);
      const res = await getChatMessagesApi({
        chatId,
        page: 1,
        limit: MESSAGES_PAGE_SIZE,
      });
      const raw = res.data?.list ?? res.data?.messages ?? [];
      const list = Array.isArray(raw)
        ? raw
            .map((item) =>
              mapApiMessageToChatMessage(item, currentUserId ?? undefined, {
                chatStatus: String(
                  ((res.data?.chat as { status?: unknown } | undefined)?.status) ?? ''
                ),
              })
            )
            .filter((m): m is ChatMessage => m != null)
            .reverse()
        : [];
      setMessages(list);
      const meta = res.data?.meta;
      const currentPage = meta?.currentPage ?? meta?.pageNo ?? 1;
      const totalPages = meta?.totalPages ?? 1;
      setMessagesPage(currentPage);
      setMessagesHasMore(currentPage < totalPages);
    } catch (err: unknown) {
      // Action failed
    } finally {
      setMessagesLoading(false);
      setRequestActionLoading(null);
    }
  };

  const handleRequestDecline = async () => {
    if (!chatId) return;
    setRequestActionLoading('decline');
    try {
      await setChatRequestActionApi({ chatId, action: 'reject' });
      navigation.goBack();
    } catch (err: unknown) {
      // Action failed
    } finally {
      setRequestActionLoading(null);
    }
  };

  const handleBlockAndReport = async () => {
    if (!otherUserId) {
      return;
    }
    setReportSheetMode('blockReport');
    setSelectedReportReason(null);
    setReportMessageInput('');
    setShowReportSheet(true);
  };

  const handleAttachmentSelect = async (option: AttachmentOption) => {
    if (option === 'camera') {
      await handleCamera();
      return;
    }
    if (option === 'gallery') {
      await handleGallery();
      return;
    }
    if (option === 'files') {
      try {
        // Wait for the attachment bottom sheet (Modal) to close before presenting
        // the native iOS document picker, otherwise iOS can reject the second modal.
        await new Promise<void>((resolve) => setTimeout(resolve, 350));
        await openFilePicker();
      } catch (error) {
      }
    }
  };

  const handleMessageLongPress = useCallback(
    (index: number) => {
      const msg = messages[index];
      const sent = msg?.sent === true;
      const node = messageBubbleRefsRef.current.get(index);

      const applyAnchor = (x: number, y: number, width: number, height: number) => {
        let top = y + height + MESSAGE_CONTEXT_GAP;
        const bottomLimit = windowHeight - insets.bottom - 16;
        if (top + APPROX_MESSAGE_CONTEXT_HEIGHT > bottomLimit) {
          top = Math.max(insets.top + 8, y - APPROX_MESSAGE_CONTEXT_HEIGHT - MESSAGE_CONTEXT_GAP);
        }
        const pad = H_PADDING;
        if (sent) {
          const right = Math.max(pad, windowWidth - (x + width));
          setMessageContextAnchor({ top, right });
        } else {
          let left = x;
          left = Math.max(pad, Math.min(left, windowWidth - pad - MESSAGE_CONTEXT_MIN_WIDTH));
          setMessageContextAnchor({ top, left });
        }
        setMessageContextIndex(index);
      };

      if (!node) {
        setMessageContextAnchor(null);
        setMessageContextIndex(index);
        return;
      }
      requestAnimationFrame(() => {
        node.measureInWindow((mx, my, mwidth, mheight) => {
          if (mwidth <= 0 || mheight <= 0 || Number.isNaN(mx) || Number.isNaN(my)) {
            setMessageContextAnchor(null);
            setMessageContextIndex(index);
            return;
          }
          applyAnchor(mx, my, mwidth, mheight);
        });
      });
    },
    [insets.bottom, insets.top, messages, windowHeight, windowWidth],
  );

  const renderMessage = (msg: ChatMessage, index: number) => {
    const parseCallStateText = (text: string): {
      title: string;
      subtitle: string;
      variant: 'sent' | 'received' | 'missed';
      bubbleWidth: number;
      icon:
        | 'videoOutgoing'
        | 'videoIncoming'
        | 'videoMissed'
        | 'voiceOutgoing'
        | 'voiceIncoming'
        | 'voiceMissed';
    } | null => {
      const raw = text.trim();
      if (!raw) return null;
      const lower = raw.toLowerCase();
      const durationMatch = raw.match(/\b\d+\s*(secs?|mins?|minutes?)\b/i);
      const agoMatch = raw.match(/\b\d+\s*(mins?|minutes?)\s*ago\b/i);

      if (lower.includes('missed video call')) {
        return {
          title: 'Missed Video Call',
          subtitle: 'Tap to call back',
          variant: 'missed',
          bubbleWidth: 190,
          icon: 'videoMissed',
        };
      }
      if (lower.includes('missed voice call')) {
        return {
          title: 'Missed Voice Call',
          subtitle: 'Tap to call back',
          variant: 'missed',
          bubbleWidth: 188,
          icon: 'voiceMissed',
        };
      }
      if (lower.includes('incoming voice call')) {
        return {
          title: 'Incoming Voice Call',
          subtitle: 'Tap to receive',
          variant: 'received',
          bubbleWidth: 172,
          icon: 'voiceIncoming',
        };
      }
      if (lower.includes('incoming video call')) {
        return {
          title: 'Incoming Video Call',
          subtitle: 'Tap to receive',
          variant: 'received',
          bubbleWidth: 170,
          icon: 'videoIncoming',
        };
      }
      if (lower.includes('voice call') && lower.includes('ring')) {
        return {
          title: 'Voice Call',
          subtitle: 'Ringing..',
          variant: 'sent',
          bubbleWidth: 146,
          icon: 'voiceOutgoing',
        };
      }
      if (lower.includes('video call')) {
        return {
          title: 'Video Call',
          subtitle: durationMatch?.[0] ?? agoMatch?.[0] ?? (msg.sent ? '6 Secs' : '1 Min ago'),
          variant: msg.sent ? 'sent' : 'received',
          bubbleWidth: 144,
          icon: msg.sent ? 'videoOutgoing' : 'videoIncoming',
        };
      }
      if (lower.includes('voice call')) {
        return {
          title: 'Voice Call',
          subtitle: durationMatch?.[0] ?? agoMatch?.[0] ?? '6 Secs',
          variant: msg.sent ? 'sent' : 'received',
          bubbleWidth: 146,
          icon: msg.sent ? 'voiceOutgoing' : 'voiceIncoming',
        };
      }
      return null;
    };

    const renderCallStateIcon = (
      icon: 'videoOutgoing' | 'videoIncoming' | 'videoMissed' | 'voiceOutgoing' | 'voiceIncoming' | 'voiceMissed',
    ) => {
      if (icon === 'videoOutgoing') return <CallVideoOutgoingIcon size={20} color={colors.primary.purple} />;
      if (icon === 'videoIncoming') return <CallVideoIncomingIcon size={20} color={colors.primary.purple} />;
      if (icon === 'videoMissed') return <CallVideoMissedIcon size={20} color={colors.semantic.error} />;
      if (icon === 'voiceOutgoing') return <CallVoiceOutgoingIcon size={20} color={colors.primary.purple} />;
      if (icon === 'voiceIncoming') return <CallVoiceIncomingIcon size={20} color={colors.primary.purple} />;
      return <CallVoiceDeclinedIcon size={20} color={colors.semantic.error} />;
    };

    if (msg.type === 'text') {
      const callState = parseCallStateText(msg.text);
      if (callState) {
        return (
          <React.Fragment key={index}>
            <View style={[styles.messageRow, msg.sent ? undefined : styles.messageRowReceived]}>
              <View ref={(r) => setMessageBubbleRef(index, r)} collapsable={false}>
                <TouchableOpacity
                  style={[
                    styles.chatCallBubble,
                    { width: callState.bubbleWidth },
                    callState.variant === 'sent'
                      ? styles.chatCallBubbleSent
                      : callState.variant === 'missed'
                      ? styles.chatCallBubbleMissed
                      : styles.chatCallBubbleReceived,
                  ]}
                  activeOpacity={0.9}
                  onLongPress={() => handleMessageLongPress(index)}
                >
                  <View style={styles.chatCallBubbleIconWrap}>{renderCallStateIcon(callState.icon)}</View>
                  <View style={styles.chatCallBubbleTextWrap}>
                    <Text
                      style={[
                        styles.chatCallBubbleTitle,
                        callState.variant === 'sent'
                          ? styles.chatCallBubbleTitleSent
                          : callState.variant === 'missed'
                          ? styles.chatCallBubbleTitleMissed
                          : styles.chatCallBubbleTitleReceived,
                      ]}
                    >
                      {callState.title}
                    </Text>
                    <Text
                      style={[
                        styles.chatCallBubbleSubtitle,
                        callState.variant === 'sent'
                          ? styles.chatCallBubbleSubtitleSent
                          : styles.chatCallBubbleSubtitleReceived,
                      ]}
                    >
                      {callState.subtitle}
                    </Text>
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
      return (
        <React.Fragment key={index}>
          <View style={[styles.messageRow, msg.sent ? undefined : styles.messageRowReceived]}>
            <View ref={(r) => setMessageBubbleRef(index, r)} collapsable={false}>
            <TouchableOpacity
              style={[styles.bubble, msg.sent ? styles.bubbleSent : styles.bubbleReceived]}
              activeOpacity={1}
              onLongPress={() => handleMessageLongPress(index)}
            >
              {msg.replyTo != null && (
                <View style={[styles.bubbleReplyTo, msg.sent ? styles.bubbleReplyToSent : styles.bubbleReplyToReceived]}>
                  <Text style={[styles.bubbleReplyToLabel, msg.sent && styles.bubbleReplyToLabelSent]} numberOfLines={1}>
                    {STRINGS.CHAT.REPLYING_TO} {msg.replyTo.senderName}
                  </Text>
                  <Text style={[styles.bubbleReplyToPreview, msg.sent && styles.bubbleReplyToPreviewSent]} numberOfLines={2}>
                    {msg.replyTo.preview}
                  </Text>
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
            <TouchableOpacity
              style={[styles.bubble, msg.sent ? styles.bubbleSent : styles.bubbleReceived]}
              activeOpacity={1}
              onLongPress={() => handleMessageLongPress(index)}
            >
              {msg.blocks.map((block, blockIndex) => {
                if (block.type === 'paragraph') {
                  return (
                    <Text
                      key={`${index}_p_${blockIndex}`}
                      style={[styles.bubbleText, msg.sent && styles.bubbleTextSent, { marginBottom: 8 }]}
                    >
                      {block.text}
                    </Text>
                  );
                }
                return (
                  <View key={`${index}_b_${blockIndex}`} style={{ marginBottom: 8 }}>
                    {block.items.map((item, itemIndex) => (
                      <View
                        key={`${index}_${blockIndex}_${itemIndex}`}
                        style={{ flexDirection: 'row', marginBottom: 6 }}
                      >
                        <Text style={[styles.bubbleText, msg.sent && styles.bubbleTextSent]}>{'\u2022 '}</Text>
                        <Text style={[styles.bubbleText, msg.sent && styles.bubbleTextSent, { flex: 1 }]}>
                          {item.title ? `${item.title}: ` : ''}
                          {item.description ?? ''}
                        </Text>
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
            <TouchableOpacity
              style={[
                styles.voiceBubbleSent,
                msg.sent ? undefined : styles.voiceBubbleReceived,
              ]}
              activeOpacity={1}
              onLongPress={() => handleMessageLongPress(index)}
            >
              <TouchableOpacity
                style={styles.voiceBubblePlay}
                activeOpacity={0.8}
                onPress={() => {
                  voice.toggleVoiceMessagePlayback(msg.uri, messageKey).catch(() => {});
                }}
              >
                {isPlayingNow ? (
                  <PauseIcon
                    size={40}
                    color={msg.sent ? colors.white : colors.primary.purple}
                  />
                ) : (
                  <PlayIcon
                    size={40}
                    color={msg.sent ? colors.white : colors.primary.purple}
                    variant="voiceBubble"
                  />
                )}
              </TouchableOpacity>
              <View style={styles.voiceBubbleWaveform}>
                {VOICE_WAVEFORM.map((h, i) => (
                  <View
                    key={i}
                    style={[
                      styles.voiceBubbleWaveformBar,
                      !msg.sent && styles.voiceBubbleWaveformBarReceived,
                      { height: Math.max(6, h) },
                    ]}
                  />
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
      const imageUri = msg.uri;
      return (
        <React.Fragment key={index}>
          <View style={[styles.messageRow, msg.sent ? undefined : styles.messageRowReceived]}>
            <View ref={(r) => setMessageBubbleRef(index, r)} collapsable={false}>
            <TouchableOpacity
              style={[
                styles.imageBubble,
                msg.sent ? undefined : styles.imageBubbleReceived,
                { width: imageBubbleSize, height: imageBubbleSize },
              ]}
              activeOpacity={1}
              onPress={() => openImagePreview(imageUri)}
              onLongPress={() => handleMessageLongPress(index)}
            >
              <Image source={{ uri: imageUri }} style={styles.imageBubbleImage} resizeMode="cover" />
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
            <TouchableOpacity
              style={[styles.fileBubble, msg.sent ? undefined : styles.fileBubbleReceived]}
              activeOpacity={0.9}
              onPress={() => {
                openDocument(msg.uri).catch(() => {});
              }}
              onLongPress={() => handleMessageLongPress(index)}
            >
              <View style={styles.fileBubbleIcon}>
                <ActionSheetFileIcon size={24} color={msg.sent ? colors.white : colors.primary.purple} />
              </View>
              <Text style={[styles.fileBubbleName, msg.sent ? undefined : styles.fileBubbleNameReceived]} numberOfLines={1}>
                {msg.name}
              </Text>
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
  };

  const handleMessagesScroll = useCallback(
    (event: any) => {
      const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent ?? {};
      const y = contentOffset?.y ?? 0;
      scrollYRef.current = y;
      if (layoutMeasurement?.height != null) {
        layoutHeightRef.current = layoutMeasurement.height;
      }
      if (contentSize?.height != null) {
        contentHeightRef.current = contentSize.height;
      }

      if (y <= 50) {
        loadMoreMessages();
      }
    },
    [loadMoreMessages],
  );

  const openMatchDetails = useCallback(() => {
    if (!otherUserId) return;
    const parentNav = (navigation.getParent?.() ?? null) as
      | { navigate?: (name: string, params?: Record<string, unknown>) => void }
      | null;
    if (parentNav?.navigate) {
      parentNav.navigate('MatchDetails', { userId: otherUserId });
      return;
    }
    (navigation as unknown as { navigate: (name: string, params?: Record<string, unknown>) => void })
      .navigate('MatchDetails', { userId: otherUserId });
  }, [navigation, otherUserId]);

  const openMoreMenu = useCallback(() => {
    const applyPosition = (top: number, right: number) => {
      setMoreMenuScreenPos({ top, right });
      setMoreMenuVisible(true);
    };
    const fallbackPosition = () => {
      const headerRow = 56;
      applyPosition(insets.top + 12 + headerRow + MORE_MENU_GAP, H_PADDING);
    };
    const node = moreMenuButtonRef.current;
    if (!node) {
      fallbackPosition();
      return;
    }
    requestAnimationFrame(() => {
      node.measureInWindow((x, y, width, height) => {
        if (width <= 0 || height <= 0 || Number.isNaN(x) || Number.isNaN(y)) {
          fallbackPosition();
          return;
        }
        let top = y + height + MORE_MENU_GAP;
        const bottomLimit = windowHeight - insets.bottom - 16;
        if (top + APPROX_MORE_MENU_HEIGHT > bottomLimit) {
          top = Math.max(insets.top + 8, y - APPROX_MORE_MENU_HEIGHT - MORE_MENU_GAP);
        }
        const right = Math.max(8, windowWidth - (x + width));
        applyPosition(top, right);
      });
    });
  }, [insets.bottom, insets.top, windowHeight, windowWidth]);

  useEffect(() => {
    if (!moreMenuVisible) {
      setMoreMenuScreenPos(null);
    }
  }, [moreMenuVisible]);

  useEffect(() => {
    if (messageContextIndex === null) {
      setMessageContextAnchor(null);
    }
  }, [messageContextIndex]);

  const setMessageBubbleRef = useCallback((index: number, node: View | null) => {
    const m = messageBubbleRefsRef.current;
    if (node) {
      m.set(index, node);
    } else {
      m.delete(index);
    }
  }, []);

  const openImagePreview = useCallback((uri: string) => {
    if (!uri) return;
    setImagePreviewZoomed(false);
    setImagePreviewUri(uri);
  }, []);

  const closeImagePreview = useCallback(() => {
    setImagePreviewUri(null);
    setImagePreviewZoomed(false);
  }, []);

  const openDocument = useCallback(async (uri: string) => {
    if (!uri) return;
    try {
      const supported = await Linking.canOpenURL(uri);
      if (supported) {
        await Linking.openURL(uri);
      }
    } catch {
      // Ignore open failures to keep interaction smooth.
    }
  }, []);

  const handleComposerTextContentSizeChange = useCallback(
    (e: { nativeEvent: { contentSize: { height: number } } }) => {
      const raw = e.nativeEvent.contentSize.height;
      const h = typeof raw === 'number' && Number.isFinite(raw) ? raw : CHAT_INPUT_MIN_HEIGHT;
      setComposerInputHeight(
        Math.min(CHAT_INPUT_MAX_HEIGHT, Math.max(CHAT_INPUT_MIN_HEIGHT, h)),
      );
    },
    [],
  );

  const handleHeaderVideoCallPress = useCallback(() => {
    if (chatId && otherUserId) {
      socketService.callRequest(otherUserId, chatId, 'video');
    }
    setActiveCallId(null);
    setActiveCallMode('video');
    setCallAudioEnabled(true);
    setCallVideoEnabled(true);
    setPartnerAudioEnabled(true);
    setPartnerVideoEnabled(true);
    setIsOutgoingVoiceRinging(false);
    setIsSwitchingVoiceToVideo(false);
      setAudioDeviceSheetVisible(false);
    setCallConnectedAtMs(null);
    setCallDurationSec(0);
    setVideoCallUiHidden(false);
    setCallStateVisible(true);
  }, [chatId, otherUserId]);

  const handleHeaderVoiceCallPress = useCallback(() => {
    if (chatId && otherUserId) {
      socketService.callRequest(otherUserId, chatId, 'audio');
    }
    setActiveCallId(null);
    setActiveCallMode('voice');
    setCallAudioEnabled(true);
    setCallVideoEnabled(false);
    setPartnerAudioEnabled(true);
    setPartnerVideoEnabled(true);
    setIsOutgoingVoiceRinging(true);
    setIsSwitchingVoiceToVideo(false);
      setAudioDeviceSheetVisible(false);
    setCallConnectedAtMs(null);
    setCallDurationSec(0);
    setCallStateVisible(true);
  }, [chatId, otherUserId]);

  const toggleCallAudio = useCallback(() => {
    setCallAudioEnabled((prev) => !prev);
  }, []);

  const toggleCallVideo = useCallback(() => {
    setCallVideoEnabled((prev) => !prev);
  }, []);

  const closeCallState = useCallback(() => {
    if (activeCallId) {
      socketService.callEnd(activeCallId);
      setActiveCallId(null);
    }
    setCallStateVisible(false);
    setVideoCallUiHidden(false);
    setPartnerAudioEnabled(true);
    setPartnerVideoEnabled(true);
    setIsOutgoingVoiceRinging(false);
    setIsSwitchingVoiceToVideo(false);
    setAudioDeviceSheetVisible(false);
    setSwitchToVideoPopupVisible(false);
    setCallConnectedAtMs(null);
    setCallDurationSec(0);
  }, [activeCallId]);

  const acceptIncomingVoiceCall = useCallback(() => {
    if (incomingVoiceCallId) {
      socketService.callAccept(incomingVoiceCallId);
      setActiveCallId(incomingVoiceCallId);
    }
    setIncomingVoiceCallVisible(false);
    setActiveCallMode('voice');
    setCallAudioEnabled(true);
    setCallVideoEnabled(false);
    setPartnerAudioEnabled(true);
    setPartnerVideoEnabled(true);
    setIsOutgoingVoiceRinging(false);
    setIsSwitchingVoiceToVideo(false);
    setSwitchToVideoPopupVisible(false);
    setCallConnectedAtMs(Date.now());
    setCallDurationSec(0);
    setCallStateVisible(true);
  }, [incomingVoiceCallId]);

  const declineIncomingVoiceCall = useCallback(() => {
    if (incomingVoiceCallId) {
      socketService.callReject(incomingVoiceCallId);
    }
    setIncomingVoiceCallVisible(false);
    setIncomingVoiceCallId(null);
  }, [incomingVoiceCallId]);

  const acceptIncomingVideoCall = useCallback(() => {
    if (incomingVideoCallId) {
      socketService.callAccept(incomingVideoCallId);
      setActiveCallId(incomingVideoCallId);
    }
    setIncomingVideoCallVisible(false);
    setActiveCallMode('video');
    setCallAudioEnabled(true);
    setCallVideoEnabled(true);
    setPartnerAudioEnabled(true);
    setPartnerVideoEnabled(true);
    setIsOutgoingVoiceRinging(false);
    setIsSwitchingVoiceToVideo(false);
    setCallConnectedAtMs(Date.now());
    setCallDurationSec(0);
    setVideoCallUiHidden(false);
    setCallStateVisible(true);
  }, [incomingVideoCallId]);

  const declineIncomingVideoCall = useCallback(() => {
    if (incomingVideoCallId) {
      socketService.callReject(incomingVideoCallId);
    }
    setIncomingVideoCallVisible(false);
    setIncomingVideoCallId(null);
  }, [incomingVideoCallId]);

  const toggleVideoCallUiHidden = useCallback(() => {
    setVideoCallUiHidden((prev) => !prev);
  }, []);

  const openAudioDeviceSheet = useCallback(() => {
    setAudioDeviceSheetVisible((prev) => !prev);
  }, []);

  const selectAudioDevice = useCallback((device: AudioDevice) => {
    setSelectedAudioDevice(device);
    setAudioDeviceSheetVisible(false);
  }, []);

  const requestSwitchVoiceToVideo = useCallback(() => {
    if (!chatId || !otherUserId) return;
    setSwitchToVideoPopupVisible(false);
    socketService.callRequest(otherUserId, chatId, 'video');
    setIsSwitchingVoiceToVideo(true);
  }, [chatId, otherUserId]);

  const openSwitchToVideoPopup = useCallback(() => {
    if (isOutgoingVoiceRinging || isSwitchingVoiceToVideo) return;
    setAudioDeviceSheetVisible(false);
    setSwitchToVideoPopupVisible(true);
  }, [isOutgoingVoiceRinging, isSwitchingVoiceToVideo]);

  useEffect(() => {
    if (!callStateVisible || !callConnectedAtMs || isOutgoingVoiceRinging) {
      return;
    }
    const tick = () => {
      setCallDurationSec(Math.max(0, Math.floor((Date.now() - callConnectedAtMs) / 1000)));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [callStateVisible, callConnectedAtMs, isOutgoingVoiceRinging]);

  const callDurationLabel = `${String(Math.floor(callDurationSec / 60)).padStart(2, '0')}:${String(
    callDurationSec % 60
  ).padStart(2, '0')}`;
  const pickedVoiceDurationLabel = `${Math.floor(callDurationSec / 60)}:${String(callDurationSec % 60).padStart(
    2,
    '0',
  )}`;
  const audioDeviceLabel =
    selectedAudioDevice === 'speaker'
      ? 'Speaker'
      : selectedAudioDevice === 'earpiece'
      ? 'Earpiece'
      : selectedAudioDevice === 'bluetooth'
      ? 'Bluetooth'
      : 'Wired';
  const audioRouteStatusText =
    selectedAudioDevice === 'speaker'
      ? 'Audio on speaker'
      : selectedAudioDevice === 'earpiece'
      ? 'Audio on earpiece'
      : selectedAudioDevice === 'bluetooth'
      ? 'Audio on bluetooth'
      : 'Audio on wired headset';
  const isPartnerFullyOff = !partnerAudioEnabled && !partnerVideoEnabled;
  const showVideoPreviewOffSurface = !callVideoEnabled || !partnerVideoEnabled;
  const renderAudioDevicePopoverOptions = () => (
    <View style={styles.callStateAudioDevicePopoverList}>
      <TouchableOpacity
        style={[
          styles.callStateAudioDeviceOption,
          selectedAudioDevice === 'bluetooth' && styles.callStateAudioDeviceOptionActive,
        ]}
        activeOpacity={0.8}
        onPress={() => selectAudioDevice('bluetooth')}
      >
        <View style={styles.callStateAudioDeviceOptionLeft}>
          <AudioBluetoothIcon
            size={20}
            color={
              selectedAudioDevice === 'bluetooth'
                ? colors.primary.purple
                : colors.neutral[600]
            }
          />
          <Text
            style={[
              styles.callStateAudioDeviceOptionText,
              selectedAudioDevice === 'bluetooth' && styles.callStateAudioDeviceOptionTextActive,
            ]}
          >
            Bluetooth
          </Text>
        </View>
        {selectedAudioDevice === 'bluetooth' ? (
          <AudioOptionCheckIcon size={16} color={colors.primary.purple} />
        ) : null}
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.callStateAudioDeviceOption,
          selectedAudioDevice === 'speaker' && styles.callStateAudioDeviceOptionActive,
        ]}
        activeOpacity={0.8}
        onPress={() => selectAudioDevice('speaker')}
      >
        <View style={styles.callStateAudioDeviceOptionLeft}>
          <VoiceControlSpeakerIcon
            size={20}
            color={
              selectedAudioDevice === 'speaker'
                ? colors.primary.purple
                : colors.neutral[600]
            }
          />
          <Text
            style={[
              styles.callStateAudioDeviceOptionText,
              selectedAudioDevice === 'speaker' && styles.callStateAudioDeviceOptionTextActive,
            ]}
          >
            Speaker
          </Text>
        </View>
        {selectedAudioDevice === 'speaker' ? (
          <AudioOptionCheckIcon size={16} color={colors.primary.purple} />
        ) : null}
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.callStateAudioDeviceOption,
          selectedAudioDevice === 'earpiece' && styles.callStateAudioDeviceOptionActive,
        ]}
        activeOpacity={0.8}
        onPress={() => selectAudioDevice('earpiece')}
      >
        <View style={styles.callStateAudioDeviceOptionLeft}>
          <AudioEarpieceIcon
            size={20}
            color={
              selectedAudioDevice === 'earpiece'
                ? colors.primary.purple
                : colors.neutral[600]
            }
          />
          <Text
            style={[
              styles.callStateAudioDeviceOptionText,
              selectedAudioDevice === 'earpiece' && styles.callStateAudioDeviceOptionTextActive,
            ]}
          >
            Earpiece
          </Text>
        </View>
        {selectedAudioDevice === 'earpiece' ? (
          <AudioOptionCheckIcon size={16} color={colors.primary.purple} />
        ) : null}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.screen}>
        <StatusBar barStyle="dark-content" translucent backgroundColor={colors.white}/>
        <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => navigation.navigate('ChatList')}
          accessibilityRole="button"
          accessibilityLabel="Back to chats"
        >
          <BackArrowIcon size={48} />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.8} onPress={openMatchDetails}>
          {avatar != null ? (
            <Image source={avatar} style={styles.headerAvatar} resizeMode="cover" />
          ) : (
            <View style={styles.headerAvatar} />
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerNameWrap} activeOpacity={0.8} onPress={openMatchDetails}>
          <Text style={styles.headerName} numberOfLines={1}>{name}</Text>
          {otherUserTyping ? (
            <Text style={styles.headerOnline}>typing…</Text>
          ) : (
            otherUserOnline && <Text style={styles.headerOnline}>Online</Text>
          )}
        </TouchableOpacity>
        {!askAiraGenerating && generatedReplies == null && (
          <TouchableOpacity
            style={styles.headerAskAiraButton}
            onPress={() => {
              if (dontShowAskAiraPersisted && chatId) {
                requestAiSuggestions();
              } else {
                setAskAiraConfirmVisible(true);
              }
            }}
            activeOpacity={0.8}
            disabled={askAiraConfirmLoading}
          >
            <AskAiraSendIcon width={52} height={52} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.headerCallButton}
          onPress={handleHeaderVideoCallPress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Video call"
        >
          <ChatHeaderVideoCallIcon size={24} color={colors.black} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerCallButton}
          onPress={handleHeaderVoiceCallPress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Voice call"
        >
          <ChatHeaderVoiceCallIcon size={24} color={colors.black} />
        </TouchableOpacity>
        <View ref={moreMenuButtonRef} collapsable={false}>
          <TouchableOpacity style={styles.moreButton} onPress={openMoreMenu} accessibilityLabel="Chat options">
            <MoreVertIcon size={24} color={colors.black} />
          </TouchableOpacity>
        </View>
      </View>
      <Modal
        visible={incomingVoiceCallVisible}
        animationType="fade"
        transparent={false}
        onRequestClose={declineIncomingVoiceCall}
      >
        <SafeAreaView style={styles.incomingVoiceBackdrop} edges={['top', 'left', 'right', 'bottom']}>
          <StatusBar barStyle="light-content" backgroundColor="transparent" />
          <View
            style={[
              styles.incomingVoiceCenterWrap,
              { paddingBottom: incomingVoiceCenterBottomInset },
            ]}
          >
            {avatar != null ? (
              <Image source={avatar} style={styles.incomingVoiceAvatar} resizeMode="cover" />
            ) : (
              <View style={styles.incomingVoiceAvatar} />
            )}
            <Text style={styles.incomingVoiceTitle}>Incoming voice call...</Text>
          </View>

          <View
            style={[
              styles.incomingVoiceActionsRow,
              { marginBottom: incomingVoiceActionsBottomInset },
            ]}
          >
            <View style={styles.incomingVoiceActionGroupSmall}>
              <TouchableOpacity
                style={[styles.incomingVoiceActionCircle, styles.incomingVoiceDeclineBtn]}
                activeOpacity={0.8}
                onPress={declineIncomingVoiceCall}
                accessibilityRole="button"
                accessibilityLabel="Decline incoming call"
              >
                <VoiceControlEndIcon size={24} color={colors.white} />
              </TouchableOpacity>
              <Text style={styles.incomingVoiceActionLabel}>Decline</Text>
            </View>

            <View style={styles.incomingVoiceActionGroupCenter}>
              <View style={styles.incomingVoiceSwipeIndicator}>
                {[0, 1, 2, 3, 4].map(index => (
                  <Text
                    key={`incoming-voice-chevron-${index}`}
                    style={[
                      styles.incomingVoiceSwipeChevron,
                      { opacity: 0.28 + index * 0.14 },
                    ]}
                  >
                    ˄
                  </Text>
                ))}
              </View>
              <TouchableOpacity
                style={[styles.incomingVoiceActionCircle, styles.incomingVoiceAcceptBtn]}
                activeOpacity={0.8}
                onPress={acceptIncomingVoiceCall}
                accessibilityRole="button"
                accessibilityLabel="Accept incoming call"
              >
                <VoiceControlMicIcon size={24} color={colors.white} />
              </TouchableOpacity>
              <Text style={styles.incomingVoiceActionLabel}>Swipe up to accept</Text>
            </View>

            <View style={styles.incomingVoiceActionGroupSmall}>
              <TouchableOpacity
                style={[styles.incomingVoiceActionCircle, styles.incomingVoiceMessageBtn]}
                activeOpacity={0.8}
                onPress={() => setIncomingVoiceCallVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Message caller"
              >
                <VoiceControlMessageIcon size={24} color={colors.white} />
              </TouchableOpacity>
              <Text style={styles.incomingVoiceActionLabel}>Message</Text>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={incomingVideoCallVisible}
        animationType="fade"
        transparent={false}
        onRequestClose={declineIncomingVideoCall}
      >
        <SafeAreaView style={styles.incomingVideoFullBackdrop} edges={['top', 'left', 'right', 'bottom']}>
          <StatusBar barStyle="light-content" backgroundColor="transparent" />
          {avatar != null ? (
            <Image source={avatar} style={styles.incomingVideoFullBgImage} resizeMode="cover" />
          ) : (
            <View style={styles.incomingVideoFullBgFallback} />
          )}
          <View style={styles.incomingVideoFullOverlay} />

          <View style={styles.incomingVideoFullTopCenter}>
            {avatar != null ? (
              <Image source={avatar} style={styles.incomingVideoFullAvatar} resizeMode="cover" />
            ) : (
              <View style={styles.incomingVideoFullAvatar} />
            )}
            <Text style={styles.incomingVideoFullName} numberOfLines={1}>
              {incomingVideoCallerName || name}
            </Text>
            <View style={styles.incomingVideoFullVideoTogglePill}>
              <CallVideoMissedIcon size={16} color={colors.white} />
              <Text style={styles.incomingVideoFullVideoToggleText}>Turn off your video</Text>
            </View>
          </View>

          <View
            style={[
              styles.incomingVideoFullActionsRow,
              { marginBottom: incomingVoiceActionsBottomInset },
            ]}
          >
            <View style={styles.incomingVideoFullActionGroupSmall}>
              <TouchableOpacity
                style={[styles.incomingVideoFullActionCircle, styles.incomingVideoFullDeclineBtn]}
                activeOpacity={0.8}
                onPress={declineIncomingVideoCall}
                accessibilityRole="button"
                accessibilityLabel="Decline incoming video call"
              >
                <VoiceControlEndIcon size={24} color={colors.white} />
              </TouchableOpacity>
              <Text style={styles.incomingVideoFullActionLabel}>Decline</Text>
            </View>

            <View style={styles.incomingVideoFullActionGroupCenter}>
              <View style={styles.incomingVideoFullSwipeIndicator}>
                {[0, 1, 2, 3, 4].map(index => (
                  <Text
                    key={`incoming-video-chevron-${index}`}
                    style={[
                      styles.incomingVideoFullSwipeChevron,
                      { opacity: 0.28 + index * 0.14 },
                    ]}
                  >
                    ˄
                  </Text>
                ))}
              </View>
              <TouchableOpacity
                style={[styles.incomingVideoFullActionCircle, styles.incomingVideoFullAcceptBtn]}
                activeOpacity={0.8}
                onPress={acceptIncomingVideoCall}
                accessibilityRole="button"
                accessibilityLabel="Accept incoming video call"
              >
                <CallVideoIncomingIcon size={24} color={colors.white} />
              </TouchableOpacity>
              <Text style={styles.incomingVideoFullActionLabel}>Swipe up to accept</Text>
            </View>

            <View style={styles.incomingVideoFullActionGroupSmall}>
              <TouchableOpacity
                style={[styles.incomingVideoFullActionCircle, styles.incomingVideoFullMessageBtn]}
                activeOpacity={0.8}
                onPress={() => setIncomingVideoCallVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Message caller"
              >
                <VoiceControlMessageIcon size={24} color={colors.white} />
              </TouchableOpacity>
              <Text style={styles.incomingVideoFullActionLabel}>Message</Text>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={callStateVisible}
        animationType="slide"
        onRequestClose={closeCallState}
      >
        {activeCallMode === 'video' ? (
          <SafeAreaView style={styles.videoCallBackdrop} edges={['top', 'left', 'right', 'bottom']}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" />
            {!isPartnerFullyOff && avatar != null ? (
              <Image source={avatar} style={styles.videoCallBgImage} resizeMode="cover" />
            ) : (
              <View style={styles.videoCallBgFallback} />
            )}
            {!videoCallUiHidden ? <View style={styles.videoCallTopGradient} /> : null}
            {!videoCallUiHidden ? (
              <View style={styles.videoCallTopBar}>
                <TouchableOpacity
                  style={styles.videoCallTopBackButton}
                  onPress={closeCallState}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="End call and go back"
                >
                  <BackArrowIcon size={48} backgroundColor="rgba(0,0,0,0.3)" strokeColor={colors.white} />
                </TouchableOpacity>
                <View style={styles.videoCallTopNameWrap}>
                  <Text style={styles.videoCallTopName} numberOfLines={1}>
                    {name}
                  </Text>
                  {!callAudioEnabled || !partnerAudioEnabled ? (
                    <View style={styles.videoCallTopMicOffPill}>
                      <VoiceControlMicOffIcon
                        size={12}
                        color={!callAudioEnabled ? colors.semantic.error : colors.white}
                      />
                    </View>
                  ) : null}
                </View>
                <View style={styles.videoCallTopTimerPill}>
                  <View style={styles.videoCallTopTimerDot} />
                  <Text style={styles.videoCallTopTimerText}>{callDurationLabel}</Text>
                </View>
              </View>
            ) : null}

            <View style={styles.videoCallMainSurface}>
              {!videoCallUiHidden ? (
                isPartnerFullyOff ? (
                  <View style={styles.videoCallPartnerFullyOffStateCompact}>
                    {avatar != null ? (
                      <Image
                        source={avatar}
                        style={styles.videoCallPartnerFullyOffAvatarCompact}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.videoCallPartnerFullyOffAvatarCompact} />
                    )}
                  </View>
                ) : callVideoEnabled ? (
                  <View />
                ) : (
                  <View style={styles.videoCallVideoOffState}>
                    <View style={styles.videoCallVideoOffAvatarWrap}>
                      {avatar != null ? (
                        <Image source={avatar} style={styles.videoCallVideoOffAvatar} resizeMode="cover" />
                      ) : (
                        <View style={styles.videoCallVideoOffAvatar} />
                      )}
                    </View>
                    <Text style={styles.videoCallVideoOffName} numberOfLines={1}>
                      {name}
                    </Text>
                    <Text style={styles.videoCallVideoOffTitle}>Video is off</Text>
                    <Text style={styles.videoCallVideoOffSubtitle} numberOfLines={2}>
                      Turn on your camera to continue video call.
                    </Text>
                  </View>
                )
              ) : null}

              {!videoCallUiHidden || videoCallUiHidden ? (
                <View
                  style={[
                    styles.videoCallLocalPreview,
                    { top: videoCallUiHidden ? videoLocalPreviewHiddenTop : videoLocalPreviewTop },
                  ]}
                >
                  {!showVideoPreviewOffSurface ? (
                    avatar != null ? (
                      <Image source={avatar} style={styles.videoCallLocalPreviewAvatar} resizeMode="cover" />
                    ) : (
                      <View style={styles.videoCallLocalPreviewAvatar} />
                    )
                  ) : (
                    <View style={styles.videoCallLocalPreviewOffSurface}>
                      {avatar != null ? (
                        <Image
                          source={avatar}
                          style={styles.videoCallLocalPreviewOffAvatar}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.videoCallLocalPreviewOffAvatar} />
                      )}
                    </View>
                  )}
                  {!callAudioEnabled || !partnerAudioEnabled || videoCallUiHidden ? (
                    <View style={styles.videoCallLocalPreviewMicOffIcon}>
                      <VoiceControlMicOffIcon size={20} color={colors.white} />
                    </View>
                  ) : null}
                  {!videoCallUiHidden ? (
                    <View style={styles.videoCallLocalPreviewSwitchIcon}>
                      <CameraIcon size={20} color={colors.white} />
                    </View>
                  ) : null}
                </View>
              ) : null}
            </View>

            {!videoCallUiHidden ? (
              <View style={[styles.videoCallBottomControlsWrap, { top: videoControlsTop }]}>
                <View style={styles.videoCallBottomControlsCapsule}>
                  <TouchableOpacity
                    style={[styles.videoCallBottomAction, styles.videoCallBottomActionEnd]}
                    onPress={closeCallState}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel="End video call"
                  >
                    <VoiceControlEndIcon size={24} color={colors.white} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.videoCallBottomAction,
                      audioDeviceSheetVisible && styles.videoCallBottomActionSelected,
                    ]}
                    onPress={openAudioDeviceSheet}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel="Choose audio device"
                  >
                    <VoiceControlSpeakerIcon
                      size={24}
                      color={audioDeviceSheetVisible ? colors.black : colors.white}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.videoCallBottomAction,
                      !callVideoEnabled && styles.videoCallBottomActionSelected,
                    ]}
                    onPress={toggleCallVideo}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel={callVideoEnabled ? 'Turn camera off' : 'Turn camera on'}
                  >
                    {callVideoEnabled ? (
                      <CallVideoOutgoingIcon size={24} color={colors.white} />
                    ) : (
                      <CallVideoMissedIcon size={24} color={colors.semantic.error} />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.videoCallBottomAction,
                      !callAudioEnabled && styles.videoCallBottomActionSelected,
                    ]}
                    onPress={toggleCallAudio}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel={callAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
                    accessibilityState={{ selected: !callAudioEnabled }}
                  >
                    {callAudioEnabled ? (
                      <VoiceControlMicIcon size={24} color={colors.white} />
                    ) : (
                      <VoiceControlMicOffIcon size={24} color={colors.semantic.error} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}
            {!videoCallUiHidden && audioDeviceSheetVisible ? (
              <View style={styles.videoCallAudioDevicePopoverWrap}>
                {renderAudioDevicePopoverOptions()}
              </View>
            ) : null}

            {videoCallUiHidden ? (
              <TouchableWithoutFeedback onPress={toggleVideoCallUiHidden}>
                <View style={styles.videoCallHiddenUiTapArea} />
              </TouchableWithoutFeedback>
            ) : null}
          </SafeAreaView>
        ) : (
          <SafeAreaView style={styles.callStateBackdrop} edges={['top', 'left', 'right', 'bottom']}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" />
            <View style={[styles.callStateContent, styles.callStateContentRinging]}>
              <View style={styles.callStateRingingHeader}>
                <TouchableOpacity
                  style={styles.callStateRingingBackButton}
                  onPress={closeCallState}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel call and go back"
                >
                  <BackArrowIcon
                    size={48}
                    backgroundColor="rgba(0,0,0,0.3)"
                    strokeColor={colors.white}
                  />
                </TouchableOpacity>
                <Text style={styles.callStateRingingHeaderName} numberOfLines={1}>
                  {name}
                </Text>
                <View style={styles.callStateRingingHeaderSpacer} />
              </View>

              <View style={styles.callStatePickedCenterWrap}>
                <View style={styles.callStatePickedAvatarWrap}>
                  {!isOutgoingVoiceRinging ? (
                    <>
                      <View style={styles.callStatePickedOuterRing} />
                      <View style={styles.callStatePickedInnerRing} />
                    </>
                  ) : null}
                  {avatar != null ? (
                    <Image
                      source={avatar}
                      style={[
                        styles.callStateAvatar,
                        isOutgoingVoiceRinging
                          ? styles.callStateAvatarRinging
                          : styles.callStateAvatarPicked,
                      ]}
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      style={[
                        styles.callStateAvatar,
                        isOutgoingVoiceRinging
                          ? styles.callStateAvatarRinging
                          : styles.callStateAvatarPicked,
                      ]}
                    />
                  )}
                </View>
                <View style={styles.callStateRingingWrap}>
                  <Text style={styles.callStateRingingTitle}>
                    {isOutgoingVoiceRinging ? 'Ringing...' : pickedVoiceDurationLabel}
                  </Text>
                </View>
              </View>

              <View style={styles.callStateRingingActionsRow}>
                <View style={styles.callStateRingingActionsCapsule}>
                  <TouchableOpacity
                    style={[styles.callStateRingingActionButton, styles.callStateRingingCancelButton]}
                    onPress={closeCallState}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel="Cancel outgoing call"
                  >
                    <View
                      style={[
                        styles.callStateRingingIconWrap,
                        styles.callStateRingingIconWrapEnd,
                      ]}
                    >
                      <VoiceControlEndIcon size={24} color={colors.white} />
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.callStateRingingActionButton,
                      audioDeviceSheetVisible && styles.callStateRingingActionButtonSelected,
                    ]}
                    onPress={openAudioDeviceSheet}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel="Choose audio device"
                  >
                    <View
                      style={[
                        styles.callStateRingingIconWrap,
                        styles.callStateRingingIconWrapSpeaker,
                      ]}
                    >
                      <VoiceControlSpeakerIcon
                        size={24}
                        color={audioDeviceSheetVisible ? colors.black : colors.white}
                      />
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.callStateRingingActionButton,
                      (isOutgoingVoiceRinging || isSwitchingVoiceToVideo) &&
                        styles.callStateRingingActionButtonDisabled,
                    ]}
                    onPress={
                      !isOutgoingVoiceRinging && !isSwitchingVoiceToVideo
                        ? openSwitchToVideoPopup
                        : undefined
                    }
                    disabled={isOutgoingVoiceRinging || isSwitchingVoiceToVideo}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel="Switch to video call"
                    accessibilityState={{
                      disabled: isOutgoingVoiceRinging || isSwitchingVoiceToVideo,
                    }}
                  >
                    <View
                      style={[
                        styles.callStateRingingIconWrap,
                        styles.callStateRingingIconWrapVideo,
                      ]}
                    >
                      <CallVideoOutgoingIcon size={24} color={colors.white} />
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.callStateRingingActionButton,
                      !callAudioEnabled && styles.callStateRingingActionButtonMicMuted,
                    ]}
                    onPress={toggleCallAudio}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel={callAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
                    accessibilityState={{ selected: !callAudioEnabled }}
                  >
                    {callAudioEnabled ? (
                      <View
                        style={[
                          styles.callStateRingingIconWrap,
                          styles.callStateRingingIconWrapMic,
                        ]}
                      >
                        <VoiceControlMicIcon size={24} color={colors.white} />
                      </View>
                    ) : (
                      <View
                        style={[
                          styles.callStateRingingIconWrap,
                          styles.callStateRingingIconWrapMic,
                        ]}
                      >
                        <VoiceControlMicOffIcon size={24} color={colors.semantic.error} />
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
              {audioDeviceSheetVisible ? (
                <View style={styles.callStateAudioDevicePopover}>
                  {renderAudioDevicePopoverOptions()}
                </View>
              ) : null}
              {switchToVideoPopupVisible ? (
                <View style={styles.callStateSwitchPopupBackdrop}>
                  <View style={styles.callStateSwitchPopupSheet}>
                    <View style={styles.callStateSwitchPopupHandle} />
                    <View style={styles.callStateSwitchPopupIconWrap}>
                      <CallVideoIncomingIcon size={40} color={colors.primary.purple} />
                    </View>
                    <Text style={styles.callStateSwitchPopupTitle}>Switch To Video Call?</Text>
                    <View style={styles.callStateSwitchPopupActions}>
                      <TouchableOpacity
                        style={styles.callStateSwitchPopupCancelButton}
                        activeOpacity={0.8}
                        onPress={() => setSwitchToVideoPopupVisible(false)}
                      >
                        <Text style={styles.callStateSwitchPopupCancelText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.callStateSwitchPopupSwitchButton}
                        activeOpacity={0.85}
                        onPress={requestSwitchVoiceToVideo}
                      >
                        <LinearGradient
                          colors={['#CB7BF5', '#7742F0']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.callStateSwitchPopupSwitchGradient}
                        >
                          <Text style={styles.callStateSwitchPopupSwitchText}>Switch</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ) : null}
            </View>
          </SafeAreaView>
        )}
      </Modal>

      <Modal
        visible={moreMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMoreMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMoreMenuVisible(false)}>
          <View style={styles.moreMenuBackdrop}>
            {moreMenuScreenPos != null ? (
              <TouchableWithoutFeedback onPress={() => {}}>
                <View
                  style={[
                    styles.moreMenu,
                    { top: moreMenuScreenPos.top, right: moreMenuScreenPos.right },
                  ]}
                  collapsable={false}
                >
                  <TouchableOpacity
                    style={styles.moreMenuItem}
                    onPress={() => {
                      setMoreMenuVisible(false);
                      if (otherUserId) setBlockConfirmVisible(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.moreMenuIconWrap}>
                      <BlockIcon size={20} color={colors.black} />
                    </View>
                    <Text style={styles.moreMenuLabel}>Block</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.moreMenuItem}
                    onPress={() => {
                      setMoreMenuVisible(false);
                      if (!otherUserId) {
                        return;
                      }
                      setReportSheetMode('report');
                      setReportMessageInput('');
                      setShowReportSheet(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.moreMenuIconWrap]}>
                      <ReportIcon size={20} color={colors.black} />
                    </View>
                    <Text style={styles.moreMenuLabelReport}>Report</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            ) : null}
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={imagePreviewUri != null}
        transparent
        animationType="fade"
        presentationStyle="overFullScreen"
        statusBarTranslucent
        hardwareAccelerated
        onRequestClose={closeImagePreview}
      >
        <View style={imagePreviewStyles.backdrop}>
          <View style={[imagePreviewStyles.topBar, { paddingTop: insets.top + 10 }]}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Close image preview"
              onPress={closeImagePreview}
              activeOpacity={0.8}
              style={imagePreviewStyles.closeButton}
            >
              <GeneratingCloseIcon size={28} color={colors.white} />
            </TouchableOpacity>
          </View>

          <TouchableWithoutFeedback onPress={closeImagePreview}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>

          <View style={imagePreviewStyles.content}>
            {imagePreviewUri != null && (
              <View style={imagePreviewStyles.card}>
                <TouchableWithoutFeedback
                  onPress={() => {
                    const nowTap = Date.now();
                    const delta = nowTap - (imagePreviewLastTapRef.current || 0);
                    imagePreviewLastTapRef.current = nowTap;
                    if (delta < 260) {
                      setImagePreviewZoomed((z) => !z);
                    }
                  }}
                >
                  <Image
                    source={{ uri: imagePreviewUri }}
                    resizeMode="contain"
                    style={[
                      imagePreviewStyles.image,
                      imagePreviewZoomed && imagePreviewStyles.imageZoomed,
                    ]}
                  />
                </TouchableWithoutFeedback>
              </View>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={blockConfirmVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setBlockConfirmVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setBlockConfirmVisible(false)}>
          <View style={styles.blockConfirmBackdrop}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.blockConfirmSheet}>
                <View style={styles.blockConfirmHandle} />
                <View style={styles.blockConfirmIconWrap}>
                  <BlockIcon size={40} color={colors.primary.purple} />
                </View>
                <Text style={styles.blockConfirmTitle}>Block {name}?</Text>
                <Text style={styles.blockConfirmDescription}>
                  They won't be able to message you, see your profile, or send requests. You can unblock them anytime from Settings.
                </Text>
                <TouchableOpacity
                  style={styles.blockConfirmButtonBlock}
                  onPress={() => {
                    if (!otherUserId) {
                      setBlockConfirmVisible(false);
                      return;
                    }
                    setBlockConfirmLoading(true);
                    blockUserApi({ blockUserId: otherUserId, type: 'block' })
                      .then(() => {
                        setBlockConfirmVisible(false);
                        showSuccessToast(STRINGS.CHAT.BLOCK_SUCCESS);
                        setTimeout(() => navigation.goBack(), 400);
                      })
                      .catch(() => {
                        showErrorToast(STRINGS.CHAT.BLOCK_FAILED);
                      })
                      .finally(() => setBlockConfirmLoading(false));
                  }}
                  activeOpacity={0.8}
                  disabled={blockConfirmLoading}
                >
                  <LinearGradient
                    colors={[...colors.gradients.primary.colors]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.blockConfirmButtonGradient}
                  >
                    {blockConfirmLoading ? (
                      <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                      <Text style={styles.blockConfirmButtonLabelBlock}>Block</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.blockConfirmButtonCancel}
                  onPress={() => setBlockConfirmVisible(false)}
                  activeOpacity={0.8}
                  disabled={blockConfirmLoading}
                >
                  <Text style={styles.blockConfirmButtonLabelCancel}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={askAiraConfirmVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAskAiraConfirmVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setAskAiraConfirmVisible(false)}>
          <View style={styles.askAiraConfirmBackdrop}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.askAiraConfirmSheet}>
                <View style={styles.askAiraConfirmHandle} />
                <View style={styles.askAiraConfirmContent}>
                  <View style={styles.askAiraConfirmIconWrap}>
                    <TabAICenterIcon width={52} height={52} />

                    {/* <AskAiraSendIcon width={40} height={40} /> */}
                  </View>
                  <GradientText style={{ fontSize: 24, fontWeight: '600' }}>
                    Your Reply Assistant
                  </GradientText>
                  <Text style={styles.askAiraConfirmDescription}>
                    Aira reads your recent conversation and suggests replies, that you can send - or tweak - in one tap.
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.askAiraConfirmGenerateButton}
                  onPress={() => {
                    if (!chatId) return;
                    if (dontShowAskAiraAgain) {
                      AsyncStorage.setItem(DONT_SHOW_ASK_AIRA_CONFIRM_KEY, 'true').then(() => {
                        setDontShowAskAiraPersisted(true);
                      });
                    }
                    requestAiSuggestions({ closeConfirmSheetOnStart: true });
                  }}
                  activeOpacity={0.8}
                  disabled={askAiraConfirmLoading || !chatId}
                >
                  <LinearGradient
                    colors={[...colors.gradients.primary.colors]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.askAiraConfirmGenerateGradient}
                  >
                    {askAiraConfirmLoading ? (
                      <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                      <Text style={styles.askAiraConfirmGenerateLabel}>Generate</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.askAiraConfirmCheckRow}
                  onPress={() => setDontShowAskAiraAgain(!dontShowAskAiraAgain)}
                  activeOpacity={0.8}
                  disabled={askAiraConfirmLoading}
                >
                  <View style={[styles.askAiraConfirmCheck, dontShowAskAiraAgain && styles.askAiraConfirmCheckSelected]}>
                    {dontShowAskAiraAgain && <InterestChipCheckIcon size={12} color={colors.white} />}
                  </View>
                  <Text style={styles.askAiraConfirmCheckLabel}>Don't show this again</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Aira is thinking - API in progress (Figma 2636-13127, no cancel) */}
      <Modal
        visible={askAiraGenerating}
        transparent
        animationType="slide"
        onRequestClose={handleCancelAiSuggestions}
      >
        <View style={styles.airaThinkingBackdrop}>
          <View style={styles.airaThinkingSheet}>
            <View style={styles.airaThinkingHeader}>
              <View style={styles.airaThinkingHeaderLeft}>
                <View style={styles.airaThinkingIconWrap}>
                  <AskAiraSendIcon width={20} height={20} />
                </View>
                <Text style={styles.airaThinkingTitle}>Aira is thinking...</Text>
              </View>
              <View style={styles.airaThinkingHeaderRight}>
                {/* <Text style={styles.airaThinkingLeftCount}>2/3 left</Text> */}
                <InformativeIcon width={14} height={14} color={colors.neutral[700]} />
              </View>
            </View>
            <View style={styles.airaThinkingSkeletons}>
              <View style={styles.airaThinkingSkeletonRow}>
                <View style={[styles.airaThinkingSkeleton, { width: '100%' }]} />
                <View style={[styles.airaThinkingSkeleton, { width: 130 }]} />
              </View>
              <View style={styles.airaThinkingSkeletonRow}>
                <View style={[styles.airaThinkingSkeleton, { width: '100%' }]} />
              </View>
              <View style={styles.airaThinkingSkeletonRow}>
                <View style={[styles.airaThinkingSkeleton, { width: '100%' }]} />
                <View style={[styles.airaThinkingSkeleton, { width: 268 }]} />
              </View>
              <View style={styles.airaThinkingSkeletonRow}>
                <View style={[styles.airaThinkingSkeleton, { width: '100%' }]} />
              </View>
            </View>
            <TouchableOpacity
              style={styles.airaThinkingCancelButton}
              onPress={handleCancelAiSuggestions}
              activeOpacity={0.8}
            >
              <Text style={styles.airaThinkingCancelLabel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Suggestions from Aira - API response (Figma 2636-13524) */}
      <Modal
        visible={generatedReplies != null && generatedReplies.length > 0}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setGeneratedReplies(null);
          setSelectedReplyIndex(0);
        }}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            setGeneratedReplies(null);
            setSelectedReplyIndex(0);
          }}
        >
          <View style={styles.airaSuggestionsBackdrop}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.airaSuggestionsSheet}>
                <View style={styles.airaSuggestionsHandle} />
                <View style={styles.airaSuggestionsHeader}>
                  <View style={styles.airaSuggestionsHeaderLeft}>
                    <View style={styles.airaThinkingIconWrap}>
                      <AskAiraSendIcon width={20} height={20} />
                    </View>
                    <Text style={styles.airaSuggestionsTitle}>Suggestions from Aira</Text>
                  </View>
                  <View style={styles.airaThinkingHeaderRight}>
                    <Text style={styles.airaThinkingLeftCount}>
                      {airaSuggestionsLimitLeft != null && airaSuggestionsTotalLimit != null
                        ? `${airaSuggestionsLimitLeft}/${airaSuggestionsTotalLimit} left`
                        : `${generatedReplies?.length ?? 0} suggestion${
                            (generatedReplies?.length ?? 0) !== 1 ? 's' : ''
                          }`}
                    </Text>
                    <InformativeIcon width={14} height={14} color={colors.neutral[700]} />
                  </View>
                </View>
                <Text style={styles.airaSuggestionsListLabel}>Suggestions</Text>
                <ScrollView
                  style={styles.airaSuggestionsList}
                  contentContainerStyle={styles.airaSuggestionsListContent}
                  showsVerticalScrollIndicator={false}
                  onContentSizeChange={() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                  }}
                  // onContentSizeChange={() => scrollToBottom(false)}
                >
                  {generatedReplies?.map((text, index) => {
                    const selected = index === selectedReplyIndex;
                    return (
                      <TouchableOpacity
                        key={index}
                        style={[styles.airaSuggestionCard, selected && styles.airaSuggestionCardSelected]}
                        onPress={() => setSelectedReplyIndex(index)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[styles.airaSuggestionCardText, selected && styles.airaSuggestionCardTextSelected]}
                          numberOfLines={4}
                        >
                          {text}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                <TouchableOpacity
                  style={styles.airaSuggestionsInsertButton}
                  onPress={handleInsertReply}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[...colors.gradients.primary.colors]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.airaSuggestionsInsertGradient}
                  >
                    <Text style={styles.airaSuggestionsInsertLabel}>Insert</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Aira suggestion limit reached (Figma 2596-13414) */}
      <Modal
        visible={airaLimitReachedVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAiraLimitReachedVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setAiraLimitReachedVisible(false)}>
          <View style={styles.airaLimitBackdrop}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.airaLimitSheet}>
                <View style={styles.airaLimitHandle} />
                <View style={styles.airaLimitContent}>
                  <Text style={styles.airaLimitTitle}>You're out of Aira suggestions</Text>
                  <Text style={styles.airaLimitDescription}>
                    You've used all {airaSuggestionsTotalLimit ?? 3} for today. Come back in
                  </Text>
                </View>
                <View style={styles.airaLimitCountdownRow}>
                  <View style={styles.airaLimitCountdownPill}>
                    <Text style={styles.airaLimitCountdownText}>
                      {String(airaLimitCountdown.hours).padStart(2, '0')}h
                    </Text>
                  </View>
                  <Text style={styles.airaLimitCountdownColon}>:</Text>
                  <View style={styles.airaLimitCountdownPill}>
                    <Text style={styles.airaLimitCountdownText}>
                      {String(airaLimitCountdown.minutes).padStart(2, '0')}m
                    </Text>
                  </View>
                  <Text style={styles.airaLimitCountdownColon}>:</Text>
                  <View style={styles.airaLimitCountdownPill}>
                    <Text style={styles.airaLimitCountdownText}>
                      {String(airaLimitCountdown.seconds).padStart(2, '0')}s
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.airaLimitOkayButton}
                  onPress={() => setAiraLimitReachedVisible(false)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[...colors.gradients.primary.colors]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.airaLimitOkayGradient}
                  >
                    <Text style={styles.airaLimitOkayLabel}>Okay</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={messageContextIndex !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setMessageContextIndex(null)}
      >
        <TouchableWithoutFeedback onPress={() => setMessageContextIndex(null)}>
          <View
            style={[
              styles.messageContextBackdrop,
              messageContextAnchor == null && styles.messageContextBackdropCentered,
            ]}
          >
            <TouchableWithoutFeedback onPress={() => {}}>
              <View
                style={[
                  styles.messageContextBubble,
                  messageContextAnchor != null && {
                    position: 'absolute',
                    top: messageContextAnchor.top,
                    ...(messageContextAnchor.left != null
                      ? { left: messageContextAnchor.left }
                      : { right: messageContextAnchor.right ?? H_PADDING }),
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.messageContextItem}
                  onPress={() => {
                    if (messageContextIndex !== null) {
                      const message = messages[messageContextIndex];
                      if (message) {
                        setReplyingTo({
                          index: messageContextIndex,
                          message,
                          senderName: message.sent ? STRINGS.CHAT.YOU : name,
                          messageId: message.messageId,
                        });
                      }
                    }
                    setMessageContextIndex(null);
                    setTimeout(() => inputRef.current?.focus(), 100);
                  }}
                  activeOpacity={0.7}
                >
                  <ReplyIcon size={20} color={colors.black} />
                  <Text style={styles.messageContextLabel}>{STRINGS.CHAT.REPLY}</Text>
                </TouchableOpacity>
                {messageContextIndex !== null && messages[messageContextIndex]?.sent === true && (
                  <TouchableOpacity
                    style={styles.messageContextItemDelete}
                    onPress={() => {
                      setDeleteConfirmIndex(messageContextIndex);
                      setMessageContextIndex(null);
                    }}
                    activeOpacity={0.7}
                  >
                    <DeleteIcon size={20} color={colors.semantic.error} />
                    <Text style={styles.messageContextLabelDelete}>{STRINGS.CHAT.DELETE}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={deleteConfirmIndex !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setDeleteConfirmIndex(null)}
      >
        <TouchableWithoutFeedback onPress={() => setDeleteConfirmIndex(null)}>
          <View style={styles.deleteConfirmBackdrop}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.deleteConfirmSheet}>
                <View style={styles.deleteConfirmHandle} />
                <Text style={styles.deleteConfirmTitle}>{STRINGS.CHAT.DELETE_MESSAGE_TITLE}</Text>
                <Text style={styles.deleteConfirmDescription}>{STRINGS.CHAT.DELETE_MESSAGE_DESCRIPTION}</Text>
                <TouchableOpacity
                  style={styles.deleteConfirmButtonDelete}
                  onPress={() => {
                    if (deleteConfirmIndex === null || !chatId) return;
                    const msg = messages[deleteConfirmIndex];
                    const messageId = msg && 'messageId' in msg ? msg.messageId : undefined;
                    setDeleteConfirmIndex(null);
                    setMessages((prev) => prev.filter((_, i) => i !== deleteConfirmIndex));
                    if (messageId) {
                      deleteMessageApi({ chatId, messageId }).catch(() => {});
                      if (currentUserId && otherUserId) {
                        socketService.messageDelete(currentUserId, otherUserId, messageId);
                      }
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.deleteConfirmButtonLabelDelete}>{STRINGS.CHAT.DELETE}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteConfirmButtonCancel}
                  onPress={() => setDeleteConfirmIndex(null)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.deleteConfirmButtonLabelCancel}>{STRINGS.CHAT.CANCEL}</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <View style={{ flex: 1 }}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.screen}
        onLayout={(e) => {
          layoutHeightRef.current = e.nativeEvent.layout.height;
        }}
        // contentContainerStyle={{
        //   ...styles.scrollContent,
        //   paddingBottom:
        //     (styles.scrollContent?.paddingBottom ?? 16) +
        //     composerHeight +
        //     12,
        // }}
        contentContainerStyle={{
          ...styles.scrollContent,
          paddingBottom:
            (styles.scrollContent?.paddingBottom ?? 16) +
            composerHeight +
            keyboardHeight + // ✅ THIS IS THE KEY
            12,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        onScroll={handleMessagesScroll}
        onContentSizeChange={(w, h) => {
          contentHeightRef.current = h;
        }}
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

      <View
        style={[styles.bottomComposerContainer, { bottom: composerBottomOffset }]}
        onLayout={handleComposerLayout}
      >
      {voice.voiceBarVisible ? (
        <View style={[styles.voiceBar, { paddingBottom: 12 + bottomSafeInset }]}>
          <TouchableOpacity
            style={styles.voiceBarTrash}
            activeOpacity={0.8}
            onPress={voice.handleVoiceTrash}
            disabled={voice.voiceSendLoading}
          >
            <DeleteIcon size={20} color={colors.white} />
          </TouchableOpacity>
          <View style={styles.voiceBarPill}>
            <TouchableOpacity
              style={styles.voiceBarPlayPause}
              activeOpacity={0.8}
              onPress={voice.handleVoicePlayPause}
              disabled={voice.voiceSendLoading}
            >
              {voice.voicePaused ? (
                <PlayIcon size={22} color={colors.black} />
              ) : (
                <PauseIcon size={22} color={colors.black} />
              )}
            </TouchableOpacity>
            <View style={styles.voiceBarWaveform}>
              {VOICE_WAVEFORM.map((h, i) => (
                <View
                  key={i}
                  style={[styles.voiceBarWaveformBar, { height: Math.max(6, h) }]}
                />
              ))}
            </View>
            <Text style={styles.voiceBarTimer}>{voice.formatVoiceTime(voice.voiceSeconds)}</Text>
          </View>
          <TouchableOpacity
            style={styles.voiceBarSend}
            activeOpacity={0.8}
            onPress={() => {
              voice.handleVoiceSend().catch(() => {});
            }}
            disabled={voice.voiceSendLoading}
          >
            {voice.voiceSendLoading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <ForwardArrowIcon size={22} color={colors.white} />
            )}
          </TouchableOpacity>
        </View>
      ) : isRequest ? (
        <View style={[styles.requestActionBar, { paddingBottom: 24 + bottomSafeInset }]}>
          <View style={styles.requestActionRow}>
            <TouchableOpacity
              style={styles.requestDeclineButton}
              onPress={handleRequestDecline}
              disabled={requestActionLoading !== null}
              activeOpacity={0.8}
            >
              {requestActionLoading === 'decline' ? (
                <ActivityIndicator size="small" color={colors.black} />
              ) : (
                <Text style={styles.requestDeclineLabel}>{STRINGS.CHAT.DECLINE}</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.requestAcceptButton}
              onPress={handleRequestAccept}
              disabled={requestActionLoading !== null}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[...colors.gradients.primary.colors]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={StyleSheet.absoluteFill}
              />
              {requestActionLoading === 'accept' ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.requestAcceptLabel}>{STRINGS.CHAT.ACCEPT}</Text>
              )}
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.requestBlockReportWrap}
            onPress={handleBlockAndReport}
            disabled={requestActionLoading !== null}
            activeOpacity={0.8}
          >
            <Text style={styles.requestBlockReportText}>{STRINGS.CHAT.BLOCK_AND_REPORT}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.inputArea}>
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
                {/* <CloseIcon size={18} color={colors.neutral[600]} /> */}
                <GeneratingCloseIcon size={22} color={colors.black} />
              </TouchableOpacity>
            </View>
          )}
          {/* <View style={[styles.inputBar, { paddingBottom: 12 + insets.bottom }]}>
            <View style={styles.inputBarContent}>
              {otherUserTyping && (
                <View style={styles.typingIndicatorWrap}>
                  <Text style={styles.typingIndicatorText} numberOfLines={1}>{STRINGS.CHAT.TYPING_INDICATOR}</Text>
                </View>
              )}
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
              <TouchableOpacity style={styles.attachButton} activeOpacity={0.7} onPress={() => setAttachmentSheetOpen(true)}>
                <PlusIcon size={20} color={colors.black} />
              </TouchableOpacity>
              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder={STRINGS.CHAT.START_CHAT_PLACEHOLDER}
                placeholderTextColor={colors.neutral[600]}
                value={inputText}
                onChangeText={setInputText}
                onFocus={() => {
                  if (currentUserId && otherUserId) {
                    if (typingStopRef.current) clearTimeout(typingStopRef.current);
                    typingStopRef.current = null;
                    socketService.typing(currentUserId, otherUserId, true);
                  }
                }}
                onBlur={() => {
                  if (currentUserId && otherUserId) {
                    if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
                    typingDebounceRef.current = null;
                    if (typingStopRef.current) clearTimeout(typingStopRef.current);
                    typingStopRef.current = null;
                    socketService.typing(currentUserId, otherUserId, false);
                  }
                }}
                multiline
                scrollEnabled={false}
                returnKeyType="default"
                cursorColor={colors.primary.purple}
                selectionColor={colors.primary[50]}
              />
            </View>
            </View>
            </View>
          <TouchableOpacity
            style={styles.sendButton}
            activeOpacity={0.8}
            onPress={handleSend}
            disabled={sendLoading}
          >
            {sendLoading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <ForwardArrowIcon size={22} color={colors.white} />
            )}
          </TouchableOpacity>
          </View> */}
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
              <TouchableOpacity style={styles.attachButton} activeOpacity={0.7} onPress={() => setAttachmentSheetOpen(true)}>
                <PlusIcon size={20} color={colors.black}  />
              </TouchableOpacity>
              <View style={styles.composerInputOuter}>
                {inputText.length === 0 && (
                  <Text
                    pointerEvents="none"
                    style={styles.composerPlaceholder}
                    numberOfLines={1}
                  >
                    {otherUserTyping ? 'typing…' : STRINGS.CHAT.START_CHAT_PLACEHOLDER}
                  </Text>
                )}
                <TextInput
                  style={[
                    styles.input,
                    {
                      height: composerInputHeight,
                      maxHeight: CHAT_INPUT_MAX_HEIGHT,
                      flexGrow: 0,
                      flexShrink: 0,
                    },
                  ]}
                  ref={inputRef}
                  placeholder=""
                  value={inputText}
                  onChangeText={setInputText}
                  onContentSizeChange={handleComposerTextContentSizeChange}
                  onFocus={() => {
                    if (currentUserId && otherUserId) {
                      if (typingStopRef.current) clearTimeout(typingStopRef.current);
                      typingStopRef.current = null;
                      socketService.typing(currentUserId, otherUserId, true);
                    }
                  }}
                  onBlur={() => {
                    if (currentUserId && otherUserId) {
                      if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
                      typingDebounceRef.current = null;
                      if (typingStopRef.current) clearTimeout(typingStopRef.current);
                      typingStopRef.current = null;
                      socketService.typing(currentUserId, otherUserId, false);
                    }
                  }}
                  multiline
                  scrollEnabled={composerInputHeight >= CHAT_INPUT_MAX_HEIGHT}
                  underlineColorAndroid="transparent"
                  textAlignVertical={
                    inputText.trim().length > 0 || composerInputHeight > CHAT_INPUT_MIN_HEIGHT + 4
                      ? 'top'
                      : 'center'
                  }
                  {...(Platform.OS === 'android' ? { includeFontPadding: false } : {})}
                  disableFullscreenUI
                  returnKeyType="default"
                  cursorColor={colors.primary.purple}
                  selectionColor={colors.primary[50]}
                />
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.sendButton,
              !inputText.trim() && pendingAttachments.length === 0 && styles.sendButtonMic,
            ]}
            activeOpacity={0.8}
            onPress={() => {
              if (!inputText.trim() && pendingAttachments.length === 0) {
                handleMicPress().catch(() => {});
                return;
              }
              handleSend().catch(() => {});
            }}
            disabled={sendLoading || voice.voiceSendLoading}
          >
            {sendLoading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : !inputText.trim() && pendingAttachments.length === 0 ? (
              <MicIcon size={22} color={colors.black} />
            ) : (
              <ForwardArrowIcon size={22} color={colors.white} />
            )}
          </TouchableOpacity>
        </View>
        </View>
      )}
      </View>

      <AttachmentOptionsBottomSheet
        isOpen={attachmentSheetOpen}
        onClose={() => setAttachmentSheetOpen(false)}
        onSelect={handleAttachmentSelect}
      />

      <ReusableBottomSheet
        isOpen={showCameraPermissionSheet}
        onClose={() => {
          if (isRequestingPermission) return;
          handleAllowCameraPermission().catch(() => {});
        }}
        snapPoints={[336]}
        showDragHandle
        showCloseButton={false}
        enablePanDownToClose={false}
        backgroundStyle={permissionSheetStyles.sheet}
        backdropStyle={permissionSheetStyles.backdrop}
        dragHandleContainerStyle={permissionSheetStyles.dragHandleContainer}
        dragHandleStyle={permissionSheetStyles.dragHandle}
        scrollEnabled={false}
      >
        <View style={permissionSheetStyles.content}>
          <Text style={permissionSheetStyles.title}>
            {STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.CAMERA_PERMISSION_TITLE}
          </Text>
          <Text style={permissionSheetStyles.description}>
            {STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.CAMERA_PERMISSION_DESCRIPTION}
          </Text>
          <View style={permissionSheetStyles.actions}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleAllowCameraPermission}
              disabled={isRequestingPermission}
              style={permissionSheetStyles.primaryButton}
            >
              <LinearGradient
                colors={['#C671F4', '#7640F0']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={permissionSheetStyles.primaryButtonGradient}
              />
              <View pointerEvents="none" style={permissionSheetStyles.primaryButtonInset} />
              {isRequestingPermission ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={permissionSheetStyles.primaryButtonText}>
                  {STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.CONTINUE}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ReusableBottomSheet>

      <ReusableBottomSheet
        isOpen={showGalleryPermissionSheet}
        onClose={() => {
          if (isRequestingPermission) return;
          handleAllowGalleryPermission().catch(() => {});
        }}
        snapPoints={[336]}
        showDragHandle
        showCloseButton={false}
        enablePanDownToClose={false}
        backgroundStyle={permissionSheetStyles.sheet}
        backdropStyle={permissionSheetStyles.backdrop}
        dragHandleContainerStyle={permissionSheetStyles.dragHandleContainer}
        dragHandleStyle={permissionSheetStyles.dragHandle}
        scrollEnabled={false}
      >
        <View style={permissionSheetStyles.content}>
          <Text style={permissionSheetStyles.title}>
            {STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.PHOTOS_PERMISSION_TITLE}
          </Text>
          <Text style={permissionSheetStyles.description}>
            {STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.PHOTOS_PERMISSION_DESCRIPTION}
          </Text>
          <View style={permissionSheetStyles.actions}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleAllowGalleryPermission}
              disabled={isRequestingPermission}
              style={permissionSheetStyles.primaryButton}
            >
              <LinearGradient
                colors={['#C671F4', '#7640F0']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={permissionSheetStyles.primaryButtonGradient}
              />
              <View pointerEvents="none" style={permissionSheetStyles.primaryButtonInset} />
              {isRequestingPermission ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={permissionSheetStyles.primaryButtonText}>
                  {STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.CONTINUE}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ReusableBottomSheet>

      <ReusableBottomSheet
        isOpen={showMicrophonePermissionSheet}
        onClose={() => {
          if (isRequestingPermission) return;
          handleAllowMicrophonePermission().catch(() => {});
        }}
        snapPoints={[336]}
        showDragHandle
        showCloseButton={false}
        enablePanDownToClose={false}
        backgroundStyle={permissionSheetStyles.sheet}
        backdropStyle={permissionSheetStyles.backdrop}
        dragHandleContainerStyle={permissionSheetStyles.dragHandleContainer}
        dragHandleStyle={permissionSheetStyles.dragHandle}
        scrollEnabled={false}
      >
        <View style={permissionSheetStyles.content}>
          <Text style={permissionSheetStyles.title}>
            {STRINGS.CHAT.MICROPHONE_PERMISSION_TITLE}
          </Text>
          <Text style={permissionSheetStyles.description}>
            {STRINGS.CHAT.MICROPHONE_PERMISSION_DESCRIPTION}
          </Text>
          <View style={permissionSheetStyles.actions}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {
                handleAllowMicrophonePermission().catch(() => {});
              }}
              disabled={isRequestingPermission}
              style={permissionSheetStyles.primaryButton}
            >
              <LinearGradient
                colors={['#C671F4', '#7640F0']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={permissionSheetStyles.primaryButtonGradient}
              />
              <View pointerEvents="none" style={permissionSheetStyles.primaryButtonInset} />
              {isRequestingPermission ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={permissionSheetStyles.primaryButtonText}>
                  {STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.CONTINUE}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ReusableBottomSheet>

      <ReusableBottomSheet
        isOpen={showReportSheet}

        onClose={() => {
          setShowReportSheet(false);
          setReportSheetMode('report');
          setReportMessageInput('');
          setSelectedReportReason(null);
        }}
        snapPoints={['90%']}
        showDragHandle
        showCloseButton={false}
        enablePanDownToClose
        backgroundStyle={permissionSheetStyles.sheet}
        scrollEnabled={true}
      >
        <View style={reportSheetStyles.content}>
          <View style={reportSheetStyles.iconWrap}>
            <ReportIcon size={40} color={colors.primary.purple} />
          </View>
          <Text style={reportSheetStyles.title}>Why Report {name}?</Text>
          <View style={reportSheetStyles.reasonsWrap}>
            {REPORT_REASONS.map((reason) => {
              const selected = selectedReportReason === reason.value;
              return (
                <TouchableOpacity
                  key={reason.value}
                  style={[reportSheetStyles.reasonRow, selected && reportSheetStyles.reasonRowSelected]}
                  onPress={() => setSelectedReportReason(reason.value)}
                  activeOpacity={0.7}
                  disabled={reportSubmitting}
                >
                  <View style={[reportSheetStyles.reasonCheck, selected && reportSheetStyles.reasonCheckSelected]}>
                    {selected && <InterestChipCheckIcon size={12} color={colors.white} />}
                  </View>
                  <Text style={[reportSheetStyles.reasonLabel, selected && reportSheetStyles.reasonLabelSelected]}>
                    {reason.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TextInput
            style={reportSheetStyles.optionalInput}
            placeholder="Tell us the reason.. (optional)"
            placeholderTextColor={colors.neutral[500]}
            value={reportMessageInput}
            onChangeText={setReportMessageInput}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            editable={!reportSubmitting}
          />
          <View style={reportSheetStyles.buttonRow}>
            <TouchableOpacity
              style={reportSheetStyles.cancelButton}
              onPress={() => {
                setShowReportSheet(false);
                setReportSheetMode('report');
                setReportMessageInput('');
                setSelectedReportReason(null);
              }}
              disabled={reportSubmitting}
              activeOpacity={0.8}
            >
              <Text style={reportSheetStyles.cancelButtonLabel}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={reportSheetStyles.submitButton}
              onPress={() => {
                if (!selectedReportReason || !otherUserId) return;
                const mode = reportSheetMode;
                const reasonLabel = REPORT_REASONS.find((r) => r.value === selectedReportReason)?.label ?? selectedReportReason;
                const reportMessage = reportMessageInput.trim()
                  ? `${reasonLabel}\n${reportMessageInput.trim()}`
                  : reasonLabel;
                setReportSubmitting(true);
                const submitPromise =
                  mode === 'blockReport'
                    ? apiClient.post(endpoints.chat.blockreportUser, {
                        targetUserId: otherUserId,
                        reportMessage,
                      })
                    : reportUserApi({ reportedAgainst: otherUserId, reportMessage });
                submitPromise
                  .then(() => {
                    setShowReportSheet(false);
                    setReportSheetMode('report');
                    setReportMessageInput('');
                    setSelectedReportReason(null);
                    if (mode === 'blockReport') {
                      showSuccessToast(STRINGS.CHAT.BLOCK_REPORT_SUBMITTED);
                      setTimeout(() => navigation.goBack(), 400);
                    } else {
                      showSuccessToast(STRINGS.CHAT.REPORT_SUBMITTED);
                    }
                  })
                  .catch(() => {
                    showErrorToast(
                      mode === 'blockReport'
                        ? STRINGS.CHAT.BLOCK_REPORT_FAILED
                        : STRINGS.CHAT.REPORT_FAILED
                    );
                  })
                  .finally(() => setReportSubmitting(false));
              }}
              disabled={reportSubmitting || !selectedReportReason}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[...colors.gradients.primary.colors]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={reportSheetStyles.submitButtonGradient}
              >
                {reportSubmitting ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={reportSheetStyles.submitButtonLabel}>Submit</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ReusableBottomSheet>
      </View>
    </SafeAreaView>
  );
};

const permissionSheetStyles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  dragHandleContainer: {
    paddingTop: 12,
    paddingBottom: 0,
  },
  dragHandle: {
    backgroundColor: '#CCCCCC',
  },
  sheet: {
    backgroundColor: colors.white,
    borderRadius: 32,
    left: 8,
    right: 8,
    bottom: 8,
    overflow: 'hidden',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '500',
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: typography.fontFamily.regular,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  actions: {
    gap: 8,
  },
  primaryButton: {
    height: 56,
    width: '100%',
    borderRadius: 100,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  primaryButtonGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  primaryButtonInset: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 100,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: typography.fontFamily.medium,
    color: colors.white,
    letterSpacing: 0.32,
  },
  secondaryButton: {
    height: 56,
    width: '100%',
    borderRadius: 100,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: typography.fontFamily.medium,
    color: colors.black,
    letterSpacing: 0.32,
  },
});

const reportSheetStyles = StyleSheet.create({
  content: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 32,
    flex: 1,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '500',
    fontFamily: typography.fontFamily.medium,
    color: colors.black,
    textAlign: 'center',
    marginBottom: 16,
  },
  reasonsWrap: {
    marginBottom: 16,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    marginBottom: 8,
    gap: 8,
  },
  reasonRowSelected: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[50],
  },
  reasonCheck: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  reasonCheckSelected: {
    backgroundColor: colors.primary.purple,
    borderColor: colors.primary.purple,
  },
  reasonLabel: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral[800],
    flex: 1,
  },
  reasonLabelSelected: {
    color: colors.primary.purple,
  },
  optionalInput: {
    borderWidth: 1,
    borderColor: colors.neutral[100],
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    fontSize: 16,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[900],
    minHeight: 88,
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    flex: 1,
    height: 54,
    borderRadius: 100,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonLabel: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: typography.fontFamily.medium,
    color: colors.black,
  },
  submitButton: {
    flex: 1,
    height: 54,
    borderRadius: 100,
    overflow: 'hidden',
  },
  submitButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonLabel: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: typography.fontFamily.medium,
    color: colors.white,
  },
});

const imagePreviewStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 3,
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    maxHeight: '82%',
    height: 420,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageZoomed: {
    transform: [{ scale: 1.6 }],
  },
});
