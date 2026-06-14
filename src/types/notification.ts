export type NotificationType = "new_join" | "left" | "full" | "cancelled" | "reminder";

export interface Notification {
  notification_id: string;
  type: NotificationType;
  title: string;
  message: string;
  target_type?: string;
  target_id?: string;
  read: boolean;
  created_at: string;
  read_at?: string;
}

export interface NotificationPageResponse {
  notifications: Notification[];
  page: number;
  size: number;
  total_elements: number;
  total_pages: number;
  last: boolean;
}

export interface NotificationReadAllResponse {
  message: string;
  updated_count: number;
}
