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
- **Framework**: Next.js (based on project structure)
- **Payment Token**: USDT
- **Lock Platform**: Jupiter Lock
- **Primary Wallet Example**: Jupiter Wallet

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
