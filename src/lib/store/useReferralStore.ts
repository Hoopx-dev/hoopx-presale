import { create } from 'zustand';

interface ReferralState {
  referralAddress: string | null;
  setReferralAddress: (address: string | null) => void;
  clearReferralAddress: () => void;
}

export const useReferralStore = create<ReferralState>((set) => ({
  referralAddress: null,
  setReferralAddress: (address) => set({ referralAddress: address }),
  clearReferralAddress: () => set({ referralAddress: null }),
}));
