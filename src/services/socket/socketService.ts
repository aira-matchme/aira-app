/** Payloads for socket events (adjust to match your backend) */
import { io, type Socket } from 'socket.io-client';

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
  callerName?: string;
  callType: 'voice' | 'video';
}

export interface CallLifecyclePayload {
  callId: string;
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
  | 'call_partner_video';

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
  };

  /** Backend contract (verify against your server):
   * - Client emit: join({ chatId } | { userId }) | typing({ sender, receiver, isTyping }) | message_send({ sender, receiver, message }) | message_delete({ sender, receiver, messageId })
   * - Server emit: join_success (presence/online), typing({ sender, receiver, isTyping }), message_send/message_receive({ sender, receiver, message?, messageId?, timestamp? }), message_delete
   */
  private static readonly SOCKET_URL = 'wss://dev-socket.airamatchme.com';

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


    this.socket = io(SocketService.SOCKET_URL, {
      transports: ['websocket'],
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
      this.notifyConnectionState(true);
      const payload = this.userId ? { userId: this.userId } : {};
      this.send('join', payload);
    });

    this.socket.on('disconnect', (_reason) => {
      this.notifyConnectionState(false);
    });

    this.socket.on('connect_error', (_err) => {
    });

    this.socket.onAny((_event, ..._args) => {
    });

    // Incoming events from backend
    this.socket.on('join', (data: unknown) => {
      this.emit('join', data);
    });

    const handlePresence = (data: unknown) => {
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
      const d = (data ?? {}) as Record<string, unknown>;
      const sender = String(d.sender ?? d.userId ?? d.senderId ?? '');
      let receiver = String(d.receiver ?? d.targetUserId ?? d.receiverId ?? '');
      if (!receiver && this.userId) receiver = this.userId;
      const isTyping = d.isTyping !== false && d.typing !== false;
      this.emit('typing', { sender, receiver, isTyping });
    });

    // Some backends emit `message_receive`, others emit `message_send` for incoming messages.
    const handleIncomingMessage = (data: unknown) => {
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

    const handleIncomingCall = (data: unknown, defaultType?: 'voice' | 'video') => {
      const d = (data ?? {}) as Record<string, unknown>;
      const senderId = String(d.senderId ?? d.sender ?? d.fromUserId ?? d.userId ?? '');
      let receiverId = String(d.receiverId ?? d.receiver ?? d.toUserId ?? '');
      if (!receiverId && this.userId) receiverId = this.userId;
      const rawType = String(d.callType ?? d.type ?? d.mode ?? defaultType ?? 'voice').toLowerCase();
      const callType: 'voice' | 'video' =
        rawType.includes('video') ? 'video' : rawType.includes('audio') ? 'voice' : 'voice';
      const callerName = String(d.callerName ?? d.name ?? d.fromName ?? '').trim() || undefined;
      const callId = String(d.callId ?? d.call_id ?? d.id ?? '').trim() || undefined;
      const chatId = String(d.chatId ?? d.chat_id ?? '').trim() || undefined;
      this.emit('incoming_call', { senderId, receiverId, callerName, callType, callId, chatId });
    };
    this.socket.on('incoming_call', (data) => handleIncomingCall(data));
    this.socket.on('call_incoming', (data) => handleIncomingCall(data));
    this.socket.on('incoming_voice_call', (data) => handleIncomingCall(data, 'voice'));
    this.socket.on('voice_call_incoming', (data) => handleIncomingCall(data, 'voice'));
    this.socket.on('incoming_video_call', (data) => handleIncomingCall(data, 'video'));
    this.socket.on('video_call_incoming', (data) => handleIncomingCall(data, 'video'));

    const handleCallLifecycle = (data: unknown): CallLifecyclePayload => {
      const d = (data ?? {}) as Record<string, unknown>;
      return { callId: String(d.callId ?? d.call_id ?? d.id ?? '') };
    };
    this.socket.on('call_accepted', (data) => this.emit('call_accepted', handleCallLifecycle(data)));
    this.socket.on('call_accept', (data) => this.emit('call_accepted', handleCallLifecycle(data)));
    this.socket.on('call_rejected', (data) => this.emit('call_rejected', handleCallLifecycle(data)));
    this.socket.on('call_reject', (data) => this.emit('call_rejected', handleCallLifecycle(data)));
    this.socket.on('call_end', (data) => this.emit('call_ended', handleCallLifecycle(data)));
    this.socket.on('call_ended', (data) => this.emit('call_ended', handleCallLifecycle(data)));

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
      this.emit('call_partner_audio', { callId, userId, enabled });
    };
    this.socket.on('call_mic_update', (data) => handlePartnerAudio(data));
    this.socket.on('call_audio_state', (data) => handlePartnerAudio(data));
    this.socket.on('call_participant_audio', (data) => handlePartnerAudio(data));
    this.socket.on('call_mute', (data) => handlePartnerAudio(data, false));
    this.socket.on('call_unmute', (data) => handlePartnerAudio(data, true));

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
      this.emit('call_partner_video', { callId, userId, enabled });
    };
    this.socket.on('call_video_state', (data) => handlePartnerVideo(data));
    this.socket.on('call_camera_update', (data) => handlePartnerVideo(data));
    this.socket.on('call_participant_video', (data) => handlePartnerVideo(data));
    this.socket.on('call_video_off', (data) => handlePartnerVideo(data, false));
    this.socket.on('call_video_on', (data) => handlePartnerVideo(data, true));
  }

  private notifyConnectionState(connected: boolean) {
    this.connectionListeners.forEach((fn) => fn(connected));
  }

  private emit<T>(type: SocketEventType, data: T) {
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
      return;
    }

    const body = this.withAuthorization(payload);
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
  callRequest(toUserId: string, chatId: string, callType: 'audio' | 'video') {
    this.send('call_request', { toUserId, chatId, callType });
  }

  /** Receiver accepts incoming call. */
  callAccept(callId: string) {
    this.send('call_accept', { callId });
  }

  /** Receiver rejects incoming call. */
  callReject(callId: string) {
    this.send('call_reject', { callId });
  }

  /** Any participant ends an ongoing call. */
  callEnd(callId: string) {
    this.send('call_end', { callId });
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
    this.socket = null;
    this.token = null;
    this.userId = null;
  }
}

export default new SocketService();
