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
│   │   ├── layout.tsx           # Root layout with Providers + LocaleProvider
│   │   ├── page.tsx             # Home page (fully localized)
│   │   ├── globals.css          # Global styles
│   │   └── favicon.ico
│   ├── components/
│   │   ├── header.tsx           # Reusable header with language toggle
│   │   ├── locale-provider.tsx  # Client-side i18n provider
│   │   ├── locale-switcher.tsx  # Language switcher dropdown
│   │   ├── providers.tsx        # React Query provider
│   │   └── purchase-details-debug.tsx  # Debug component for testing API
│   ├── lib/
│   │   ├── http.ts              # Axios client with interceptors
│   │   ├── queryKeys.ts         # React Query key factory
│   │   └── purchase/
│   │       ├── types.ts         # TypeScript interfaces for API
│   │       ├── api.ts           # API functions for all endpoints
│   │       └── hooks.ts         # React Query hooks
│   ├── store/
│   │   └── purchase.ts          # Zustand store for local state
│   └── i18n/
│       ├── config.ts            # Locale types and configuration
│       └── locales/
│           ├── en.json          # English translations
│           └── cn.json          # Chinese translations
├── public/                      # Static assets
├── .env.local                   # Environment variables (API_BASE_URL)
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript config (paths: @/* → ./src/*)
├── next.config.ts               # Next.js configuration
└── claude.md                    # This documentation file
```

---

## API Integration Architecture

### Overview
The project follows the mgp88-frontend structure with a clear separation of concerns for data fetching, state management, and API communication.

### Technology Stack
- **HTTP Client**: Axios with request/response interceptors
- **Data Fetching**: @tanstack/react-query (React Query v5)
- **State Management**: Zustand for local UI state
- **TypeScript**: Strict typing for all API interfaces

### File Organization

#### 1. HTTP Client (`src/lib/http.ts`)
```typescript
import axios from 'axios';

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://boot-api.hoopx.gg';
export const http = axios.create({ baseURL: API_BASE });
```

**Features:**
- Centralized Axios instance with base URL from environment variables
- Request interceptor: Logs all outgoing requests in development mode (method, URL, data)
- Response interceptor: Logs successful responses and detailed error information
- Automatic error handling with formatted console output

#### 2. Query Keys (`src/lib/queryKeys.ts`)
```typescript
export const QK = {
  purchase: {
    all: () => ['purchase'] as const,
    details: () => [...QK.purchase.all(), 'details'] as const,
    session: (publicKey?: string) =>
      [...QK.purchase.all(), 'session', publicKey] as const,
  },
};
```

**Purpose:** Centralized query key management following React Query best practices

#### 3. TypeScript Types (`src/lib/purchase/types.ts`)
Defines interfaces matching the backend API documentation:
- `PurchaseDetailsVO` - Activity configuration and purchase tiers
- `FetchSessionVO` - User's purchase session data
- `RegisterPurchaseDTO` - Request payload for registering purchases

#### 4. API Functions (`src/lib/purchase/api.ts`)
Pure functions for API calls:
- `getPurchaseDetails()` - GET /api/purchase/details
- `getPurchaseSession(publicKey)` - GET /api/purchase/session
- `registerPurchase(dto)` - POST /api/purchase/register

All functions use the centralized `http` client and return typed responses.

#### 5. React Query Hooks (`src/lib/purchase/hooks.ts`)

**`usePurchaseDetails(enabled?)`**
- Fetches activity configuration and available tiers
- Auto-refetches every 60 seconds to keep exchange rates fresh
- Can be disabled with `enabled` parameter

**`usePurchaseSession(publicKey?)`**
- Fetches user's purchase history for specific wallet
- Only runs when `publicKey` is provided
- 30-second stale time for user-specific data

**`useRegisterPurchase()`**
- Mutation hook for registering new purchases
- Automatically invalidates related queries on success
- Returns updated session data after registration

#### 6. Zustand Store (`src/store/purchase.ts`)
```typescript
interface PurchaseState {
  selectedTier: number | null;
  walletAddress: string | null;
  setSelectedTier: (tier: number | null) => void;
  setWalletAddress: (address: string | null) => void;
  reset: () => void;
}
```

**Purpose:** Local UI state for purchase flow (tier selection, wallet address)

#### 7. React Query Provider (`src/components/providers.tsx`)
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
```

Wraps the entire app in layout.tsx:
```tsx
<Providers>
  <LocaleProvider>{children}</LocaleProvider>
</Providers>
```

### Usage Examples

#### Fetching Purchase Details
```tsx
import { usePurchaseDetails } from '@/lib/purchase/hooks';

export default function PurchasePage() {
  const { data, isLoading, error } = usePurchaseDetails();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      <p>Exchange Rate: {data.rate} USDT/HOOPX</p>
      <p>Available Tiers: {data.tiers.join(', ')} USDT</p>
    </div>
  );
}
```

#### Fetching User Session
```tsx
import { usePurchaseSession } from '@/lib/purchase/hooks';

export default function UserPortfolio({ walletAddress }: { walletAddress: string }) {
  const { data, isLoading } = usePurchaseSession(walletAddress);

  if (!walletAddress) return <ConnectWalletPrompt />;
  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <p>Purchased: {data.purchasedAmount} USDT</p>
      <p>Status: {data.purchaseStatus === 1 ? 'Success' : 'Failed'}</p>
    </div>
  );
}
```

#### Registering a Purchase
```tsx
import { useRegisterPurchase } from '@/lib/purchase/hooks';

export default function PurchaseButton() {
  const registerMutation = useRegisterPurchase();

  const handlePurchase = async () => {
    try {
      const result = await registerMutation.mutateAsync({
        publicKey: walletAddress,
        amount: 1000,
        trxId: transactionId,
        activityId: activityId,
      });
      console.log('Purchase registered:', result);
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };

  return (
    <button onClick={handlePurchase} disabled={registerMutation.isPending}>
      {registerMutation.isPending ? 'Processing...' : 'Confirm Purchase'}
    </button>
  );
}
```

#### Using Zustand Store
```tsx
import { usePurchaseStore } from '@/store/purchase';

export default function TierSelector() {
  const { selectedTier, setSelectedTier } = usePurchaseStore();

  return (
    <div>
      {[1000, 2000, 3000, 4000, 5000].map((tier) => (
        <button
          key={tier}
          onClick={() => setSelectedTier(tier)}
          className={selectedTier === tier ? 'selected' : ''}
        >
          {tier} USDT
        </button>
      ))}
    </div>
  );
}
```

### Data Flow
1. **Page Load**: `usePurchaseDetails()` fetches activity config automatically
2. **Wallet Connection**: Pass wallet address to `usePurchaseSession(publicKey)`
3. **User Selection**: Store tier selection in Zustand (`setSelectedTier(1000)`)
4. **Transaction**: User completes Solana transaction → get `trxId`
5. **Registration**: Call `registerMutation.mutateAsync({ publicKey, amount, trxId, activityId })`
6. **Auto-Refresh**: React Query automatically invalidates and refetches session + details

### Environment Configuration
Create `.env.local` in project root:
```env
NEXT_PUBLIC_API_BASE_URL=http://boot-api.hoopx.gg
```

---

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
- [x] **API Integration Layer**
  - [x] Axios HTTP client with interceptors (request/response logging)
  - [x] React Query (@tanstack/react-query) setup with custom configuration
  - [x] TypeScript interfaces for all API endpoints (types.ts)
  - [x] API functions for all 3 endpoints (api.ts)
  - [x] React Query hooks (usePurchaseDetails, usePurchaseSession, useRegisterPurchase)
  - [x] Zustand store for local purchase state (selectedTier, walletAddress)
  - [x] Query key factory (queryKeys.ts) for cache management
  - [x] Environment configuration (.env.local with API_BASE_URL)
  - [x] React Query provider wrapper in layout.tsx
  - [x] Debug component for testing API integration (purchase-details-debug.tsx)

### 🚧 To Be Implemented
- [ ] Solana wallet integration (@solana/wallet-adapter-react)
- [ ] Connect wallet functionality
- [ ] Purchase flow UI with tier selection
- [ ] Terms and conditions modal
- [ ] Transaction confirmation flow
- [ ] Portfolio/dashboard view
- [ ] Jupiter Lock integration for viewing locked tokens
- [ ] Token claiming functionality
- [ ] Mobile responsiveness optimization
- [ ] Enhanced error handling and loading states
- [ ] Transaction status tracking and notifications

### 📝 Next Steps
1. **Solana Wallet Integration**
   - Install @solana/wallet-adapter packages
   - Create WalletProvider component
   - Add wallet connection button to header
   - Implement wallet connection flow

2. **Purchase Flow UI**
   - Create purchase modal component
   - Implement tier selection UI using usePurchaseDetails hook
   - Add wallet connection check
   - Show vesting/cliff period details
   - Implement purchase confirmation

3. **Transaction Processing**
   - Integrate Solana transaction signing
   - Handle transaction confirmation
   - Call registerPurchase hook after successful blockchain transaction
   - Show success/error notifications

4. **Portfolio Dashboard**
   - Create portfolio page
   - Use usePurchaseSession hook to fetch user data
   - Display purchase history and status
   - Show vesting schedule and claimable amounts

5. **Jupiter Lock Integration**
   - Research Jupiter Lock API/SDK
   - Implement lock viewing functionality
   - Add claim button when cliff period ends