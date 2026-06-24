/** Payloads for socket events (adjust to match your backend) */
import { io, type Socket } from 'socket.io-client';
import { env } from '../../config/env';
import { resolveSocketUrl } from '../../utils/socketUrl';

export interface JoinPayload {
  chatId: string;
}

export interface TypingPayload {
  sender: string;
  receiver: string;
  isTyping: boolean;
}

/** Payload when sending a message. */
export interface MessageSendPayload {
  sender: string;
  receiver: string;
  message: string;
}

/** Payload when receiving a message (emit on message_receive). */
export interface MessageReceivePayload {
  sender: string;
  receiver: string;
  /** For incoming events we attach the full backend message object here. */
  message: unknown;
  /** Optional server-generated id; used to avoid duplicates and for delete. */
  messageId?: string;
  /** Optional server timestamp (ISO string or ms); used for display. */
  timestamp?: string | number;
  createdAt?: string;
  /** For image/file messages: URL of the uploaded file. */
  url?: string;
  /** For image/file messages: 'image' | 'audio' | 'video'. */
  messageType?: string;
  /** For file messages: display name. */
  name?: string;
  /** Optional file key (S3 etc). */
  key?: string;
  /** Optional files array from server. */
  files?: Array<{ url?: string; key?: string; name?: string }>;
}

/** Payload for message delete (send and receive). */
export interface MessageDeletePayload {
  sender: string;
  receiver: string;
  messageId: string;
}

export interface IncomingCallPayload {
  senderId: string;
  receiverId: string;
  chatId?: string;
  callId?: string;
  channelName?: string;
  rtcToken?: string;
  callerName?: string;
  callerAvatar?: string;
  status?: string;
  createdAt?: string;
  callType: 'audio' | 'video';
}

export interface CallLifecyclePayload {
  callId: string;
  callerId?: string;
  receiverId?: string;
  chatId?: string;
  channelName?: string;
  rtcToken?: string;
  callType?: 'audio' | 'video';
  status?: string;
  startedAt?: string;
  endedAt?: string;
  endedBy?: string;
  durationSeconds?: number;
}

export interface CallRequestSentPayload extends CallLifecyclePayload {
  delivery?: string;
}

export interface CallFailedPayload {
  callId?: string;
  code?: string;
  message?: string;
}

export interface CallPartnerAudioPayload {
  callId?: string;
  userId: string;
  enabled: boolean;
}

export interface CallPartnerVideoPayload {
  callId?: string;
  userId: string;
  enabled: boolean;
}

/** Peer asks to upgrade/downgrade media in the same RTC channel (no new token / channel). */
export interface CallSwitchRequestPayload {
  callId: string;
  targetType: 'video' | 'audio';
  fromUserId?: string;
  chatId?: string;
  [key: string]: unknown;
}

/** Server confirmed switch — both sides apply Agora video on/off only after this. */
export interface CallSwitchAppliedPayload {
  callId: string;
  callType?: 'audio' | 'video';
  targetType?: 'audio' | 'video';
  [key: string]: unknown;
}

export type SocketEventType =
  | 'join'
  | 'join_success'
  | 'typing'
  | 'message_send'
  | 'message_delete'
  | 'incoming_call'
  | 'call_accepted'
  | 'call_rejected'
  | 'call_ended'
  | 'call_partner_audio'
  | 'call_partner_video'
  | 'call_request_sent'
  | 'call_failed'
  | 'call_switch_request'
  | 'call_switch_applied';

export type SocketEventListener<T = unknown> = (data: T) => void;

/** Callback for connection state changes (true = connected, false = disconnected). */
export type ConnectionStateListener = (connected: boolean) => void;

class SocketService {
  private socket: Socket | null = null;
  private token: string | null = null;
  private userId: string | null = null;
  private connectionListeners = new Set<ConnectionStateListener>();
  private listeners: Partial<Record<SocketEventType, Set<SocketEventListener>>> = {
    join: new Set(),
    join_success: new Set(),
    typing: new Set(),
    message_send: new Set(),
    message_delete: new Set(),
    incoming_call: new Set(),
    call_accepted: new Set(),
    call_rejected: new Set(),
    call_ended: new Set(),
    call_partner_audio: new Set(),
    call_partner_video: new Set(),
    call_request_sent: new Set(),
    call_failed: new Set(),
    call_switch_request: new Set(),
    call_switch_applied: new Set(),
  };

