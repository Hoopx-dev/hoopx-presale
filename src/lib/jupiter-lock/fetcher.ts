import { Connection, PublicKey } from '@solana/web3.js';
import { LockClient } from '@meteora-ag/met-lock-sdk';
import { getMint } from '@solana/spl-token';
import type { ParsedLockInfo } from './types';

/**
 * Jupiter Lock / Meteora Lock Integration
 *
 * Using @meteora-ag/met-lock-sdk to interact with the Lock Program
 * Program ID: LocpQgucEQHbqNABEYvBvwoxCPsSbG91A1QaQhQQqjn
 *
 * SDK Escrow Structure (from IDL):
 * - recipient: PublicKey (offset 8, after 8-byte discriminator)
 * - tokenMint: PublicKey
 * - creator: PublicKey
 * - base: PublicKey
 * - escrowBump: u8
 * - cliffTime: u64 (unix timestamp when cliff ends)
 * - frequency: u64 (seconds between releases)
 * - cliffUnlockAmount: u64 (amount released at cliff)
 * - amountPerPeriod: u64 (amount per vesting period)
 * - numberOfPeriod: u64 (total vesting periods)
 * - totalClaimedAmount: u64 (already claimed)
 * - vestingStartTime: u64 (when vesting started)
 * - cancelledAt: u64 (0 if not cancelled)
 */

// Jupiter/Meteora Lock Program ID
export const JUPITER_LOCK_PROGRAM_ID = new PublicKey('LocpQgucEQHbqNABEYvBvwoxCPsSbG91A1QaQhQQqjn');

// HOOPX Token Mint Address
export const HOOPX_TOKEN_MINT = process.env.NEXT_PUBLIC_HOOPX_TOKEN_MINT || '9GhjesUhxmVo9x4UHpdS6NVi4TGzcx8BtGckUqFrjupx';

/**
 * Find all Jupiter Lock escrows for a given recipient wallet address
 * Uses getProgramAccounts with memcmp filter on recipient field
 *
 * Note: Meteora Lock uses zero_copy accounts which may have different layout.
 * The VestingEscrow account structure (from IDL inspection):
 * - Anchor discriminator: 8 bytes (offset 0)
 * - recipient: 32 bytes (offset 8)
 * - tokenMint: 32 bytes (offset 40)
 *
 * @param connection - Solana connection
 * @param recipientWallet - The recipient's wallet public key
 * @returns Array of escrow addresses
 */
export async function findEscrowsByRecipient(
  connection: Connection,
  recipientWallet: PublicKey
): Promise<string[]> {
  try {
    const accounts = await connection.getProgramAccounts(JUPITER_LOCK_PROGRAM_ID, {
      filters: [
        {
          memcmp: {
            offset: 8, // recipient is at offset 8 (after 8-byte discriminator)
            bytes: recipientWallet.toBase58(),
          },
        },
      ],
    });

    return accounts.map((account) => account.pubkey.toBase58());
  } catch (error) {
    console.error('Error finding escrows by recipient:', error);
    return [];
  }
}

/**
 * Fetch all Jupiter Lock escrows for a wallet and parse them
 * @param connection - Solana connection
 * @param recipientWallet - The recipient's wallet public key
 * @param filterTokenMint - Optional token mint to filter by (e.g., HOOPX_TOKEN_MINT)
 * @returns Array of parsed lock information
 */
export async function fetchAllJupiterLocks(
  connection: Connection,
  recipientWallet: string,
  filterTokenMint?: string
): Promise<ParsedLockInfo[]> {
  try {
    const walletPubkey = new PublicKey(recipientWallet);
    const escrowAddresses = await findEscrowsByRecipient(connection, walletPubkey);

    if (escrowAddresses.length === 0) {
      return [];
    }

    // Fetch each escrow's details
    const locks: ParsedLockInfo[] = [];
    for (const escrowAddress of escrowAddresses) {
      const lockInfo = await fetchJupiterLock(connection, escrowAddress);
      if (lockInfo) {
        // Filter by token mint if specified
        if (filterTokenMint && lockInfo.tokenMint !== filterTokenMint) {
          continue;
        }
        locks.push(lockInfo);
      }
    }

    return locks;
  } catch (error) {
    console.error('Error fetching all Jupiter locks:', error);
    return [];
  }
}

