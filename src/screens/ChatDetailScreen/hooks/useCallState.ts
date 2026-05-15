import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Animated, PanResponder } from 'react-native';
import { agoraCallService } from '../../../services/call/agoraCallService';
import socketService, {
  type IncomingCallPayload,
  type CallLifecyclePayload,
  type CallRequestSentPayload,
  type CallFailedPayload,
  type CallPartnerAudioPayload,
  type CallPartnerVideoPayload,
  type CallSwitchRequestPayload,
  type CallSwitchAppliedPayload,
} from '../../../services/socket/socketService';
import { apiClient } from '../../../services/api/client';
import { endpoints } from '../../../services/api/endpoints';
import { showErrorToast, showSuccessToast } from '../../../services/toast.srvice';
import {
  checkCameraPermission,
  requestCameraPermission,
} from '../../../config/permissions';
import { firstNonEmptyString } from '../utils/helpers';

export type ActiveCallMode = 'voice' | 'video';
export type AudioDevice = 'speaker' | 'earpiece' | 'bluetooth' | 'wired';

type IncomingCallPrompt = {
  callerName: string;
  mode: ActiveCallMode;
  callId?: string;
  callerAvatar?: string;
};

export interface UseCallStateParams {
  chatId: string | null;
  currentUserId: string | undefined;
  otherUserId: string | undefined;
  outgoingCallMeta: { callerName?: string; callerAvatar?: string };
  name: string;
  setName: (updater: (prev: string) => string) => void;
  setPartnerAvatar: (avatar: any) => void;
  refreshChatMessagesFromApi: () => void;
  handledIncomingCallRef: React.MutableRefObject<string | null>;
}

