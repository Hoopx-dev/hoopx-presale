/**
 * Notification utilities
 */

import type { Notification, NotificationData, LocalizedNotification } from './types';
import type { Locale } from '@/i18n/config';

/**
 * Get localized notification content based on current locale
 */
export function getLocalizedNotificationContent(
  data: NotificationData,
  locale: Locale
): { title: string; message: string } {
  // Map locale to data fields
  switch (locale) {
    case 'en':
      return {
        title: data.title_en || data.title,
        message: data.message_en || data.message,
      };
    case 'cn':
      return {
        title: data.title_cn || data.title,
        message: data.message_cn || data.message,
      };
    default:
      // Fallback to generic title/message
      return {
        title: data.title,
        message: data.message,
      };
  }
}

/**
 * Transform backend notification to localized format
 */
export function localizeNotification(
  notification: Notification,
  locale: Locale
): LocalizedNotification {
  const { title, message } = getLocalizedNotificationContent(
    notification.data.data,
    locale
  );

  return {
    id: notification.id,
    title,
    message,
    read_at: notification.read_at,
    created_at: notification.created_at,
    notification_type: notification.data.notification_type,
  };
}

/**
 * Transform array of notifications to localized format
 */
export function localizeNotifications(
  notifications: Notification[],
  locale: Locale
): LocalizedNotification[] {
  return notifications.map((notification) =>
    localizeNotification(notification, locale)
  );
}
