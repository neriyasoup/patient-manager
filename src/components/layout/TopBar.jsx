import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { useUIStore } from '../../store/useUIStore'
import GlobalSearchResults from '../search/GlobalSearchResults'
import Button from '../ui/Button'
import NewPatientModal from '../patient/NewPatientModal'

export default function TopBar() {
  const logout = useAuthStore(s => s.logout)
  const user = useAuthStore(s => s.user)
  const globalQuery = useUIStore(s => s.globalQuery)
  const setGlobalQuery = useUIStore(s => s.setGlobalQuery)
  const globalSearchType = useUIStore(s => s.globalSearchType)
  const setGlobalSearchType = useUIStore(s => s.setGlobalSearchType)
  const selectPatient = useUIStore(s => s.selectPatient)
  const [focused, setFocused] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  function handleSelect(id) {
    selectPatient(id)
    setGlobalQuery('')
    inputRef.current?.blur()
    navigate('/')
  }

  return (
    <div className="h-14 bg-teal-700 text-white flex items-center gap-4 px-4 shrink-0 relative z-40">
      <button
        onClick={() => {
          selectPatient(null)
          navigate('/')
        }}
        className="font-bold text-lg whitespace-nowrap hover:opacity-85 transition-opacity focus:outline-none cursor-pointer"
      >
        🌿 מרפאת דיקור
      </button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/patients')}
        className="text-white hover:bg-white/10"
      >
        👥 מטופלים
      </Button>

      <Button
        onClick={() => setShowNew(true)}
        size="sm"
        className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
      >
        + מטופל.ת חדש.ה
      </Button>

      <div className="flex-1 flex gap-2 items-center max-w-lg mx-auto">
        <select
          value={globalSearchType || 'patient'}
          onChange={e => setGlobalSearchType(e.target.value)}
          className="rounded-lg bg-white/20 text-white px-2 py-1.5 text-sm focus:outline-none focus:bg-white/30 border-0 cursor-pointer text-right min-w-[110px]"
        >
          <option value="patient" className="text-slate-800">מטופל</option>
          <option value="mainComplaint" className="text-slate-800">תלונה ראשית</option>
          <option value="secondaryComplaint" className="text-slate-800">תלונה משנית</option>
          <option value="notes" className="text-slate-800">הערות טיפול</option>
          <option value="isInfo" className="text-slate-800">מידע נוסף</option>
        </select>

        <div className="flex-1 relative">
          <input
            ref={inputRef}
            value={globalQuery}
            onChange={e => setGlobalQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            placeholder={
              globalSearchType === 'patient' ? 'חיפוש מטופלים...' :
              globalSearchType === 'mainComplaint' ? 'חיפוש בתלונה ראשית...' :
              globalSearchType === 'secondaryComplaint' ? 'חיפוש בתלונה משנית...' :
              globalSearchType === 'notes' ? 'חיפוש בהערות טיפול...' :
              'חיפוש במידע נוסף...'
            }
            className="w-full rounded-lg bg-white/20 placeholder:text-teal-100 text-white px-3 py-1.5 text-sm focus:outline-none focus:bg-white/30 text-right"
          />
          {focused && <GlobalSearchResults onSelect={handleSelect} />}
        </div>
      </div>

      <div className="flex items-center gap-2 mr-auto">
        <span className="text-xs text-teal-200 hidden sm:block">{user?.displayName}</span>
        <Button variant="ghost" size="sm" onClick={logout} className="text-white hover:bg-white/20">
          התנתק
        </Button>
      </div>

      <NewPatientModal open={showNew} onClose={() => setShowNew(false)} />
    </div>
  )
}
