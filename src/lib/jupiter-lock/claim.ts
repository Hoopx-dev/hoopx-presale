import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import { JUPITER_LOCK_PROGRAM_ID } from './fetcher';

/**
 * Claim/withdraw tokens from Jupiter Lock
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

    // Fetch escrow account to get mint and other details
    const escrowInfo = await connection.getAccountInfo(escrowPubkey);
    if (!escrowInfo) {
      return { success: false, error: 'Escrow account not found' };
    }

    // Parse mint from escrow data (simplified - adjust based on actual layout)
    const mintData = escrowInfo.data.slice(40, 72);
    const mint = new PublicKey(mintData);

    // Get or create associated token account for recipient
    const recipientTokenAccount = await getAssociatedTokenAddress(
      mint,
      recipientWallet
    );

    // Get escrow token account (PDA derived from escrow)
    const [escrowTokenAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from('escrow'), escrowPubkey.toBuffer()],
      JUPITER_LOCK_PROGRAM_ID
    );

    // Build claim instruction
    // Note: This is a simplified version - you may need to adjust based on Jupiter Lock's actual instruction layout
    const claimInstruction = new TransactionInstruction({
      keys: [
        { pubkey: escrowPubkey, isSigner: false, isWritable: true },
        { pubkey: escrowTokenAccount, isSigner: false, isWritable: true },
        { pubkey: recipientTokenAccount, isSigner: false, isWritable: true },
        { pubkey: recipientWallet, isSigner: true, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      ],
      programId: JUPITER_LOCK_PROGRAM_ID,
      data: Buffer.from([
        3, // Instruction index for "withdraw" (may need adjustment)
      ]),
    });

    // Create and send transaction
    const transaction = new Transaction().add(claimInstruction);
    transaction.feePayer = recipientWallet;

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    // Sign transaction with user's wallet
    const signedTransaction = await signTransaction(transaction);

    // Send transaction
    const signature = await connection.sendRawTransaction(
      signedTransaction.serialize()
    );

    // Confirm transaction
    await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
    });

    return { success: true, signature };
  } catch (error: unknown) {
    console.error('Error claiming Jupiter Lock:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { success: false, error: errorMessage };
  }
}
