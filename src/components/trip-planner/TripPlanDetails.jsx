import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, MapPin, Users, Share2, Download, Edit2, Plus, Clock, DollarSign } from 'lucide-react';
import TripTimeline from './TripTimeline';
import TripMap from './TripMap';
import ItineraryManager from './ItineraryManager';
import CompanionManager from './CompanionManager';
import BookingManager from './BookingManager';
import AdvancedPackingListManager from './AdvancedPackingListManager';
import TripNotesManager from './TripNotesManager';

function TripPlanDetails({ tripPlan, onBack, onUpdate }) {
  const [activeTab, setActiveTab] = useState('timeline');
  const [tripData, setTripData] = useState(tripPlan);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setTripData(tripPlan);
  }, [tripPlan]);

  const tabs = [
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'map', label: 'Map', icon: MapPin },
    { id: 'itinerary', label: 'Itinerary', icon: Clock },
    { id: 'companions', label: 'Companions', icon: Users },
    { id: 'bookings', label: 'Bookings', icon: DollarSign },
    { id: 'packing', label: 'Packing', icon: Plus },
    { id: 'notes', label: 'Notes', icon: Edit2 }
  ];

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDuration = () => {
    const start = new Date(tripData.startDate);
    const end = new Date(tripData.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      planned: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.draft;
  };

  const handleShare = () => {
    // Mock sharing functionality
    if (navigator.share) {
      navigator.share({
        title: tripData.title,
        text: `Check out my trip plan: ${tripData.title}`,
        url: window.location.href
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Trip link copied to clipboard!');
    }
  };

  const handleExport = () => {
    // Mock export functionality
    alert('Export functionality will download PDF/image of your itinerary');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'timeline':
        return <TripTimeline tripData={tripData} onUpdate={setTripData} />;
      case 'map':
        return <TripMap tripData={tripData} />;
      case 'itinerary':
        return <ItineraryManager tripData={tripData} onUpdate={setTripData} />;
      case 'companions':
        return <CompanionManager tripData={tripData} onUpdate={setTripData} />;
      case 'bookings':
        return <BookingManager tripData={tripData} onUpdate={setTripData} />;
      case 'packing':
        return <AdvancedPackingListManager tripData={tripData} onUpdate={setTripData} />;
      case 'notes':
        return <TripNotesManager tripData={tripData} onUpdate={setTripData} />;
      default:
        return <TripTimeline tripData={tripData} onUpdate={setTripData} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <h1 className="text-xl font-bold text-gray-900">{tripData.title}</h1>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(tripData.status)}`}>
                  {tripData.status.charAt(0).toUpperCase() + tripData.status.slice(1)}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {formatDate(tripData.startDate)} - {formatDate(tripData.endDate)} • {getDuration()} days
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleShare}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Share Trip"
              >
                <Share2 size={18} />
              </button>
              
              <button
                onClick={handleExport}
                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Export Trip"
              >
                <Download size={18} />
              </button>
              
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`p-2 rounded-lg transition-colors ${
                  isEditing 
                    ? 'text-orange-600 bg-orange-50'
                    : 'text-gray-400 hover:text-orange-600 hover:bg-orange-50'
                }`}
                title="Edit Trip"
              >
                <Edit2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Trip Summary */}
      <div className="px-4 py-6">
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          {tripData.description && (
            <p className="text-gray-700 mb-4">{tripData.description}</p>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{getDuration()}</div>
              <div className="text-sm text-gray-600">Days</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {tripData.destinations?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Destinations</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {tripData.companions || 0}
              </div>
              <div className="text-sm text-gray-600">Companions</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {tripData.totalBudget ? `₹${tripData.totalBudget.toLocaleString()}` : 'TBD'}
              </div>
              <div className="text-sm text-gray-600">Budget</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="px-4 mb-6">
        <div className="bg-white rounded-lg p-1 shadow-sm">
          <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 pb-6">
        {renderTabContent()}
      </div>
    </div>
  );
}

export default TripPlanDetails;