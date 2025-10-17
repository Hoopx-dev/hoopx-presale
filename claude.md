# HOOPX Presale Project

## Project Information
- **Author**: Arius Lee
- **Email**: web@hoopx.gg
- **Repository**: hoopx-presale

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
│   └── locales/
│       ├── en.json              # English translations
│       └── cn.json              # Chinese translations
├── components/
│   ├── locale-provider.tsx      # Client-side locale provider with context
│   ├── header.tsx               # Header with logo, wallet button, and language toggle
│   └── wallet-button.tsx        # Wallet connection button with dropdown
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
│   │   ├── page.tsx             # Home page with coin logo, rate display, buy button
│   │   ├── purchase/
│   │   │   └── page.tsx         # Purchase page with tier selection
│   │   ├── globals.css          # Global styles
│   │   └── favicon.ico
│   ├── components/
│   │   ├── header.tsx           # Header with HOOPX logo, wallet button, language toggle
│   │   ├── wallet-button.tsx    # Custom wallet button with dropdown
│   │   ├── wallet-provider.tsx  # Solana wallet context provider
│   │   ├── locale-provider.tsx  # Client-side i18n provider
│   │   ├── providers.tsx        # React Query + Wallet providers
│   │   └── purchase-details-debug.tsx  # Debug component for testing API
│   ├── lib/
│   │   ├── http.ts              # Axios client with interceptors
│   │   ├── queryKeys.ts         # React Query key factory
│   │   ├── crypto/
│   │   │   └── decrypt.ts       # AES decryption helper for hoopxWalletAddress
│   │   ├── purchase/
│   │   │   ├── types.ts         # TypeScript interfaces for API
│   │   │   ├── api.ts           # API functions with auto-decryption
│   │   │   └── hooks.ts         # React Query hooks
│   │   └── store/
│   │       ├── useUIStore.ts            # UI state (selected tier)
│   │       ├── useWalletStore.ts        # User wallet state (truncated address)
│   │       └── useHoopxWalletStore.ts   # HOOPX wallet state (truncated)
│   └── i18n/
│       ├── config.ts            # Locale types and configuration
│       └── locales/
│           ├── en.json          # English translations
│           └── cn.json          # Chinese translations
├── public/
│   └── images/
│       ├── coin.png             # HOOPX coin logo
│       └── brand-logo.png       # HOOPX brand logo
├── .env.local                   # Environment variables (API_BASE_URL, AES keys)
├── .env.example                 # Example environment file
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
- [x] Reusable Header component with HOOPX logo and language toggle
- [x] Home page fully localized with all content
- [x] Translation files structured by namespaces (home, common, presale, wallet, purchase, etc.)
- [x] Project configured to run on port 3007
- [x] Path aliases configured (@/* → ./src/*)
- [x] Development documentation
- [x] **API Integration Layer**
  - [x] Axios HTTP client with interceptors (request/response logging)
  - [x] React Query (@tanstack/react-query) setup with custom configuration
  - [x] TypeScript interfaces for all API endpoints (types.ts)
  - [x] API functions for all 4 endpoints (api.ts)
  - [x] React Query hooks (usePurchaseDetails, usePurchaseSession, useRegisterPurchase, useTerms)
  - [x] Zustand store for local purchase state (selectedTier, walletAddress)
  - [x] Query key factory (queryKeys.ts) for cache management
  - [x] Environment configuration (.env.local with API_BASE_URL)
  - [x] React Query provider wrapper in layout.tsx
  - [x] Debug component for testing API integration (purchase-details-debug.tsx)
- [x] **Solana Wallet Integration**
  - [x] @solana/wallet-adapter packages installed
  - [x] WalletContextProvider with Phantom & Solflare support
  - [x] Custom WalletButton component with dropdown
  - [x] Wallet connection/disconnect functionality
  - [x] Hydration-safe implementation with mounted state
  - [x] Wallet address display with truncation (e.g., CiC7...xZm1)
  - [x] useWalletStore for managing connected wallet state
- [x] **Homepage Redesign**
  - [x] Mobile-first design matching mockups
  - [x] HOOPX coin logo and brand logo display
  - [x] Dynamic exchange rate from API (0.003 USDT/HOOPX)
  - [x] Dynamic tier range display (1000-5000 USDT)
  - [x] Buy Now button with wallet-gated navigation
- [x] **Purchase Page (/purchase)**
  - [x] Tier selection grid with 5 tiers (1000-5000 USDT)
  - [x] Green border styling for selected tier with checkmark
  - [x] Dynamic HOOPX calculation based on tier and rate
  - [x] Purchase details display (vesting, cliff, frequency)
  - [x] Current price, purchase limit, and current assets display
  - [x] Already purchased wallet detection
  - [x] Auto-redirect if wallet not connected
  - [x] useUIStore for tier selection persistence
- [x] **Security & Encryption**
  - [x] AES decryption helper for hoopxWalletAddress
  - [x] crypto-js integration with CBC mode and PKCS7 padding
  - [x] Environment variables for AES key and IV
  - [x] Automatic decryption in getPurchaseDetails API
  - [x] useHoopxWalletStore for truncated HOOPX wallet address
  - [x] Console logging for debugging encrypted/decrypted values
- [x] **Solana RPC Configuration**
  - [x] Helius RPC provider integration (https://mainnet.helius-rpc.com)
  - [x] Environment variable configuration (NEXT_PUBLIC_SOLANA_RPC_URL)
  - [x] Configurable RPC URL in transfer.ts
  - [x] Resolved 403 rate limiting issues
- [x] **USDT Transfer Implementation**
  - [x] SPL token transfer functionality
  - [x] USDT token account validation
  - [x] Sender balance checking before transaction
  - [x] Associated token account creation handling
  - [x] Transaction fee estimation with account creation costs
  - [x] Proper error handling with user-friendly messages
  - [x] Silent error handling (no console pollution)
- [x] **Transaction Flow**
  - [x] Confirmation modal with transaction review
  - [x] Real-time SOL price fetching from CoinGecko
  - [x] Accurate fee display (USD and SOL)
  - [x] Proper modal sequencing (wallet sign → then sending modal)
  - [x] Transaction status modal (sending/success states)
  - [x] Portfolio redirect after successful purchase
- [x] **Error Handling & UX**
  - [x] Toast notification system (success, error, info, warning)
  - [x] Auto-dismiss after 4 seconds
  - [x] Specific error messages for different scenarios:
    - User cancellation (info toast)
    - No USDT account (error toast)
    - Insufficient balance with actual amounts (error toast)
    - Network errors (error toast)
  - [x] Wallet signing error suppression
  - [x] Graceful fallbacks for API failures
- [x] **Terms & Conditions**
  - [x] Terms modal component with markdown support
  - [x] 10-second countdown timer on continue button
  - [x] localStorage persistence for acceptance
  - [x] Auto-display on first visit to purchase page
  - [x] GET /api/purchase/terms endpoint integration
  - [x] useTerms() React Query hook
- [x] **Portfolio Page (/portfolio)**
  - [x] Total HOOPX assets display
  - [x] Purchase details card with transaction info
  - [x] Vesting schedule information
  - [x] Purchase time and status
  - [x] Auto-redirect if no purchase exists
  - [x] Two-tab interface: Purchase Details & Transfer Records
  - [x] Transaction history display with blockchain data
  - [x] Single transaction query by trxId (avoids rate limits)
  - [x] Dynamic token metadata extraction from blockchain
  - [x] Token logo display using local assets
  - [x] Wallet address extraction from token balances
  - [x] Transaction card with status badge and timestamp
  - [x] Solana Explorer links for verification
  - [x] Date grouping (Today/Yesterday/Date)
  - [x] Green status indicator for successful transfers
- [x] **Production Build**
  - [x] Fixed all ESLint errors (@typescript-eslint/no-explicit-any)
  - [x] Fixed all TypeScript type errors
  - [x] Removed unused variables and imports
  - [x] Updated deprecated React Query options (cacheTime → gcTime)
  - [x] Production build passes all checks
  - [x] Optimized bundle sizes (325-346 KB per page)
- [x] **Environment Management**
  - [x] Staging watermark component
  - [x] NEXT_PUBLIC_IS_STAGING environment flag
  - [x] Visual indicator for staging/development deployments
  - [x] Automatic show/hide based on environment
- [x] **Session Management**
  - [x] Session storage in purchase store
  - [x] Auto-store session when fetched
  - [x] Auto-update session after purchase registration
  - [x] Fixed API wrapper handling for session and register endpoints
  - [x] Null safety fixes in portfolio page
- [x] **Navigation & Redirects**
  - [x] Automatic redirect after successful purchase (1.5s delay)
  - [x] Global SessionRedirectHandler component
  - [x] Auto-redirect to portfolio if user has successful purchase
  - [x] Auto-redirect to purchase if portfolio accessed without purchase
  - [x] Session check on every page load

### 🚧 To Be Implemented
- [ ] Jupiter Lock integration for viewing locked tokens
- [ ] Token claiming functionality post-vesting
- [ ] Transaction history view on portfolio page
- [ ] Enhanced loading skeletons
- [ ] Error boundary implementation
- [ ] Wallet disconnection handling improvements
- [ ] Mobile deep linking optimization
- [ ] Progressive Web App (PWA) features

### 📝 Next Steps
1. **Jupiter Lock Integration**
   - Research Jupiter Lock API/SDK
   - Implement lock viewing functionality
   - Add claim button when cliff period ends
   - Display claimable vs locked amounts
   - Show vesting progress bar

2. **Enhanced UX**
   - Add loading skeletons for data fetching states
   - Implement error boundaries for graceful error handling
   - Add transaction history timeline on portfolio page
   - Optimize animations and transitions
   - Improve mobile responsiveness for various screen sizes

3. **Testing & QA**
   - Test with various wallet providers (Phantom, Solflare, Backpack)
   - Test edge cases (insufficient balance, network errors, etc.)
   - Verify all translations are complete
   - Test on multiple mobile devices
   - Verify transaction flow end-to-end

4. **Performance Optimization**
   - Implement code splitting for better load times
   - Optimize images and assets
   - Add service worker for offline support
   - Monitor and optimize bundle sizes

5. **Documentation**
   - Add inline code comments
   - Create user guide
   - Document deployment process
   - Add troubleshooting guide

---

## Security Implementation

### AES Encryption for Wallet Address

The `hoopxWalletAddress` returned from the API is encrypted using AES-CBC encryption. The system automatically decrypts it.

#### Configuration
Environment variables in `.env.local`:
```env
NEXT_PUBLIC_AES_KEY=9rDwYuLr+WvuC8OnfBfCbg==
NEXT_PUBLIC_AES_IV=l8RvOT8Vgfp6zyBxKY7Hxw==
```

#### Implementation
Located in `src/lib/crypto/decrypt.ts`:
```typescript
import CryptoJS from 'crypto-js';

export function decryptAes(cipherText: string): string {
  const key = process.env.NEXT_PUBLIC_AES_KEY;
  const iv = process.env.NEXT_PUBLIC_AES_IV;

  const parsedKey = CryptoJS.enc.Base64.parse(key);
  const parsedIv = CryptoJS.enc.Base64.parse(iv);

  const decrypted = CryptoJS.AES.decrypt(cipherText, parsedKey, {
    iv: parsedIv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return decrypted.toString(CryptoJS.enc.Utf8);
}
```

#### Auto-Decryption
The `getPurchaseDetails()` function in `src/lib/purchase/api.ts` automatically decrypts the address and stores it:
```typescript
// Decrypt and store in Zustand
const decryptedAddress = decryptAes(result.hoopxWalletAddress);
useHoopxWalletStore.getState().setHoopxAddress(decryptedAddress);
```

#### Usage
Access the truncated HOOPX wallet address in any component:
```typescript
import { useHoopxWalletStore } from '@/lib/store/useHoopxWalletStore';

const { truncatedHoopxAddress } = useHoopxWalletStore();
// Returns: "CiC7...xZm1"
```

---

## State Management

### Zustand Stores

#### 1. Purchase Store (`usePurchaseStore`)
Manages purchase flow state and session data:
```typescript
interface PurchaseState {
  selectedTier: number | null;
  walletAddress: string | null;
  session: FetchSessionVO | null;  // NEW: Stores session data globally
  setSelectedTier: (tier: number | null) => void;
  setWalletAddress: (address: string | null) => void;
  setSession: (session: FetchSessionVO | null) => void;  // NEW
  reset: () => void;
}
```

**Session Auto-Storage:**
- Session automatically stored when fetched via `usePurchaseSession()` hook
- Session updated after successful purchase registration
- Available globally without re-fetching

#### 2. UI Store (`useUIStore`)
Manages purchase page UI state:
```typescript
interface UIState {
  selectedTier: number | null;
  setSelectedTier: (tier: number) => void;
}
```

#### 3. Wallet Store (`useWalletStore`)
Manages connected user's wallet:
```typescript
interface WalletState {
  address: string | null;
  truncatedAddress: string | null;
  setAddress: (address: string | null) => void;
  clearAddress: () => void;
}
```
Auto-synced with Solana wallet connection state.

#### 4. HOOPX Wallet Store (`useHoopxWalletStore`)
Stores the platform's receiving wallet address (decrypted from API):
```typescript
interface HoopxWalletState {
  truncatedHoopxAddress: string | null;  // e.g., "CiC7...xZm1"
  setHoopxAddress: (address: string | null) => void;
  clearHoopxAddress: () => void;
}
```

**Security Note**: Only stores truncated address (first 4 + last 4 characters) for display purposes. Full address is available in API response when needed for transactions.

---

## Key Components

### Toast Notification System (`src/components/toast.tsx`)

A reusable toast notification component for user feedback.

**Features:**
- 4 types: `success`, `error`, `info`, `warning`
- Auto-dismiss after configurable duration (default 4 seconds)
- Color-coded styling with icons
- Slide-down animation from top center
- Non-blocking UX

**Usage:**
```tsx
import Toast, { ToastType } from '@/components/toast';

const [toastMessage, setToastMessage] = useState('');
const [toastType, setToastType] = useState<ToastType>('info');
const [showToast, setShowToast] = useState(false);

const showToastNotification = (message: string, type: ToastType) => {
  setToastMessage(message);
  setToastType(type);
  setShowToast(true);
};

// Use in JSX
<Toast
  message={toastMessage}
  type={toastType}
  isVisible={showToast}
  onClose={() => setShowToast(false)}
/>

// Trigger
showToastNotification('Transaction cancelled', 'info');
showToastNotification('Insufficient balance', 'error');
```

### Session Redirect Handler (`src/components/session-redirect-handler.tsx`)

Global session checker that manages navigation based on user's purchase status.

**Features:**
- Runs on every page load when wallet is connected
- Fetches session automatically via `usePurchaseSession()` hook
- Smart redirect logic based on page and purchase status
- Prevents manual URL navigation to unauthorized pages
- Non-rendering component (returns null)

**Redirect Logic:**
```typescript
// If on homepage or purchase page with successful purchase
if ((pathname === '/' || pathname === '/purchase') && purchaseStatus === 1) {
  router.push('/portfolio');
}

// If on portfolio page without successful purchase
if (pathname === '/portfolio' && purchaseStatus !== 1) {
  router.push('/purchase');
}
```

**Integration:**
```tsx
// In src/components/providers.tsx
<QueryClientProvider client={queryClient}>
  <SessionRedirectHandler />  {/* Runs globally */}
  {children}
