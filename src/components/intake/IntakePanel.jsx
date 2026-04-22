import { useUIStore } from '../../store/useUIStore'
import ChiefComplaintSection from './ChiefComplaintSection'
import MedicalHistorySection from './MedicalHistorySection'
import LifestyleSection from './LifestyleSection'
import DigestiveSection from './DigestiveSection'
import WomensHealthSection from './WomensHealthSection'
import TongueDiagnosisSection from './TongueDiagnosisSection'
import PulseDiagnosisSection from './PulseDiagnosisSection'
import TCMDiagnosisSection from './TCMDiagnosisSection'
import TreatmentGoalsSection from './TreatmentGoalsSection'

export default function IntakePanel() {
  const open = useUIStore(s => s.intakePanelOpen)
  const toggle = useUIStore(s => s.toggleIntakePanel)

  return (
    <div className="flex flex-col h-full relative">
      <button
        onClick={toggle}
        title={open ? 'כווץ שאלון' : 'פתח שאלון'}
        className="absolute top-2 left-0 z-10 bg-white border border-slate-200 rounded-r-lg px-1.5 py-2 text-xs text-slate-500 hover:bg-slate-50 shadow-sm"
      >
        {open ? '◀' : '▶'}
      </button>

      {open && (
        <>
          <div className="px-3 py-2.5 border-b border-slate-200 shrink-0">
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">שאלון קבלה</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ChiefComplaintSection />
            <MedicalHistorySection />
            <LifestyleSection />
            <DigestiveSection />
            <WomensHealthSection />
            <TongueDiagnosisSection />
            <PulseDiagnosisSection />
            <TCMDiagnosisSection />
            <TreatmentGoalsSection />
          </div>
        </>
      )}
    </div>
  )
}
