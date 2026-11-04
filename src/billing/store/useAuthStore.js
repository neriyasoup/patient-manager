import { useAuthStore as useClinicAuthStore } from '../../store/useAuthStore'

// The invoice code reads `accessToken`; in the clinic it is the Google token
// saved at sign-in (it also carries the Gmail send permission).
function pick(s) {
  const valid = s.googleToken && (!s.googleTokenExpiry || Date.now() < s.googleTokenExpiry)
  return {
    accessToken: valid ? s.googleToken : null,
    reconnect: s.refreshGoogleToken,
  }
}

export const useAuthStore = (selector) => useClinicAuthStore(s => selector(pick(s)))
useAuthStore.getState = () => pick(useClinicAuthStore.getState())
