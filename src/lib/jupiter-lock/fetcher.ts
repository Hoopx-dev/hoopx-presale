import { Connection, PublicKey } from '@solana/web3.js';
import type { ParsedLockInfo } from './types';

// Jupiter Lock Program ID
export const JUPITER_LOCK_PROGRAM_ID = new PublicKey('CChTq6PthWU82YZkbveA3WDf7s97BWhBK4Vx9bmsT743');

/**
 * Fetch and parse Jupiter Lock escrow account data
 * @param connection - Solana connection
 * @param escrowAddress - The escrow account public key
 * @returns Parsed lock information
 */
export async function fetchJupiterLock(
  connection: Connection,
  escrowAddress: string
): Promise<ParsedLockInfo | null> {
  try {
    const escrowPubkey = new PublicKey(escrowAddress);

    // Fetch account info
    const accountInfo = await connection.getAccountInfo(escrowPubkey);

    if (!accountInfo) {
      console.error('Jupiter Lock escrow account not found:', escrowAddress);
      return null;
    }

    // Parse the account data
    const data = accountInfo.data;

    // Jupiter Lock escrow account layout (approximate - may need adjustment)
    // This is a simplified version - you may need to adjust based on actual program layout
    const layout = {
      recipient: data.slice(8, 40),           // 32 bytes for recipient pubkey
      mint: data.slice(40, 72),               // 32 bytes for mint pubkey
      amount: data.readBigUInt64LE(72),       // 8 bytes for total amount
      startTs: data.readBigUInt64LE(80),      // 8 bytes for start timestamp
      cliffUnits: data.readBigUInt64LE(88),   // 8 bytes for cliff units
      cliffUnitsType: data.readUInt8(96),     // 1 byte for cliff type (0=seconds, 1=months)
      amountPerPeriod: data.readBigUInt64LE(97), // 8 bytes for amount per period
      numOfUnits: data.readBigUInt64LE(105),  // 8 bytes for number of units
      unitsType: data.readUInt8(113),         // 1 byte for units type
      claimedAmount: data.readBigUInt64LE(114), // 8 bytes for claimed amount
    };

    // Convert to human-readable format
    const totalAmount = Number(layout.amount) / 1e6; // Assuming 6 decimals for HOOPX
    const claimedAmount = Number(layout.claimedAmount) / 1e6;
    const startTs = Number(layout.startTs);
    const cliffUnits = Number(layout.cliffUnits);
    const numOfUnits = Number(layout.numOfUnits);

    // Calculate dates
    const startDate = new Date(startTs * 1000);

    // Calculate cliff end date
    let cliffEndDate: Date;
    if (layout.cliffUnitsType === 1) {
      // Months
      cliffEndDate = new Date(startDate);
      cliffEndDate.setMonth(cliffEndDate.getMonth() + cliffUnits);
    } else {
      // Seconds
      cliffEndDate = new Date(startTs * 1000 + cliffUnits * 1000);
    }

    // Calculate vesting end date
    let vestingEndDate: Date;
    if (layout.unitsType === 1) {
      // Months
      vestingEndDate = new Date(cliffEndDate);
      vestingEndDate.setMonth(vestingEndDate.getMonth() + numOfUnits);
    } else {
      // Seconds
      vestingEndDate = new Date(cliffEndDate.getTime() + numOfUnits * 1000);
    }

    // Calculate claimable amount
    const now = new Date();
    const isCliffPassed = now >= cliffEndDate;
    const isFullyVested = now >= vestingEndDate;

    let claimableAmount = 0;
    if (isFullyVested) {
      claimableAmount = totalAmount - claimedAmount;
    } else if (isCliffPassed) {
      // Calculate based on time elapsed since cliff
      const totalVestingTime = vestingEndDate.getTime() - cliffEndDate.getTime();
      const elapsedTime = now.getTime() - cliffEndDate.getTime();
      const vestingProgress = Math.min(elapsedTime / totalVestingTime, 1);
      const totalVested = totalAmount * vestingProgress;
      claimableAmount = Math.max(totalVested - claimedAmount, 0);
    }

    const remainingAmount = totalAmount - claimedAmount;
    const progressPercentage = (claimedAmount / totalAmount) * 100;

    const recipientPubkey = new PublicKey(layout.recipient);
    const mintPubkey = new PublicKey(layout.mint);

    return {
      escrowAddress,
      recipientAddress: recipientPubkey.toBase58(),
      tokenMint: mintPubkey.toBase58(),
      totalAmount,
      claimedAmount,
      claimableAmount,
      remainingAmount,
      startDate,
      cliffEndDate,
      vestingEndDate,
      isCliffPassed,
      isFullyVested,
      progressPercentage,
    };
  } catch (error) {
    console.error('Error fetching Jupiter Lock:', error);
    return null;
  }
}
