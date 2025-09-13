import { useState } from 'react'
import { BarChart3, TrendingUp, MapPin, Clock, History, FileText } from 'lucide-react'
import TripHistory from '../components/trip/TripHistory'
import PersonalAnalytics from '../components/trip/PersonalAnalytics'

function DataPage() {
  const [activeTab, setActiveTab] = useState('analytics')

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Your Travel Data</h1>
          <p className="text-sm text-gray-600">Insights from your trips</p>
        </div>
        
        {/* Tab Navigation */}
        <div className="px-4 pb-2">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 size={16} />
              <span>Analytics</span>
            </button>
            
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'history'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <History size={16} />
              <span>Trip History</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6">
        {activeTab === 'analytics' ? (
          <div className="animate-fade-in">
            <PersonalAnalytics />
          </div>
        ) : (
          <div className="animate-fade-in">
            <TripHistory />
          </div>
        )}
      </main>
    </div>
  )
}

export default DataPage