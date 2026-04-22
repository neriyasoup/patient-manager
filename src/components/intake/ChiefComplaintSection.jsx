import IntakeSection from './IntakeSection'
import Textarea from '../ui/Textarea'
import Input from '../ui/Input'
import { useIntakeField } from '../../hooks/useIntakeField'

function Field({ fieldKey, label, rows }) {
  const props = useIntakeField(fieldKey)
  return rows
    ? <Textarea label={label} rows={rows} {...props} />
    : <Input label={label} {...props} />
}

export default function ChiefComplaintSection() {
  return (
    <IntakeSection title="תלונה עיקרית" defaultOpen>
      <Field fieldKey="chiefComplaint" label="תלונה עיקרית" rows={2} />
      <Field fieldKey="complaintHistory" label="היסטוריה" rows={2} />
      <Field fieldKey="complaintOnset" label="התחלה / מתי?" />
      <Field fieldKey="complaintAggravation" label="מה מחמיר?" />
      <Field fieldKey="complaintRelief" label="מה מקל?" />
    </IntakeSection>
  )
}
