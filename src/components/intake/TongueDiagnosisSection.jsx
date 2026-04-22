import IntakeSection from './IntakeSection'
import Textarea from '../ui/Textarea'
import Select from '../ui/Select'
import { useIntakeField } from '../../hooks/useIntakeField'
import { useIntakeStore } from '../../store/useIntakeStore'
import {
  TONGUE_BODY_OPTIONS,
  TONGUE_COATING_OPTIONS,
  TONGUE_MOISTURE_OPTIONS,
  TONGUE_SHAPE_OPTIONS,
} from '../../constants'

function SF({ fieldKey, label, options }) {
  const value = useIntakeStore(s => s.intake[fieldKey] ?? '')
  const updateIntake = useIntakeStore(s => s.updateIntake)
  return (
    <Select label={label} options={options} value={value}
      onChange={e => updateIntake({ [fieldKey]: e.target.value })} />
  )
}

function TA({ fieldKey, label }) {
  const props = useIntakeField(fieldKey)
  return <Textarea label={label} rows={2} {...props} />
}

export default function TongueDiagnosisSection() {
  return (
    <IntakeSection title="אבחון לשון (TCM)">
      <SF fieldKey="tongueBody" label="גוף הלשון" options={TONGUE_BODY_OPTIONS} />
      <SF fieldKey="tongueCoating" label="ציפוי לשון" options={TONGUE_COATING_OPTIONS} />
      <SF fieldKey="tongueMoisture" label="לחות" options={TONGUE_MOISTURE_OPTIONS} />
      <SF fieldKey="tongueShape" label="צורה" options={TONGUE_SHAPE_OPTIONS} />
      <TA fieldKey="tongueCracks" label="סדקים / מיקום" />
      <TA fieldKey="tongueTip" label="קצה הלשון" />
      <TA fieldKey="tongueNotes" label="הערות לשון" />
    </IntakeSection>
  )
}
