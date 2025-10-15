import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

// USDT token mint address on Solana mainnet
const USDT_MINT_ADDRESS = 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB';

export interface TransferResult {
  signature: string;
  success: boolean;
  error?: string;
}

/**
 * Transfer USDT tokens on Solana
 * @param connection Solana connection
 * @param senderPublicKey Sender's wallet public key
 * @param recipientAddress Recipient's wallet address (string)
 * @param amount Amount in USDT (will be converted to lamports)
 * @param signTransaction Function to sign the transaction
 * @returns TransferResult with signature and status
 */
export async function transferUSDT(
  connection: Connection,
  senderPublicKey: PublicKey,
  recipientAddress: string,
  amount: number,
  signTransaction: (transaction: Transaction) => Promise<Transaction>
): Promise<TransferResult> {
  try {
    const usdtMint = new PublicKey(USDT_MINT_ADDRESS);
    const recipientPublicKey = new PublicKey(recipientAddress);

    // Get associated token accounts
    const senderTokenAccount = await getAssociatedTokenAddress(
      usdtMint,
      senderPublicKey
    );

    const recipientTokenAccount = await getAssociatedTokenAddress(
      usdtMint,
      recipientPublicKey
    );

    // USDT has 6 decimals
    const amountInLamports = amount * 1_000_000;

    // Create transfer instruction
    const transferInstruction = createTransferInstruction(
      senderTokenAccount,
      recipientTokenAccount,
      senderPublicKey,
      amountInLamports,
      [],
      TOKEN_PROGRAM_ID
    );

    // Get recent blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

    // Create transaction
    const transaction = new Transaction({
      feePayer: senderPublicKey,
      blockhash,
      lastValidBlockHeight,
    }).add(transferInstruction);

    // Sign transaction
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

    return {
      signature,
      success: true,
    };
  } catch (error: any) {
    console.error('USDT transfer failed:', error);
    return {
      signature: '',
      success: false,
      error: error.message || 'Transfer failed',
    };
  }
}

/**
 * Get estimated transaction fee
 * @param connection Solana connection
 * @returns Estimated fee in SOL
 */
export async function getEstimatedFee(connection: Connection): Promise<number> {
  try {
    // Get recent prioritization fees
    const recentFees = await connection.getRecentPrioritizationFees();

    if (recentFees.length === 0) {
      // Fallback to 0.00001 SOL (~$0.002)
      return 0.00001;
    }

    // Calculate average fee
    const avgFee = recentFees.reduce((sum, fee) => sum + fee.prioritizationFee, 0) / recentFees.length;

    // Convert microlamports to SOL and add base fee
    const baseFee = 0.000005; // 5000 lamports
    const priorityFee = avgFee / 1_000_000_000;

    return baseFee + priorityFee;
  } catch (error) {
    console.error('Failed to estimate fee:', error);
    // Return fallback fee
    return 0.00001;
  }
}
