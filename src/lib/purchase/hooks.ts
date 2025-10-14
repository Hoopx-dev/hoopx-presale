import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPurchaseDetails, getPurchaseSession, registerPurchase } from './api';
import { QK } from '@/lib/queryKeys';
import type { RegisterPurchaseDTO } from './types';

/**
 * Hook to fetch purchase details (activity configuration and tiers)
 * Automatically refetches every 60 seconds
 */
export function usePurchaseDetails(enabled = true) {
  return useQuery({
    queryKey: QK.purchase.details(),
    queryFn: getPurchaseDetails,
    enabled,
    staleTime: 60 * 1000, // 60 seconds
    refetchInterval: 60 * 1000, // Refetch every 60 seconds
  });
}

/**
 * Hook to fetch purchase session for a specific wallet
 * Only fetches when publicKey is provided
 */
export function usePurchaseSession(publicKey?: string) {
  return useQuery({
    queryKey: QK.purchase.session(publicKey),
    queryFn: () => getPurchaseSession(publicKey!),
    enabled: !!publicKey,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to register a new purchase
 * Invalidates session query on success
 */
export function useRegisterPurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: RegisterPurchaseDTO) => registerPurchase(dto),
    onSuccess: (data) => {
      // Invalidate and refetch session query
      queryClient.invalidateQueries({
        queryKey: QK.purchase.session(data.publicKey),
      });
      // Invalidate details to refresh purchased amount
      queryClient.invalidateQueries({
        queryKey: QK.purchase.details(),
      });
    },
  });
}
