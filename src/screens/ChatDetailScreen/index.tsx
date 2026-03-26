import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Linking,
  StatusBar,
  ActivityIndicator,
  LayoutChangeEvent,
  useWindowDimensions,
  type KeyboardEvent,
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
} from '../../config/permissions';
import { BackArrowIcon } from '../../assets/icons/common/BackArrowIcon';
import { MoreVertIcon } from '../../assets/icons/common/MoreVertIcon';
import { BlockIcon } from '../../assets/icons/common/BlockIcon';
import { ReportIcon } from '../../assets/icons/common/ReportIcon';
import { InterestChipCheckIcon } from '../../assets/icons/common/InterestChipCheckIcon';
import { PlusIcon } from '../../assets/icons/common/PlusIcon';
import { ForwardArrowIcon } from '../../assets/icons/common/ForwardArrowIcon';
import { DeleteIcon } from '../../assets/icons/common/DeleteIcon';
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
import { setChatRequestActionApi, blockUserApi, reportUserApi, getChatMessagesApi, mapApiMessageToChatMessage, markChatSeenApi, sendMessageApi, uploadChatFileApi, postAIMessagesApi, getAiSuggestionsApi, deleteMessageApi, type ChatMessageApiItem } from '../../modules/chat/api';
import { useAuthStore } from '../../store/auth.store';
import socketService, { type MessageReceivePayload, type MessageDeletePayload, type TypingPayload } from '../../services/socket/socketService';   
import { styles, H_PADDING } from './styles';
import { TabAICenterIcon } from '../../assets/icons/tabs/TabAICenterIcon';
import { apiClient } from '../../services/api/client';
import { endpoints } from '../../services/api/endpoints';

type Props = NativeStackScreenProps<ChatStackParamList, 'ChatDetail'>;

type ChatMessage =
  | { type: 'text'; text: string; timestamp: string; sent: boolean; replyTo?: { senderName: string; preview: string }; messageId?: string }
  | { type: 'voice'; uri: string; timestamp: string; sent: boolean; messageId?: string }
  | { type: 'image'; uri: string; timestamp: string; sent: boolean; messageId?: string }
  | { type: 'file'; uri: string; name: string; timestamp: string; sent: boolean; messageId?: string };

// const VOICE_WAVEFORM = [8, 12, 6, 14, 10, 16, 8, 14, 12, 10];

const DONT_SHOW_ASK_AIRA_CONFIRM_KEY = 'dont_show_ask_aira_confirm';
const MESSAGES_PAGE_SIZE = 10;

const REPORT_REASONS: { value: string; label: string }[] = [
  { value: 'inappropriate_messages', label: 'Inappropriate messages' },
  { value: 'fake_or_spam', label: 'Fake or spam account' },
  { value: 'harassment_or_bullying', label: 'Harassment or bullying' },
  { value: 'offensive_profile', label: 'Offensive profile content' },
  { value: 'underage_user', label: 'Underage user' },
  { value: 'something_else', label: "It's something else" },
];

const now = () => {
  const d = new Date();
  return `${d.getHours() > 12 ? d.getHours() - 12 : d.getHours()}:${d.getMinutes().toString().padStart(2, '0')} ${d.getHours() >= 12 ? 'pm' : 'am'}`;
};

