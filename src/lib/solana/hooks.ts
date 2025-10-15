import { useQuery } from '@tanstack/react-query';
import { fetchTransactionBySignature } from './transactions';

/**
 * Hook to fetch a specific transaction by signature
 */
export function useTransaction(signature?: string) {
  return useQuery({
    queryKey: ['transaction', signature],
    queryFn: async () => {
      if (!signature) {
        return null;
      }
      return fetchTransactionBySignature(signature);
    },
    enabled: !!signature,
    staleTime: 5 * 60 * 1000, // 5 minutes (transactions don't change)
    retry: 3, // Retry on failure
    retryDelay: 1000, // Wait 1 second between retries
  });
}
