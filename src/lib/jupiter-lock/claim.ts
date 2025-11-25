import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { LockClient } from '@meteora-ag/met-lock-sdk';
import BN from 'bn.js';

/**
 * Claim/withdraw tokens from Jupiter Lock using Meteora SDK
 *
 * Uses the claimV2 method from @meteora-ag/met-lock-sdk
 * SDK Field Names (from IDL):
 * - recipient: PublicKey
 * - cliffTime: BN (unix timestamp)
 * - frequency: BN (seconds)
 * - cliffUnlockAmount: BN
 * - amountPerPeriod: BN
 * - numberOfPeriod: BN
 * - totalClaimedAmount: BN
 *
 * @param connection - Solana connection
 * @param escrowAddress - Jupiter Lock escrow account address
 * @param recipientWallet - User's wallet public key
 * @param signTransaction - Function to sign transaction from wallet
 * @returns Transaction signature if successful
 */
export async function claimJupiterLock(
  connection: Connection,
  escrowAddress: string,
  recipientWallet: PublicKey,
  signTransaction: (transaction: Transaction) => Promise<Transaction>
): Promise<{ success: boolean; signature?: string; error?: string }> {
  try {
    const escrowPubkey = new PublicKey(escrowAddress);

    // Initialize Meteora Lock client
    const client = new LockClient(connection, 'confirmed');

    // Fetch escrow data to verify it exists and get details
    const escrow = await client.getEscrow(escrowPubkey);
    if (!escrow) {
      return { success: false, error: 'Escrow account not found' };
    }

    // Extract escrow details using correct SDK field names
    const {
      recipient,
      cliffTime,
      frequency,
      cliffUnlockAmount,
      amountPerPeriod,
      numberOfPeriod,
      totalClaimedAmount,
    } = escrow;

    // Calculate total max amount: cliffUnlockAmount + (amountPerPeriod * numberOfPeriod)
    const maxAmount = cliffUnlockAmount.add(
      amountPerPeriod.mul(numberOfPeriod)
    );

    // Calculate claimable amount based on vesting schedule
    const now = Math.floor(Date.now() / 1000);
    const cliffTimestamp = cliffTime.toNumber();
    const frequencySeconds = frequency.toNumber();

    // Calculate how much can be claimed
    let vestedAmount = new BN(0);
    if (now >= cliffTimestamp) {
      // After cliff: cliff amount + periods elapsed
      const elapsedSinceCliff = now - cliffTimestamp;
      const periodsElapsed = Math.floor(elapsedSinceCliff / frequencySeconds);

      // Vested = cliffUnlockAmount + (periodsElapsed * amountPerPeriod)
      vestedAmount = cliffUnlockAmount.add(
        amountPerPeriod.muln(periodsElapsed)
      );

      // Cap at max amount
      if (vestedAmount.gt(maxAmount)) {
        vestedAmount = maxAmount;
      }
    }

    // Claimable = vested - already claimed
    const claimableAmount = vestedAmount.sub(totalClaimedAmount);

    if (claimableAmount.lte(new BN(0))) {
      return { success: false, error: 'No tokens available to claim yet' };
    }

    // Get claim transaction using SDK's claimV2 method
    const claimTx = await client.claimV2({
      escrow: escrowPubkey,
      recipient: recipient,
      maxAmount: claimableAmount,
      payer: recipientWallet,
    });

    // Set fee payer and get blockhash
    claimTx.feePayer = recipientWallet;
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash();
    claimTx.recentBlockhash = blockhash;

    // Sign transaction with user's wallet
    const signedTransaction = await signTransaction(claimTx);

    // Send and confirm transaction
    const signature = await connection.sendRawTransaction(
      signedTransaction.serialize()
    );

    await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
    });

    return { success: true, signature };
  } catch (error: unknown) {
    console.error('Error claiming Jupiter Lock:', error);

    // Handle user rejection gracefully
    if (
      error instanceof Error &&
      error.message.includes('User rejected')
    ) {
      return { success: false, error: 'Transaction cancelled by user' };
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return { success: false, error: errorMessage };
  }
}
