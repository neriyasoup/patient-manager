import { PageWrapper } from '../components/layout/PageWrapper'
import { SettingsForm } from '../components/settings/SettingsForm'

export function SettingsPage() {
  return (
    <PageWrapper title="הגדרות">
      <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl">
        <SettingsForm />
      </div>
    </PageWrapper>
  )
}
