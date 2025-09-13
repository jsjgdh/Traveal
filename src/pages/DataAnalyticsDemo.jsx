import TripHistory from '../components/trip/TripHistory'
import PersonalAnalytics from '../components/trip/PersonalAnalytics'

function DataAnalyticsDemo() {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Travel Data Analytics Demo</h1>
          <p className="text-sm text-gray-600">Testing trip history and personal analytics components</p>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6 space-y-8">
        {/* Personal Analytics Section */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">Personal Analytics</h2>
            <p className="text-sm text-gray-600">Monthly summaries, mode breakdown, and environmental impact</p>
          </div>
          <PersonalAnalytics />
        </section>

        {/* Divider */}
        <div className="border-t border-gray-200 pt-8">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
        </div>

        {/* Trip History Section */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">Trip History</h2>
            <p className="text-sm text-gray-600">Detailed trip records with filtering and export functionality</p>
          </div>
          <TripHistory />
        </section>
      </main>
    </div>
  )
}

export default DataAnalyticsDemo