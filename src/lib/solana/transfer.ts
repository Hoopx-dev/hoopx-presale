import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
  getAccount,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

// USDT token mint address on Solana mainnet
const USDT_MINT_ADDRESS = 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB';

/**
 * Get Solana RPC URL from environment or fallback to devnet
 */
export function getSolanaRpcUrl(): string {
  return process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
}

/**
 * Create a Solana connection instance
 */
export function createSolanaConnection(): Connection {
  return new Connection(getSolanaRpcUrl(), 'confirmed');
}

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

    // Check if sender has USDT token account and sufficient balance
    let senderBalance = 0;
    try {
      const senderAccountInfo = await getAccount(connection, senderTokenAccount);
      senderBalance = Number(senderAccountInfo.amount) / 1_000_000; // Convert to USDT (6 decimals)
    } catch (error) {
      // Sender doesn't have a USDT token account
      return {
        signature: '',
        success: false,
        error: 'You do not have a USDT account. Please acquire USDT first.',
      };
    }

    // Check if sender has enough USDT
    if (senderBalance < amount) {
      return {
        signature: '',
        success: false,
        error: `Insufficient USDT balance. You have ${senderBalance.toFixed(2)} USDT but need ${amount} USDT.`,
      };
    }

    // Check if recipient token account exists, if not, create it
    let recipientAccountExists = true;
    try {
      await getAccount(connection, recipientTokenAccount);
    } catch (error) {
      recipientAccountExists = false;
    }

    // Get recent blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

    // Create transaction
    const transaction = new Transaction({
      feePayer: senderPublicKey,
      blockhash,
      lastValidBlockHeight,
    });

    // If recipient token account doesn't exist, create it first
    if (!recipientAccountExists) {
      const createAccountInstruction = createAssociatedTokenAccountInstruction(
        senderPublicKey, // payer
        recipientTokenAccount, // associated token account
        recipientPublicKey, // owner
        usdtMint // mint
      );
      transaction.add(createAccountInstruction);
    }

    // USDT has 6 decimals
    const amountInLamports = amount * 1_000_000;

    // Add transfer instruction
    const transferInstruction = createTransferInstruction(
      senderTokenAccount,
      recipientTokenAccount,
      senderPublicKey,
      amountInLamports,
      [],
      TOKEN_PROGRAM_ID
    );
    transaction.add(transferInstruction);

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
    // Return error without logging to keep console clean
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
    // Return fallback fee silently
    return 0.00001;
  }
}