function isAiraLimitError(err: unknown): boolean {
  const status = (err as { response?: { status?: number } })?.response?.status;
  const data = (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data;
  const msg = ((data?.message ?? data?.error) ?? '').toString().toLowerCase();
  return status === 429 || msg.includes('limit') || msg.includes('suggestion') || msg.includes('quota');
}

/** Time until next midnight (local) for "come back in" countdown */
function getTimeUntilMidnight(): { hours: number; minutes: number; seconds: number } {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diff = Math.max(0, midnight.getTime() - now.getTime());
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { hours, minutes, seconds };
}

function parseAiraTimeLeft(
  value: string | null | undefined
): { hours: number; minutes: number; seconds: number } | null {
  if (!value) return null;
  const match = value.trim().match(/^(\d{1,2}):(\d{2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = Number(match[3]);
  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    Number.isNaN(seconds) ||
    minutes > 59 ||
    seconds > 59
  ) {
    return null;
  }
  return { hours, minutes, seconds };
}

function decrementCountdown(prev: { hours: number; minutes: number; seconds: number }) {
  const total = prev.hours * 3600 + prev.minutes * 60 + prev.seconds;
  if (total <= 0) return prev;
  const next = total - 1;
  return {
    hours: Math.floor(next / 3600),
    minutes: Math.floor((next % 3600) / 60),
    seconds: next % 60,
  };
}

/** Format timestamp from socket (ISO string or ms number) for display; fallback to now(). */
function formatMessageTimestamp(value: string | number | undefined): string {
  if (value == null) return now();
  const d = typeof value === 'number' ? new Date(value) : new Date(value);
  if (Number.isNaN(d.getTime())) return now();
  const h = d.getHours();
  const m = d.getMinutes();
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  const ampm = h >= 12 ? 'pm' : 'am';
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

/**
 * add-chat-list returns chat id at `data.chat.id` (see API envelope: data.data.chat).
 * Older code only read `data.chatId` / `data.id`, so `effectiveChatId` was always null.
 */
function extractChatIdFromAddChatResponse(addRes: { data?: unknown }): string | null {
  const body = addRes?.data as Record<string, unknown> | undefined;
  if (!body) return null;
  const inner = body.data as Record<string, unknown> | undefined;
  const chat = inner?.chat as Record<string, unknown> | undefined;
  const fromChat = chat?.id ?? chat?._id;
  if (typeof fromChat === 'string' && fromChat.length > 0) return fromChat;
  if (inner) {
    for (const key of ['chatId', 'id', '_id'] as const) {
      const v = inner[key];
      if (typeof v === 'string' && v.length > 0) return v;
    }
  }
  for (const key of ['chatId', 'id', '_id'] as const) {
    const v = body[key];
    if (typeof v === 'string' && v.length > 0) return v;
  }
  return null;
}

/** Keyboard overlap with the app window (aligned with MatchScreen). */
function keyboardOverlapFromEvent(windowHeight: number, e: KeyboardEvent): number {
  const ec = e.endCoordinates;
  if (!ec || windowHeight <= 0) return 0;

  if (Platform.OS === 'ios') {
    const screenY = typeof ec.screenY === 'number' ? ec.screenY : windowHeight;
    return Math.max(0, Math.min(windowHeight, windowHeight - screenY));
  }

  let h = typeof ec.height === 'number' && ec.height > 0 ? ec.height : 0;
  if (typeof ec.screenY === 'number') {
    const fromScreenY = Math.max(0, windowHeight - ec.screenY);
    if (h <= 0) {
      h = fromScreenY;
    } else if (fromScreenY > 0) {
      const delta = Math.abs(h - fromScreenY);
      if (delta > 80) {
        h = Math.max(h, fromScreenY);
      }
    }
  }
  return Math.max(0, h);
}

export const ChatDetailScreen = ({ route, navigation }: Props) => {
  const { name, avatar, chatId: initialChatId, isRequest, otherUserId } = route.params;
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const bottomSafeInset = insets.bottom;
  const currentUserId = useAuthStore((s) => s.user?.id);
  const [chatId, setChatId] = useState<string | null>(initialChatId ?? null);
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
  const [pendingAttachments, setPendingAttachments] = useState<Array<{ type: 'image'; uri: string } | { type: 'file'; uri: string; name: string }>>([]);
  const [moreMenuVisible, setMoreMenuVisible] = useState(false);
  const [blockConfirmVisible, setBlockConfirmVisible] = useState(false);
  const [blockConfirmLoading, setBlockConfirmLoading] = useState(false);
  const [showReportSheet, setShowReportSheet] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState<string | null>(null);
  const [reportMessageInput, setReportMessageInput] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  // Voice chat state (disabled)
  // const [voiceBarVisible, setVoiceBarVisible] = useState(false);
  // const [voiceSeconds, setVoiceSeconds] = useState(0);
  // const [voicePaused, setVoicePaused] = useState(false);
  // const [voiceSendLoading, setVoiceSendLoading] = useState(false);
  // const voiceTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // const isRecordingRef = useRef(false);
  // const audioRecorderPlayerRef = useRef(new AudioRecorderPlayer());
  // const [recordFilePath, setRecordFilePath] = useState<string | null>(null);
  const [askAiraGenerating, setAskAiraGenerating] = useState(false);
  const [generatedReplies, setGeneratedReplies] = useState<string[] | null>(null);
  const [askAiraConfirmVisible, setAskAiraConfirmVisible] = useState(false);
  const [dontShowAskAiraAgain, setDontShowAskAiraAgain] = useState(false);
  const [dontShowAskAiraPersisted, setDontShowAskAiraPersisted] = useState(false);
  const [askAiraConfirmLoading, setAskAiraConfirmLoading] = useState(false);
  const [airaLimitReachedVisible, setAiraLimitReachedVisible] = useState(false);
  const [airaLimitCountdown, setAiraLimitCountdown] = useState({ hours: 23, minutes: 47, seconds: 12 });
  const [airaSuggestionsLimitLeft, setAiraSuggestionsLimitLeft] = useState<number | null>(null);
  const [airaSuggestionsTotalLimit, setAiraSuggestionsTotalLimit] = useState<number | null>(null);
  const [selectedReplyIndex, setSelectedReplyIndex] = useState(0);
  const [messageContextIndex, setMessageContextIndex] = useState<number | null>(null);
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
  const isPickingFileRef = useRef(false);
  const [replyingTo, setReplyingTo] = useState<{ index: number; message: ChatMessage; senderName: string; messageId?: string } | null>(null);
  const [sendLoading, setSendLoading] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [otherUserOnline, setOtherUserOnline] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [composerHeight, setComposerHeight] = useState(120);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const aiSuggestionsRequestIdRef = useRef(0);
  const typingStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const otherUserTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  // Prevent the "auto scroll to bottom" effect from running when we prepend older messages.
  // (When pagination prepends items, ScrollView tends to jump if we always scrollToEnd.)
  const isPrependingOlderMessagesRef = useRef(false);
  const contentHeightRef = useRef(0);
  const scrollYRef = useRef(0);
  const layoutHeightRef = useRef(0);
  const didInitialScrollToBottomRef = useRef(false);
  const pendingPrependScrollRef = useRef<{ prevScrollY: number; prevContentHeight: number } | null>(null);
  const handleComposerLayout = useCallback((event: LayoutChangeEvent) => {
    const nextHeight = Math.round(event.nativeEvent.layout.height);
    if (nextHeight > 0) {
      setComposerHeight((prev) => (prev === nextHeight ? prev : nextHeight));
    }
  }, []);

  const scrollToEndAfterKeyboard = useCallback((animated: boolean) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollViewRef.current?.scrollToEnd({ animated });
      });
    });
  }, []);

  useEffect(() => {
    const applyOverlap = (e: KeyboardEvent) => {
      const overlap = keyboardOverlapFromEvent(windowHeight, e);
      setKeyboardHeight(overlap);
      scrollToEndAfterKeyboard(true);
    };

    if (Platform.OS === 'ios') {
      const frameSub = Keyboard.addListener('keyboardWillChangeFrame', applyOverlap);
      const hideSub = Keyboard.addListener('keyboardWillHide', () => {
        setKeyboardHeight(0);
        scrollToEndAfterKeyboard(true);
      });
      return () => {
        frameSub.remove();
        hideSub.remove();
      };
    }

    const showSub = Keyboard.addListener('keyboardDidShow', applyOverlap);
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
      scrollToEndAfterKeyboard(false);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [windowHeight, scrollToEndAfterKeyboard]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setKeyboardHeight(0);
        Keyboard.dismiss();
      };
    }, [])
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


  const getMessageTypeFromAttachment = (
    att: { type: 'image'; uri: string } | { type: 'file'; uri: string; name: string }
  ): 'image' | 'audio' | 'video' => {
    if (att.type === 'image') return 'image';
    const name = (att as { type: 'file'; name: string }).name?.toLowerCase() ?? '';
    const ext = name.split('.').pop() ?? '';
    if (['mp4', 'mov', 'webm', 'mkv'].includes(ext)) return 'video';
    if (['mp3', 'm4a', 'wav', 'aac', 'ogg'].includes(ext)) return 'audio';
    return 'video';
  };

  const getMimeTypeFromAttachment = (
    att: { type: 'image'; uri: string } | { type: 'file'; uri: string; name: string }
  ): string => {
    if (att.type === 'image') return 'image/jpeg';
    const name = (att as { type: 'file'; name: string }).name?.toLowerCase() ?? '';
    const ext = name.split('.').pop() ?? '';
    if (['mp4', 'mov', 'webm', 'mkv'].includes(ext)) return 'video/mp4';
    if (['mp3', 'm4a', 'wav', 'aac', 'ogg'].includes(ext)) return 'audio/mpeg';
    return 'application/octet-stream';
  };

  const getFileTypeLabel = (name: string) => {
    const ext = name.split('.').pop()?.toUpperCase() ?? 'FILE';
    return ext.length <= 4 ? ext : 'FILE';
  };

  // Voice bar timer helpers (voice chat disabled)
  // const formatVoiceTime = (seconds: number) => {
  //   const m = Math.floor(seconds / 60);
  //   const s = seconds % 60;
  //   return `${m}:${s.toString().padStart(2, '0')}`;
  // };
  //
  // useEffect(() => {
  //   if (!voiceBarVisible || voicePaused) {
  //     if (voiceTimerRef.current) {
  //       clearInterval(voiceTimerRef.current);
  //       voiceTimerRef.current = null;
  //     }
  //     return;
  //   }
  //   voiceTimerRef.current = setInterval(() => {
  //     setVoiceSeconds((prev) => prev + 1);
  //   }, 1000);
  //   return () => {
  //     if (voiceTimerRef.current) {
  //       clearInterval(voiceTimerRef.current);
  //       voiceTimerRef.current = null;
  //     }
  //   };
  // }, [voiceBarVisible, voicePaused]);

  // Turn off "thinking" once API response resolves (or is handled as limit reached).
  useEffect(() => {
    if (!askAiraGenerating) return;
    if (generatedReplies != null || airaLimitReachedVisible) {
      setAskAiraGenerating(false);
    }
  }, [askAiraGenerating, generatedReplies, airaLimitReachedVisible]);

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
        const raw = res.data?.list ?? res.data?.messages ?? [];
        const list = Array.isArray(raw)
          ? raw
              .map((item) => mapApiMessageToChatMessage(item, currentUserId ?? undefined))
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

      const ui = mapApiMessageToChatMessage(adjusted, currentUserId);
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
                  .map((item) => mapApiMessageToChatMessage(item, currentUserId ?? undefined))
                  .filter((m): m is ChatMessage => m != null)
                  .reverse()
              : [];
            setMessages(list);
          })
          .catch(() => {});
      }
    });
    return () => {
      unsubMessage();
      unsubDelete();
      unsubTyping();
      unsubJoinSuccess();
      unsubConnection();
    };
  }, [chatId, currentUserId, otherUserId, isOtherUserOnlineFromPayload]);

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
            .map((item) => mapApiMessageToChatMessage(item, currentUserId ?? undefined))
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

  useEffect(() => {
    if (messagesLoading || messages.length === 0) return;
    if (isPrependingOlderMessagesRef.current) {
      // We prepended older messages due to pagination; keep the current scroll position.
      // Next message update (e.g. new incoming/append) can scroll as normal.
      isPrependingOlderMessagesRef.current = false;
      const pending = pendingPrependScrollRef.current;
      pendingPrependScrollRef.current = null;
      if (pending) {
        // After React prepends content, adjust scrollY by the added content height.
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
    const distanceFromBottom =
      (contentHeightRef.current ?? 0) -
      ((scrollYRef.current ?? 0) + (layoutHeightRef.current ?? 0));
    const isNearBottom = distanceFromBottom < 120;
    const shouldScrollNow = !didInitialScrollToBottomRef.current || isNearBottom;
    if (!shouldScrollNow) return;
    didInitialScrollToBottomRef.current = true;
    const id = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: false });
    }, 100);
    return () => clearTimeout(id);
  }, [messagesLoading, messages.length]);

  useEffect(() => {
    AsyncStorage.getItem(DONT_SHOW_ASK_AIRA_CONFIRM_KEY).then((value) => {
      setDontShowAskAiraPersisted(value === 'true');
    });
  }, []);

  useEffect(() => {
    if (!airaLimitReachedVisible) return;
    const id = setInterval(() => {
      setAiraLimitCountdown((prev) => decrementCountdown(prev));
    }, 1000);
    return () => clearInterval(id);
  }, [airaLimitReachedVisible]);

  const applyAiSuggestionsResponse = useCallback(
    (
      res: Awaited<ReturnType<typeof getAiSuggestionsApi>>,
      opts?: { closeConfirmSheet?: boolean }
    ) => {
      const list =
        res?.data?.suggestions ??
        (res?.data as { data?: { suggestions?: string[] } } | undefined)?.data?.suggestions ??
        res?.suggestions;
      const meta = res?.data as
        | {
            limitLeft?: number | null;
            totalMessageLimit?: number | null;
            timeLeft?: string | null;
          }
        | undefined;
      const limitLeft = meta?.limitLeft ?? null;
      const totalLimit = meta?.totalMessageLimit ?? null;
      const hasSuggestions = Array.isArray(list) && list.length > 0;
      const isLimitReached = limitLeft != null && limitLeft <= 0;

      setAiraSuggestionsLimitLeft(limitLeft);
      setAiraSuggestionsTotalLimit(totalLimit);

      if (hasSuggestions) {
        setGeneratedReplies(list);
        setSelectedReplyIndex(0);
        setAiraLimitReachedVisible(false);
        if (opts?.closeConfirmSheet) setAskAiraConfirmVisible(false);
        return;
      }

      if (isLimitReached) {
        const countdownFromApi =
          parseAiraTimeLeft(meta?.timeLeft ?? null) ?? getTimeUntilMidnight();
        setAiraLimitCountdown(countdownFromApi);
        setGeneratedReplies(null);
        setAskAiraConfirmVisible(false);
        setAiraLimitReachedVisible(true);
        return;
      }
      // API can return success with empty suggestions in non-limit cases.
      setGeneratedReplies(null);
    },
    []
  );

  const requestAiSuggestions = useCallback(
    (opts?: { closeConfirmSheetOnStart?: boolean }) => {
      if (!chatId) return;
      const requestId = ++aiSuggestionsRequestIdRef.current;
      setAskAiraConfirmLoading(true);
      setAskAiraGenerating(true);
      if (opts?.closeConfirmSheetOnStart) {
        setAskAiraConfirmVisible(false);
      }
      getAiSuggestionsApi(chatId)
        .then((res) => {
          if (requestId !== aiSuggestionsRequestIdRef.current) return;
          applyAiSuggestionsResponse(res, { closeConfirmSheet: true });
        })
        .catch((err) => {
          if (requestId !== aiSuggestionsRequestIdRef.current) return;
          if (isAiraLimitError(err)) {
            setAskAiraConfirmVisible(false);
            setAiraLimitCountdown(getTimeUntilMidnight());
            setAiraLimitReachedVisible(true);
          }
        })
        .finally(() => {
          if (requestId !== aiSuggestionsRequestIdRef.current) return;
          setAskAiraConfirmLoading(false);
          setAskAiraGenerating(false);
        });
    },
    [applyAiSuggestionsResponse, chatId]
  );

  const handleCancelAiSuggestions = useCallback(() => {
    // Ignore any in-flight response after user cancels this loading sheet.
    aiSuggestionsRequestIdRef.current += 1;
    setAskAiraGenerating(false);
    setAskAiraConfirmLoading(false);
  }, []);

  const handleInsertReply = () => {
    if (!generatedReplies?.length || selectedReplyIndex >= generatedReplies.length) return;
    setInputText(generatedReplies[selectedReplyIndex]);
    setGeneratedReplies(null);
    setSelectedReplyIndex(0);
  };

  const getMessagePreview = (msg: ChatMessage): string => {
    if (msg.type === 'text') return msg.text;
    // if (msg.type === 'voice') return 'Voice message';
    if (msg.type === 'image') return 'Photo';
    if (msg.type === 'file') return msg.name;
    return '';
  };

  // Voice recording and mic handlers (voice chat disabled)
  // const startVoiceRecording = useCallback(async () => {
  //   try {
  //     const audioRecorderPlayer = audioRecorderPlayerRef.current;
  //
  //     const path =
  //       Platform.OS === 'ios'
  //         ? 'voice_record.m4a'
  //         : `${Date.now()}.m4a`;
  //
  //     const result = await audioRecorderPlayer.startRecorder(path);
  //
  //     audioRecorderPlayer.addRecordBackListener(() => {
  //       return;
  //     });
  //
  //     isRecordingRef.current = true;
  //
  //     setRecordFilePath(result);
  //   } catch (err) {
  //     setVoiceBarVisible(false);
  //   }
  // }, []);
  //
  // const handleMicPress = async () => {
  //   if (inputText.trim() || pendingAttachments.length) return;
  //   const status = await checkMicrophonePermission();
  //   if (status !== 'granted') {
  //     setShowMicrophonePermissionSheet(true);
  //     return;
  //   }
  //   setVoiceBarVisible(true);
  //   setVoiceSeconds(0);
  //   setVoicePaused(false);
  //   await startVoiceRecording();
  // };
  //
  // const handleAllowMicrophonePermission = async () => {
  //   setIsRequestingPermission(true);
  //   try {
  //     const requested = await requestMicrophonePermission();
  //     setShowMicrophonePermissionSheet(false);
  //     if (requested === 'granted') {
  //       setVoiceBarVisible(true);
  //       setVoiceSeconds(0);
  //       setVoicePaused(false);
  //       await startVoiceRecording();
  //     } else {
  //       setShowMicrophonePermissionSheet(false);
  //     }
  //   } catch {
  //     setShowMicrophonePermissionSheet(false);
  //   } finally {
  //     setIsRequestingPermission(false);
  //   }
  // };
  //
  // const handleVoiceTrash = () => {
  //   if (isRecordingRef.current) {
  //     const audioRecorderPlayer = audioRecorderPlayerRef.current;
  //     audioRecorderPlayer.stopRecorder().catch(() => {});
  //     isRecordingRef.current = false;
  //   }
  //   setRecordFilePath(null);
  //   setVoiceBarVisible(false);
  //   setVoiceSeconds(0);
  //   setVoicePaused(false);
  // };
  //
  // const handleVoicePlayPause = () => {
  //   if (!isRecordingRef.current) return;
  //   const audioRecorderPlayer = audioRecorderPlayerRef.current;
  //   if (voicePaused) {
  //     audioRecorderPlayer.resumeRecorder().catch(() => {});
  //   } else {
  //     audioRecorderPlayer.pauseRecorder().catch(() => {});
  //   }
  //   setVoicePaused((p) => !p);
  // };
  //
  // const stopRecording = async () => {
  //   try {
  //     const audioRecorderPlayer = audioRecorderPlayerRef.current;
  //
  //     const result = await audioRecorderPlayer.stopRecorder();
  //     audioRecorderPlayer.removeRecordBackListener();
  //
  //     isRecordingRef.current = false;
  //
  //     return result;
  //   } catch (e) {
  //     return null;
  //   }
  // };
  //
  // const handleVoiceSend = async () => {
  //   if (!chatId || !currentUserId || !otherUserId) return;
  //
  //   try {
  //     setVoiceSendLoading(true);
  //
  //     const path = await stopRecording();
  //
  //     if (!path) {
  //       setVoiceBarVisible(false);
  //       return;
  //     }
  //
  //     const fileName = `voice_${Date.now()}.m4a`;
  //
  //     const { url, key } = await uploadChatFileApi(path, {
  //       mimeType: 'audio/m4a',
  //       fileName,
  //     });
  //
  //     const res = await sendMessageApi({
  //       chatId,
  //       content: '',
  //       messageType: 'audio',
  //       files: [{ url, key }],
  //       replyTo: replyingTo?.messageId ?? null,
  //     });
  //
  //     const apiMessage = res?.data as ChatMessageApiItem;
  //
  //     if (apiMessage) {
  //       const ui = mapApiMessageToChatMessage(apiMessage, currentUserId);
  //
  //       if (ui) {
  //         setMessages(prev => [...prev, ui]);
  //       }
  //
  //       socketService.messageSendFromApi(
  //         currentUserId,
  //         otherUserId,
  //         apiMessage as unknown as Record<string, unknown>,
  //       );
  //     }
  //
  //     setVoiceBarVisible(false);
  //     setVoiceSeconds(0);
  //     setVoicePaused(false);
  //     setRecordFilePath(null);
  //   } catch (err) {
  //   } finally {
  //     setVoiceSendLoading(false);
  //   }
  // };

  const openCamera = () => {
    launchCamera(
      { mediaType: 'photo', quality: 0.8 },
      (response) => {
        if (response.didCancel || response.errorCode) return;
        const uri = response.assets?.[0]?.uri;
        if (uri) setPendingAttachments((p) => [...p, { type: 'image', uri }]);
      }
    );
  };

  const openGallery = () => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.8 },
      (response) => {
        if (response.didCancel || response.errorCode) return;
        const uri = response.assets?.[0]?.uri;
        if (uri) setPendingAttachments((p) => [...p, { type: 'image', uri }]);
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
        setShowCameraPermissionSheet(false);
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
        setShowGalleryPermissionSheet(false);
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

      if (trimmed) {
        socketService.typing(currentUserId, otherUserId, false);
        if (justCreatedChatViaAdd) {
          // firstMessage is already stored by addChat — avoid duplicate sendMessage + clear UI now
          setInputText('');
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
                  .map((item) => mapApiMessageToChatMessage(item, currentUserId ?? undefined))
                  .filter((m): m is ChatMessage => m != null)
                  .reverse()
              : [];
            setMessages(list);
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
          const apiMessage = (res?.data as unknown) as ChatMessageApiItem | undefined;
          if (apiMessage) {
            const ui = mapApiMessageToChatMessage(apiMessage, currentUserId);
            if (ui) {
              setMessages((prev) => [...prev, ui as ChatMessage]);
            }
            if (currentUserId && otherUserId) {
              socketService.messageSendFromApi(
                currentUserId,
                otherUserId,
                apiMessage as unknown as Record<string, unknown>
              );
            }
          }
          setInputText('');
          setReplyingTo(null);
        }
      }
      for (const att of pendingAttachments) {
        const messageType = getMessageTypeFromAttachment(att);
        const mimeType = getMimeTypeFromAttachment(att);
        const fileName = att.type === 'image' ? `image_${Date.now()}.jpg` : att.name;
        const { url, key } = await uploadChatFileApi(att.uri, { mimeType, fileName });
        const res = await sendMessageApi({
          chatId: effectiveChatId!,
          content: '',
          messageType,
          files: [{ url, key }],
          replyTo: replyToPayload,
        });
        const apiMessage = (res?.data as unknown) as ChatMessageApiItem | undefined;
        if (apiMessage) {
          const ui = mapApiMessageToChatMessage(apiMessage, currentUserId);
          if (ui) {
            setMessages((prev) => [...prev, ui]);
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
      if (pendingAttachments.length > 0) {
        setPendingAttachments([]);
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
      navigation.goBack();
    } catch (err: unknown) {
      // Action failed
    } finally {
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
    setRequestActionLoading('block');
    try {
      await apiClient.post(endpoints.chat.blockreportUser, {
        targetUserId: otherUserId,
      });
      navigation.goBack();
    } catch (err: unknown) {
      // Block failed
    } finally {
      setRequestActionLoading(null);
    }
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

  const handleMessageLongPress = (index: number) => {
    setMessageContextIndex(index);
  };

  const renderMessage = (msg: ChatMessage, index: number) => {
    if (msg.type === 'text') {
      return (
        <React.Fragment key={index}>
          <View style={[styles.messageRow, msg.sent ? undefined : styles.messageRowReceived]}>
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
          <View style={[styles.timeRow, msg.sent ? undefined : styles.timeRowReceived]}>
            <Text style={styles.timeText}>{msg.timestamp}</Text>
          </View>
        </React.Fragment>
      );
    }
    // Voice message bubble (voice chat disabled)
    // if (msg.type === 'voice') {
    //   return (
    //     <React.Fragment key={index}>
    //       <View style={styles.messageRow}>
    //         <TouchableOpacity
    //           style={styles.voiceBubbleSent}
    //           activeOpacity={1}
    //           onLongPress={() => handleMessageLongPress(index)}
    //         >
    //           <TouchableOpacity style={styles.voiceBubblePlay} activeOpacity={0.8} onPress={() => {}}>
    //             <PlayIcon size={40} color={colors.white} variant="voiceBubble" />
    //           </TouchableOpacity>
    //           <View style={styles.voiceBubbleWaveform}>
    //             {VOICE_WAVEFORM.map((h, i) => (
    //               <View key={i} style={[styles.voiceBubbleWaveformBar, { height: Math.max(6, h) }]} />
    //             ))}
    //           </View>
    //         </TouchableOpacity>
    //       </View>
    //       <View style={styles.timeRow}>
    //         <Text style={styles.timeText}>{msg.timestamp}</Text>
    //       </View>
    //     </React.Fragment>
    //   );
    // }
    if (msg.type === 'image') {
      return (
        <React.Fragment key={index}>
          <View style={[styles.messageRow, msg.sent ? undefined : styles.messageRowReceived]}>
            <TouchableOpacity
              style={[styles.imageBubble, msg.sent ? undefined : styles.imageBubbleReceived]}
              activeOpacity={1}
              onLongPress={() => handleMessageLongPress(index)}
            >
              <Image source={{ uri: msg.uri }} style={styles.imageBubbleImage} resizeMode="cover" />
            </TouchableOpacity>
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
            <TouchableOpacity
              style={[styles.fileBubble, msg.sent ? undefined : styles.fileBubbleReceived]}
              activeOpacity={1}
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
        <TouchableOpacity style={styles.moreButton} onPress={() => setMoreMenuVisible(true)}>
          <MoreVertIcon size={24} color={colors.black} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={moreMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMoreMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMoreMenuVisible(false)}>
          <View style={styles.moreMenuBackdrop}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={[styles.moreMenu, { top: insets.top + 12 + 40 + 12 }]} collapsable={false}>
                <TouchableOpacity
                  style={styles.moreMenuItem}
                  onPress={() => {
                    setMoreMenuVisible(false);
                    if (otherUserId) 
                      setBlockConfirmVisible(true);
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
                    setReportMessageInput('');
                    setShowReportSheet(true);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.moreMenuIconWrap]}>
                    <ReportIcon size={20} color={colors.semantic.error} />
                  </View>
                  <Text style={styles.moreMenuLabelReport}>Report</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
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
                        navigation.goBack();
                      })
                      .catch(() => {
                        // Block failed
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
                    setAskAiraConfirmLoading(true);
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
                  onPress={() => setDontShowAskAiraAgain((v) => !v)}
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
          <View style={styles.messageContextBackdrop}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.messageContextBubble}>
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
        contentContainerStyle={{
          ...styles.scrollContent,
          // Composer is fixed to bottom; pad for its height + keyboard so messages stay scrollable.
          paddingBottom:
            (styles.scrollContent?.paddingBottom ?? 16) + composerHeight + 12 + keyboardHeight,
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
        style={[styles.bottomComposerContainer, { bottom: keyboardHeight }]}
        onLayout={handleComposerLayout}
      >
      {/* Voice bar UI (voice chat disabled) */}
      {/* {voiceBarVisible ? (
        <View style={[styles.voiceBar, { paddingBottom: 12 + insets.bottom }]}>
          ...
        </View>
      ) :  */}{isRequest ? (
        <View style={[styles.requestActionBar, { paddingBottom: 24 + bottomSafeInset }]}>
          <View style={styles.requestActionRow}>
            <TouchableOpacity
              style={styles.requestDeclineButton}
              onPress={handleRequestDecline}
              disabled={requestActionLoading !== null}
              activeOpacity={0.8}
            >
              <Text style={styles.requestDeclineLabel}>{STRINGS.CHAT.DECLINE}</Text>
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
              <Text style={styles.requestAcceptLabel}>{STRINGS.CHAT.ACCEPT}</Text>
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
                <PlusIcon size={18} color={colors.black} />
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
                <PlusIcon size={18} color={colors.black} />
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                placeholder={otherUserTyping ? 'typing…' : STRINGS.CHAT.START_CHAT_PLACEHOLDER}
                placeholderTextColor={colors.neutral[600]}
                value={inputText}
                onChangeText={setInputText}
                multiline
                returnKeyType="default"
                cursorColor={colors.primary.purple}
                selectionColor={colors.primary[50]}
              />
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
        onClose={() => setShowCameraPermissionSheet(false)}
        snapPoints={[336]}
        showDragHandle
        showCloseButton={false}
        enablePanDownToClose
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
                  {STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.ALLOW}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setShowCameraPermissionSheet(false)}
              disabled={isRequestingPermission}
              style={permissionSheetStyles.secondaryButton}
            >
              <Text style={permissionSheetStyles.secondaryButtonText}>Don’t Allow</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ReusableBottomSheet>

      <ReusableBottomSheet
        isOpen={showGalleryPermissionSheet}
        onClose={() => setShowGalleryPermissionSheet(false)}
        snapPoints={[336]}
        showDragHandle
        showCloseButton={false}
        enablePanDownToClose
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
                  {STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.ALLOW}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setShowGalleryPermissionSheet(false)}
              disabled={isRequestingPermission}
              style={permissionSheetStyles.secondaryButton}
            >
              <Text style={permissionSheetStyles.secondaryButtonText}>Don’t Allow</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ReusableBottomSheet>

      <ReusableBottomSheet
        isOpen={showMicrophonePermissionSheet}
        onClose={() => setShowMicrophonePermissionSheet(false)}
        snapPoints={[336]}
        showDragHandle
        showCloseButton={false}
        enablePanDownToClose
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
              // Voice recording disabled – just close the sheet
              onPress={() => setShowMicrophonePermissionSheet(false)}
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
                  {STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.ALLOW}
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setShowMicrophonePermissionSheet(false)}
              disabled={isRequestingPermission}
              style={permissionSheetStyles.secondaryButton}
            >
              <Text style={permissionSheetStyles.secondaryButtonText}>
                {STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.DONT_ALLOW}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ReusableBottomSheet>

      <ReusableBottomSheet
        isOpen={showReportSheet}
        onClose={() => {
          setShowReportSheet(false);
          setReportMessageInput('');
          setSelectedReportReason(null);
        }}
        snapPoints={['90%']}
        showDragHandle
        showCloseButton={false}
        enablePanDownToClose
        backgroundStyle={permissionSheetStyles.sheet}
        scrollEnabled={false}
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
                const reasonLabel = REPORT_REASONS.find((r) => r.value === selectedReportReason)?.label ?? selectedReportReason;
                const reportMessage = reportMessageInput.trim()
                  ? `${reasonLabel}\n${reportMessageInput.trim()}`
                  : reasonLabel;
                setReportSubmitting(true);
                reportUserApi({ reportedAgainst: otherUserId, reportMessage })
                  .then(() => {
                    setShowReportSheet(false);
                    setReportMessageInput('');
                    setSelectedReportReason(null);
                  })
                  .catch(() => {
                    // Report failed
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
