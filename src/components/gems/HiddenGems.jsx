import { useState, useEffect } from 'react'
import { 
  MapPin, 
  Clock, 
  Star, 
  Heart, 
  Share2, 
  Camera, 
  Navigation, 
  Filter,
  Search,
  ChevronRight,
  Info,
  Users,
  Calendar,
  Bookmark,
  ExternalLink
} from 'lucide-react'

function HiddenGems() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [favoriteGems, setFavoriteGems] = useState(new Set())
  const [sortBy, setSortBy] = useState('rating')
  const [showFilters, setShowFilters] = useState(false)

  // Mock data for hidden gems
  const [gems] = useState([
    {
      id: 1,
      name: 'Secret Beach at Vypin',
      category: 'nature',
      description: 'A pristine hidden beach away from crowds, perfect for sunset photography',
      rating: 4.8,
      difficulty: 'easy',
      distance: '2.3 km',
      estimatedTime: '30 min',
      coordinates: { lat: 10.1060, lng: 76.1761 },
      images: ['beach1.jpg', 'beach2.jpg'],
      tags: ['beach', 'photography', 'sunset', 'peaceful'],
      localTip: 'Best visited during low tide, accessible via a small fisherman trail',
      crowdLevel: 'low',
      bestTimeToVisit: 'Evening (5-7 PM)',
      entryFee: 'Free',
      facilities: ['Parking nearby', 'Basic restrooms'],
      reviews: 127,
      lastVisited: '2 days ago',
      openingHours: '24/7'
    },
    {
      id: 2,
      name: 'Heritage Spice Market',
      category: 'culture',
      description: 'Century-old spice market with authentic local vendors and traditional architecture',
      rating: 4.6,
      difficulty: 'easy',
      distance: '1.8 km',
      estimatedTime: '45 min',
      coordinates: { lat: 9.9312, lng: 76.2673 },
      tags: ['heritage', 'spices', 'culture', 'shopping'],
      localTip: 'Ask for Madhavan uncle at stall 23 - he knows the best cardamom sources',
      crowdLevel: 'medium',
      bestTimeToVisit: 'Morning (8-11 AM)',
      entryFee: 'Free',
      facilities: ['Traditional architecture', 'Local guides available'],
      reviews: 89,
      lastVisited: '1 week ago',
      openingHours: '6 AM - 6 PM'
    },
    {
      id: 3,
      name: 'Floating Restaurant on Backwaters',
      category: 'food',
      description: 'Traditional houseboat converted into floating restaurant serving authentic Kerala cuisine',
      rating: 4.9,
      difficulty: 'moderate',
      distance: '5.2 km',
      estimatedTime: '1.5 hours',
      coordinates: { lat: 9.8312, lng: 76.2973 },
      tags: ['backwaters', 'traditional food', 'houseboat', 'scenic'],
      localTip: 'Call ahead to reserve window seating for the best backwater views',
      crowdLevel: 'low',
      bestTimeToVisit: 'Lunch (12-3 PM)',
      entryFee: '₹50 boat ride',
      facilities: ['Boat transport', 'Traditional seating', 'Live music weekends'],
      reviews: 156,
      lastVisited: 'Never visited',
      openingHours: '11 AM - 9 PM'
    },
    {
      id: 4,
      name: 'Artist\'s Village',
      category: 'art',
      description: 'Small community of local artists creating traditional crafts and modern art',
      rating: 4.7,
      difficulty: 'easy',
      distance: '3.1 km',
      estimatedTime: '1 hour',
      coordinates: { lat: 10.0312, lng: 76.3173 },
      tags: ['art', 'crafts', 'local artists', 'workshops'],
      localTip: 'Visit on weekends for live pottery demonstrations and art workshops',
      crowdLevel: 'low',
      bestTimeToVisit: 'Weekend mornings',
      entryFee: 'Free (workshop charges vary)',
      facilities: ['Art workshops', 'Cafe', 'Art supplies shop'],
      reviews: 73,
      lastVisited: '3 weeks ago',
      openingHours: '9 AM - 7 PM'
    },
    {
      id: 5,
      name: 'Temple with Secret Cave',
      category: 'heritage',
      description: 'Ancient temple complex with hidden cave chambers and rock carvings',
      rating: 4.5,
      difficulty: 'moderate',
      distance: '7.8 km',
      estimatedTime: '2 hours',
      coordinates: { lat: 9.7312, lng: 76.1573 },
      tags: ['temple', 'cave', 'heritage', 'archaeology'],
      localTip: 'Bring a flashlight for cave exploration. Local guide Ravi knows all the stories',
      crowdLevel: 'very low',
      bestTimeToVisit: 'Early morning (6-9 AM)',
      entryFee: 'Free (donations welcome)',
      facilities: ['Guided tours', 'Historical information', 'Meditation space'],
      reviews: 45,
      lastVisited: 'Never visited',
      openingHours: '5 AM - 8 PM'
    }
  ])

  const categories = [
    { id: 'all', name: 'All Gems', icon: Star },
    { id: 'nature', name: 'Nature', icon: MapPin },
    { id: 'culture', name: 'Culture', icon: Users },
    { id: 'food', name: 'Food', icon: Heart },
    { id: 'art', name: 'Art', icon: Camera },
    { id: 'heritage', name: 'Heritage', icon: Calendar }
  ]

  const sortOptions = [
    { id: 'rating', name: 'Highest Rated' },
    { id: 'distance', name: 'Nearest First' },
    { id: 'reviews', name: 'Most Popular' },
    { id: 'recent', name: 'Recently Added' }
  ]

  // Filter and sort gems
  const filteredGems = gems
    .filter(gem => {
      const matchesSearch = gem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           gem.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           gem.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesCategory = selectedCategory === 'all' || gem.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating
        case 'distance':
          return parseFloat(a.distance) - parseFloat(b.distance)
        case 'reviews':
          return b.reviews - a.reviews
        default:
          return 0
      }
    })

  const toggleFavorite = (gemId) => {
    const newFavorites = new Set(favoriteGems)
    if (newFavorites.has(gemId)) {
      newFavorites.delete(gemId)
    } else {
      newFavorites.add(gemId)
    }
    setFavoriteGems(newFavorites)
  }

  const getCrowdLevelColor = (level) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100'
      case 'moderate': return 'text-yellow-600 bg-yellow-100'
      case 'hard': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Hidden Gems</h1>
          <p className="text-sm text-gray-600">Discover secret local attractions</p>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="bg-white shadow-sm border-b border-gray-100 px-4 py-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search hidden gems..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Category Filter */}
        <div className="flex overflow-x-auto space-x-2 pb-2">
          {categories.map(category => {
            const IconComponent = category.icon
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <IconComponent size={16} />
                <span className="text-sm font-medium">{category.name}</span>
              </button>
            )
          })}
        </div>

        {/* Sort and Filter */}
        <div className="flex items-center justify-between">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            {sortOptions.map(option => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Filter size={16} />
            <span className="text-sm">Filters</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-4 py-6 space-y-4 pb-24">
        {/* Results Header */}
        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            Found {filteredGems.length} hidden gems
          </p>
          <button className="text-blue-600 text-sm hover:underline">
            View on Map
          </button>
        </div>

        {/* Gems List */}
        <div className="space-y-4">
          {filteredGems.map(gem => (
            <div key={gem.id} className="card">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{gem.name}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span>{gem.rating}</span>
                      <span>({gem.reviews})</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{gem.distance}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{gem.estimatedTime}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => toggleFavorite(gem.id)}
                  className={`p-2 rounded-full transition-colors ${
                    favoriteGems.has(gem.id)
                      ? 'text-red-500 bg-red-50'
                      : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                  }`}
                >
                  <Heart size={20} className={favoriteGems.has(gem.id) ? 'fill-current' : ''} />
                </button>
              </div>

              {/* Description */}
              <p className="text-gray-700 mb-4">{gem.description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {gem.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-500">Crowd Level:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getCrowdLevelColor(gem.crowdLevel)}`}>
                    {gem.crowdLevel}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Difficulty:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getDifficultyColor(gem.difficulty)}`}>
                    {gem.difficulty}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Best Time:</span>
                  <span className="ml-2 text-gray-700">{gem.bestTimeToVisit}</span>
                </div>
                <div>
                  <span className="text-gray-500">Entry Fee:</span>
                  <span className="ml-2 text-gray-700">{gem.entryFee}</span>
                </div>
              </div>

              {/* Local Tip */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                <div className="flex items-start space-x-2">
                  <Info className="w-4 h-4 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Local Tip</p>
                    <p className="text-sm text-amber-700">{gem.localTip}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <button className="flex-1 btn-primary py-2 flex items-center justify-center space-x-2">
                  <Navigation size={16} />
                  <span>Get Directions</span>
                </button>
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
        {filteredGems.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No gems found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
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

export default HiddenGems