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
  message: string;
  /** Optional server-generated id; used to avoid duplicates and for delete. */
  messageId?: string;
  /** Optional server timestamp (ISO string or ms); used for display. */
  timestamp?: string | number;
  createdAt?: string;
}

/** Payload for message delete (send and receive). */
export interface MessageDeletePayload {
  sender: string;
  receiver: string;
  messageId: string;
}

export type SocketEventType = 'join' | 'join_success' | 'typing' | 'message_send' | 'message_delete';

export type SocketEventListener<T = unknown> = (data: T) => void;

class SocketService {
  private socket: Socket | null = null;
  private token: string | null = null;
  private userId: string | null = null;
  private listeners: Partial<Record<SocketEventType, Set<SocketEventListener>>> = {
    join: new Set(),
    join_success: new Set(),
    typing: new Set(),
    message_send: new Set(),
    message_delete: new Set(),
  };

  private static readonly SOCKET_URL = 'http://13.42.70.111:12345';

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

    console.log('[Socket] connect (socket.io)', { url: SocketService.SOCKET_URL });

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
      console.log('[Socket] connected', { id: this.socket?.id });
      if (this.userId) {
        console.log('[Socket] sending join for presence on connect', { userId: this.userId });
        this.send('join');
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] disconnected', { reason });
    });

    this.socket.on('connect_error', (err) => {
      console.log('[Socket] connect_error', { message: err?.message });
    });

    this.socket.onAny((event, ...args) => {
      console.log('[Socket] onAny', { event, argsPreview: args?.[0] });
    });

    // Incoming events from backend
    this.socket.on('join', (data: unknown) => {
      console.log('[Socket] handled: join', data);
      this.emit('join', data);
    });

    this.socket.on('join_success', (data: unknown) => {
      console.log('[Socket] handled: join_success', data);
      this.emit('join_success', data);
    });

    this.socket.on('typing', (data: unknown) => {
      const { sender = '', receiver = '', isTyping = true } = (data ?? {}) as {
        sender?: string;
        receiver?: string;
        isTyping?: boolean;
      };
      console.log('[Socket] handled: typing', { sender, receiver, isTyping });
      this.emit('typing', { sender, receiver, isTyping });
    });

    // Some backends emit `message_receive`, others emit `message_send` for incoming messages.
    const handleIncomingMessage = (data: unknown) => {
      const raw = (data ?? {}) as Record<string, unknown>;
      const sender = String(raw.sender ?? '');
      const receiver = String(raw.receiver ?? '');
      const message = String(raw.message ?? '');
      const messageId = raw.messageId != null ? String(raw.messageId) : undefined;
      const timestamp = raw.timestamp ?? raw.createdAt;
      console.log('[Socket] handled: message', { sender, receiver, messagePreview: message.slice(0, 50), messageId });
      // Keep app API stable: notify listeners using `message_send`; pass through messageId/timestamp for UI
      this.emit('message_send', { sender, receiver, message, messageId, timestamp, createdAt: raw.createdAt });
    };

    this.socket.on('message_receive', handleIncomingMessage);
    this.socket.on('message_send', handleIncomingMessage);

    this.socket.on('message_delete', (data: unknown) => {
      const { sender = '', receiver = '', messageId = '' } = (data ?? {}) as {
        sender?: string;
        receiver?: string;
        messageId?: string;
      };
      console.log('[Socket] handled: message_delete', { sender, receiver, messageId });
      this.emit('message_delete', { sender, receiver, messageId });
    });
  }

  private emit<T>(type: SocketEventType, data: T) {
    this.listeners[type]?.forEach((fn) => fn(data as T));
  }

  /** Send socket.io event. Always attaches bearer token to payload. */
  send(event: string, payload: Record<string, unknown> = {}) {
    if (!this.socket?.connected) {
      console.log('[Socket] send skipped (not connected)', { event, connected: this.socket?.connected });
      return;
    }

    const body = this.withAuthorization(payload);
    console.log('[Socket] emit', { event, payload: body });
    this.socket.emit(event, body);
  }

  /** Join a chat room. Call when user opens a chat. */
  join(chatId: string) {
    console.log('[Socket] join(chatId)', chatId);
    this.send('join', { chatId });
  }

  /** Send typing indicator: sender (current user id), receiver (other user id), isTyping (true/false). */
  typing(sender: string, receiver: string, isTyping: boolean) {
    console.log('[Socket] typing', { sender, receiver, isTyping });
    this.send('typing', { sender, receiver, isTyping });
  }

  /** Send message: sender, receiver, message. Server may echo as message_receive. */
  messageSend(sender: string, receiver: string, message: string) {
    console.log('[Socket] messageSend', { sender, receiver, messagePreview: String(message).slice(0, 50) });
    this.send('message_send', { sender, receiver, message });
  }

  /** Send message delete: sender, receiver, messageId. */
  messageDelete(sender: string, receiver: string, messageId: string) {
    console.log('[Socket] messageDelete', { sender, receiver, messageId });
    this.send('message_delete', { sender, receiver, messageId });
  }

  /** Set current user for presence; will emit join when possible, server replies with join_success. */
  setCurrentUser(userId: string) {
    this.userId = userId;
    console.log('[Socket] setCurrentUser', { userId });
    if (this.socket?.connected) {
      console.log('[Socket] sending join (socket already open)', { userId });
      this.send('join', { userId });
    }
  }

  /** Subscribe to incoming socket events. Returns unsubscribe. */
  on<T = unknown>(event: SocketEventType, callback: SocketEventListener<T>): () => void {
    if (!this.listeners[event]) this.listeners[event] = new Set();
    this.listeners[event]!.add(callback as SocketEventListener);
    return () => this.listeners[event]?.delete(callback as SocketEventListener);
  }

  disconnect() {
    console.log('[Socket] disconnect');
    this.socket?.removeAllListeners();
    this.socket?.disconnect();
    this.socket = null;
    this.token = null;
    this.userId = null;
  }
}

export default new SocketService();
