import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const usePreferences = create<{ simplified: boolean; setSimplified: (value: boolean) => void }>()(
  persist((set) => ({ simplified: true, setSimplified: (simplified) => set({ simplified }) }), {
    name: "bestsaves.preferences.v1",
    storage: createJSONStorage(() => localStorage),
    skipHydration: true,
    partialize: ({ simplified }) => ({ simplified }),
  }),
);