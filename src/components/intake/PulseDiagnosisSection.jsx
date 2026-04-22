import IntakeSection from './IntakeSection'
import Textarea from '../ui/Textarea'
import Select from '../ui/Select'
import Input from '../ui/Input'
import { useIntakeField } from '../../hooks/useIntakeField'
import { useIntakeStore } from '../../store/useIntakeStore'
import { PULSE_QUALITY_OPTIONS } from '../../constants'

function PF({ fieldKey, label }) {
  const props = useIntakeField(fieldKey)
  return <Input label={label} {...props} />
}

function SF({ fieldKey, label }) {
  const value = useIntakeStore(s => s.intake[fieldKey] ?? '')
  const updateIntake = useIntakeStore(s => s.updateIntake)
  return (
    <Select label={label} options={PULSE_QUALITY_OPTIONS} value={value}
      onChange={e => updateIntake({ [fieldKey]: e.target.value })} />
  )
}

export default function PulseDiagnosisSection() {
  const notesProps = useIntakeField('pulseOverallNotes')
  return (
    <IntakeSection title="אבחון דופק (TCM)">
      <div className="grid grid-cols-2 gap-2">
        <PF fieldKey="pulseRateLeft" label="דופק שמאל (פ/ד)" />
        <PF fieldKey="pulseRateRight" label="דופק ימין (פ/ד)" />
      </div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-1">שמאל</p>
      <SF fieldKey="pulseCunLeft" label="Cun — שמאל (לב/ריאות)" />
      <SF fieldKey="pulseGuanLeft" label="Guan — שמאל (כבד/כיס מרה)" />
      <SF fieldKey="pulseChiLeft" label="Chi — שמאל (כליה יין)" />
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-1">ימין</p>
      <SF fieldKey="pulseCunRight" label="Cun — ימין (ריאות/לב)" />
      <SF fieldKey="pulseGuanRight" label="Guan — ימין (טחול/קיבה)" />
      <SF fieldKey="pulseChiRight" label="Chi — ימין (כליה יאנג)" />
      <Textarea label="הערות דופק" rows={2} {...notesProps} />
    </IntakeSection>
  )
}
