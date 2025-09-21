import { useState, useEffect } from 'react';
import { MapPin, Navigation, Router } from 'lucide-react';

function TripMap({ tripData }) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState('overview');
  
  // Mock map loading simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setMapLoaded(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const destinations = tripData.destinations || [];
  
  const routeOptions = [
    { id: 'overview', label: 'Route Overview', icon: Router },
    { id: 'detailed', label: 'Detailed Stops', icon: MapPin },
    { id: 'navigation', label: 'Turn by Turn', icon: Navigation }
  ];

  // Mock map data
  const mockMapStats = {
    totalDistance: '1,247 km',
    estimatedTime: '18h 30m',
    fuelCost: '₹3,890',
    tollCharges: '₹580'
  };

  if (!mapLoaded) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Trip Route Map</h2>
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-600">Loading map...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Trip Route Map</h2>
          
          {/* Route View Options */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {routeOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={() => setSelectedRoute(option.id)}
                  className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    selectedRoute === option.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Route Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">Distance</div>
            <div className="text-lg font-bold text-blue-900">{mockMapStats.totalDistance}</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-sm text-green-600 font-medium">Est. Time</div>
            <div className="text-lg font-bold text-green-900">{mockMapStats.estimatedTime}</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-sm text-orange-600 font-medium">Fuel Cost</div>
            <div className="text-lg font-bold text-orange-900">{mockMapStats.fuelCost}</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-sm text-purple-600 font-medium">Tolls</div>
            <div className="text-lg font-bold text-purple-900">{mockMapStats.tollCharges}</div>
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div className="p-6">
        <div className="aspect-video bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden">
          {/* Mock Map Interface */}
          <div className="absolute inset-0 p-4">
            {/* Destinations on Map */}
            <div className="relative w-full h-full">
              {destinations.map((destination, index) => (
                <div
                  key={index}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${20 + (index * 60)}%`,
                    top: `${30 + (index % 2 * 40)}%`
                  }}
                >
                  <div className="bg-white rounded-lg shadow-lg p-3 border-2 border-primary-500 min-w-max">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{destination.name}</div>
                        <div className="text-xs text-gray-600">{destination.city}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Connection Line to Next Destination */}
                  {index < destinations.length - 1 && (
                    <div className="absolute top-1/2 left-full w-16 h-0.5 bg-primary-500 transform -translate-y-1/2">
                      <div className="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 w-0 h-0 border-l-4 border-l-primary-500 border-t-2 border-b-2 border-t-transparent border-b-transparent"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Map Controls */}
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200">
            <button className="p-2 hover:bg-gray-50 border-b border-gray-200">
              <span className="text-lg font-bold">+</span>
            </button>
            <button className="p-2 hover:bg-gray-50">
              <span className="text-lg font-bold">−</span>
            </button>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 border border-gray-200">
            <div className="text-xs font-medium text-gray-900 mb-2">Legend</div>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                <span>Destinations</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-0.5 bg-primary-500"></div>
                <span>Route</span>
              </div>
            </div>
          </div>
        </div>

        {/* Route Details */}
        <div className="mt-6">
          <h3 className="font-semibold text-gray-900 mb-3">Route Details</h3>
          <div className="space-y-3">
            {destinations.map((destination, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{destination.name}</div>
                  <div className="text-sm text-gray-600">{destination.city}, {destination.country}</div>
                </div>
                {index < destinations.length - 1 && (
                  <div className="text-xs text-gray-500 px-2 py-1 bg-white rounded">
                    {Math.floor(Math.random() * 300 + 50)} km
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Map Integration Notice */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <MapPin className="text-blue-600 mt-0.5" size={20} />
            <div>
              <h4 className="font-medium text-blue-900">Interactive Map Integration</h4>
              <p className="text-sm text-blue-700 mt-1">
                This is a mock map interface. In the full implementation, this would integrate with Google Maps or MapMyIndia for real-time navigation, traffic updates, and detailed route planning.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TripMap;