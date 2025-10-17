import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPurchaseDetails, getPurchaseSession, registerPurchase, getTerms } from './api';
import { QK } from '@/lib/queryKeys';
import type { RegisterPurchaseDTO } from './types';
import { usePurchaseStore } from '@/store/purchase';

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
 * Automatically stores session data in the purchase store
 */
export function usePurchaseSession(publicKey?: string) {
  const setSession = usePurchaseStore((state) => state.setSession);

  return useQuery({
    queryKey: QK.purchase.session(publicKey),
    queryFn: async () => {
      const session = await getPurchaseSession(publicKey!);
      // Store session in global store
      setSession(session);
      return session;
    },
    enabled: !!publicKey,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to register a new purchase
 * Invalidates session query on success and updates the store
 */
export function useRegisterPurchase() {
  const queryClient = useQueryClient();
  const setSession = usePurchaseStore((state) => state.setSession);

  return useMutation({
    mutationFn: (dto: RegisterPurchaseDTO) => registerPurchase(dto),
    onSuccess: (data) => {
      // Update session in store
      setSession(data);

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

/**
 * Hook to fetch terms and conditions
 * Returns markdown text that can be rendered with a markdown renderer
 * @param lang - Language code ('en' for English, 'zh' for Chinese)
 * @param enabled - Whether to enable the query (default: true)
 */
export function useTerms(lang: string = 'en', enabled = true) {
  return useQuery({
    queryKey: QK.purchase.terms(lang),
    queryFn: () => getTerms(lang),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes - terms don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes in cache
  });
}
