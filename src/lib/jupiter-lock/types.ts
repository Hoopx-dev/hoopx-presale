import { PublicKey } from '@solana/web3.js';

/**
 * Jupiter Lock escrow account data structure
 */
export interface JupiterLockData {
  recipient: PublicKey;           // Beneficiary wallet address
  mint: PublicKey;                // Token mint address
  amount: number;                 // Total locked amount
  startTs: number;                // Unix timestamp when lock starts
  cliffUnits: number;             // Number of cliff period units
  cliffUnitsType: number;         // 0=seconds, 1=months
  amountPerPeriod: number;        // Amount released per period
  numOfUnits: number;             // Number of vesting periods
  unitsType: number;              // 0=seconds, 1=months
  claimedAmount: number;          // Amount already claimed
  cancelAuthority: PublicKey;     // Authority that can cancel the lock
  escrowAccount: PublicKey;       // The escrow account address
}

/**
 * Parsed lock info with human-readable data
 */
export interface ParsedLockInfo {
  escrowAddress: string;
  recipientAddress: string;
  tokenMint: string;
  totalAmount: number;            // Total locked tokens (in decimal format)
  claimedAmount: number;          // Already claimed (in decimal format)
  claimableAmount: number;        // Currently available to claim (in decimal format)
  remainingAmount: number;        // Still locked (in decimal format)
  startDate: Date;
  cliffEndDate: Date;
  vestingEndDate: Date;
  isCliffPassed: boolean;
  isFullyVested: boolean;
  progressPercentage: number;
}
