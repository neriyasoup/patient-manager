import { create } from 'zustand'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,

  init() {
    onAuthStateChanged(auth, (user) => {
      set({ user, loading: false })
    })
  },

  async login() {
    await signInWithPopup(auth, googleProvider)
  },

  async logout() {
    await signOut(auth)
  },
}))
