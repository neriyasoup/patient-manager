import { create } from 'zustand'
import {
  onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, GoogleAuthProvider,
} from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import { useUIStore } from './useUIStore'

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

// Popup errors that mean the popup never delivered a result (in some Chrome
// setups the popup always ends this way), so we fall back to a full-page redirect
const POPUP_FAILED = new Set(['auth/popup-closed-by-user', 'auth/popup-blocked', 'auth/cancelled-popup-request'])

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,
  authError: '',
  googleToken: initialToken,
  googleTokenExpiry: initialExpiry,

  _saveCredential(result) {
    const credential = result && GoogleAuthProvider.credentialFromResult(result)
    if (!credential?.accessToken) return null
    const token = credential.accessToken
    const expiry = Date.now() + 3500 * 1000 // 58 minutes buffer
    localStorage.setItem('google_access_token', token)
    localStorage.setItem('google_token_expiry', expiry.toString())
    set({ googleToken: token, googleTokenExpiry: expiry })
    return token
  },

  init() {
    // Coming back from Google's sign-in page: pick up the Calendar/Gmail token
    getRedirectResult(auth)
      .then(result => get()._saveCredential(result))
      .catch(err => {
        console.error('Redirect sign-in failed:', err)
        set({ authError: err?.code ?? 'unknown' })
      })
    onAuthStateChanged(auth, (user) => {
      set({ user, loading: false })
    })
  },

  // Sign-in goes through a full-page redirect to Google and back (no popup window)
  async login() {
    set({ authError: '' })
    await signInWithRedirect(auth, googleProvider)
  },

  // Renews the Google token (Calendar / Gmail) while signed in. Tries a popup so
  // open tabs keep their state; if the popup can't deliver, offers a redirect.
  async refreshGoogleToken() {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      return get()._saveCredential(result)
    } catch (err) {
      if (!POPUP_FAILED.has(err?.code)) {
        console.error('Failed to refresh Google token:', err)
        throw err
      }
      const editing = Object.values(useUIStore.getState().editingForms).some(f => Object.keys(f).length > 0)
      const msg = 'חלון ההתחברות של Google נסגר. לעבור לדף ההתחברות של Google? הדף ייטען מחדש.'
        + (editing ? '\n\nשימי לב: יש טיפול פתוח לעריכה שלא נשמר – הוא יימחק.' : '')
      if (window.confirm(msg)) {
        await signInWithRedirect(auth, googleProvider)
      }
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