</QueryClientProvider>
```

**Use Cases:**
- User with successful purchase refreshes homepage → redirects to portfolio
- User tries to access `/portfolio` without purchase → redirects to `/purchase`
- User with successful purchase tries to purchase again → blocked, redirected to portfolio

### Staging Watermark (`src/components/staging-watermark.tsx`)

Environment indicator displayed on all pages in staging/development environments.

**Features:**
- Only appears when `NEXT_PUBLIC_IS_STAGING=true`
- Fixed positioning at bottom left
- Yellow warning badge with ⚠️ icon
- Non-interactive (pointer-events: none)
- High z-index (9999) to appear above all content
- Added to root layout so it appears on every page

**Usage:**
```tsx
// In src/app/layout.tsx
import StagingWatermark from '@/components/staging-watermark';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <LocaleProvider>{children}</LocaleProvider>
        </Providers>
        <StagingWatermark />
      </body>
    </html>
  );
}
```

**Environment Configuration:**
```env
# .env.local for staging
NEXT_PUBLIC_IS_STAGING=true

# .env.local for production
NEXT_PUBLIC_IS_STAGING=false
```

**Visual Appearance:**
- Yellow background with black text
- Displays: "⚠️ Staging Environment"
- Bold, uppercase lettering
- Rounded corners with shadow

### Terms Modal (`src/components/terms-modal.tsx`)

Modal displaying terms and conditions with mandatory 10-second wait period.

**Features:**
- Fetches terms from `GET /api/purchase/terms` via `useTerms()` hook
- 10-second countdown timer (继续 (10) → 继续 (0) → 继续)
- Button disabled during countdown
- Markdown content rendering with whitespace preservation
- localStorage persistence (`hoopx-terms-accepted`)
- Auto-display on first visit to purchase page
- Scrollable content area with loading state

**Flow:**
1. User enters purchase page for first time
2. Modal appears with terms content
3. Continue button shows countdown: "继续 (10)"
4. After 10 seconds, button becomes active: "继续"
5. User clicks to accept
6. Acceptance stored in localStorage
7. Modal won't show again on subsequent visits

### Confirmation Modal (`src/components/confirmation-modal.tsx`)

Transaction review modal before wallet signing.

**Features:**
- USDT amount display with icon
- Destination address (HOOPX wallet, truncated)
- Exchange rate (1 HOOPX = X USDT)
- Real-time transaction fee in USD and SOL
- Fetches current SOL price from CoinGecko
- Mobile-first design with slide-up animation
- Prevents body scroll when open

**Props:**
```typescript
interface ConfirmationModalProps {
  isOpen: boolean;
  amount: number;           // USDT amount
  rate: number;            // Exchange rate
  estimatedFee: number;    // Fee in SOL
  onConfirm: () => void;   // Triggers transaction
  onClose: () => void;     // Cancel action
}
```

### Transaction Status Modal (`src/components/transaction-status-modal.tsx`)

Displays transaction progress and results.

**States:**
- `sending`: Transaction being processed on blockchain
- `success`: Transaction confirmed successfully

**Features:**
- Animated icons (loading spinner / success checkmark)
- Amount display
- Solana Explorer link with transaction ID
- Auto-redirect to portfolio after 2 seconds on success
- Prevents body scroll when open

### USDT Transfer System (`src/lib/solana/transfer.ts`)

Core Solana blockchain transaction functionality.

**Key Functions:**

#### `transferUSDT()`
Executes SPL token transfer from user to HOOPX wallet.

**Features:**
- Validates sender has USDT token account
- Checks sender balance before transaction
- Creates recipient token account if needed
- Handles wallet signing with error suppression
- Returns structured result: `{ signature, success, error }`

**Error Handling:**
```typescript
// No USDT account
{ success: false, error: 'You do not have a USDT account. Please acquire USDT first.' }

