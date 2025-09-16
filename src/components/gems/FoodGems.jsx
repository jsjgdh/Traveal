import { useState, useEffect } from 'react'
import {
  Utensils,
  Star,
  Clock,
  MapPin,
  Heart,
  Share2,
  Camera,
  Phone,
  DollarSign,
  Filter,
  Search,
  ChevronRight,
  Users,
  Coffee,
  Pizza,
  Fish,
  Leaf,
  Navigation,
  Bookmark,
  MessageCircle,
  Award,
  ThumbsUp,
  Info,
  ExternalLink
} from 'lucide-react'

function FoodGems() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCuisine, setSelectedCuisine] = useState('all')
  const [selectedPriceRange, setSelectedPriceRange] = useState('all')
  const [favoriteSpots, setFavoriteSpots] = useState(new Set())
  const [sortBy, setSortBy] = useState('rating')
  const [showFilters, setShowFilters] = useState(false)

  // Mock data for hidden food gems
  const [foodSpots] = useState([
    {
      id: 1,
      name: 'Ammachi\'s Kitchen',
      cuisine: 'kerala',
      type: 'homestyle',
      description: 'Traditional Kerala meals served in a 100-year-old ancestral home by Ammachi herself',
      rating: 4.9,
      priceRange: 'budget',
      averagePrice: '₹80-150',
      distance: '1.2 km',
      estimatedTime: '15 min walk',
      coordinates: { lat: 9.9312, lng: 76.2673 },
      images: ['ammachi1.jpg', 'meals.jpg'],
      specialties: ['Fish Curry', 'Appam', 'Puttu', 'Coconut Chutney'],
      tags: ['authentic', 'homestyle', 'traditional', 'family-run'],
      secretInfo: 'Ring the bell and ask for the "special thali" - not on the menu but amazing',
      crowdLevel: 'low',
      bestTimeToVisit: 'Lunch (12-2 PM)',
      openingHours: '11 AM - 3 PM, 7 PM - 9 PM',
      phoneNumber: '+91 98765 43210',
      address: 'Behind St. Mary\'s Church, Fort Kochi',
      reviews: 89,
      lastVisited: 'Never visited',
      mustTry: 'Karimeen Pollichathu',
      localFavorite: true,
      veganOptions: true,
      spiceLevel: 'medium',
      ambiance: 'traditional',
      seatingCapacity: '20 people',
      reservationRequired: false,
      paymentMethods: ['Cash', 'UPI'],
      languages: ['Malayalam', 'English', 'Hindi']
    },
    {
      id: 2,
      name: 'Floating Tea Stall',
      cuisine: 'beverages',
      type: 'street',
      description: 'Century-old floating tea stall on backwaters serving the best chai in Kerala',
      rating: 4.7,
      priceRange: 'budget',
      averagePrice: '₹10-30',
      distance: '3.4 km',
      estimatedTime: '10 min boat ride',
      coordinates: { lat: 9.8312, lng: 76.2973 },
      specialties: ['Cardamom Tea', 'Ginger Tea', 'Fresh Lime Water', 'Banana Chips'],
      tags: ['tea', 'traditional', 'boat', 'heritage', 'morning'],
      secretInfo: 'Ask for "special masala chai" with secret spice blend passed down 3 generations',
      crowdLevel: 'medium',
      bestTimeToVisit: 'Early morning (6-9 AM)',
      openingHours: '5:30 AM - 10 AM',
      phoneNumber: 'No phone',
      address: 'Floating on Vembanad Lake',
      reviews: 156,
      lastVisited: '2 weeks ago',
      mustTry: 'Cardamom Special Chai',
      localFavorite: true,
      veganOptions: true,
      spiceLevel: 'mild',
      ambiance: 'scenic',
      seatingCapacity: '12 people',
      reservationRequired: false,
      paymentMethods: ['Cash only'],
      languages: ['Malayalam', 'Basic English']
    },
    {
      id: 3,
      name: 'Hidden Seafood Shack',
      cuisine: 'seafood',
      type: 'local',
      description: 'Fisherman\'s family-run shack serving catch-of-the-day seafood with secret recipes',
      rating: 4.8,
      priceRange: 'moderate',
      averagePrice: '₹200-400',
      distance: '5.1 km',
      estimatedTime: '20 min drive',
      coordinates: { lat: 10.1312, lng: 76.1673 },
      specialties: ['Grilled Pomfret', 'Crab Curry', 'Prawn Masala', 'Fish Fry'],
      tags: ['seafood', 'fresh catch', 'beachside', 'family-run'],
      secretInfo: 'Come before 7 PM to choose your fish directly from the day\'s catch',
      crowdLevel: 'low',
      bestTimeToVisit: 'Evening (6-8 PM)',
      openingHours: '5 PM - 11 PM',
      phoneNumber: '+91 98765 12345',
      address: 'Cherai Beach Road, House No. 47',
      reviews: 203,
      lastVisited: '1 month ago',
      mustTry: 'Coconut Fish Curry',
      localFavorite: true,
      veganOptions: false,
      spiceLevel: 'hot',
      ambiance: 'beachside',
      seatingCapacity: '25 people',
      reservationRequired: true,
      paymentMethods: ['Cash', 'UPI', 'Card'],
      languages: ['Malayalam', 'English']
    },
    {
      id: 4,
      name: 'Grandma\'s Spice Garden',
      cuisine: 'vegetarian',
      type: 'organic',
      description: 'Organic vegetarian meals with herbs and spices grown in their own garden',
      rating: 4.6,
      priceRange: 'moderate',
      averagePrice: '₹150-250',
      distance: '7.2 km',
      estimatedTime: '25 min drive',
      coordinates: { lat: 9.7312, lng: 76.3173 },
      specialties: ['Organic Thali', 'Herbal Rasam', 'Garden Salad', 'Ayurvedic Dishes'],
      tags: ['organic', 'vegetarian', 'healthy', 'garden-to-plate'],
      secretInfo: 'Ask for the "healing meal" - customized based on Ayurvedic principles',
      crowdLevel: 'very low',
      bestTimeToVisit: 'Lunch (12:30-2:30 PM)',
      openingHours: '12 PM - 3 PM, 7 PM - 9 PM',
      phoneNumber: '+91 98765 67890',
      address: 'Kumily Road, Near Spice Plantation',
      reviews: 67,
      lastVisited: 'Never visited',
      mustTry: 'Seven-herb Rasam',
      localFavorite: false,
      veganOptions: true,
      spiceLevel: 'mild',
      ambiance: 'garden',
      seatingCapacity: '15 people',
      reservationRequired: true,
      paymentMethods: ['Cash', 'UPI'],
      languages: ['Malayalam', 'English', 'Tamil']
    },
    {
      id: 5,
      name: 'Midnight Biryani Corner',
      cuisine: 'biryani',
      type: 'late-night',
      description: 'Famous late-night biryani spot known only to locals and night shift workers',
      rating: 4.4,
      priceRange: 'budget',
      averagePrice: '₹120-200',
      distance: '2.8 km',
      estimatedTime: '12 min drive',
      coordinates: { lat: 9.9812, lng: 76.2373 },
      specialties: ['Mutton Biryani', 'Chicken 65', 'Beef Fry', 'Raita'],
      tags: ['biryani', 'late-night', 'spicy', 'popular'],
      secretInfo: 'Order the "special biryani" after 11 PM - extra masala and larger portions',
      crowdLevel: 'high',
      bestTimeToVisit: 'Late night (10 PM - 2 AM)',
      openingHours: '8 PM - 3 AM',
      phoneNumber: '+91 98765 54321',
      address: 'MG Road, Near Railway Station',
      reviews: 234,
      lastVisited: '3 days ago',
      mustTry: 'Midnight Special Mutton Biryani',
      localFavorite: true,
      veganOptions: false,
      spiceLevel: 'very hot',
      ambiance: 'casual',
      seatingCapacity: '40 people',
      reservationRequired: false,
      paymentMethods: ['Cash', 'UPI'],
      languages: ['Malayalam', 'English', 'Hindi', 'Tamil']
    },
    {
      id: 6,
      name: 'Secret Dessert Lab',
      cuisine: 'desserts',
      type: 'modern',
      description: 'Experimental dessert kitchen creating fusion of traditional and modern sweets',
      rating: 4.5,
      priceRange: 'premium',
      averagePrice: '₹100-300',
      distance: '4.3 km',
      estimatedTime: '18 min drive',
      coordinates: { lat: 9.8812, lng: 76.2773 },
      specialties: ['Payasam Shots', 'Coconut Ice Cream', 'Spiced Chocolate', 'Fruit Sorbets'],
      tags: ['desserts', 'fusion', 'creative', 'instagram-worthy'],
      secretInfo: 'Try the "tasting menu" - 6 mini desserts paired with local spices',
      crowdLevel: 'medium',
      bestTimeToVisit: 'Evening (7-9 PM)',
      openingHours: '4 PM - 11 PM',
      phoneNumber: '+91 98765 98765',
      address: 'Princess Street, Above Coffee House',
      reviews: 112,
      lastVisited: '1 week ago',
      mustTry: 'Cardamom-Rose Payasam Shot',
      localFavorite: false,
      veganOptions: true,
      spiceLevel: 'none',
      ambiance: 'modern',
      seatingCapacity: '20 people',
      reservationRequired: true,
      paymentMethods: ['Cash', 'UPI', 'Card'],
      languages: ['English', 'Malayalam']
    }
  ])

  const cuisineTypes = [
    { id: 'all', name: 'All Cuisines', icon: Utensils },
    { id: 'kerala', name: 'Kerala Traditional', icon: Fish },
    { id: 'seafood', name: 'Seafood', icon: Fish },
    { id: 'vegetarian', name: 'Vegetarian', icon: Leaf },
    { id: 'biryani', name: 'Biryani', icon: Pizza },
    { id: 'beverages', name: 'Beverages', icon: Coffee },
    { id: 'desserts', name: 'Desserts', icon: Heart }
  ]

  const priceRanges = [
    { id: 'all', name: 'All Prices' },
    { id: 'budget', name: 'Budget (₹50-150)' },
    { id: 'moderate', name: 'Moderate (₹150-400)' },
    { id: 'premium', name: 'Premium (₹400+)' }
  ]

  const sortOptions = [
    { id: 'rating', name: 'Highest Rated' },
    { id: 'price', name: 'Price Low to High' },
    { id: 'distance', name: 'Nearest First' },
    { id: 'reviews', name: 'Most Popular' }
  ]

  // Filter and sort food spots
  const filteredSpots = foodSpots
    .filter(spot => {
      const matchesSearch = spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           spot.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           spot.specialties.some(specialty => specialty.toLowerCase().includes(searchQuery.toLowerCase())) ||
                           spot.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesCuisine = selectedCuisine === 'all' || spot.cuisine === selectedCuisine
      const matchesPrice = selectedPriceRange === 'all' || spot.priceRange === selectedPriceRange
      return matchesSearch && matchesCuisine && matchesPrice
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating
        case 'distance':
          return parseFloat(a.distance) - parseFloat(b.distance)
        case 'reviews':
          return b.reviews - a.reviews
        case 'price':
          return a.averagePrice.localeCompare(b.averagePrice)
        default:
          return 0
      }
    })

  const toggleFavorite = (spotId) => {
    const newFavorites = new Set(favoriteSpots)
    if (newFavorites.has(spotId)) {
      newFavorites.delete(spotId)
    } else {
      newFavorites.add(spotId)
    }
    setFavoriteSpots(newFavorites)
  }

  const getPriceRangeColor = (range) => {
    switch (range) {
      case 'budget': return 'text-green-600 bg-green-100'
      case 'moderate': return 'text-yellow-600 bg-yellow-100'
      case 'premium': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getSpiceLevelColor = (level) => {
    switch (level) {
      case 'none': return 'text-blue-600 bg-blue-100'
      case 'mild': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'hot': return 'text-orange-600 bg-orange-100'
      case 'very hot': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Hidden Food Gems</h1>
          <p className="text-sm text-gray-600">Discover secret local food spots</p>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="bg-white shadow-sm border-b border-gray-100 px-4 py-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search food spots, dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Cuisine Filter */}
        <div className="flex overflow-x-auto space-x-2 pb-2">
          {cuisineTypes.map(cuisine => {
            const IconComponent = cuisine.icon
            return (
              <button
                key={cuisine.id}
                onClick={() => setSelectedCuisine(cuisine.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  selectedCuisine === cuisine.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <IconComponent size={16} />
                <span className="text-sm font-medium">{cuisine.name}</span>
              </button>
            )
          })}
        </div>

        {/* Sort and Price Filter */}
        <div className="flex items-center justify-between space-x-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            {sortOptions.map(option => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>

          <select
            value={selectedPriceRange}
            onChange={(e) => setSelectedPriceRange(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            {priceRanges.map(range => (
              <option key={range.id} value={range.id}>{range.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-4 py-6 space-y-4 pb-24">
        {/* Results Header */}
        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            Found {filteredSpots.length} hidden food spots
          </p>
          <button className="text-blue-600 text-sm hover:underline">
            View on Map
          </button>
        </div>

        {/* Food Spots List */}
        <div className="space-y-4">
          {filteredSpots.map(spot => (
            <div key={spot.id} className="card">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">{spot.name}</h3>
                    {spot.localFavorite && (
                      <Award className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span>{spot.rating}</span>
                      <span>({spot.reviews})</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{spot.distance}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4" />
                      <span>{spot.averagePrice}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 capitalize">{spot.type} • {spot.cuisine}</p>
                </div>
                <button
                  onClick={() => toggleFavorite(spot.id)}
                  className={`p-2 rounded-full transition-colors ${
                    favoriteSpots.has(spot.id)
                      ? 'text-red-500 bg-red-50'
                      : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                  }`}
                >
                  <Heart size={20} className={favoriteSpots.has(spot.id) ? 'fill-current' : ''} />
                </button>
              </div>

              {/* Description */}
              <p className="text-gray-700 mb-4">{spot.description}</p>

              {/* Specialties */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Must Try:</h4>
                <div className="flex flex-wrap gap-2">
                  {spot.specialties.slice(0, 4).map(specialty => (
                    <span
                      key={specialty}
                      className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-500">Price Range:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getPriceRangeColor(spot.priceRange)}`}>
                    {spot.priceRange}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Spice Level:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getSpiceLevelColor(spot.spiceLevel)}`}>
                    {spot.spiceLevel}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Best Time:</span>
                  <span className="ml-2 text-gray-700">{spot.bestTimeToVisit}</span>
                </div>
                <div>
                  <span className="text-gray-500">Seating:</span>
                  <span className="ml-2 text-gray-700">{spot.seatingCapacity}</span>
                </div>
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-2 mb-4">
                {spot.veganOptions && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    Vegan Options
                  </span>
                )}
                {spot.reservationRequired && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    Reservation Required
                  </span>
                )}
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                  {spot.ambiance}
                </span>
              </div>

              {/* Secret Tip */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                <div className="flex items-start space-x-2">
                  <Info className="w-4 h-4 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Local Secret</p>
                    <p className="text-sm text-amber-700">{spot.secretInfo}</p>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{spot.openingHours}</span>
                  </div>
                  {spot.phoneNumber && spot.phoneNumber !== 'No phone' && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">{spot.phoneNumber}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{spot.address}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <button className="flex-1 btn-primary py-2 flex items-center justify-center space-x-2">
                  <Navigation size={16} />
                  <span>Get Directions</span>
                </button>
                {spot.phoneNumber && spot.phoneNumber !== 'No phone' && (
                  <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Phone size={16} className="text-gray-600" />
                  </button>
                )}
                <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Share2 size={16} className="text-gray-600" />
                </button>
                <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Bookmark size={16} className="text-gray-600" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredSpots.length === 0 && (
          <div className="text-center py-12">
            <Utensils className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No food gems found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCuisine('all')
                setSelectedPriceRange('all')
              }}
              className="btn-primary"
            >
              Clear Filters
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default FoodGems