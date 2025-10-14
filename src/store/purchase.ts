import { create } from 'zustand';

interface PurchaseState {
  selectedTier: number | null;
  walletAddress: string | null;
  setSelectedTier: (tier: number | null) => void;
  setWalletAddress: (address: string | null) => void;
  reset: () => void;
}

export const usePurchaseStore = create<PurchaseState>((set) => ({
  selectedTier: null,
  walletAddress: null,
  setSelectedTier: (tier) => set({ selectedTier: tier }),
  setWalletAddress: (address) => set({ walletAddress: address }),
  reset: () => set({ selectedTier: null, walletAddress: null }),
}));
