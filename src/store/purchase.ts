import { create } from 'zustand';
import type { FetchSessionVO } from '@/lib/purchase/types';

interface PurchaseState {
  selectedTier: number | null;
  walletAddress: string | null;
  session: FetchSessionVO | null;
  setSelectedTier: (tier: number | null) => void;
  setWalletAddress: (address: string | null) => void;
  setSession: (session: FetchSessionVO | null) => void;
  reset: () => void;
}

export const usePurchaseStore = create<PurchaseState>((set) => ({
  selectedTier: null,
  walletAddress: null,
  session: null,
  setSelectedTier: (tier) => set({ selectedTier: tier }),
  setWalletAddress: (address) => set({ walletAddress: address }),
  setSession: (session) => set({ session }),
  reset: () => set({ selectedTier: null, walletAddress: null, session: null }),
}));
