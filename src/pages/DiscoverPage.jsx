import { useState } from 'react'
import { MapPin, Utensils, Compass, Star, ArrowRight, Search, Filter, Heart } from 'lucide-react'
import { HiddenGems, FoodGems } from '../components/gems'

function DiscoverPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')

  // Quick stats for overview
  const stats = {
    totalGems: 12,
    foodSpots: 8,
    attractions: 5,
    userFavorites: 3,
    newThisWeek: 2
  }

  const featuredGems = [
    {
      id: 1,
      name: 'Secret Beach at Vypin',
      type: 'attraction',
      rating: 4.8,
      distance: '2.3 km',
      image: 'beach.jpg',
      description: 'Hidden pristine beach perfect for sunset photography'
    },
    {
      id: 2,
      name: 'Ammachi\'s Kitchen',
      type: 'food',
      rating: 4.9,
      distance: '1.2 km',
      image: 'kitchen.jpg',
      description: 'Traditional Kerala meals in 100-year-old ancestral home'
    },
    {
      id: 3,
      name: 'Floating Tea Stall',
      type: 'food',
      rating: 4.7,
      distance: '3.4 km',
      image: 'tea.jpg',
      description: 'Century-old floating tea stall on backwaters'
    }
  ]

  const quickCategories = [
    {
      id: 'nature',
      name: 'Nature Spots',
      icon: MapPin,
      count: 4,
      color: 'bg-green-100 text-green-700',
      description: 'Hidden beaches, gardens, and scenic viewpoints'
    },
    {
      id: 'food',
      name: 'Food Gems',
      icon: Utensils,
      count: 8,
      color: 'bg-orange-100 text-orange-700',
      description: 'Secret local eateries and traditional kitchens'
    },
    {
      id: 'culture',
      name: 'Cultural Sites',
      icon: Star,
      count: 3,
      color: 'bg-purple-100 text-purple-700',
      description: 'Heritage sites, art villages, and temples'
    },
    {
      id: 'experiences',
      name: 'Unique Experiences',
      icon: Compass,
      count: 5,
      color: 'bg-blue-100 text-blue-700',
      description: 'Special activities and local experiences'
    }
  ]

  if (activeTab === 'attractions') {
    return <HiddenGems />
  }

  if (activeTab === 'food') {
    return <FoodGems />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Discover Hidden Gems</h1>
          <p className="text-sm text-gray-600">Find secret local attractions and food spots</p>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-100">
        <div className="px-4">
          <div className="flex space-x-6">
            {[
              { id: 'overview', name: 'Overview', icon: Compass },
              { id: 'attractions', name: 'Attractions', icon: MapPin },
              { id: 'food', name: 'Food Spots', icon: Utensils }
            ].map(tab => {
              const IconComponent = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <IconComponent size={18} />
                  <span className="font-medium">{tab.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content - Overview Tab */}
      <main className="px-4 py-6 space-y-6 pb-24">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="card text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">{stats.totalGems}</div>
            <div className="text-sm text-gray-600">Total Hidden Gems</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">{stats.foodSpots}</div>
            <div className="text-sm text-gray-600">Food Spots</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">{stats.attractions}</div>
            <div className="text-sm text-gray-600">Attractions</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">{stats.userFavorites}</div>
            <div className="text-sm text-gray-600">Your Favorites</div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="card">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search all gems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-gray-600">Quick search across all categories</span>
            <Filter className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Quick Categories */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Explore by Category</h2>
          <div className="grid grid-cols-1 gap-3">
            {quickCategories.map(category => {
              const IconComponent = category.icon
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    if (category.id === 'food') {
                      setActiveTab('food')
                    } else {
                      setActiveTab('attractions')
                    }
                  }}
                  className="card hover:shadow-md transition-shadow duration-200 text-left"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${category.color}`}>
                      <IconComponent size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{category.name}</h3>
                        <span className="text-sm text-gray-500">({category.count})</span>
                      </div>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Featured Gems */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Featured Gems</h2>
            <button className="text-blue-600 text-sm hover:underline">View All</button>
          </div>
          
          <div className="space-y-4">
            {featuredGems.map(gem => (
              <div key={gem.id} className="card">
                <div className="flex items-start space-x-4">
                  {/* Image placeholder */}
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                    {gem.type === 'food' ? (
                      <Utensils className="w-8 h-8 text-blue-600" />
                    ) : (
                      <MapPin className="w-8 h-8 text-blue-600" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{gem.name}</h3>
                      <Heart className="w-5 h-5 text-gray-400 hover:text-red-500 cursor-pointer" />
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{gem.description}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span>{gem.rating}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{gem.distance}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        gem.type === 'food' 
                          ? 'bg-orange-100 text-orange-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {gem.type === 'food' ? 'Food Spot' : 'Attraction'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setActiveTab('attractions')}
              className="card hover:shadow-md transition-shadow duration-200 text-center p-6"
            >
              <MapPin className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Explore Attractions</h3>
              <p className="text-sm text-gray-600">Discover hidden local spots</p>
            </button>
            
            <button
              onClick={() => setActiveTab('food')}
              className="card hover:shadow-md transition-shadow duration-200 text-center p-6"
            >
              <Utensils className="w-8 h-8 text-orange-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Find Food Gems</h3>
              <p className="text-sm text-gray-600">Secret local eateries</p>
            </button>
          </div>
        </div>

        {/* New This Week */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">New This Week</h3>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              {stats.newThisWeek} new gems
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Fresh discoveries added by local explorers
          </p>
          <button className="text-blue-600 text-sm hover:underline">
            See what's new →
          </button>
        </div>
      </main>
    </div>
  )
}

export default DiscoverPage