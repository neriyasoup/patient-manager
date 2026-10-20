import { useState, useEffect } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../../firebase'
import { useCalendarStore } from '../../store/useCalendarStore'
import { useAuthStore } from '../../store/useAuthStore'
import { usePatientStore } from '../../store/usePatientStore'
import { useUIStore } from '../../store/useUIStore'
import { searchPatients } from '../../utils/searchIndex'
import NewPatientModal from '../patient/NewPatientModal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Modal from '../ui/Modal'

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

const DEFAULT_WA_TEMPLATE = 'היי {name}, תזכורת לטיפול שנקבע לנו בתאריך {date} בשעה {time}. אשמח לאישור הגעה 🙏'

const formatShortDate = (dateStr) => {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }
  return dateStr
}

const buildWaReminderUrl = (phone, template, { name, date, time }) => {
  const cleaned = cleanPhoneForWa(phone)
  if (!cleaned) return '#'
  const msg = (template || DEFAULT_WA_TEMPLATE)
    .replace(/\{name\}/g, name || '')
    .replace(/\{date\}/g, date || '')
    .replace(/\{time\}/g, time || '')
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(msg)}`
}

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

const monthNames = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
]

const getMonthDays = (dateObj) => {
  const year = dateObj.getFullYear()
  const month = dateObj.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const startDayOfWeek = firstDay.getDay()
  
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const prevMonthDays = new Date(year, month, 0).getDate()
  
  const grid = []
  
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthDays - i
    const prevMonth = month === 0 ? 12 : month
    const prevYear = month === 0 ? year - 1 : year
    grid.push({
      day: d,
      isCurrentMonth: false,
      dateStr: `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    })
  }
  
  for (let d = 1; d <= daysInMonth; d++) {
    grid.push({
      day: d,
      isCurrentMonth: true,
      dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    })
  }
  
  const totalCells = 42
  const remaining = totalCells - grid.length
  for (let d = 1; d <= remaining; d++) {
    const nextMonth = month === 11 ? 1 : month + 2
    const nextYear = month === 11 ? year + 1 : year
    grid.push({
      day: d,
      isCurrentMonth: false,
      dateStr: `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    })
  }
  
  return grid
}

export default function CalendarDashboard() {
  const user = useAuthStore(s => s.user)
  const uid = user?.uid
  const googleToken = useAuthStore(s => s.googleToken)
  const refreshGoogleToken = useAuthStore(s => s.refreshGoogleToken)
  
  const selectedDate = useCalendarStore(s => s.selectedDate)
  const setSelectedDate = useCalendarStore(s => s.setSelectedDate)
  const events = useCalendarStore(s => s.events)
  const loading = useCalendarStore(s => s.loading)
  const error = useCalendarStore(s => s.error)
  const fetchEvents = useCalendarStore(s => s.fetchEvents)
  const createEvent = useCalendarStore(s => s.createEvent)
  const matches = useCalendarStore(s => s.matches)
  const matchEvent = useCalendarStore(s => s.matchEvent)

  const patients = usePatientStore(s => s.patients)
  const selectPatient = useUIStore(s => s.selectPatient)

  // View Mode: 'daily' | 'gcal'
  const [calendarViewMode, setCalendarViewMode] = useState('daily')
  const [gcalEmbedMode, setGcalEmbedMode] = useState('WEEK') // 'WEEK' | 'MONTH' | 'AGENDA'

  const [newPatientOpen, setNewPatientOpen] = useState(false)
  const [prefilledData, setPrefilledData] = useState(null)

  // Add Treatment / Appointment Modal State
  const [addEventOpen, setAddEventOpen] = useState(false)
  const [addEventPatientQuery, setAddEventPatientQuery] = useState('')
  const [addEventPatientId, setAddEventPatientId] = useState('')
  const [addEventCustomTitle, setAddEventCustomTitle] = useState('')
  const [addEventDate, setAddEventDate] = useState(selectedDate)
  const [addEventStartTime, setAddEventStartTime] = useState('10:00')
  const [addEventEndTime, setAddEventEndTime] = useState('11:00')
  const [addEventNotes, setAddEventNotes] = useState('')
  const [addEventCreateTreatment, setAddEventCreateTreatment] = useState(true)
  const [addEventUseSubCal, setAddEventUseSubCal] = useState(false)
  const [addEventLoading, setAddEventLoading] = useState(false)
  const [addEventError, setAddEventError] = useState('')

  // WhatsApp Reminders Modal State
  const [waModalOpen, setWaModalOpen] = useState(false)
  const [waTemplate, setWaTemplate] = useState(() =>
    localStorage.getItem('wa_reminder_template') || DEFAULT_WA_TEMPLATE
  )

  function handleWaTemplateChange(val) {
    setWaTemplate(val)
    localStorage.setItem('wa_reminder_template', val)
  }

  // Match Modal State
  const [matchModalOpen, setMatchModalOpen] = useState(false)
  const [eventToMatch, setEventToMatch] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMatchPatientId, setSelectedMatchPatientId] = useState(null)
  const [savingMatch, setSavingMatch] = useState(false)

  const handleOpenMatchModal = (event) => {
    setEventToMatch(event)
    const parsed = parseEventName(event.summary)
    setSearchQuery(parsed.firstName || '')
    setSelectedMatchPatientId(null)
    setMatchModalOpen(true)
  }

  const handleSaveMatch = async () => {
    if (!uid || !eventToMatch || !selectedMatchPatientId) return
    setSavingMatch(true)
    try {
      await matchEvent(uid, eventToMatch.id, selectedMatchPatientId)
      setMatchModalOpen(false)
      setEventToMatch(null)
      setSelectedMatchPatientId(null)
    } catch (err) {
      console.error('Failed to save manual match:', err)
    } finally {
      setSavingMatch(false)
    }
  }

  const handleOpenAddEvent = () => {
    setAddEventDate(selectedDate)
    setAddEventStartTime('10:00')
    setAddEventEndTime('11:00')
    setAddEventPatientQuery('')
    setAddEventPatientId('')
    setAddEventCustomTitle('')
    setAddEventNotes('')
    setAddEventCreateTreatment(true)
    setAddEventError('')
    setAddEventOpen(true)
  }

  const handleStartTimeChange = (newStart) => {
    setAddEventStartTime(newStart)
    if (/^\d{2}:\d{2}$/.test(newStart)) {
      const [h, m] = newStart.split(':').map(Number)
      const endH = String((h + 1) % 24).padStart(2, '0')
      setAddEventEndTime(`${endH}:${String(m).padStart(2, '0')}`)
    }
  }

  const handleSaveNewEvent = async () => {
    const chosenPatient = patients.find(p => p.id === addEventPatientId)
    const summary = chosenPatient
      ? `${chosenPatient.firstName} ${chosenPatient.lastName}`
      : addEventCustomTitle.trim()

    if (!summary) {
      setAddEventError('בחר מטופל מהרשימה או הקלד כותרת לפגישה')
      return
    }
    if (!addEventDate || !addEventStartTime || !addEventEndTime) {
      setAddEventError('נא למלא תאריך, שעת התחלה ושעת סיום')
      return
    }

    setAddEventLoading(true)
    setAddEventError('')
    try {
      let token = googleToken
      if (!token) {
        token = await refreshGoogleToken()
      }
      const created = await createEvent(token, {
        summary,
        description: addEventNotes,
        date: addEventDate,
        startTime: addEventStartTime,
        endTime: addEventEndTime,
        useSubCalendar: addEventUseSubCal,
      })

      if (chosenPatient && uid) {
        if (created?.id) {
          await matchEvent(uid, created.id, chosenPatient.id)
        }
        if (addEventCreateTreatment) {
          const treatmentId = uuidv4()
          const now = new Date().toISOString()
          await setDoc(doc(db, `users/${uid}/patients/${chosenPatient.id}/treatments/${treatmentId}`), {
            id: treatmentId,
            patientId: chosenPatient.id,
            date: addEventDate,
            time: addEventStartTime,
            notes: addEventNotes || '',
            mainComplaint: '',
            secondaryComplaint: '',
            selectedPoints: '',
            files: [],
            isInfo: false,
            createdAt: now,
            updatedAt: now,
          })
        }
      }

      setSelectedDate(addEventDate)
      setAddEventOpen(false)
    } catch (err) {
      setAddEventError(err.message || 'שגיאה בשמירת האירוע ביומן גוגל')
    } finally {
      setAddEventLoading(false)
    }
  }

  const filteredPatients = searchQuery.trim() === ''
    ? patients
    : searchPatients(patients, searchQuery)

  const addEventFilteredPatients = addEventPatientQuery.trim() === ''
    ? patients
    : searchPatients(patients, addEventPatientQuery)

  const [viewDate, setViewDate] = useState(() => new Date(`${selectedDate}T12:00:00`))

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setViewDate(new Date(`${selectedDate}T12:00:00`))
  }, [selectedDate])

  const viewMonthLabel = `${monthNames[viewDate.getMonth()]} ${viewDate.getFullYear()}`

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

  const matchedAppointmentsToday = events
    .map(event => {
      const matched = matches[event.id]
        ? patients.find(p => p.id === matches[event.id])
        : matchPatient(event.summary, patients)
      if (!matched || !matched.phone) return null
      const allDay = !event.start?.dateTime
      const startTime = allDay ? '' : formatEventTime(event.start.dateTime)
      return { event, patient: matched, startTime }
    })
    .filter(Boolean)

  const renderContent = () => {
    if (!googleToken) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-slate-50 rounded-2xl border border-slate-200 shadow-sm max-w-lg mx-auto mt-8">
          <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center text-3xl mb-4">
            📅
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">חיבור יומן גוגל</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-xs leading-relaxed">
            חבר את יומן גוגל שלך על מנת לצפות בפגישות היומיות, להוסיף טיפולים ישירות ליומן גוגל ולשלוח תזכורות WhatsApp למטופלים.
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
          <p className="text-sm text-slate-400 max-w-xs leading-relaxed mb-4">
            לא נמצאו פגישות ביומן עבור תאריך זה.
          </p>
          <Button onClick={handleOpenAddEvent} size="sm">
            + הוסף טיפול ליומן גוגל
          </Button>
        </div>
      )
    }

    return (
      <div className="flex flex-col gap-4 mt-2 max-w-3xl mx-auto">
        {events.map((event) => {
          const matched = matches[event.id]
            ? patients.find(p => p.id === matches[event.id])
            : matchPatient(event.summary, patients)
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
                        <button
                          onClick={() => handleOpenMatchModal(event)}
                          className="text-[10px] text-teal-600 hover:text-teal-700 font-semibold focus:outline-none cursor-pointer flex items-center gap-0.5"
                          title="שייך פגישה זו למטופל קיים במערכת"
                        >
                          🔗 שייך למטופל
                        </button>
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
                <div className="flex gap-2 shrink-0 items-center flex-wrap">
                  {matched ? (
                    <>
                      {matched.phone && (
                        <>
                          <a
                            href={buildWaReminderUrl(matched.phone, waTemplate, {
                              name: matched.firstName,
                              date: formatShortDate(selectedDate),
                              time: startTime || 'הנקבעת',
                            })}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 bg-green-50 hover:bg-green-100 text-green-700 font-semibold py-1 px-3 border border-green-200 rounded-lg text-xs transition-colors shadow-sm"
                            title="שלח תזכורת מתוזמנת ב-WhatsApp"
                          >
                            <WhatsAppIcon />
                            <span>תזכורת WhatsApp</span>
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

  const gcalDatesParam = selectedDate.replace(/-/g, '')
  const gcalEmbedUrl = user?.email
    ? `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(user.email)}&ctz=Asia/Jerusalem&mode=${gcalEmbedMode}&dates=${gcalDatesParam}/${gcalDatesParam}&hl=iw&showTitle=0&showPrint=0&showCalendars=1`
    : null

  return (
    <div className="flex-1 bg-slate-50/50 p-6 overflow-y-auto w-full" dir="rtl">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        
        {/* Header Section */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📅</span>
              <div>
                <h2 className="text-xl font-extrabold text-slate-800">יומן פגישות וטיפולים</h2>
                <p className="text-xs text-slate-500 mt-0.5">{formatHebrewDate(selectedDate)}</p>
              </div>
            </div>

            {/* Action Buttons: Add Treatment to Google Calendar, WhatsApp Reminders, View Toggle */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                size="sm"
                onClick={handleOpenAddEvent}
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-xs"
              >
                + הוסף טיפול ליומן גוגל
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setWaModalOpen(true)}
                className="border-green-300 bg-green-50 text-green-800 hover:bg-green-100 font-semibold"
              >
                <WhatsAppIcon />
                <span>תזכורות WhatsApp ({matchedAppointmentsToday.length})</span>
              </Button>
              <div className="flex items-center rounded-lg border border-slate-300 overflow-hidden bg-slate-100 p-0.5 text-xs font-semibold">
                <button
                  onClick={() => setCalendarViewMode('daily')}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                    calendarViewMode === 'daily'
                      ? 'bg-white text-teal-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  📋 תצוגת פגישות
                </button>
                <button
                  onClick={() => setCalendarViewMode('gcal')}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                    calendarViewMode === 'gcal'
                      ? 'bg-white text-teal-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  📆 יומן גוגל מלא
                </button>
              </div>
            </div>
          </div>
          
          {/* Date Navigation Bar */}
          <div className="flex items-center justify-between gap-2 flex-wrap border-t border-slate-100 pt-3">
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
                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border-l border-slate-300 font-bold text-sm focus:outline-none transition-colors cursor-pointer"
                  title="יום קודם"
                >
                  ▶ יום קודם
                </button>
                <button
                  onClick={() => changeDate(1)}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-sm focus:outline-none transition-colors cursor-pointer"
                  title="יום הבא"
                >
                  יום הבא ◀
                </button>
              </div>
              <div className="w-40">
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                />
              </div>
            </div>

            {calendarViewMode === 'gcal' && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500">תצוגה:</span>
                {[
                  { key: 'WEEK', label: 'שבוע' },
                  { key: 'MONTH', label: 'חודש' },
                  { key: 'AGENDA', label: 'לו"ז' },
                ].map(m => (
                  <button
                    key={m.key}
                    onClick={() => setGcalEmbedMode(m.key)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                      gcalEmbedMode === m.key
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
                <a
                  href="https://calendar.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-teal-700 hover:underline mr-2 font-medium"
                >
                  פתח ב-Google Calendar ↗
                </a>
              </div>
            )}
          </div>
        </div>

        {calendarViewMode === 'gcal' ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            {gcalEmbedUrl ? (
              <iframe
                key={`${gcalEmbedMode}-${selectedDate}`}
                src={gcalEmbedUrl}
                title="Google Calendar"
                className="w-full h-[680px] border-0"
              />
            ) : (
              <div className="p-12 text-center text-sm text-slate-500">
                התחבר עם חשבון Google כדי להציג את יומן גוגל.
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Right column: Clickable Month Calendar */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm w-full lg:w-[310px] shrink-0 self-start flex flex-col gap-4">
              {/* Calendar Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <button
                  onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
                  className="px-2 py-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors focus:outline-none cursor-pointer text-xs font-bold flex items-center gap-1"
                  title="חודש קודם"
                >
                  <span>▶</span>
                  <span>אחורה</span>
                </button>
                <span className="font-extrabold text-slate-800 text-sm">{viewMonthLabel}</span>
                <button
                  onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
                  className="px-2 py-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors focus:outline-none cursor-pointer text-xs font-bold flex items-center gap-1"
                  title="חודש הבא"
                >
                  <span>קדימה</span>
                  <span>◀</span>
                </button>
              </div>

              {/* Days of Week Header */}
              <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400">
                <div>א'</div>
                <div>ב'</div>
                <div>ג'</div>
                <div>ד'</div>
                <div>ה'</div>
                <div>ו'</div>
                <div>ש'</div>
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-y-1.5 justify-items-center">
                {getMonthDays(viewDate).map((cell, idx) => {
                  const isSelected = cell.dateStr === selectedDate
                  const isCurrentMonth = cell.isCurrentMonth
                  const todayStr = new Date().toISOString().split('T')[0]
                  const isToday = cell.dateStr === todayStr

                  return (
                    <button
                      key={`${cell.dateStr}-${idx}`}
                      onClick={() => setSelectedDate(cell.dateStr)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all focus:outline-none cursor-pointer ${
                        isSelected
                          ? 'bg-teal-600 text-white shadow-sm hover:bg-teal-700 scale-105'
                          : isToday
                          ? 'border border-teal-500 text-teal-600 hover:bg-teal-50 font-bold'
                          : isCurrentMonth
                          ? 'text-slate-700 hover:bg-slate-100'
                          : 'text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {cell.day}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Left column: Daily Appointments Timeline */}
            <div className="flex-1 min-w-0">
              {renderContent()}
            </div>
          </div>
        )}

      </div>

      <NewPatientModal
        open={newPatientOpen}
        onClose={() => {
          setNewPatientOpen(false)
          setPrefilledData(null)
        }}
        initialData={prefilledData}
      />

      {/* Add Treatment / Appointment to Google Calendar Modal */}
      <Modal
        open={addEventOpen}
        onClose={() => setAddEventOpen(false)}
        title="הוספת טיפול ליומן גוגל"
        maxWidth="max-w-md"
      >
        <div className="flex flex-col gap-3 text-right" dir="rtl">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">בחר מטופל רשום:</label>
            <input
              type="text"
              value={addEventPatientQuery}
              onChange={e => setAddEventPatientQuery(e.target.value)}
              placeholder="הקלד שם מטופל לחיפוש..."
              className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white mb-1.5"
            />
            <div className="border border-slate-200 rounded-lg max-h-36 overflow-y-auto divide-y divide-slate-100 bg-white">
              {addEventFilteredPatients.slice(0, 20).map(p => {
                const isSelected = addEventPatientId === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setAddEventPatientId(isSelected ? '' : p.id)
                    }}
                    className={`w-full text-right px-3 py-1.5 text-xs flex items-center justify-between cursor-pointer ${
                      isSelected ? 'bg-teal-50 text-teal-800 font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>{p.firstName} {p.lastName} {p.phone ? `(${p.phone})` : ''}</span>
                    {isSelected && <span className="text-teal-600 font-bold">✓</span>}
                  </button>
                )
              })}
            </div>
          </div>

          {!addEventPatientId && (
            <Input
              label="או כותרת חופשית לאירוע (אם המטופל טרם רשום)"
              placeholder="למשל: יעל כהן - דיקור"
              value={addEventCustomTitle}
              onChange={e => setAddEventCustomTitle(e.target.value)}
            />
          )}

          <div className="grid grid-cols-3 gap-2">
            <Input
              label="תאריך"
              type="date"
              value={addEventDate}
              onChange={e => setAddEventDate(e.target.value)}
            />
            <Input
              label="שעת התחלה"
              type="time"
              value={addEventStartTime}
              onChange={e => handleStartTimeChange(e.target.value)}
            />
            <Input
              label="שעת סיום"
              type="time"
              value={addEventEndTime}
              onChange={e => setAddEventEndTime(e.target.value)}
            />
          </div>

          <Input
            label="הערות לפגישה / לטיפול"
            placeholder="הערות שיופיעו ביומן ובתיק המטופל..."
            value={addEventNotes}
            onChange={e => setAddEventNotes(e.target.value)}
          />

          {addEventPatientId && (
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer bg-teal-50/60 border border-teal-200 rounded-lg p-2.5">
              <input
                type="checkbox"
                checked={addEventCreateTreatment}
                onChange={e => setAddEventCreateTreatment(e.target.checked)}
                className="rounded text-teal-600 focus:ring-teal-500"
              />
              <span className="font-medium">צור במקביל גם רשומת טיפול בתיק המטופל באתר</span>
            </label>
          )}

          <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={addEventUseSubCal}
              onChange={e => setAddEventUseSubCal(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500"
            />
            <span>רשום ביומן המשני ("נריה ועידו") במקום ביומן הראשי</span>
          </label>

          {addEventError && <p className="text-xs text-red-600">{addEventError}</p>}

          <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
            <Button variant="secondary" size="sm" onClick={() => setAddEventOpen(false)} disabled={addEventLoading}>
              ביטול
            </Button>
            <Button size="sm" onClick={handleSaveNewEvent} disabled={addEventLoading}>
              {addEventLoading ? 'שומר בגוגל...' : 'שמירה ביומן גוגל'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* WhatsApp Reminders Modal */}
      <Modal
        open={waModalOpen}
        onClose={() => setWaModalOpen(false)}
        title={`תזכורות WhatsApp למטופלים — ${formatShortDate(selectedDate)}`}
        maxWidth="max-w-lg"
      >
        <div className="flex flex-col gap-4 text-right" dir="rtl">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">
              תבנית הודעת התזכורת (משתנים אוטומטיים: {'{name}'}, {'{date}'}, {'{time}'}):
            </label>
            <textarea
              rows={3}
              value={waTemplate}
              onChange={e => handleWaTemplateChange(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-600">
              מטופלים משובצים ליום זה ({matchedAppointmentsToday.length}):
            </span>
            {matchedAppointmentsToday.length === 0 ? (
              <p className="text-xs text-slate-400 bg-slate-50 rounded-lg p-4 text-center border border-slate-100">
                אין פגישות משויכות למטופלים עם מספר טלפון בתאריך זה.
              </p>
            ) : (
              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                {matchedAppointmentsToday.map(({ event, patient: p, startTime }) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800">{p.firstName} {p.lastName}</span>
                      <span className="text-slate-400 mx-1.5">|</span>
                      <span className="text-teal-700 font-semibold">{startTime || 'יום שלם'}</span>
                      <span className="text-slate-400 mx-1.5">|</span>
                      <span className="text-slate-500">{p.phone}</span>
                    </div>
                    <a
                      href={buildWaReminderUrl(p.phone, waTemplate, {
                        name: p.firstName,
                        date: formatShortDate(selectedDate),
                        time: startTime || '',
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-1.5 px-3 rounded-lg text-xs transition-colors"
                    >
                      <WhatsAppIcon />
                      <span>שלח תזכורת</span>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <Button variant="secondary" size="sm" onClick={() => setWaModalOpen(false)}>
              סגור
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={matchModalOpen}
        onClose={() => {
          setMatchModalOpen(false)
          setEventToMatch(null)
          setSelectedMatchPatientId(null)
        }}
        title="שיוך פגישה למטופל קיים"
        maxWidth="max-w-md"
      >
        <div className="flex flex-col gap-4 text-right" dir="rtl">
          {eventToMatch && (
            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-1">פגישה שנבחרה:</span>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-bold text-slate-800">
                {eventToMatch.summary || '(ללא כותרת)'}
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">חפש מטופל מהרשימה:</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="הקלד שם או טלפון לחיפוש..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-500">בחר מטופל להתאמה:</span>
            <div className="border border-slate-200 rounded-lg max-h-48 overflow-y-auto divide-y divide-slate-100 bg-white shadow-inner">
              {filteredPatients.length === 0 ? (
                <div className="p-4 text-xs text-slate-400 text-center">לא נמצאו מטופלים תואמים</div>
              ) : (
                filteredPatients.map((p) => {
                  const isSelected = selectedMatchPatientId === p.id
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedMatchPatientId(p.id)}
                      className={`w-full text-right px-3 py-2 text-xs transition-colors flex items-center justify-between focus:outline-none ${
                        isSelected
                          ? 'bg-teal-50 text-teal-800 font-bold border-r-4 border-teal-600'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <span className="font-semibold block">{p.firstName} {p.lastName}</span>
                        {p.phone && <span className="text-[10px] text-slate-400">📞 {p.phone}</span>}
                      </div>
                      {isSelected && <span className="text-teal-600 font-bold">✓</span>}
                    </button>
                  )
                })
              )}
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2 border-t border-slate-100 mt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setMatchModalOpen(false)
                setEventToMatch(null)
                setSelectedMatchPatientId(null)
              }}
              disabled={savingMatch}
            >
              ביטול
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveMatch}
              disabled={!selectedMatchPatientId || savingMatch}
              className="bg-teal-600 hover:bg-teal-700 border-teal-600 text-white font-semibold"
            >
              {savingMatch ? 'משייך...' : 'שייך פגישה'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
