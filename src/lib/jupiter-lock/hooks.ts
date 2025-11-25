import { useQuery } from '@tanstack/react-query';
import { useConnection } from '@solana/wallet-adapter-react';
import { fetchJupiterLock, fetchAllJupiterLocks, findEscrowsByRecipient } from './fetcher';
import { PublicKey } from '@solana/web3.js';

/**
 * React Query hook to fetch Jupiter Lock data by escrow address
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

/**
 * React Query hook to find all escrow addresses for a wallet
 * @param walletAddress - The user's wallet address
 * @param enabled - Whether to enable the query
 */
export function useJupiterLockEscrows(walletAddress?: string, enabled = true) {
  const { connection } = useConnection();

  return useQuery({
    queryKey: ['jupiter-lock-escrows', walletAddress],
    queryFn: async () => {
      if (!walletAddress) return [];
      return findEscrowsByRecipient(connection, new PublicKey(walletAddress));
    },
    enabled: enabled && !!walletAddress,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

/**
 * React Query hook to fetch all Jupiter Lock data for a wallet
 * @param walletAddress - The user's wallet address
 * @param filterTokenMint - Optional token mint to filter by (e.g., HOOPX token mint)
 * @param enabled - Whether to enable the query
 */
export function useAllJupiterLocks(
  walletAddress?: string,
  filterTokenMint?: string,
  enabled = true
) {
  const { connection } = useConnection();

  return useQuery({
    queryKey: ['jupiter-locks-all', walletAddress, filterTokenMint],
    queryFn: async () => {
      if (!walletAddress) return [];
      return fetchAllJupiterLocks(connection, walletAddress, filterTokenMint);
    },
    enabled: enabled && !!walletAddress,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}