// Insufficient balance
{ success: false, error: 'Insufficient USDT balance. You have 50 USDT but need 1000 USDT.' }

// User rejected
{ success: false, error: 'User rejected the request.' }

// Success
{ success: true, signature: 'txid...', error: undefined }
```

#### `getEstimatedFee()`
Calculates total transaction fee including all costs.

**Calculates:**
- Base transaction fee (~0.000005 SOL)
- Priority fee (from `getRecentPrioritizationFees()`)
- Account creation fee (~0.00204428 SOL if recipient needs token account)

**Returns:** Total fee in SOL

#### `getSolPrice()`
Fetches current SOL price from CoinGecko API.

**Features:**
- Fallback to $150 if API fails
- Silent error handling
- Used for USD fee display

**Environment Variables:**
```env
NEXT_PUBLIC_SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
```

### Transaction Flow Architecture

The purchase flow follows a strict sequence for optimal UX:

**Step 1: User Review**
```tsx
// User clicks "Buy - 1000 USDT"
handleBuyClick() {
  setShowConfirmModal(true); // Show confirmation modal
}
```

**Step 2: User Confirms in App**
```tsx
// User clicks "Confirm Transfer" in modal
handleConfirmTransfer() {
  setShowConfirmModal(false); // Close app modal

  // Wallet will open automatically
  const result = await transferUSDT(...);

  // If user cancels in wallet, result.success = false
  if (!result.success) {
    throw new Error(result.error);
  }

  // Transaction signed! NOW show sending status
  setShowStatusModal(true);
  setTransactionStatus('sending');

  // Register on backend
  await registerPurchase(...);

  // Show success
  setTransactionStatus('success');
}
```

**Error Handling:**
```tsx
catch (error: unknown) {
  setShowStatusModal(false); // Close sending modal

  const errorMessage = error instanceof Error ? error.message : 'Unknown error';

  if (errorMessage.includes('User rejected')) {
    showToastNotification('Transaction cancelled', 'info');
  } else if (errorMessage.includes('Insufficient')) {
    showToastNotification(errorMessage, 'error');
  } else {
    showToastNotification('Transaction failed', 'error');
  }
}
```

**Why This Sequence?**
1. **No stuck modals**: Sending modal only appears AFTER wallet signing
2. **Clear feedback**: User sees wallet → then app confirms it's sending
3. **Graceful cancellation**: If user cancels in wallet, app shows info toast (not error)
4. **No console pollution**: All errors handled via toast notifications

---

## Transaction History Implementation

### Overview
The portfolio page includes a transaction history feature that displays blockchain transaction details by querying Solana directly using the transaction ID stored in the purchase session.

### Architecture

#### File Structure
```
src/
├── app/
│   └── portfolio/
│       └── page.tsx              # Portfolio with two tabs
├── lib/
│   └── solana/
│       ├── transactions.ts       # Transaction parsing logic
│       └── hooks.ts              # React Query hooks for transactions
```

#### Key Components

**1. Transaction Query (`src/lib/solana/transactions.ts`)**

Fetches and parses Solana transactions to extract token transfer details.

**Key Function: `fetchTransactionBySignature(signature: string)`**
```typescript
// Fetches a single transaction by signature
// Returns: TransactionInfo | null
{
  signature: string;
  timestamp: number;
  amount: number;
  from: string;        // Wallet address (not token account)
  to: string;          // Wallet address (not token account)
  status: "success" | "failed";
  tokenSymbol: string; // e.g., "USDT"
  tokenName?: string;  // e.g., "Tether USD"
  tokenMint?: string;  // SPL token mint address
  tokenLogo?: string;  // Path to local image
}
```

**Key Function: `parseTokenTransfer(tx: ParsedTransactionWithMeta)`**

Extracts SPL token transfer details from parsed transaction:

1. **Finds Transfer Instructions**: Searches for `transfer` or `transferChecked` instructions
2. **Extracts Amount**: Uses `uiAmount` or converts from lamports with decimals
3. **Gets Wallet Addresses**: Maps token accounts to wallet owners using `preTokenBalances` and `postTokenBalances`
4. **Extracts Token Metadata**: Finds mint address and looks up known tokens
5. **Returns Transfer Info**: Amount, from/to addresses, token details

**Known Token Registry**
```typescript
const knownTokens = {
  "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB": {
    symbol: "USDT",
    name: "Tether USD",
    logo: "/images/usdt-badge.png",
  },
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": {
    symbol: "USDC",
    name: "USD Coin",
    logo: "/images/usdc.png",
  },
};
```

**2. React Query Hook (`src/lib/solana/hooks.ts`)**

```typescript
export function useTransaction(signature?: string) {
  return useQuery({
    queryKey: ['transaction', signature],
    queryFn: async () => {
      if (!signature) return null;
      return fetchTransactionBySignature(signature);
    },
    enabled: !!signature,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: 1000,
  });
}
```

**3. Portfolio Page Implementation (`src/app/portfolio/page.tsx`)**

**Two-Tab Interface:**
- **Purchase Details**: Shows HOOPX balance, vesting schedule, purchase info
- **Transfer Records**: Displays blockchain transaction history

**Transaction Display Features:**
- **Status Badge**: Green pill with arrow icon (↗ 已转账)
- **Timestamp**: Formatted as HH:MM AM/PM
- **Date Grouping**: "Today" / "Yesterday" / "Jan 15, 2025"
- **Token Logo**: 48x48px circular image
- **Amount Display**: Red text showing outgoing transfer (-2000 USDT)
- **Recipient Address**: Truncated format (CiC7...xZm1)
- **Explorer Link**: Clickable card linking to Solscan

### Technical Challenges & Solutions

#### Challenge 1: Rate Limiting (429 Errors)
**Problem**: Scanning all wallet transactions caused RPC rate limits
**Solution**: Query only the specific transaction by trxId from purchase session

#### Challenge 2: Token Account vs Wallet Address
**Problem**: SPL token transfers use Associated Token Accounts, not wallet addresses
**Solution**: Extract wallet owner addresses from `preTokenBalances` and `postTokenBalances` metadata

#### Challenge 3: Dynamic Token Metadata
**Problem**: Hardcoding token symbols and logos isn't scalable
**Solution**:
- Extract mint address from transaction
- Lookup token details in known tokens registry
- Use local image assets for logos

#### Challenge 4: Token Logo Display
**Problem**: External URLs for token logos may fail or be blocked
**Solution**: Store token logos in `/public/images/` and use local paths

### Transaction Card Layout

```
┌─────────────────────────────────────────┐
│ ↗ 已转账          05:59 PM              │ ← Status badge & time
├─────────────────────────────────────────┤
│ [USDT]  USDT                  -2000 USDT│ ← Logo, symbol, amount
│ 🔵      To: CiC7...xZm1                 │ ← Recipient address
└─────────────────────────────────────────┘
```

### Solana Transaction Parsing

**Understanding SPL Token Transfers:**

1. **Token Accounts**: Each wallet has an Associated Token Account (ATA) for each token type
2. **Transfer Flow**: Token → ATA (sender) → ATA (recipient) → Wallet (owner)
3. **Transaction Structure**:
   - `instructions[]`: Contains transfer instruction
   - `preTokenBalances[]`: Token account states before transaction
   - `postTokenBalances[]`: Token account states after transaction

**Extracting Wallet Addresses:**
```typescript
// Source token account from instruction
const source = info.source;

