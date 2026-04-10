import { apiClient } from '../../services/api/client';
import { endpoints } from '../../services/api/endpoints';

export type NotificationsListMeta = {
  total: number;
  limit: number;
  pageNo: number;
  totalPages: number;
  currentPage: number;
};

export type PostNotificationsListBody = {
  page: number;
  limit: number;
  /** Omit for “all”; `false` limits to unread (matches Postman contract). */
  isSeen?: boolean;
  types: string[];
};

export type PostNotificationsListResponse = {
  statusCode?: number;
  message?: string;
  data?: {
    list?: unknown[];
    meta?: NotificationsListMeta;
  };
};

export async function postNotificationsList(body: PostNotificationsListBody) {
  const { data } = await apiClient.post<PostNotificationsListResponse>(
    endpoints.notifications.list,
    body
  );
  return data;
}

export type PatchNotificationSeenResponse = {
  statusCode?: number;
  message?: string;
  data?: { seen?: boolean };
};

export async function patchNotificationSeen(notificationId: string) {
  const { data } = await apiClient.patch<PatchNotificationSeenResponse>(
    endpoints.notifications.markSeen(notificationId)
  );
  return data;
}
