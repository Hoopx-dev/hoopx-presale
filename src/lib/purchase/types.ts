export interface PurchaseDetailsVO {
  rate: number | string;
  activityId: string;
  cliff: string;
  vesting: string;
  vestingFrequency: string;
  hoopxWalletAddress: string;
  startTime: string;
  endTime: string;
  timezone: string;
  tokenTotal: number | string;
  purchasedAmount: number | string;
  tiers?: number[] | string[]; // Optional as it might not be in response
  tierList?: number[] | string[]; // Alternative field name
}

// Single order/purchase record
export interface OrderVO {
  activityId: string;
  trxId: string;
  rate: number;
  purchaseStatus: number; // 1=success, 2=failed
  activityName: string;
  amount: number; // Purchase amount in USDT
  subscriptionTime: string; // Purchase time in GMT+8
  cliff: string;
  vesting: string;
  vestingFrequency: string;
}

// Session response with array of orders
export interface FetchSessionVO {
  publicKey: string;
  orderVoList: OrderVO[];
}

// Legacy support - keep this for backward compatibility during transition
export interface LegacySessionVO {
  publicKey: string;
  purchasedAmount: number;
  trxId: string;
  purchaseStatus: number;
  rate: number;
  cliff: string;
  vesting: string;
  vestingFrequency: string;
  subscriptionTime: string;
}

export interface RegisterPurchaseDTO {
  publicKey: string;
  amount: number;
  trxId: string;
  activityId: string;
  referralWalletAddress?: string;
}