  /** Set to `true` temporarily when debugging socket/call traffic (otherwise every event logs to Metro). */
  private static readonly ENABLE_CALL_SOCKET_LOGS = true;

  private logCallSocket(direction: 'emit' | 'receive' | 'state', event: string, payload?: unknown) {
    if (!SocketService.ENABLE_CALL_SOCKET_LOGS) return;
    const ts = new Date().toISOString();
    // eslint-disable-next-line no-console
    console.log(`[socket:${direction}] ${ts} ${event}`, payload ?? '');
  }

  private logPartnerRejectDebug(socketEvent: string, raw: unknown, payload: CallLifecyclePayload) {
    if (!SocketService.ENABLE_CALL_SOCKET_LOGS) return;
    // eslint-disable-next-line no-console
    console.log(`[CALL_DEBUG] Partner rejected — socket: "${socketEvent}"`, {
      rawServerPayload: raw,
      normalizedPayload: payload,
    });
  }

  private onSocketReceive(event: string, payload: unknown) {
    this.logCallSocket('receive', event, payload);
  }

  /** Dedupe window targets for logical call emits (multiple raw socket names → one app event). */
  private callEmitDedupeUntil = new Map<string, number>();

  /**
   * Some backends emit the same logical call under several event names (e.g. `incoming_call` +
   * `incoming_video_call`, or `call_accept` + `call_accepted`). Returns true when this emit should
   * be skipped as a duplicate within `windowMs`.
   */
  private isDuplicateCallSocketEmit(dedupeKey: string, windowMs: number): boolean {
    const now = Date.now();
    const until = this.callEmitDedupeUntil.get(dedupeKey);
    if (until != null && until > now) {
      this.logCallSocket('state', 'emit_deduped_skip', { dedupeKey, windowMs });
      return true;
    }
    this.callEmitDedupeUntil.set(dedupeKey, now + windowMs);
    if (this.callEmitDedupeUntil.size > 80) {
      for (const [k, t] of this.callEmitDedupeUntil) {
        if (t <= now) this.callEmitDedupeUntil.delete(k);
      }
    }
    return false;
  }

  /** Backend contract (verify against your server):
   * - Client emit: join({ chatId } | { userId }) | typing({ sender, receiver, isTyping }) | message_send({ sender, receiver, message }) | message_delete({ sender, receiver, messageId })
   * - Server emit: join_success (presence/online), typing({ sender, receiver, isTyping }), message_send/message_receive({ sender, receiver, message?, messageId?, timestamp? }), message_delete
   */
  private getSocketUrl(): string {
    return resolveSocketUrl(env.API_BASE_URL, env.SOCKET_URL);
  }

  private getBearerToken() {
    if (!this.token) return null;
    return this.token.trim().toLowerCase().startsWith('bearer ')
      ? this.token.trim()
      : `Bearer ${this.token}`;
  }

  /**
   * Backend expects Authorization bearer token on *every* event.
   * We attach both `authorization` and `Authorization` to maximize compatibility.
   */
  private withAuthorization(payload: Record<string, unknown> = {}) {
    const bearer = this.getBearerToken();
    if (!bearer) return payload;

    return {
      ...payload,
      authorization: payload.authorization ?? bearer,
      Authorization: payload.Authorization ?? bearer,
    };
  }

  connect(token: string) {
    // If we're already connected with the same token, do nothing.
    if (this.socket?.connected && this.token === token) {
      return;
    }

    // Replace existing connection (e.g., token refresh).
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }

    this.token = token;
    const bearer = this.getBearerToken();
    const socketUrl = this.getSocketUrl();

    this.logCallSocket('state', 'connecting', { socketUrl });

