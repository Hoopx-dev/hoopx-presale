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

export interface FetchSessionVO {
  publicKey: string;
  purchasedAmount: number;
  trxId: string;
  purchaseStatus: number; // 1=success, 2=failed
  rate: number;
  cliff: string;
  vesting: string;
  vestingFrequency: string;
  subscriptionTime: string; // User's purchase/subscription time
}

export interface RegisterPurchaseDTO {
  publicKey: string;
  amount: number;
  trxId: string;
  activityId: string;
  referralWalletAddress?: string;
}
