import IntakeSection from './IntakeSection'
import Textarea from '../ui/Textarea'
import { useIntakeField } from '../../hooks/useIntakeField'

function TA({ fieldKey, label }) {
  const props = useIntakeField(fieldKey)
  return <Textarea label={label} rows={2} {...props} />
}

export default function TCMDiagnosisSection() {
  return (
    <IntakeSection title="אבחנה TCM">
      <TA fieldKey="eightPrinciples" label="שמונה עקרונות (Yin/Yang, פנים/חוץ, חם/קר, מלא/ריק)" />
      <TA fieldKey="zangFuPattern" label="דפוס Zang-Fu" />
      <TA fieldKey="aetiology" label="אתיולוגיה" />
      <TA fieldKey="tcmDiagnosis" label="אבחנה TCM" />
    </IntakeSection>
  )
}
