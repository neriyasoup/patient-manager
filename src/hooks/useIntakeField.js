import { useState, useEffect } from 'react'
import { useIntakeStore } from '../store/useIntakeStore'

export function useIntakeField(key) {
  const intakeValue = useIntakeStore(s => s.intake[key] ?? '')
  const updateIntake = useIntakeStore(s => s.updateIntake)
  const [local, setLocal] = useState(intakeValue)

  useEffect(() => { setLocal(intakeValue) }, [intakeValue])

  function onBlur() {
    if (local !== intakeValue) updateIntake({ [key]: local })
  }

  return { value: local, onChange: e => setLocal(e.target.value), onBlur }
}
