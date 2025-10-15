import { create } from 'zustand';

interface WalletState {
  address: string | null;
  truncatedAddress: string | null;
  setAddress: (address: string | null) => void;
  clearAddress: () => void;
}

/**
 * Formats a wallet address to show first 4 and last 4 characters
 * Example: CiC7...xZm1
 */
const formatAddress = (address: string): string => {
  if (!address || address.length < 8) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

export const useWalletStore = create<WalletState>((set) => ({
  address: null,
  truncatedAddress: null,

  setAddress: (address) => set({
    address,
    truncatedAddress: address ? formatAddress(address) : null,
  }),

  clearAddress: () => set({
    address: null,
    truncatedAddress: null,
  }),
}));
