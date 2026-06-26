import { apiClient } from '../../services/api/client';
import { endpoints } from '../../services/api/endpoints';
import { STRINGS } from '../../constants/strings';
import { resolveChatListCallPreview, type ChatListCallPreview } from './callListPreview';
import { shouldUseCallSummaryLine } from './callLogLayout';

/** Participant details from API */
export type ChatParticipantDetails = {
  _id: string;
  name?: string;
  email?: string;
  nickName?: string;
  /**
   * Profile photo from API.
   * Older responses send a plain string URL.
   * Newer responses send an object with nested url.{original,medium,thumb}.
   */
  profilePhoto?:
    | string
    | null
    | {
        url?: {
          original?: string;
          medium?: string;
          thumb?: string;
          [key: string]: unknown;
        };
        [key: string]: unknown;
      };
  isBlocked?: boolean;
};

/** Last message content (e.g. { text: "Hi", type: "text" }) */
export type LastMessageContent = {
  text?: string;
  type?: string;
  [key: string]: unknown;
};

/** Last message from API */
export type LastMessagePayload = {
  content?: LastMessageContent | string;
  messageType?: string;
  type?: string;
  files?: Array<{ url?: string; uri?: string }>;
  url?: string;
  uri?: string;
  senderId?: string;
  timestamp?: string;
  isDeleted?: boolean;
  [key: string]: unknown;
};

/** Raw chat item from API */
export type ChatListItemResponse = {
  _id: string;
  status?: string;
  totalMessages?: number;
  lastActivityAt?: string;
  createdAt?: string;
  updatedAt?: string;
  participantDetails: ChatParticipantDetails;
  myUnreadCount?: number;
  isInitiatedByMe?: boolean;
  isPinnedForMe?: boolean;
  pinnedAtForMe?: string | null;
  pinnedOrderForMe?: number;
  lastMessage?: LastMessagePayload;
};

export type ChatListMeta = {
  total: number;
  limit: number;
  pageNo: number;
  totalPages: number;
  currentPage: number;
};

export type GetChatListResponse = {
  statusCode?: number;
  message?: string;
  data: {
    list: ChatListItemResponse[];
    meta: ChatListMeta;
  };
};

function toPreviewString(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null && 'text' in value) {
    return toPreviewString((value as { text?: unknown }).text);
  }
  return String(value);
}

