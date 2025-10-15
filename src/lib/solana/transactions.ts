import { ParsedTransactionWithMeta } from '@solana/web3.js';
import { createSolanaConnection } from './transfer';

export interface TransactionInfo {
  signature: string;
  timestamp: number;
  amount: number;
  from: string;
  to: string;
  status: 'success' | 'failed';
  blockTime: number | null | undefined;
}

/**
 * Fetch a single transaction by signature
 * @param signature - Transaction signature/ID
 * @param userAddress - User's wallet address
 * @param hoopxAddress - HOOPX wallet address
 * @returns Transaction information or null
 */
export async function fetchTransactionBySignature(
  signature: string,
  userAddress: string,
  hoopxAddress: string
): Promise<TransactionInfo | null> {
  try {
    console.log('[Transaction Query] Starting fetch for:', signature);
    console.log('[Transaction Query] User address:', userAddress);
    console.log('[Transaction Query] HOOPX address:', hoopxAddress);

    const connection = createSolanaConnection();

    // Fetch the specific transaction
    const tx = await connection.getParsedTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });

    console.log('[Transaction Query] Transaction fetched:', tx ? 'Found' : 'Not found');

    if (!tx || !tx.meta) {
      console.log('[Transaction Query] Transaction not found or no metadata');
      return null;
    }

    console.log('[Transaction Query] Transaction error:', tx.meta.err);
    console.log('[Transaction Query] Instructions count:', tx.transaction.message.instructions.length);

    // Parse transaction to get token transfer details
    const transferInfo = parseTokenTransfer(tx, userAddress, hoopxAddress);

    console.log('[Transaction Query] Transfer info:', transferInfo);

    if (!transferInfo) {
      console.log('[Transaction Query] Could not parse transfer info from transaction');
      return null;
    }

    const result: TransactionInfo = {
      signature,
      timestamp: tx.blockTime || Date.now() / 1000,
      amount: transferInfo.amount,
      from: transferInfo.from,
      to: transferInfo.to,
      status: tx.meta.err ? 'failed' : 'success',
      blockTime: tx.blockTime,
    };

    console.log('[Transaction Query] Final result:', result);
    return result;
  } catch (error) {
    console.error('[Transaction Query] Error fetching transaction:', error);
    return null;
  }
}

/**
 * Parse token transfer from parsed transaction
 */
function parseTokenTransfer(
  tx: ParsedTransactionWithMeta,
  userAddress: string,
  hoopxAddress: string
): { amount: number; from: string; to: string } | null {
  try {
    console.log('[Parse Transfer] Starting parse...');
    // Look for token transfer instructions
    const instructions = tx.transaction.message.instructions;
    console.log('[Parse Transfer] Total instructions:', instructions.length);

    for (let i = 0; i < instructions.length; i++) {
      const ix = instructions[i];
      console.log(`[Parse Transfer] Instruction ${i}:`, 'parsed' in ix ? 'Has parsed' : 'No parsed');

      if ('parsed' in ix && ix.parsed && typeof ix.parsed === 'object') {
        const parsed = ix.parsed as {
          type: string;
          info: {
            source?: string;
            destination?: string;
            authority?: string;
            amount?: string | number;
            decimals?: number;
            tokenAmount?: {
              uiAmount?: number;
            };
          };
        };

        console.log(`[Parse Transfer] Instruction ${i} type:`, parsed.type);
        console.log(`[Parse Transfer] Instruction ${i} info:`, parsed.info);

        // Check for SPL token transfer
        if (parsed.type === 'transfer' || parsed.type === 'transferChecked') {
          const info = parsed.info;

          // Get source and destination addresses
          const source = info.source || info.authority;
          const destination = info.destination;

          console.log('[Parse Transfer] Source:', source);
          console.log('[Parse Transfer] Destination:', destination);
          console.log('[Parse Transfer] Authority:', info.authority);

          // Check if this transfer is between user and HOOPX
          const fromUser = source && (
            tx.transaction.message.accountKeys.find(k => k.pubkey.toBase58() === source)?.pubkey.toBase58() === userAddress ||
            info.authority === userAddress
          );

          const toHoopx = destination && (
            tx.transaction.message.accountKeys.find(k => k.pubkey.toBase58() === destination)?.pubkey.toBase58() === hoopxAddress
          );

          console.log('[Parse Transfer] From user?', fromUser);
          console.log('[Parse Transfer] To HOOPX?', toHoopx);

          if (fromUser && toHoopx) {
            // Parse amount (handle both transfer and transferChecked)
            let amount = 0;
            if (info.amount) {
              amount = typeof info.amount === 'string' ? parseInt(info.amount) : info.amount;
            } else if (info.tokenAmount?.uiAmount) {
              amount = info.tokenAmount.uiAmount;
            }

            console.log('[Parse Transfer] Raw amount:', info.amount);
            console.log('[Parse Transfer] Decimals:', info.decimals);

            // For USDT with 6 decimals, convert from lamports
            if (info.decimals) {
              amount = amount / Math.pow(10, info.decimals);
            } else {
              // Default to 6 decimals for USDT
              amount = amount / 1_000_000;
            }

            console.log('[Parse Transfer] Final amount:', amount);

            return {
              amount,
              from: userAddress,
              to: hoopxAddress,
            };
          }
        }
      }
    }

    console.log('[Parse Transfer] No matching transfer found');
    return null;
  } catch (error) {
    console.error('[Parse Transfer] Error parsing token transfer:', error);
    return null;
  }
}

/**
 * Format transaction signature for display (truncate)
 */
export function formatSignature(signature: string): string {
  if (signature.length <= 12) return signature;
  return `${signature.slice(0, 4)}...${signature.slice(-4)}`;
}

/**
 * Format wallet address for display (truncate)
 */
export function formatAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

/**
 * Get Solana explorer URL for transaction
 */
export function getExplorerUrl(signature: string): string {
  const isStaging = process.env.NEXT_PUBLIC_IS_STAGING === 'true';
  const network = isStaging ? 'devnet' : 'mainnet-beta';
  return `https://solscan.io/tx/${signature}?cluster=${network}`;
}
