import { useState, useEffect } from 'react'
import { useCalendarStore } from '../../store/useCalendarStore'
import { useAuthStore } from '../../store/useAuthStore'
import { usePatientStore } from '../../store/usePatientStore'
import { useUIStore } from '../../store/useUIStore'
import NewPatientModal from '../patient/NewPatientModal'
import Button from '../ui/Button'

// SVG Icons
const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
)

const WhatsAppIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.498 1.45 5.441 1.451 5.378 0 9.754-4.373 9.757-9.749.002-2.605-1.01-5.053-2.853-6.896C17.1 2.118 14.654.99 12.01.99 6.63.99 2.256 5.36 2.253 10.738c-.002 1.83.479 3.619 1.393 5.205L2.64 21.32l5.44-1.426c1.547.844 3.284 1.288 5.047 1.289h.005zm10.278-7.39c-.28-.14-1.65-.81-1.905-.9-.255-.09-.44-.14-.625.14-.185.28-.71.9-.87 1.08-.16.18-.32.2-.6.06-1.532-.764-2.67-1.325-3.72-3.136-.28-.48.28-.445.8-.148.167.095.32.22.42.36.14.24.07.45-.035.56-.1.11-.625.87-.765 1.01-.14.14-.28.14-.56 0-.28-.14-1.18-.435-2.25-1.39-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.015-.43.125-.57.127-.126.28-.328.42-.492.14-.164.185-.28.28-.465.09-.185.045-.347-.02-.49-.065-.14-.625-1.505-.855-2.06-.225-.54-.475-.465-.625-.473-.135-.007-.29-.007-.445-.007-.155 0-.41.06-.625.295-.215.23-.82.8-.82 1.95s.84 2.26.955 2.42c.115.16 1.65 2.52 3.997 3.53.56.24.995.38 1.336.49.562.18 1.074.154 1.478.094.45-.067 1.378-.562 1.572-1.078.195-.515.195-.957.135-1.05-.06-.09-.22-.14-.5-.28z"/>
  </svg>
)

const SmsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
)

// Helper functions for timing and cleanup
const formatEventTime = (dateTimeStr) => {
  if (!dateTimeStr) return ''
  const date = new Date(dateTimeStr)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

const getDurationMinutes = (startStr, endStr) => {
  if (!startStr || !endStr) return 0
  const start = new Date(startStr)
  const end = new Date(endStr)
  return Math.round((end - start) / 60000)
}

const cleanPhoneForWa = (phone) => {
  if (!phone) return ''
  let cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('05')) {
    cleaned = '972' + cleaned.slice(1)
  }
  return cleaned
}

const formatHebrewDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(`${dateStr}T12:00:00`)
  return date.toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

// Matching Algorithm
const matchPatient = (eventTitle, patients) => {
  if (!eventTitle) return null
  const titleClean = eventTitle.toLowerCase().trim()

  for (const patient of patients) {
    const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase().trim()
    const reversedName = `${patient.lastName} ${patient.firstName}`.toLowerCase().trim()

    if (titleClean === fullName || titleClean === reversedName) {
      return patient
    }
  }

  for (const patient of patients) {
    const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase().trim()
    if (titleClean.includes(fullName) && fullName.length > 3) {
      return patient
    }
  }

  const words = titleClean.split(/[\s\-.,]+/)
  for (const patient of patients) {
    const firstName = patient.firstName.toLowerCase().trim()
    const lastName = patient.lastName.toLowerCase().trim()
    if (firstName.length > 1 && lastName.length > 1) {
      if (words.includes(firstName) && words.includes(lastName)) {
        return patient
      }
    }
  }

  return null
}

const parseEventName = (summary) => {
  if (!summary) return { firstName: '', lastName: '' }
  // Remove numbers, times, and common terms
  let clean = summary.replace(/[-\d]/g, '').trim()
  clean = clean.replace(/\b(דיקור|טיקור|טיפול|אבחון|פגישה|חוזר|ראשון|סשן|קליניקה|מפגש)\b/gi, '').trim()
  
  const parts = clean.split(/\s+/)
  if (parts.length >= 2) {
    return {
      firstName: parts[0],
      lastName: parts.slice(1).join(' '),
    }
  } else if (parts.length === 1) {
    return {
      firstName: parts[0],
      lastName: '',
    }
  }
  return { firstName: '', lastName: '' }
}