function normalizeMessageType(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

/** Map backend call status + label into a UI-friendly status (missed/cancelled vs completed). */
function normalizeCallLogStatus(rawStatus: string, durationSec: number, label: string): string {
  const status = rawStatus.toUpperCase();
  const lower = label.trim().toLowerCase();

  if (
    status === 'MISSED' ||
    status === 'NO_ANSWER' ||
    status === 'CANCELLED' ||
    status === 'CANCELED' ||
    status === 'REJECTED' ||
    status === 'DECLINED' ||
    status === 'TIMEOUT' ||
    status === 'TIMED_OUT'
  ) {
    return status;
  }

  if (lower.includes('missed')) return 'MISSED';
  if (lower.includes('cancelled') || lower.includes('canceled')) return 'CANCELLED';
  if (lower.includes('no answer') || lower.includes('unanswered') || lower.includes('not answered')) {
    return 'NO_ANSWER';
  }
  if (lower.includes('declined') || lower.includes('rejected')) return 'REJECTED';
  if (lower.includes('timeout') || lower.includes('timed out')) return 'TIMEOUT';

  // Ring-only calls are sometimes logged as ENDED with zero duration.
  if (status === 'ENDED' && durationSec <= 0) {
    return 'CANCELLED';
  }

  return status;
}

/**
 * Derive list preview + optional thumbnail for last message (text vs image, etc.).
 */
function getLastMessageListPreview(lastMsg: LastMessagePayload | undefined): {
  preview: string;
  previewThumbUri?: string | null;
  callPreview?: ChatListCallPreview | null;
} {
  if (!lastMsg || typeof lastMsg !== 'object') {
    return { preview: '' };
  }

  const callPreview = resolveChatListCallPreview(lastMsg);
  if (callPreview) {
    return { preview: callPreview.label, callPreview };
  }

  const raw = lastMsg as Record<string, unknown>;
  const messageType = normalizeMessageType(raw.messageType ?? raw.type);
  const content = raw.content;
  const contentObj =
    content && typeof content === 'object' && content !== null
      ? (content as Record<string, unknown>)
      : null;
  const contentType = normalizeMessageType(contentObj?.type);
  const effectiveType = messageType || contentType;

  const files = Array.isArray(raw.files) ? raw.files : [];
  const firstFile = files[0] as { url?: unknown; uri?: unknown } | undefined;
  const fileUrl =
    typeof firstFile?.url === 'string'
      ? firstFile.url
      : typeof firstFile?.uri === 'string'
        ? firstFile.uri
        : '';

  const contentUrl =
    contentObj &&
    (typeof contentObj.url === 'string'
      ? contentObj.url
      : typeof contentObj.uri === 'string'
        ? contentObj.uri
        : '');

  const topUrl =
    typeof raw.url === 'string' ? raw.url : typeof raw.uri === 'string' ? raw.uri : '';

  const imageUri =
    [fileUrl, contentUrl, topUrl].find((u) => typeof u === 'string' && u.trim().length > 0) ?? '';

  if (effectiveType === 'image') {
    let caption = '';
    if (contentObj && typeof contentObj.text === 'string') {
      caption = contentObj.text.trim();
    } else if (typeof content === 'string') {
      caption = content.trim();
    }
    return {
      preview: caption.length > 0 ? caption : STRINGS.CHAT.LAST_MESSAGE_PHOTO,
      previewThumbUri: imageUri || null,
    };
  }

  const previewSource =
    lastMsg && typeof lastMsg === 'object'
      ? (raw.content ?? (lastMsg as { text?: unknown }).text)
      : undefined;
  const preview = toPreviewString(previewSource);
  return { preview };
}

function formatChatTime(isoOrDate?: string): string {
  if (!isoOrDate) return '';
  const date = new Date(isoOrDate);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();
  if (isToday) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase();
  }
  if (isYesterday) return 'Yesterday';
  return date.toLocaleDateString([], { month: '2-digit', day: '2-digit', year: '2-digit' }).replace(/\//g, '/');
}

/**
 * Map API chat item to UI ChatItem.
 * Avatar: profilePhoto URL when present; null when no photo (UI shows capitalized initials).
 */
export function mapChatResponseToItem(
  item: ChatListItemResponse,
  _defaultAvatar: number
): {
  id: string;
  name: string;
  avatar: { uri: string } | null;
  preview: string;
  /** When last message is an image, URL for a small list thumbnail (optional). */
  previewThumbUri?: string | null;
  callPreview?: ChatListCallPreview | null;
  time: string;
  unreadCount?: number;
  pinned?: boolean;
  previewDraft?: string;
  otherUserId?: string;
} {
  const participant = item.participantDetails ?? {};
  const name = participant.nickName ?? participant.name ?? 'Unknown';
  const lastMsg = item.lastMessage;
  const { preview, previewThumbUri, callPreview } = getLastMessageListPreview(lastMsg);
  const time = formatChatTime(item.lastActivityAt || item.updatedAt);
  const photo = participant.profilePhoto as
    | string
    | null
    | { url?: { original?: string; medium?: string; thumb?: string; [key: string]: unknown }; [key: string]: unknown }
    | undefined;

  let avatarUrl: string | undefined;
  if (typeof photo === 'string') {
    avatarUrl = photo;
  } else if (photo && typeof photo === 'object') {
    const urlObj = (photo.url ?? {}) as {
      original?: string;
      medium?: string;
      thumb?: string;
      [key: string]: unknown;
    };
    avatarUrl = urlObj.medium ?? urlObj.thumb ?? urlObj.original;
  }

  const avatar =
    typeof avatarUrl === 'string' && avatarUrl.trim() !== ''
      ? { uri: avatarUrl }
      : null;
  return {
    id: item._id,
    name,
    avatar,
    preview,
    previewThumbUri,
    callPreview,
    time,
    unreadCount: item.myUnreadCount,
    pinned: item.isPinnedForMe,
    otherUserId: participant._id,
  };
}

export type GetChatListParams = {
  page: number;
  limit: number;
};

export async function getChatListApi(params: GetChatListParams): Promise<GetChatListResponse> {
  const { data } = await apiClient.post<GetChatListResponse>(endpoints.chat.getChats, {
    params: { page: params.page, limit: params.limit },
  });
  return data;
}

/** Pending chat list (message requests) - same response shape as getChatListApi */
export async function getPendingChatsApi(params: GetChatListParams): Promise<GetChatListResponse> {
  const { data } = await apiClient.post<GetChatListResponse>(endpoints.chat.getpPendingChats, {
    page: params.page,
    limit: params.limit,
  });
  return data;
}

export type SetChatRequestActionParams = {
  chatId: string;
  action: 'accept' | 'reject';
};

export async function setChatRequestActionApi(
  params: SetChatRequestActionParams
): Promise<{ statusCode?: number; message?: string; data?: unknown }> {
  const { data } = await apiClient.post(endpoints.chat.setRequestAction, {
    chatId: params.chatId,
    action: params.action,
  });
  return data;
}

export type BlockUserParams = {
  blockUserId: string;
  type: 'block' | 'unblock';
};

export async function blockUserApi(params: BlockUserParams): Promise<{ statusCode?: number; message?: string; data?: unknown }> {
  const { data } = await apiClient.post(endpoints.chat.blockUser, {
    blockUserId: params.blockUserId,
    type: params.type,
  });
  return data;
}

export type GetBlockedUsersParams = {
  page: number;
  limit?: number;
};

export type GetBlockedUsersResult = {
  items: unknown[];
  currentPage: number;
  hasMore: boolean;
};

/**
 * Users the current account has blocked. POST `{ page, limit }`.
 */
export async function getBlockedUsersApi(params: GetBlockedUsersParams): Promise<GetBlockedUsersResult> {
  const limit = params.limit ?? 20;
  const { data } = await apiClient.post<unknown>(endpoints.chat.getBlockedUsers, {
    page: params.page,
    limit,
  });
  const body = data as Record<string, unknown> | null | undefined;
  if (!body) {
    return { items: [], currentPage: params.page, hasMore: false };
  }
  const inner = (body.data as Record<string, unknown> | undefined) ?? body;
  const list =
    inner.list ??
    inner.users ??
    inner.blockedUsers ??
    inner.blocked ??
    inner.data ??
    (Array.isArray(body) ? body : null);
  const items = Array.isArray(list) ? list : [];

  const meta = (inner.meta as Record<string, unknown> | undefined) ?? (body.meta as Record<string, unknown> | undefined) ?? {};
  const currentPage = Number(meta.currentPage ?? meta.pageNo ?? meta.page ?? params.page) || params.page;
  const totalPages = Number(meta.totalPages ?? meta.totalPage ?? 0);
  const totalCount = Number(meta.total ?? meta.totalCount ?? 0);
  let hasMore = false;
  if (totalPages > 0) {
    hasMore = currentPage < totalPages;
  } else if (typeof meta.hasMore === 'boolean') {
    hasMore = meta.hasMore;
  } else if (totalCount > 0 && items.length > 0) {
    hasMore = currentPage * limit < totalCount;
  } else {
    hasMore = items.length >= limit;
  }

  return { items, currentPage, hasMore };
}

export type ReportUserParams = {
  reportedAgainst: string;
  reportMessage: string;
};

export async function reportUserApi(params: ReportUserParams): Promise<{ statusCode?: number; message?: string; data?: unknown }> {
  const { data } = await apiClient.post(endpoints.chat.reportUser, {
    reportedAgainst: params.reportedAgainst,
    reportMessage: params.reportMessage,
  });
  return data;
}

/** Payload: { "chatId": "<id>" } */
export async function pinChatApi(chatId: string): Promise<{ statusCode?: number; message?: string; data?: unknown }> {
  const { data } = await apiClient.post(endpoints.chat.pinChat, { chatId });
  return data;
}

/** Payload: { "chatId": "<id>" } */
export async function unpinChatApi(chatId: string): Promise<{ statusCode?: number; message?: string; data?: unknown }> {
  const { data } = await apiClient.post(endpoints.chat.unpinChat, { chatId });
  return data;
}

/** Payload: { "chatId": "<id>" } */
export async function deleteChatApi(chatId: string): Promise<{ statusCode?: number; message?: string; data?: unknown }> {
  const { data } = await apiClient.post(endpoints.chat.deleteChat, { chatId });
  return data;
}

/** Delete a single message. Requires chatId and messageId. */
export async function deleteMessageApi(params: { chatId: string; messageId: string }): Promise<{ statusCode?: number; message?: string; data?: unknown }> {
  const { data } = await apiClient.post(endpoints.chat.deleteMessage, {
    // chatId: params.chatId,
    messageId: params.messageId,
  });
  return data;
}

/** Mark chat as seen (e.g. when user opens the conversation). Payload: { "chatId": "<id>" } */
export async function markChatSeenApi(chatId: string): Promise<{ statusCode?: number; message?: string; data?: unknown }> {
  const { data } = await apiClient.post(endpoints.chat.markSeen, { chatId });
  return data;
}

export type PostAIMessagesParams = {
  /** Receiver user id (sent as receiverId to API). */
  receiverId?: string;
  /** Chat / match user id; used as receiverId when receiverId is not provided. */
  chatId?: string;
};

/** Chat suggestions response (e.g. from getAiSuggestions) */
export type ChatSuggestionsResponse = {
  statusCode?: number;
  message?: string;
  data?: {
    success?: boolean;
    suggestions?: string[];
    limitUsed?: number;
    limitLeft?: number;
    totalMessageLimit?: number;
    timeLeft?: string;
  };
  suggestions?: string[];
};

/** Get AI chat suggestions for a chat. Endpoint: /chat/chat-suggestions */
export async function getAiSuggestionsApi(chatId: string): Promise<ChatSuggestionsResponse> {
  const { data } = await apiClient.post<ChatSuggestionsResponse>(
    endpoints.chat.getAiSuggestions,
    { chatId }
    // { params: { chatId } }
  );
  return data ?? {};
}

/** Call Aira to introduce / break the ice. Endpoint: /chat/aira-introduce */
export async function postAIMessagesApi(
  params: PostAIMessagesParams
): Promise<{ statusCode?: number; message?: string; data?: unknown }> {
  const receiverId = params.receiverId ?? params.chatId;
  if (!receiverId) {
    throw new Error('postAIMessagesApi: receiverId or chatId is required');
  }
  const { data } = await apiClient.post(endpoints.chat.postAIMessages, {
    receiverId,
  });
  return data;
}

/** File item for send-message payload */
export type SendMessageFileItem = { url: string; key: string };

export type SendMessagePayload = {
  chatId: string;
  content: string;
  messageType: 'text' | 'image' | 'audio' | 'video' | 'document';
  files: SendMessageFileItem[];
  /** Message id as string when replying, otherwise null */
  replyTo: string | null;
};

export async function sendMessageApi(payload: SendMessagePayload): Promise<{ statusCode?: number; message?: string; data?: unknown }> {
  const { data } = await apiClient.post(endpoints.chat.sendMessage, {
    chatId: payload.chatId,
    content: payload.content,
    messageType: payload.messageType,
    files: payload.files,
    replyTo: payload.replyTo,
  });
  return data;
}

/**
 * Normalizes send-message API envelopes so we always get a `ChatMessageApiItem` when the server returns one.
 * Backend shapes vary: message at `data`, `data.message`, `data.data`, etc.
 */
export function extractChatMessageFromSendResponse(
  envelope: { data?: unknown; statusCode?: number; message?: string } | null | undefined,
): ChatMessageApiItem | undefined {
  if (!envelope || typeof envelope !== 'object') return undefined;
  const payload = envelope.data;
  if (payload == null || typeof payload !== 'object') return undefined;
  const p = payload as Record<string, unknown>;

  const pickNested = (obj: Record<string, unknown>): ChatMessageApiItem | undefined => {
    const keys = ['message', 'chatMessage', 'createdMessage', 'newMessage', 'msg'];
    for (const key of keys) {
      const v = obj[key];
      if (v && typeof v === 'object') {
        return v as ChatMessageApiItem;
      }
    }
    return undefined;
  };

  const nested = pickNested(p);
  if (nested) return nested;

  if (
    '_id' in p ||
    'messageType' in p ||
    'content' in p ||
    'sender' in p ||
    'senderId' in p ||
    'isSentByMe' in p ||
    'files' in p
  ) {
    return payload as ChatMessageApiItem;
  }

  const inner = p.data;
  if (inner && typeof inner === 'object') {
    const innerObj = inner as Record<string, unknown>;
    const fromInner = pickNested(innerObj);
    if (fromInner) return fromInner;
    if (
      '_id' in innerObj ||
      'messageType' in innerObj ||
      'content' in innerObj ||
      'files' in innerObj
    ) {
      return inner as ChatMessageApiItem;
    }
  }

  return undefined;
}

/** Upload a file for chat (image/audio/video). Uses /aws-s3-files/upload. Returns { url, key } for use in sendMessage. */
export type UploadChatFileResponse = { url?: string; key?: string; data?: { url?: string; key?: string } };

export async function uploadChatFileApi(
  fileUri: string,
  options: { mimeType: string; fileName: string }
): Promise<{ url: string; key: string }> {
  const formData = new FormData();
  const rawUri = String(fileUri ?? '').trim();
  const uri =
    rawUri.startsWith('ph://') ||
    rawUri.startsWith('file://') ||
    rawUri.startsWith('content://')
      ? rawUri
      : rawUri.startsWith('/')
        ? `file://${rawUri}`
        : rawUri;
  // IMPORTANT: For React Native, axios expects the "file" field value to be a plain
  // { uri, type, name } object. Avoid forcing Blob typings.
  formData.append('file', {
    uri,
    type: options.mimeType,
    name: options.fileName,
  } as any);

  // `apiClient` defaults to JSON headers; override for multipart upload.
  const { data } = await apiClient.post<UploadChatFileResponse>(
    endpoints.chat.fileUpload,
    formData,
    {
      timeout: 60000,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  const url = data?.url ?? data?.data?.url ?? '';
  const key = data?.key ?? data?.data?.key ?? '';
  if (!url || !key) throw new Error('Upload response missing url or key');
  return { url, key };
}

/** API message item (shape from get-messages) */
export type ChatMessageApiItem = {
  _id?: string;
  chatId?: string;
  messageType?: 'text' | 'voice' | 'audio' | 'image' | 'file' | 'document' | 'system_call';
  content?: string | { text?: string; type?: string };
  files?: Array<{ url?: string; uri?: string; name?: string; filename?: string }>;
  isMedia?: boolean;
  isReply?: boolean;
  isEdited?: boolean;
  messageStatus?: string;
  createdAt?: string;
  updatedAt?: string;
  sender?: string;
  receiver?: string;
  isSentByMe?: boolean;
  messageTimeStamp?: string;
  statusForMe?: string;
  /** Legacy/alternate fields */
  type?: string;
  text?: string;
  url?: string;
  uri?: string;
  name?: string;
  senderId?: string;
  replyTo?: { senderName?: string; preview?: string; snippet?: string };
  [key: string]: unknown;
};

export type GetChatMessagesParams = {
  chatId: string;
  page?: number;
  limit?: number;
};

export type GetChatMessagesResponse = {
  statusCode?: number;
  message?: string;
  data?: {
    list?: ChatMessageApiItem[];
    messages?: ChatMessageApiItem[];
    chat?: unknown;
    meta?: { total?: number; limit?: number; pageNo?: number; totalPages?: number; currentPage?: number };
  };
};

export async function getChatMessagesApi(
  params: GetChatMessagesParams
): Promise<GetChatMessagesResponse> {
  const { data } = await apiClient.post<GetChatMessagesResponse>(endpoints.chat.getChatMessages, {
    chatId: params.chatId,
    page: params.page ?? 1,
    limit: params.limit ?? 50,
  });
  return data;
}

/** UI chat message (matches ChatDetailScreen ChatMessage union). messageId from API _id for replyTo. */
export type ChatMessageUi =
  | {
      type: 'text';
      text: string;
      timestamp: string;
      sent: boolean;
      replyTo?: { senderName: string; preview: string };
      messageId?: string;
    }
  | {
      type: 'rich';
      blocks: Array<
        | { type: 'paragraph'; text: string }
        | {
            type: 'bullet_list';
            items: Array<{ title?: string; description?: string }>;
          }
      >;
      timestamp: string;
      sent: boolean;
      messageId?: string;
    }
  | { type: 'voice'; uri: string; timestamp: string; sent: boolean; messageId?: string }
  | { type: 'image'; uri: string; timestamp: string; sent: boolean; messageId?: string }
  | { type: 'file'; uri: string; name: string; timestamp: string; sent: boolean; messageId?: string }
  | {
      type: 'call_log';
      callId: string;
      callType: 'audio' | 'video';
      callStatus: string;
      durationSec: number;
      label: string;
      displayAsSummaryLine?: boolean;
      timestamp: string;
      sent: boolean;
      messageId?: string;
    };

function formatMessageTime(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const h = d.getHours();
  const m = d.getMinutes();
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  const ampm = h >= 12 ? 'pm' : 'am';
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function extractFileNameFromUri(uri: string): string {
  if (!uri) return 'File';
  try {
    const withoutQuery = uri.split('?')[0] ?? uri;
    const tail = withoutQuery.split('/').pop() ?? '';
    const decoded = decodeURIComponent(tail).trim();
    return decoded.length > 0 ? decoded : 'File';
  } catch {
    return 'File';
  }
}

function firstNonEmptyString(...values: Array<unknown>): string | undefined {
  for (const value of values) {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.length > 0) return trimmed;
    }
  }
  return undefined;
}

const AIRA_REQUEST_SENT_TEXT =
  'Aira has sent a request message. Once they accept, you will be able to chat with them.';

function getSenderIdFromMessage(item: ChatMessageApiItem): string | null {
  const sender = item.sender;
  if (typeof sender === 'string') return sender;
  if (sender && typeof sender === 'object') {
    const senderObj = sender as { _id?: unknown; id?: unknown };
    if (typeof senderObj._id === 'string') return senderObj._id;
    if (typeof senderObj.id === 'string') return senderObj.id;
  }
  if (typeof item.senderId === 'string') return item.senderId;
  return null;
}

function getReceiverIdFromMessage(item: ChatMessageApiItem): string | null {
  const receiver = item.receiver;
  if (typeof receiver === 'string') return receiver;
  if (receiver && typeof receiver === 'object') {
    const receiverObj = receiver as { _id?: unknown; id?: unknown };
    if (typeof receiverObj._id === 'string') return receiverObj._id;
    if (typeof receiverObj.id === 'string') return receiverObj.id;
  }
  if (typeof (item as { receiverId?: unknown }).receiverId === 'string') {
    return (item as { receiverId: string }).receiverId;
  }
  return null;
}

function getTextFromApiMessage(
  item: ChatMessageApiItem,
  currentUserId?: string,
  chatStatus?: string
): string {
  const isAiraMessage = (item as { messageByAira?: unknown }).messageByAira === true;
  const isIntroduction = (item as { isIntroduction?: unknown }).isIntroduction === true;
  const senderId = getSenderIdFromMessage(item);
  const isFromCurrentUser =
    (typeof currentUserId === 'string' && senderId === currentUserId) ||
    (currentUserId == null && item.isSentByMe === true);
  if (isAiraMessage && isIntroduction && isFromCurrentUser) {
    return AIRA_REQUEST_SENT_TEXT;
  }

  const c = item.content;
  if (typeof c === 'string') return c;
  if (item.text && typeof item.text === 'string') return item.text;
  if (c && typeof c === 'object' && c !== null && 'text' in c) return String((c as { text?: unknown }).text ?? '');
  return '';
}

/**
 * Map one API message to UI ChatMessage. Uses isSentByMe from API when present.
 */
export function mapApiMessageToChatMessage(
  item: ChatMessageApiItem,
  currentUserId?: string,
  options?: { chatStatus?: string }
): ChatMessageUi | null {
  const type = (item.messageType ?? item.type ?? 'text') as string;
  const sent = item.isSentByMe === true;
  const timestamp = formatMessageTime(item.messageTimeStamp ?? item.createdAt);

  const messageId = item._id ?? undefined;

  if (type === 'system_call') {
    const rawBlocks = (item as { contentBlocks?: unknown }).contentBlocks;
    const firstLog = Array.isArray(rawBlocks)
      ? rawBlocks.find((b) => {
          if (!b || typeof b !== 'object') return false;
          return (b as { type?: unknown }).type === 'call_log';
        })
      : undefined;
    if (firstLog && typeof firstLog === 'object') {
      const b = firstLog as {
        callId?: unknown;
        callType?: unknown;
        callStatus?: unknown;
        duration?: unknown;
        callerId?: unknown;
        caller_id?: unknown;
        receiverId?: unknown;
        receiver_id?: unknown;
        textForCaller?: unknown;
        text_for_caller?: unknown;
        textForReceiver?: unknown;
        text_for_receiver?: unknown;
      };
      const callId = String(b.callId ?? '').trim();
      if (callId.length > 0) {
        const ct = String(b.callType ?? 'audio').toLowerCase();
        const callType: 'audio' | 'video' = ct.includes('video') ? 'video' : 'audio';
        const durRaw = b.duration;
        const durationSec =
          typeof durRaw === 'number' && !Number.isNaN(durRaw)
            ? durRaw
            : typeof durRaw === 'string'
            ? Number.parseInt(durRaw, 10) || 0
            : 0;
        const callStatusUpper = normalizeCallLogStatus(
          String(b.callStatus ?? ''),
          durationSec,
          firstNonEmptyString(b.textForCaller, b.text_for_caller, b.textForReceiver, b.text_for_receiver) ?? '',
        );

        const textCaller = firstNonEmptyString(b.textForCaller, b.text_for_caller);
        const textReceiver = firstNonEmptyString(b.textForReceiver, b.text_for_receiver);
        const callerIdResolved = firstNonEmptyString(b.callerId, b.caller_id, getSenderIdFromMessage(item));
        const receiverIdResolved = firstNonEmptyString(b.receiverId, b.receiver_id, getReceiverIdFromMessage(item));

        let label: string;
        let displayAsSummaryLine = false;
        const contentFallback = firstNonEmptyString(
          typeof item.content === 'string' ? item.content : undefined,
          getTextFromApiMessage(item, currentUserId, options?.chatStatus)
        );

        if (textCaller != null && textReceiver != null) {
          if (typeof currentUserId === 'string' && currentUserId.length > 0) {
            if (callerIdResolved != null && callerIdResolved === currentUserId) {
              label = textCaller;
              displayAsSummaryLine = shouldUseCallSummaryLine(callStatusUpper, textCaller);
            } else if (receiverIdResolved != null && receiverIdResolved === currentUserId) {
              label = textReceiver;
              displayAsSummaryLine = shouldUseCallSummaryLine(callStatusUpper, textReceiver);
            } else {
              label = firstNonEmptyString(contentFallback, textCaller, textReceiver) ?? 'Call';
            }
          } else {
            label = firstNonEmptyString(contentFallback, textCaller, textReceiver) ?? 'Call';
          }
        } else {
          label = firstNonEmptyString(contentFallback, textCaller, textReceiver) ?? 'Call';
          displayAsSummaryLine = shouldUseCallSummaryLine(callStatusUpper, label);
        }

        return {
          type: 'call_log',
          callId,
          callType,
          callStatus: callStatusUpper,
          durationSec,
          label,
          displayAsSummaryLine,
          timestamp,
          sent,
          messageId,
        };
      }
    }
    return {
      type: 'text',
      text: getTextFromApiMessage(item, currentUserId, options?.chatStatus),
      timestamp,
      sent,
      messageId,
    };
  }

  if (type === 'text') {
    return {
      type: 'text',
      text: getTextFromApiMessage(item, currentUserId, options?.chatStatus),
      timestamp,
      sent,
      replyTo: item.replyTo?.senderName != null
        ? {
            senderName: item.replyTo.senderName,
            preview: item.replyTo.preview ?? item.replyTo.snippet ?? '',
          }
        : undefined,
      messageId,
    };
  }
  if (type === 'array') {
    const rawBlocks = (item as { contentBlocks?: unknown }).contentBlocks;
    const blocks: Array<
      | { type: 'paragraph'; text: string }
      | { type: 'bullet_list'; items: Array<{ title?: string; description?: string }> }
    > = [];
    if (Array.isArray(rawBlocks)) {
      rawBlocks.forEach((block) => {
        if (!block || typeof block !== 'object') return;
        const b = block as { type?: unknown; text?: unknown; items?: unknown };
        if (b.type === 'paragraph' && typeof b.text === 'string') {
          blocks.push({ type: 'paragraph', text: b.text });
          return;
        }
        if (b.type === 'bullet_list' && Array.isArray(b.items)) {
          const items: Array<{ title?: string; description?: string }> = [];
          b.items.forEach((item) => {
            if (!item || typeof item !== 'object') return;
            const it = item as { title?: unknown; description?: unknown };
            items.push({
              title: typeof it.title === 'string' ? it.title : undefined,
              description: typeof it.description === 'string' ? it.description : undefined,
            });
          });
          blocks.push({ type: 'bullet_list', items });
        }
      });
    }
    if (blocks.length > 0) {
      return { type: 'rich', blocks, timestamp, sent, messageId };
    }
    return {
      type: 'text',
      text: getTextFromApiMessage(item, currentUserId, options?.chatStatus),
      timestamp,
      sent,
      messageId,
    };
  }
  if (type === 'voice' || type === 'audio') {
    const file = item.files?.[0];
    const uri = item.uri ?? item.url ?? file?.url ?? file?.uri ?? '';
    return uri ? { type: 'voice', uri, timestamp, sent, messageId } : null;
  }
  if (type === 'image') {
    const file = item.files?.[0];
    const uri = item.uri ?? item.url ?? file?.url ?? file?.uri ?? '';
    return uri ? { type: 'image', uri, timestamp, sent, messageId } : null;
  }
  if (type === 'file' || type === 'document') {
    const file = item.files?.[0];
    const uri = firstNonEmptyString(item.uri, item.url, file?.url, file?.uri) ?? '';
    const name =
      firstNonEmptyString(item.name, file?.name, file?.filename) ??
      extractFileNameFromUri(uri);
    return uri ? { type: 'file', uri, name, timestamp, sent, messageId } : null;
  }
  return {
    type: 'text',
    text: getTextFromApiMessage(item, currentUserId, options?.chatStatus),
    timestamp,
    sent,
    messageId,
  };
}
