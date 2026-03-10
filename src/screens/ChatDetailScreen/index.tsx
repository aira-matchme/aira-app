import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TouchableWithoutFeedback,
  StyleSheet,
  Linking,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { BlockIcon } from '../../assets/icons/common/BlockIcon';
import { ReportIcon } from '../../assets/icons/common/ReportIcon';
import { PlusIcon } from '../../assets/icons/common/PlusIcon';
import { ForwardArrowIcon } from '../../assets/icons/common/ForwardArrowIcon';
import { MicIcon } from '../../assets/icons/common/MicIcon';
import { PlayIcon } from '../../assets/icons/common/PlayIcon';
import { PauseIcon } from '../../assets/icons/common/PauseIcon';
import { DeleteIcon } from '../../assets/icons/common/DeleteIcon';
import { ReplyIcon } from '../../assets/icons/common/ReplyIcon';
import { AskAiraIcon } from '../../assets/icons/common/AskAiraIcon';
import { GeneratingCloseIcon } from '../../assets/icons/common/GeneratingCloseIcon';
import { ActionSheetFileIcon } from '../../assets/icons/common/ActionSheetFileIcon';
import { AttachmentOptionsBottomSheet, type AttachmentOption } from '../../components/AttachmentOptionsBottomSheet';
import { GradientText } from '../../components/GradientText';
import LinearGradient from 'react-native-linear-gradient';
import { STRINGS } from '../../constants/strings';
import { colors, typography } from '../../theme';
import type { ChatStackParamList } from '../../navigation/types';
import { setChatRequestActionApi, blockUserApi, reportUserApi, getChatMessagesApi, mapApiMessageToChatMessage, markChatSeenApi, sendMessageApi, uploadChatFileApi } from '../../modules/chat/api';
import { useAuthStore } from '../../store/auth.store';
import socketService, { type MessageReceivePayload, type MessageDeletePayload, type TypingPayload } from '../../services/socket/socketService';
import { styles, H_PADDING } from './styles';

type Props = NativeStackScreenProps<ChatStackParamList, 'ChatDetail'>;

type ChatMessage =
  | { type: 'text'; text: string; timestamp: string; sent: boolean; replyTo?: { senderName: string; preview: string }; messageId?: string }
  | { type: 'voice'; timestamp: string; sent: boolean; messageId?: string }
  | { type: 'image'; uri: string; timestamp: string; sent: boolean; messageId?: string }
  | { type: 'file'; uri: string; name: string; timestamp: string; sent: boolean; messageId?: string };

const VOICE_WAVEFORM = [8, 12, 6, 14, 10, 16, 8, 14, 12, 10];

const now = () => {
  const d = new Date();
  return `${d.getHours() > 12 ? d.getHours() - 12 : d.getHours()}:${d.getMinutes().toString().padStart(2, '0')} ${d.getHours() >= 12 ? 'pm' : 'am'}`;
};

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

