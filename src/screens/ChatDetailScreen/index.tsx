import React, { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Image,
  ScrollView,
  TextInput,
  Keyboard,
  Platform,
  Modal,
  PanResponder,
  TouchableWithoutFeedback,
  StyleSheet,
  Alert,
  Linking,
  StatusBar,
  AppState,
  ActivityIndicator,
  LayoutChangeEvent,
  useWindowDimensions,
  type ImageSourcePropType,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets, initialWindowMetrics } from 'react-native-safe-area-context';
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
import { IncomingCallNotificationIcon } from '../../assets/icons/common/IncomingCallNotificationIcon';
import { AudioBluetoothIcon } from '../../assets/icons/common/AudioBluetoothIcon';
import { AudioEarpieceIcon } from '../../assets/icons/common/AudioEarpieceIcon';
import { AudioOptionCheckIcon } from '../../assets/icons/common/AudioOptionCheckIcon';
import { CameraFlipIcon } from '../../assets/icons/common/CameraFlipIcon';
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
import { CALL_RING_TIMEOUT_MS } from '../../constants/call';
import {
  markCallTerminated as markGlobalCallTerminated,
  clearCallTerminated as clearGlobalCallTerminated,
  isCallTerminated as isGlobalCallTerminated,
  onCallTerminated,
} from '../../services/call/callSessionRegistry';
import { buildCallLogBubbleLayout } from '../../modules/chat/callLogLayout';
import { colors, typography } from '../../theme';
import type { ChatStackParamList } from '../../navigation/types';
import { navigateToSubscription } from '../../navigation/navigateToSubscription';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { setChatRequestActionApi, blockUserApi, reportUserApi, getChatMessagesApi, mapApiMessageToChatMessage, markChatSeenApi, sendMessageApi, uploadChatFileApi, postAIMessagesApi, getAiSuggestionsApi, deleteMessageApi, extractChatMessageFromSendResponse, type ChatMessageApiItem } from '../../modules/chat/api';
import { useAuthStore } from '../../store/auth.store';
import { useSubscriptionStore } from '../../store/subscription.store';
import socketService, {
  type MessageReceivePayload,
  type MessageDeletePayload,
  type TypingPayload,
  type IncomingCallPayload,
  type CallLifecyclePayload,
  type CallRequestSentPayload,
  type CallFailedPayload,
  type CallPartnerAudioPayload,
  type CallPartnerVideoPayload,
  type CallSwitchRequestPayload,
  type CallSwitchAppliedPayload,
} from '../../services/socket/socketService';
import { agoraCallService } from '../../services/call/agoraCallService';
import {
  startIncomingCallRing,
  startOutgoingCallRingback,
  stopCallRing,
} from '../../services/call/callRingtoneService';
import { styles, H_PADDING } from './styles';
import { TabAICenterIcon } from '../../assets/icons/tabs/TabAICenterIcon';
import { apiClient } from '../../services/api/client';
import { endpoints } from '../../services/api/endpoints';
import { showErrorToast, showSuccessToast } from '../../services/toast.srvice';
import type { ChatMessage, PendingAttachment } from './types';
import { ComposerAttachmentPreviews } from './components/ComposerAttachmentPreviews';
import { ChatMessagesSkeleton } from './components/ChatMessagesSkeleton';
import { ChatBubbleImage } from './components/ChatBubbleImage';
import {
  now,
  extractChatIdFromAddChatResponse,
  firstNonEmptyString,
  formatMessageTimestamp,
} from './utils/helpers';
import { CHAT_IMAGE_PICKER_OPTIONS } from './utils/chatMedia';
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

type CallUiSnapshot = {
  activeCallId: string | null;
  activeCallMode: ActiveCallMode;
  incomingVoiceCallId: string | null;
  incomingVideoCallId: string | null;
  incomingCallBannerVisible: boolean;
  incomingVoiceCallVisible: boolean;
  incomingVideoCallVisible: boolean;
  callStateVisible: boolean;
  isOutgoingVoiceRinging: boolean;
  callConnectedAtMs: number | null;
  chatId: string | null;
  currentUserId?: string;
  otherUserId?: string;
};

function callParticipantsMatch(
  payload: { callerId?: string; receiverId?: string; endedBy?: string; chatId?: string },
  snap: CallUiSnapshot,
): boolean {
  const payloadChatId = payload.chatId?.trim();
  const screenChatId = snap.chatId?.trim();
  if (payloadChatId && screenChatId) {
    return payloadChatId === screenChatId;
  }
  const me = snap.currentUserId?.trim();
  const other = snap.otherUserId?.trim();
  if (!me || !other) return false;
  const ids = [payload.callerId, payload.receiverId, payload.endedBy]
    .map((id) => id?.trim())
    .filter(Boolean) as string[];
  return ids.includes(me) && ids.includes(other);
}

/** True when a call lifecycle socket event should update this chat screen. */
function isCallLifecycleRelevant(payload: CallLifecyclePayload, snap: CallUiSnapshot): boolean {
  const callId = payload.callId?.trim() ?? '';
  const trackedIds = [snap.activeCallId, snap.incomingVoiceCallId, snap.incomingVideoCallId]
    .map((id) => id?.trim() ?? '')
    .filter(Boolean);

  if (callId && trackedIds.includes(callId)) return true;

  const hasIncomingUi =
    snap.incomingCallBannerVisible || snap.incomingVoiceCallVisible || snap.incomingVideoCallVisible;
  const hasCallSession =
    snap.callStateVisible || snap.isOutgoingVoiceRinging || Boolean(snap.activeCallId?.trim());

  if (!hasIncomingUi && !hasCallSession) return false;

  if (callParticipantsMatch(payload, snap) && (hasIncomingUi || hasCallSession)) {
    return true;
  }

  if (callId) {
    if (trackedIds.length > 0) return false;
    return callParticipantsMatch(payload, snap);
  }

  return callParticipantsMatch(payload, snap) || trackedIds.length > 0;
}

const CALL_LOG_STATUS_PRIORITY: Record<string, number> = {
  REJECTED: 40,
  DECLINED: 40,
  NO_ANSWER: 30,
  TIMEOUT: 30,
  TIMED_OUT: 30,
  CANCELLED: 25,
  CANCELED: 25,
  MISSED: 20,
  ENDED: 10,
};

function callLogStatusPriority(status: string): number {
  return CALL_LOG_STATUS_PRIORITY[status.toUpperCase()] ?? 0;
}

