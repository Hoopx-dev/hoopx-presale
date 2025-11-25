import { PublicKey } from '@solana/web3.js';

/**
 * Meteora Lock SDK Escrow Structure (from IDL)
 * This matches the on-chain data structure used by the Lock Program
 */
export interface MeteoraEscrowData {
  recipient: PublicKey;           // Beneficiary wallet address
  tokenMint: PublicKey;           // Token mint address
  creator: PublicKey;             // Escrow creator
  base: PublicKey;                // Base key for PDA
  escrowBump: number;             // PDA bump seed
  updateRecipientMode: number;    // Permission mode for updating recipient
  cancelMode: number;             // Permission mode for cancellation
  tokenProgramFlag: number;       // 0=SPL, 1=Token2022
  cliffTime: bigint;              // Unix timestamp when cliff ends
  frequency: bigint;              // Seconds between releases
  cliffUnlockAmount: bigint;      // Amount released at cliff
  amountPerPeriod: bigint;        // Amount per vesting period
  numberOfPeriod: bigint;         // Total number of vesting periods
  totalClaimedAmount: bigint;     // Already claimed amount
  vestingStartTime: bigint;       // When vesting started
  cancelledAt: bigint;            // Cancellation timestamp (0 if not cancelled)
}

/**
 * Parsed lock info with human-readable data
 * Used by UI components to display lock status
 */
export interface ParsedLockInfo {
  // Core identifiers
  escrowAddress: string;
  recipientAddress: string;
  tokenMint: string;

  // Amounts (in decimal format, adjusted for token decimals)
  totalAmount: number;            // Total locked tokens
  claimedAmount: number;          // Already claimed
  claimableAmount: number;        // Currently available to claim
  remainingAmount: number;        // Still locked (totalAmount - claimedAmount)

  // Schedule dates
  startDate: Date;                // When vesting started
  cliffEndDate: Date;             // When cliff period ends
  vestingEndDate: Date;           // When all tokens are fully vested

  // Status flags
  isCliffPassed: boolean;         // True if current time >= cliffEndDate
  isFullyVested: boolean;         // True if current time >= vestingEndDate
  progressPercentage: number;     // (claimedAmount / totalAmount) * 100

  // Additional data for calculations (used by claim function)
  decimals: number;               // Token decimals
  frequencySeconds: number;       // Seconds between each release
  cliffAmount: number;            // Amount released at cliff (decimal)
  periodAmount: number;           // Amount per period (decimal)
  numPeriods: number;             // Total number of vesting periods
}
