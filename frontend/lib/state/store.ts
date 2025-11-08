import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * User Store
 * 
 * Manages authenticated user data and preferences
 * Persisted to localStorage for cross-session consistency
 */
interface UserStore {
  userId: string | null
  email: string | null
  role: 'student' | 'instructor' | 'admin' | null
  setUser: (user: { id: string; email: string; role: 'student' | 'instructor' | 'admin' }) => void
  clearUser: () => void
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      userId: null,
      email: null,
      role: null,
      setUser: (user) =>
        set({
          userId: user.id,
          email: user.email,
          role: user.role,
        }),
      clearUser: () =>
        set({
          userId: null,
          email: null,
          role: null,
        }),
    }),
    {
      name: 'user-store',
    }
  )
)

/**
 * UI Store
 * 
 * Manages ephemeral UI state like modals, sidebars, etc.
 * Not persisted - resets on page reload
 */
interface UIStore {
  isSidebarOpen: boolean
  isBookingModalOpen: boolean
  toggleSidebar: () => void
  openBookingModal: () => void
  closeBookingModal: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  isSidebarOpen: true,
  isBookingModalOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  openBookingModal: () => set({ isBookingModalOpen: true }),
  closeBookingModal: () => set({ isBookingModalOpen: false }),
}))

