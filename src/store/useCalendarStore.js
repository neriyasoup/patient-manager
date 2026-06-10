import { create } from 'zustand'
import { useAuthStore } from './useAuthStore'

const getTodayStr = () => {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const useCalendarStore = create((set, get) => ({
  selectedDate: getTodayStr(),
  events: [],
  loading: false,
  error: null,

  setSelectedDate: (dateStr) => set({ selectedDate: dateStr }),

  async fetchEvents(token) {
    if (!token) {
      set({ events: [], error: 'No token' })
      return
    }
    const { selectedDate } = get()
    set({ loading: true, error: null })

    try {
      const start = new Date(`${selectedDate}T00:00:00`)
      const end = new Date(`${selectedDate}T23:59:59`)
      const timeMin = encodeURIComponent(start.toISOString())
      const timeMax = encodeURIComponent(end.toISOString())

      const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        let errorMsg = response.statusText
        try {
          const errData = await response.json()
          if (errData?.error?.message) {
            errorMsg = errData.error.message
          }
        } catch {
          // Ignore JSON parsing errors
        }

        if (response.status === 401) {
          throw new Error('UNAUTHORIZED')
        }
        throw new Error(`Google API error: ${errorMsg}`)
      }

      const data = await response.json()
      const items = data.items || []
      set({ events: items, loading: false })
    } catch (err) {
      console.error('Error fetching calendar events:', err)
      set({ error: err.message, loading: false })
      if (err.message === 'UNAUTHORIZED') {
        localStorage.removeItem('google_access_token')
        localStorage.removeItem('google_token_expiry')
        useAuthStore.setState({ googleToken: null, googleTokenExpiry: null })
      }
    }
  },
}))