    this.socket = io(socketUrl, {
      transports: ['polling', 'websocket'],
      reconnection: true,
      auth: bearer
        ? {
            token: bearer,
            authorization: bearer,
            Authorization: bearer,
          }
        : undefined,
      // In React Native, headers support depends on transport/server; we still include it.
      extraHeaders: bearer ? ({ Authorization: bearer } as Record<string, string>) : undefined,
    });

    this.socket.on('connect', () => {
      this.logCallSocket('state', 'connect', { userId: this.userId, socketUrl });
      this.notifyConnectionState(true);
      const payload = this.userId ? { userId: this.userId } : {};
      this.send('join', payload);
    });

    this.socket.on('disconnect', (_reason) => {
      this.logCallSocket('state', 'disconnect', { reason: _reason });
      this.notifyConnectionState(false);
    });

    this.socket.on('connect_error', (_err) => {
      this.logCallSocket('state', 'connect_error', { socketUrl, error: _err });
    });

    this.socket.onAny((_event, ..._args) => {
    });

    // Incoming events from backend
    this.socket.on('join', (data: unknown) => {
      this.onSocketReceive('join', data);
      this.emit('join', data);
    });

    const handlePresence = (data: unknown) => {
      this.onSocketReceive('join_success', data);
      this.emit('join_success', data);
    };
    this.socket.on('join_success', handlePresence);
    // Different backend deployments may use different event names for presence updates.
    this.socket.on('online_users', handlePresence);
    this.socket.on('online_user_ids', handlePresence);
    this.socket.on('presence_update', handlePresence);
    this.socket.on('user_online', handlePresence);
    this.socket.on('user_offline', handlePresence);

    this.socket.on('typing', (data: unknown) => {
      this.onSocketReceive('typing', data);
      const d = (data ?? {}) as Record<string, unknown>;
      const sender = String(d.sender ?? d.userId ?? d.senderId ?? '');
      let receiver = String(d.receiver ?? d.targetUserId ?? d.receiverId ?? '');
      if (!receiver && this.userId) receiver = this.userId;
      const isTyping = d.isTyping !== false && d.typing !== false;
      this.emit('typing', { sender, receiver, isTyping });
    });

    // Some backends emit `message_receive`, others emit `message_send` for incoming messages.
    const handleIncomingMessage = (data: unknown) => {
      this.onSocketReceive('message_receive', data);
      const raw = (data ?? {}) as Record<string, unknown>;
      const msg = (raw.message ?? {}) as Record<string, unknown>;
      let sender = String(msg.sender ?? raw.sender ?? raw.senderId ?? '');
      let receiver = String(msg.receiver ?? raw.receiver ?? raw.receiverId ?? '');
      if (!receiver && this.userId) receiver = this.userId;
      const messageId = msg._id != null ? String(msg._id) : (raw.messageId != null ? String(raw.messageId) : undefined);
      const timestamp = raw.timestamp ?? msg.createdAt ?? raw.createdAt;
      this.emit('message_send', {
        sender,
        receiver,
        message: msg,
        messageId,
        timestamp,
        createdAt: msg.createdAt ?? (typeof raw.createdAt === 'string' ? raw.createdAt : undefined),
      });
    };

    this.socket.on('message_receive', handleIncomingMessage);
    this.socket.on('message_send', handleIncomingMessage);
    this.socket.on('message', handleIncomingMessage);
    this.socket.on('new_message', handleIncomingMessage);
    this.socket.on('chat_message', handleIncomingMessage);

    const handleMessageDelete = (data: unknown) => {
      this.onSocketReceive('message_delete', data);
      const d = (data ?? {}) as Record<string, unknown>;
      const sender = String(d.sender ?? d.senderId ?? '');
      let receiver = String(d.receiver ?? d.receiverId ?? '');
      if (!receiver && this.userId) receiver = this.userId;
      const messageId = String(d.messageId ?? d.message_id ?? d.id ?? d._id ?? '');
      this.emit('message_delete', { sender, receiver, messageId });
    };
    this.socket.on('message_delete', handleMessageDelete);
    this.socket.on('message_deleted', handleMessageDelete);
    this.socket.on('delete_message', handleMessageDelete);

