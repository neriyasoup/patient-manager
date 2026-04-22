import IntakeSection from './IntakeSection'
import Textarea from '../ui/Textarea'
import Input from '../ui/Input'
import Select from '../ui/Select'
import { useIntakeField } from '../../hooks/useIntakeField'
import { useIntakeStore } from '../../store/useIntakeStore'
import { SLEEP_QUALITY_OPTIONS, STRESS_LEVEL_OPTIONS } from '../../constants'

function TF({ fieldKey, label, rows }) {
  const props = useIntakeField(fieldKey)
  return rows ? <Textarea label={label} rows={rows} {...props} /> : <Input label={label} {...props} />
}

function SF({ fieldKey, label, options }) {
  const value = useIntakeStore(s => s.intake[fieldKey] ?? '')
  const updateIntake = useIntakeStore(s => s.updateIntake)
  return (
    <Select
      label={label}
      options={options}
      value={value}
      onChange={e => updateIntake({ [fieldKey]: e.target.value })}
    />
  )
}

export default function LifestyleSection() {
  return (
    <IntakeSection title="אורח חיים">
      <TF fieldKey="diet" label="תזונה / דיאטה" rows={2} />
      <TF fieldKey="dietaryRestrictions" label="הגבלות תזונתיות" />
      <TF fieldKey="appetite" label="תיאבון" />
      <TF fieldKey="thirst" label="צמא" />
      <TF fieldKey="waterIntake" label="שתיית מים ביום" />
      <TF fieldKey="sleepHours" label="שעות שינה ממוצע" />
      <SF fieldKey="sleepQuality" label="איכות שינה" options={SLEEP_QUALITY_OPTIONS} />
      <TF fieldKey="sleepNotes" label="הערות שינה" rows={2} />
      <TF fieldKey="exerciseFrequency" label="תדירות פעילות גופנית" />
      <TF fieldKey="exerciseType" label="סוג פעילות" />
      <SF fieldKey="stressLevel" label="רמת לחץ" options={STRESS_LEVEL_OPTIONS} />
      <TF fieldKey="stressDescription" label="מקורות לחץ" rows={2} />
      <TF fieldKey="smokingStatus" label="עישון" />
      <TF fieldKey="alcoholUse" label="אלכוהול" />
    </IntakeSection>
  )
}
