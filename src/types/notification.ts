export type NotificationType = 'new_join' | 'left' | 'full' | 'cancelled' | 'reminder';

export interface Notification {
  id: string;
  post_id: string | null;
  type: NotificationType;
  message: string;
  sub_message: string | null;
  is_read: boolean;
  created_at: string;
}