    const handleIncomingCall = (data: unknown, defaultType?: 'audio' | 'video') => {
      const d = (data ?? {}) as Record<string, unknown>;
      const senderId = String(d.senderId ?? d.sender ?? d.fromUserId ?? d.userId ?? '');
      let receiverId = String(d.receiverId ?? d.receiver ?? d.toUserId ?? '');
      if (!receiverId && this.userId) receiverId = this.userId;
      const rawType = String(d.callType ?? d.type ?? d.mode ?? defaultType ?? 'audio').toLowerCase();
      const callType: 'audio' | 'video' = rawType.includes('video') ? 'video' : 'audio';
      const callerName = String(d.callerName ?? d.name ?? d.fromName ?? '').trim() || undefined;
      const callerAvatar = String(
        d.callerAvatar ?? d.callerProfilePicture ?? d.profilePicture ?? d.avatar ?? d.photo ?? ''
      ).trim() || undefined;
      const callId = String(d.callId ?? d.call_id ?? d.id ?? '').trim() || undefined;
      const chatId = String(d.chatId ?? d.chat_id ?? '').trim() || undefined;
      const channelName = String(d.channelName ?? d.channel_name ?? d.channel ?? '').trim() || undefined;
      const rtcToken = String(d.rtcToken ?? d.rtc_token ?? d.token ?? '').trim() || undefined;
      const status = String(d.status ?? '').trim() || undefined;
      const createdAt = String(d.createdAt ?? d.created_at ?? '').trim() || undefined;
      this.logCallSocket('receive', 'incoming_call', {
        senderId,
        receiverId,
        callerName,
        callerAvatar,
        callType,
        callId,
        chatId,
        channelName,
        rtcToken,
        status,
        createdAt,
        raw: d,
      });
      const incomingDedupeKey = callId
        ? `incoming_call:${callId}`
        : `incoming_call:${senderId}:${receiverId}:${callType}:${channelName ?? ''}`;
      if (this.isDuplicateCallSocketEmit(incomingDedupeKey, 1200)) return;
      this.emit('incoming_call', {
        senderId,
        receiverId,
        callerName,
        callerAvatar,
        callType,
        callId,
        chatId,
        channelName,
        rtcToken,
        status,
        createdAt,
      });
    };
    this.socket.on('incoming_call', (data) => {
      this.onSocketReceive('incoming_call(raw)', data);
      handleIncomingCall(data);
    });
    this.socket.on('call_incoming', (data) => {
      this.onSocketReceive('call_incoming(raw)', data);
      handleIncomingCall(data);
    });
    this.socket.on('incoming_voice_call', (data) => {
      this.onSocketReceive('incoming_voice_call(raw)', data);
      handleIncomingCall(data, 'audio');
    });
    this.socket.on('voice_call_incoming', (data) => {
      this.onSocketReceive('voice_call_incoming(raw)', data);
      handleIncomingCall(data, 'audio');
    });
    this.socket.on('incoming_video_call', (data) => {
      this.onSocketReceive('incoming_video_call(raw)', data);
      handleIncomingCall(data, 'video');
    });
    this.socket.on('video_call_incoming', (data) => {
      this.onSocketReceive('video_call_incoming(raw)', data);
      handleIncomingCall(data, 'video');
    });

