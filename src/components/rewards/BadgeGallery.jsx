import { useState } from 'react'
import { Lock, Calendar, Star, Trophy, Target, Zap, Users, Map, Clock, Gift } from 'lucide-react'

function BadgeGallery({ achievements, onAchievementClick, showAll = false }) {
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('recent') // recent, alphabetical, rarity

  // Default achievements if not provided
  const defaultAchievements = [
    { 
      id: 'first-trip', 
      name: 'First Journey', 
      icon: '🚗', 
      description: 'Complete your first trip',
      category: 'milestone',
      rarity: 'common',
      earned: true, 
      date: '2024-01-15',
      points: 10
    },
    { 
      id: 'week-streak', 
      name: 'Week Warrior', 
      icon: '🔥', 
      description: '7 days of consistent tracking',
      category: 'streak',
      rarity: 'uncommon',
      earned: true, 
      date: '2024-02-01',
      points: 25
    },
    { 
      id: 'eco-champion', 
      name: 'Eco Champion', 
      icon: '🌱', 
      description: 'Use sustainable transport 10 times',
      category: 'environment',
      rarity: 'rare',
      earned: true, 
      date: '2024-02-10',
      points: 50
    },
    { 
      id: 'data-contributor', 
      name: 'Data Contributor', 
      icon: '📊', 
      description: 'Share 50 trips',
      category: 'milestone',
      rarity: 'uncommon',
      earned: false, 
      progress: 32,
      target: 50,
      points: 30
    },
    { 
      id: 'social-explorer', 
      name: 'Social Explorer', 
      icon: '👥', 
      description: 'Invite 3 friends',
      category: 'social',
      rarity: 'rare',
      earned: false, 
      progress: 1,
      target: 3,
      points: 40
    },
    { 
      id: 'distance-master', 
      name: 'Distance Master', 
      icon: '🎯', 
      description: 'Travel 1000km total',
      category: 'milestone',
      rarity: 'epic',
      earned: false, 
      progress: 650,
      target: 1000,
      points: 100
    },
    { 
      id: 'early-bird', 
      name: 'Early Bird', 
      icon: '🌅', 
      description: 'Start 10 trips before 7 AM',
      category: 'time',
      rarity: 'uncommon',
      earned: false, 
      progress: 3,
      target: 10,
      points: 25
    },
    { 
      id: 'night-owl', 
      name: 'Night Owl', 
      icon: '🦉', 
      description: 'Complete 10 trips after 10 PM',
      category: 'time',
      rarity: 'uncommon',
      earned: false, 
      progress: 0,
      target: 10,
      points: 25
    },
    { 
      id: 'speed-demon', 
      name: 'Speed Demon', 
      icon: '⚡', 
      description: 'Complete a trip over 100km/h average',
      category: 'special',
      rarity: 'epic',
      earned: false,
      points: 75
    },
    { 
      id: 'marathon-traveler', 
      name: 'Marathon Traveler', 
      icon: '🏃', 
      description: 'Complete a single trip over 42km',
      category: 'special',
      rarity: 'rare',
      earned: false,
      points: 60
    }
  ]

  const allAchievements = achievements || defaultAchievements

  const categories = [
    { id: 'all', name: 'All', icon: Trophy },
    { id: 'milestone', name: 'Milestones', icon: Target },
    { id: 'streak', name: 'Streaks', icon: Zap },
    { id: 'environment', name: 'Eco', icon: '🌱' },
    { id: 'social', name: 'Social', icon: Users },
    { id: 'time', name: 'Time', icon: Clock },
    { id: 'special', name: 'Special', icon: Star }
  ]

  const rarityColors = {
    common: 'border-gray-300 bg-gray-50',
    uncommon: 'border-green-300 bg-green-50',
    rare: 'border-blue-300 bg-blue-50',
    epic: 'border-purple-300 bg-purple-50',
    legendary: 'border-yellow-300 bg-yellow-50'
  }

  const rarityLabels = {
    common: 'Common',
    uncommon: 'Uncommon',
    rare: 'Rare',
    epic: 'Epic',
    legendary: 'Legendary'
  }

  // Filter achievements
  const filteredAchievements = allAchievements.filter(achievement => {
    if (filter === 'all') return true
    return achievement.category === filter
  })

  // Sort achievements
  const sortedAchievements = [...filteredAchievements].sort((a, b) => {
    switch (sortBy) {
      case 'alphabetical':
        return a.name.localeCompare(b.name)
      case 'rarity':
        const rarityOrder = { legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 }
        return (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0)
      case 'recent':
      default:
        // Earned achievements first (by date), then unearned
        if (a.earned && b.earned) {
          return new Date(b.date) - new Date(a.date)
        }
        if (a.earned && !b.earned) return -1
        if (!a.earned && b.earned) return 1
        return 0
    }
  })

  const earnedCount = allAchievements.filter(a => a.earned).length
  const totalCount = allAchievements.length

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="text-center">
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {earnedCount}/{totalCount}
        </div>
        <div className="text-sm text-gray-600">Achievements Unlocked</div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2 relative overflow-hidden">
          <div
            className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-500 animate-pulse-slow"
            style={{ width: `${(earnedCount / totalCount) * 100}%` }}
          />
          {/* Progress sparkle */}
          {earnedCount > 0 && (
            <div className="absolute top-0 right-2 w-1 h-1 bg-yellow-300 rounded-full animate-sparkle" />
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        {/* Category Filter */}
        <div className="flex overflow-x-auto space-x-2 pb-2">
          {categories.map((category) => {
            const IconComponent = typeof category.icon === 'string' ? null : category.icon
            return (
              <button
                key={category.id}
                onClick={() => setFilter(category.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === category.id
                    ? 'bg-primary-100 text-primary-700 border border-primary-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {IconComponent ? (
                  <IconComponent size={16} />
                ) : (
                  <span className="text-sm">{category.icon}</span>
                )}
                <span>{category.name}</span>
              </button>
            )
          })}
        </div>

        {/* Sort Options */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            {filteredAchievements.length} achievement{filteredAchievements.length !== 1 ? 's' : ''}
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white"
          >
            <option value="recent">Recent First</option>
            <option value="alphabetical">A-Z</option>
            <option value="rarity">Rarity</option>
          </select>
        </div>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-2 gap-4">
        {sortedAchievements.map((achievement, index) => (
          <button
            key={achievement.id}
            onClick={() => onAchievementClick && onAchievementClick(achievement)}
            className={`relative p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-lg group ${
              achievement.earned
                ? `${rarityColors[achievement.rarity]} animate-fade-in hover:scale-105 hover:animate-glow`
                : 'border-gray-200 bg-gray-100 opacity-60 hover:opacity-80'
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Rarity Badge */}
            {achievement.earned && (
              <div className={`absolute -top-1 -right-1 text-xs px-2 py-1 bg-white rounded-full border shadow-sm font-medium animate-fade-in ${
                achievement.rarity === 'legendary' ? 'text-yellow-700 border-yellow-300 animate-glow' :
                achievement.rarity === 'epic' ? 'text-purple-700 border-purple-300' :
                achievement.rarity === 'rare' ? 'text-blue-700 border-blue-300' :
                'text-gray-700 border-gray-200'
              }`}>
                {rarityLabels[achievement.rarity]}
              </div>
            )}

            {/* Lock Icon for Unearned */}
            {!achievement.earned && (
              <div className="absolute top-2 right-2">
                <Lock size={16} className="text-gray-400" />
              </div>
            )}

            {/* Achievement Icon */}
            <div className={`text-3xl mb-2 transition-all duration-300 ${
              !achievement.earned ? 'grayscale' : 'group-hover:animate-bounce'
            }`}>
              {achievement.icon}
            </div>

            {/* Achievement Name */}
            <div className={`text-sm font-semibold mb-1 transition-colors ${
              achievement.earned ? 'text-gray-900 group-hover:text-primary-700' : 'text-gray-500'
            }`}>
              {achievement.name}
            </div>

            {/* Progress or Date */}
            {achievement.earned ? (
              <div className="text-xs text-gray-500">
                {new Date(achievement.date).toLocaleDateString()}
              </div>
            ) : achievement.progress !== undefined ? (
              <div className="space-y-1">
                <div className="text-xs text-gray-500">
                  {achievement.progress}/{achievement.target}
                </div>
                <div className="w-full bg-gray-300 rounded-full h-1 relative overflow-hidden">
                  <div
                    className="bg-primary-400 h-1 rounded-full transition-all duration-300 animate-pulse-slow"
                    style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                  />
                  {/* Progress indicator */}
                  {achievement.progress > 0 && (
                    <div className="absolute top-0 right-0 w-0.5 h-0.5 bg-yellow-400 rounded-full animate-sparkle" />
                  )}
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-500">
                Locked
              </div>
            )}

            {/* Points */}
            <div className={`absolute bottom-2 left-2 text-xs font-medium transition-colors ${
              achievement.earned ? 'text-primary-600 group-hover:text-primary-700' : 'text-gray-400'
            }`}>
              +{achievement.points} pts
            </div>
            
            {/* Hover glow effect */}
            {achievement.earned && (
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary-100 to-secondary-100 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
            )}
          </button>
        ))}
      </div>

      {/* Show More Button (if not showing all) */}
      {!showAll && sortedAchievements.length > 6 && (
        <div className="text-center">
          <button className="text-primary-600 font-medium text-sm hover:text-primary-700 transition-colors">
            Show More Achievements
          </button>
        </div>
      )}
    </div>
  )
}

export default BadgeGallery