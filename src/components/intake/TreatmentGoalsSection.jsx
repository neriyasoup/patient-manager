import IntakeSection from './IntakeSection'
import Textarea from '../ui/Textarea'
import { useIntakeField } from '../../hooks/useIntakeField'

export default function TreatmentGoalsSection() {
  const goals = useIntakeField('treatmentGoals')
  const expectations = useIntakeField('patientExpectations')
  return (
    <IntakeSection title="מטרות טיפול">
      <Textarea label="מטרות טיפול" rows={3} {...goals} />
      <Textarea label="ציפיות המטופל" rows={2} {...expectations} />
    </IntakeSection>
  )
}
