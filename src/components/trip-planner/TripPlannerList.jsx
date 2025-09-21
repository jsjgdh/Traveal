import { Calendar, MapPin, Users, Edit2, Trash2, Eye, Share2 } from 'lucide-react';

function TripPlannerList({ tripPlans, isLoading, onSelectTrip, onDeleteTrip }) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-6 shadow-sm animate-pulse">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="flex space-x-4">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tripPlans.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <Calendar size={32} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No trip plans found</h3>
        <p className="text-gray-600 mb-4">Start planning your next adventure by creating a new trip.</p>
      </div>
    );
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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

  const getDaysUntilTrip = (startDate) => {
    const now = new Date();
    const tripDate = new Date(startDate);
    const diffTime = tripDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Past';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days`;
  };

  return (
    <div className="space-y-4">
      {tripPlans.map((trip) => (
        <div key={trip.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          {/* Trip Header */}
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{trip.title}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(trip.status)}`}>
                    {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                  </span>
                </div>
                
                {trip.description && (
                  <p className="text-gray-600 text-sm mb-3">{trip.description}</p>
                )}
                
                {/* Trip Details */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar size={16} />
                    <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                  </div>
                  
                  {trip.destinations && trip.destinations.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <MapPin size={16} />
                      <span>
                        {trip.destinations.length === 1 
                          ? trip.destinations[0].name
                          : `${trip.destinations.length} destinations`
                        }
                      </span>
                    </div>
                  )}
                  
                  {trip.companions > 0 && (
                    <div className="flex items-center space-x-1">
                      <Users size={16} />
                      <span>{trip.companions} companion{trip.companions !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Trip Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onSelectTrip(trip)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="View Details"
                >
                  <Eye size={18} />
                </button>
                
                <button
                  onClick={() => onSelectTrip(trip)}
                  className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Edit Trip"
                >
                  <Edit2 size={18} />
                </button>
                
                <button
                  className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  title="Share Trip"
                >
                  <Share2 size={18} />
                </button>
                
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this trip plan?')) {
                      onDeleteTrip(trip.id);
                    }
                  }}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Trip"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            
            {/* Trip Timeline */}
            {trip.destinations && trip.destinations.length > 1 && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-700 mb-2">Destinations:</p>
                <div className="flex items-center space-x-2 overflow-x-auto">
                  {trip.destinations.map((dest, index) => (
                    <div key={index} className="flex items-center space-x-2 flex-shrink-0">
                      <div className="px-2 py-1 bg-white rounded text-xs font-medium text-gray-700">
                        {dest.name}
                      </div>
                      {index < trip.destinations.length - 1 && (
                        <div className="w-4 h-px bg-gray-300"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Trip Footer */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Created {formatDate(trip.createdAt)}
              </div>
              
              <div className="text-sm font-medium text-blue-600">
                {getDaysUntilTrip(trip.startDate)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TripPlannerList;