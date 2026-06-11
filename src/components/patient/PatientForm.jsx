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
      <div className="col-span-2 flex gap-4 items-center p-2.5 bg-slate-50 rounded-lg border border-slate-200">
        <span className="text-xs font-semibold text-slate-600">סוג מטופל.ת:</span>
        <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
          <input
            type="radio"
            name="patientType"
            value="adult"
            checked={(data.patientType ?? 'adult') === 'adult'}
            onChange={() => onChange({ ...data, patientType: 'adult' })}
            className="text-teal-600 focus:ring-teal-500"
          />
          מבוגר.ת
        </label>
        <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
          <input
            type="radio"
            name="patientType"
            value="child"
            checked={data.patientType === 'child'}
            onChange={() => onChange({ ...data, patientType: 'child' })}
            className="text-teal-600 focus:ring-teal-500"
          />
          ילד.ה
        </label>
      </div>
      {data.patientType === 'child' && (
        <div className="col-span-2 border border-teal-100 bg-teal-50/20 p-4 rounded-xl flex flex-col gap-3">
          <h4 className="text-xs font-bold text-teal-800 border-b border-teal-100 pb-1.5">פרטי הורים / אנשי קשר</h4>
          <div className="grid grid-cols-2 gap-3">
            <Input label="שם הורה 1" {...field('parent1Name')} />
            <Input label="טלפון הורה 1" type="tel" {...field('parent1Phone')} />
            <Input label="שם הורה 2" {...field('parent2Name')} />
            <Input label="טלפון הורה 2" type="tel" {...field('parent2Phone')} />
          </div>
        </div>
      )}
      <div className="col-span-2">
        <Textarea label="הערות קבועות" rows={3} placeholder="הערות מיוחדות, אלרגיות, רקע בריאותי..." {...field('permanentNotes')} />
      </div>
    </div>
  )
}
