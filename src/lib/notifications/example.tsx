/**
 * Example usage of notification localization
 */

import { useLocale } from 'next-intl';
import type { Notification } from './types';
import { localizeNotifications } from './utils';

// Example notification data from backend
const exampleNotifications: Notification[] = [
  {
    id: '776658a7-97e4-45d6-9e3a-c01d65227b1f',
    notifiable_type: 'App\\Models\\User',
    notifiable_id: 'f5fe6fc1-0ff1-42e3-bf42-f1e28c941fa1',
    type: 'App\\Notifications\\MGPNotification',
    data: {
      notification_type: 'general',
      data: {
        title: 'welcome',
        message: 'claim your offer',
        title_en: 'welcome',
        message_en: 'claim your offer',
        title_cn: '欢迎',
        message_cn: '领取奖金',
        title_my: 'selamat datang',
        message_my: 'dapatkan bonus anda',
      },
    },
    read_at: null,
    created_at: '2025-10-27T13:25:39.000000Z',
    updated_at: '2025-10-27T13:25:39.000000Z',
  },
];

export default function NotificationExample() {
  const locale = useLocale() as 'en' | 'cn';

  // Transform notifications to localized format
  const localizedNotifications = localizeNotifications(
    exampleNotifications,
    locale
  );

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">
        Notifications (Current locale: {locale})
      </h2>

      {localizedNotifications.map((notification) => (
        <div
          key={notification.id}
          className="border border-white/10 rounded-lg p-4 mb-2 bg-white/5"
        >
          <h3 className="text-white font-bold">{notification.title}</h3>
          <p className="text-white/70">{notification.message}</p>
          <p className="text-white/50 text-xs mt-2">
            {new Date(notification.created_at).toLocaleString()}
          </p>
          {!notification.read_at && (
            <span className="inline-block mt-2 text-xs bg-secondary text-black px-2 py-1 rounded">
              Unread
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Usage in components:
 *
 * import { useLocale } from 'next-intl';
 * import { localizeNotifications } from '@/lib/notifications/utils';
 *
 * function MyComponent() {
 *   const locale = useLocale() as 'en' | 'cn';
 *   const [notifications, setNotifications] = useState<Notification[]>([]);
 *
 *   // Fetch notifications from API
 *   useEffect(() => {
 *     fetch('https://a03low.hoopx.gg/api/notifications')
 *       .then(res => res.json())
 *       .then(data => setNotifications(data));
 *   }, []);
 *
 *   // Localize notifications based on current locale
 *   const localizedNotifications = localizeNotifications(notifications, locale);
 *
 *   return (
 *     <div>
 *       {localizedNotifications.map(notification => (
 *         <div key={notification.id}>
 *           <h3>{notification.title}</h3>
 *           <p>{notification.message}</p>
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 */
