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
  tokenSymbol: string;
  tokenName?: string;
  tokenMint?: string;
  tokenLogo?: string;
}

/**
 * Fetch a single transaction by signature
 * @param signature - Transaction signature/ID
 * @returns Transaction information or null
 */
export async function fetchTransactionBySignature(
  signature: string
): Promise<TransactionInfo | null> {
  try {
    console.log('[Transaction Query] Starting fetch for:', signature);

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
    console.log('[Transaction Query] Block time:', tx.blockTime);

    // Parse transaction to get token transfer details
    const transferInfo = parseTokenTransfer(tx);

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
      tokenSymbol: transferInfo.tokenSymbol,
      tokenName: transferInfo.tokenName,
      tokenMint: transferInfo.tokenMint,
      tokenLogo: transferInfo.tokenLogo,
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
 * Extracts the first SPL token transfer found in the transaction
 */
function parseTokenTransfer(
  tx: ParsedTransactionWithMeta
): {
  amount: number;
  from: string;
  to: string;
  tokenSymbol: string;
  tokenName?: string;
  tokenMint?: string;
  tokenLogo?: string;
} | null {
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
            mint?: string;
            tokenAmount?: {
              uiAmount?: number;
            };
          };
        };

        console.log(`[Parse Transfer] Instruction ${i} type:`, parsed.type);
        console.log(`[Parse Transfer] Instruction ${i} info:`, JSON.stringify(parsed.info, null, 2));

        // Check for SPL token transfer
        if (parsed.type === 'transfer' || parsed.type === 'transferChecked') {
          const info = parsed.info;

          // Get source and destination addresses
          const source = info.source || info.authority;
          const destination = info.destination;

          console.log('[Parse Transfer] Source:', source);
          console.log('[Parse Transfer] Destination:', destination);

          if (!source || !destination) {
            console.log('[Parse Transfer] Missing source or destination, skipping...');
            continue;
          }

          // Parse amount (handle both transfer and transferChecked)
          let amount = 0;
          if (info.tokenAmount?.uiAmount) {
            // Use uiAmount if available (already in human-readable format)
            amount = info.tokenAmount.uiAmount;
            console.log('[Parse Transfer] Using uiAmount:', amount);
          } else if (info.amount) {
            // Convert from lamports
            amount = typeof info.amount === 'string' ? parseInt(info.amount) : info.amount;
            console.log('[Parse Transfer] Raw amount:', amount);
            console.log('[Parse Transfer] Decimals:', info.decimals);

            // For USDT with 6 decimals, convert from lamports
            if (info.decimals !== undefined) {
              amount = amount / Math.pow(10, info.decimals);
            } else {
              // Default to 6 decimals for USDT
              amount = amount / 1_000_000;
            }
          }

          console.log('[Parse Transfer] Final amount:', amount);

          // The source and destination are TOKEN ACCOUNTS, not wallet addresses
          // We need to get the actual wallet owners from pre/post token balances
          let fromAddress = source;
          let toAddress = destination;

          // Try to get wallet addresses from token balances
          if (tx.meta?.preTokenBalances && tx.meta?.postTokenBalances) {
            const preBalances = tx.meta.preTokenBalances;
            const postBalances = tx.meta.postTokenBalances;

            // Find the source token account
            const sourceBalance = preBalances.find(b =>
              tx.transaction.message.accountKeys[b.accountIndex]?.pubkey.toBase58() === source
            );

            // Find the destination token account
            const destBalance = postBalances.find(b =>
              tx.transaction.message.accountKeys[b.accountIndex]?.pubkey.toBase58() === destination
            );

            if (sourceBalance && sourceBalance.owner) {
              fromAddress = sourceBalance.owner;
              console.log('[Parse Transfer] Found source owner:', fromAddress);
            }

            if (destBalance && destBalance.owner) {
              toAddress = destBalance.owner;
              console.log('[Parse Transfer] Found destination owner:', toAddress);
            }
          }

          console.log('[Parse Transfer] Final from address:', fromAddress);
          console.log('[Parse Transfer] Final to address:', toAddress);

          // Extract token metadata - mint may be in instruction or in token balances
          let tokenMint = info.mint;
          console.log('[Parse Transfer] Token mint from instruction:', tokenMint);

          // If mint not in instruction, try to get from token balances
          if (!tokenMint && tx.meta?.postTokenBalances) {
            const postBalances = tx.meta.postTokenBalances;
            const destBalance = postBalances.find(b =>
              tx.transaction.message.accountKeys[b.accountIndex]?.pubkey.toBase58() === destination
            );
            if (destBalance) {
              tokenMint = destBalance.mint;
              console.log('[Parse Transfer] Token mint from balance:', tokenMint);
            }
          }

          console.log('[Parse Transfer] Final token mint:', tokenMint);

          // Common token symbols based on mint address
          const knownTokens: Record<string, { symbol: string; name: string; logo?: string }> = {
            'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': {
              symbol: 'USDT',
              name: 'Tether USD',
              logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png'
            },
            'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': {
              symbol: 'USDC',
              name: 'USD Coin',
              logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
            }
          };

          // Try to get token metadata
          let tokenSymbol = 'Unknown';
          let tokenName: string | undefined;
          let tokenLogo: string | undefined;

          console.log('[Parse Transfer] Looking up token mint:', tokenMint);

          if (tokenMint && knownTokens[tokenMint]) {
            tokenSymbol = knownTokens[tokenMint].symbol;
            tokenName = knownTokens[tokenMint].name;
            tokenLogo = knownTokens[tokenMint].logo;
            console.log('[Parse Transfer] Found in known tokens:', tokenSymbol);
          } else {
            console.log('[Parse Transfer] Token mint not in known list');
          }

          console.log('[Parse Transfer] Token symbol:', tokenSymbol);
          console.log('[Parse Transfer] Token name:', tokenName);

          return {
            amount,
            from: fromAddress,
            to: toAddress,
            tokenSymbol,
            tokenName,
            tokenMint,
            tokenLogo,
          };
        }
      }
    }

    console.log('[Parse Transfer] No token transfer found');
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
