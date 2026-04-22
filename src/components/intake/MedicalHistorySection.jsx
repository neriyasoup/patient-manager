import IntakeSection from './IntakeSection'
import Textarea from '../ui/Textarea'
import { useIntakeField } from '../../hooks/useIntakeField'

function Field({ fieldKey, label }) {
  const props = useIntakeField(fieldKey)
  return <Textarea label={label} rows={2} {...props} />
}

export default function MedicalHistorySection() {
  return (
    <IntakeSection title="היסטוריה רפואית">
      <Field fieldKey="medicalConditions" label="מחלות / מצבים רפואיים" />
      <Field fieldKey="pastSurgeries" label="ניתוחים בעבר" />
      <Field fieldKey="hospitalizations" label="אשפוזים" />
      <Field fieldKey="currentMedications" label="תרופות נוכחיות" />
      <Field fieldKey="supplements" label="תוספי תזונה" />
      <Field fieldKey="allergies" label="אלרגיות" />
      <Field fieldKey="familyHistory" label="היסטוריה משפחתית" />
    </IntakeSection>
  )
}
