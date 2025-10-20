import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ReferralState {
  referralAddress: string | null;
  setReferralAddress: (address: string | null) => void;
  clearReferralAddress: () => void;
}

export const useReferralStore = create<ReferralState>()(
  persist(
    (set) => ({
      referralAddress: null,
      setReferralAddress: (address) => {
        set({ referralAddress: address });
      },
      clearReferralAddress: () => set({ referralAddress: null }),
    }),
    {
      name: 'hoopx-referral-storage', // localStorage key
      skipHydration: false,
    }
  )
);
