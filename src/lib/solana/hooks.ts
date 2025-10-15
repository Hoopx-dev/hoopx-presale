import { useQuery } from '@tanstack/react-query';
import { fetchTransactionsBetweenWallets } from './transactions';

/**
 * Hook to fetch transactions between user wallet and HOOPX wallet
 */
export function useTransactionHistory(
  userAddress?: string,
  hoopxAddress?: string
) {
  return useQuery({
    queryKey: ['transactions', userAddress, hoopxAddress],
    queryFn: async () => {
      if (!userAddress || !hoopxAddress) {
        return [];
      }
      return fetchTransactionsBetweenWallets(userAddress, hoopxAddress);
    },
    enabled: !!userAddress && !!hoopxAddress,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}
