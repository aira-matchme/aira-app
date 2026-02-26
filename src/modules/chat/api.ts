import { apiClient } from '../../services/api/client';
import { endpoints } from '../../services/api/endpoints';

/** Participant details from API */
export type ChatParticipantDetails = {
  _id: string;
  name?: string;
  email?: string;
  nickName?: string;
  profilePhoto?: string | null;
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
  content?: LastMessageContent;
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

/** Always return a string safe for React; API may send lastMessage.text as object { text, type }. */
function toPreviewString(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null && 'text' in value) {
    return toPreviewString((value as { text?: unknown }).text);
  }
  return String(value);
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
  time: string;
  unreadCount?: number;
  pinned?: boolean;
  previewDraft?: string;
} {
  const participant = item.participantDetails ?? {};
  const name = participant.nickName ?? participant.name ?? 'Unknown';
  const lastMsg = item.lastMessage;
  // API: lastMessage.content = { text: "Hi", type: "text" }; fallback to legacy lastMessage.text
  const previewSource =
    lastMsg && typeof lastMsg === 'object'
      ? (lastMsg.content ?? (lastMsg as { text?: unknown }).text)
      : undefined;
  const preview = toPreviewString(previewSource);
  const time = formatChatTime(item.lastActivityAt || item.updatedAt);
  const photo = participant.profilePhoto;
  const avatar =
    typeof photo === 'string' && photo.trim() !== ''
      ? { uri: photo }
      : null;
  return {
    id: item._id,
    name,
    avatar,
    preview,
    time,
    unreadCount: item.myUnreadCount,
    pinned: item.isPinnedForMe,
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
