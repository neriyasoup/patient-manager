import { useRef, useState } from 'react'
import { useAuthStore } from '../../store/useAuthStore'
import { useUIStore } from '../../store/useUIStore'
import GlobalSearchResults from '../search/GlobalSearchResults'
import Button from '../ui/Button'

export default function TopBar() {
  const logout = useAuthStore(s => s.logout)
  const user = useAuthStore(s => s.user)
  const globalQuery = useUIStore(s => s.globalQuery)
  const setGlobalQuery = useUIStore(s => s.setGlobalQuery)
  const selectPatient = useUIStore(s => s.selectPatient)
  const [focused, setFocused] = useState(false)
  const inputRef = useRef(null)

  function handleSelect(id) {
    selectPatient(id)
    setGlobalQuery('')
    inputRef.current?.blur()
  }

  return (
    <div className="h-14 bg-teal-700 text-white flex items-center gap-4 px-4 shrink-0 relative z-40">
      <span className="font-bold text-lg whitespace-nowrap">🌿 מרפאת דיקור</span>

      <div className="flex-1 relative max-w-md mx-auto">
        <input
          ref={inputRef}
          value={globalQuery}
          onChange={e => setGlobalQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="חיפוש מטופלים..."
          className="w-full rounded-lg bg-white/20 placeholder:text-teal-100 text-white px-3 py-1.5 text-sm focus:outline-none focus:bg-white/30"
        />
        {focused && <GlobalSearchResults onSelect={handleSelect} />}
      </div>

      <div className="flex items-center gap-2 mr-auto">
        <span className="text-xs text-teal-200 hidden sm:block">{user?.displayName}</span>
        <Button variant="ghost" size="sm" onClick={logout} className="text-white hover:bg-white/20">
          התנתק
        </Button>
      </div>
    </div>
  )
}
