# HOOPX Presale Project

## Overview
HOOPX is a token presale platform built on the Solana blockchain. This project provides a mobile-optimized Web3 experience for users to purchase HOOPX tokens through Solana wallet apps.

## Key Features

### 1. Mobile-First Approach
- No browser extension required on mobile
- Users access the platform through Solana Wallet Apps (e.g., Jupiter Wallet)
- Deep linking from wallet browser to presale website

### 2. Wallet Connection
- Integrates with Solana wallets (Jupiter Wallet shown in examples)
- Standard Web3 permissions:
  - View activity and wallet balance
  - Request approval for transactions
  - Cannot access funds without permission
- Terms and conditions with 10-second wait period

### 3. Token Purchase System
- **Payment**: USDT (Tether)
- **Purchase Tiers**: 1000 / 2000 / 3000 / 4000 / 5000 USDT
- **Conversion Rate**: 0.003 USDT/HOOPX
- **Restriction**: One purchase per wallet address
- **Vesting Structure**: Different amounts have different vesting/cliff periods
  - Example shown: 15-month cliff, 3-month vesting, monthly release

### 4. Purchase Tracking
- Transaction ID and purchase details stored in database
- Bound to wallet address for future reference
- Portfolio view shows:
  - HOOPX balance
  - Purchase details
  - Vesting timeline
  - Transaction history

### 5. Token Locking & Distribution
- Post-launch, tokens are sent through **Jupiter Lock**
- Users can view lock progress
- Claimable when cliff period ends
- Lock details include:
  - Claimed vs. unclaimed amounts
  - Start and end dates
  - Monthly release schedule

## Technical Stack
- **Blockchain**: Solana
- **Framework**: Next.js 15.5.5 with React 19
- **Payment Token**: USDT
- **Lock Platform**: Jupiter Lock
- **Primary Wallet Example**: Jupiter Wallet
- **Localization**: next-intl (client-side, no URL routing)
- **Styling**: Tailwind CSS 4
- **Language Support**: English (en) and Chinese (cn)

## User Flow
1. Open Solana wallet app → Navigate to HOOPX URL
2. Connect wallet → Review and accept terms
3. Select purchase amount → Review vesting details
4. Confirm transaction → Wait for blockchain confirmation
5. View portfolio → Track locked tokens
6. Claim tokens → When cliff period ends

## Business Rules
- Only one purchase allowed per wallet address
- Different purchase amounts = different vesting/cliff periods
- All transactions recorded on-chain and in database
- Tokens locked until cliff period completion

---

## API Documentation

### Base Configuration
- **API Host**: `http://boot-api.hoopx.gg`
- **Base Path**: `/`
- **Version**: v0
- **API Documentation Group**: `-v3-api-docs`

### Endpoints

#### 1. Register Purchase
**POST** `/api/purchase/register`

Registers a new token purchase after user completes the blockchain transaction.

**Request Body** (`RegisterPurchaseDTO`):
```json
{
  "publicKey": "string",    // User's wallet public key (unique identifier)
  "amount": 1000,           // Purchase amount in USDT
  "trxId": "string",        // Blockchain transaction ID
  "activityId": "string"    // Activity ID for this purchase campaign
}
```

**Response** (200 - `FetchSessionVO`):
```json
{
  "publicKey": "string",
  "purchasedAmount": 5000,
  "trxId": "string",
  "purchaseStatus": 1,        // 1=success, 2=failed
  "rate": 0.003,              // USDT price per HOOPX token
  "cliff": "90",              // Cliff period in days
  "vesting": "365",           // Vesting period in days
  "vestingFrequency": "daily" // Release frequency: daily, weekly, monthly
}
```

#### 2. Fetch User Session
**GET** `/api/purchase/session?public_key={walletAddress}`

Retrieves the purchase session information for a connected wallet.

**Query Parameters**:
- `public_key` (string, required) - User's wallet public key

**Response** (200 - `FetchSessionVO`):
```json
{
  "publicKey": "string",
  "purchasedAmount": 5000,      // Total amount already purchased (USDT)
  "trxId": "string",            // Most recent transaction ID
  "purchaseStatus": 1,          // 1=success, 2=failed
  "rate": 0.025,                // Exchange rate (USDT per Token)
  "cliff": "90",                // Cliff period in days
  "vesting": "365",             // Vesting period in days
  "vestingFrequency": "daily"   // daily, weekly, or monthly
}
```

