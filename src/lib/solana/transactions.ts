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
    const connection = createSolanaConnection();

    // Fetch the specific transaction
    const tx = await connection.getParsedTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });

    if (!tx || !tx.meta) {
      console.log('Transaction not found or no metadata');
      return null;
    }

    // Parse transaction to get token transfer details
    const transferInfo = parseTokenTransfer(tx, userAddress, hoopxAddress);

    if (!transferInfo) {
      console.log('Could not parse transfer info from transaction');
      return null;
    }

    return {
      signature,
      timestamp: tx.blockTime || Date.now() / 1000,
      amount: transferInfo.amount,
      from: transferInfo.from,
      to: transferInfo.to,
      status: tx.meta.err ? 'failed' : 'success',
      blockTime: tx.blockTime,
    };
  } catch (error) {
    console.error('Error fetching transaction:', error);
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
    // Look for token transfer instructions
    const instructions = tx.transaction.message.instructions;

    for (const ix of instructions) {
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

        // Check for SPL token transfer
        if (parsed.type === 'transfer' || parsed.type === 'transferChecked') {
          const info = parsed.info;

          // Get source and destination addresses
          const source = info.source || info.authority;
          const destination = info.destination;

          // Check if this transfer is between user and HOOPX
          const fromUser = source && (
            tx.transaction.message.accountKeys.find(k => k.pubkey.toBase58() === source)?.pubkey.toBase58() === userAddress ||
            info.authority === userAddress
          );

          const toHoopx = destination && (
            tx.transaction.message.accountKeys.find(k => k.pubkey.toBase58() === destination)?.pubkey.toBase58() === hoopxAddress
          );

          if (fromUser && toHoopx) {
            // Parse amount (handle both transfer and transferChecked)
            let amount = 0;
            if (info.amount) {
              amount = typeof info.amount === 'string' ? parseInt(info.amount) : info.amount;
            } else if (info.tokenAmount?.uiAmount) {
              amount = info.tokenAmount.uiAmount;
            }

            // For USDT with 6 decimals, convert from lamports
            if (info.decimals) {
              amount = amount / Math.pow(10, info.decimals);
            } else {
              // Default to 6 decimals for USDT
              amount = amount / 1_000_000;
            }

            return {
              amount,
              from: userAddress,
              to: hoopxAddress,
            };
          }
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error parsing token transfer:', error);
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