export function useCallState({
  chatId,
  currentUserId,
  otherUserId,
  outgoingCallMeta,
  name,
  setName,
  setPartnerAvatar,
  refreshChatMessagesFromApi,
  handledIncomingCallRef,
}: UseCallStateParams) {
  // ─── Call UI visibility ───
  const [activeCallMode, setActiveCallMode] = useState<ActiveCallMode>('voice');
  const [callStateVisible, setCallStateVisible] = useState(false);
  const [callAudioEnabled, setCallAudioEnabled] = useState(true);
  const [callVideoEnabled, setCallVideoEnabled] = useState(true);
  const [partnerAudioEnabled, setPartnerAudioEnabled] = useState(true);
  const [partnerVideoEnabled, setPartnerVideoEnabled] = useState(true);
  const [videoCallUiHidden, setVideoCallUiHidden] = useState(false);

  // ─── Incoming voice call ───
  const [incomingVoiceCallVisible, setIncomingVoiceCallVisible] = useState(false);
  const [incomingVoiceCallerName, setIncomingVoiceCallerName] = useState('');
  const [incomingVoiceCallId, setIncomingVoiceCallId] = useState<string | null>(null);

  // ─── Incoming call banner ───
  const [incomingCallBannerVisible, setIncomingCallBannerVisible] = useState(false);
  const [incomingCallBannerMode, setIncomingCallBannerMode] = useState<ActiveCallMode>('voice');

  // ─── Incoming video call ───
  const [incomingVideoCallVisible, setIncomingVideoCallVisible] = useState(false);
  const [incomingVideoCallerName, setIncomingVideoCallerName] = useState('');
  const [incomingVideoCallId, setIncomingVideoCallId] = useState<string | null>(null);

  // ─── Active call channel / Agora ───
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [activeCallChannelName, setActiveCallChannelName] = useState<string | null>(null);
  const [activeCallRtcToken, setActiveCallRtcToken] = useState<string | null>(null);
  const [localRtcUid, setLocalRtcUid] = useState<number>(0);
  const [remoteRtcUid, setRemoteRtcUid] = useState<number | null>(null);
  const [isOutgoingVoiceRinging, setIsOutgoingVoiceRinging] = useState(false);
  const [isSwitchingVoiceToVideo, setIsSwitchingVoiceToVideo] = useState(false);

  // callConnectedAtMs is passed to CallOverlay so the timer lives there
  const [callConnectedAtMs, setCallConnectedAtMs] = useState<number | null>(null);

  // ─── Audio device ───
  const [audioDeviceSheetVisible, setAudioDeviceSheetVisible] = useState(false);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<AudioDevice>('earpiece');

  // ─── Switch to video popup ───
  const [switchToVideoPopupVisible, setSwitchToVideoPopupVisible] = useState(false);
  const [incomingCallSwitchRequestVisible, setIncomingCallSwitchRequestVisible] = useState(false);

  // Ref keeps callStateVisible in sync for the Agora audio-route subscription which
  // must NOT trigger re-renders but needs the current value synchronously.
  const callStateVisibleRef = useRef(callStateVisible);
  callStateVisibleRef.current = callStateVisible;

  // Lazy-load Agora RTC surface view so that a missing native module does not crash.
  const AgoraRtcSurfaceView = useMemo(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires,global-require
      const mod = require('react-native-agora');
      return (mod?.RtcSurfaceView ?? mod?.default?.RtcSurfaceView ?? null) as React.ComponentType<any> | null;
    } catch {
      return null;
    }
  }, []);

  // ─── Swipe-to-accept animated values ───
  const incomingVoiceSwipeY = useRef(new Animated.Value(0)).current;
  const incomingVideoSwipeY = useRef(new Animated.Value(0)).current;

  const resetIncomingVoiceSwipe = useCallback(() => {
    Animated.spring(incomingVoiceSwipeY, {
      toValue: 0, useNativeDriver: true, bounciness: 6, speed: 16,
    }).start();
  }, [incomingVoiceSwipeY]);

  const resetIncomingVideoSwipe = useCallback(() => {
    Animated.spring(incomingVideoSwipeY, {
      toValue: 0, useNativeDriver: true, bounciness: 6, speed: 16,
    }).start();
  }, [incomingVideoSwipeY]);

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const shouldRefetchMessagesAfterCall = useCallback(
    (p: { chatId?: string; callerId?: string; receiverId?: string }) => {
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
    },
    [chatId, currentUserId, otherUserId],
  );

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
    async (channelName: string, uid: number): Promise<{ token: string | null; uid: number }> => {
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
      } catch {
        return { token: null, uid };
      }
    },
    [],
  );

  // ─── Incoming call parsing / display ───────────────────────────────────────

  const parseIncomingCallPayload = useCallback(
    (data: IncomingCallPayload): IncomingCallPrompt | null => {
      if (otherUserId && data.senderId && data.senderId !== otherUserId) return null;
      const mode: ActiveCallMode = data.callType === 'video' ? 'video' : 'voice';
      const rawCallerName = String(data.callerName ?? '').trim();
      const rawCallerAvatar = String(data.callerAvatar ?? '').trim();
      const fallbackName = String(name ?? '').trim();
      const callerName =
        rawCallerName || (fallbackName && fallbackName !== 'Chat' ? fallbackName : 'Incoming call');
      return { callerName, mode, callId: data.callId, callerAvatar: rawCallerAvatar || undefined };
    },
    [name, otherUserId],
  );

  const openIncomingCallPrompt = useCallback((incoming: IncomingCallPrompt) => {
    if (incoming.callerName && incoming.callerName !== 'Incoming call') {
      setName((prev) => {
        const current = String(prev ?? '').trim();
        return !current || current === 'Chat' || current === 'Incoming call' ? incoming.callerName : prev;
      });
    }
    if (incoming.callerAvatar) {
      setPartnerAvatar({ uri: incoming.callerAvatar } as any);
    }
    if (incoming.mode === 'video') {
      setIncomingVideoCallerName(incoming.callerName);
      setIncomingVideoCallId(incoming.callId ?? null);
      setIncomingVideoCallVisible(true);
      return;
    }
    setIncomingVoiceCallerName(incoming.callerName);
    setIncomingVoiceCallId(incoming.callId ?? null);
    setIncomingVoiceCallVisible(true);
  }, [setName, setPartnerAvatar]);

  const openIncomingCallFromBanner = useCallback(() => {
    setIncomingCallBannerVisible(false);
    setIncomingVoiceCallVisible(incomingCallBannerMode === 'voice');
    setIncomingVideoCallVisible(incomingCallBannerMode === 'video');
  }, [incomingCallBannerMode]);

  const showIncomingCallBanner = useCallback(
    (incoming: IncomingCallPrompt) => {
      if (incoming.callerName && incoming.callerName !== 'Incoming call') {
        setName((prev) => {
          const current = String(prev ?? '').trim();
          return !current || current === 'Chat' || current === 'Incoming call' ? incoming.callerName : prev;
        });
      }
      if (incoming.callerAvatar) {
        setPartnerAvatar({ uri: incoming.callerAvatar } as any);
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
      setIncomingVoiceCallVisible(false);
      setIncomingVideoCallVisible(false);
      setIncomingCallBannerVisible(true);
    },
    [setName, setPartnerAvatar],
  );

  // Helper to set call context from route params (used in index.tsx route effect)
  const setIncomingCallContext = useCallback(
    (ctx: { callId?: string; channelName?: string; rtcToken?: string }) => {
      if (ctx.callId) setActiveCallId(ctx.callId);
      if (ctx.channelName) setActiveCallChannelName(ctx.channelName);
      if (ctx.rtcToken) setActiveCallRtcToken(ctx.rtcToken);
    },
    [],
  );

  // ─── Shared "reset all call state" helper ──────────────────────────────────

  const resetCallState = useCallback(() => {
    setIncomingVoiceCallVisible(false);
    setIncomingVideoCallVisible(false);
    setIncomingCallBannerVisible(false);
    setCallStateVisible(false);
    setActiveCallId(null);
    setPartnerAudioEnabled(true);
    setPartnerVideoEnabled(true);
    setIsOutgoingVoiceRinging(false);
    setIsSwitchingVoiceToVideo(false);
    setSwitchToVideoPopupVisible(false);
    setIncomingCallSwitchRequestVisible(false);
    setCallConnectedAtMs(null);
    setActiveCallChannelName(null);
    setActiveCallRtcToken(null);
    setLocalRtcUid(0);
    void agoraCallService.leaveChannel();
  }, []);

  // ─── Socket call-event handlers ────────────────────────────────────────────

  const onCallAccepted = useCallback((payload: CallLifecyclePayload) => {
    if (!payload.callId) return;
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
    setIncomingVoiceCallVisible(false);
    setIncomingVideoCallVisible(false);
    setIncomingCallBannerVisible(false);
    setSwitchToVideoPopupVisible(false);
    setIncomingCallSwitchRequestVisible(false);
  }, []);

  const onCallRequestSent = useCallback((payload: CallRequestSentPayload) => {
    if (!payload.callId) return;
    setActiveCallId(payload.callId);
    setActiveCallChannelName(payload.channelName ?? null);
    setActiveCallRtcToken(payload.rtcToken ?? null);
    if (payload.callType) {
      const mode: ActiveCallMode = payload.callType === 'video' ? 'video' : 'voice';
      setActiveCallMode(mode);
      setCallVideoEnabled(mode === 'video');
    }
  }, []);

  const onCallFailed = useCallback(
    (payload: CallFailedPayload) => {
      const normalizedCode = String(payload.code ?? '').toUpperCase();
      resetCallState();
      const refetchThisChat =
        chatId &&
        (payload.callId == null || activeCallId == null || payload.callId === activeCallId);
      if (refetchThisChat) refreshChatMessagesFromApi();
      if (normalizedCode === 'RECEIVER_OFFLINE' || normalizedCode === 'RECEIVER_DELIVERY_FAILED') {
        showErrorToast('User is offline right now.');
        return;
      }
      showErrorToast(payload.message || 'Call failed. Please try again.');
    },
    [resetCallState, chatId, activeCallId, refreshChatMessagesFromApi],
  );

  const onCallRejected = useCallback(
    (payload: CallLifecyclePayload) => {
      if (!payload.callId) return;
      if (activeCallId && payload.callId !== activeCallId) return;
      resetCallState();
      if (shouldRefetchMessagesAfterCall(payload)) refreshChatMessagesFromApi();
      showSuccessToast('Call was declined.');
    },
    [activeCallId, resetCallState, shouldRefetchMessagesAfterCall, refreshChatMessagesFromApi],
  );

  const onCallEnded = useCallback(
    (payload: CallLifecyclePayload) => {
      if (!payload.callId) return;
      if (activeCallId && payload.callId !== activeCallId) return;
      resetCallState();
      if (shouldRefetchMessagesAfterCall(payload)) refreshChatMessagesFromApi();
      showSuccessToast('Call ended.');
    },
    [activeCallId, resetCallState, shouldRefetchMessagesAfterCall, refreshChatMessagesFromApi],
  );

  const onCallPartnerAudio = useCallback(
    (payload: CallPartnerAudioPayload) => {
      if (!payload.userId || payload.userId !== otherUserId) return;
      if (activeCallId && payload.callId && payload.callId !== activeCallId) return;
      setPartnerAudioEnabled(payload.enabled);
    },
    [activeCallId, otherUserId],
  );

  const onCallPartnerVideo = useCallback(
    (payload: CallPartnerVideoPayload) => {
      if (!payload.userId || payload.userId !== otherUserId) return;
      if (activeCallId && payload.callId && payload.callId !== activeCallId) return;
      setPartnerVideoEnabled(payload.enabled);
    },
    [activeCallId, otherUserId],
  );

  const onCallSwitchRequest = useCallback(
    (payload: CallSwitchRequestPayload) => {
      if (!payload.callId || payload.targetType !== 'video') return;
      if (!callStateVisible || !activeCallId || payload.callId !== activeCallId) return;
      if (activeCallMode !== 'voice') return;
      if (payload.fromUserId && currentUserId && payload.fromUserId === currentUserId) return;
      if (payload.chatId && chatId && payload.chatId !== chatId) return;
      setIncomingCallSwitchRequestVisible(true);
    },
    [activeCallId, activeCallMode, callStateVisible, chatId, currentUserId],
  );

  const onCallSwitchApplied = useCallback(
    (payload: CallSwitchAppliedPayload) => {
      if (!payload.callId || !activeCallId || payload.callId !== activeCallId) return;
      const raw = String(payload.callType ?? payload.targetType ?? '').toLowerCase();
      if (!raw) return;
      const isVoiceOnly = raw === 'voice' || raw === 'audio' || raw === 'voice_call' || raw === 'audio_call';
      const enableVideo = !isVoiceOnly && raw.includes('video');
      void agoraCallService.applyCallSwitchToVideoInChannel(enableVideo);
      setActiveCallMode(enableVideo ? 'video' : 'voice');
      setCallVideoEnabled(enableVideo);
      if (enableVideo) setVideoCallUiHidden(false);
      setIsSwitchingVoiceToVideo(false);
      setIncomingCallSwitchRequestVisible(false);
      setSwitchToVideoPopupVisible(false);
    },
    [activeCallId],
  );

  // ─── Register call socket events ───────────────────────────────────────────

  useEffect(() => {
    const handleIncomingCallEvent = (payload: IncomingCallPayload) => {
      const parsed = parseIncomingCallPayload(payload);
      if (!parsed) return;
      const key = `${parsed.mode}:${parsed.callId ?? ''}`;
      if (handledIncomingCallRef.current === key) return;
      handledIncomingCallRef.current = key;
      if (callStateVisible) return;
      if (parsed.mode === 'voice' && incomingVoiceCallVisible) return;
      if (parsed.mode === 'video' && incomingVideoCallVisible) return;
      showIncomingCallBanner(parsed);
    };

    const unsubIncomingCall = socketService.on<IncomingCallPayload>('incoming_call', handleIncomingCallEvent);
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
    };
  }, [
    callStateVisible,
    incomingVoiceCallVisible,
    incomingVideoCallVisible,
    parseIncomingCallPayload,
    showIncomingCallBanner,
    handledIncomingCallRef,
    onCallAccepted,
    onCallRejected,
    onCallEnded,
    onCallRequestSent,
    onCallFailed,
    onCallPartnerAudio,
    onCallPartnerVideo,
    onCallSwitchRequest,
    onCallSwitchApplied,
  ]);

  // ─── Agora effects ─────────────────────────────────────────────────────────

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

  useEffect(() => {
    const unsub = agoraCallService.subscribeAudioRoute((route) => {
      if (!callStateVisibleRef.current) return;
      setSelectedAudioDevice(route);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!callStateVisible || !activeCallId || !activeCallChannelName) return;
    let cancelled = false;
    const join = async () => {
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
        localVideoEnabled: activeCallMode === 'video' ? callVideoEnabled : false,
      });
    };
    void join();
    return () => { cancelled = true; };
  }, [
    activeCallId,
    activeCallChannelName,
    activeCallRtcToken,
    callStateVisible,
    fetchAgoraRtcToken,
    getAgoraUidForCurrentUser,
  ]);

  // ─── Call action handlers ──────────────────────────────────────────────────

  const handleHeaderVideoCallPress = useCallback(() => {
    const start = async () => {
      const permission = await checkCameraPermission();
      const granted = permission === 'granted' || (await requestCameraPermission()) === 'granted';
      if (!granted) { showErrorToast('Camera permission is required for video calls.'); return; }
      if (chatId && otherUserId) socketService.callRequest(otherUserId, chatId, 'video', outgoingCallMeta);
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
      setVideoCallUiHidden(false);
      setCallStateVisible(true);
    };
    void start();
  }, [chatId, otherUserId, outgoingCallMeta]);

  const handleHeaderVoiceCallPress = useCallback(() => {
    if (chatId && otherUserId) socketService.callRequest(otherUserId, chatId, 'audio', outgoingCallMeta);
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
    setCallStateVisible(true);
  }, [chatId, otherUserId, outgoingCallMeta]);

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
        const granted = permission === 'granted' || (await requestCameraPermission()) === 'granted';
        if (!granted) { showErrorToast('Camera permission is required to turn video on.'); return; }
      }
      setCallVideoEnabled((prev) => !prev);
    };
    void toggle();
  }, [callVideoEnabled]);

  const closeCallState = useCallback(() => {
    if (activeCallId) socketService.callEnd(activeCallId);
    setActiveCallId(null);
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
  }, [activeCallId]);

  const minimizeCallState = useCallback(() => {
    setCallStateVisible(false);
    setVideoCallUiHidden(false);
    setAudioDeviceSheetVisible(false);
    setSwitchToVideoPopupVisible(false);
    setIncomingCallBannerVisible(false);
  }, []);

  const acceptIncomingVoiceCall = useCallback(() => {
    if (incomingVoiceCallId) {
      socketService.callAccept(incomingVoiceCallId);
      setActiveCallId(incomingVoiceCallId);
    }
    setIncomingVoiceCallVisible(false);
    setIncomingCallBannerVisible(false);
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
    setCallStateVisible(true);
  }, [incomingVoiceCallId]);

  const declineIncomingVoiceCall = useCallback(() => {
    if (incomingVoiceCallId) socketService.callReject(incomingVoiceCallId);
    setIncomingVoiceCallVisible(false);
    setIncomingVoiceCallId(null);
    setIncomingCallBannerVisible(false);
  }, [incomingVoiceCallId]);

  const acceptIncomingVideoCall = useCallback(() => {
    const accept = async () => {
      const permission = await checkCameraPermission();
      const granted = permission === 'granted' || (await requestCameraPermission()) === 'granted';
      if (!granted) { showErrorToast('Camera permission is required to accept video call.'); return; }
      if (incomingVideoCallId) {
        socketService.callAccept(incomingVideoCallId);
        setActiveCallId(incomingVideoCallId);
      }
      setIncomingVideoCallVisible(false);
      setIncomingCallBannerVisible(false);
      setActiveCallMode('video');
      setCallAudioEnabled(true);
      setCallVideoEnabled(true);
      setPartnerAudioEnabled(true);
      setPartnerVideoEnabled(true);
      setIsOutgoingVoiceRinging(false);
      setIsSwitchingVoiceToVideo(false);
      setSelectedAudioDevice('earpiece');
      setCallConnectedAtMs(Date.now());
      setVideoCallUiHidden(false);
      setCallStateVisible(true);
    };
    void accept();
  }, [incomingVideoCallId]);

  const declineIncomingVideoCall = useCallback(() => {
    if (incomingVideoCallId) socketService.callReject(incomingVideoCallId);
    setIncomingVideoCallVisible(false);
    setIncomingVideoCallId(null);
    setIncomingCallBannerVisible(false);
  }, [incomingVideoCallId]);

  const dismissIncomingVoiceCallModal = useCallback(() => setIncomingVoiceCallVisible(false), []);
  const dismissIncomingVideoCallModal = useCallback(() => setIncomingVideoCallVisible(false), []);

  const triggerIncomingVoiceSwipeAccept = useCallback(() => {
    Animated.timing(incomingVoiceSwipeY, {
      toValue: -96, duration: 120, useNativeDriver: true,
    }).start(() => {
      incomingVoiceSwipeY.setValue(0);
      acceptIncomingVoiceCall();
    });
  }, [acceptIncomingVoiceCall, incomingVoiceSwipeY]);

  const triggerIncomingVideoSwipeAccept = useCallback(() => {
    Animated.timing(incomingVideoSwipeY, {
      toValue: -96, duration: 120, useNativeDriver: true,
    }).start(() => {
      incomingVideoSwipeY.setValue(0);
      acceptIncomingVideoCall();
    });
  }, [acceptIncomingVideoCall, incomingVideoSwipeY]);

  const incomingVoiceAcceptPanResponder = useMemo(
    () => PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_evt, gs) => gs.dy < -3 && Math.abs(gs.dy) > Math.abs(gs.dx),
      onPanResponderMove: (_evt, gs) => incomingVoiceSwipeY.setValue(Math.max(-110, Math.min(0, gs.dy))),
      onPanResponderRelease: (_evt, gs) => {
        if (gs.dy <= -56) { triggerIncomingVoiceSwipeAccept(); return; }
        resetIncomingVoiceSwipe();
      },
      onPanResponderTerminate: resetIncomingVoiceSwipe,
    }),
    [incomingVoiceSwipeY, resetIncomingVoiceSwipe, triggerIncomingVoiceSwipeAccept],
  );

  const incomingVideoAcceptPanResponder = useMemo(
    () => PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_evt, gs) => gs.dy < -3 && Math.abs(gs.dy) > Math.abs(gs.dx),
      onPanResponderMove: (_evt, gs) => incomingVideoSwipeY.setValue(Math.max(-110, Math.min(0, gs.dy))),
      onPanResponderRelease: (_evt, gs) => {
        if (gs.dy <= -56) { triggerIncomingVideoSwipeAccept(); return; }
        resetIncomingVideoSwipe();
      },
      onPanResponderTerminate: resetIncomingVideoSwipe,
    }),
    [incomingVideoSwipeY, resetIncomingVideoSwipe, triggerIncomingVideoSwipeAccept],
  );

  const toggleVideoCallUiHidden = useCallback(() => setVideoCallUiHidden((prev) => !prev), []);

  const flipVideoCallCamera = useCallback(() => {
    if (!callStateVisible || activeCallMode !== 'video' || !callVideoEnabled) return;
    void agoraCallService.flipCamera();
  }, [activeCallMode, callStateVisible, callVideoEnabled]);

  const selectAudioDevice = useCallback((device: AudioDevice) => {
    setSelectedAudioDevice(device);
    setAudioDeviceSheetVisible(false);
  }, []);

  const openAudioDeviceSheet = useCallback(() => {
    if (selectedAudioDevice !== 'speaker') {
      selectAudioDevice('speaker');
    } else {
      setAudioDeviceSheetVisible((prev) => !prev);
    }
  }, [selectedAudioDevice, selectAudioDevice]);

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
    [activeCallId],
  );

  const openSwitchToVideoPopup = useCallback(() => {
    if (isOutgoingVoiceRinging || isSwitchingVoiceToVideo) return;
    setAudioDeviceSheetVisible(false);
    setSwitchToVideoPopupVisible(true);
  }, [isOutgoingVoiceRinging, isSwitchingVoiceToVideo]);

  // ─── Derived display values ────────────────────────────────────────────────

  const audioRouteFabHighlighted = audioDeviceSheetVisible || selectedAudioDevice !== 'earpiece';
  const isPartnerFullyOff = !partnerAudioEnabled && !partnerVideoEnabled;
  const showPartnerMicOffState = partnerVideoEnabled && !partnerAudioEnabled;
  const showVideoPreviewOffSurface = !callVideoEnabled;
  const showRemoteRtcVideo = activeCallMode === 'video' && remoteRtcUid != null && AgoraRtcSurfaceView != null;

  return {
    // ── State ──
    activeCallMode,
    callStateVisible,
    callAudioEnabled,
    callVideoEnabled,
    partnerAudioEnabled,
    partnerVideoEnabled,
    videoCallUiHidden,
    incomingVoiceCallVisible,
    incomingVoiceCallerName,
    incomingCallBannerVisible,
    incomingCallBannerMode,
    incomingVideoCallVisible,
    incomingVideoCallerName,
    activeCallId,
    activeCallChannelName,
    activeCallRtcToken,
    localRtcUid,
    remoteRtcUid,
    isOutgoingVoiceRinging,
    isSwitchingVoiceToVideo,
    callConnectedAtMs,
    audioDeviceSheetVisible,
    selectedAudioDevice,
    switchToVideoPopupVisible,
    incomingCallSwitchRequestVisible,
    AgoraRtcSurfaceView,
    incomingVoiceSwipeY,
    incomingVoiceAcceptPanResponder,
    incomingVideoSwipeY,
    incomingVideoAcceptPanResponder,
    // ── Derived ──
    audioRouteFabHighlighted,
    isPartnerFullyOff,
    showPartnerMicOffState,
    showVideoPreviewOffSurface,
    showRemoteRtcVideo,
    // ── Handlers ──
    handleHeaderVideoCallPress,
    handleHeaderVoiceCallPress,
    toggleCallAudio,
    toggleCallVideo,
    closeCallState,
    minimizeCallState,
    acceptIncomingVoiceCall,
    declineIncomingVoiceCall,
    acceptIncomingVideoCall,
    declineIncomingVideoCall,
    dismissIncomingVoiceCallModal,
    dismissIncomingVideoCallModal,
    openIncomingCallFromBanner,
    showIncomingCallBanner,
    openIncomingCallPrompt,
    parseIncomingCallPayload,
    toggleVideoCallUiHidden,
    flipVideoCallCamera,
    selectAudioDevice,
    openAudioDeviceSheet,
    requestSwitchVoiceToVideo,
    respondToIncomingCallSwitchRequest,
    openSwitchToVideoPopup,
    cancelSwitchToVideoRequest: useCallback(() => setSwitchToVideoPopupVisible(false), []),
    setIncomingCallContext,
    // for the route-param incomingCall effect in index.tsx
    setActiveCallId,
    setActiveCallChannelName,
    setActiveCallRtcToken,
  };
}
