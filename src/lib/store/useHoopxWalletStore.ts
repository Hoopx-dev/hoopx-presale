import { create } from 'zustand';

interface HoopxWalletState {
  hoopxAddress: string | null; // Full decrypted address
  truncatedHoopxAddress: string | null;
  setHoopxAddress: (address: string | null) => void;
  clearHoopxAddress: () => void;
}

/**
 * Formats the HOOPX wallet address to show first 4 and last 4 characters
 * Example: CiC7...xZm1
 */
const formatAddress = (address: string): string => {
  if (!address || address.length < 8) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

export const useHoopxWalletStore = create<HoopxWalletState>((set) => ({
  hoopxAddress: null,
  truncatedHoopxAddress: null,

  setHoopxAddress: (address) => set({
    hoopxAddress: address,
    truncatedHoopxAddress: address ? formatAddress(address) : null,
  }),

  clearHoopxAddress: () => set({
    hoopxAddress: null,
    truncatedHoopxAddress: null,
  }),
}));