#### 3. Fetch Purchase Configuration
**GET** `/api/purchase/details`

Retrieves the current presale activity configuration and available purchase tiers.

**No Parameters Required**

**Response** (200 - `PurchaseDetailsVO`):
```json
{
  "rate": 0.025,                          // Exchange rate (USDT per Token)
  "activityId": "ACT20251013001",         // Unique activity ID
  "cliff": "90",                          // Cliff period in days
  "vesting": "365",                       // Total vesting period in days
  "vestingFrequency": "daily",            // Release frequency
  "hoopxWalletAddress": "string",         // Platform wallet address for payments
  "startTime": "2025-10-20 18:00",        // Activity start (GMT+8)
  "endTime": "",                          // Activity end (GMT+8)
  "timezone": "GMT+8",                    // Timezone
  "tokenTotal": 10000000,                 // Total tokens available
  "purchasedAmount": 500000,              // Total USDT already purchased
  "tiers": [1000, 2000, 3000, 4000, 5000] // Available purchase tiers (USDT)
}
```

### Data Models

#### RegisterPurchaseDTO
| Field | Type | Description |
|-------|------|-------------|
| publicKey | string | User's wallet public key (unique identifier) |
| amount | number | Purchase amount in USDT |
| trxId | string | Blockchain transaction ID |
| activityId | string | Activity ID for this purchase campaign |

#### FetchSessionVO
| Field | Type | Description |
|-------|------|-------------|
| publicKey | string | User's wallet public key |
| purchasedAmount | number | Total amount already purchased by user (USDT) |
| trxId | string | Most recent transaction ID |
| purchaseStatus | integer | Purchase status (1=success, 2=failed) |
| rate | number | Exchange rate (USDT per Token) |
| cliff | string | Cliff period in days |
| vesting | string | Vesting period in days |
| vestingFrequency | string | Release frequency (daily/weekly/monthly) |

#### PurchaseDetailsVO
| Field | Type | Description |
|-------|------|-------------|
| rate | number | Exchange rate (USDT per Token) |
| activityId | string | Unique activity identifier |
| cliff | string | Cliff period in days (initial lock period) |
| vesting | string | Total vesting period in days |
| vestingFrequency | string | Release frequency (daily/weekly/monthly) |
| hoopxWalletAddress | string | Platform wallet address for receiving payments |
| startTime | string(date-time) | Activity start time (GMT+8) |
| endTime | string(date-time) | Activity end time (GMT+8) |
| timezone | string | Activity timezone |
| tokenTotal | number | Total tokens available for this activity |
| purchasedAmount | number | Total USDT already purchased in this activity |
| tiers | array[integer] | Available purchase tiers in USDT |

### API Flow
1. **Page Load**: Call `GET /api/purchase/details` to get activity config and available tiers
2. **Wallet Connect**: Call `GET /api/purchase/session` with user's public key to check existing purchases
3. **Complete Purchase**: After blockchain transaction, call `POST /api/purchase/register` to record the purchase
4. **Update Session**: After registration, response returns updated `FetchSessionVO` with purchase details

---

## Localization Setup

### Implementation Approach
This project uses **next-intl** with a client-side approach (no URL-based routing like `/en` or `/cn`). The locale is stored in localStorage and changed dynamically without affecting the URL.

### File Structure
```
src/
├── i18n/
│   ├── config.ts                 # Locale configuration and types
│   ├── locales/
│   │   ├── en.json              # English translations
│   │   └── cn.json              # Chinese translations
├── components/
│   ├── locale-provider.tsx      # Client-side locale provider with context
│   └── locale-switcher.tsx      # Locale switcher component
└── app/
    └── layout.tsx               # Root layout wraps with LocaleProvider
```

### Key Files

#### `src/i18n/config.ts`
Defines supported locales and their display names:
```typescript
export const locales = ['en', 'cn'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';
export const localeNames: Record<Locale, string> = {
  en: 'English',
  cn: '中文',
};
```