export const ChatDetailScreen = ({ route, navigation }: Props) => {
  const { name, avatar, chatId, isRequest, otherUserId } = route.params;
  const insets = useSafeAreaInsets();
  const currentUserId = useAuthStore((s) => s.user?.id);
  const [requestActionLoading, setRequestActionLoading] = useState<'accept' | 'decline' | 'block' | null>(null);
  const [messagesLoading, setMessagesLoading] = useState(!!chatId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [attachmentSheetOpen, setAttachmentSheetOpen] = useState(false);
  const [showCameraPermissionSheet, setShowCameraPermissionSheet] = useState(false);
  const [showGalleryPermissionSheet, setShowGalleryPermissionSheet] = useState(false);
  const [showMicrophonePermissionSheet, setShowMicrophonePermissionSheet] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<Array<{ type: 'image'; uri: string } | { type: 'file'; uri: string; name: string }>>([]);
  const [moreMenuVisible, setMoreMenuVisible] = useState(false);
  const [showReportSheet, setShowReportSheet] = useState(false);
  const [reportMessageInput, setReportMessageInput] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [voiceBarVisible, setVoiceBarVisible] = useState(false);
  const [voiceSeconds, setVoiceSeconds] = useState(0);
  const [voicePaused, setVoicePaused] = useState(false);
  const [voiceSendLoading, setVoiceSendLoading] = useState(false);
  const voiceTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isRecordingRef = useRef(false);
  const [askAiraGenerating, setAskAiraGenerating] = useState(false);
  const [generatedReplies, setGeneratedReplies] = useState<string[] | null>(null);
  const [selectedReplyIndex, setSelectedReplyIndex] = useState(0);
  const [messageContextIndex, setMessageContextIndex] = useState<number | null>(null);
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
  const [replyingTo, setReplyingTo] = useState<{ index: number; message: ChatMessage; senderName: string; messageId?: string } | null>(null);
  const [sendLoading, setSendLoading] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const generatedRepliesTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

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

  const getSoundRecorder = (): { start: (path: string) => Promise<void>; stop: () => Promise<{ path: string; duration: number }>; pause: () => Promise<void>; resume: () => Promise<void>; PATH_CACHE: string } | null => {
    try {
      const SR = require('react-native-sound-recorder');
      return SR?.start && SR?.PATH_CACHE ? SR : null;
    } catch {
      return null;
    }
  };

  const getFileTypeLabel = (name: string) => {
    const ext = name.split('.').pop()?.toUpperCase() ?? 'FILE';
    return ext.length <= 4 ? ext : 'FILE';
  };

  const formatVoiceTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!voiceBarVisible || voicePaused) {
      if (voiceTimerRef.current) {
        clearInterval(voiceTimerRef.current);
        voiceTimerRef.current = null;
      }
      return;
    }
    voiceTimerRef.current = setInterval(() => {
      setVoiceSeconds((prev) => prev + 1);
    }, 1000);
    return () => {
      if (voiceTimerRef.current) {
        clearInterval(voiceTimerRef.current);
        voiceTimerRef.current = null;
      }
    };
  }, [voiceBarVisible, voicePaused]);

  // Simulate "replies generated" after a short delay when Ask AIRA is active
  useEffect(() => {
    if (!askAiraGenerating) return;
    if (generatedRepliesTimeoutRef.current) clearTimeout(generatedRepliesTimeoutRef.current);
    generatedRepliesTimeoutRef.current = setTimeout(() => {
      setAskAiraGenerating(false);
      setGeneratedReplies([
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.',
      ]);
      setSelectedReplyIndex(0);
      generatedRepliesTimeoutRef.current = null;
    }, 2500);
    return () => {
      if (generatedRepliesTimeoutRef.current) clearTimeout(generatedRepliesTimeoutRef.current);
    };
  }, [askAiraGenerating]);

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
    getChatMessagesApi({ chatId })
      .then((res) => {
        if (cancelled) return;
        const raw = res.data?.list ?? res.data?.messages ?? [];
        const list = Array.isArray(raw)
          ? raw
              .map((item) => mapApiMessageToChatMessage(item, currentUserId ?? undefined))
              .filter((m): m is ChatMessage => m != null)
          : [];
        setMessages(list);
      })
      .catch(() => {
        if (!cancelled) setMessages([]);
      })
      .finally(() => {
        if (!cancelled) setMessagesLoading(false);
      });
    return () => { cancelled = true; };
  }, [chatId, currentUserId]);

  useEffect(() => {
    if (!chatId || !currentUserId || !otherUserId) return;
    console.log('[Socket] ChatDetailScreen: join + subscribe', { chatId, currentUserId, otherUserId });
    socketService.join(chatId);
    const unsubMessage = socketService.on<MessageReceivePayload>('message_send', (data) => {
      const isForMe = data.receiver === currentUserId;
      const isFromMe = data.sender === currentUserId;
      console.log('[Socket] ChatDetailScreen: message_send received', { sender: data.sender, receiver: data.receiver, isForMe, isFromMe });
      if (!isForMe) return;
      // Own message echoed back: we already added it optimistically on send; skip to avoid duplicate.
      if (isFromMe) return;
      const timestamp = formatMessageTimestamp(data.timestamp ?? data.createdAt);
      setMessages((prev) => [
        ...prev,
        { type: 'text', text: data.message, timestamp, sent: false, messageId: data.messageId },
      ]);
    });
    const unsubDelete = socketService.on<MessageDeletePayload>('message_delete', (data) => {
      console.log('[Socket] ChatDetailScreen: message_delete received', { messageId: data.messageId });
      setMessages((prev) => prev.filter((m) => (m as { messageId?: string }).messageId !== data.messageId));
    });
    const unsubTyping = socketService.on<TypingPayload>('typing', (data) => {
      const applies = data.sender === otherUserId && data.receiver === currentUserId;
      console.log('[Socket] ChatDetailScreen: typing received', { sender: data.sender, receiver: data.receiver, isTyping: data.isTyping, applies });
      if (applies) {
        setOtherUserTyping(data.isTyping);
      }
    });
    return () => {
      console.log('[Socket] ChatDetailScreen: unsubscribe (leave chat or params changed)');
      unsubMessage();
      unsubDelete();
      unsubTyping();
    };
  }, [chatId, currentUserId, otherUserId]);

  useEffect(() => {
    if (!chatId || !currentUserId || !otherUserId) return;
    if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
    if (typingStopRef.current) clearTimeout(typingStopRef.current);
    if (inputText.trim().length > 0) {
      typingDebounceRef.current = setTimeout(() => {
        console.log('[Socket] ChatDetailScreen: sending typing true');
        socketService.typing(currentUserId, otherUserId, true);
        if (typingStopRef.current) clearTimeout(typingStopRef.current);
        typingStopRef.current = setTimeout(() => {
          console.log('[Socket] ChatDetailScreen: sending typing false (idle 2s)');
          socketService.typing(currentUserId, otherUserId, false);
        }, 2000);
      }, 300);
    } else {
      console.log('[Socket] ChatDetailScreen: sending typing false (input empty)');
      socketService.typing(currentUserId, otherUserId, false);
    }
    return () => {
      if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
      if (typingStopRef.current) clearTimeout(typingStopRef.current);
    };
  }, [chatId, currentUserId, otherUserId, inputText]);

  useEffect(() => {
    if (messagesLoading || messages.length === 0) return;
    const id = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: false });
    }, 100);
    return () => clearTimeout(id);
  }, [messagesLoading, messages.length]);

  const handleInsertReply = () => {
    if (!generatedReplies?.length || selectedReplyIndex >= generatedReplies.length) return;
    setInputText(generatedReplies[selectedReplyIndex]);
    setGeneratedReplies(null);
    setSelectedReplyIndex(0);
  };

  const getMessagePreview = (msg: ChatMessage): string => {
    if (msg.type === 'text') return msg.text;
    if (msg.type === 'voice') return 'Voice message';
    if (msg.type === 'image') return 'Photo';
    if (msg.type === 'file') return msg.name;
    return '';
  };

  const startVoiceRecording = useCallback(async () => {
    const SoundRecorder = getSoundRecorder();
    if (!SoundRecorder) {
      return;
    }
    try {
      const path = `${SoundRecorder.PATH_CACHE}/voice_${Date.now()}.mp4`;
      await SoundRecorder.start(path);
      isRecordingRef.current = true;
    } catch (err) {
      setVoiceBarVisible(false);
    }
  }, []);

  const handleMicPress = async () => {
    if (inputText.trim() || pendingAttachments.length) return;
    const status = await checkMicrophonePermission();
    if (status !== 'granted') {
      setShowMicrophonePermissionSheet(true);
      return;
    }
    setVoiceBarVisible(true);
    setVoiceSeconds(0);
    setVoicePaused(false);
    await startVoiceRecording();
  };

  const handleAllowMicrophonePermission = async () => {
    setIsRequestingPermission(true);
    try {
      const requested = await requestMicrophonePermission();
      setShowMicrophonePermissionSheet(false);
      if (requested === 'granted') {
        setVoiceBarVisible(true);
        setVoiceSeconds(0);
        setVoicePaused(false);
        await startVoiceRecording();
      } else {
        setShowMicrophonePermissionSheet(false);
      }
    } catch {
      setShowMicrophonePermissionSheet(false);
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const handleVoiceTrash = () => {
    if (isRecordingRef.current) {
      const SoundRecorder = getSoundRecorder();
      SoundRecorder?.stop?.().catch(() => {});
      isRecordingRef.current = false;
    }
    setVoiceBarVisible(false);
    setVoiceSeconds(0);
    setVoicePaused(false);
  };

  const handleVoicePlayPause = () => {
    if (!isRecordingRef.current) return;
    const SoundRecorder = getSoundRecorder();
    if (!SoundRecorder) return;
    if (voicePaused) {
      SoundRecorder.resume().catch(() => {});
    } else {
      SoundRecorder.pause().catch(() => {});
    }
    setVoicePaused((p) => !p);
  };

  const handleVoiceSend = async () => {
    if (!chatId) return;
    if (isRecordingRef.current) {
      const SoundRecorder = getSoundRecorder();
      if (!SoundRecorder?.stop) {
        isRecordingRef.current = false;
        setVoiceBarVisible(false);
        setVoiceSeconds(0);
        setVoicePaused(false);
        return;
      }
      try {
        const result = await SoundRecorder.stop();
        isRecordingRef.current = false;
        const path = result?.path;
        if (!path) {
          setVoiceBarVisible(false);
          setVoiceSeconds(0);
          setVoicePaused(false);
          return;
        }
        setVoiceSendLoading(true);
        try {
          const { url, key } = await uploadChatFileApi(path, {
            mimeType: 'audio/mp4',
            fileName: `voice_${Date.now()}.mp4`,
          });
          await sendMessageApi({
            chatId,
            content: '',
            messageType: 'audio',
            files: [{ url, key }],
            replyTo: replyingTo?.messageId ?? null,
          });
          setMessages((prev) => [...prev, { type: 'voice', timestamp: now(), sent: true }]);
        } catch (err: unknown) {
          // Send failed
        } finally {
          setVoiceSendLoading(false);
        }
      } catch (err) {
        isRecordingRef.current = false;
      }
    } else {
      setMessages((prev) => [...prev, { type: 'voice', timestamp: now(), sent: true }]);
    }
    setVoiceBarVisible(false);
    setVoiceSeconds(0);
    setVoicePaused(false);
  };

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
    try {
      const results = await pick({ allowMultiSelection: false });
      if (results?.length && results[0]) {
        const { uri, name: fileName } = results[0];
        setPendingAttachments((p) => [...p, { type: 'file', uri, name: fileName ?? 'File' }]);
      }
    } catch {
      // User cancelled or error
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
    if (!chatId || !currentUserId || !otherUserId) return;
    setSendLoading(true);
    const replyToPayload = replyingTo?.messageId ?? null;
    const newMessages: ChatMessage[] = [];
    try {
      if (trimmed) {
        // Notify other user in real time via socket; we show message optimistically (no refetch).
        socketService.typing(currentUserId, otherUserId, false);
        socketService.messageSend(currentUserId, otherUserId, trimmed);
        const replyToUi = replyingTo
          ? { senderName: replyingTo.senderName, preview: getMessagePreview(replyingTo.message) }
          : undefined;
        newMessages.push({ type: 'text', text: trimmed, timestamp: now(), sent: true, replyTo: replyToUi });
        setInputText('');
        setReplyingTo(null);
        // Persist to backend; do not refetch — list is updated via socket + optimistic add.
        sendMessageApi({
          chatId,
          content: trimmed,
          messageType: 'text',
          files: [],
          replyTo: replyToPayload,
        }).catch(() => {});
      }
      for (const att of pendingAttachments) {
        const messageType = getMessageTypeFromAttachment(att);
        const mimeType = getMimeTypeFromAttachment(att);
        const fileName = att.type === 'image' ? `image_${Date.now()}.jpg` : att.name;
        const { url, key } = await uploadChatFileApi(att.uri, { mimeType, fileName });
        await sendMessageApi({
          chatId,
          content: '',
          messageType,
          files: [{ url, key }],
          replyTo: replyToPayload,
        });
        if (att.type === 'image') {
          newMessages.push({ type: 'image', uri: att.uri, timestamp: now(), sent: true });
        } else {
          newMessages.push({ type: 'file', uri: att.uri, name: att.name, timestamp: now(), sent: true });
        }
      }
      if (newMessages.length > 0) {
        setMessages((prev) => [...prev, ...newMessages]);
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
      await blockUserApi({ blockUserId: otherUserId, type: 'block' });
      navigation.goBack();
    } catch (err: unknown) {
      // Block failed
    } finally {
      setRequestActionLoading(null);
    }
  };

  const handleAttachmentSelect = (option: AttachmentOption) => {
    if (option === 'camera') {
      handleCamera();
      return;
    }
    if (option === 'gallery') {
      handleGallery();
      return;
    }
    if (option === 'files') {
      setAttachmentSheetOpen(false);
      openFilePicker();
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
    if (msg.type === 'voice') {
      return (
        <React.Fragment key={index}>
          <View style={styles.messageRow}>
            <TouchableOpacity
              style={styles.voiceBubbleSent}
              activeOpacity={1}
              onLongPress={() => handleMessageLongPress(index)}
            >
              <TouchableOpacity style={styles.voiceBubblePlay} activeOpacity={0.8} onPress={() => {}}>
                <PlayIcon size={40} color={colors.white} variant="voiceBubble" />
              </TouchableOpacity>
              <View style={styles.voiceBubbleWaveform}>
                {VOICE_WAVEFORM.map((h, i) => (
                  <View key={i} style={[styles.voiceBubbleWaveformBar, { height: Math.max(6, h) }]} />
                ))}
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{msg.timestamp}</Text>
          </View>
        </React.Fragment>
      );
    }
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

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <StatusBar barStyle="dark-content" translucent backgroundColor={colors.white}/>
        <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackArrowIcon size={48} />
          </TouchableOpacity>
        {avatar != null ? (
          <Image source={avatar} style={styles.headerAvatar} resizeMode="cover" />
        ) : (
          <View style={styles.headerAvatar} />
        )}
        <Text style={styles.headerName} numberOfLines={1}>{name}</Text>
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
                    if (!otherUserId) {
                      return;
                    }
                    blockUserApi({ blockUserId: otherUserId, type: 'block' })
                      .then(() => navigation.goBack())
                      .catch(() => {
                        // Block failed
                      });
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
                <TouchableOpacity
                  style={styles.messageContextItemDelete}
                  onPress={() => {
                    if (messageContextIndex !== null) {
                      setDeleteConfirmIndex(messageContextIndex);
                      setMessageContextIndex(null);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <DeleteIcon size={20} color={colors.semantic.error} />
                  <Text style={styles.messageContextLabelDelete}>{STRINGS.CHAT.DELETE}</Text>
                </TouchableOpacity>
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
                    if (deleteConfirmIndex !== null) {
                      setMessages((prev) => prev.filter((_, i) => i !== deleteConfirmIndex));
                      setDeleteConfirmIndex(null);
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

      <ScrollView
        ref={scrollViewRef}
        style={styles.screen}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {messagesLoading ? (
          <View style={styles.messagesLoadingWrap}>
            <ActivityIndicator size="large" color={colors.primary.purple} />
            <Text style={styles.messagesLoadingText}>{STRINGS.CHAT.LOADING_MESSAGES}</Text>
          </View>
        ) : (
          <>
            <View style={styles.datePill}>
              <Text style={styles.datePillText}>{STRINGS.CHAT.TODAY}</Text>
            </View>
            {messages.map((msg, index) => renderMessage(msg, index))}
          </>
        )}
      </ScrollView>

      {voiceBarVisible ? (
        <View style={[styles.voiceBar, { paddingBottom: 12 + insets.bottom }]}>
          <TouchableOpacity style={styles.voiceBarTrash} onPress={handleVoiceTrash} activeOpacity={0.8}>
            <DeleteIcon size={22} color={colors.white} />
          </TouchableOpacity>
          <View style={styles.voiceBarPill}>
            <TouchableOpacity style={styles.voiceBarPlayPause} onPress={handleVoicePlayPause} activeOpacity={0.8}>
              {voicePaused ? (
                <PlayIcon size={24} color={colors.black} />
              ) : (
                <PauseIcon size={24} color={colors.black} />
              )}
            </TouchableOpacity>
            <View style={styles.voiceBarWaveform}>
              {VOICE_WAVEFORM.map((h, i) => (
                <View key={i} style={[styles.voiceBarWaveformBar, { height: Math.max(6, h) }]} />
              ))}
            </View>
            <Text style={styles.voiceBarTimer}>{formatVoiceTime(voiceSeconds)}</Text>
          </View>
          <TouchableOpacity
            style={styles.voiceBarSend}
            onPress={handleVoiceSend}
            activeOpacity={0.8}
            disabled={voiceSendLoading}
          >
            {voiceSendLoading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <ForwardArrowIcon size={22} color={colors.white} />
            )}
          </TouchableOpacity>
        </View>
      ) : isRequest ? (
        <View style={[styles.requestActionBar, { paddingBottom: 24 + insets.bottom }]}>
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
          {askAiraGenerating && (
            <View style={[styles.generatingBar, { paddingHorizontal: H_PADDING }]}>
              <LinearGradient
                colors={[...colors.gradients.primary.colors]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.generatingBubbleGradientWrap}
              >
                <View style={styles.generatingBubbleInner}>
                  <AskAiraIcon size={18} useGradient />
                  <GradientText
                    style={{ fontSize: 15, fontWeight: '500' }}
                    colors={['#CB7BF5', '#7742F0']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                  >
                    {STRINGS.CHAT.GENERATING_REPLIES}
                  </GradientText>
                </View>
              </LinearGradient>
              <TouchableOpacity
                style={styles.generatingCancel}
                onPress={() => {
                  if (generatedRepliesTimeoutRef.current) {
                    clearTimeout(generatedRepliesTimeoutRef.current);
                    generatedRepliesTimeoutRef.current = null;
                  }
                  setAskAiraGenerating(false);
                }}
                activeOpacity={0.8}
              >
                <GeneratingCloseIcon size={18} color={colors.black} />
              </TouchableOpacity>
            </View>
          )}
          {generatedReplies != null && generatedReplies.length > 0 && (
            <ScrollView
              style={styles.generatedRepliesStrip}
              contentContainerStyle={[styles.generatedRepliesStripContent, { paddingHorizontal: H_PADDING }]}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {generatedReplies.map((text, index) => {
                const selected = index === selectedReplyIndex;
                const chip = (
                  <TouchableOpacity
                    key={index}
                    activeOpacity={0.8}
                    onPress={() => setSelectedReplyIndex(index)}
                    style={styles.generatedReplyChipTouchable}
                  >
                    {selected ? (
                      <LinearGradient
                        colors={[...colors.gradients.primary.colors]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={styles.generatedReplyChipGradientWrap}
                      >
                        <View style={styles.generatedReplyChipInner}>
                          <Text style={styles.generatedReplyChipTextSelected} numberOfLines={3}>
                            {text}
                          </Text>
                        </View>
                      </LinearGradient>
                    ) : (
                      <View style={styles.generatedReplyChipUnselected}>
                        <Text style={styles.generatedReplyChipTextUnselected} numberOfLines={3}>
                          {text}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
                return chip;
              })}
            </ScrollView>
          )}
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
          <View style={[styles.inputBar, { paddingBottom: 12 + insets.bottom }]}>
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
                returnKeyType="default"
                cursorColor={colors.primary.purple}
                selectionColor={colors.primary[50]}
              />
              {!inputText.trim() && askAiraGenerating && (
                <View style={styles.insertButton}>
                  <Text style={styles.insertButtonText}>{STRINGS.CHAT.INSERT}</Text>
                </View>
              )}
              {!inputText.trim() && generatedReplies != null && generatedReplies.length > 0 && (
                <TouchableOpacity
                  style={styles.insertButtonGradientWrap}
                  activeOpacity={0.8}
                  onPress={handleInsertReply}
                >
                  <LinearGradient
                    colors={[...colors.gradients.primary.colors]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <Text style={styles.insertButtonGradientText}>{STRINGS.CHAT.INSERT}</Text>
                </TouchableOpacity>
              )}
              {!inputText.trim() && !askAiraGenerating && generatedReplies == null && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setAskAiraGenerating(true)}
                >
                  <LinearGradient
                    colors={[...colors.gradients.primary.colors]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.askAiraChipGradientWrap}
                  >
                    <View style={styles.askAiraChipInner}>
                      <AskAiraIcon size={14} useGradient />
                      <GradientText
                        style={{ fontSize: 14, fontWeight: '600' }}
                        colors={['#CB7BF5', '#7742F0']}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                      >
                        {STRINGS.CHAT.ASK_AIRA}
                      </GradientText>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
            </View>
            </View>
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && !pendingAttachments.length && styles.sendButtonMic]}
            activeOpacity={0.8}
            onPress={
              inputText.trim() || pendingAttachments.length
                ? handleSend
                : handleMicPress
            }
            disabled={sendLoading}
          >
            {sendLoading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : inputText.trim() || pendingAttachments.length ? (
              <ForwardArrowIcon size={22} color={colors.white} />
            ) : (
              <MicIcon size={24} color={colors.black} />
            )}
          </TouchableOpacity>
          </View>
        </View>
      )}

      <AttachmentOptionsBottomSheet
        isOpen={attachmentSheetOpen}
        onClose={() => setAttachmentSheetOpen(false)}
        onSelect={handleAttachmentSelect}
      />

      <ReusableBottomSheet
        isOpen={showCameraPermissionSheet}
        onClose={() => setShowCameraPermissionSheet(false)}
        snapPoints={['45%']}
        showDragHandle
        showCloseButton={false}
        enablePanDownToClose
        backgroundStyle={permissionSheetStyles.sheet}
        scrollEnabled={false}
      >
        <View style={permissionSheetStyles.content}>
          <Text style={permissionSheetStyles.title}>
            {STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.CAMERA_PERMISSION_TITLE}
          </Text>
          <Text style={permissionSheetStyles.description}>
            {STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.CAMERA_PERMISSION_DESCRIPTION}
          </Text>
          <Button
            title={STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.ALLOW}
            onPress={handleAllowCameraPermission}
            variant="primary"
            disabled={isRequestingPermission}
            loading={isRequestingPermission}
            style={permissionSheetStyles.allowButton}
          />
        </View>
      </ReusableBottomSheet>

      <ReusableBottomSheet
        isOpen={showGalleryPermissionSheet}
        onClose={() => setShowGalleryPermissionSheet(false)}
        snapPoints={['45%']}
        showDragHandle
        showCloseButton={false}
        enablePanDownToClose
        backgroundStyle={permissionSheetStyles.sheet}
        scrollEnabled={false}
      >
        <View style={permissionSheetStyles.content}>
          <Text style={permissionSheetStyles.title}>
            {STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.PHOTOS_PERMISSION_TITLE}
          </Text>
          <Text style={permissionSheetStyles.description}>
            {STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.PHOTOS_PERMISSION_DESCRIPTION}
          </Text>
          <Button
            title={STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.ALLOW}
            onPress={handleAllowGalleryPermission}
            variant="primary"
            disabled={isRequestingPermission}
            loading={isRequestingPermission}
            style={permissionSheetStyles.allowButton}
          />
        </View>
      </ReusableBottomSheet>

      <ReusableBottomSheet
        isOpen={showMicrophonePermissionSheet}
        onClose={() => setShowMicrophonePermissionSheet(false)}
        snapPoints={['45%']}
        showDragHandle
        showCloseButton={false}
        enablePanDownToClose
        backgroundStyle={permissionSheetStyles.sheet}
        scrollEnabled={false}
      >
        <View style={permissionSheetStyles.content}>
          <Text style={permissionSheetStyles.title}>
            {STRINGS.CHAT.MICROPHONE_PERMISSION_TITLE}
          </Text>
          <Text style={permissionSheetStyles.description}>
            {STRINGS.CHAT.MICROPHONE_PERMISSION_DESCRIPTION}
          </Text>
          <TouchableOpacity
            style={permissionSheetStyles.allowButton}
            onPress={handleAllowMicrophonePermission}
            disabled={isRequestingPermission}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[...colors.gradients.primary.colors]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={permissionSheetStyles.allowButtonGradient}
            >
              {isRequestingPermission ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={permissionSheetStyles.allowButtonLabel}>
                  {STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.ALLOW}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={permissionSheetStyles.dontAllowButton}
            onPress={() => setShowMicrophonePermissionSheet(false)}
            disabled={isRequestingPermission}
            activeOpacity={0.8}
          >
            <Text style={permissionSheetStyles.dontAllowButtonLabel}>
              {STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.DONT_ALLOW}
            </Text>
          </TouchableOpacity>
        </View>
      </ReusableBottomSheet>

      <ReusableBottomSheet
        isOpen={showReportSheet}
        onClose={() => {
          setShowReportSheet(false);
          setReportMessageInput('');
        }}
        snapPoints={['40%']}
        showDragHandle
        showCloseButton={false}
        enablePanDownToClose
        backgroundStyle={permissionSheetStyles.sheet}
        scrollEnabled={false}
      >
        <View style={permissionSheetStyles.content}>
          <Text style={permissionSheetStyles.title}>Report user</Text>
          <TextInput
            style={reportSheetStyles.input}
            placeholder="Describe the issue..."
            placeholderTextColor={colors.neutral[500]}
            value={reportMessageInput}
            onChangeText={setReportMessageInput}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            editable={!reportSubmitting}
          />
          <TouchableOpacity
            style={permissionSheetStyles.allowButton}
            onPress={() => {
              const msg = reportMessageInput.trim();
              if (!msg) {
                return;
              }
              if (!otherUserId) return;
              setReportSubmitting(true);
              reportUserApi({ reportedAgainst: otherUserId, reportMessage: msg })
                .then(() => {
                  setShowReportSheet(false);
                  setReportMessageInput('');
                })
                .catch(() => {
                  // Report failed
                })
                .finally(() => setReportSubmitting(false));
            }}
            disabled={reportSubmitting}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[...colors.gradients.primary.colors]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={permissionSheetStyles.allowButtonGradient}
            >
              {reportSubmitting ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={permissionSheetStyles.allowButtonLabel}>Submit report</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={permissionSheetStyles.dontAllowButton}
            onPress={() => {
              setShowReportSheet(false);
              setReportMessageInput('');
            }}
            disabled={reportSubmitting}
            activeOpacity={0.8}
          >
            <Text style={permissionSheetStyles.dontAllowButtonLabel}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ReusableBottomSheet>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const permissionSheetStyles = StyleSheet.create({
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[600],
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  allowButton: {
    width: '100%',
    height: 54,
    marginBottom: 8,
    overflow: 'hidden',
    borderRadius: 100,
  },
  allowButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  allowButtonLabel: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: typography.fontFamily.medium,
    color: colors.white,
  },
  dontAllowButton: {
    width: '100%',
    height: 54,
    borderRadius: 100,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dontAllowButtonLabel: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: typography.fontFamily.medium,
    color: colors.black,
  },
});

const reportSheetStyles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[900],
    minHeight: 88,
    marginBottom: 20,
  },
});