    const handleCallLifecycle = (data: unknown): CallLifecyclePayload => {
      const d = (data ?? {}) as Record<string, unknown>;
      const rawType = String(d.callType ?? d.call_type ?? d.mode ?? '').toLowerCase();
      const payload: CallLifecyclePayload = {
        callId: String(d.callId ?? d.call_id ?? d.id ?? ''),
        callerId: String(d.callerId ?? d.caller_id ?? d.senderId ?? d.sender ?? '').trim() || undefined,
        receiverId: String(d.receiverId ?? d.receiver_id ?? d.toUserId ?? d.receiver ?? '').trim() || undefined,
        chatId: String(d.chatId ?? d.chat_id ?? '').trim() || undefined,
        channelName: String(d.channelName ?? d.channel_name ?? d.channel ?? '').trim() || undefined,
        rtcToken: String(d.rtcToken ?? d.rtc_token ?? d.token ?? '').trim() || undefined,
        callType: rawType
          ? rawType.includes('video')
            ? 'video'
            : rawType.includes('audio') || rawType.includes('voice')
            ? 'audio'
            : undefined
          : undefined,
        status: String(d.status ?? '').trim() || undefined,
        startedAt: String(d.startedAt ?? d.started_at ?? '').trim() || undefined,
        endedAt: String(d.endedAt ?? d.ended_at ?? '').trim() || undefined,
        endedBy: String(d.endedBy ?? d.ended_by ?? '').trim() || undefined,
        durationSeconds:
          typeof d.durationSeconds === 'number'
            ? d.durationSeconds
            : typeof d.duration_seconds === 'number'
            ? d.duration_seconds
            : undefined,
      };
      this.logCallSocket('receive', 'call_lifecycle', { payload, raw: d });
      return payload;
    };

    this.socket.on('call_request_sent', (data) => {
      this.onSocketReceive('call_request_sent(raw)', data);
      this.emit('call_request_sent', handleCallLifecycle(data) as CallRequestSentPayload);
    });
    this.socket.on('call_failed', (data) => {
      this.onSocketReceive('call_failed(raw)', data);
      const d = (data ?? {}) as Record<string, unknown>;
      const payload: CallFailedPayload = {
        callId: String(d.callId ?? d.call_id ?? d.id ?? '').trim() || undefined,
        code: String(d.code ?? '').trim() || undefined,
        message: String(d.message ?? '').trim() || undefined,
      };
      this.emit('call_failed', payload);
    });
    this.socket.on('call_accepted', (data) => {
      this.onSocketReceive('call_accepted(raw)', data);
      const payload = handleCallLifecycle(data);
      const cid = payload.callId.trim();
      const acceptKey = cid
        ? `call_accepted:${cid}`
        : `call_accepted:${payload.callerId ?? ''}:${payload.receiverId ?? ''}:${payload.channelName ?? ''}`;
      if (this.isDuplicateCallSocketEmit(acceptKey, 800)) return;
      this.emit('call_accepted', payload);
    });
    this.socket.on('call_accept', (data) => {
      this.onSocketReceive('call_accept(raw)', data);
      const payload = handleCallLifecycle(data);
      const cid = payload.callId.trim();
      const acceptKey = cid
        ? `call_accepted:${cid}`
        : `call_accepted:${payload.callerId ?? ''}:${payload.receiverId ?? ''}:${payload.channelName ?? ''}`;
      if (this.isDuplicateCallSocketEmit(acceptKey, 800)) return;
      this.emit('call_accepted', payload);
    });
    this.socket.on('call_rejected', (data) => {
      this.onSocketReceive('call_rejected(raw)', data);
      const payload = handleCallLifecycle(data);
      this.logPartnerRejectDebug('call_rejected', data, payload);
      const cid = payload.callId.trim();
      const rejectKey = cid
        ? `call_rejected:${cid}`
        : `call_rejected:${payload.callerId ?? ''}:${payload.receiverId ?? ''}`;
      if (this.isDuplicateCallSocketEmit(rejectKey, 800)) return;
      this.emit('call_rejected', payload);
    });
    this.socket.on('call_reject', (data) => {
      this.onSocketReceive('call_reject(raw)', data);
      const payload = handleCallLifecycle(data);
      this.logPartnerRejectDebug('call_reject', data, payload);
      const cid = payload.callId.trim();
      const rejectKey = cid
        ? `call_rejected:${cid}`
        : `call_rejected:${payload.callerId ?? ''}:${payload.receiverId ?? ''}`;
      if (this.isDuplicateCallSocketEmit(rejectKey, 800)) return;
      this.emit('call_rejected', payload);
    });
    this.socket.on('call_end', (data) => {
      this.onSocketReceive('call_end(raw)', data);
      const payload = handleCallLifecycle(data);
      const cid = payload.callId.trim();
      const endedKey = cid
        ? `call_ended:${cid}`
        : `call_ended:${payload.callerId ?? ''}:${payload.receiverId ?? ''}`;
      if (this.isDuplicateCallSocketEmit(endedKey, 800)) return;
      this.emit('call_ended', payload);
    });
    this.socket.on('call_ended', (data) => {
      this.onSocketReceive('call_ended(raw)', data);
      const payload = handleCallLifecycle(data);
      const cid = payload.callId.trim();
      const endedKey = cid
        ? `call_ended:${cid}`
        : `call_ended:${payload.callerId ?? ''}:${payload.receiverId ?? ''}`;
      if (this.isDuplicateCallSocketEmit(endedKey, 800)) return;
      this.emit('call_ended', payload);
    });