/**
 * Fetch token decimals from mint
 */
async function getTokenDecimals(connection: Connection, mintAddress: PublicKey): Promise<number> {
  try {
    const mintInfo = await getMint(connection, mintAddress);
    return mintInfo.decimals;
  } catch {
    // Default to 6 decimals (common for USDT, USDC, etc.)
    return 6;
  }
}

/**
 * Fetch and parse Jupiter Lock escrow account data using Meteora SDK
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

    // Initialize Meteora Lock client
    const client = new LockClient(connection, 'confirmed');

    // Fetch escrow data using SDK
    const escrow = await client.getEscrow(escrowPubkey);

    if (!escrow) {
      return null;
    }

    // The SDK returns the escrow data directly with correct field names
    // Field names from Meteora SDK IDL (camelCase in TypeScript)
    const {
      recipient,
      tokenMint,
      cliffTime,
      frequency,
      cliffUnlockAmount,
      amountPerPeriod,
      numberOfPeriod,
      totalClaimedAmount,
      vestingStartTime,
    } = escrow;

    // Get token decimals from mint
    const decimals = await getTokenDecimals(connection, tokenMint);
    const divisor = Math.pow(10, decimals);

    // Calculate total amount: cliffUnlockAmount + (amountPerPeriod × numberOfPeriod)
    const cliffAmount = Number(cliffUnlockAmount.toString()) / divisor;
    const periodAmount = Number(amountPerPeriod.toString()) / divisor;
    const numPeriods = Number(numberOfPeriod.toString());
    const totalAmount = cliffAmount + (periodAmount * numPeriods);

    // Convert claimed amount
    const claimedAmount = Number(totalClaimedAmount.toString()) / divisor;

    // Parse timestamps (SDK returns BN, convert to number for Date)
    const vestingStartTimestamp = Number(vestingStartTime.toString());
    const cliffTimestamp = Number(cliffTime.toString());
    const frequencySeconds = Number(frequency.toString());

    const startDate = new Date(vestingStartTimestamp * 1000);
    const cliffEndDate = new Date(cliffTimestamp * 1000);

    // Calculate vesting end date
    // Vesting ends after all periods complete from cliff time
    const vestingEndTimestamp = cliffTimestamp + (numPeriods * frequencySeconds);
    const vestingEndDate = new Date(vestingEndTimestamp * 1000);

    // Check current status
    const now = Date.now();
    const nowSeconds = Math.floor(now / 1000);
    const isCliffPassed = nowSeconds >= cliffTimestamp;
    const isFullyVested = nowSeconds >= vestingEndTimestamp;

    // Calculate claimable amount based on vesting schedule
    let vestedAmount = 0;
    if (isFullyVested) {
      // All tokens are vested
      vestedAmount = totalAmount;
    } else if (isCliffPassed) {
      // Cliff amount + periods elapsed since cliff
      const elapsedSinceCliff = nowSeconds - cliffTimestamp;
      const periodsElapsed = Math.floor(elapsedSinceCliff / frequencySeconds);
      vestedAmount = cliffAmount + (periodsElapsed * periodAmount);
      vestedAmount = Math.min(vestedAmount, totalAmount);
    }
    // Before cliff: vestedAmount = 0

    const claimableAmount = Math.max(vestedAmount - claimedAmount, 0);
    const remainingAmount = totalAmount - claimedAmount;
    const progressPercentage = totalAmount > 0 ? (claimedAmount / totalAmount) * 100 : 0;

    return {
      escrowAddress,
      recipientAddress: recipient.toBase58(),
      tokenMint: tokenMint.toBase58(),
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
      // Additional raw data for claim function
      decimals,
      frequencySeconds,
      cliffAmount,
      periodAmount,
      numPeriods,
    };
  } catch (error) {
    console.error('Error fetching Jupiter Lock:', error);
    return null;
  }
}
