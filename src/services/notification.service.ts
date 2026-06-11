import { Notification } from "@/types/notification";

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, options);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((json as { message?: string }).message ?? `HTTP ${res.status}`);
  return json as T;
}

export const notificationService = {
  getNotifications: (params?: { is_read?: boolean }) => {
    const query =
      params?.is_read !== undefined ? `?is_read=${params.is_read}` : "";
    return fetchApi<Notification[]>(`/api/notifications${query}`);
  },

  markRead: (id: string) =>
    fetchApi<{ message: string }>(`/api/notifications/${id}/read`, {
      method: "PATCH",
    }),

  markAllRead: () =>
    fetchApi<{ message: string }>(`/api/notifications/read-all`, {
      method: "PATCH",
    }),
};
