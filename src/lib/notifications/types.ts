/**
 * Notification types and interfaces
 */

export interface NotificationData {
  title: string;
  message: string;
  title_en: string;
  message_en: string;
  title_cn: string;
  message_cn: string;
  title_my?: string;
  message_my?: string;
}

export interface Notification {
  id: string;
  notifiable_type: string;
  notifiable_id: string;
  type: string;
  data: {
    notification_type: string;
    data: NotificationData;
  };
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LocalizedNotification {
  id: string;
  title: string;
  message: string;
  read_at: string | null;
  created_at: string;
  notification_type: string;
}
