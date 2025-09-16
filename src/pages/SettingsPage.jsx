import { SettingsMenu } from '../components/settings'

function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700 sticky top-0 z-40 transition-colors duration-300">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Customize your Travel experience</p>
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