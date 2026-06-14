import { Notification, NotificationPageResponse, NotificationReadAllResponse } from "@/types/notification";

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, options);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((json as { message?: string }).message ?? `HTTP ${res.status}`);
  return json as T;
}

export const notificationService = {
  getNotifications: (params?: { page?: number; size?: number }) => {
    const query = params ? `?${new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString()}` : "";
    return fetchApi<NotificationPageResponse>(`/api/notifications${query}`);
  },

  markRead: (id: string) =>
    fetchApi<Notification>(`/api/notifications/${id}/read`, {
      method: "PATCH",
    }),

  markAllRead: () =>
    fetchApi<NotificationReadAllResponse>(`/api/notifications/read-all`, {
      method: "PATCH",
    }),
};