export default function CalendarDashboard() {
  const googleToken = useAuthStore(s => s.googleToken)
  const refreshGoogleToken = useAuthStore(s => s.refreshGoogleToken)
  
  const selectedDate = useCalendarStore(s => s.selectedDate)
  const setSelectedDate = useCalendarStore(s => s.setSelectedDate)
  const events = useCalendarStore(s => s.events)
  const loading = useCalendarStore(s => s.loading)
  const error = useCalendarStore(s => s.error)
  const fetchEvents = useCalendarStore(s => s.fetchEvents)

  const patients = usePatientStore(s => s.patients)
  const selectPatient = useUIStore(s => s.selectPatient)

  const [newPatientOpen, setNewPatientOpen] = useState(false)
  const [prefilledData, setPrefilledData] = useState(null)

  useEffect(() => {
    if (googleToken) {
      fetchEvents(googleToken)
    }
  }, [googleToken, selectedDate, fetchEvents])

  const handleConnect = async () => {
    try {
      await refreshGoogleToken()
    } catch (err) {
      console.error('Connection failed:', err)
    }
  }

  const changeDate = (days) => {
    const current = new Date(`${selectedDate}T12:00:00`)
    current.setDate(current.getDate() + days)
    const year = current.getFullYear()
    const month = String(current.getMonth() + 1).padStart(2, '0')
    const day = String(current.getDate()).padStart(2, '0')
    setSelectedDate(`${year}-${month}-${day}`)
  }

  const handleCreatePatient = (eventSummary) => {
    const names = parseEventName(eventSummary)
    setPrefilledData(names)
    setNewPatientOpen(true)
  }

  const renderContent = () => {
    if (!googleToken) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-slate-50 rounded-2xl border border-slate-200 shadow-sm max-w-lg mx-auto mt-8">
          <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center text-3xl mb-4">
            📅
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">חיבור יומן גוגל</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-xs leading-relaxed">
            חבר את יומן גוגל שלך על מנת לצפות בפגישות היומיות, לזהות מטופלים רשומים ולראות את סטטוס התשלומים שלהם ישירות בדף הבית.
          </p>
          <Button onClick={handleConnect} variant="primary" size="md" className="px-6 py-2 bg-teal-600 hover:bg-teal-700">
            התחבר עם Google Calendar
          </Button>
        </div>
      )
    }

    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
          <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium mt-1">טוען פגישות...</span>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-red-50 rounded-2xl border border-red-200 max-w-lg mx-auto mt-8">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-2xl mb-3">
            ⚠️
          </div>
          <h3 className="text-lg font-bold text-red-800 mb-1">שגיאה בטעינת היומן</h3>
          <p className="text-sm text-red-600 mb-4 max-w-xs leading-relaxed">
            {error === 'UNAUTHORIZED' ? 'חיבור הפג תוקף או שאינך מורשה לגשת ליומן.' : error}
          </p>
          <Button onClick={handleConnect} variant="primary" size="sm" className="bg-red-600 hover:bg-red-700 border-red-600 text-white">
            התחבר מחדש
          </Button>
        </div>
      )
    }

    if (events.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-slate-50 rounded-2xl border border-slate-200/60 max-w-md mx-auto mt-8">
          <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center text-2xl mb-3">
            🌿
          </div>
          <h3 className="text-base font-bold text-slate-700 mb-1">אין פגישות מתוזמנות</h3>
          <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
            לא נמצאו פגישות ביומן עבור תאריך זה.
          </p>
        </div>
      )
    }

    return (
      <div className="flex flex-col gap-4 mt-6 max-w-3xl mx-auto">
        {events.map((event) => {
          const matched = matchPatient(event.summary, patients)
          const allDay = !event.start?.dateTime
          const startTime = allDay ? '' : formatEventTime(event.start.dateTime)
          const endTime = allDay ? '' : formatEventTime(event.end.dateTime)
          const duration = allDay ? 0 : getDurationMinutes(event.start.dateTime, event.end.dateTime)

          return (
            <div key={event.id} className="flex bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
              {/* Timeline Time Badge */}
              <div className="bg-teal-600 text-white p-4 flex flex-col items-center justify-center min-w-[110px] shrink-0 text-center gap-1">
                <ClockIcon />
                {allDay ? (
                  <span className="text-sm font-bold">יום שלם</span>
                ) : (
                  <>
                    <span className="text-sm font-bold tracking-wider">{startTime} - {endTime}</span>
                    <span className="text-[10px] text-teal-100">{duration} דק'</span>
                  </>
                )}
              </div>

              {/* Event Details Content */}
              <div className="flex-1 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1.5 text-right">
                  {matched ? (
                    <>
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => selectPatient(matched.id)}
                          className="text-lg font-bold text-teal-800 hover:text-teal-900 hover:underline cursor-pointer focus:outline-none"
                        >
                          {matched.firstName} {matched.lastName}
                        </button>
                        <span className="bg-teal-50 text-teal-700 border border-teal-100 rounded-full px-2 py-0.5 text-[10px] font-semibold">
                          מטופל רשום
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-500 items-center">
                        {matched.phone && (
                          <span className="flex items-center gap-1">
                            <PhoneIcon />
                            {matched.phone}
                          </span>
                        )}
                        {matched.balance && Number(matched.balance) > 0 && (
                          <span className="text-red-600 font-semibold bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                            💰 חוב: {matched.balance} ₪
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-lg font-bold text-slate-800">
                          {event.summary || '(ללא כותרת)'}
                        </h4>
                        <span className="bg-slate-100 text-slate-600 border border-slate-200 rounded-full px-2 py-0.5 text-[10px] font-medium">
                          לא משויך
                        </span>
                      </div>
                      {event.description && (
                        <p className="text-xs text-slate-400 line-clamp-1 max-w-md">
                          {event.description}
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Quick Action Buttons */}
                <div className="flex gap-2 shrink-0 items-center">
                  {matched ? (
                    <>
                      {matched.phone && (
                        <>
                          <a
                            href={`https://wa.me/${cleanPhoneForWa(matched.phone)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 bg-green-50 hover:bg-green-100 text-green-700 font-semibold py-1 px-3 border border-green-200 rounded-lg text-xs transition-colors shadow-sm"
                          >
                            <WhatsAppIcon />
                            <span>WhatsApp</span>
                          </a>
                          <a
                            href={`sms:${matched.phone}`}
                            className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-1 px-3 border border-blue-200 rounded-lg text-xs transition-colors shadow-sm"
                          >
                            <SmsIcon />
                            <span>SMS</span>
                          </a>
                        </>
                      )}
                    </>
                  ) : (
                    <Button
                      onClick={() => handleCreatePatient(event.summary)}
                      variant="secondary"
                      size="sm"
                      className="text-teal-700 hover:bg-teal-50 border-teal-200 flex items-center gap-1 font-semibold"
                    >
                      + צור מטופל
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex-1 bg-slate-50/50 p-6 overflow-y-auto w-full" dir="rtl">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        
        {/* Header Section */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📅</span>
            <div>
              <h2 className="text-xl font-extrabold text-slate-800">לוח פגישות יומי</h2>
              <p className="text-xs text-slate-500 mt-0.5">{formatHebrewDate(selectedDate)}</p>
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="text-slate-600 border-slate-300 hover:bg-slate-50"
            >
              היום
            </Button>
            <div className="flex items-center rounded-lg border border-slate-300 overflow-hidden bg-white shadow-sm">
              <button
                onClick={() => changeDate(-1)}
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border-l border-slate-300 font-bold text-sm focus:outline-none transition-colors"
                title="יום קודם"
              >
                ◀ יום קודם
              </button>
              <button
                onClick={() => changeDate(1)}
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-sm focus:outline-none transition-colors"
                title="יום הבא"
              >
                יום הבא ▶
              </button>
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
            />
          </div>
        </div>

        {/* Calendar Content */}
        {renderContent()}

      </div>

      <NewPatientModal
        open={newPatientOpen}
        onClose={() => {
          setNewPatientOpen(false)
          setPrefilledData(null)
        }}
        initialData={prefilledData}
      />
    </div>
  )
}
