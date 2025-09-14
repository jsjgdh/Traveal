import { SettingsMenu } from '../components/settings'

function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-600">Customize your Travel experience</p>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6">
        <SettingsMenu />
      </main>
    </div>
  )
}

export default SettingsPage