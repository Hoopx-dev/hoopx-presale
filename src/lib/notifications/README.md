# Notification Localization System

This module handles multi-language notification display based on the current user locale.

## Data Structure

Backend notifications come in this format:

```json
{
  "id": "776658a7-97e4-45d6-9e3a-c01d65227b1f",
  "data": {
    "notification_type": "general",
    "data": {
      "title": "welcome",
      "message": "claim your offer",
      "title_en": "welcome",
      "message_en": "claim your offer",
      "title_cn": "欢迎",
      "message_cn": "领取奖金",
      "title_my": "selamat datang",
      "message_my": "dapatkan bonus anda"
    }
  },
  "read_at": null,
  "created_at": "2025-10-27T13:25:39.000000Z"
}
```

## Files

- **`types.ts`**: TypeScript interfaces for notification data
- **`utils.ts`**: Localization utility functions
- **`example.tsx`**: Example component showing usage

## Usage

### 1. Import utilities

```typescript
import { useLocale } from 'next-intl';
import { localizeNotifications } from '@/lib/notifications/utils';
import type { Notification } from '@/lib/notifications/types';
```

### 2. Get current locale

```typescript
const locale = useLocale() as 'en' | 'cn';
```

### 3. Localize notifications

```typescript
const notifications: Notification[] = [/* fetched from API */];
const localizedNotifications = localizeNotifications(notifications, locale);
```

### 4. Display localized content

```typescript
{localizedNotifications.map(notification => (
  <div key={notification.id}>
    <h3>{notification.title}</h3>  {/* Automatically shows correct language */}
    <p>{notification.message}</p>
  </div>
))}
```

## Locale Mapping

| Locale | Backend Fields |
|--------|----------------|
| `en`   | `title_en`, `message_en` |
| `cn`   | `title_cn`, `message_cn` |
| fallback | `title`, `message` |

## Functions

### `getLocalizedNotificationContent(data, locale)`
Returns localized `{ title, message }` based on locale.

### `localizeNotification(notification, locale)`
Transforms a single notification to localized format.

### `localizeNotifications(notifications, locale)`
Transforms an array of notifications to localized format.

## Example Component

See `example.tsx` for a complete working example.

## Auto-Update on Language Switch

When user changes language via the language switcher, components using `useLocale()` will automatically re-render with the new locale, showing notifications in the selected language.

```typescript
// This automatically updates when locale changes
const locale = useLocale() as 'en' | 'cn';
const localizedNotifications = localizeNotifications(notifications, locale);
```

No additional logic needed!
