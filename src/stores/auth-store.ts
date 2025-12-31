/**
 * Auth Store
 * Manages client-side authentication state
 */

import { create } from 'zustand'

export interface AuthUser {
  id: string
  email: string
  username: string
  createdAt?: Date
}

interface AuthState {
  // User data
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean

  // Actions
  setUser: (user: AuthUser | null) => void
  setLoading: (isLoading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start as loading until we check auth

  setUser: (user) =>
    set({
      user,
      isAuthenticated: user !== null,
      isLoading: false,
    }),

  setLoading: (isLoading) => set({ isLoading }),

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    }),
}))