#### `src/components/locale-provider.tsx`
Client-side provider that:
- Loads locale from localStorage on mount
- Provides context API via `useLocaleSettings()` hook
- Wraps app with `NextIntlClientProvider`
- Re-renders with new messages when locale changes

#### `src/components/locale-switcher.tsx`
Dropdown component to switch languages:
```tsx
import { useLocaleSettings } from './locale-provider';
const { locale, setLocale } = useLocaleSettings();
// ... render select dropdown
```

### Usage in Components

**Using translations:**
```tsx
import { useTranslations } from 'next-intl';

export default function MyComponent() {
  const t = useTranslations('presale'); // namespace
  return <h1>{t('title')}</h1>; // presale.title
}
```

**Switching languages:**
```tsx
import { useLocaleSettings } from '@/components/locale-provider';

export default function Header() {
  const { locale, setLocale } = useLocaleSettings();
  return (
    <button onClick={() => setLocale(locale === 'en' ? 'cn' : 'en')}>
      {locale === 'en' ? '中文' : 'English'}
    </button>
  );
}
```

### Translation File Structure
Translation files (en.json, cn.json) are organized by namespaces:
```json
{
  "common": {
    "loading": "Loading...",
    "submit": "Submit"
  },
  "presale": {
    "title": "Token Presale",
    "selectAmount": "Select Purchase Amount"
  },
  "wallet": {
    "connectWallet": "Connect Your Wallet"
  }
}
```

### Adding New Translations
1. Add key-value pairs to both `src/i18n/locales/en.json` and `cn.json`
2. Use in components with `useTranslations('namespace')`
3. No URL routing changes needed - locale switches client-side only

### Best Practices
- **Always use translations** - Never hardcode any text in components
- **Always add cursor-pointer** - Use `cursor-pointer` class on clickable buttons/links/images

---

## Development Setup

### Running the Project
The project is configured to run on port 3007:
```bash
npm run dev    # Development server on http://localhost:3007
npm run build  # Production build
npm start      # Production server on http://localhost:3007
```

### Project Structure (Current Implementation)
```
hoopx-presale/
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout with LocaleProvider
│   │   ├── page.tsx             # Home page (fully localized)
│   │   ├── globals.css          # Global styles
│   │   └── favicon.ico
│   ├── components/
│   │   ├── header.tsx           # Reusable header with language toggle
│   │   ├── locale-provider.tsx  # Client-side i18n provider
│   │   └── locale-switcher.tsx  # Language switcher dropdown
│   └── i18n/
│       ├── config.ts            # Locale types and configuration
│       └── locales/
│           ├── en.json          # English translations
│           └── cn.json          # Chinese translations
├── public/                      # Static assets
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript config (paths: @/* → ./src/*)
├── next.config.ts               # Next.js configuration
└── claude.md                    # This documentation file
```

## Current Implementation Status

### ✅ Completed
- [x] Next.js 15.5.5 project setup with React 19 and Tailwind CSS 4
- [x] Client-side localization (next-intl) without URL routing
- [x] English (en) and Chinese (cn) language support
- [x] LocaleProvider with localStorage persistence
- [x] Reusable Header component with language toggle
- [x] Home page fully localized with all content
- [x] Translation files structured by namespaces (home, common, presale, wallet, etc.)
- [x] Project configured to run on port 3007
- [x] Path aliases configured (@/* → ./src/*)
- [x] Development documentation

### 🚧 To Be Implemented
- [ ] Solana wallet integration
- [ ] Connect wallet functionality
- [ ] Purchase flow UI
- [ ] API integration with backend endpoints
- [ ] Terms and conditions modal
- [ ] Purchase amount selection
- [ ] Transaction confirmation
- [ ] Portfolio/dashboard view
- [ ] Jupiter Lock integration
- [ ] Token claiming functionality
- [ ] Mobile responsiveness optimization
- [ ] Error handling and loading states

### 📝 Next Steps
1. Implement Solana wallet connection (@solana/wallet-adapter-react)
2. Create purchase modal with tier selection
3. Integrate with backend API endpoints
4. Add transaction status tracking
5. Build portfolio/dashboard page
6. Implement Jupiter Lock viewing functionality