// Find wallet owner from token balances
const sourceBalance = preBalances.find(
  (b) => accountKeys[b.accountIndex]?.pubkey.toBase58() === source
);

const fromAddress = sourceBalance?.owner || source; // Wallet address
```

### Helper Functions

**`formatAddress(address: string)`**
Truncates wallet addresses for display: `CiC7nF...pFxZm1`

**`getExplorerUrl(signature: string)`**
Returns Solscan URL with correct network (mainnet/devnet):
```typescript
const network = isStaging ? "devnet" : "mainnet-beta";
return `https://solscan.io/tx/${signature}?cluster=${network}`;
```

### Best Practices

1. **Single Transaction Query**: Only fetch what's needed to avoid rate limits
2. **Local Assets**: Use `/public/images/` for token logos
3. **Wallet Addresses**: Always extract from token balance metadata, not instruction
4. **Error Handling**: Show loading/empty states gracefully
5. **Caching**: Use React Query with 5-minute stale time
6. **Retry Logic**: 3 retries with 1-second delay for RPC failures

### Future Enhancements

- [ ] Multiple transaction support (transaction list)
- [ ] Pagination for long transaction histories
- [ ] Filter by date range or token type
- [ ] Export transaction history as CSV
- [ ] Display USD value at time of transaction

---

## Environment Variables

Complete list of required environment variables in `.env.local`:

```env
# Environment Configuration
NEXT_PUBLIC_IS_STAGING=true

# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://boot-api.hoopx.gg

# AES Encryption Keys
NEXT_PUBLIC_AES_KEY=9rDwYuLr+WvuC8OnfBfCbg==
NEXT_PUBLIC_AES_IV=l8RvOT8Vgfp6zyBxKY7Hxw==

# Solana RPC Configuration
NEXT_PUBLIC_SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY
```

**Environment Flags:**
- **NEXT_PUBLIC_IS_STAGING**: Set to `true` for staging/development environments to show staging watermark. Set to `false` for production to hide the watermark.

**RPC Provider Options:**
- **Helius** (Recommended): 100k requests/day free tier
- **QuickNode**: Scalable with analytics
- **Alchemy**: Similar features to Helius
- **Public RPC** (Not recommended): Rate limited, unreliable

---

## Troubleshooting

### Common Issues

**Issue: Phantom wallet doesn't work on first click (Chrome iOS only)**
- **Cause**: Chrome on iOS has limitations with custom URL scheme deep links (`phantom://`, `solflare://`)
- **Behavior**: First click on Phantom does nothing. After clicking Solflare (or refreshing), Phantom works
- **Solution**: This is a known Chrome iOS limitation. Users should:
  - Use Safari or Arc browser on iOS for best wallet experience (both work correctly)
  - OR click Phantom twice / try another wallet first to "warm up" the adapters
