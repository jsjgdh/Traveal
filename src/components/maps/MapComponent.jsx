import { useState, useEffect } from 'react';
import { MapPin, Navigation, Search, Settings, Globe } from 'lucide-react';

function MapComponent({ onLocationSelect, showProviderSwitcher = false }) {
  const [currentProvider, setCurrentProvider] = useState('google');
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mapConfig, setMapConfig] = useState(null);

  // Load map configuration on component mount
  useEffect(() => {
    loadMapConfig();
  }, []);

  const loadMapConfig = async () => {
    try {
      // Replace with your actual API call
      const response = await fetch('/api/v1/maps/config', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      const data = await response.json();
      setMapConfig(data.data);
      setCurrentProvider(data.data.currentProvider);
    } catch (error) {
      console.error('Failed to load map config:', error);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header with provider switcher */}
      <div className="bg-primary-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin size={20} />
            <span className="font-semibold">Location Search</span>
          </div>
          
          {showProviderSwitcher && mapConfig && (
            <div className="flex items-center space-x-2">
              <Globe size={16} />
              <select
                value={currentProvider}
                className="bg-primary-700 text-white text-sm rounded px-2 py-1"
                disabled={loading}
              >
                <option value="google">Google Maps</option>
                <option value="mapmyindia">MapMyIndia</option>
              </select>
            </div>
          )}
        </div>
        
        <div className="text-xs text-primary-100 mt-1">
          Using {currentProvider === 'google' ? 'Google Maps' : 'MapMyIndia'}
        </div>
      </div>

      {/* Search input */}
      <div className="p-4">
        <div className="relative">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search for places..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                disabled={loading}
              />
            </div>
            
            <button
              className="p-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200"
              disabled={loading}
              title="Use current location"
            >
              <Navigation size={18} />
            </button>
            
            <button
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              disabled={loading}
            >
              Find
            </button>
          </div>
        </div>
      </div>

      {/* Status message when no provider is configured */}
      <div className="border-t border-gray-200 p-4 bg-yellow-50">
        <div className="flex items-center space-x-2 text-yellow-700">
          <Settings size={16} />
          <span className="text-sm">
            Maps functionality requires API configuration. See MAPS_API_CONFIGURATION.md
          </span>
        </div>
      </div>
    </div>
  );
}

export default MapComponent;