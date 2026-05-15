import React, { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Keyboard,
  Modal,
  TouchableWithoutFeedback,
  StyleSheet,
  Alert,
  Linking,
  StatusBar,
  ActivityIndicator,
  Platform,
  LayoutChangeEvent,
  useWindowDimensions,
  type ImageSourcePropType,
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
import { InterestChipCheckIcon } from '../../assets/icons/common/InterestChipCheckIcon';
import { ForwardArrowIcon } from '../../assets/icons/common/ForwardArrowIcon';
import { DeleteIcon } from '../../assets/icons/common/DeleteIcon';
import { PlayIcon } from '../../assets/icons/common/PlayIcon';
import { PauseIcon } from '../../assets/icons/common/PauseIcon';
import { ReplyIcon } from '../../assets/icons/common/ReplyIcon';
import { AskAiraSendIcon } from '../../assets/icons/common/AskAiraSendIcon';
import { GeneratingCloseIcon } from '../../assets/icons/common/GeneratingCloseIcon';
import { InformativeIcon } from '../../assets/icons/common/InformativeIcon';
import { BlockIcon } from '../../assets/icons/common/BlockIcon';
import { ReportIcon } from '../../assets/icons/common/ReportIcon';
import { AttachmentOptionsBottomSheet, type AttachmentOption } from '../../components/AttachmentOptionsBottomSheet';
import { GradientText } from '../../components/GradientText';
import LinearGradient from 'react-native-linear-gradient';
import { STRINGS } from '../../constants/strings';
import { colors, typography } from '../../theme';
import type { ChatStackParamList } from '../../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  setChatRequestActionApi,
  blockUserApi,
  reportUserApi,
  getChatMessagesApi,
  mapApiMessageToChatMessage,
  markChatSeenApi,
  sendMessageApi,
  uploadChatFileApi,
  postAIMessagesApi,
  getAiSuggestionsApi,
  deleteMessageApi,
  extractChatMessageFromSendResponse,
  type ChatMessageApiItem,
} from '../../modules/chat/api';
import { useAuthStore } from '../../store/auth.store';
import socketService, {
  type MessageReceivePayload,
  type MessageDeletePayload,
  type TypingPayload,
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
import { useCallState } from './hooks/useCallState';
import { CallOverlay } from './components/CallOverlay';
import { MessageList } from './components/MessageList';
import { ChatComposer } from './components/ChatComposer';

type Props = NativeStackScreenProps<ChatStackParamList, 'ChatDetail'>;

const VOICE_WAVEFORM = [8, 12, 6, 14, 10, 16, 8, 14, 12, 10];
const DONT_SHOW_ASK_AIRA_CONFIRM_KEY = 'dont_show_ask_aira_confirm';
const MESSAGES_PAGE_SIZE = 10;
const APPROX_MORE_MENU_HEIGHT = 124;
const MORE_MENU_GAP = 8;
const APPROX_MESSAGE_CONTEXT_HEIGHT = 132;
const MESSAGE_CONTEXT_GAP = 8;
const MESSAGE_CONTEXT_MIN_WIDTH = 172;

const REPORT_REASONS: { value: string; label: string }[] = [
  { value: 'inappropriate_messages', label: 'Inappropriate messages' },
  { value: 'fake_or_spam', label: 'Fake or spam account' },
  { value: 'harassment_or_bullying', label: 'Harassment or bullying' },
  { value: 'offensive_profile', label: 'Offensive profile content' },
  { value: 'underage_user', label: 'Underage user' },
  { value: 'something_else', label: "It's something else" },
];

const DEFAULT_PARTNER_AVATAR = require('../../assets/images/ProfileImage.png');

type ChatDetailRouteAvatar = ChatStackParamList['ChatDetail']['avatar'];

function resolvePartnerDisplaySource(partner: ChatDetailRouteAvatar | undefined): ImageSourcePropType {
  if (partner == null) return DEFAULT_PARTNER_AVATAR;
  if (typeof partner === 'number') return partner;
  if (typeof partner === 'object' && partner !== null && 'uri' in partner) {
    const uri = typeof partner.uri === 'string' ? partner.uri.trim() : '';
    if (uri.length > 0) return partner;
  }
  return DEFAULT_PARTNER_AVATAR;
}

export const ChatDetailScreen = ({ route, navigation }: Props) => {
  const {
    chatId: initialChatId,
    avatar: initialAvatar,
    name: initialName,
    isRequest: initialIsRequest,
    otherUserId: initialOtherUserId,
    incomingCall: initialIncomingCall,
  } = route.params;
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const bottomSafeInset = insets.bottom;
  const currentUserId = useAuthStore((s) => s.user?.id);
  const currentUser = useAuthStore((s) => s.user);

  // ── Core chat state ──────────────────────────────────────────────────────
  const [chatId, setChatId] = useState<string | null>(initialChatId ?? null);
  const [name, setName] = useState<string>(initialName ?? 'Chat');
  const [avatar, setAvatar] = useState<typeof initialAvatar | undefined>(initialAvatar);
  const [partnerAvatar, setPartnerAvatar] = useState<typeof initialAvatar | undefined>(initialAvatar);
  const partnerDisplaySource = useMemo(() => resolvePartnerDisplaySource(partnerAvatar), [partnerAvatar]);

  const localVideoPreviewFallback = useMemo((): ImageSourcePropType => {
    if (!currentUser) return DEFAULT_PARTNER_AVATAR;
    const direct = typeof currentUser.profilePicture === 'string' ? currentUser.profilePicture.trim() : '';
    if (direct) return { uri: direct };
    const url = currentUser.profilePhoto?.url as { medium?: unknown; original?: unknown; thumb?: unknown } | undefined;
    const picked = firstNonEmptyString(url?.medium, url?.original, url?.thumb);
    if (picked) return { uri: picked };
    return DEFAULT_PARTNER_AVATAR;
  }, [currentUser]);

  const outgoingCallMeta = useMemo(() => {
    const u = currentUser as any;
    return {
      callerName: firstNonEmptyString(u?.name) ?? undefined,
      callerAvatar: firstNonEmptyString(u?.profilePicture, u?.profilePhoto?.url?.medium, u?.profilePhoto?.url?.original, u?.profilePhoto?.url?.thumb) ?? undefined,
    };
  }, [currentUser]);

  const [isRequest, setIsRequest] = useState<boolean>(!!initialIsRequest);
  const [otherUserId, setOtherUserId] = useState<string | undefined>(initialOtherUserId);
  const [requestActionLoading, setRequestActionLoading] = useState<'accept' | 'decline' | 'block' | null>(null);
  const [messagesLoading, setMessagesLoading] = useState(!!chatId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagesPage, setMessagesPage] = useState(1);
  const [messagesHasMore, setMessagesHasMore] = useState(true);
  const [messagesLoadingMore, setMessagesLoadingMore] = useState(false);

  const refreshChatMessagesFromApi = useCallback(() => {
    if (!chatId) return;
    void getChatMessagesApi({ chatId, page: 1, limit: MESSAGES_PAGE_SIZE })
      .then((res) => {
        const raw = res.data?.list ?? res.data?.messages ?? [];
        const list = Array.isArray(raw)
          ? raw.map((item) => mapApiMessageToChatMessage(item, currentUserId ?? undefined, {
              chatStatus: String(((res.data?.chat as { status?: unknown } | undefined)?.status) ?? ''),
            })).filter((m): m is ChatMessage => m != null).reverse()
          : [];
        setMessages(list);
        const meta = res.data?.meta;
        setMessagesPage(meta?.currentPage ?? meta?.pageNo ?? 1);
        setMessagesHasMore((meta?.currentPage ?? 1) < (meta?.totalPages ?? 1));
      })
      .catch(() => {});
  }, [chatId, currentUserId]);

  // ── Call state (all call logic extracted) ───────────────────────────────
  const handledIncomingCallRef = useRef<string | null>(null);
  const call = useCallState({
    chatId,
    currentUserId,
    otherUserId,
    outgoingCallMeta,
    name,
    setName: (updater) => setName((prev) => updater(prev)),
    setPartnerAvatar,
    refreshChatMessagesFromApi,
    handledIncomingCallRef,
  });

  // ── Input / composer state ───────────────────────────────────────────────
  const [inputText, setInputText] = useState('');
  const [attachmentSheetOpen, setAttachmentSheetOpen] = useState(false);
  const [showCameraPermissionSheet, setShowCameraPermissionSheet] = useState(false);
  const [showGalleryPermissionSheet, setShowGalleryPermissionSheet] = useState(false);
  const [showMicrophonePermissionSheet, setShowMicrophonePermissionSheet] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
  const [replyingTo, setReplyingTo] = useState<{ index: number; message: ChatMessage; senderName: string; messageId?: string } | null>(null);
  const [sendLoading, setSendLoading] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [otherUserOnline, setOtherUserOnline] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [composerHeight, setComposerHeight] = useState(120);
  const [composerInputHeight, setComposerInputHeight] = useState(CHAT_INPUT_MIN_HEIGHT);
  const [composerSelection, setComposerSelection] = useState({ start: 0, end: 0 });

  // ── More menu / block / report ───────────────────────────────────────────
  const [moreMenuVisible, setMoreMenuVisible] = useState(false);
  const [moreMenuScreenPos, setMoreMenuScreenPos] = useState<{ top: number; right: number } | null>(null);
  const moreMenuButtonRef = useRef<View>(null);
  const [blockConfirmVisible, setBlockConfirmVisible] = useState(false);
  const [blockConfirmLoading, setBlockConfirmLoading] = useState(false);
  const [showReportSheet, setShowReportSheet] = useState(false);
  const [reportSheetMode, setReportSheetMode] = useState<'report' | 'blockReport'>('report');
  const [selectedReportReason, setSelectedReportReason] = useState<string | null>(null);
  const [reportMessageInput, setReportMessageInput] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);

  // ── Message context menu ─────────────────────────────────────────────────
  const [messageContextIndex, setMessageContextIndex] = useState<number | null>(null);
  const [messageContextAnchor, setMessageContextAnchor] = useState<{ top: number; left?: number; right?: number } | null>(null);
  const messageBubbleRefsRef = useRef<Map<number, View>>(new Map());
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);

  // ── Image preview ────────────────────────────────────────────────────────
  const [imagePreviewUri, setImagePreviewUri] = useState<string | null>(null);
  const [imagePreviewZoomed, setImagePreviewZoomed] = useState(false);
  const imagePreviewLastTapRef = useRef<number>(0);

  // ── Refs ─────────────────────────────────────────────────────────────────
  const typingStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const otherUserTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handledIncomingRouteCallRef = useRef<string | null>(null);
  const isPickingFileRef = useRef(false);
  const inputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const isPrependingOlderMessagesRef = useRef(false);
  const contentHeightRef = useRef(0);
  const scrollYRef = useRef(0);
  const layoutHeightRef = useRef(0);
  const pendingPrependScrollRef = useRef<{ prevScrollY: number; prevContentHeight: number } | null>(null);
  const [scrollAfterLocalSendNonce, setScrollAfterLocalSendNonce] = useState(0);

  const bumpScrollAfterLocalSend = useCallback(() => setScrollAfterLocalSendNonce((n) => n + 1), []);

  // ── Existing hooks ───────────────────────────────────────────────────────
  const { keyboardHeight, composerBottomOffset, resetKeyboard } = useKeyboardOffset({ windowHeight, scrollViewRef });
  const {
    askAiraGenerating, generatedReplies, askAiraConfirmVisible, setAskAiraConfirmVisible,
    dontShowAskAiraAgain, setDontShowAskAiraAgain, dontShowAskAiraPersisted,
    askAiraConfirmLoading, airaLimitReachedVisible, setAiraLimitReachedVisible,
    airaLimitCountdown, airaSuggestionsLimitLeft, airaSuggestionsTotalLimit,
    selectedReplyIndex, setSelectedReplyIndex, setDontShowAskAiraPersisted,
    setGeneratedReplies, requestAiSuggestions, handleCancelAiSuggestions, handleInsertReply,
  } = useAiraSuggestions({ chatId, setInputText });

  const onSendVoice = useCallback(async (filePath: string) => {
    if (!currentUserId || !otherUserId) return;
    let effectiveChatId = chatId;
    if (!effectiveChatId) {
      const addRes = await apiClient.post(endpoints.chat.addChat, { senderId: currentUserId, receiverId: otherUserId, firstMessage: '' });
      effectiveChatId = extractChatIdFromAddChatResponse(addRes);
      if (!effectiveChatId) return;
      setChatId(effectiveChatId);
      navigation.setParams({ chatId: effectiveChatId } as any);
    }
    const fileName = `voice_${Date.now()}.m4a`;
    const { url, key } = await uploadChatFileApi(filePath, { mimeType: 'audio/m4a', fileName });
    const res = await sendMessageApi({ chatId: effectiveChatId!, content: '', messageType: 'audio', files: [{ url, key }], replyTo: replyingTo?.messageId ?? null });
    const extracted = extractChatMessageFromSendResponse(res);
    const apiMessage: ChatMessageApiItem = { ...(extracted ?? {}), messageType: 'audio', isSentByMe: true, messageTimeStamp: extracted?.messageTimeStamp ?? new Date().toISOString(), files: extracted?.files && extracted.files.length > 0 ? extracted.files : [{ url, uri: url }] } as ChatMessageApiItem;
    const ui = mapApiMessageToChatMessage(apiMessage, currentUserId, { chatStatus: isRequest ? 'pending' : undefined });
    if (ui) { setMessages((prev) => [...prev, ui as ChatMessage]); bumpScrollAfterLocalSend(); }
    socketService.messageSendFromApi(currentUserId, otherUserId, apiMessage as unknown as Record<string, unknown>);
    setReplyingTo(null);
  }, [chatId, currentUserId, otherUserId, replyingTo, isRequest, bumpScrollAfterLocalSend]);

  const voice = useVoiceRecording({ onSendVoice });

  // ── Permission / attachment helpers ─────────────────────────────────────
  const showSettingsAlert = (permissionName: 'camera' | 'photos' | 'microphone') => {
    const titles = { camera: 'Camera access is turned off', photos: 'Photo access is turned off', microphone: 'Microphone access is turned off' };
    const messages = { camera: 'To continue, allow camera access for Aira in Settings.', photos: 'To continue, allow photo library access for Aira in Settings.', microphone: 'To continue, allow microphone access for Aira in Settings.' };
    Alert.alert(titles[permissionName], messages[permissionName], [
      { text: 'Not now', style: 'cancel' },
      { text: 'Open Settings', onPress: () => void Linking.openSettings() },
    ]);
  };

  const openCamera = () => {
    launchCamera({ mediaType: 'photo', quality: 0.8 }, (response) => {
      if (response.didCancel || response.errorCode) return;
      const asset = response.assets?.[0];
      const uri = asset?.uri;
      if (uri) setPendingAttachments((p) => [...p, { type: 'image', uri, name: asset?.fileName, mimeType: asset?.type }]);
    });
  };

  const openGallery = () => {
    launchImageLibrary({ mediaType: 'photo', selectionLimit: 0, assetRepresentationMode: 'current' }, (response) => {
      if (response.didCancel || response.errorCode) return;
      const picked: PendingAttachment[] = [];
      (response.assets ?? []).forEach((a) => {
        const uri = a?.uri;
        if (!uri) return;
        if (typeof a?.type === 'string' && !a.type.startsWith('image/')) return;
        picked.push({ type: 'image', uri, name: a?.fileName, mimeType: a?.type });
      });
      if (!picked.length) return;
      setPendingAttachments((prev) => {
        const existing = new Set(prev.map((p) => p.uri));
        const next = [...prev];
        picked.forEach((img) => { if (!existing.has(img.uri)) { existing.add(img.uri); next.push(img); } });
        return next;
      });
    });
  };

  const openFilePicker = async () => {
    if (isPickingFileRef.current) return;
    isPickingFileRef.current = true;
    try {
      const results = await pick({ allowMultiSelection: false, copyTo: 'cachesDirectory' } as any);
      if (results?.length && results[0]) {
        const item: any = results[0];
        const uri: string | undefined = item.fileCopyUri ?? item.uri;
        const fileName: string | undefined = item.name;
        if (uri) setPendingAttachments((p) => [...p, { type: 'file', uri, name: fileName ?? 'File' }]);
      }
    } catch { } finally { isPickingFileRef.current = false; }
  };

  const handleCamera = async () => {
    setAttachmentSheetOpen(false);
    const status = await checkCameraPermission();
    if (status === 'granted') { openCamera(); return; }
    setShowCameraPermissionSheet(true);
  };

  const handleAllowCameraPermission = async () => {
    setIsRequestingPermission(true);
    try {
      const status = await requestCameraPermission();
      setShowCameraPermissionSheet(false);
      if (status === 'granted') openCamera(); else showSettingsAlert('camera');
    } catch { setShowCameraPermissionSheet(false); } finally { setIsRequestingPermission(false); }
  };

  const handleGallery = async () => {
    setAttachmentSheetOpen(false);
    const status = await checkPhotoLibraryPermission();
    if (status === 'granted' || status === 'limited') { openGallery(); return; }
    setShowGalleryPermissionSheet(true);
  };

  const handleAllowGalleryPermission = async () => {
    setIsRequestingPermission(true);
    try {
      const status = await requestPhotoLibraryPermission();
      setShowGalleryPermissionSheet(false);
      if (status === 'granted' || status === 'limited') openGallery(); else showSettingsAlert('photos');
    } catch { setShowGalleryPermissionSheet(false); } finally { setIsRequestingPermission(false); }
  };

  const handleAllowMicrophonePermission = async () => {
    setIsRequestingPermission(true);
    try {
      const requested = await requestMicrophonePermission();
      setShowMicrophonePermissionSheet(false);
      if (requested === 'granted') await voice.beginVoiceRecording(); else showSettingsAlert('microphone');
    } finally { setIsRequestingPermission(false); }
  };

  const handleAttachmentSelect = async (option: AttachmentOption) => {
    if (option === 'camera') { await handleCamera(); return; }
    if (option === 'gallery') { await handleGallery(); return; }
    if (option === 'files') {
      try {
        await new Promise<void>((resolve) => setTimeout(resolve, 350));
        await openFilePicker();
      } catch { }
    }
  };

  // ── Message type helpers ─────────────────────────────────────────────────
  const getMessageTypeFromAttachment = (att: PendingAttachment): 'image' | 'audio' | 'video' | 'document' => {
    if (att.type === 'image') return 'image';
    const n = (att as { type: 'file'; name: string }).name?.toLowerCase() ?? '';
    const ext = n.split('.').pop() ?? '';
    if (['mp4', 'mov', 'webm', 'mkv'].includes(ext)) return 'video';
    if (['mp3', 'm4a', 'wav', 'aac', 'ogg'].includes(ext)) return 'audio';
    return 'document';
  };

  const getMimeTypeFromAttachment = (att: PendingAttachment): string => {
    if (att.type === 'image') {
      const explicit = firstNonEmptyString(att.mimeType);
      if (explicit && explicit.startsWith('image/')) return explicit;
      const n = firstNonEmptyString(att.name, att.uri)?.toLowerCase() ?? '';
      const ext = n.split('.').pop() ?? '';
      if (ext === 'png') return 'image/png';
      if (ext === 'webp') return 'image/webp';
      if (ext === 'gif') return 'image/gif';
      return 'image/jpeg';
    }
    const n = (att as { type: 'file'; name: string }).name?.toLowerCase() ?? '';
    const ext = n.split('.').pop() ?? '';
    if (['mp4', 'mov', 'webm', 'mkv'].includes(ext)) return 'video/mp4';
    if (['mp3', 'm4a', 'wav', 'aac', 'ogg'].includes(ext)) return 'audio/mpeg';
    if (ext === 'pdf') return 'application/pdf';
    if (['doc', 'docx'].includes(ext)) return 'application/msword';
    if (['xls', 'xlsx'].includes(ext)) return 'application/vnd.ms-excel';
    if (ext === 'txt') return 'text/plain';
    return 'application/octet-stream';
  };

  const getFileTypeLabel = (n: string) => {
    const ext = n.split('.').pop()?.toUpperCase() ?? 'FILE';
    return ext.length <= 4 ? ext : 'FILE';
  };

  const enrichOutgoingTextPayload = (partial: ChatMessageApiItem | undefined, sentText: string): ChatMessageApiItem => {
    const merged: ChatMessageApiItem = { messageType: 'text', ...partial, isSentByMe: partial?.isSentByMe ?? true };
    const fromApi = (typeof merged.content === 'string' && merged.content.trim()) || (merged.content && typeof merged.content === 'object' && merged.content !== null && 'text' in merged.content && String((merged.content as { text?: unknown }).text ?? '').trim()) || (typeof (merged as { text?: string }).text === 'string' && (merged as { text: string }).text.trim()) || '';
    if (!fromApi && sentText.trim()) merged.content = sentText.trim();
    return merged;
  };

  const enrichOutgoingMediaPayload = (partial: ChatMessageApiItem | undefined, messageType: ChatMessageApiItem['messageType'] | 'video', fileUrl: string): ChatMessageApiItem =>
    ({ ...partial, messageType: messageType ?? partial?.messageType, isSentByMe: partial?.isSentByMe ?? true, messageTimeStamp: partial?.messageTimeStamp ?? new Date().toISOString(), files: partial?.files && partial.files.length > 0 ? partial.files : [{ url: fileUrl, uri: fileUrl }] }) as ChatMessageApiItem;

  // ── Scroll ───────────────────────────────────────────────────────────────
  const scrollToBottom = (animated = true) => {
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated }), 50);
  };

  const handleComposerLayout = useCallback((event: LayoutChangeEvent) => {
    const nextHeight = Math.round(event.nativeEvent.layout.height);
    if (nextHeight > 0) setComposerHeight((prev) => prev === nextHeight ? prev : nextHeight);
  }, []);

  // ── Handle send ──────────────────────────────────────────────────────────
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
      if (!effectiveChatId) {
        const addRes = await apiClient.post(endpoints.chat.addChat, { senderId: currentUserId, receiverId: otherUserId, firstMessage: trimmed });
        effectiveChatId = extractChatIdFromAddChatResponse(addRes);
        if (!effectiveChatId) { setSendLoading(false); return; }
        setChatId(effectiveChatId);
        navigation.setParams({ chatId: effectiveChatId } as any);
        justCreatedChatViaAdd = true;
      }
      const clearComposerNative = () => {
        const anyRef = inputRef as any;
        const current = anyRef?.current;
        if (current?.setNativeProps) current.setNativeProps({ text: '', value: '' });
      };
      const clearComposer = () => {
        clearComposerNative();
        setInputText('');
        if (Platform.OS === 'android') requestAnimationFrame(() => clearComposerNative());
      };
      if (trimmed) {
        socketService.typing(currentUserId, otherUserId, false);
        if (justCreatedChatViaAdd) {
          clearComposer();
          setReplyingTo(null);
          try {
            const msgRes = await getChatMessagesApi({ chatId: effectiveChatId!, page: 1, limit: MESSAGES_PAGE_SIZE });
            const raw = msgRes.data?.list ?? msgRes.data?.messages ?? [];
            const list = Array.isArray(raw) ? raw.map((item) => mapApiMessageToChatMessage(item, currentUserId ?? undefined, { chatStatus: String(((msgRes.data?.chat as { status?: unknown } | undefined)?.status) ?? '') })).filter((m): m is ChatMessage => m != null).reverse() : [];
            if (list.length === 0 && trimmed) { setMessages([{ type: 'text', text: trimmed, timestamp: now(), sent: true }]); appendedOutgoing = true; bumpScrollAfterLocalSend(); } else { setMessages(list); appendedOutgoing = list.length > 0; }
            const meta = msgRes.data?.meta;
            setMessagesPage(meta?.currentPage ?? meta?.pageNo ?? 1);
            setMessagesHasMore((meta?.currentPage ?? 1) < (meta?.totalPages ?? 1));
          } catch { }
        } else {
          const res = await sendMessageApi({ chatId: effectiveChatId!, content: trimmed, messageType: 'text', files: [], replyTo: replyToPayload });
          const extracted = extractChatMessageFromSendResponse(res);
          const apiMessage = enrichOutgoingTextPayload(extracted, trimmed);
          const ui = mapApiMessageToChatMessage(apiMessage, currentUserId, { chatStatus: isRequest ? 'pending' : undefined });
          if (ui) { setMessages((prev) => [...prev, ui as ChatMessage]); appendedOutgoing = true; setTimeout(() => scrollToBottom(true), 100); }
          if (currentUserId && otherUserId) socketService.messageSendFromApi(currentUserId, otherUserId, apiMessage as unknown as Record<string, unknown>);
          clearComposer();
          setReplyingTo(null);
        }
      }
      for (const att of pendingAttachments) {
        const messageType = getMessageTypeFromAttachment(att);
        const mimeType = getMimeTypeFromAttachment(att);
        const fileName = att.type === 'image' ? firstNonEmptyString(att.name, `image_${Date.now()}.jpg`)! : att.name;
        const { url, key } = await uploadChatFileApi(att.uri, { mimeType, fileName });
        const res = await sendMessageApi({ chatId: effectiveChatId!, content: '', messageType, files: [{ url, key }], replyTo: replyToPayload });
        const extracted = extractChatMessageFromSendResponse(res);
        const base = enrichOutgoingMediaPayload(extracted, messageType, url);
        const firstFile = Array.isArray(base.files) ? base.files[0] : undefined;
        const normalizedApiMessage: ChatMessageApiItem = { ...base, files: [{ ...(firstFile ?? {}), url: firstNonEmptyString(firstFile?.url, firstFile?.uri, url), uri: firstNonEmptyString(firstFile?.uri, firstFile?.url, url), name: firstNonEmptyString(firstFile?.name, firstFile?.filename, fileName) }], name: firstNonEmptyString(base.name, firstFile?.name, firstFile?.filename, fileName) };
        const ui = mapApiMessageToChatMessage(normalizedApiMessage, currentUserId, { chatStatus: isRequest ? 'pending' : undefined });
        if (ui) { setMessages((prev) => [...prev, ui]); appendedOutgoing = true; bumpScrollAfterLocalSend(); }
        if (currentUserId && otherUserId) socketService.messageSendFromApi(currentUserId, otherUserId, normalizedApiMessage as unknown as Record<string, unknown>);
      }
      clearComposer();
      setReplyingTo(null);
      if (pendingAttachments.length > 0) setPendingAttachments([]);
      if (appendedOutgoing) bumpScrollAfterLocalSend();
    } catch { } finally { setSendLoading(false); }
  };

  const handleMicPress = async () => {
    if (inputText.trim() || pendingAttachments.length || sendLoading) return;
    const status = await checkMicrophonePermission();
    if (status !== 'granted') { setShowMicrophonePermissionSheet(true); return; }
    await voice.beginVoiceRecording();
  };

  // ── Request accept / decline ─────────────────────────────────────────────
  const handleRequestAccept = async () => {
    if (!chatId) return;
    setRequestActionLoading('accept');
    try {
      await setChatRequestActionApi({ chatId, action: 'accept' });
      navigation.setParams({ isRequest: false } as any);
      setIsRequest(false);
      setMessagesLoading(true);
      const res = await getChatMessagesApi({ chatId, page: 1, limit: MESSAGES_PAGE_SIZE });
      const raw = res.data?.list ?? res.data?.messages ?? [];
      const list = Array.isArray(raw) ? raw.map((item) => mapApiMessageToChatMessage(item, currentUserId ?? undefined, { chatStatus: String(((res.data?.chat as { status?: unknown } | undefined)?.status) ?? '') })).filter((m): m is ChatMessage => m != null).reverse() : [];
      setMessages(list);
      const meta = res.data?.meta;
      setMessagesPage(meta?.currentPage ?? meta?.pageNo ?? 1);
      setMessagesHasMore((meta?.currentPage ?? 1) < (meta?.totalPages ?? 1));
    } catch { } finally { setMessagesLoading(false); setRequestActionLoading(null); }
  };

  const handleRequestDecline = async () => {
    if (!chatId) return;
    setRequestActionLoading('decline');
    try { await setChatRequestActionApi({ chatId, action: 'reject' }); navigation.goBack(); }
    catch { } finally { setRequestActionLoading(null); }
  };

  const handleBlockAndReport = async () => {
    if (!otherUserId) return;
    setReportSheetMode('blockReport');
    setSelectedReportReason(null);
    setReportMessageInput('');
    setShowReportSheet(true);
  };

  // ── Message context menu ─────────────────────────────────────────────────
  const setMessageBubbleRef = useCallback((index: number, node: View | null) => {
    const m = messageBubbleRefsRef.current;
    if (node) m.set(index, node); else m.delete(index);
  }, []);

  const handleMessageLongPress = useCallback((index: number) => {
    const msg = messages[index];
    const sent = msg?.sent === true;
    const node = messageBubbleRefsRef.current.get(index);
    const applyAnchor = (x: number, y: number, width: number, height: number) => {
      let top = y + height + MESSAGE_CONTEXT_GAP;
      const bottomLimit = windowHeight - insets.bottom - 16;
      if (top + APPROX_MESSAGE_CONTEXT_HEIGHT > bottomLimit) top = Math.max(insets.top + 8, y - APPROX_MESSAGE_CONTEXT_HEIGHT - MESSAGE_CONTEXT_GAP);
      const pad = H_PADDING;
      if (sent) { setMessageContextAnchor({ top, right: Math.max(pad, windowWidth - (x + width)) }); }
      else { setMessageContextAnchor({ top, left: Math.max(pad, Math.min(x, windowWidth - pad - MESSAGE_CONTEXT_MIN_WIDTH)) }); }
      setMessageContextIndex(index);
    };
    if (!node) { setMessageContextAnchor(null); setMessageContextIndex(index); return; }
    requestAnimationFrame(() => {
      node.measureInWindow((mx, my, mwidth, mheight) => {
        if (mwidth <= 0 || mheight <= 0 || Number.isNaN(mx) || Number.isNaN(my)) { setMessageContextAnchor(null); setMessageContextIndex(index); return; }
        applyAnchor(mx, my, mwidth, mheight);
      });
    });
  }, [insets.bottom, insets.top, messages, windowHeight, windowWidth]);

  // ── More menu ────────────────────────────────────────────────────────────
  const openMoreMenu = useCallback(() => {
    const applyPosition = (top: number, right: number) => { setMoreMenuScreenPos({ top, right }); setMoreMenuVisible(true); };
    const fallbackPosition = () => applyPosition(insets.top + 12 + 56 + MORE_MENU_GAP, H_PADDING);
    const node = moreMenuButtonRef.current;
    if (!node) { fallbackPosition(); return; }
    requestAnimationFrame(() => {
      node.measureInWindow((x, y, width, height) => {
        if (width <= 0 || height <= 0 || Number.isNaN(x) || Number.isNaN(y)) { fallbackPosition(); return; }
        let top = y + height + MORE_MENU_GAP;
        const bottomLimit = windowHeight - insets.bottom - 16;
        if (top + APPROX_MORE_MENU_HEIGHT > bottomLimit) top = Math.max(insets.top + 8, y - APPROX_MORE_MENU_HEIGHT - MORE_MENU_GAP);
        applyPosition(top, Math.max(8, windowWidth - (x + width)));
      });
    });
  }, [insets.bottom, insets.top, windowHeight, windowWidth]);

  // ── Image / document ─────────────────────────────────────────────────────
  const openImagePreview = useCallback((uri: string) => { if (!uri) return; setImagePreviewZoomed(false); setImagePreviewUri(uri); }, []);
  const closeImagePreview = useCallback(() => { setImagePreviewUri(null); setImagePreviewZoomed(false); }, []);
  const openDocument = useCallback(async (uri: string) => {
    if (!uri) return;
    try { const supported = await Linking.canOpenURL(uri); if (supported) await Linking.openURL(uri); } catch { }
  }, []);

  // ── Presence helper ──────────────────────────────────────────────────────
  const isOtherUserOnlineFromPayload = useCallback((payload: unknown): boolean | null => {
    if (!payload || !otherUserId) return null;
    if (Array.isArray(payload)) {
      const ids = payload.map((x) => { if (typeof x === 'string' || typeof x === 'number') return String(x); if (x && typeof x === 'object') { const o = x as Record<string, unknown>; return String(o.userId ?? o.user_id ?? o.id ?? o._id ?? o.memberId ?? o.member_id ?? ''); } return ''; }).filter(Boolean);
      return ids.includes(String(otherUserId));
    }
    const data = payload as Record<string, unknown>;
    const directUserId = String(data.userId ?? data.user_id ?? data.id ?? data.memberId ?? data.member_id ?? '');
    const directOnline = data.online ?? data.isOnline ?? data.status;
    if (directUserId === otherUserId && directOnline != null) {
      if (typeof directOnline === 'string') { const n = directOnline.toLowerCase(); return n === 'online' || n === 'true' || n === '1'; }
      return Boolean(directOnline);
    }
    const rawOnlineList = data.users ?? data.onlineUserIds ?? data.onlineUsers ?? data.online_users ?? data.userIds ?? data.user_ids;
    if (Array.isArray(rawOnlineList)) {
      const onlineIds = rawOnlineList.map((entry) => { if (typeof entry === 'string' || typeof entry === 'number') return String(entry); if (entry && typeof entry === 'object') { const obj = entry as Record<string, unknown>; return String(obj.userId ?? obj.user_id ?? obj.id ?? obj._id ?? obj.memberId ?? obj.member_id ?? ''); } return ''; }).filter(Boolean);
      return onlineIds.includes(String(otherUserId));
    }
    return null;
  }, [otherUserId]);

  const getMessagePreview = (msg: ChatMessage): string => {
    if (msg.type === 'text') return msg.text;
    if (msg.type === 'rich') { const p = msg.blocks.find((b) => b.type === 'paragraph'); if (p?.type === 'paragraph' && p.text) return p.text; const b = msg.blocks.find((b) => b.type === 'bullet_list'); if (b?.type === 'bullet_list' && b.items.length > 0) return b.items[0]?.title ?? b.items[0]?.description ?? 'Message'; return 'Message'; }
    if (msg.type === 'voice') return 'Voice message';
    if (msg.type === 'image') return 'Photo';
    if (msg.type === 'file') return msg.name;
    if (msg.type === 'call_log') return msg.label.trim() || (msg.callType === 'video' ? 'Video call' : 'Voice call');
    return '';
  };

  // ── Effects ──────────────────────────────────────────────────────────────

  useFocusEffect(useCallback(() => {
    return () => { voice.resetVoiceState(); resetKeyboard(); Keyboard.dismiss(); };
  }, [voice.resetVoiceState, resetKeyboard]));

  // Route-param incoming call
  useEffect(() => {
    const incomingFromRoute = route.params?.incomingCall ?? initialIncomingCall;
    if (!incomingFromRoute) return;
    const dedupeKey = `${incomingFromRoute.callId ?? 'no-call-id'}:${incomingFromRoute.mode}:${incomingFromRoute.senderId ?? ''}`;
    if (handledIncomingRouteCallRef.current === dedupeKey) return;
    handledIncomingRouteCallRef.current = dedupeKey;
    if (incomingFromRoute.senderId && !otherUserId) setOtherUserId(incomingFromRoute.senderId);
    if (incomingFromRoute.callerName && (!name || name === 'Chat')) setName(incomingFromRoute.callerName);
    if (incomingFromRoute.callerAvatar) setPartnerAvatar({ uri: incomingFromRoute.callerAvatar } as any);
    call.setIncomingCallContext({ callId: incomingFromRoute.callId, channelName: incomingFromRoute.channelName, rtcToken: incomingFromRoute.rtcToken });
    const key = `${incomingFromRoute.mode}:${incomingFromRoute.callId ?? ''}`;
    handledIncomingCallRef.current = key;
    call.showIncomingCallBanner({ mode: incomingFromRoute.mode, callerName: incomingFromRoute.callerName ?? name ?? 'Incoming call', callId: incomingFromRoute.callId, callerAvatar: incomingFromRoute.callerAvatar });
  }, [initialIncomingCall, name, otherUserId, route.params, call.showIncomingCallBanner, call.setIncomingCallContext]);

  // Mark seen
  useEffect(() => { if (!chatId) return; markChatSeenApi(chatId).catch(() => {}); }, [chatId]);

  // Load initial messages
  useEffect(() => {
    if (!chatId) { setMessagesLoading(false); return; }
    let cancelled = false;
    setMessagesLoading(true);
    setMessagesPage(1);
    setMessagesHasMore(true);
    getChatMessagesApi({ chatId, page: 1, limit: MESSAGES_PAGE_SIZE })
      .then((res) => {
        if (cancelled) return;
        const chatPayload = res.data?.chat as Record<string, unknown> | undefined;
        const participantsRaw = chatPayload && typeof chatPayload.participants === 'object' ? (chatPayload.participants as Record<string, unknown>) : null;
        const senderRaw = participantsRaw && typeof participantsRaw.sender === 'object' ? (participantsRaw.sender as Record<string, unknown>) : null;
        const receiverRaw = participantsRaw && typeof participantsRaw.receiver === 'object' ? (participantsRaw.receiver as Record<string, unknown>) : null;
        const pickOther = (): Record<string, unknown> | null => {
          const me = typeof currentUserId === 'string' && currentUserId.trim() ? currentUserId.trim() : null;
          if (me && senderRaw && firstNonEmptyString(senderRaw._id, senderRaw.id) === me) return receiverRaw;
          if (me && receiverRaw && firstNonEmptyString(receiverRaw._id, receiverRaw.id) === me) return senderRaw;
          return receiverRaw ?? senderRaw;
        };
        const other = pickOther();
        if (other) {
          const pid = firstNonEmptyString(other._id, other.id, other.userId);
          if (!otherUserId && pid) setOtherUserId(pid);
          const pname = firstNonEmptyString(other.nickName, other.name);
          if ((name ?? '').trim().length === 0 || name === 'Chat') { if (pname) setName(pname); }
          const photo = other.profilePhoto;
          let avatarUrl: string | undefined;
          if (typeof photo === 'string') avatarUrl = photo;
          if (photo && typeof photo === 'object') { const u = (photo as { url?: Record<string, unknown> }).url as { medium?: unknown; thumb?: unknown; original?: unknown } | undefined; avatarUrl = firstNonEmptyString(u?.medium, u?.thumb, u?.original); }
          const pic = typeof other.profilePicture === 'string' ? other.profilePicture : undefined;
          const picked = firstNonEmptyString(avatarUrl, pic);
          if (picked) { const resolved = { uri: picked } as any; setPartnerAvatar(resolved); if (!avatar) setAvatar(resolved); } else setPartnerAvatar(undefined);
        }
        const receiverParticipantId = receiverRaw ? firstNonEmptyString(receiverRaw._id, receiverRaw.id, receiverRaw.userId) : undefined;
        const senderParticipantId = senderRaw ? firstNonEmptyString(senderRaw._id, senderRaw.id, senderRaw.userId) : undefined;
        if (!initialIsRequest && chatPayload) {
          const status = String((chatPayload.status as unknown) ?? '').toLowerCase();
          const isPendingStatus = status.includes('pending') || status.includes('request');
          const me = typeof currentUserId === 'string' && currentUserId.trim() ? currentUserId.trim() : '';
          if (!isPendingStatus) setIsRequest(false);
          else if (receiverParticipantId && me && me === receiverParticipantId) setIsRequest(true);
          else setIsRequest(false);
        }
        const raw = res.data?.list ?? res.data?.messages ?? [];
        const list = Array.isArray(raw) ? raw.map((item) => mapApiMessageToChatMessage(item, currentUserId ?? undefined, { chatStatus: String(((res.data?.chat as { status?: unknown } | undefined)?.status) ?? '') })).filter((m): m is ChatMessage => m != null).reverse() : [];
        setMessages(list);
        const meta = res.data?.meta;
        setMessagesPage(meta?.currentPage ?? meta?.pageNo ?? 1);
        setMessagesHasMore((meta?.currentPage ?? 1) < (meta?.totalPages ?? 1));
      })
      .catch(() => { if (!cancelled) { setMessages([]); setMessagesHasMore(false); } })
      .finally(() => { if (!cancelled) setMessagesLoading(false); });
    return () => { cancelled = true; };
  }, [chatId, currentUserId]);

  // Message socket events
  useEffect(() => {
    if (!chatId || !currentUserId || !otherUserId) return;
    setSocketConnected(socketService.isConnected());
    socketService.join(chatId);
    const unsubMessage = socketService.on<MessageReceivePayload>('message_send', (data) => {
      const apiMessage = (data.message ?? {}) as ChatMessageApiItem;
      const senderId = (apiMessage.sender as string | undefined) ?? data.sender;
      const receiverId = (apiMessage.receiver as string | undefined) ?? data.receiver;
      if (receiverId !== currentUserId || senderId === currentUserId || senderId !== otherUserId) return;
      const adjusted: ChatMessageApiItem = { ...apiMessage, isSentByMe: senderId === currentUserId };
      const ui = mapApiMessageToChatMessage(adjusted, currentUserId, { chatStatus: isRequest ? 'pending' : undefined });
      if (!ui) return;
      setMessages((prev) => [...prev, ui as ChatMessage]);
      if (chatId) markChatSeenApi(chatId).catch(() => {});
    });
    const unsubDelete = socketService.on<MessageDeletePayload>('message_delete', (data) => {
      if (!data?.messageId) return;
      setMessages((prev) => prev.filter((m) => (m as { messageId?: string }).messageId !== data.messageId));
    });
    const unsubTyping = socketService.on<TypingPayload>('typing', (data) => {
      const applies = data.sender === otherUserId && (data.receiver === currentUserId || !data.receiver);
      if (!applies) return;
      if (otherUserTypingTimeoutRef.current) { clearTimeout(otherUserTypingTimeoutRef.current); otherUserTypingTimeoutRef.current = null; }
      setOtherUserTyping(Boolean(data.isTyping));
      if (data.isTyping) {
        otherUserTypingTimeoutRef.current = setTimeout(() => { setOtherUserTyping(false); otherUserTypingTimeoutRef.current = null; }, 2500);
      }
    });
    const unsubJoinSuccess = socketService.on<unknown>('join_success', (data) => {
      const presence = isOtherUserOnlineFromPayload(data);
      if (presence !== null) setOtherUserOnline(presence);
    });
    const unsubConnection = socketService.onConnectionChange((connected) => {
      setSocketConnected(connected);
      if (!connected) { setOtherUserOnline(false); return; }
      if (chatId) socketService.join(chatId);
      getChatMessagesApi({ chatId }).then((res) => {
        const raw = res.data?.list ?? res.data?.messages ?? [];
        const list = Array.isArray(raw) ? raw.map((item) => mapApiMessageToChatMessage(item, currentUserId ?? undefined, { chatStatus: String(((res.data?.chat as { status?: unknown } | undefined)?.status) ?? '') })).filter((m): m is ChatMessage => m != null).reverse() : [];
        setMessages(list);
      }).catch(() => {});
    });
    return () => { unsubMessage(); unsubDelete(); unsubTyping(); unsubJoinSuccess(); unsubConnection(); };
  }, [chatId, currentUserId, otherUserId, isRequest, isOtherUserOnlineFromPayload]);

  // Typing indicator cleanup
  useEffect(() => {
    return () => { if (otherUserTypingTimeoutRef.current) { clearTimeout(otherUserTypingTimeoutRef.current); otherUserTypingTimeoutRef.current = null; } };
  }, []);

  // Outgoing typing events
  useEffect(() => {
    if (!chatId || !currentUserId || !otherUserId) return;
    if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
    if (typingStopRef.current) clearTimeout(typingStopRef.current);
    if (inputText.trim().length > 0) {
      typingDebounceRef.current = setTimeout(() => {
        socketService.typing(currentUserId, otherUserId, true);
        if (typingStopRef.current) clearTimeout(typingStopRef.current);
        typingStopRef.current = setTimeout(() => { socketService.typing(currentUserId, otherUserId, false); }, 2000);
      }, 300);
    } else {
      socketService.typing(currentUserId, otherUserId, false);
    }
    return () => { if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current); if (typingStopRef.current) clearTimeout(typingStopRef.current); };
  }, [chatId, currentUserId, otherUserId, inputText]);

  // Composer height → reset placeholder on clear
  useEffect(() => { if (inputText.length > 0) return; setComposerInputHeight(CHAT_INPUT_MIN_HEIGHT); }, [inputText]);

  // More menu screen pos cleanup
  useEffect(() => { if (!moreMenuVisible) setMoreMenuScreenPos(null); }, [moreMenuVisible]);
  useEffect(() => { if (messageContextIndex === null) setMessageContextAnchor(null); }, [messageContextIndex]);

  // Load more (pagination)
  const loadMoreMessages = useCallback(async () => {
    if (!chatId || messagesLoading || messagesLoadingMore || !messagesHasMore) return;
    setMessagesLoadingMore(true);
    pendingPrependScrollRef.current = { prevScrollY: scrollYRef.current, prevContentHeight: contentHeightRef.current };
    const nextPage = messagesPage + 1;
    try {
      const res = await getChatMessagesApi({ chatId, page: nextPage, limit: MESSAGES_PAGE_SIZE });
      const raw = res.data?.list ?? res.data?.messages ?? [];
      const list = Array.isArray(raw) ? raw.map((item) => mapApiMessageToChatMessage(item, currentUserId ?? undefined, { chatStatus: String(((res.data?.chat as { status?: unknown } | undefined)?.status) ?? '') })).filter((m): m is ChatMessage => m != null).reverse() : [];
      if (list.length > 0) {
        isPrependingOlderMessagesRef.current = true;
        setMessages((prev) => [...list, ...prev]);
        const meta = res.data?.meta;
        setMessagesPage(meta?.currentPage ?? meta?.pageNo ?? nextPage);
        setMessagesHasMore((meta?.currentPage ?? nextPage) < (meta?.totalPages ?? nextPage));
      } else { pendingPrependScrollRef.current = null; setMessagesHasMore(false); }
    } catch { pendingPrependScrollRef.current = null; setMessagesHasMore(false); }
    finally { setMessagesLoadingMore(false); }
  }, [chatId, currentUserId, messagesHasMore, messagesLoading, messagesLoadingMore, messagesPage]);

  const handleMessagesScroll = useCallback((event: any) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent ?? {};
    scrollYRef.current = contentOffset?.y ?? 0;
    if (layoutMeasurement?.height != null) layoutHeightRef.current = layoutMeasurement.height;
    if (contentSize?.height != null) contentHeightRef.current = contentSize.height;
    if (scrollYRef.current <= 50) loadMoreMessages();
  }, [loadMoreMessages]);

  // Scroll after messages load / new message
  useEffect(() => {
    if (messagesLoading || messages.length === 0) return;
    if (isPrependingOlderMessagesRef.current) {
      isPrependingOlderMessagesRef.current = false;
      const pending = pendingPrependScrollRef.current;
      pendingPrependScrollRef.current = null;
      if (pending) {
        requestAnimationFrame(() => {
          const delta = contentHeightRef.current - pending.prevContentHeight;
          if (delta > 0) scrollViewRef.current?.scrollTo({ y: pending.prevScrollY + delta, animated: false });
        });
      }
      return;
    }
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: false }), 80);
  }, [messagesLoading, messages.length]);

  useLayoutEffect(() => {
    if (scrollAfterLocalSendNonce === 0 || messagesLoading) return;
    const id = requestAnimationFrame(() => { scrollViewRef.current?.scrollToEnd({ animated: true }); requestAnimationFrame(() => scrollViewRef.current?.scrollToEnd({ animated: false })); });
    return () => cancelAnimationFrame(id);
  }, [scrollAfterLocalSendNonce, messagesLoading]);

  // Navigation: openMatchDetails
  const openMatchDetails = useCallback(() => {
    if (!otherUserId) return;
    const parentNav = (navigation.getParent?.() ?? null) as { navigate?: (name: string, params?: Record<string, unknown>) => void } | null;
    if (parentNav?.navigate) { parentNav.navigate('MatchDetails', { userId: otherUserId }); return; }
    (navigation as unknown as { navigate: (name: string, params?: Record<string, unknown>) => void }).navigate('MatchDetails', { userId: otherUserId });
  }, [navigation, otherUserId]);

  // Typing handlers for composer
  const onTypingStart = useCallback(() => {
    if (currentUserId && otherUserId) {
      if (typingStopRef.current) clearTimeout(typingStopRef.current);
      typingStopRef.current = null;
      socketService.typing(currentUserId, otherUserId, true);
    }
  }, [currentUserId, otherUserId]);

  const onTypingStop = useCallback(() => {
    if (currentUserId && otherUserId) {
      if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
      typingDebounceRef.current = null;
      if (typingStopRef.current) clearTimeout(typingStopRef.current);
      typingStopRef.current = null;
      socketService.typing(currentUserId, otherUserId, false);
    }
  }, [currentUserId, otherUserId]);

  const messageListContentContainerStyle = useMemo(() => ({
    ...styles.scrollContent,
    paddingBottom: (styles.scrollContent?.paddingBottom ?? 16) + composerHeight + keyboardHeight + 12,
  }), [composerHeight, keyboardHeight]);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.screen}>
        <StatusBar barStyle="dark-content" translucent backgroundColor={colors.white} />

        {/* Header */}
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => navigation.navigate('ChatList')} accessibilityRole="button" accessibilityLabel="Back to chats">
            <BackArrowIcon size={48} />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8} onPress={openMatchDetails}>
            {avatar != null ? <Image source={avatar} style={styles.headerAvatar} resizeMode="cover" /> : <View style={styles.headerAvatar} />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerNameWrap} activeOpacity={0.8} onPress={openMatchDetails}>
            <Text style={styles.headerName} numberOfLines={1}>{name}</Text>
            {otherUserTyping ? <Text style={styles.headerOnline}>typing…</Text> : otherUserOnline && <Text style={styles.headerOnline}>Online</Text>}
          </TouchableOpacity>
          {!askAiraGenerating && generatedReplies == null && (
            <TouchableOpacity style={styles.headerAskAiraButton} onPress={() => { if (dontShowAskAiraPersisted && chatId) requestAiSuggestions(); else setAskAiraConfirmVisible(true); }} activeOpacity={0.8} disabled={askAiraConfirmLoading}>
              <AskAiraSendIcon width={52} height={52} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.headerCallButton} onPress={call.handleHeaderVideoCallPress} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel="Video call">
            <ChatHeaderVideoCallIcon size={24} color={colors.black} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerCallButton} onPress={call.handleHeaderVoiceCallPress} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel="Voice call">
            <ChatHeaderVoiceCallIcon size={24} color={colors.black} />
          </TouchableOpacity>
          <View ref={moreMenuButtonRef} collapsable={false}>
            <TouchableOpacity style={styles.moreButton} onPress={openMoreMenu} accessibilityLabel="Chat options">
              <MoreVertIcon size={24} color={colors.black} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Call overlay (banner + modals) — timer re-renders only here */}
        <CallOverlay
          callStateVisible={call.callStateVisible}
          incomingVoiceCallVisible={call.incomingVoiceCallVisible}
          incomingVideoCallVisible={call.incomingVideoCallVisible}
          incomingCallBannerVisible={call.incomingCallBannerVisible}
          incomingCallBannerMode={call.incomingCallBannerMode}
          activeCallMode={call.activeCallMode}
          callAudioEnabled={call.callAudioEnabled}
          callVideoEnabled={call.callVideoEnabled}
          partnerAudioEnabled={call.partnerAudioEnabled}
          partnerVideoEnabled={call.partnerVideoEnabled}
          videoCallUiHidden={call.videoCallUiHidden}
          isOutgoingVoiceRinging={call.isOutgoingVoiceRinging}
          isSwitchingVoiceToVideo={call.isSwitchingVoiceToVideo}
          switchToVideoPopupVisible={call.switchToVideoPopupVisible}
          incomingCallSwitchRequestVisible={call.incomingCallSwitchRequestVisible}
          audioDeviceSheetVisible={call.audioDeviceSheetVisible}
          selectedAudioDevice={call.selectedAudioDevice}
          audioRouteFabHighlighted={call.audioRouteFabHighlighted}
          isPartnerFullyOff={call.isPartnerFullyOff}
          showPartnerMicOffState={call.showPartnerMicOffState}
          showVideoPreviewOffSurface={call.showVideoPreviewOffSurface}
          showRemoteRtcVideo={call.showRemoteRtcVideo}
          incomingVoiceCallerName={call.incomingVoiceCallerName}
          incomingVideoCallerName={call.incomingVideoCallerName}
          name={name}
          callConnectedAtMs={call.callConnectedAtMs}
          localRtcUid={call.localRtcUid}
          remoteRtcUid={call.remoteRtcUid}
          AgoraRtcSurfaceView={call.AgoraRtcSurfaceView}
          incomingVoiceSwipeY={call.incomingVoiceSwipeY}
          incomingVoiceAcceptPanResponder={call.incomingVoiceAcceptPanResponder}
          incomingVideoSwipeY={call.incomingVideoSwipeY}
          incomingVideoAcceptPanResponder={call.incomingVideoAcceptPanResponder}
          partnerDisplaySource={partnerDisplaySource}
          localVideoPreviewFallback={localVideoPreviewFallback}
          closeCallState={call.closeCallState}
          minimizeCallState={call.minimizeCallState}
          toggleCallAudio={call.toggleCallAudio}
          toggleCallVideo={call.toggleCallVideo}
          openAudioDeviceSheet={call.openAudioDeviceSheet}
          selectAudioDevice={call.selectAudioDevice}
          flipVideoCallCamera={call.flipVideoCallCamera}
          toggleVideoCallUiHidden={call.toggleVideoCallUiHidden}
          openIncomingCallFromBanner={call.openIncomingCallFromBanner}
          acceptIncomingVoiceCall={call.acceptIncomingVoiceCall}
          declineIncomingVoiceCall={call.declineIncomingVoiceCall}
          acceptIncomingVideoCall={call.acceptIncomingVideoCall}
          declineIncomingVideoCall={call.declineIncomingVideoCall}
          dismissIncomingVoiceCallModal={call.dismissIncomingVoiceCallModal}
          dismissIncomingVideoCallModal={call.dismissIncomingVideoCallModal}
          requestSwitchVoiceToVideo={call.requestSwitchVoiceToVideo}
          respondToIncomingCallSwitchRequest={call.respondToIncomingCallSwitchRequest}
          cancelSwitchToVideoRequest={call.cancelSwitchToVideoRequest}
          openSwitchToVideoPopup={call.openSwitchToVideoPopup}
        />

        {/* Message list */}
        <MessageList
          messages={messages}
          messagesLoading={messagesLoading}
          messagesLoadingMore={messagesLoadingMore}
          scrollRef={scrollViewRef}
          contentContainerStyle={messageListContentContainerStyle}
          onScroll={handleMessagesScroll}
          onLayout={(e) => { layoutHeightRef.current = e.nativeEvent.layout.height; }}
          onContentSizeChange={(w, h) => { contentHeightRef.current = h; }}
          voice={voice}
          name={name}
          handleMessageLongPress={handleMessageLongPress}
          setMessageBubbleRef={setMessageBubbleRef}
          onImagePress={openImagePreview}
          onDocumentPress={(uri) => openDocument(uri).catch(() => {})}
        />

        {/* Bottom composer area */}
        <View style={[styles.bottomComposerContainer, { bottom: composerBottomOffset }]}>
          {voice.voiceBarVisible ? (
            <View style={[styles.voiceBar, { paddingBottom: 12 + bottomSafeInset }]}>
              <TouchableOpacity style={styles.voiceBarTrash} activeOpacity={0.8} onPress={voice.handleVoiceTrash} disabled={voice.voiceSendLoading}>
                <DeleteIcon size={20} color={colors.white} />
              </TouchableOpacity>
              <View style={styles.voiceBarPill}>
                <TouchableOpacity style={styles.voiceBarPlayPause} activeOpacity={0.8} onPress={voice.handleVoicePlayPause} disabled={voice.voiceSendLoading}>
                  {voice.voicePaused ? <PlayIcon size={22} color={colors.black} /> : <PauseIcon size={22} color={colors.black} />}
                </TouchableOpacity>
                <View style={styles.voiceBarWaveform}>
                  {VOICE_WAVEFORM.map((h, i) => <View key={i} style={[styles.voiceBarWaveformBar, { height: Math.max(6, h) }]} />)}
                </View>
                <Text style={styles.voiceBarTimer}>{voice.formatVoiceTime(voice.voiceSeconds)}</Text>
              </View>
              <TouchableOpacity style={styles.voiceBarSend} activeOpacity={0.8} onPress={() => { voice.handleVoiceSend().catch(() => {}); }} disabled={voice.voiceSendLoading}>
                {voice.voiceSendLoading ? <ActivityIndicator size="small" color={colors.white} /> : <ForwardArrowIcon size={22} color={colors.white} />}
              </TouchableOpacity>
            </View>
          ) : isRequest ? (
            <View style={[styles.requestActionBar, { paddingBottom: 24 + bottomSafeInset }]}>
              <View style={styles.requestActionRow}>
                <TouchableOpacity style={styles.requestDeclineButton} onPress={handleRequestDecline} disabled={requestActionLoading !== null} activeOpacity={0.8}>
                  {requestActionLoading === 'decline' ? <ActivityIndicator size="small" color={colors.black} /> : <Text style={styles.requestDeclineLabel}>{STRINGS.CHAT.DECLINE}</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={styles.requestAcceptButton} onPress={handleRequestAccept} disabled={requestActionLoading !== null} activeOpacity={0.8}>
                  <LinearGradient colors={[...colors.gradients.primary.colors]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={StyleSheet.absoluteFill} />
                  {requestActionLoading === 'accept' ? <ActivityIndicator size="small" color={colors.white} /> : <Text style={styles.requestAcceptLabel}>{STRINGS.CHAT.ACCEPT}</Text>}
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.requestBlockReportWrap} onPress={handleBlockAndReport} disabled={requestActionLoading !== null} activeOpacity={0.8}>
                <Text style={styles.requestBlockReportText}>{STRINGS.CHAT.BLOCK_AND_REPORT}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ChatComposer
              inputRef={inputRef}
              inputText={inputText}
              setInputText={setInputText}
              pendingAttachments={pendingAttachments}
              setPendingAttachments={setPendingAttachments}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              sendLoading={sendLoading}
              voiceSendLoading={voice.voiceSendLoading}
              composerInputHeight={composerInputHeight}
              setComposerInputHeight={setComposerInputHeight}
              composerSelection={composerSelection}
              setComposerSelection={setComposerSelection}
              bottomSafeInset={bottomSafeInset}
              otherUserTyping={otherUserTyping}
              currentUserId={currentUserId}
              otherUserId={otherUserId}
              typingStopRef={typingStopRef}
              typingDebounceRef={typingDebounceRef}
              onLayout={handleComposerLayout}
              onSendPress={() => handleSend().catch(() => {})}
              onMicPress={() => handleMicPress().catch(() => {})}
              onAttachPress={() => setAttachmentSheetOpen(true)}
              onTypingStart={onTypingStart}
              onTypingStop={onTypingStop}
              getMessagePreview={getMessagePreview}
              getFileTypeLabel={getFileTypeLabel}
            />
          )}
        </View>

        {/* Attachment options */}
        <AttachmentOptionsBottomSheet isOpen={attachmentSheetOpen} onClose={() => setAttachmentSheetOpen(false)} onSelect={handleAttachmentSelect} />

        {/* Permission sheets */}
        {[
          { isOpen: showCameraPermissionSheet, onClose: () => { if (!isRequestingPermission) handleAllowCameraPermission().catch(() => {}); }, onAllow: handleAllowCameraPermission, title: STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.CAMERA_PERMISSION_TITLE, desc: STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.CAMERA_PERMISSION_DESCRIPTION },
          { isOpen: showGalleryPermissionSheet, onClose: () => { if (!isRequestingPermission) handleAllowGalleryPermission().catch(() => {}); }, onAllow: handleAllowGalleryPermission, title: STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.PHOTOS_PERMISSION_TITLE, desc: STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.PHOTOS_PERMISSION_DESCRIPTION },
          { isOpen: showMicrophonePermissionSheet, onClose: () => { if (!isRequestingPermission) handleAllowMicrophonePermission().catch(() => {}); }, onAllow: handleAllowMicrophonePermission, title: STRINGS.CHAT.MICROPHONE_PERMISSION_TITLE, desc: STRINGS.CHAT.MICROPHONE_PERMISSION_DESCRIPTION },
        ].map(({ isOpen, onClose, onAllow, title, desc }) => (
          <ReusableBottomSheet key={title} isOpen={isOpen} onClose={onClose} snapPoints={[336]} showDragHandle showCloseButton={false} enablePanDownToClose={false} backgroundStyle={permissionSheetStyles.sheet} backdropStyle={permissionSheetStyles.backdrop} dragHandleContainerStyle={permissionSheetStyles.dragHandleContainer} dragHandleStyle={permissionSheetStyles.dragHandle} scrollEnabled={false}>
            <View style={permissionSheetStyles.content}>
              <Text style={permissionSheetStyles.title}>{title}</Text>
              <Text style={permissionSheetStyles.description}>{desc}</Text>
              <View style={permissionSheetStyles.actions}>
                <TouchableOpacity activeOpacity={0.9} onPress={onAllow} disabled={isRequestingPermission} style={permissionSheetStyles.primaryButton}>
                  <LinearGradient colors={['#C671F4', '#7640F0']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={permissionSheetStyles.primaryButtonGradient} />
                  <View pointerEvents="none" style={permissionSheetStyles.primaryButtonInset} />
                  {isRequestingPermission ? <ActivityIndicator color={colors.white} /> : <Text style={permissionSheetStyles.primaryButtonText}>{STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.CONTINUE}</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </ReusableBottomSheet>
        ))}

        {/* Report / block report sheet */}
        <ReusableBottomSheet isOpen={showReportSheet} onClose={() => { setShowReportSheet(false); setReportSheetMode('report'); setReportMessageInput(''); setSelectedReportReason(null); }} snapPoints={['90%']} showDragHandle showCloseButton={false} enablePanDownToClose backgroundStyle={permissionSheetStyles.sheet} scrollEnabled={true}>
          <View style={reportSheetStyles.content}>
            <View style={reportSheetStyles.iconWrap}><ReportIcon size={40} color={colors.primary.purple} /></View>
            <Text style={reportSheetStyles.title}>Why Report {name}?</Text>
            <View style={reportSheetStyles.reasonsWrap}>
              {REPORT_REASONS.map((reason) => {
                const selected = selectedReportReason === reason.value;
                return (
                  <TouchableOpacity key={reason.value} style={[reportSheetStyles.reasonRow, selected && reportSheetStyles.reasonRowSelected]} onPress={() => setSelectedReportReason(reason.value)} activeOpacity={0.7} disabled={reportSubmitting}>
                    <View style={[reportSheetStyles.reasonCheck, selected && reportSheetStyles.reasonCheckSelected]}>{selected && <InterestChipCheckIcon size={12} color={colors.white} />}</View>
                    <Text style={[reportSheetStyles.reasonLabel, selected && reportSheetStyles.reasonLabelSelected]}>{reason.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TextInput style={reportSheetStyles.optionalInput} placeholder="Tell us the reason.. (optional)" placeholderTextColor={colors.neutral[500]} value={reportMessageInput} onChangeText={setReportMessageInput} multiline numberOfLines={3} textAlignVertical="top" editable={!reportSubmitting} />
            <View style={reportSheetStyles.buttonRow}>
              <TouchableOpacity style={reportSheetStyles.cancelButton} onPress={() => { setShowReportSheet(false); setReportSheetMode('report'); setReportMessageInput(''); setSelectedReportReason(null); }} disabled={reportSubmitting} activeOpacity={0.8}>
                <Text style={reportSheetStyles.cancelButtonLabel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={reportSheetStyles.submitButton} onPress={() => {
                if (!selectedReportReason || !otherUserId) return;
                const mode = reportSheetMode;
                const reasonLabel = REPORT_REASONS.find((r) => r.value === selectedReportReason)?.label ?? selectedReportReason;
                const reportMessage = reportMessageInput.trim() ? `${reasonLabel}\n${reportMessageInput.trim()}` : reasonLabel;
                setReportSubmitting(true);
                const submitPromise = mode === 'blockReport' ? apiClient.post(endpoints.chat.blockreportUser, { targetUserId: otherUserId, reportMessage }) : reportUserApi({ reportedAgainst: otherUserId, reportMessage });
                submitPromise
                  .then(() => {
                    setShowReportSheet(false); setReportSheetMode('report'); setReportMessageInput(''); setSelectedReportReason(null);
                    if (mode === 'blockReport') { showSuccessToast(STRINGS.CHAT.BLOCK_REPORT_SUBMITTED); setTimeout(() => navigation.goBack(), 400); } else showSuccessToast(STRINGS.CHAT.REPORT_SUBMITTED);
                  })
                  .catch(() => showErrorToast(mode === 'blockReport' ? STRINGS.CHAT.BLOCK_REPORT_FAILED : STRINGS.CHAT.REPORT_FAILED))
                  .finally(() => setReportSubmitting(false));
              }} disabled={reportSubmitting || !selectedReportReason} activeOpacity={0.8}>
                <LinearGradient colors={[...colors.gradients.primary.colors]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={reportSheetStyles.submitButtonGradient}>
                  {reportSubmitting ? <ActivityIndicator size="small" color={colors.white} /> : <Text style={reportSheetStyles.submitButtonLabel}>Submit</Text>}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </ReusableBottomSheet>

        {/* More menu */}
        <Modal visible={moreMenuVisible} transparent animationType="fade" onRequestClose={() => setMoreMenuVisible(false)}>
          <TouchableWithoutFeedback onPress={() => setMoreMenuVisible(false)}>
            <View style={styles.moreMenuBackdrop}>
              {moreMenuScreenPos != null ? (
                <TouchableWithoutFeedback onPress={() => {}}>
                  <View style={[styles.moreMenu, { top: moreMenuScreenPos.top, right: moreMenuScreenPos.right }]} collapsable={false}>
                    <TouchableOpacity style={styles.moreMenuItem} onPress={() => { setMoreMenuVisible(false); if (otherUserId) setBlockConfirmVisible(true); }} activeOpacity={0.7}>
                      <View style={styles.moreMenuIconWrap}><BlockIcon size={20} color={colors.black} /></View>
                      <Text style={styles.moreMenuLabel}>Block</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.moreMenuItem} onPress={() => { setMoreMenuVisible(false); if (!otherUserId) return; setReportSheetMode('report'); setReportMessageInput(''); setShowReportSheet(true); }} activeOpacity={0.7}>
                      <View style={[styles.moreMenuIconWrap]}><ReportIcon size={20} color={colors.black} /></View>
                      <Text style={styles.moreMenuLabelReport}>Report</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableWithoutFeedback>
              ) : null}
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Block confirm */}
        <Modal visible={blockConfirmVisible} transparent animationType="slide" onRequestClose={() => setBlockConfirmVisible(false)}>
          <TouchableWithoutFeedback onPress={() => setBlockConfirmVisible(false)}>
            <View style={styles.blockConfirmBackdrop}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.blockConfirmSheet}>
                  <View style={styles.blockConfirmHandle} />
                  <View style={styles.blockConfirmIconWrap}><BlockIcon size={40} color={colors.primary.purple} /></View>
                  <Text style={styles.blockConfirmTitle}>Block {name}?</Text>
                  <Text style={styles.blockConfirmDescription}>They won't be able to message you, see your profile, or send requests. You can unblock them anytime from Settings.</Text>
                  <TouchableOpacity style={styles.blockConfirmButtonBlock} onPress={() => {
                    if (!otherUserId) { setBlockConfirmVisible(false); return; }
                    setBlockConfirmLoading(true);
                    blockUserApi({ blockUserId: otherUserId, type: 'block' })
                      .then(() => { setBlockConfirmVisible(false); showSuccessToast(STRINGS.CHAT.BLOCK_SUCCESS); setTimeout(() => navigation.goBack(), 400); })
                      .catch(() => showErrorToast(STRINGS.CHAT.BLOCK_FAILED))
                      .finally(() => setBlockConfirmLoading(false));
                  }} activeOpacity={0.8} disabled={blockConfirmLoading}>
                    <LinearGradient colors={[...colors.gradients.primary.colors]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.blockConfirmButtonGradient}>
                      {blockConfirmLoading ? <ActivityIndicator size="small" color={colors.white} /> : <Text style={styles.blockConfirmButtonLabelBlock}>Block</Text>}
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.blockConfirmButtonCancel} onPress={() => setBlockConfirmVisible(false)} activeOpacity={0.8} disabled={blockConfirmLoading}>
                    <Text style={styles.blockConfirmButtonLabelCancel}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Image preview */}
        <Modal visible={imagePreviewUri != null} transparent animationType="fade" presentationStyle="overFullScreen" statusBarTranslucent hardwareAccelerated onRequestClose={closeImagePreview}>
          <View style={imagePreviewStyles.backdrop}>
            <View style={[imagePreviewStyles.topBar, { paddingTop: insets.top + 10 }]}>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Close image preview" onPress={closeImagePreview} activeOpacity={0.8} style={imagePreviewStyles.closeButton}>
                <GeneratingCloseIcon size={28} color={colors.white} />
              </TouchableOpacity>
            </View>
            <TouchableWithoutFeedback onPress={closeImagePreview}><View style={StyleSheet.absoluteFill} /></TouchableWithoutFeedback>
            <View style={imagePreviewStyles.content}>
              {imagePreviewUri != null && (
                <View style={imagePreviewStyles.card}>
                  <TouchableWithoutFeedback onPress={() => { const nowTap = Date.now(); const delta = nowTap - (imagePreviewLastTapRef.current || 0); imagePreviewLastTapRef.current = nowTap; if (delta < 260) setImagePreviewZoomed((z) => !z); }}>
                    <Image source={{ uri: imagePreviewUri }} resizeMode="contain" style={[imagePreviewStyles.image, imagePreviewZoomed && imagePreviewStyles.imageZoomed]} />
                  </TouchableWithoutFeedback>
                </View>
              )}
            </View>
          </View>
        </Modal>

        {/* Message context menu (reply / delete) */}
        <Modal visible={messageContextIndex !== null} transparent animationType="fade" onRequestClose={() => setMessageContextIndex(null)}>
          <TouchableWithoutFeedback onPress={() => setMessageContextIndex(null)}>
            <View style={[styles.messageContextBackdrop, messageContextAnchor == null && styles.messageContextBackdropCentered]}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={[styles.messageContextBubble, messageContextAnchor != null && { position: 'absolute', top: messageContextAnchor.top, ...(messageContextAnchor.left != null ? { left: messageContextAnchor.left } : { right: messageContextAnchor.right ?? H_PADDING }) }]}>
                  <TouchableOpacity style={styles.messageContextItem} onPress={() => {
                    if (messageContextIndex !== null) {
                      const message = messages[messageContextIndex];
                      if (message) setReplyingTo({ index: messageContextIndex, message, senderName: message.sent ? STRINGS.CHAT.YOU : name, messageId: message.messageId });
                    }
                    setMessageContextIndex(null);
                    setTimeout(() => inputRef.current?.focus(), 100);
                  }} activeOpacity={0.7}>
                    <ReplyIcon size={20} color={colors.black} />
                    <Text style={styles.messageContextLabel}>{STRINGS.CHAT.REPLY}</Text>
                  </TouchableOpacity>
                  {messageContextIndex !== null && messages[messageContextIndex]?.sent === true && (
                    <TouchableOpacity style={styles.messageContextItemDelete} onPress={() => { setDeleteConfirmIndex(messageContextIndex); setMessageContextIndex(null); }} activeOpacity={0.7}>
                      <DeleteIcon size={20} color={colors.semantic.error} />
                      <Text style={styles.messageContextLabelDelete}>{STRINGS.CHAT.DELETE}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Delete confirm */}
        <Modal visible={deleteConfirmIndex !== null} transparent animationType="slide" onRequestClose={() => setDeleteConfirmIndex(null)}>
          <TouchableWithoutFeedback onPress={() => setDeleteConfirmIndex(null)}>
            <View style={styles.deleteConfirmBackdrop}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.deleteConfirmSheet}>
                  <View style={styles.deleteConfirmHandle} />
                  <Text style={styles.deleteConfirmTitle}>{STRINGS.CHAT.DELETE_MESSAGE_TITLE}</Text>
                  <Text style={styles.deleteConfirmDescription}>{STRINGS.CHAT.DELETE_MESSAGE_DESCRIPTION}</Text>
                  <TouchableOpacity style={styles.deleteConfirmButtonDelete} onPress={() => {
                    if (deleteConfirmIndex === null || !chatId) return;
                    const msg = messages[deleteConfirmIndex];
                    const messageId = msg && 'messageId' in msg ? msg.messageId : undefined;
                    setDeleteConfirmIndex(null);
                    setMessages((prev) => prev.filter((_, i) => i !== deleteConfirmIndex));
                    if (messageId) {
                      deleteMessageApi({ chatId, messageId }).catch(() => {});
                      if (currentUserId && otherUserId) socketService.messageDelete(currentUserId, otherUserId, messageId);
                    }
                  }} activeOpacity={0.8}>
                    <Text style={styles.deleteConfirmButtonLabelDelete}>{STRINGS.CHAT.DELETE}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteConfirmButtonCancel} onPress={() => setDeleteConfirmIndex(null)} activeOpacity={0.8}>
                    <Text style={styles.deleteConfirmButtonLabelCancel}>{STRINGS.CHAT.CANCEL}</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Ask Aira confirm */}
        <Modal visible={askAiraConfirmVisible} transparent animationType="slide" onRequestClose={() => setAskAiraConfirmVisible(false)}>
          <TouchableWithoutFeedback onPress={() => setAskAiraConfirmVisible(false)}>
            <View style={styles.askAiraConfirmBackdrop}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.askAiraConfirmSheet}>
                  <View style={styles.askAiraConfirmHandle} />
                  <View style={styles.askAiraConfirmContent}>
                    <View style={styles.askAiraConfirmIconWrap}><TabAICenterIcon width={52} height={52} /></View>
                    <GradientText style={{ fontSize: 24, fontWeight: '600' }}>Your Reply Assistant</GradientText>
                    <Text style={styles.askAiraConfirmDescription}>Aira reads your recent conversation and suggests replies, that you can send - or tweak - in one tap.</Text>
                  </View>
                  <TouchableOpacity style={styles.askAiraConfirmGenerateButton} onPress={() => { if (!chatId) return; if (dontShowAskAiraAgain) AsyncStorage.setItem(DONT_SHOW_ASK_AIRA_CONFIRM_KEY, 'true').then(() => setDontShowAskAiraPersisted(true)); requestAiSuggestions({ closeConfirmSheetOnStart: true }); }} activeOpacity={0.8} disabled={askAiraConfirmLoading || !chatId}>
                    <LinearGradient colors={[...colors.gradients.primary.colors]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.askAiraConfirmGenerateGradient}>
                      {askAiraConfirmLoading ? <ActivityIndicator size="small" color={colors.white} /> : <Text style={styles.askAiraConfirmGenerateLabel}>Generate</Text>}
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.askAiraConfirmCheckRow} onPress={() => setDontShowAskAiraAgain(!dontShowAskAiraAgain)} activeOpacity={0.8} disabled={askAiraConfirmLoading}>
                    <View style={[styles.askAiraConfirmCheck, dontShowAskAiraAgain && styles.askAiraConfirmCheckSelected]}>{dontShowAskAiraAgain && <InterestChipCheckIcon size={12} color={colors.white} />}</View>
                    <Text style={styles.askAiraConfirmCheckLabel}>Don't show this again</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Aira thinking */}
        <Modal visible={askAiraGenerating} transparent animationType="slide" onRequestClose={handleCancelAiSuggestions}>
          <View style={styles.airaThinkingBackdrop}>
            <View style={styles.airaThinkingSheet}>
              <View style={styles.airaThinkingHeader}>
                <View style={styles.airaThinkingHeaderLeft}>
                  <View style={styles.airaThinkingIconWrap}><AskAiraSendIcon width={20} height={20} /></View>
                  <Text style={styles.airaThinkingTitle}>Aira is thinking...</Text>
                </View>
                <View style={styles.airaThinkingHeaderRight}><InformativeIcon width={14} height={14} color={colors.neutral[700]} /></View>
              </View>
              <View style={styles.airaThinkingSkeletons}>
                {[[100, 130], [100], [100, 268], [100]].map((widths, rowIdx) => (
                  <View key={rowIdx} style={styles.airaThinkingSkeletonRow}>
                    {widths.map((w, i) => <View key={i} style={[styles.airaThinkingSkeleton, { width: w === 100 ? '100%' : w }]} />)}
                  </View>
                ))}
              </View>
              <TouchableOpacity style={styles.airaThinkingCancelButton} onPress={handleCancelAiSuggestions} activeOpacity={0.8}>
                <Text style={styles.airaThinkingCancelLabel}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Aira suggestions */}
        <Modal visible={generatedReplies != null && generatedReplies.length > 0} transparent animationType="slide" onRequestClose={() => { setGeneratedReplies(null); setSelectedReplyIndex(0); }}>
          <TouchableWithoutFeedback onPress={() => { setGeneratedReplies(null); setSelectedReplyIndex(0); }}>
            <View style={styles.airaSuggestionsBackdrop}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.airaSuggestionsSheet}>
                  <View style={styles.airaSuggestionsHandle} />
                  <View style={styles.airaSuggestionsHeader}>
                    <View style={styles.airaSuggestionsHeaderLeft}>
                      <View style={styles.airaThinkingIconWrap}><AskAiraSendIcon width={20} height={20} /></View>
                      <Text style={styles.airaSuggestionsTitle}>Suggestions from Aira</Text>
                    </View>
                    <View style={styles.airaThinkingHeaderRight}>
                      <Text style={styles.airaThinkingLeftCount}>{airaSuggestionsLimitLeft != null && airaSuggestionsTotalLimit != null ? `${airaSuggestionsLimitLeft}/${airaSuggestionsTotalLimit} left` : `${generatedReplies?.length ?? 0} suggestion${(generatedReplies?.length ?? 0) !== 1 ? 's' : ''}`}</Text>
                      <InformativeIcon width={14} height={14} color={colors.neutral[700]} />
                    </View>
                  </View>
                  <Text style={styles.airaSuggestionsListLabel}>Suggestions</Text>
                  <ScrollView style={styles.airaSuggestionsList} contentContainerStyle={styles.airaSuggestionsListContent} showsVerticalScrollIndicator={false}>
                    {generatedReplies?.map((text, index) => {
                      const selected = index === selectedReplyIndex;
                      return (
                        <TouchableOpacity key={index} style={[styles.airaSuggestionCard, selected && styles.airaSuggestionCardSelected]} onPress={() => setSelectedReplyIndex(index)} activeOpacity={0.8}>
                          <Text style={[styles.airaSuggestionCardText, selected && styles.airaSuggestionCardTextSelected]} numberOfLines={4}>{text}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                  <TouchableOpacity style={styles.airaSuggestionsInsertButton} onPress={handleInsertReply} activeOpacity={0.8}>
                    <LinearGradient colors={[...colors.gradients.primary.colors]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.airaSuggestionsInsertGradient}>
                      <Text style={styles.airaSuggestionsInsertLabel}>Insert</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Aira limit reached */}
        <Modal visible={airaLimitReachedVisible} transparent animationType="slide" onRequestClose={() => setAiraLimitReachedVisible(false)}>
          <TouchableWithoutFeedback onPress={() => setAiraLimitReachedVisible(false)}>
            <View style={styles.airaLimitBackdrop}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.airaLimitSheet}>
                  <View style={styles.airaLimitHandle} />
                  <View style={styles.airaLimitContent}>
                    <Text style={styles.airaLimitTitle}>You're out of Aira suggestions</Text>
                    <Text style={styles.airaLimitDescription}>You've used all {airaSuggestionsTotalLimit ?? 3} for today. Come back in</Text>
                  </View>
                  <View style={styles.airaLimitCountdownRow}>
                    {[airaLimitCountdown.hours, airaLimitCountdown.minutes, airaLimitCountdown.seconds].map((val, i) => (
                      <React.Fragment key={i}>
                        {i > 0 && <Text style={styles.airaLimitCountdownColon}>:</Text>}
                        <View style={styles.airaLimitCountdownPill}>
                          <Text style={styles.airaLimitCountdownText}>{String(val).padStart(2, '0')}{['h', 'm', 's'][i]}</Text>
                        </View>
                      </React.Fragment>
                    ))}
                  </View>
                  <TouchableOpacity style={styles.airaLimitOkayButton} onPress={() => setAiraLimitReachedVisible(false)} activeOpacity={0.8}>
                    <LinearGradient colors={[...colors.gradients.primary.colors]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.airaLimitOkayGradient}>
                      <Text style={styles.airaLimitOkayLabel}>Okay</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const permissionSheetStyles = StyleSheet.create({
  backdrop: { backgroundColor: 'rgba(0,0,0,0.6)' },
  dragHandleContainer: { paddingTop: 12, paddingBottom: 0 },
  dragHandle: { backgroundColor: '#CCCCCC' },
  sheet: { backgroundColor: colors.white, borderRadius: 32, left: 8, right: 8, bottom: 8, overflow: 'hidden' },
  content: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 16 },
  title: { fontSize: 24, fontWeight: '500', fontFamily: typography.fontFamily.medium, color: colors.neutral[900], textAlign: 'center', marginBottom: 8 },
  description: { fontSize: 16, fontWeight: '400', fontFamily: typography.fontFamily.regular, color: '#999999', textAlign: 'center', lineHeight: 24, marginBottom: 24 },
  actions: { gap: 8 },
  primaryButton: { height: 56, width: '100%', borderRadius: 100, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  primaryButtonGradient: { ...StyleSheet.absoluteFillObject },
  primaryButtonInset: { ...StyleSheet.absoluteFillObject, borderRadius: 100, shadowColor: '#FFFFFF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.35, shadowRadius: 10, opacity: 0.6 },
  primaryButtonText: { fontSize: 16, fontWeight: '500', fontFamily: typography.fontFamily.medium, color: colors.white, letterSpacing: 0.32 },
  secondaryButton: { height: 56, width: '100%', borderRadius: 100, backgroundColor: 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  secondaryButtonText: { fontSize: 16, fontWeight: '500', fontFamily: typography.fontFamily.medium, color: colors.black, letterSpacing: 0.32 },
});

const reportSheetStyles = StyleSheet.create({
  content: { paddingHorizontal: 10, paddingTop: 8, paddingBottom: 32, flex: 1 },
  iconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary[50], alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '500', fontFamily: typography.fontFamily.medium, color: colors.black, textAlign: 'center', marginBottom: 16 },
  reasonsWrap: { marginBottom: 16 },
  reasonRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 10, borderRadius: 10, borderWidth: 1, borderColor: colors.neutral[100], marginBottom: 8, gap: 8 },
  reasonRowSelected: { backgroundColor: colors.primary[50], borderColor: colors.primary[50] },
  reasonCheck: { width: 20, height: 20, borderRadius: 4, borderWidth: 1, borderColor: colors.neutral[300], alignItems: 'center', justifyContent: 'center' },
  reasonCheckSelected: { backgroundColor: colors.primary.purple, borderColor: colors.primary.purple },
  reasonLabel: { fontSize: 14, fontWeight: '500', fontFamily: typography.fontFamily.medium, color: colors.neutral[800], flex: 1 },
  reasonLabelSelected: { color: colors.primary.purple },
  optionalInput: { borderWidth: 1, borderColor: colors.neutral[100], borderRadius: 20, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16, fontSize: 16, fontFamily: typography.fontFamily.regular, color: colors.neutral[900], minHeight: 88, marginBottom: 24 },
  buttonRow: { flexDirection: 'row', gap: 8 },
  cancelButton: { flex: 1, height: 54, borderRadius: 100, backgroundColor: 'rgba(0,0,0,0.05)', alignItems: 'center', justifyContent: 'center' },
  cancelButtonLabel: { fontSize: 16, fontWeight: '500', fontFamily: typography.fontFamily.medium, color: colors.black },
  submitButton: { flex: 1, height: 54, borderRadius: 100, overflow: 'hidden' },
  submitButtonGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  submitButtonLabel: { fontSize: 16, fontWeight: '500', fontFamily: typography.fontFamily.medium, color: colors.white },
});

const imagePreviewStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)' },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 3, alignItems: 'flex-end', paddingHorizontal: 12, paddingBottom: 10 },
  closeButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: { width: '100%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%' },
  imageZoomed: { transform: [{ scale: 2 }] },
});