- **Note**: This only affects Chrome browser on iOS. Desktop Chrome and other mobile browsers work fine.

**Issue: Transaction fails with "403 Forbidden"**
- **Cause**: Public Solana RPC rate limiting
- **Solution**: Configure Helius or other paid RPC in `NEXT_PUBLIC_SOLANA_RPC_URL`

**Issue: "Simulation failed" in wallet**
- **Cause**: User doesn't have USDT token account
- **Solution**: App now validates before transaction and shows clear error

**Issue: Fee display doesn't match wallet**
- **Cause**: Not including account creation fee
- **Solution**: Fixed - `getEstimatedFee()` now includes all costs

**Issue: Sending modal appears then gets stuck when canceling**
- **Cause**: Modal showed before wallet signing
- **Solution**: Fixed - modal only appears AFTER successful wallet signing

**Issue: Red console errors on wallet cancellation**
- **Cause**: Unhandled `WalletSignTransactionError`
- **Solution**: Fixed - dedicated try-catch around `signTransaction()`

**Issue: Build fails with ESLint errors**
- **Cause**: Using `any` types, unused variables
- **Solution**: All fixed - using `unknown` with type guards, removed unused code

---

## API Endpoint Documentation (Extended)

### 4. Get Terms and Conditions
**GET** `/api/purchase/terms`

