import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  selectedTier: number | null;
  setSelectedTier: (tier: number) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      selectedTier: null,
      setSelectedTier: (tier) => set({ selectedTier: tier }),
    }),
    {
      name: 'hoopx-ui-storage',
    }
  )
);
