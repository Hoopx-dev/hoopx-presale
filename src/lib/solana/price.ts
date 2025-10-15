/**
 * Fetch current SOL price in USD from CoinGecko API
 * @returns Current SOL price in USD
 */
export async function getSolPrice(): Promise<number> {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd'
    );
    const data = await response.json();
    return data.solana?.usd || 150; // Fallback to $150 if API fails
  } catch (error) {
    console.error('Failed to fetch SOL price:', error);
    return 150; // Fallback price
  }
}
