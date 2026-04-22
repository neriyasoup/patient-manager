import IntakeSection from './IntakeSection'
import Textarea from '../ui/Textarea'
import Input from '../ui/Input'
import { useIntakeField } from '../../hooks/useIntakeField'

function TF({ fieldKey, label, rows }) {
  const props = useIntakeField(fieldKey)
  return rows ? <Textarea label={label} rows={rows} {...props} /> : <Input label={label} {...props} />
}

export default function DigestiveSection() {
  return (
    <IntakeSection title="עיכול">
      <TF fieldKey="digestiveIssues" label="בעיות עיכול" rows={2} />
      <TF fieldKey="bowelFrequency" label="תדירות יציאות" />
      <TF fieldKey="bowelConsistency" label="מרקם / צבע" />
      <TF fieldKey="urination" label="מתן שתן" />
      <TF fieldKey="urineColor" label="צבע שתן" />
    </IntakeSection>
  )
}
