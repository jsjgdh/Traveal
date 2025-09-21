import { useState, useEffect } from 'react';
import { Search, MapPin, Star, Clock, Phone, Globe, Heart, Plus } from 'lucide-react';

function PlacesSearchModal({ isVisible, onClose, onAddToTrip, searchType = 'all' }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(searchType);
  const [favorites, setFavorites] = useState(new Set());

  const categories = [
    { id: 'all', label: 'All', icon: Search },
    { id: 'hotel', label: 'Hotels', icon: MapPin },
    { id: 'restaurant', label: 'Restaurants', icon: Star },
    { id: 'attraction', label: 'Attractions', icon: Heart },
    { id: 'transport', label: 'Transport', icon: Clock },
    { id: 'hidden_gems', label: 'Hidden Gems', icon: Plus }
  ];

  // Mock search results with integration to hidden gems
  const mockSearchResults = {
    'kochi hotel': [
      {
        placeId: 'hotel-1',
        name: 'Grand Hyatt Kochi Bolgatty',
        type: 'hotel',
        location: {
          latitude: 10.0261,
          longitude: 76.3271,
          address: 'Bolgatty Island, Mulavukad P.O, Kochi, Kerala 682504'
        },
        rating: 4.5,
        priceLevel: 4,
        photos: ['/images/grand-hyatt.jpg'],
        contact: {
          phone: '+91 484 612 1234',
          website: 'https://hyatt.com',
          email: 'kochi@hyatt.com'
        },
        isFromHiddenGems: false
      },
      {
        placeId: 'hidden-gem-1',
        name: 'Backwater Cottage Stay',
        type: 'hotel',
        location: {
          latitude: 10.0161,
          longitude: 76.3171,
          address: 'Kumbakonam, Fort Kochi, Kerala'
        },
        rating: 4.8,
        priceLevel: 2,
        photos: ['/images/backwater-cottage.jpg'],
        contact: {
          phone: '+91 484 221 5678'
        },
        isFromHiddenGems: true,
        hiddenGemId: 'gem-1',
        description: 'Authentic Kerala experience in a traditional cottage'
      }
    ],
    'kerala restaurants': [
      {
        placeId: 'restaurant-1',
        name: 'Dhe Puttu',
        type: 'restaurant',
        location: {
          latitude: 10.0261,
          longitude: 76.3271,
          address: 'Panampilly Nagar, Kochi, Kerala'
        },
        rating: 4.3,
        priceLevel: 2,
        photos: ['/images/dhe-puttu.jpg'],
        contact: {
          phone: '+91 484 235 7890'
        },
        isFromHiddenGems: true,
        hiddenGemId: 'gem-2',
        description: 'Authentic Kerala breakfast specializing in puttu varieties'
      }
    ],
    'attractions kochi': [
      {
        placeId: 'attraction-1',
        name: 'Chinese Fishing Nets',
        type: 'attraction',
        location: {
          latitude: 10.0167,
          longitude: 76.2436,
          address: 'Fort Kochi Beach, Kochi, Kerala'
        },
        rating: 4.2,
        priceLevel: 1,
        photos: ['/images/chinese-nets.jpg'],
        isFromHiddenGems: false
      },
      {
        placeId: 'hidden-gem-3',
        name: 'Secret Spice Garden',
        type: 'attraction',
        location: {
          latitude: 10.0567,
          longitude: 76.2836,
          address: 'Mattancherry, Kochi, Kerala'
        },
        rating: 4.7,
        priceLevel: 1,
        photos: ['/images/spice-garden.jpg'],
        isFromHiddenGems: true,
        hiddenGemId: 'gem-3',
        description: 'Hidden spice garden with traditional cooking classes'
      }
    ]
  };

  useEffect(() => {
    if (searchQuery.trim() && searchQuery.length > 2) {
      handleSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, selectedCategory]);

  const handleSearch = async () => {
    setIsLoading(true);
    
    try {
      // Mock API call - replace with actual search
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const searchKey = searchQuery.toLowerCase();
      let results = [];
      
      // Find matching results
      Object.keys(mockSearchResults).forEach(key => {
        if (key.includes(searchKey) || searchKey.includes(key.split(' ')[0])) {
          results = [...results, ...mockSearchResults[key]];
        }
      });
      
      // Filter by category if not 'all'
      if (selectedCategory !== 'all') {
        results = results.filter(place => {
          if (selectedCategory === 'hidden_gems') {
            return place.isFromHiddenGems;
          }
          return place.type === selectedCategory;
        });
      }
      
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = (placeId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(placeId)) {
      newFavorites.delete(placeId);
    } else {
      newFavorites.add(placeId);
    }
    setFavorites(newFavorites);
  };

  const handleAddToTrip = (place) => {
    onAddToTrip(place);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Search Places</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Search for hotels, restaurants, attractions..."
            />
          </div>
          
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon size={16} />
                  <span>{category.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Search Results */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-4 animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-12">
              <Search size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No places found</h3>
              <p className="text-gray-600">Try adjusting your search or category filter</p>
            </div>
          ) : (
            <div className="space-y-4">
              {searchResults.map((place) => (
                <div key={place.placeId} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      {place.type === 'hotel' && <MapPin size={24} className="text-blue-600" />}
                      {place.type === 'restaurant' && <Star size={24} className="text-orange-600" />}
                      {place.type === 'attraction' && <Heart size={24} className="text-red-600" />}
                      {place.type === 'transport' && <Clock size={24} className="text-green-600" />}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium text-gray-900">{place.name}</h3>
                            {place.isFromHiddenGems && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                                Hidden Gem
                              </span>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">{place.location.address}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Star size={14} className="fill-yellow-400 text-yellow-400" />
                              <span>{place.rating}</span>
                            </div>
                            
                            {place.priceLevel && (
                              <div className="flex items-center space-x-1">
                                {[...Array(4)].map((_, i) => (
                                  <span 
                                    key={i} 
                                    className={`text-xs ${i < place.priceLevel ? 'text-gray-900' : 'text-gray-300'}`}
                                  >
                                    ₹
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          {place.description && (
                            <p className="text-sm text-gray-700 mt-2">{place.description}</p>
                          )}
                        </div>
                        
                        <button
                          onClick={() => toggleFavorite(place.placeId)}
                          className={`p-2 rounded-lg transition-colors ${
                            favorites.has(place.placeId)
                              ? 'text-red-600 bg-red-50'
                              : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                          }`}
                        >
                          <Heart size={16} className={favorites.has(place.placeId) ? 'fill-current' : ''} />
                        </button>
                      </div>
                      
                      {/* Contact Info */}
                      {(place.contact.phone || place.contact.website) && (
                        <div className="flex items-center space-x-4 mt-3 pt-3 border-t border-gray-100">
                          {place.contact.phone && (
                            <div className="flex items-center space-x-1 text-sm text-gray-600">
                              <Phone size={14} />
                              <span>{place.contact.phone}</span>
                            </div>
                          )}
                          
                          {place.contact.website && (
                            <div className="flex items-center space-x-1 text-sm text-gray-600">
                              <Globe size={14} />
                              <span className="text-blue-600 hover:underline cursor-pointer">
                                Website
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => handleAddToTrip(place)}
                      className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
                    >
                      <Plus size={16} />
                      <span>Add to Trip</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlacesSearchModal;