import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPurchaseDetails, getPurchaseSession, registerPurchase, getTerms, createPreOrder, convertToFormal, deletePreOrder } from './api';
import { QK } from '@/lib/queryKeys';
import type { RegisterPurchaseDTO, CreatePreOrderDTO, PreOrderToFormalDTO, DeletePreOrderDTO } from './types';
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
 * Only fetches when publicKey and activityId are provided
 * Automatically stores session data in the purchase store
 */
export function usePurchaseSession(publicKey?: string, activityId?: string) {
  const setSession = usePurchaseStore((state) => state.setSession);

  return useQuery({
    queryKey: QK.purchase.session(publicKey, activityId),
    queryFn: async () => {
      const session = await getPurchaseSession(publicKey!, activityId!);
      // Store session in global store
      setSession(session);
      return session;
    },
    enabled: !!publicKey && !!activityId,
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
    onSuccess: (data, variables) => {
      // Update session in store
      setSession(data);

      // Invalidate and refetch session query (with activityId from request)
      queryClient.invalidateQueries({
        queryKey: QK.purchase.session(data.publicKey, variables.activityId),
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

/**
 * Hook to create a pre-order before wallet transaction
 * Returns the pre-order ID needed for convert-to-formal
 * Invalidates session query on success to show unfinished order
 */
export function useCreatePreOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreatePreOrderDTO) => createPreOrder(dto),
    onSuccess: (_data, variables) => {
      // Invalidate session query to refetch with new pre-order
      queryClient.invalidateQueries({
        queryKey: QK.purchase.session(variables.publicKey, variables.activityId),
      });
    },
  });
}

/**
 * Hook to convert a pre-order to formal order after successful transaction
 * Invalidates session query on success and updates the store
 */
export function useConvertToFormal() {
  const queryClient = useQueryClient();
  const setSession = usePurchaseStore((state) => state.setSession);

  return useMutation({
    mutationFn: (dto: PreOrderToFormalDTO) => convertToFormal(dto),
    onSuccess: (data) => {
      // Safety check: only proceed if data is valid
      if (!data || !data.publicKey) {
        console.error('Invalid data returned from convert-to-formal');
        return;
      }

      // Update session in store
      setSession(data);

      // Invalidate all session queries for this publicKey (regardless of activityId)
      queryClient.invalidateQueries({
        queryKey: ['purchase', 'session', data.publicKey],
      });
      // Invalidate details to refresh purchased amount
      queryClient.invalidateQueries({
        queryKey: QK.purchase.details(),
      });
    },
  });
}

/**
 * Hook to delete a pre-order
 * Invalidates session query on success
 */
export function useDeletePreOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: DeletePreOrderDTO) => deletePreOrder(dto),
    onSuccess: (_data, variables) => {
      // Invalidate session query to refetch without the pre-order
      queryClient.invalidateQueries({
        queryKey: ['purchase', 'session', variables.publicKey],
      });
    },
  });
}
