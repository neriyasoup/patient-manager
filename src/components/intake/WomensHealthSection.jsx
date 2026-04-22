import IntakeSection from './IntakeSection'
import Textarea from '../ui/Textarea'
import Input from '../ui/Input'
import Select from '../ui/Select'
import { useIntakeField } from '../../hooks/useIntakeField'
import { useIntakeStore } from '../../store/useIntakeStore'
import { MENSTRUAL_PAIN_OPTIONS } from '../../constants'

function TF({ fieldKey, label, rows }) {
  const props = useIntakeField(fieldKey)
  return rows ? <Textarea label={label} rows={rows} {...props} /> : <Input label={label} {...props} />
}

function SF({ fieldKey, label, options }) {
  const value = useIntakeStore(s => s.intake[fieldKey] ?? '')
  const updateIntake = useIntakeStore(s => s.updateIntake)
  return (
    <Select label={label} options={options} value={value}
      onChange={e => updateIntake({ [fieldKey]: e.target.value })} />
  )
}

export default function WomensHealthSection() {
  return (
    <IntakeSection title="בריאות נשים">
      <TF fieldKey="menstrualCycleLength" label="אורך מחזור (ימים)" />
      <TF fieldKey="menstrualDuration" label="משך דימום (ימים)" />
      <TF fieldKey="lastPeriodDate" label="תאריך וסת אחרון" />
      <SF fieldKey="menstrualPain" label="כאב וסת" options={MENSTRUAL_PAIN_OPTIONS} />
      <TF fieldKey="menstrualColor" label="צבע דם" />
      <TF fieldKey="clotting" label="קרישים" />
      <TF fieldKey="menstrualNotes" label="הערות" rows={2} />
      <TF fieldKey="pregnancies" label="הריונות / לידות" />
      <TF fieldKey="contraception" label="אמצעי מניעה" />
      <TF fieldKey="menopausalStatus" label="גיל המעבר" />
    </IntakeSection>
  )
}