/** Keep client call-log rows until the API returns the matching `system_call` message. */
function mergeApiMessagesWithPendingCallLogs(
  apiMessages: ChatMessage[],
  previousMessages: ChatMessage[],
): ChatMessage[] {
  const persistedCallIds = new Set(
    apiMessages
      .filter((m): m is Extract<ChatMessage, { type: 'call_log' }> => m.type === 'call_log')
      .map((m) => m.callId.trim())
      .filter((id) => id.length > 0),
  );

  const pendingCallLogs = previousMessages.filter(
    (m): m is Extract<ChatMessage, { type: 'call_log' }> =>
      m.type === 'call_log' &&
      !m.messageId &&
      m.callId.trim().length > 0 &&
      !persistedCallIds.has(m.callId.trim()),
  );

  if (pendingCallLogs.length === 0) return apiMessages;
  return [...apiMessages, ...pendingCallLogs];
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
  // Tab navigator passes safeAreaInsets.bottom = 0; use device inset for home indicator.
  const bottomSafeInset = Math.max(
    insets.bottom,
    initialWindowMetrics?.insets.bottom ?? 0,
    Platform.OS === 'ios' ? 34 : 0,
  );
  const imageBubbleSize = Math.max(160, Math.min(Math.round(windowWidth * 0.75), 320));
  const currentUserId = useAuthStore((s) => s.user?.id);
  const isSubscribed = useSubscriptionStore((s) => s.isSubscribed);

  const ensurePremiumAccess = useCallback((): boolean => {
    if (isSubscribed) return true;
    navigateToSubscription(navigation);
    return false;
  }, [isSubscribed, navigation]);

  const [chatId, setChatId] = useState<string | null>(initialChatId ?? null);
  const [name, setName] = useState<string>(initialName ?? 'Chat');
  const [avatar, setAvatar] = useState<typeof initialAvatar | undefined>(initialAvatar);
  const [partnerAvatar, setPartnerAvatar] = useState<typeof initialAvatar | undefined>(initialAvatar);
  const partnerDisplaySource = useMemo(
    () => resolvePartnerDisplaySource(partnerAvatar),
    [partnerAvatar],
  );
  const currentUser = useAuthStore((s) => s.user);
  const localVideoPreviewFallback = useMemo((): ImageSourcePropType => {
    const u = currentUser;
    if (!u) return DEFAULT_PARTNER_AVATAR;
    const direct = typeof u.profilePicture === 'string' ? u.profilePicture.trim() : '';
    if (direct) return { uri: direct };
    const url = u.profilePhoto?.url as { medium?: unknown; original?: unknown; thumb?: unknown } | undefined;
    const picked = firstNonEmptyString(url?.medium, url?.original, url?.thumb);
    if (picked) return { uri: picked };
    return DEFAULT_PARTNER_AVATAR;
  }, [currentUser]);
  const outgoingCallMeta = useMemo(() => {
    const callerName = firstNonEmptyString((currentUser as any)?.name);
    const photoUrl = firstNonEmptyString(
      (currentUser as any)?.profilePicture,
      (currentUser as any)?.profilePhoto?.url?.medium,
      (currentUser as any)?.profilePhoto?.url?.original,
      (currentUser as any)?.profilePhoto?.url?.thumb,
    );
    return {
      callerName: callerName ?? undefined,
      callerAvatar: photoUrl ?? undefined,
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

  /** Reload page-1 messages (e.g. after call ended / rejected) so `system_call` rows appear without leaving the screen. */
  const refreshChatMessagesFromApi = useCallback(() => {
    if (!chatId) return;
    void getChatMessagesApi({ chatId, page: 1, limit: MESSAGES_PAGE_SIZE })
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
        setMessages((prev) => mergeApiMessagesWithPendingCallLogs(list, prev));
        const meta = res.data?.meta;
        const currentPage = meta?.currentPage ?? meta?.pageNo ?? 1;
        const totalPages = meta?.totalPages ?? 1;
        setMessagesPage(currentPage);
        setMessagesHasMore(currentPage < totalPages);
      })
      .catch(() => {});
  }, [chatId, currentUserId]);

  const callLogRefreshTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearCallLogRefreshTimers = useCallback(() => {
    callLogRefreshTimersRef.current.forEach(clearTimeout);
    callLogRefreshTimersRef.current = [];
  }, []);

  /** Backend call logs can arrive slightly after the socket event — retry fetch a few times. */
  const refreshChatMessagesAfterCall = useCallback(() => {
    clearCallLogRefreshTimers();
    const delays = [400, 1000, 2000, 4000];
    callLogRefreshTimersRef.current = delays.map((delay) =>
      setTimeout(() => refreshChatMessagesFromApi(), delay),
    );
  }, [clearCallLogRefreshTimers, refreshChatMessagesFromApi]);

  useEffect(() => () => clearCallLogRefreshTimers(), [clearCallLogRefreshTimers]);

  const upsertOptimisticCallLog = useCallback(
    (params: {
      callId: string;
      callType: 'audio' | 'video';
      callStatus: string;
      sent: boolean;
    }) => {
      const id = params.callId.trim();
      if (!id) return;
      const nextPriority = callLogStatusPriority(params.callStatus);
      const timestamp = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      setMessages((prev) => {
        const persisted = prev.find((m) => m.type === 'call_log' && m.callId === id && m.messageId);
        if (persisted) return prev;

        const existingOptimistic = prev.find(
          (m) => m.type === 'call_log' && m.callId === id && !m.messageId,
        );
        if (
          existingOptimistic &&
          callLogStatusPriority(existingOptimistic.callStatus) >= nextPriority
        ) {
          return prev;
        }

        const withoutStaleOptimistic = prev.filter(
          (m) => !(m.type === 'call_log' && m.callId === id && !m.messageId),
        );
        const entry: ChatMessage = {
          type: 'call_log',
          callId: id,
          callType: params.callType,
          callStatus: params.callStatus,
          durationSec: 0,
          label: '',
          displayAsSummaryLine: false,
          timestamp,
          sent: params.sent,
        };
        return [...withoutStaleOptimistic, entry];
      });
    },
    [],
  );

  const upsertOptimisticCallLogRef = useRef(upsertOptimisticCallLog);
  upsertOptimisticCallLogRef.current = upsertOptimisticCallLog;
  const refreshChatMessagesAfterCallRef = useRef(refreshChatMessagesAfterCall);
  refreshChatMessagesAfterCallRef.current = refreshChatMessagesAfterCall;
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
  const [incomingCallBannerVisible, setIncomingCallBannerVisible] = useState(false);
  const [incomingCallBannerMode, setIncomingCallBannerMode] = useState<ActiveCallMode>('voice');
  const [incomingVideoCallVisible, setIncomingVideoCallVisible] = useState(false);
  const [incomingVideoCallerName, setIncomingVideoCallerName] = useState('');
  const [incomingVideoCallId, setIncomingVideoCallId] = useState<string | null>(null);
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [activeCallChannelName, setActiveCallChannelName] = useState<string | null>(null);
  const [activeCallRtcToken, setActiveCallRtcToken] = useState<string | null>(null);
  const [localRtcUid, setLocalRtcUid] = useState<number>(0);
  const [remoteRtcUid, setRemoteRtcUid] = useState<number | null>(null);
  const [isOutgoingVoiceRinging, setIsOutgoingVoiceRinging] = useState(false);
  const [isSwitchingVoiceToVideo, setIsSwitchingVoiceToVideo] = useState(false);
  const [callConnectedAtMs, setCallConnectedAtMs] = useState<number | null>(null);
  const [callDurationSec, setCallDurationSec] = useState(0);
  const [audioDeviceSheetVisible, setAudioDeviceSheetVisible] = useState(false);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<AudioDevice>('earpiece');
  const [switchToVideoPopupVisible, setSwitchToVideoPopupVisible] = useState(false);
  const [incomingCallSwitchRequestVisible, setIncomingCallSwitchRequestVisible] = useState(false);
  const [callMediaResumeNonce, setCallMediaResumeNonce] = useState(0);
  const selectedAudioDeviceRef = useRef<AudioDevice>('earpiece');
  selectedAudioDeviceRef.current = selectedAudioDevice;
  const callVideoEnabledRef = useRef(callVideoEnabled);
  callVideoEnabledRef.current = callVideoEnabled;
  const AgoraRtcSurfaceView = useMemo(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires,global-require
      const mod = require('react-native-agora');
      return (mod?.RtcSurfaceView ?? mod?.default?.RtcSurfaceView ?? null) as React.ComponentType<any> | null;
    } catch {
      return null;
    }
  }, []);
  const callStateVisibleRef = useRef(callStateVisible);
  callStateVisibleRef.current = callStateVisible;
  const callConnectedAtMsRef = useRef(callConnectedAtMs);
  callConnectedAtMsRef.current = callConnectedAtMs;

  useEffect(() => {
    callUiRef.current = {
      activeCallId,
      activeCallMode,
      incomingVoiceCallId,
      incomingVideoCallId,
      incomingCallBannerVisible,
      incomingVoiceCallVisible,
      incomingVideoCallVisible,
      callStateVisible,
      isOutgoingVoiceRinging,
      callConnectedAtMs,
      chatId,
      currentUserId: currentUserId ?? undefined,
      otherUserId,
    };
  }, [
    activeCallId,
    activeCallMode,
    incomingVoiceCallId,
    incomingVideoCallId,
    incomingCallBannerVisible,
    incomingVoiceCallVisible,
    incomingVideoCallVisible,
    callStateVisible,
    isOutgoingVoiceRinging,
    callConnectedAtMs,
    chatId,
    currentUserId,
    otherUserId,
  ]);

  const dismissIncomingCallUi = useCallback((options?: { clearPendingRtc?: boolean }) => {
    void stopCallRing();
    const snap = callUiRef.current;
    const incomingId = snap.incomingVideoCallId ?? snap.incomingVoiceCallId;
    const incomingMode: ActiveCallMode | undefined = snap.incomingVideoCallId
      ? 'video'
      : snap.incomingVoiceCallId
        ? 'voice'
        : undefined;
    if (incomingId?.trim()) {
      const trimmed = incomingId.trim();
      handledIncomingCallIdsRef.current.add(trimmed);
      if (incomingMode) {
        handledIncomingCallRef.current = `${incomingMode}:${trimmed}`;
      }
    }
    setIncomingVoiceCallVisible(false);
    setIncomingVideoCallVisible(false);
    setIncomingCallBannerVisible(false);
    setIncomingVoiceCallId(null);
    setIncomingVideoCallId(null);
    setIncomingVoiceCallerName('');
    setIncomingVideoCallerName('');
    if (options?.clearPendingRtc !== false && !callStateVisibleRef.current) {
      setActiveCallId(null);
      setActiveCallChannelName(null);
      setActiveCallRtcToken(null);
    }
  }, []);

  const clearOutgoingRingTimer = useCallback(() => {
    if (outgoingRingTimerRef.current) {
      clearTimeout(outgoingRingTimerRef.current);
      outgoingRingTimerRef.current = null;
    }
  }, []);

  const markCallTerminated = useCallback(
    (callId?: string | null) => {
      const id = callId?.trim();
      if (!id) return;
      markGlobalCallTerminated(id);
      clearOutgoingRingTimer();
    },
    [clearOutgoingRingTimer],
  );

  const registerHandledIncomingCall = useCallback((callId?: string | null, mode?: ActiveCallMode) => {
    const id = callId?.trim();
    if (!id) return;
    handledIncomingCallIdsRef.current.add(id);
    if (mode) {
      handledIncomingCallRef.current = `${mode}:${id}`;
    }
  }, []);

  const isCallTerminated = useCallback((callId?: string | null) => {
    return isGlobalCallTerminated(callId);
  }, []);

  /** Bottom chrome + PIP (Figma 812). SafeAreaView already applies `bottom` inset — do not add insets.bottom again. */
  const videoControlsApproxHeight = Math.round((68 / 812) * windowHeight);
  const videoBottomChromeOffset = Math.max(10, Math.round((28 / 812) * windowHeight));
  const videoPipGapAboveControls = Math.round((16 / 812) * windowHeight);
  const videoPipBottom =
    videoBottomChromeOffset + videoControlsApproxHeight + videoPipGapAboveControls;
  const videoPipBottomWhenUiHidden = Math.max(12, Math.round((20 / 812) * windowHeight));
  const videoAudioPopoverLeft = Math.max(16, Math.round((71 / 375) * windowWidth));
  const videoAudioPopoverBottom = videoBottomChromeOffset + videoControlsApproxHeight + 10;
  /** Figma Video Call (375×812): local PIP 127×200, 16pt from trailing edge; flip icon 20pt @ ~16pt inset. */
  const videoPipWidth = Math.round((127 / 375) * windowWidth);
  const videoPipHeight = Math.round((200 / 812) * windowHeight);
  const videoPipRight = Math.max(12, Math.round((16 / 375) * windowWidth));
  const videoPipFlipInsetX = Math.max(10, Math.round((16 / 375) * windowWidth));
  const videoPipFlipInsetY = Math.max(10, Math.round((16 / 812) * windowHeight));
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

  const ensureMicrophoneForCall = useCallback(async (): Promise<boolean> => {
    const status = await checkMicrophonePermission();
    if (status === 'granted') return true;
    const requested = await requestMicrophonePermission();
    if (requested === 'granted') return true;
    showSettingsAlert('microphone');
    return false;
  }, []);

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
  /** Active media uploads in chat (WhatsApp-style — loader on bubble, not composer). */
  const [pendingMediaUploadCount, setPendingMediaUploadCount] = useState(0);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [otherUserOnline, setOtherUserOnline] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [composerHeight, setComposerHeight] = useState(120);
  /** Multiline layout (card + bottom-aligned +) — text-based only, never from measured height. */
  const isMultilineComposer = useMemo(
    () => inputText.includes('\n') || pendingAttachments.length > 0,
    [inputText, pendingAttachments.length],
  );
  const composerSelectionRef = useRef({ start: 0, end: 0 });
  const [imagePreviewUri, setImagePreviewUri] = useState<string | null>(null);
  const [imagePreviewZoomed, setImagePreviewZoomed] = useState(false);
  const imagePreviewLastTapRef = useRef<number>(0);
  const typingStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const otherUserTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handledIncomingRouteCallRef = useRef<string | null>(null);
  const handledIncomingCallRef = useRef<string | null>(null);
  const handledIncomingCallIdsRef = useRef<Set<string>>(new Set());
  const outgoingRingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callUiRef = useRef<CallUiSnapshot>({
    activeCallId: null,
    activeCallMode: 'voice',
    incomingVoiceCallId: null,
    incomingVideoCallId: null,
    incomingCallBannerVisible: false,
    incomingVoiceCallVisible: false,
    incomingVideoCallVisible: false,
    callStateVisible: false,
    isOutgoingVoiceRinging: false,
    callConnectedAtMs: null,
    chatId: null,
    currentUserId: undefined,
    otherUserId: undefined,
  });
  const inputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const { composerBottomOffset, isKeyboardVisible, resetKeyboard } = useKeyboardOffset({
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
  } = useAiraSuggestions({ chatId, setInputText, canUseAiraSuggestions: isSubscribed });
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
  const bumpScrollAfterLocalSendRef = useRef(bumpScrollAfterLocalSend);
  bumpScrollAfterLocalSendRef.current = bumpScrollAfterLocalSend;

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

  const scrollToBottom = useCallback((animated = true) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated });
    }, 50);
  }, []);

  useEffect(() => {
    if (!isSubscribed || composerBottomOffset <= 0) return;
    scrollToBottom(true);
  }, [isSubscribed, composerBottomOffset, composerHeight, scrollToBottom]);

  useFocusEffect(
    useCallback(() => {
      if (chatId) {
        socketService.ensureConnected();
        socketService.join(chatId);
      }
      return () => {
        voice.resetVoiceState();
        resetKeyboard();
        Keyboard.dismiss();
      };
    }, [chatId, voice.resetVoiceState, resetKeyboard])
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

  const storeIncomingCallRtc = useCallback((payload: IncomingCallPayload) => {
    const channelName = String(payload.channelName ?? '').trim();
    if (channelName) {
      setActiveCallChannelName(channelName);
    }
    const rtcToken = String(payload.rtcToken ?? '').trim();
    if (rtcToken) {
      setActiveCallRtcToken(rtcToken);
    }
  }, []);

  const parseIncomingCallPayload = useCallback(
    (data: IncomingCallPayload): IncomingCallPrompt | null => {
      if (otherUserId && data.senderId && data.senderId !== otherUserId) {
        return null;
      }
      const mode: ActiveCallMode = data.callType === 'video' ? 'video' : 'voice';
      const rawCallerName = String(data.callerName ?? '').trim();
      const fallbackName = String(name ?? '').trim();
      const callerName =
        rawCallerName || (fallbackName && fallbackName !== 'Chat' ? fallbackName : 'Incoming call');
      return {
        callerName,
        mode,
        callId: data.callId,
      };
    },
    [name, otherUserId]
  );

  const openIncomingCallPrompt = useCallback((incoming: IncomingCallPrompt) => {
    if (incoming.callerName && incoming.callerName !== 'Incoming call') {
      setName((prev) => {
        const current = String(prev ?? '').trim();
        if (!current || current === 'Chat' || current === 'Incoming call') {
          return incoming.callerName;
        }
        return prev;
      });
    }
    if (incoming.mode === 'video') {
      setIncomingVideoCallerName(incoming.callerName);
      setIncomingVideoCallId(incoming.callId ?? null);
      setIncomingVideoCallVisible(true);
      void startIncomingCallRing();
      return;
    }
    setIncomingVoiceCallerName(incoming.callerName);
    setIncomingVoiceCallId(incoming.callId ?? null);
    setIncomingVoiceCallVisible(true);
    void startIncomingCallRing();
  }, []);

  const openIncomingCallFromBanner = useCallback(() => {
    setIncomingCallBannerVisible(false);
    setIncomingVoiceCallVisible(incomingCallBannerMode === 'voice');
    setIncomingVideoCallVisible(incomingCallBannerMode === 'video');
  }, [incomingCallBannerMode]);

  const showIncomingCallBanner = useCallback(
    (incoming: IncomingCallPrompt, rtc?: Pick<IncomingCallPayload, 'channelName' | 'rtcToken'>) => {
      if (rtc) {
        storeIncomingCallRtc(rtc);
      }
      if (incoming.callerName && incoming.callerName !== 'Incoming call') {
        setName((prev) => {
          const current = String(prev ?? '').trim();
          if (!current || current === 'Chat' || current === 'Incoming call') {
            return incoming.callerName;
          }
          return prev;
        });
      }

      setIncomingCallBannerMode(incoming.mode);
      if (incoming.mode === 'video') {
        setIncomingVideoCallerName(incoming.callerName);
        setIncomingVideoCallId(incoming.callId ?? null);
        setIncomingVoiceCallerName('');
        setIncomingVoiceCallId(null);
      } else {
        setIncomingVoiceCallerName(incoming.callerName);
        setIncomingVoiceCallId(incoming.callId ?? null);
        setIncomingVideoCallerName('');
        setIncomingVideoCallId(null);
      }

      // Hide full-screen incoming modals; banner is the first UX step.
      setIncomingVoiceCallVisible(false);
      setIncomingVideoCallVisible(false);
      setIncomingCallBannerVisible(true);
      void startIncomingCallRing();
    },
    [storeIncomingCallRtc],
  );

  useEffect(() => {
    const incomingFromRoute = route.params?.incomingCall ?? initialIncomingCall;
    if (!incomingFromRoute) return;
    const dedupeKey = `${incomingFromRoute.callId ?? 'no-call-id'}:${incomingFromRoute.mode}:${incomingFromRoute.senderId ?? ''}`;
    if (handledIncomingRouteCallRef.current === dedupeKey) return;
    if (incomingFromRoute.callId && isGlobalCallTerminated(incomingFromRoute.callId)) {
      handledIncomingRouteCallRef.current = dedupeKey;
      return;
    }
    handledIncomingRouteCallRef.current = dedupeKey;

    if (incomingFromRoute.senderId && !otherUserId) {
      setOtherUserId(incomingFromRoute.senderId);
    }
    if (incomingFromRoute.callerName && (!name || name === 'Chat')) {
      setName(incomingFromRoute.callerName);
    }
    if (incomingFromRoute.channelName) {
      setActiveCallChannelName(incomingFromRoute.channelName);
    }
    if (incomingFromRoute.rtcToken) {
      setActiveCallRtcToken(incomingFromRoute.rtcToken);
    }

    const key = `${incomingFromRoute.mode}:${incomingFromRoute.callId ?? ''}`;
    handledIncomingCallRef.current = key;

      showIncomingCallBanner({
        mode: incomingFromRoute.mode,
        callerName: incomingFromRoute.callerName ?? name ?? 'Incoming call',
        callId: incomingFromRoute.callId,
      }, {
        channelName: incomingFromRoute.channelName,
        rtcToken: incomingFromRoute.rtcToken,
      });
  }, [initialIncomingCall, name, otherUserId, route.params, showIncomingCallBanner]);


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
          if (picked) {
            const resolvedPartnerAvatar = { uri: picked } as any;
            setPartnerAvatar(resolvedPartnerAvatar);
            if (!avatar) setAvatar(resolvedPartnerAvatar);
          } else {
            setPartnerAvatar(undefined);
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
    const shouldRefetchMessagesAfterCall = (p: { chatId?: string; callerId?: string; receiverId?: string }) => {
      if (!chatId) return false;
      const pch = p.chatId?.trim();
      if (pch) return pch === chatId.trim();
      const me = currentUserId?.trim();
      const other = otherUserId?.trim();
      const a = p.callerId?.trim();
      const b = p.receiverId?.trim();
      if (me && other && a && b) {
        return (a === me || b === me) && (a === other || b === other);
      }
      return true;
    };

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
        socketService.ensureConnected();
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
      storeIncomingCallRtc(payload);
      const parsed = parseIncomingCallPayload(payload);
      if (!parsed) return;
      const incomingCallId = parsed.callId?.trim();
      if (incomingCallId && handledIncomingCallIdsRef.current.has(incomingCallId)) return;
      if (incomingCallId && isGlobalCallTerminated(incomingCallId)) return;

      const snap = callUiRef.current;
      if (snap.callStateVisible) return;
      if (parsed.mode === 'voice' && snap.incomingVoiceCallVisible) return;
      if (parsed.mode === 'video' && snap.incomingVideoCallVisible) return;
      if (snap.incomingCallBannerVisible && parsed.callId) {
        const pendingId = snap.incomingVoiceCallId ?? snap.incomingVideoCallId;
        if (pendingId && pendingId === parsed.callId) return;
      }
      const key = `${parsed.mode}:${parsed.callId ?? ''}`;
      if (handledIncomingCallRef.current === key) return;
      handledIncomingCallRef.current = key;

      showIncomingCallBanner(parsed, payload);
    };
    const onCallAccepted = (payload: CallLifecyclePayload) => {
      if (!payload.callId) return;
      void stopCallRing();
      const acceptedId = payload.callId.trim();
      if (acceptedId) {
        clearGlobalCallTerminated(acceptedId);
      }
      if (outgoingRingTimerRef.current) {
        clearTimeout(outgoingRingTimerRef.current);
        outgoingRingTimerRef.current = null;
      }
      setActiveCallId(payload.callId);
      setActiveCallChannelName(payload.channelName ?? null);
      setActiveCallRtcToken(payload.rtcToken ?? null);
      if (payload.callType) {
        const mode: ActiveCallMode = payload.callType === 'video' ? 'video' : 'voice';
        setActiveCallMode(mode);
        setCallVideoEnabled(mode === 'video');
      }
      setIsSwitchingVoiceToVideo(false);
      setAudioDeviceSheetVisible(false);
      setSelectedAudioDevice('earpiece');
      setPartnerAudioEnabled(true);
      setPartnerVideoEnabled(true);
      setIsOutgoingVoiceRinging(false);
      setCallConnectedAtMs(Date.now());
      setCallStateVisible(true);
      dismissIncomingCallUi({ clearPendingRtc: false });
      setSwitchToVideoPopupVisible(false);
      setIncomingCallSwitchRequestVisible(false);
    };
    const onCallRequestSent = (payload: CallRequestSentPayload) => {
      if (!payload.callId) return;
      setActiveCallId(payload.callId);
      setActiveCallChannelName(payload.channelName ?? null);
      setActiveCallRtcToken(payload.rtcToken ?? null);
      if (payload.callType) {
        const mode: ActiveCallMode = payload.callType === 'video' ? 'video' : 'voice';
        setActiveCallMode(mode);
        setCallVideoEnabled(mode === 'video');
      }
      scheduleOutgoingRingTimeoutRef.current(payload.callId);
    };
    const onCallFailed = (payload: CallFailedPayload) => {
      const snap = callUiRef.current;
      const failedCallId = payload.callId?.trim() ?? '';
      const trackedIds = [snap.activeCallId, snap.incomingVoiceCallId, snap.incomingVideoCallId]
        .map((id) => id?.trim() ?? '')
        .filter(Boolean);
      const hasIncomingUi =
        snap.incomingCallBannerVisible || snap.incomingVoiceCallVisible || snap.incomingVideoCallVisible;
      const applies =
        hasIncomingUi ||
        snap.callStateVisible ||
        snap.isOutgoingVoiceRinging ||
        (failedCallId ? trackedIds.includes(failedCallId) : trackedIds.length > 0);
      if (!applies) return;

      void stopCallRing();
      const normalizedCode = String(payload.code ?? '').toUpperCase();
      if (failedCallId) {
        markGlobalCallTerminated(failedCallId);
        if (outgoingRingTimerRef.current) {
          clearTimeout(outgoingRingTimerRef.current);
          outgoingRingTimerRef.current = null;
        }
      }
      dismissIncomingCallUi();
      setCallStateVisible(false);
      setActiveCallId(null);
      setPartnerAudioEnabled(true);
      setPartnerVideoEnabled(true);
      setIsOutgoingVoiceRinging(false);
      setIsSwitchingVoiceToVideo(false);
      setSwitchToVideoPopupVisible(false);
      setIncomingCallSwitchRequestVisible(false);
      setCallConnectedAtMs(null);
      setCallDurationSec(0);
      setActiveCallChannelName(null);
      setActiveCallRtcToken(null);
      setLocalRtcUid(0);
      void agoraCallService.leaveChannel();
      const refetchThisChat =
        chatId &&
        (payload.callId == null || snap.activeCallId == null || payload.callId === snap.activeCallId);
      if (refetchThisChat) {
        refreshChatMessagesFromApi();
      }
      if (normalizedCode === 'RECEIVER_OFFLINE' || normalizedCode === 'RECEIVER_DELIVERY_FAILED') {
        showErrorToast('User is offline right now.');
        return;
      }
      if (hasIncomingUi && !snap.callStateVisible) return;
      showErrorToast(payload.message || 'Call failed. Please try again.');
    };
    const teardownCallSession = (payload: CallLifecyclePayload, toastMessage?: string) => {
      const snap = callUiRef.current;
      if (!isCallLifecycleRelevant(payload, snap)) return false;

      const wasIncomingOnly =
        !snap.callStateVisible &&
        (snap.incomingCallBannerVisible || snap.incomingVoiceCallVisible || snap.incomingVideoCallVisible);
      const wasConnected = snap.callConnectedAtMs != null;
      const callId =
        payload.callId?.trim() ||
        snap.activeCallId?.trim() ||
        snap.incomingVoiceCallId?.trim() ||
        snap.incomingVideoCallId?.trim() ||
        '';

      if (callId && isGlobalCallTerminated(callId)) {
        const hadIncoming =
          snap.incomingCallBannerVisible || snap.incomingVoiceCallVisible || snap.incomingVideoCallVisible;
        const wasOutgoingUnanswered =
          Boolean(snap.activeCallId?.trim()) && snap.callConnectedAtMs == null && !hadIncoming;
        dismissIncomingCallUi();
        setCallStateVisible(false);
        setActiveCallId(null);
        setIsOutgoingVoiceRinging(false);
        setCallConnectedAtMs(null);
        setCallDurationSec(0);
        setActiveCallChannelName(null);
        setActiveCallRtcToken(null);
        setLocalRtcUid(0);
        void agoraCallService.leaveChannel();

        if (!wasConnected && callId) {
          const toastLower = toastMessage?.toLowerCase() ?? '';
          const callStatus = toastLower.includes('declined')
            ? 'REJECTED'
            : toastLower.includes('no answer')
              ? 'NO_ANSWER'
              : hadIncoming
                ? 'MISSED'
                : wasOutgoingUnanswered
                  ? 'NO_ANSWER'
                  : 'MISSED';
          const callType =
            snap.incomingVideoCallId || snap.activeCallMode === 'video' ? 'video' : 'audio';
          upsertOptimisticCallLogRef.current({
            callId,
            callType,
            callStatus,
            sent: wasOutgoingUnanswered || (!hadIncoming && Boolean(snap.activeCallId?.trim())),
          });
        }

        refreshChatMessagesAfterCallRef.current();
        bumpScrollAfterLocalSendRef.current();
        return true;
      }

      if (callId) {
        markGlobalCallTerminated(callId);
        handledIncomingCallIdsRef.current.add(callId);
        if (outgoingRingTimerRef.current) {
          clearTimeout(outgoingRingTimerRef.current);
          outgoingRingTimerRef.current = null;
        }
      }

      dismissIncomingCallUi();
      setCallStateVisible(false);
      setActiveCallId(null);
      setPartnerAudioEnabled(true);
      setPartnerVideoEnabled(true);
      setIsOutgoingVoiceRinging(false);
      setIsSwitchingVoiceToVideo(false);
      setSwitchToVideoPopupVisible(false);
      setIncomingCallSwitchRequestVisible(false);
      setCallConnectedAtMs(null);
      setCallDurationSec(0);
      setActiveCallChannelName(null);
      setActiveCallRtcToken(null);
      setLocalRtcUid(0);
      void agoraCallService.leaveChannel();

      if (!wasConnected && callId) {
        const hasIncomingUi =
          snap.incomingCallBannerVisible || snap.incomingVoiceCallVisible || snap.incomingVideoCallVisible;
        const sentLog = Boolean(snap.activeCallId?.trim()) && !hasIncomingUi;
        const toastLower = toastMessage?.toLowerCase() ?? '';
        const callStatus = toastLower.includes('declined')
          ? 'REJECTED'
          : toastLower.includes('no answer')
            ? 'NO_ANSWER'
            : 'MISSED';
        const callType =
          snap.incomingVideoCallId || snap.activeCallMode === 'video' ? 'video' : 'audio';
        upsertOptimisticCallLogRef.current({
          callId,
          callType,
          callStatus,
          sent: sentLog,
        });
      }

      if (shouldRefetchMessagesAfterCall(payload)) {
        refreshChatMessagesAfterCallRef.current();
      }
      if (!wasConnected && callId) {
        bumpScrollAfterLocalSendRef.current();
      }
      if (toastMessage && !wasIncomingOnly) {
        showSuccessToast(toastMessage);
      }
      return true;
    };
    const onCallRejected = (payload: CallLifecyclePayload) => {
      if (teardownCallSession(payload, 'Call was declined.')) return;
      const snap = callUiRef.current;
      const callId =
        payload.callId?.trim() ||
        snap.activeCallId?.trim() ||
        snap.incomingVoiceCallId?.trim() ||
        snap.incomingVideoCallId?.trim() ||
        '';
      if (!callId || !callParticipantsMatch(payload, snap)) return;
      if (callId) markGlobalCallTerminated(callId);
      dismissIncomingCallUi();
      setCallStateVisible(false);
      setActiveCallId(null);
      setIsOutgoingVoiceRinging(false);
      cleanupCallSessionLocal();
      upsertOptimisticCallLogRef.current({
        callId,
        callType: snap.activeCallMode === 'video' ? 'video' : 'audio',
        callStatus: 'REJECTED',
        sent: Boolean(snap.activeCallId?.trim()) && !snap.incomingCallBannerVisible,
      });
      refreshChatMessagesAfterCallRef.current();
      bumpScrollAfterLocalSendRef.current();
      showSuccessToast('Call was declined.');
    };
    const onCallEnded = (payload: CallLifecyclePayload) => {
      const snap = callUiRef.current;
      const hasIncomingUi =
        snap.incomingCallBannerVisible || snap.incomingVoiceCallVisible || snap.incomingVideoCallVisible;
      const wasConnected = snap.callConnectedAtMs != null;
      const wasOutgoingUnanswered =
        Boolean(snap.activeCallId?.trim()) && !wasConnected && !hasIncomingUi;
      const toastMessage = wasConnected
        ? 'Call ended.'
        : wasOutgoingUnanswered
          ? 'No answer.'
          : undefined;
      teardownCallSession(payload, toastMessage);
    };
    const onCallPartnerAudio = (payload: CallPartnerAudioPayload) => {
      const snap = callUiRef.current;
      if (!payload.userId || payload.userId !== otherUserId) return;
      if (snap.activeCallId && payload.callId && payload.callId !== snap.activeCallId) return;
      setPartnerAudioEnabled(payload.enabled);
    };
    const onCallPartnerVideo = (payload: CallPartnerVideoPayload) => {
      const snap = callUiRef.current;
      if (!payload.userId || payload.userId !== otherUserId) return;
      if (snap.activeCallId && payload.callId && payload.callId !== snap.activeCallId) return;
      setPartnerVideoEnabled(payload.enabled);
    };
    const onCallSwitchRequest = (payload: CallSwitchRequestPayload) => {
      const snap = callUiRef.current;
      if (!payload.callId || payload.targetType !== 'video') return;
      if (!snap.callStateVisible || !snap.activeCallId || payload.callId !== snap.activeCallId) return;
      if (snap.activeCallMode !== 'voice') return;
      if (payload.fromUserId && currentUserId && payload.fromUserId === currentUserId) return;
      if (payload.chatId && chatId && payload.chatId !== chatId) return;
      setIncomingCallSwitchRequestVisible(true);
    };
    const onCallSwitchApplied = (payload: CallSwitchAppliedPayload) => {
      const snap = callUiRef.current;
      if (!payload.callId || !snap.activeCallId || payload.callId !== snap.activeCallId) return;
      const raw = String(payload.callType ?? payload.targetType ?? '').toLowerCase();
      if (!raw) return;
      const isVoiceOnly = raw === 'voice' || raw === 'audio' || raw === 'voice_call' || raw === 'audio_call';
      const enableVideo = !isVoiceOnly && raw.includes('video');
      void agoraCallService.applyCallSwitchToVideoInChannel(enableVideo);
      setActiveCallMode(enableVideo ? 'video' : 'voice');
      setCallVideoEnabled(enableVideo);
      if (enableVideo) {
        setVideoCallUiHidden(false);
      }
      setIsSwitchingVoiceToVideo(false);
      setIncomingCallSwitchRequestVisible(false);
      setSwitchToVideoPopupVisible(false);
    };
    const unsubIncomingCall = socketService.on<IncomingCallPayload>('incoming_call', showIncomingCallPrompt);
    const unsubCallAccepted = socketService.on<CallLifecyclePayload>('call_accepted', onCallAccepted);
    const unsubCallRejected = socketService.on<CallLifecyclePayload>('call_rejected', onCallRejected);
    const unsubCallEnded = socketService.on<CallLifecyclePayload>('call_ended', onCallEnded);
    const unsubCallRequestSent = socketService.on<CallRequestSentPayload>('call_request_sent', onCallRequestSent);
    const unsubCallFailed = socketService.on<CallFailedPayload>('call_failed', onCallFailed);
    const unsubCallPartnerAudio = socketService.on<CallPartnerAudioPayload>('call_partner_audio', onCallPartnerAudio);
    const unsubCallPartnerVideo = socketService.on<CallPartnerVideoPayload>('call_partner_video', onCallPartnerVideo);
    const unsubCallSwitchRequest = socketService.on<CallSwitchRequestPayload>('call_switch_request', onCallSwitchRequest);
    const unsubCallSwitchApplied = socketService.on<CallSwitchAppliedPayload>('call_switch_applied', onCallSwitchApplied);
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
      unsubCallRequestSent();
      unsubCallFailed();
      unsubCallPartnerAudio();
      unsubCallPartnerVideo();
      unsubCallSwitchRequest();
      unsubCallSwitchApplied();
      if (chatId) {
        socketService.leaveChat(chatId);
      }
    };
  }, [
    chatId,
    currentUserId,
    dismissIncomingCallUi,
    otherUserId,
    refreshChatMessagesFromApi,
    isOtherUserOnlineFromPayload,
    showIncomingCallBanner,
    parseIncomingCallPayload,
    storeIncomingCallRtc,
  ]);

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
    if (msg.type === 'call_log') return msg.label.trim() || (msg.callType === 'video' ? 'Video call' : 'Voice call');
    return '';
  };

  const handleMicPress = async () => {
    if (inputText.trim() || pendingAttachments.length || sendLoading || pendingMediaUploadCount > 0) return;
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
      CHAT_IMAGE_PICKER_OPTIONS,
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
        ...CHAT_IMAGE_PICKER_OPTIONS,
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
    if (!isSubscribed) {
      navigateToSubscription(navigation);
      return;
    }

    const trimmed = inputText.trim();
    const attachmentsToSend = [...pendingAttachments];
    if (!trimmed && attachmentsToSend.length === 0) return;
    if (!currentUserId || !otherUserId) return;

    const replyToPayload = replyingTo?.messageId ?? null;
    const pendingBatchId = `pending_${Date.now()}`;
    const optimisticMessages: ChatMessage[] = [];

    if (trimmed) {
      optimisticMessages.push({
        type: 'text',
        text: trimmed,
        timestamp: now(),
        sent: true,
        messageId: `${pendingBatchId}_text`,
        sending: true,
      });
    }

    attachmentsToSend.forEach((att, index) => {
      if (att.type === 'image') {
        optimisticMessages.push({
          type: 'image',
          uri: att.uri,
          timestamp: now(),
          sent: true,
          messageId: `${pendingBatchId}_att_${index}`,
          uploading: true,
        });
      } else {
        optimisticMessages.push({
          type: 'file',
          uri: att.uri,
          name: att.name,
          timestamp: now(),
          sent: true,
          messageId: `${pendingBatchId}_att_${index}`,
          uploading: true,
        });
      }
    });

    const clearComposerNative = () => {
      const anyRef = inputRef as React.RefObject<TextInput & { setNativeProps?: (props: object) => void }>;
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

    const hasMediaToUpload = attachmentsToSend.length > 0;

    if (!hasMediaToUpload) {
      setSendLoading(true);
    }
    clearComposer();
    setPendingAttachments([]);
    setReplyingTo(null);
    socketService.typing(currentUserId, otherUserId, false);

    if (optimisticMessages.length > 0) {
      setMessages((prev) => [...prev, ...optimisticMessages]);
      bumpScrollAfterLocalSend();
    }

    const replaceOptimisticMessage = (pendingMessageId: string, next: ChatMessage | null) => {
      setMessages((prev) => {
        const idx = prev.findIndex((m) => m.messageId === pendingMessageId);
        if (idx === -1) {
          return next ? [...prev, next] : prev;
        }
        if (!next) {
          return prev.filter((_, i) => i !== idx);
        }
        const copy = [...prev];
        copy[idx] = next;
        return copy;
      });
    };

    const patchOptimisticMediaMessage = (
      pendingMessageId: string,
      patch: { uploading?: boolean; uploadFailed?: boolean },
    ) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.messageId === pendingMessageId && (m.type === 'image' || m.type === 'file')
            ? { ...m, ...patch }
            : m,
        ),
      );
    };

    const markPendingMediaUploadsFailed = () => {
      attachmentsToSend.forEach((_, index) => {
        patchOptimisticMediaMessage(`${pendingBatchId}_att_${index}`, {
          uploading: false,
          uploadFailed: true,
        });
      });
    };

    let remainingBatchUploads = attachmentsToSend.length;

    const pendingAttachmentMessages = (prev: ChatMessage[]) =>
      prev.filter(
        (m) =>
          typeof m.messageId === 'string' &&
          m.messageId.startsWith(`${pendingBatchId}_att_`),
      );

    try {
      let effectiveChatId = chatId;
      let justCreatedChatViaAdd = false;

      if (!effectiveChatId) {
        const addRes = await apiClient.post(endpoints.chat.addChat, {
          senderId: currentUserId,
          receiverId: otherUserId,
          firstMessage: trimmed,
        });
        effectiveChatId = extractChatIdFromAddChatResponse(addRes);

        if (!effectiveChatId) {
          if (hasMediaToUpload) {
            markPendingMediaUploadsFailed();
          }
          setSendLoading(false);
          return;
        }

        setChatId(effectiveChatId);
        navigation.setParams({ chatId: effectiveChatId } as any);
        justCreatedChatViaAdd = true;
      }

      if (trimmed) {
        if (justCreatedChatViaAdd) {
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

            if (list.length === 0) {
              bumpScrollAfterLocalSend();
            } else {
              setMessages((prev) => [...list, ...pendingAttachmentMessages(prev)]);
              bumpScrollAfterLocalSend();
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
            replaceOptimisticMessage(`${pendingBatchId}_text`, ui as ChatMessage);
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
        }
      }

      if (attachmentsToSend.length > 0) {
        setPendingMediaUploadCount((n) => n + attachmentsToSend.length);
      }

      for (let index = 0; index < attachmentsToSend.length; index += 1) {
        const att = attachmentsToSend[index];
        const pendingMessageId = `${pendingBatchId}_att_${index}`;
        const messageType = getMessageTypeFromAttachment(att);
        const mimeType = getMimeTypeFromAttachment(att);
        const fileName = att.type === 'image'
          ? firstNonEmptyString(att.name, `image_${Date.now()}.jpg`)!
          : att.name;
        try {
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
            replaceOptimisticMessage(pendingMessageId, ui);
            bumpScrollAfterLocalSend();
          }
          if (currentUserId && otherUserId) {
            socketService.messageSendFromApi(
              currentUserId,
              otherUserId,
              normalizedApiMessage as unknown as Record<string, unknown>
            );
          }
        } catch {
          patchOptimisticMediaMessage(pendingMessageId, {
            uploading: false,
            uploadFailed: true,
          });
          showErrorToast('Could not send attachment. Please try again.');
        } finally {
          remainingBatchUploads = Math.max(0, remainingBatchUploads - 1);
          setPendingMediaUploadCount((n) => Math.max(0, n - 1));
        }
      }
    } catch {
      if (remainingBatchUploads > 0) {
        markPendingMediaUploadsFailed();
        setPendingMediaUploadCount((n) => Math.max(0, n - remainingBatchUploads));
        remainingBatchUploads = 0;
      }
      setMessages((prev) =>
        prev.map((m) =>
          m.messageId === `${pendingBatchId}_text` && m.type === 'text'
            ? { ...m, sending: false }
            : m,
        ),
      );
      // Send failed — optimistic bubbles remain until the user retries or refreshes.
    } finally {
      if (!hasMediaToUpload) {
        setSendLoading(false);
      }
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
          subtitle: '',
          variant: 'missed',
          icon: 'videoMissed',
        };
      }
      if (lower.includes('missed voice call')) {
        return {
          title: 'Missed Voice Call',
          subtitle: '',
          variant: 'missed',
          icon: 'voiceMissed',
        };
      }
      if (lower.includes('incoming voice call')) {
        return {
          title: 'Incoming Voice Call',
          subtitle: 'Tap to receive',
          variant: 'received',
          icon: 'voiceIncoming',
        };
      }
      if (lower.includes('incoming video call')) {
        return {
          title: 'Incoming Video Call',
          subtitle: 'Tap to receive',
          variant: 'received',
          icon: 'videoIncoming',
        };
      }
      if (lower.includes('voice call') && lower.includes('ring')) {
        return {
          title: 'Voice Call',
          subtitle: 'Ringing..',
          variant: 'sent',
          icon: 'voiceOutgoing',
        };
      }
      if (lower.includes('video call')) {
        return {
          title: 'Video Call',
          subtitle: durationMatch?.[0] ?? agoMatch?.[0] ?? (msg.sent ? '6 Secs' : '1 Min ago'),
          variant: msg.sent ? 'sent' : 'received',
          icon: msg.sent ? 'videoOutgoing' : 'videoIncoming',
        };
      }
      if (lower.includes('voice call')) {
        return {
          title: 'Voice Call',
          subtitle: durationMatch?.[0] ?? agoMatch?.[0] ?? '6 Secs',
          variant: msg.sent ? 'sent' : 'received',
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

    const formatCallDurationSec = (sec: number): string => {
      const s = Math.max(0, Math.floor(sec));
      if (s < 60) return `${s} ${s === 1 ? 'sec' : 'secs'}`;
      const m = Math.floor(s / 60);
      const rem = s % 60;
      if (rem === 0) return `${m} ${m === 1 ? 'min' : 'mins'}`;
      return `${m} min ${rem} secs`;
    };

    type CallBubbleLayout = {
      title: string;
      subtitle: string;
      variant: 'sent' | 'received' | 'missed';
      icon:
        | 'videoOutgoing'
        | 'videoIncoming'
        | 'videoMissed'
        | 'voiceOutgoing'
        | 'voiceIncoming'
        | 'voiceMissed';
    };

    const buildCallLogLayout = (m: Extract<ChatMessage, { type: 'call_log' }>): CallBubbleLayout =>
      buildCallLogBubbleLayout({
        callStatus: m.callStatus,
        callType: m.callType,
        durationSec: m.durationSec,
        label: m.label,
        displayAsSummaryLine: m.displayAsSummaryLine,
        sent: m.sent,
      });

    const renderCallStateBubbleRow = (
      callState: CallBubbleLayout,
      isSent: boolean,
      timestamp: string,
      keyIndex: number,
    ) => (
      <React.Fragment key={keyIndex}>
        <View style={[styles.messageRow, isSent ? undefined : styles.messageRowReceived]}>
          <View ref={(r) => setMessageBubbleRef(keyIndex, r)} collapsable={false}>
            <TouchableOpacity
              style={[
                styles.chatCallBubble,
                callState.variant === 'sent'
                  ? styles.chatCallBubbleSent
                  : callState.variant === 'missed'
                  ? styles.chatCallBubbleMissed
                  : styles.chatCallBubbleReceived,
              ]}
              activeOpacity={0.9}
              onLongPress={() => handleMessageLongPress(keyIndex)}
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
                {callState.subtitle.trim().length > 0 ? (
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
                ) : null}
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <View style={[styles.timeRow, isSent ? undefined : styles.timeRowReceived]}>
          <Text style={styles.timeText}>{timestamp}</Text>
        </View>
      </React.Fragment>
    );

    if (msg.type === 'call_log') {
      return renderCallStateBubbleRow(buildCallLogLayout(msg), msg.sent, msg.timestamp, index);
    }

    if (msg.type === 'text') {
      const callState = parseCallStateText(msg.text);
      if (callState) {
        return renderCallStateBubbleRow(callState, msg.sent, msg.timestamp, index);
      }
      const isSending = msg.sending === true;
      return (
        <React.Fragment key={index}>
          <View style={[styles.messageRow, msg.sent ? undefined : styles.messageRowReceived]}>
            <View ref={(r) => setMessageBubbleRef(index, r)} collapsable={false}>
            <TouchableOpacity
              style={[
                styles.bubble,
                msg.sent ? styles.bubbleSent : styles.bubbleReceived,
                isSending && styles.bubbleSending,
              ]}
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
            {isSending ? (
              <ActivityIndicator
                size="small"
                color={colors.neutral[500]}
                style={styles.messageSendingSpinner}
              />
            ) : null}
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
      const isUploading = msg.uploading === true;
      const uploadFailed = msg.uploadFailed === true;
      return (
        <React.Fragment key={index}>
          <View style={[styles.messageRow, msg.sent ? undefined : styles.messageRowReceived]}>
            <View ref={(r) => setMessageBubbleRef(index, r)} collapsable={false}>
              <ChatBubbleImage
                uri={imageUri}
                width={imageBubbleSize}
                height={imageBubbleSize}
                sent={msg.sent}
                isUploading={isUploading}
                uploadFailed={uploadFailed}
                onPress={() => {
                  if (isUploading || uploadFailed) return;
                  openImagePreview(imageUri);
                }}
                onLongPress={() => handleMessageLongPress(index)}
              />
            </View>
          </View>
          <View style={[styles.timeRow, msg.sent ? undefined : styles.timeRowReceived]}>
            {isUploading ? (
              <ActivityIndicator
                size="small"
                color={colors.neutral[500]}
                style={styles.messageSendingSpinner}
              />
            ) : null}
            <Text style={styles.timeText}>{msg.timestamp}</Text>
          </View>
        </React.Fragment>
      );
    }
    if (msg.type === 'file') {
      const isUploading = msg.uploading === true;
      const uploadFailed = msg.uploadFailed === true;
      return (
        <React.Fragment key={index}>
          <View style={[styles.messageRow, msg.sent ? undefined : styles.messageRowReceived]}>
            <View ref={(r) => setMessageBubbleRef(index, r)} collapsable={false}>
            <TouchableOpacity
              style={[styles.fileBubble, msg.sent ? undefined : styles.fileBubbleReceived]}
              activeOpacity={0.9}
              disabled={isUploading}
              onPress={() => {
                if (isUploading || uploadFailed) return;
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
              {isUploading ? (
                <View style={styles.messageUploadOverlay}>
                  <ActivityIndicator size="large" color={colors.white} />
                </View>
              ) : null}
              {uploadFailed ? (
                <View style={styles.messageUploadOverlay}>
                  <Text style={styles.messageUploadFailedText}>Failed to send</Text>
                </View>
              ) : null}
            </TouchableOpacity>
            </View>
          </View>
          <View style={[styles.timeRow, msg.sent ? undefined : styles.timeRowReceived]}>
            {isUploading ? (
              <ActivityIndicator
                size="small"
                color={colors.neutral[500]}
                style={styles.messageSendingSpinner}
              />
            ) : null}
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

  const handleHeaderVideoCallPress = useCallback(() => {
    if (!ensurePremiumAccess()) return;

    const start = async () => {
      const connected = await socketService.waitForConnection();
      if (!connected) {
        showErrorToast(STRINGS.CHAT.SOCKET_DISCONNECTED);
        return;
      }
      const micGranted = await ensureMicrophoneForCall();
      if (!micGranted) return;
      const permission = await checkCameraPermission();
      const granted =
        permission === 'granted' || (await requestCameraPermission()) === 'granted';
      if (!granted) {
        showErrorToast('Camera permission is required for video calls.');
        return;
      }
      if (chatId && otherUserId) {
        socketService.callRequest(otherUserId, chatId, 'video', outgoingCallMeta);
      }
      setActiveCallId(null);
      setActiveCallMode('video');
      setCallAudioEnabled(true);
      setCallVideoEnabled(true);
      setPartnerAudioEnabled(true);
      setPartnerVideoEnabled(true);
      setIsOutgoingVoiceRinging(false);
      setIsSwitchingVoiceToVideo(false);
      setSelectedAudioDevice('earpiece');
      setAudioDeviceSheetVisible(false);
      setCallConnectedAtMs(null);
      setCallDurationSec(0);
      setVideoCallUiHidden(false);
      setCallStateVisible(true);
      void startOutgoingCallRingback(true);
    };
    void start();
  }, [chatId, otherUserId, outgoingCallMeta, ensurePremiumAccess, ensureMicrophoneForCall]);

  const handleHeaderVoiceCallPress = useCallback(() => {
    if (!ensurePremiumAccess()) return;

    const start = async () => {
      const connected = await socketService.waitForConnection();
      if (!connected) {
        showErrorToast(STRINGS.CHAT.SOCKET_DISCONNECTED);
        return;
      }
      const micGranted = await ensureMicrophoneForCall();
      if (!micGranted) return;
      if (chatId && otherUserId) {
        socketService.callRequest(otherUserId, chatId, 'audio', outgoingCallMeta);
      }
      setActiveCallId(null);
      setActiveCallMode('voice');
      setCallAudioEnabled(true);
      setCallVideoEnabled(false);
      setPartnerAudioEnabled(true);
      setPartnerVideoEnabled(true);
      setIsOutgoingVoiceRinging(true);
      setIsSwitchingVoiceToVideo(false);
      setSelectedAudioDevice('earpiece');
      setAudioDeviceSheetVisible(false);
      setCallConnectedAtMs(null);
      setCallDurationSec(0);
      setCallStateVisible(true);
      void startOutgoingCallRingback(false);
    };
    void start();
  }, [chatId, otherUserId, outgoingCallMeta, ensurePremiumAccess, ensureMicrophoneForCall]);

  const toggleCallAudio = useCallback(() => {
    setCallAudioEnabled((prev) => {
      const nextEnabled = !prev;
      if (activeCallId && currentUserId) {
        socketService.callMicUpdate(activeCallId, String(currentUserId), nextEnabled);
      }
      void agoraCallService.setMuted(!nextEnabled);
      return nextEnabled;
    });
  }, [activeCallId, currentUserId]);

  const toggleCallVideo = useCallback(() => {
    const toggle = async () => {
      if (!callVideoEnabled) {
        const permission = await checkCameraPermission();
        const granted =
          permission === 'granted' || (await requestCameraPermission()) === 'granted';
        if (!granted) {
          showErrorToast('Camera permission is required to turn video on.');
          return;
        }
      }
      setCallVideoEnabled((prev) => !prev);
    };
    void toggle();
  }, [callVideoEnabled]);

  const cleanupCallSessionLocal = useCallback(() => {
    void stopCallRing();
    setIncomingCallBannerVisible(false);
    setActiveCallChannelName(null);
    setActiveCallRtcToken(null);
    setLocalRtcUid(0);
    void agoraCallService.leaveChannel();
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
  }, []);

  /** Dismiss call UI when any screen learns the call ended (global registry). */
  useEffect(() => {
    return onCallTerminated((callId) => {
      const snap = callUiRef.current;
      const matches =
        snap.activeCallId === callId ||
        snap.incomingVoiceCallId === callId ||
        snap.incomingVideoCallId === callId;
      if (!matches) return;

      clearOutgoingRingTimer();
      dismissIncomingCallUi();
      if (snap.callStateVisible && snap.callConnectedAtMs == null) {
        setActiveCallId(null);
        setIsOutgoingVoiceRinging(false);
        cleanupCallSessionLocal();
      }
    });
  }, [clearOutgoingRingTimer, cleanupCallSessionLocal, dismissIncomingCallUi]);

  useEffect(() => {
    return () => {
      void stopCallRing();
    };
  }, []);

  const endCallLocally = useCallback(
    (params: {
      callId: string;
      callType: 'audio' | 'video';
      callStatus: string;
      sent: boolean;
      emitTimeout?: boolean;
      emitCancel?: boolean;
      emitEnd?: boolean;
      skipSocketEmit?: boolean;
      toastMessage?: string;
      errorToast?: boolean;
    }) => {
      const id = params.callId.trim();
      if (!id) return;

      const alreadyTerminated = isGlobalCallTerminated(id);

      if (!alreadyTerminated) {
        markCallTerminated(id);
        registerHandledIncomingCall(id, params.callType === 'video' ? 'video' : 'audio');
      }

      if (!params.skipSocketEmit) {
        if (params.emitTimeout) socketService.callTimeout(id);
        else if (params.emitCancel) socketService.callCancel(id, 'caller_cancelled');
        else if (params.emitEnd) socketService.callEnd(id);
      }

      upsertOptimisticCallLog({
        callId: id,
        callType: params.callType,
        callStatus: params.callStatus,
        sent: params.sent,
      });

      setActiveCallId(null);
      cleanupCallSessionLocal();
      dismissIncomingCallUi();
      refreshChatMessagesAfterCall();
      bumpScrollAfterLocalSend();

      if (params.toastMessage) {
        if (params.errorToast) showErrorToast(params.toastMessage);
        else showSuccessToast(params.toastMessage);
      }
    },
    [
      bumpScrollAfterLocalSend,
      cleanupCallSessionLocal,
      dismissIncomingCallUi,
      markCallTerminated,
      refreshChatMessagesAfterCall,
      registerHandledIncomingCall,
      upsertOptimisticCallLog,
    ],
  );

  const scheduleOutgoingRingTimeout = useCallback(
    (callId: string) => {
      const trimmed = callId.trim();
      if (!trimmed || isCallTerminated(trimmed)) return;
      clearOutgoingRingTimer();
      outgoingRingTimerRef.current = setTimeout(() => {
        if (isCallTerminated(trimmed)) return;
        const snap = callUiRef.current;
        if (snap.callConnectedAtMs != null) return;
        if (snap.activeCallId?.trim() !== trimmed) return;
        const hasIncomingUi =
          snap.incomingCallBannerVisible ||
          snap.incomingVoiceCallVisible ||
          snap.incomingVideoCallVisible;
        if (hasIncomingUi) return;

        endCallLocally({
          callId: trimmed,
          callType: snap.activeCallMode === 'video' ? 'video' : 'audio',
          callStatus: 'NO_ANSWER',
          sent: true,
          emitTimeout: true,
          skipSocketEmit: false,
          toastMessage: 'No answer.',
          errorToast: true,
        });
      }, CALL_RING_TIMEOUT_MS);
    },
    [clearOutgoingRingTimer, endCallLocally, isCallTerminated],
  );

  const scheduleOutgoingRingTimeoutRef = useRef(scheduleOutgoingRingTimeout);
  scheduleOutgoingRingTimeoutRef.current = scheduleOutgoingRingTimeout;

  const closeCallState = useCallback(() => {
    const callId = activeCallId?.trim();
    if (callId) {
      const wasConnected = callConnectedAtMsRef.current != null;
      if (wasConnected) {
        markCallTerminated(callId);
        socketService.callEnd(callId);
        setActiveCallId(null);
        cleanupCallSessionLocal();
        refreshChatMessagesAfterCall();
        return;
      }
      endCallLocally({
        callId,
        callType: activeCallMode === 'video' ? 'video' : 'audio',
        callStatus: 'CANCELLED',
        sent: true,
        emitCancel: true,
        skipSocketEmit: false,
      });
      return;
    }
    cleanupCallSessionLocal();
    refreshChatMessagesAfterCall();
  }, [
    activeCallId,
    activeCallMode,
    cleanupCallSessionLocal,
    endCallLocally,
    markCallTerminated,
    refreshChatMessagesAfterCall,
  ]);

  /** Auto-end outgoing calls when the receiver does not answer within 30 seconds. */
  useEffect(() => {
    const callId = activeCallId?.trim();
    if (!callId || callConnectedAtMs != null || isCallTerminated(callId)) return;

    const hasIncomingUi =
      incomingCallBannerVisible || incomingVoiceCallVisible || incomingVideoCallVisible;
    if (hasIncomingUi) return;

    scheduleOutgoingRingTimeout(callId);
    return () => clearOutgoingRingTimer();
  }, [
    activeCallId,
    callConnectedAtMs,
    incomingCallBannerVisible,
    incomingVoiceCallVisible,
    incomingVideoCallVisible,
    isCallTerminated,
    scheduleOutgoingRingTimeout,
    clearOutgoingRingTimer,
  ]);

  /** Dismiss stale incoming-call UI if the server never sends a lifecycle event. */
  useEffect(() => {
    const hasIncomingUi =
      incomingCallBannerVisible || incomingVoiceCallVisible || incomingVideoCallVisible;
    if (!hasIncomingUi) return;

    const timer = setTimeout(() => {
      const snap = callUiRef.current;
      const stillIncoming =
        snap.incomingCallBannerVisible ||
        snap.incomingVoiceCallVisible ||
        snap.incomingVideoCallVisible;
      if (!stillIncoming || snap.callConnectedAtMs != null) return;
      const pendingId = snap.incomingVideoCallId ?? snap.incomingVoiceCallId;
      if (pendingId?.trim() && isGlobalCallTerminated(pendingId.trim())) {
        dismissIncomingCallUi();
        return;
      }
      const trimmedPendingId = pendingId?.trim();
      if (trimmedPendingId) {
        markGlobalCallTerminated(trimmedPendingId);
        registerHandledIncomingCall(trimmedPendingId, snap.incomingVideoCallId ? 'video' : 'voice');
        upsertOptimisticCallLogRef.current({
          callId: trimmedPendingId,
          callType: snap.incomingVideoCallId ? 'video' : 'audio',
          callStatus: 'MISSED',
          sent: false,
        });
        refreshChatMessagesAfterCallRef.current();
        bumpScrollAfterLocalSendRef.current();
      }
      dismissIncomingCallUi();
    }, CALL_RING_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [
    incomingCallBannerVisible,
    incomingVoiceCallVisible,
    incomingVideoCallVisible,
    dismissIncomingCallUi,
    registerHandledIncomingCall,
  ]);

  const minimizeCallState = useCallback(() => {
    setCallStateVisible(false);
    setVideoCallUiHidden(false);
    setAudioDeviceSheetVisible(false);
    setSwitchToVideoPopupVisible(false);
    setIncomingCallBannerVisible(false);
  }, []);

  const acceptIncomingVoiceCall = useCallback(() => {
    const accept = async () => {
      const callId = incomingVoiceCallId?.trim();
      if (!callId || isGlobalCallTerminated(callId)) {
        showErrorToast('This call is no longer available.');
        dismissIncomingCallUi();
        return;
      }
      if (!ensurePremiumAccess()) {
        if (incomingVoiceCallId) {
          socketService.callReject(incomingVoiceCallId);
        }
        dismissIncomingCallUi();
        return;
      }
      const micGranted = await ensureMicrophoneForCall();
      if (!micGranted) {
        if (incomingVoiceCallId) {
          socketService.callReject(incomingVoiceCallId);
        }
        dismissIncomingCallUi();
        return;
      }
      if (!callId || isGlobalCallTerminated(callId)) {
        showErrorToast('This call is no longer available.');
        dismissIncomingCallUi();
        return;
      }
      if (incomingVoiceCallId) {
        socketService.callAccept(incomingVoiceCallId);
        setActiveCallId(incomingVoiceCallId);
      }
      dismissIncomingCallUi({ clearPendingRtc: false });
      setActiveCallMode('voice');
      setCallAudioEnabled(true);
      setCallVideoEnabled(false);
      setPartnerAudioEnabled(true);
      setPartnerVideoEnabled(true);
      setIsOutgoingVoiceRinging(false);
      setIsSwitchingVoiceToVideo(false);
      setSelectedAudioDevice('earpiece');
      setSwitchToVideoPopupVisible(false);
      setCallConnectedAtMs(Date.now());
      setCallDurationSec(0);
      setCallStateVisible(true);
    };
    void accept();
  }, [incomingVoiceCallId, ensurePremiumAccess, dismissIncomingCallUi, ensureMicrophoneForCall]);

  const declineIncomingVoiceCall = useCallback(() => {
    const callId = incomingVoiceCallId?.trim();
    if (!callId) {
      dismissIncomingCallUi();
      return;
    }
    socketService.callReject(callId);
    endCallLocally({
      callId,
      callType: 'audio',
      callStatus: 'REJECTED',
      sent: false,
      skipSocketEmit: true,
    });
  }, [incomingVoiceCallId, dismissIncomingCallUi, endCallLocally]);

  const incomingVoiceSwipeY = useRef(new Animated.Value(0)).current;
  const resetIncomingVoiceSwipe = useCallback(() => {
    Animated.spring(incomingVoiceSwipeY, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 6,
      speed: 16,
    }).start();
  }, [incomingVoiceSwipeY]);
  const triggerIncomingVoiceSwipeAccept = useCallback(() => {
    Animated.timing(incomingVoiceSwipeY, {
      toValue: -96,
      duration: 120,
      useNativeDriver: true,
    }).start(() => {
      incomingVoiceSwipeY.setValue(0);
      acceptIncomingVoiceCall();
    });
  }, [acceptIncomingVoiceCall, incomingVoiceSwipeY]);
  const incomingVoiceAcceptPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_evt, gestureState) =>
          gestureState.dy < -3 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
        onPanResponderMove: (_evt, gestureState) => {
          const y = Math.max(-110, Math.min(0, gestureState.dy));
          incomingVoiceSwipeY.setValue(y);
        },
        onPanResponderRelease: (_evt, gestureState) => {
          if (gestureState.dy <= -56) {
            triggerIncomingVoiceSwipeAccept();
            return;
          }
          resetIncomingVoiceSwipe();
        },
        onPanResponderTerminate: resetIncomingVoiceSwipe,
      }),
    [incomingVoiceSwipeY, resetIncomingVoiceSwipe, triggerIncomingVoiceSwipeAccept]
  );

  const acceptIncomingVideoCall = useCallback(() => {
    const accept = async () => {
      const callId = incomingVideoCallId?.trim();
      if (!callId || isGlobalCallTerminated(callId)) {
        showErrorToast('This call is no longer available.');
        dismissIncomingCallUi();
        return;
      }
      if (!ensurePremiumAccess()) {
        if (incomingVideoCallId) {
          socketService.callReject(incomingVideoCallId);
        }
        dismissIncomingCallUi();
        return;
      }
      const micGranted = await ensureMicrophoneForCall();
      if (!micGranted) {
        if (incomingVideoCallId) {
          socketService.callReject(incomingVideoCallId);
        }
        dismissIncomingCallUi();
        return;
      }
      const permission = await checkCameraPermission();
      const granted =
        permission === 'granted' || (await requestCameraPermission()) === 'granted';
      if (!granted) {
        showErrorToast('Camera permission is required to accept video call.');
        return;
      }
      if (!callId || isGlobalCallTerminated(callId)) {
        showErrorToast('This call is no longer available.');
        dismissIncomingCallUi();
        return;
      }
      if (incomingVideoCallId) {
        socketService.callAccept(incomingVideoCallId);
        setActiveCallId(incomingVideoCallId);
      }
      dismissIncomingCallUi({ clearPendingRtc: false });
      setActiveCallMode('video');
      setCallAudioEnabled(true);
      setCallVideoEnabled(true);
      setPartnerAudioEnabled(true);
      setPartnerVideoEnabled(true);
      setIsOutgoingVoiceRinging(false);
      setIsSwitchingVoiceToVideo(false);
      setSelectedAudioDevice('earpiece');
      setCallConnectedAtMs(Date.now());
      setCallDurationSec(0);
      setVideoCallUiHidden(false);
      setCallStateVisible(true);
    };
    void accept();
  }, [incomingVideoCallId, ensurePremiumAccess, dismissIncomingCallUi, ensureMicrophoneForCall]);

  const declineIncomingVideoCall = useCallback(() => {
    const callId = incomingVideoCallId?.trim();
    if (!callId) {
      dismissIncomingCallUi();
      return;
    }
    socketService.callReject(callId);
    endCallLocally({
      callId,
      callType: 'video',
      callStatus: 'REJECTED',
      sent: false,
      skipSocketEmit: true,
    });
  }, [incomingVideoCallId, dismissIncomingCallUi, endCallLocally]);

  const incomingVideoSwipeY = useRef(new Animated.Value(0)).current;
  const resetIncomingVideoSwipe = useCallback(() => {
    Animated.spring(incomingVideoSwipeY, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 6,
      speed: 16,
    }).start();
  }, [incomingVideoSwipeY]);
  const triggerIncomingVideoSwipeAccept = useCallback(() => {
    Animated.timing(incomingVideoSwipeY, {
      toValue: -96,
      duration: 120,
      useNativeDriver: true,
    }).start(() => {
      incomingVideoSwipeY.setValue(0);
      acceptIncomingVideoCall();
    });
  }, [acceptIncomingVideoCall, incomingVideoSwipeY]);
  const incomingVideoAcceptPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_evt, gestureState) =>
          gestureState.dy < -3 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
        onPanResponderMove: (_evt, gestureState) => {
          const y = Math.max(-110, Math.min(0, gestureState.dy));
          incomingVideoSwipeY.setValue(y);
        },
        onPanResponderRelease: (_evt, gestureState) => {
          if (gestureState.dy <= -56) {
            triggerIncomingVideoSwipeAccept();
            return;
          }
          resetIncomingVideoSwipe();
        },
        onPanResponderTerminate: resetIncomingVideoSwipe,
      }),
    [incomingVideoSwipeY, resetIncomingVideoSwipe, triggerIncomingVideoSwipeAccept]
  );

  const toggleVideoCallUiHidden = useCallback(() => {
    setVideoCallUiHidden((prev) => !prev);
  }, []);

  const flipVideoCallCamera = useCallback(() => {
    if (!callStateVisible || activeCallMode !== 'video' || !callVideoEnabled) return;
    void agoraCallService.flipCamera();
  }, [activeCallMode, callStateVisible, callVideoEnabled]);

  const selectAudioDevice = useCallback((device: AudioDevice) => {
    const routeLabel =
      device === 'speaker'
        ? 'Speaker'
        : device === 'earpiece'
        ? 'Earpiece'
        : device === 'bluetooth'
        ? 'Bluetooth'
        : 'Wired';
    setSelectedAudioDevice(device);
    setAudioDeviceSheetVisible(false);
    // eslint-disable-next-line no-console
    console.log('[call][audio-route] selected', {
      route: device,
      label: routeLabel,
      callId: activeCallId,
      mode: activeCallMode,
    });
    if (__DEV__) {
      showSuccessToast(`Audio route: ${routeLabel}`);
    }
  }, [activeCallId, activeCallMode]);

  const openAudioDeviceSheet = useCallback(() => {
    if (selectedAudioDevice !== 'speaker') {
      // Directly switch to speaker — avoids opening the picker with earpiece highlighted.
      selectAudioDevice('speaker');
    } else {
      // Already on speaker: open the picker so the user can choose earpiece / bluetooth.
      setAudioDeviceSheetVisible((prev) => !prev);
    }
  }, [selectedAudioDevice, selectAudioDevice]);

  const getAgoraUidForCurrentUser = useCallback((): number => {
    const raw = String(currentUserId ?? '').trim();
    if (!raw) return 0;
    if (/^\d+$/.test(raw)) {
      const numeric = Number(raw);
      if (Number.isFinite(numeric) && numeric > 0) return numeric;
    }
    let hash = 0;
    for (let i = 0; i < raw.length; i += 1) {
      hash = ((hash * 31) + raw.charCodeAt(i)) >>> 0;
    }
    return (hash % 2147483646) + 1;
  }, [currentUserId]);

  const fetchAgoraRtcToken = useCallback(
    async (
      channelName: string,
      uid: number
    ): Promise<{ token: string | null; uid: number }> => {
      try {
        const res = await apiClient.post(endpoints.rtc.agoraToken, { channelName, uid });
        const root = (res.data ?? {}) as Record<string, unknown>;
        const data = (root.data ?? root) as Record<string, unknown>;
        const token = firstNonEmptyString(data.token, root.token);
        const serverUidRaw = data.uid ?? root.uid;
        const serverUid =
          typeof serverUidRaw === 'number' && Number.isFinite(serverUidRaw)
            ? serverUidRaw
            : typeof serverUidRaw === 'string' && /^\d+$/.test(serverUidRaw)
            ? Number(serverUidRaw)
            : uid;
        return { token: token ?? null, uid: serverUid };
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log('[agora] token fetch failed', { channelName, uid, error });
        return { token: null, uid };
      }
    },
    []
  );

  useEffect(() => {
    if (!callStateVisible) return;
    void agoraCallService.setMuted(!callAudioEnabled);
  }, [callAudioEnabled, callStateVisible]);

  useEffect(() => {
    if (!callStateVisible) return;
    void agoraCallService.applyAudioOutputRoute(selectedAudioDevice);
  }, [selectedAudioDevice, callStateVisible]);

  useEffect(() => {
    if (!callStateVisible || activeCallMode !== 'video') return;
    void agoraCallService.setLocalVideoEnabled(callVideoEnabled);
  }, [activeCallMode, callStateVisible, callVideoEnabled]);

  useEffect(() => {
    const unsubscribe = agoraCallService.onRemoteUidChange((uid) => {
      setRemoteRtcUid(uid);
    });
    return unsubscribe;
  }, []);

  /** Keep menu + FAB in sync with real Agora/OS route (e.g. speaker playing while UI still said earpiece). */
  useEffect(() => {
    const unsub = agoraCallService.subscribeAudioRoute((route) => {
      if (!callStateVisibleRef.current) return;
      setSelectedAudioDevice(route);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') return;
      socketService.ensureConnected();
      if (chatId) {
        socketService.join(chatId);
      }
      if (!callStateVisibleRef.current) return;
      setCallMediaResumeNonce((n) => n + 1);
    });
    return () => subscription.remove();
  }, [chatId]);

  useEffect(() => {
    if (!callStateVisible || !activeCallId || !activeCallChannelName) return;
    let cancelled = false;
    const join = async () => {
      await stopCallRing();
      const fallbackUid = getAgoraUidForCurrentUser();
      const tokenPayload = await fetchAgoraRtcToken(activeCallChannelName, fallbackUid);
      const resolvedToken = firstNonEmptyString(activeCallRtcToken, tokenPayload.token);
      const resolvedUid = tokenPayload.uid || fallbackUid;
      if (cancelled) return;
      setLocalRtcUid(resolvedUid);
      await agoraCallService.joinVoiceChannel({
        channelName: activeCallChannelName,
        token: resolvedToken,
        uid: resolvedUid,
        isVideoCall: activeCallMode === 'video',
        localVideoEnabled: activeCallMode === 'video' ? callVideoEnabledRef.current : false,
      });
      if (!cancelled) {
        await agoraCallService.applyAudioOutputRoute(selectedAudioDeviceRef.current);
        if (Platform.OS === 'android' && activeCallMode === 'video' && callVideoEnabledRef.current) {
          setTimeout(() => {
            if (!cancelled) void agoraCallService.ensureLocalVideoPreviewReady();
          }, 280);
        }
      }
    };
    void join();
    return () => {
      cancelled = true;
    };
  }, [
    activeCallId,
    activeCallChannelName,
    activeCallRtcToken,
    activeCallMode,
    callStateVisible,
    fetchAgoraRtcToken,
    getAgoraUidForCurrentUser,
  ]);

  useEffect(() => {
    if (!callStateVisible || !activeCallId || !activeCallChannelName || callMediaResumeNonce === 0) {
      return;
    }
    let cancelled = false;
    const resume = async () => {
      await agoraCallService.rejoinLastChannelIfNeeded();
      if (cancelled) return;
      if (Platform.OS === 'android' && activeCallMode === 'video' && callVideoEnabledRef.current) {
        setTimeout(() => {
          if (!cancelled) void agoraCallService.ensureLocalVideoPreviewReady();
        }, 280);
      }
    };
    void resume();
    return () => {
      cancelled = true;
    };
  }, [
    callMediaResumeNonce,
    callStateVisible,
    activeCallId,
    activeCallChannelName,
    activeCallMode,
  ]);

  const requestSwitchVoiceToVideo = useCallback(() => {
    if (!activeCallId) return;
    setSwitchToVideoPopupVisible(false);
    socketService.callSwitchRequest(activeCallId, 'video');
    setIsSwitchingVoiceToVideo(true);
  }, [activeCallId]);

  const respondToIncomingCallSwitchRequest = useCallback(
    (accepted: boolean) => {
      if (!activeCallId) return;
      socketService.callSwitchResponse(activeCallId, accepted, 'video');
      setIncomingCallSwitchRequestVisible(false);
    },
    [activeCallId]
  );

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
  /** Figma: white FAB when sheet open or when route is not default earpiece (speaker / Bluetooth / wired). */
  const audioRouteFabHighlighted =
    audioDeviceSheetVisible || selectedAudioDevice !== 'earpiece';
  const isPartnerFullyOff = !partnerAudioEnabled && !partnerVideoEnabled;
  const showPartnerMicOffState = partnerVideoEnabled && !partnerAudioEnabled;
  const showVideoPreviewOffSurface = !callVideoEnabled;
  const showRemoteRtcVideo =
    activeCallMode === 'video' &&
    remoteRtcUid != null &&
    AgoraRtcSurfaceView != null;
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
      <View style={styles.screenColumn}>
        <StatusBar
          barStyle="dark-content"
          translucent={Platform.OS === 'android' ? false : undefined}
          backgroundColor={colors.white}
        />
        <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => navigation.navigate('ChatList')}
          accessibilityRole="button"
          accessibilityLabel="Back to chats"
        >
          <BackArrowIcon size={48} />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.8} onPress={openMatchDetails}>
          <Image source={partnerDisplaySource} style={styles.headerAvatar} resizeMode="cover" />
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
            style={[
              styles.headerAskAiraButton,
              !isSubscribed && styles.headerPremiumFeatureDisabled,
            ]}
            onPress={() => {
              if (!ensurePremiumAccess()) return;
              if (dontShowAskAiraPersisted && chatId) {
                requestAiSuggestions();
              } else {
                setAskAiraConfirmVisible(true);
              }
            }}
            activeOpacity={0.8}
            disabled={askAiraConfirmLoading}
            accessibilityRole="button"
            accessibilityLabel={STRINGS.CHAT.ASK_AIRA}
            accessibilityState={{ disabled: !isSubscribed || askAiraConfirmLoading }}
          >
            <AskAiraSendIcon width={52} height={52} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            styles.headerCallButton,
            !isSubscribed && styles.headerPremiumFeatureDisabled,
          ]}
          onPress={handleHeaderVideoCallPress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Video call"
          accessibilityState={{ disabled: !isSubscribed }}
        >
          <ChatHeaderVideoCallIcon size={24} color={colors.black} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.headerCallButton,
            !isSubscribed && styles.headerPremiumFeatureDisabled,
          ]}
          onPress={handleHeaderVoiceCallPress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Voice call"
          accessibilityState={{ disabled: !isSubscribed }}
        >
          <ChatHeaderVoiceCallIcon size={24} color={colors.black} />
        </TouchableOpacity>
        <View ref={moreMenuButtonRef} collapsable={false}>
          <TouchableOpacity style={styles.moreButton} onPress={openMoreMenu} accessibilityLabel="Chat options">
            <MoreVertIcon size={24} color={colors.black} />
          </TouchableOpacity>
        </View>
      </View>
      {incomingCallBannerVisible ? (
        <View style={styles.incomingCallBannerWrap}>
          <View style={styles.incomingCallBanner}>
            <TouchableOpacity
              style={styles.incomingCallBannerHeaderRow}
              activeOpacity={0.9}
              onPress={openIncomingCallFromBanner}
              accessibilityRole="button"
              accessibilityLabel="Incoming call notification"
            >
              <View style={styles.incomingCallBannerAvatarWrap}>
                <Image
                  source={partnerDisplaySource}
                  style={styles.incomingCallBannerAvatar}
                  resizeMode="cover"
                />
                <View style={styles.incomingCallBannerAvatarBadge}>
                  {incomingCallBannerMode === 'voice' ? (
                    <CallVoiceIncomingIcon size={10} color={colors.neutral[800]} />
                  ) : (
                    <IncomingCallNotificationIcon size={10} color={colors.neutral[800]} />
                  )}
                </View>
              </View>

              <View style={styles.incomingCallBannerTextWrap}>
                <Text style={styles.incomingCallBannerTitle} numberOfLines={1}>
                  {incomingCallBannerMode === 'voice'
                    ? incomingVoiceCallerName || name || 'Incoming call'
                    : incomingVideoCallerName || name || 'Incoming call'}
                </Text>
                <Text style={styles.incomingCallBannerSubtitle} numberOfLines={1}>
                  {incomingCallBannerMode === 'voice' ? 'Incoming voice call' : 'Incoming video call'}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.incomingCallBannerButtonsRow}>
              <TouchableOpacity
                onPress={
                  incomingCallBannerMode === 'voice' ? declineIncomingVoiceCall : declineIncomingVideoCall
                }
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Decline incoming call"
                style={[styles.incomingCallBannerButtonPill, styles.incomingCallBannerDeclineButton]}
              >
                <View style={styles.incomingCallBannerButtonPillInner}>
                  <VoiceControlEndIcon size={18} color={colors.white} />
                  <Text style={styles.incomingCallBannerPillText}>Decline</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={
                  incomingCallBannerMode === 'voice' ? acceptIncomingVoiceCall : acceptIncomingVideoCall
                }
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Accept incoming call"
                style={[styles.incomingCallBannerButtonPill, styles.incomingCallBannerAcceptButton]}
              >
                <View style={styles.incomingCallBannerButtonPillInner}>
                  {incomingCallBannerMode === 'voice' ? (
                    <ChatHeaderVoiceCallIcon size={18} color={colors.white} />
                  ) : (
                    <ChatHeaderVideoCallIcon size={18} color={colors.white} />
                  )}
                  <Text style={styles.incomingCallBannerPillText}>Accept</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : null}
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
            <Image source={partnerDisplaySource} style={styles.incomingVoiceAvatar} resizeMode="cover" />
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
              <Animated.View
                style={{ transform: [{ translateY: incomingVoiceSwipeY }] }}
                {...incomingVoiceAcceptPanResponder.panHandlers}
              >
                <TouchableOpacity
                  style={[styles.incomingVoiceActionCircle, styles.incomingVoiceAcceptBtn]}
                  activeOpacity={1}
                  accessibilityRole="button"
                  accessibilityLabel="Swipe up to accept incoming call"
                >
                  <VoiceControlMicIcon size={24} color={colors.white} />
                </TouchableOpacity>
              </Animated.View>
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
          <Image source={partnerDisplaySource} style={styles.incomingVideoFullBgImage} resizeMode="cover" />
          <View style={styles.incomingVideoFullOverlay} />

          <View style={styles.incomingVideoFullTopCenter}>
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
              <Animated.View
                style={{ transform: [{ translateY: incomingVideoSwipeY }] }}
                {...incomingVideoAcceptPanResponder.panHandlers}
              >
                <TouchableOpacity
                  style={[styles.incomingVideoFullActionCircle, styles.incomingVideoFullAcceptBtn]}
                  activeOpacity={1}
                  accessibilityRole="button"
                  accessibilityLabel="Swipe up to accept incoming video call"
                >
                  <CallVideoIncomingIcon size={20} color={colors.white} />
                </TouchableOpacity>
              </Animated.View>
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
        presentationStyle={Platform.OS === 'ios' ? 'fullScreen' : undefined}
        onRequestClose={minimizeCallState}
      >
        {activeCallMode === 'video' ? (
          <SafeAreaView style={styles.videoCallBackdrop} edges={['bottom', 'left', 'right']}>
            <StatusBar
              barStyle="light-content"
              backgroundColor="transparent"
              translucent={Platform.OS === 'android'}
            />
            <View style={styles.videoCallContentRoot}>
              <View style={styles.videoCallMediaLayer} collapsable={false}>
                {!isPartnerFullyOff && !showRemoteRtcVideo ? (
                  <Image source={partnerDisplaySource} style={styles.videoCallBgImage} resizeMode="cover" />
                ) : (
                  <View style={styles.videoCallBgFallback} />
                )}
                {!videoCallUiHidden ? (
                  isPartnerFullyOff ? (
                    <View style={styles.videoCallForeground}>
                      <View style={styles.videoCallPartnerFullyOffStateCompact}>
                        <Image
                          source={partnerDisplaySource}
                          style={styles.videoCallPartnerFullyOffAvatarCompact}
                          resizeMode="cover"
                        />
                      </View>
                    </View>
                  ) : showRemoteRtcVideo ? (
                    AgoraRtcSurfaceView ? (
                      <AgoraRtcSurfaceView
                        style={styles.videoCallRemoteSurface}
                        canvas={{ uid: remoteRtcUid, renderMode: 1 }}
                      />
                    ) : null
                  ) : (
                    <View style={styles.videoCallForeground}>
                      <View style={styles.videoCallVideoOffState}>
                        <View style={styles.videoCallVideoOffAvatarWrap}>
                          <Image
                            source={partnerDisplaySource}
                            style={styles.videoCallVideoOffAvatar}
                            resizeMode="cover"
                          />
                        </View>
                        <Text style={styles.videoCallVideoOffName} numberOfLines={1}>
                          {name}
                        </Text>
                        <Text style={styles.videoCallVideoOffTitle}>Video is off</Text>
                        <Text style={styles.videoCallVideoOffSubtitle} numberOfLines={2}>
                          Turn on your camera to continue video call.
                        </Text>
                      </View>
                    </View>
                  )
                ) : null}
              </View>

              {!videoCallUiHidden ? (
                <LinearGradient
                  pointerEvents="none"
                  colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0)']}
                  locations={[0, 0.5, 1]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.videoCallTopGradientLinear}
                />
              ) : null}

              {!videoCallUiHidden ? (
                <View
                  style={[
                    styles.videoCallTopBar,
                    { paddingTop: Math.max(8, insets.top + 4) },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.videoCallTopBackButton}
                    onPress={minimizeCallState}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel="Go back to chat"
                  >
                    <BackArrowIcon
                      size={48}
                      circular
                      backgroundColor="transparent"
                      strokeColor={colors.white}
                    />
                  </TouchableOpacity>
                  <View style={styles.videoCallTopNameRow}>
                    <View style={styles.videoCallTopNameWrap}>
                      <Text style={styles.videoCallTopName} numberOfLines={1}>
                        {name}
                      </Text>
                    </View>
                    {showPartnerMicOffState ? (
                      <View style={styles.videoCallTopMicOffPill}>
                        <VoiceControlMicOffIcon size={12} color={colors.white} />
                      </View>
                    ) : null}
                  </View>
                  <View style={styles.videoCallTopHeaderSpacer}>
                    {callConnectedAtMs != null ? (
                      <View style={styles.videoCallTopTimerPill}>
                        <View style={styles.videoCallTopTimerDot} />
                        <Text style={styles.videoCallTopTimerText}>{callDurationLabel}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              ) : null}

              {!videoCallUiHidden || videoCallUiHidden ? (
                <View
                  collapsable={false}
                  style={[
                    styles.videoCallLocalPreview,
                    {
                      bottom: videoCallUiHidden ? videoPipBottomWhenUiHidden : videoPipBottom,
                      right: videoPipRight,
                      width: videoPipWidth,
                      height: videoPipHeight,
                    },
                  ]}
                >
                  {!showVideoPreviewOffSurface ? (
                    AgoraRtcSurfaceView ? (
                      <AgoraRtcSurfaceView
                        style={styles.videoCallLocalPreviewSurface}
                        canvas={{ uid: localRtcUid, sourceType: 0, renderMode: 1, mirrorMode: 1 }}
                        zOrderMediaOverlay
                      />
                    ) : (
                      <Image
                        source={localVideoPreviewFallback}
                        style={styles.videoCallLocalPreviewAvatar}
                        resizeMode="cover"
                      />
                    )
                  ) : (
                    <View style={styles.videoCallLocalPreviewOffSurface}>
                      <Image
                        source={localVideoPreviewFallback}
                        style={styles.videoCallLocalPreviewOffAvatar}
                        resizeMode="cover"
                      />
                    </View>
                  )}
                  {!videoCallUiHidden && !callAudioEnabled ? (
                    <View style={styles.videoCallLocalPreviewMicOffIcon}>
                      <VoiceControlMicOffIcon size={14} color={colors.white} />
                    </View>
                  ) : null}
                  {!videoCallUiHidden ? (
                    <TouchableOpacity
                      style={[
                        styles.videoCallLocalPreviewSwitchIcon,
                        { right: videoPipFlipInsetX, bottom: videoPipFlipInsetY },
                      ]}
                      activeOpacity={0.75}
                      onPress={flipVideoCallCamera}
                      accessibilityRole="button"
                      accessibilityLabel="Switch camera"
                      hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                    >
                      <CameraFlipIcon size={20} color={colors.white} />
                    </TouchableOpacity>
                  ) : null}
                </View>
              ) : null}

              {!videoCallUiHidden ? (
                <View
                  style={[styles.videoCallBottomControlsWrap, { bottom: videoBottomChromeOffset }]}
                >
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
                      audioRouteFabHighlighted && styles.videoCallBottomActionSelected,
                    ]}
                    onPress={openAudioDeviceSheet}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel="Choose audio device"
                  >
                    {selectedAudioDevice === 'bluetooth' ? (
                      <AudioBluetoothIcon
                        size={24}
                        color={audioRouteFabHighlighted ? colors.black : colors.white}
                      />
                    ) : (
                      <VoiceControlSpeakerIcon
                        size={24}
                        color={audioRouteFabHighlighted ? colors.black : colors.white}
                      />
                    )}
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
              <View
                style={[
                  styles.videoCallAudioDevicePopoverWrap,
                  { left: videoAudioPopoverLeft, bottom: videoAudioPopoverBottom },
                ]}
              >
                {renderAudioDevicePopoverOptions()}
              </View>
            ) : null}

            {videoCallUiHidden ? (
              <TouchableWithoutFeedback onPress={toggleVideoCallUiHidden}>
                <View style={styles.videoCallHiddenUiTapArea} />
              </TouchableWithoutFeedback>
            ) : null}
            </View>
          </SafeAreaView>
        ) : (
          <SafeAreaView style={styles.callStateBackdrop} edges={['top', 'left', 'right', 'bottom']}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" />
            <View style={[styles.callStateContent, styles.callStateContentRinging]}>
              <View
                style={[
                  styles.callStateRingingHeader,
                  { paddingTop: Math.max(8, insets.top + 4) },
                ]}
              >
                <TouchableOpacity
                  style={styles.callStateRingingBackButton}
                  onPress={minimizeCallState}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Go back to chat"
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

              <View
                style={[
                  styles.callStatePickedCenterWrap,
                  isOutgoingVoiceRinging && styles.callStatePickedCenterWrapRinging,
                ]}
              >
                <View style={styles.callStatePickedAvatarWrap}>
                  {!isOutgoingVoiceRinging ? (
                    <>
                      <View style={styles.callStatePickedOuterRing} />
                      <View style={styles.callStatePickedInnerRing} />
                    </>
                  ) : null}
                  <Image
                    source={partnerDisplaySource}
                    style={[
                      styles.callStateAvatar,
                      isOutgoingVoiceRinging
                        ? styles.callStateAvatarRinging
                        : styles.callStateAvatarPicked,
                    ]}
                    resizeMode="cover"
                  />
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
                      audioRouteFabHighlighted && styles.callStateRingingActionButtonSelected,
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
                      {selectedAudioDevice === 'bluetooth' ? (
                        <AudioBluetoothIcon
                          size={24}
                          color={audioRouteFabHighlighted ? colors.black : colors.white}
                        />
                      ) : (
                        <VoiceControlSpeakerIcon
                          size={24}
                          color={audioRouteFabHighlighted ? colors.black : colors.white}
                        />
                      )}
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
              {incomingCallSwitchRequestVisible ? (
                <View style={styles.callStateSwitchPopupBackdrop}>
                  <View style={styles.callStateSwitchPopupSheet}>
                    <View style={styles.callStateSwitchPopupHandle} />
                    <View style={styles.callStateSwitchPopupIconWrap}>
                      <CallVideoIncomingIcon size={40} color={colors.primary.purple} />
                    </View>
                    <Text style={styles.callStateSwitchPopupTitle}>Video call request</Text>
                    <Text style={styles.callStateSwitchPopupSubtitle}>
                      The other person wants to switch this call to video.
                    </Text>
                    <View style={styles.callStateSwitchPopupActions}>
                      <TouchableOpacity
                        style={styles.callStateSwitchPopupCancelButton}
                        activeOpacity={0.8}
                        onPress={() => respondToIncomingCallSwitchRequest(false)}
                      >
                        <Text style={styles.callStateSwitchPopupCancelText}>Decline</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.callStateSwitchPopupSwitchButton}
                        activeOpacity={0.85}
                        onPress={() => respondToIncomingCallSwitchRequest(true)}
                      >
                        <LinearGradient
                          colors={['#CB7BF5', '#7742F0']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.callStateSwitchPopupSwitchGradient}
                        >
                          <Text style={styles.callStateSwitchPopupSwitchText}>Accept</Text>
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
                    if (!ensurePremiumAccess()) {
                      setAskAiraConfirmVisible(false);
                      return;
                    }
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
      <View style={styles.chatContentShell}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatMessagesScroll}
          onLayout={(e) => {
            layoutHeightRef.current = e.nativeEvent.layout.height;
          }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          showsVerticalScrollIndicator={false}
          onScroll={handleMessagesScroll}
          onContentSizeChange={(w, h) => {
            contentHeightRef.current = h;
          }}
          scrollEventThrottle={16}
        >
          {messagesLoading ? (
            <ChatMessagesSkeleton />
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

        {isSubscribed ? (
        <View
          style={[
            styles.chatFooter,
            composerBottomOffset > 0 && { marginBottom: composerBottomOffset },
            Platform.OS === 'android' &&
              isKeyboardVisible &&
              composerBottomOffset <= 0 && { marginBottom: Math.round(windowHeight * 0.36) },
          ]}
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
                    <View
                      style={[
                        styles.inputBar,
                        {
                          paddingBottom:
                            12 + (composerBottomOffset > 0 ? 0 : bottomSafeInset),
                        },
                        (pendingAttachments.length > 0 || isMultilineComposer) &&
                          styles.inputBarWithAttachments,
                      ]}
                    >
            <View
              style={[
                styles.inputWrap,
                pendingAttachments.length > 0 && styles.inputWrapWithAttachments,
                isMultilineComposer &&
                  pendingAttachments.length === 0 &&
                  styles.inputWrapExpandedMultiline,
              ]}
            >
            {pendingAttachments.length > 0 && (
              <ComposerAttachmentPreviews
                attachments={pendingAttachments}
                sendLoading={sendLoading || pendingMediaUploadCount > 0}
                onRemove={(index) =>
                  setPendingAttachments((p) => p.filter((_, idx) => idx !== index))
                }
              />
            )}
            <View
              style={[
                styles.inputRow,
                !isMultilineComposer && styles.inputRowCompact,
                isMultilineComposer && styles.inputRowExpanded,
              ]}
            >
              <TouchableOpacity
                style={styles.attachButton}
                activeOpacity={0.7}
                disabled={voice.voiceSendLoading}
                onPress={() => setAttachmentSheetOpen(true)}
              >
                <PlusIcon size={20} color={colors.black} />
              </TouchableOpacity>
              <View
                style={[
                  styles.composerInputOuter,
                  inputText.length === 0 && styles.composerInputOuterCompact,
                ]}
              >
                {inputText.length === 0 && (
                  <View style={styles.composerPlaceholderWrap} pointerEvents="none">
                    <Text style={styles.composerPlaceholderText} numberOfLines={1}>
                      {otherUserTyping ? 'typing…' : STRINGS.CHAT.START_CHAT_PLACEHOLDER}
                    </Text>
                  </View>
                )}
                <TextInput
                  style={styles.chatInput}
                  ref={inputRef}
                  placeholder=""
                  value={inputText}
                  autoCorrect={false}
                  editable={!voice.voiceSendLoading}
                  onChangeText={setInputText}
                  onSelectionChange={(event) => {
                    const { start, end } = event.nativeEvent.selection;
                    composerSelectionRef.current = { start, end };
                  }}
                  onKeyPress={(event) => {
                    if (Platform.OS !== 'ios' || event.nativeEvent.key !== 'Enter') return;
                    const { start, end } = composerSelectionRef.current;
                    const safeStart = Math.max(0, Math.min(start, inputText.length));
                    const safeEnd = Math.max(safeStart, Math.min(end, inputText.length));
                    const nextText = `${inputText.slice(0, safeStart)}\n${inputText.slice(safeEnd)}`;
                    const nextCursor = safeStart + 1;
                    setInputText(nextText);
                    requestAnimationFrame(() => {
                      composerSelectionRef.current = { start: nextCursor, end: nextCursor };
                      inputRef.current?.setNativeProps({
                        selection: { start: nextCursor, end: nextCursor },
                      });
                    });
                  }}
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
                  blurOnSubmit={false}
                  scrollEnabled
                  underlineColorAndroid="transparent"
                  textAlignVertical="top"
                  disableFullscreenUI
                  returnKeyType="default"
                  keyboardType="default"
                />
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.sendButton,
              (pendingAttachments.length > 0 || isMultilineComposer) &&
                styles.sendButtonWithAttachments,
              !inputText.trim() && pendingAttachments.length === 0 && styles.sendButtonMic,
              (sendLoading || pendingMediaUploadCount > 0 || voice.voiceSendLoading) &&
                styles.sendButtonDisabled,
            ]}
            activeOpacity={0.8}
            onPress={() => {
              if (!inputText.trim() && pendingAttachments.length === 0) {
                handleMicPress().catch(() => {});
                return;
              }
              handleSend().catch(() => {});
            }}
            disabled={sendLoading || pendingMediaUploadCount > 0 || voice.voiceSendLoading}
          >
            {sendLoading && pendingMediaUploadCount === 0 ? (
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
        ) : null}
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
        snapPoints={[330]}
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
        snapPoints={[330]}
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
        snapPoints={[330]}
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

      {!isSubscribed ? (
        <View style={styles.subscriptionGateDock}>
          <View
            style={[
              styles.subscriptionGateInner,
              { paddingBottom: 12 + bottomSafeInset },
            ]}
          >
            <Button
              title="Subscribe to Aira+ to send messages"
              onPress={() => navigateToSubscription(navigation)}
              centerTitleOnly
              style={styles.subscriptionGateButton}
            />
          </View>
        </View>
      ) : null}
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
