import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppStore {
  sidebarOpen: boolean
  colorScheme: 'light' | 'dark'
  toggleSidebar: () => void
  setColorScheme: (scheme: 'light' | 'dark') => void
}

export const useStore = create<AppStore>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      colorScheme: 'light',
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setColorScheme: (scheme) => set({ colorScheme: scheme }),
    }),
    {
      name: 'deepvariance-storage',
    }
  )
)
