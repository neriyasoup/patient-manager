import Input from '../ui/Input'
import Select from '../ui/Select'
import Textarea from '../ui/Textarea'
import { PATIENT_STATUSES } from '../../constants'

const statusOptions = [
  ...Object.entries(PATIENT_STATUSES).map(([value, { label }]) => ({ value, label })),
]

export default function PatientForm({ data, onChange }) {
  function field(key) {
    return {
      value: data[key] ?? '',
      onChange: e => onChange({ ...data, [key]: e.target.value }),
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <Input label="שם פרטי *" {...field('firstName')} />
      <Input label="שם משפחה *" {...field('lastName')} />
      <Input label="טלפון" type="tel" {...field('phone')} />
      <Input label="אימייל" type="email" {...field('email')} />
      <div className="col-span-2">
        <Input label="כתובת" {...field('address')} />
      </div>
      <Input label="תאריך לידה" type="date" {...field('dob')} />
      <Input label="יתרת חוב (₪)" type="number" {...field('balance')} />
      <div className="col-span-2">
        <Select
          label="סטטוס"
          options={statusOptions}
          value={data.status ?? 'active'}
          onChange={e => onChange({ ...data, status: e.target.value })}
        />
      </div>
      <div className="col-span-2">
        <Textarea label="הערות קבועות" rows={3} placeholder="הערות מיוחדות, אלרגיות, רקע בריאותי..." {...field('permanentNotes')} />
      </div>
    </div>
  )
}