    const handlePartnerAudio = (data: unknown, forceEnabled?: boolean) => {
      const d = (data ?? {}) as Record<string, unknown>;
      const callId = String(d.callId ?? d.call_id ?? d.id ?? '').trim() || undefined;
      const userId = String(
        d.userId ?? d.user_id ?? d.senderId ?? d.sender ?? d.fromUserId ?? d.participantId ?? ''
      ).trim();
      if (!userId) return;
      const mutedRaw = d.isMuted ?? d.muted ?? d.micMuted;
      const enabledRaw = d.enabled ?? d.audioEnabled ?? d.micEnabled;
      let enabled = true;
      if (typeof forceEnabled === 'boolean') {
        enabled = forceEnabled;
      } else if (typeof enabledRaw === 'boolean') {
        enabled = enabledRaw;
      } else if (typeof mutedRaw === 'boolean') {
        enabled = !mutedRaw;
      }
      this.logCallSocket('receive', 'call_partner_audio', { callId, userId, enabled, raw: d });
      const audioKey = `call_partner_audio:${callId ?? ''}:${userId}:${enabled ? '1' : '0'}`;
      if (this.isDuplicateCallSocketEmit(audioKey, 400)) return;
      this.emit('call_partner_audio', { callId, userId, enabled });
    };
    this.socket.on('call_mic_update', (data) => {
      this.onSocketReceive('call_mic_update(raw)', data);
      handlePartnerAudio(data);
    });
    this.socket.on('call_audio_state', (data) => {
      this.onSocketReceive('call_audio_state(raw)', data);
      handlePartnerAudio(data);
    });
    this.socket.on('call_participant_audio', (data) => {
      this.onSocketReceive('call_participant_audio(raw)', data);
      handlePartnerAudio(data);
    });
    this.socket.on('call_mute', (data) => {
      this.onSocketReceive('call_mute(raw)', data);
      handlePartnerAudio(data, false);
    });
    this.socket.on('call_unmute', (data) => {
      this.onSocketReceive('call_unmute(raw)', data);
      handlePartnerAudio(data, true);
    });

    const handlePartnerVideo = (data: unknown, forceEnabled?: boolean) => {
      const d = (data ?? {}) as Record<string, unknown>;
      const callId = String(d.callId ?? d.call_id ?? d.id ?? '').trim() || undefined;
      const userId = String(
        d.userId ?? d.user_id ?? d.senderId ?? d.sender ?? d.fromUserId ?? d.participantId ?? ''
      ).trim();
      if (!userId) return;
      const offRaw = d.videoOff ?? d.cameraOff ?? d.isVideoOff;
      const enabledRaw = d.videoEnabled ?? d.cameraEnabled ?? d.enabled;
      let enabled = true;
      if (typeof forceEnabled === 'boolean') {
        enabled = forceEnabled;
      } else if (typeof enabledRaw === 'boolean') {
        enabled = enabledRaw;
      } else if (typeof offRaw === 'boolean') {
        enabled = !offRaw;
      }
      this.logCallSocket('receive', 'call_partner_video', { callId, userId, enabled, raw: d });
      const videoKey = `call_partner_video:${callId ?? ''}:${userId}:${enabled ? '1' : '0'}`;
      if (this.isDuplicateCallSocketEmit(videoKey, 400)) return;
      this.emit('call_partner_video', { callId, userId, enabled });
    };
    this.socket.on('call_video_state', (data) => {
      this.onSocketReceive('call_video_state(raw)', data);
      handlePartnerVideo(data);
    });
    this.socket.on('call_camera_update', (data) => {
      this.onSocketReceive('call_camera_update(raw)', data);
      handlePartnerVideo(data);
    });
    this.socket.on('call_participant_video', (data) => {
      this.onSocketReceive('call_participant_video(raw)', data);
      handlePartnerVideo(data);
    });
    this.socket.on('call_video_off', (data) => {
      this.onSocketReceive('call_video_off(raw)', data);
      handlePartnerVideo(data, false);
    });
    this.socket.on('call_video_on', (data) => {
      this.onSocketReceive('call_video_on(raw)', data);
      handlePartnerVideo(data, true);
    });

