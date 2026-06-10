import { create } from 'zustand'
import { onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'

const getStoredToken = () => {
  const token = localStorage.getItem('google_access_token')
  const expiry = localStorage.getItem('google_token_expiry')
  if (!token || !expiry) return { token: null, expiry: null }
  const expiryTime = parseInt(expiry, 10)
  if (Date.now() >= expiryTime) {
    localStorage.removeItem('google_access_token')
    localStorage.removeItem('google_token_expiry')
    return { token: null, expiry: null }
  }
  return { token, expiry: expiryTime }
}

const { token: initialToken, expiry: initialExpiry } = getStoredToken()

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  googleToken: initialToken,
  googleTokenExpiry: initialExpiry,

  init() {
    onAuthStateChanged(auth, (user) => {
      set({ user, loading: false })
    })
  },

  async login() {
    const result = await signInWithPopup(auth, googleProvider)
    const credential = GoogleAuthProvider.credentialFromResult(result)
    if (credential) {
      const token = credential.accessToken
      const expiry = Date.now() + 3500 * 1000 // 58 minutes buffer
      localStorage.setItem('google_access_token', token)
      localStorage.setItem('google_token_expiry', expiry.toString())
      set({ googleToken: token, googleTokenExpiry: expiry })
    }
  },

  async refreshGoogleToken() {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const credential = GoogleAuthProvider.credentialFromResult(result)
      if (credential) {
        const token = credential.accessToken
        const expiry = Date.now() + 3500 * 1000
        localStorage.setItem('google_access_token', token)
        localStorage.setItem('google_token_expiry', expiry.toString())
        set({ googleToken: token, googleTokenExpiry: expiry })
        return token
      }
      return null
    } catch (err) {
      console.error('Failed to refresh Google token:', err)
      throw err
    }
  },

  async logout() {
    localStorage.removeItem('google_access_token')
    localStorage.removeItem('google_token_expiry')
    set({ googleToken: null, googleTokenExpiry: null })
    await signOut(auth)
  },
}))

