export interface PurchaseDetailsVO {
  rate: number | string;
  activityId: string;
  cliff: string;
  vesting: string;
  vestingFrequency: number; // 1=monthly, 2=yearly
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
  vestingFrequency: number; // 1=monthly, 2=yearly
}

// Pre-order (unfinished order) structure
export interface PreOrderVO {
  preOrderId?: string; // Pre-order ID for converting to formal
  activityId: string;
  userId: number;
  userWallet: string;
  orderMatch: boolean;
  amountToken: number; // HOOPX amount
  amountUsdt: number; // USDT amount
  priceUsdtPerToken: number;
  createTime: string;
}

// Session response with array of orders and optional pre-order
export interface FetchSessionVO {
  publicKey: string;
  orderVoList: OrderVO[];
  preOrderVO?: PreOrderVO | null; // Unfinished order
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
  vestingFrequency: number; // 1=monthly, 2=yearly
  subscriptionTime: string;
}

export interface RegisterPurchaseDTO {
  publicKey: string;
  amount: number;
  trxId: string;
  activityId: string;
  referralWalletAddress?: string;
}

// Pre-order creation request (create-pre)
export interface CreatePreOrderDTO {
  publicKey: string;
  referralWalletAddress?: string;
  amount: number; // USDT amount
  trxId?: string; // Optional - empty for pre-orders
  activityId: string;
}

// Convert pre-order to formal request
export interface PreOrderToFormalDTO {
  preOrderId: string;
  trxId: string;
  publicKey: string;
}

// Pre-order query request
export interface PreOrderQueryDTO {
  activityId: string;
  publicKey: string;
}
