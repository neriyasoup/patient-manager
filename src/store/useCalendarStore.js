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
  subCalendarId: null,

  setSelectedDate: (dateStr) => set({ selectedDate: dateStr }),

  async fetchSubCalendarId(token) {
    if (get().subCalendarId) return get().subCalendarId

    try {
      const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) return null
      const data = await response.json()
      const items = data.items || []
      const subCal = items.find(item => item.summary === 'נריה ועידו')
      if (subCal) {
        set({ subCalendarId: subCal.id })
        return subCal.id
      }
    } catch (err) {
      console.error('Error fetching calendar list:', err)
    }
    return null
  },

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

      // Fetch primary events
      const primaryUrl = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`

      const primaryRes = await fetch(primaryUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!primaryRes.ok) {
        let errorMsg = primaryRes.statusText
        try {
          const errData = await primaryRes.json()
          if (errData?.error?.message) {
            errorMsg = errData.error.message
          }
        } catch {
          // Ignore JSON parsing errors
        }

        if (primaryRes.status === 401) {
          throw new Error('UNAUTHORIZED')
        }
        throw new Error(`Google API error: ${errorMsg}`)
      }

      const primaryData = await primaryRes.json()
      let allEvents = primaryData.items || []

      // Fetch sub-calendar events (soft validation - doesn't block primary if fails)
      const subCalId = await get().fetchSubCalendarId(token)
      if (subCalId) {
        try {
          const subUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(subCalId)}/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`
          const subRes = await fetch(subUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          if (subRes.ok) {
            const subData = await subRes.json()
            if (subData.items) {
              allEvents = allEvents.concat(subData.items)
            }
          }
        } catch (subErr) {
          console.warn('Failed to fetch sub-calendar events:', subErr)
        }
      }

      // Deduplicate by event ID
      const uniqueEventsMap = new Map()
      allEvents.forEach(evt => {
        if (evt.id) uniqueEventsMap.set(evt.id, evt)
      })
      const dedupedEvents = Array.from(uniqueEventsMap.values())

      // Sort all events by start time
      dedupedEvents.sort((a, b) => {
        const aStart = a.start?.dateTime || a.start?.date || ''
        const bStart = b.start?.dateTime || b.start?.date || ''
        return aStart.localeCompare(bStart)
      })

      set({ events: dedupedEvents, loading: false })
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