    this.socket.on('call_switch_request', (data: unknown) => {
      this.onSocketReceive('call_switch_request(raw)', data);
      const d = (data ?? {}) as Record<string, unknown>;
      const tt = String(d.targetType ?? d.target_type ?? 'video').toLowerCase();
      const payload: CallSwitchRequestPayload = {
        ...d,
        callId: String(d.callId ?? d.call_id ?? '').trim(),
        targetType: tt.includes('audio') && !tt.includes('video') ? 'audio' : 'video',
        fromUserId: String(d.fromUserId ?? d.from_user_id ?? d.senderId ?? d.sender ?? '').trim() || undefined,
        chatId: String(d.chatId ?? d.chat_id ?? '').trim() || undefined,
      };
      if (!payload.callId) return;
      this.emit('call_switch_request', payload);
    });

    this.socket.on('call_switch_applied', (data: unknown) => {
      this.onSocketReceive('call_switch_applied(raw)', data);
      const d = (data ?? {}) as Record<string, unknown>;
      const ct = String(d.callType ?? d.call_type ?? d.targetType ?? d.target_type ?? '').toLowerCase();
      const callType: 'audio' | 'video' | undefined = ct.includes('video')
        ? 'video'
        : ct.includes('audio') || ct.includes('voice')
        ? 'audio'
        : undefined;
      const payload: CallSwitchAppliedPayload = {
        ...d,
        callId: String(d.callId ?? d.call_id ?? '').trim(),
        callType,
        targetType: callType,
      };
      if (!payload.callId) return;
      this.emit('call_switch_applied', payload);
    });
  }

  private notifyConnectionState(connected: boolean) {
    this.connectionListeners.forEach((fn) => fn(connected));
  }

  private emit<T>(type: SocketEventType, data: T) {
    if (type.startsWith('call_') || type === 'incoming_call') {
      this.logCallSocket('state', `emit_to_listeners:${type}`, data);
    }
    this.listeners[type]?.forEach((fn) => fn(data as T));
  }

  /** Whether the socket is currently connected. */
  isConnected(): boolean {
    return this.socket?.connected === true;
  }

  /** Subscribe to connection state changes. Returns unsubscribe. */
  onConnectionChange(listener: ConnectionStateListener): () => void {
    this.connectionListeners.add(listener);
    return () => this.connectionListeners.delete(listener);
  }

  /** Send socket.io event. Always attaches bearer token to payload. */
  send(event: string, payload: Record<string, unknown> = {}) {
    if (!this.socket?.connected) {
      this.logCallSocket('state', 'send_skipped_disconnected', { event, payload });
      return;
    }

    const body = this.withAuthorization(payload);
    this.logCallSocket('emit', event, body);
    this.socket.emit(event, body);
  }

  /** Join a chat room. Call when user opens a chat. */
  join(chatId: string) {
    this.send('join', { chatId });
  }

  /** Send typing indicator: sender (current user id), receiver (other user id), isTyping (true/false). */
  typing(sender: string, receiver: string, isTyping: boolean) {
    this.send('typing', { sender, receiver, isTyping });
  }

  /** Send text message: sender, receiver, message. */
  messageSend(sender: string, receiver: string, message: string) {
    this.send('message_send', { sender, receiver, message });
  }

  /**
   * Send a message payload that comes directly from sendMessageApi (backend response).
   * Backend expects: { sender, receiver, message: <messageObject> }.
   */
  messageSendFromApi(sender: string, receiver: string, message: Record<string, unknown>) {
    this.send('message_send', { sender, receiver, message });
  }

  /** Send message delete: sender, receiver, messageId. Sends both snake and camel keys for backend compatibility. */
  messageDelete(sender: string, receiver: string, messageId: string) {
    this.send('message_delete', {
      sender,
      receiver,
      messageId,
      senderId: sender,
      receiverId: receiver,
    });
  }

  /** Set current user for presence; will emit join when possible, server replies with join_success. */
  setCurrentUser(userId: string) {
    this.userId = userId;
    if (this.socket?.connected) {
      this.send('join', { userId });
    }
  }

  /** Start a call to another user in a chat. */
  callRequest(
    toUserId: string,
    chatId: string,
    callType: 'audio' | 'video',
    meta?: { callerName?: string; callerAvatar?: string }
  ) {
    const callerName = typeof meta?.callerName === 'string' ? meta.callerName.trim() : '';
    const callerAvatar = typeof meta?.callerAvatar === 'string' ? meta.callerAvatar.trim() : '';
    const payload: Record<string, unknown> = {
      toUserId,
      chatId,
      callType,
    };
    if (callerName) payload.callerName = callerName;
    if (callerAvatar) payload.callerAvatar = callerAvatar;

    this.logCallSocket('emit', 'call_request(method)', payload);
    this.send('call_request', payload);
  }

  /** Receiver accepts incoming call. */
  callAccept(callId: string) {
    this.logCallSocket('emit', 'call_accept(method)', { callId });
    this.send('call_accept', { callId });
  }

  /** Receiver rejects incoming call. */
  callReject(callId: string) {
    this.logCallSocket('emit', 'call_reject(method)', { callId });
    this.send('call_reject', { callId });
  }

  /** Any participant ends an ongoing call. */
  callEnd(callId: string) {
    this.logCallSocket('emit', 'call_end(method)', { callId });
    this.send('call_end', { callId });
  }

  /** In-call upgrade/downgrade (same channel, same token) — Step 1 requester. */
  callSwitchRequest(callId: string, targetType: 'video' | 'audio' = 'video') {
    const payload = { callId, targetType };
    this.logCallSocket('emit', 'call_switch_request(method)', payload);
    this.send('call_switch_request', payload);
  }

  /** In-call switch — Step 3 receiver response. */
  callSwitchResponse(callId: string, accepted: boolean, targetType: 'video' | 'audio' = 'video') {
    const payload = { callId, accepted, targetType };
    this.logCallSocket('emit', 'call_switch_response(method)', payload);
    this.send('call_switch_response', payload);
  }

  /** Broadcast local mic state so peer UI can reflect mute/unmute quickly. */
  callMicUpdate(callId: string, userId: string, enabled: boolean) {
    const payload = {
      callId,
      userId,
      enabled,
      isMuted: !enabled,
      muted: !enabled,
      micEnabled: enabled,
    };
    this.logCallSocket('emit', 'call_mic_update(method)', payload);
    this.send('call_mic_update', payload);
  }

  /** Subscribe to incoming socket events. Returns unsubscribe. */
  on<T = unknown>(event: SocketEventType, callback: SocketEventListener<T>): () => void {
    if (!this.listeners[event]) this.listeners[event] = new Set();
    this.listeners[event]!.add(callback as SocketEventListener);
    return () => this.listeners[event]?.delete(callback as SocketEventListener);
  }

  disconnect() {
    this.socket?.removeAllListeners();
    this.socket?.disconnect();
    this.listeners = {};
    this.connectionListeners.clear();
    this.socket = null;
    this.token = null;
    this.userId = null;
  }
}

export default new SocketService();
