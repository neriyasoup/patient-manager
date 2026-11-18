import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

// On the live site, sign-in runs on the site's own domain: the Firebase auth
// helper is self-hosted at https://neriyasoup.github.io/__/auth/ (repo
// neriyasoup/neriyasoup.github.io). Chrome partitions third-party storage, which
// breaks the popup when authDomain is *.firebaseapp.com.
const SELF_HOSTED_AUTH_DOMAIN = 'neriyasoup.github.io'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: window.location.hostname === SELF_HOSTED_AUTH_DOMAIN
    ? SELF_HOSTED_AUTH_DOMAIN
    : import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)
export const googleProvider = new GoogleAuthProvider()
googleProvider.addScope('https://www.googleapis.com/auth/calendar')
googleProvider.addScope('https://www.googleapis.com/auth/calendar.events')
// Used by the billing module to email invoices and receipts
googleProvider.addScope('https://www.googleapis.com/auth/gmail.send')

