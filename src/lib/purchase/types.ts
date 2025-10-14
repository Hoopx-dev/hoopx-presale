export interface PurchaseDetailsVO {
  rate: number;
  activityId: string;
  cliff: string;
  vesting: string;
  vestingFrequency: string;
  hoopxWalletAddress: string;
  startTime: string;
  endTime: string;
  timezone: string;
  tokenTotal: number;
  purchasedAmount: number;
  tiers: number[];
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
}

export interface RegisterPurchaseDTO {
  publicKey: string;
  amount: number;
  trxId: string;
  activityId: string;
}
