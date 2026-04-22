export const PATIENT_STATUSES = {
  active:        { label: 'פעיל',      color: 'bg-green-100 text-green-800 border-green-200' },
  completed:     { label: 'הסתיים',    color: 'bg-blue-100 text-blue-800 border-blue-200' },
  discontinued:  { label: 'הופסק',    color: 'bg-red-100 text-red-800 border-red-200' },
  as_needed:     { label: 'לפי צורך', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
}

export const SLEEP_QUALITY_OPTIONS = [
  { value: '', label: 'בחר...' },
  { value: 'good', label: 'טובה' },
  { value: 'fair', label: 'בינונית' },
  { value: 'poor', label: 'גרועה' },
]

export const STRESS_LEVEL_OPTIONS = [
  { value: '', label: 'בחר...' },
  { value: 'low', label: 'נמוך' },
  { value: 'moderate', label: 'בינוני' },
  { value: 'high', label: 'גבוה' },
  { value: 'very_high', label: 'גבוה מאוד' },
]

export const MENSTRUAL_PAIN_OPTIONS = [
  { value: '', label: 'בחר...' },
  { value: 'none', label: 'ללא' },
  { value: 'mild', label: 'קל' },
  { value: 'moderate', label: 'בינוני' },
  { value: 'severe', label: 'חזק' },
]

export const TONGUE_BODY_OPTIONS = [
  { value: '', label: 'בחר...' },
  { value: 'pale_red', label: 'ורוד-אדום (נורמלי)' },
  { value: 'pale', label: 'חיוור' },
  { value: 'red', label: 'אדום' },
  { value: 'dark_red', label: 'אדום כהה / מוכהב' },
  { value: 'purple', label: 'סגול' },
  { value: 'blue_purple', label: 'כחול-סגול' },
]

export const TONGUE_COATING_OPTIONS = [
  { value: '', label: 'בחר...' },
  { value: 'thin_white', label: 'לבן דק (נורמלי)' },
  { value: 'thick_white', label: 'לבן עבה' },
  { value: 'yellow_thin', label: 'צהוב דק' },
  { value: 'yellow_thick', label: 'צהוב עבה' },
  { value: 'gray', label: 'אפור' },
  { value: 'black', label: 'שחור' },
  { value: 'none', label: 'ללא ציפוי' },
]

export const TONGUE_MOISTURE_OPTIONS = [
  { value: '', label: 'בחר...' },
  { value: 'normal', label: 'נורמלי' },
  { value: 'wet', label: 'רטוב' },
  { value: 'dry', label: 'יבש' },
  { value: 'peeled', label: 'קלוף' },
]

export const TONGUE_SHAPE_OPTIONS = [
  { value: '', label: 'בחר...' },
  { value: 'normal', label: 'נורמלי' },
  { value: 'swollen', label: 'נפוח' },
  { value: 'thin', label: 'דק / רזה' },
  { value: 'cracked', label: 'סדוק' },
  { value: 'teeth_marks', label: 'עם טביעות שיניים' },
  { value: 'deviated', label: 'מסוטה' },
]

export const PULSE_QUALITY_OPTIONS = [
  { value: '', label: 'בחר...' },
  { value: 'floating', label: 'צף (Fu)' },
  { value: 'sinking', label: 'שוקע (Chen)' },
  { value: 'slow', label: 'איטי (Chi)' },
  { value: 'rapid', label: 'מהיר (Shu)' },
  { value: 'wiry', label: 'מיתרי (Xian)' },
  { value: 'slippery', label: 'חלק (Hua)' },
  { value: 'choppy', label: 'מחוספס (Se)' },
  { value: 'thin', label: 'דק (Xi)' },
  { value: 'full', label: 'מלא (Hong)' },
  { value: 'empty', label: 'ריק (Xu)' },
  { value: 'tight', label: 'מתוח (Jin)' },
  { value: 'weak', label: 'חלש (Ruo)' },
]

export const DEFAULT_INTAKE = {
  chiefComplaint: '', complaintHistory: '', complaintOnset: '', complaintAggravation: '', complaintRelief: '',
  medicalConditions: '', pastSurgeries: '', hospitalizations: '',
  currentMedications: '', supplements: '', allergies: '', familyHistory: '',
  diet: '', dietaryRestrictions: '', appetite: '', thirst: '', waterIntake: '',
  sleepHours: '', sleepQuality: '', sleepNotes: '',
  exerciseFrequency: '', exerciseType: '',
  stressLevel: '', stressDescription: '',
  smokingStatus: '', alcoholUse: '',
  bowelFrequency: '', bowelConsistency: '', digestiveIssues: '', urination: '', urineColor: '',
  menstrualCycleLength: '', menstrualDuration: '', lastPeriodDate: '',
  menstrualPain: '', menstrualColor: '', clotting: '', menstrualNotes: '',
  pregnancies: '', contraception: '', menopausalStatus: '',
  tongueBody: '', tongueCoating: '', tongueMoisture: '', tongueShape: '',
  tongueCracks: '', tongueTip: '', tongueNotes: '',
  pulseRateLeft: '', pulseRateRight: '',
  pulseCunLeft: '', pulseCunRight: '',
  pulseGuanLeft: '', pulseGuanRight: '',
  pulseChiLeft: '', pulseChiRight: '',
  pulseOverallNotes: '',
  eightPrinciples: '', zangFuPattern: '', aetiology: '', tcmDiagnosis: '',
  treatmentGoals: '', patientExpectations: '',
}