Retrieves the terms and conditions content in markdown format.

**Headers:**
```
Accept: text/markdown
```

**Response** (200 - plain text):
```markdown
# HOOPX Token Purchase Terms

1. You must hold HOOPX tokens...
2. Vesting schedule is non-negotiable...
...
```

**React Query Hook:**
```typescript
const { data: termsMarkdown, isLoading } = useTerms(true);
```

---

## Project File Structure (Updated)

```
hoopx-presale/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with all providers
│   │   ├── page.tsx                # Homepage with exchange rate
│   │   ├── purchase/
│   │   │   └── page.tsx            # Purchase flow with modals
│   │   ├── portfolio/
│   │   │   └── page.tsx            # User portfolio view
│   │   └── globals.css
│   ├── components/
│   │   ├── header.tsx              # App header
│   │   ├── wallet-button.tsx       # Wallet connection
│   │   ├── toast.tsx               # Toast notifications
│   │   ├── staging-watermark.tsx   # Environment indicator
│   │   ├── session-redirect-handler.tsx  # Global session checker
│   │   ├── terms-modal.tsx         # Terms & conditions
│   │   ├── confirmation-modal.tsx  # Transaction review
│   │   ├── transaction-status-modal.tsx  # TX status
│   │   ├── wallet-provider.tsx     # Solana wallet context
│   │   ├── locale-provider.tsx     # i18n provider
│   │   └── providers.tsx           # React Query + SessionRedirectHandler
│   ├── lib/
│   │   ├── http.ts                 # Axios client
│   │   ├── queryKeys.ts            # Query key factory
│   │   ├── crypto/
│   │   │   └── decrypt.ts          # AES decryption
│   │   ├── purchase/
│   │   │   ├── types.ts            # API types
│   │   │   ├── api.ts              # API functions (4 endpoints)
│   │   │   └── hooks.ts            # React Query hooks
│   │   ├── solana/
│   │   │   ├── transfer.ts         # USDT transfer logic (NEW)
│   │   │   └── price.ts            # SOL price fetcher (NEW)
│   │   └── store/
│   │       ├── useUIStore.ts       # UI state
│   │       ├── useWalletStore.ts   # User wallet
│   │       └── useHoopxWalletStore.ts  # Platform wallet
│   └── i18n/
│       ├── config.ts               # Locale config
│       └── locales/
│           ├── en.json             # English
│           └── cn.json             # Chinese
├── public/
│   └── images/
│       ├── coin.png                # HOOPX coin
│       ├── brand-logo.png          # HOOPX logo
│       └── usdt.png                # USDT icon
├── .env.local                      # Environment variables
├── package.json
├── tsconfig.json
├── next.config.ts
└── claude.md                       # This file
```
- use pnpm instead of npm