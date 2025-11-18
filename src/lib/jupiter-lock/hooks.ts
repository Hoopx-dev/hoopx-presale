import { useQuery } from '@tanstack/react-query';
import { useConnection } from '@solana/wallet-adapter-react';
import { fetchJupiterLock } from './fetcher';

/**
 * React Query hook to fetch Jupiter Lock data
 * @param escrowAddress - The Jupiter Lock escrow address
 * @param enabled - Whether to enable the query
 */
export function useJupiterLock(escrowAddress?: string, enabled = true) {
  const { connection } = useConnection();

  return useQuery({
    queryKey: ['jupiter-lock', escrowAddress],
    queryFn: async () => {
      if (!escrowAddress) return null;
      return fetchJupiterLock(connection, escrowAddress);
    },
    enabled: enabled && !!escrowAddress,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}
