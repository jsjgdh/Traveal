import { useState } from 'react'
import { Trophy, Medal, Star, Users, Eye, EyeOff, Crown, TrendingUp, Target } from 'lucide-react'

function Leaderboard({ currentUser, isPrivacyMode = true, onPrivacyToggle }) {
  const [timeframe, setTimeframe] = useState('weekly') // weekly, monthly, all-time
  const [category, setCategory] = useState('points') // points, trips, distance, eco

  // Mock leaderboard data (anonymized for privacy)
  const generateLeaderboard = () => {
    const baseData = {
      weekly: {
        points: [
          { rank: 1, username: 'EcoExplorer', points: 420, avatar: '🌟', level: 5, change: '+2' },
          { rank: 2, username: 'GreenCommuter', points: 380, avatar: '🚲', level: 4, change: '=' },
          { rank: 3, username: 'CityWanderer', points: 365, avatar: '🏙️', level: 4, change: '-1' },
          { rank: 4, username: 'You', points: 245, avatar: '🎯', level: 3, change: '+5', isCurrentUser: true },
          { rank: 5, username: 'BusRider', points: 220, avatar: '🚌', level: 3, change: '+1' },
          { rank: 6, username: 'BikeHero', points: 200, avatar: '🚴', level: 3, change: '-2' },
          { rank: 7, username: 'WalkMaster', points: 180, avatar: '🚶', level: 2, change: '+3' },
          { rank: 8, username: 'MetroUser', points: 165, avatar: '🚇', level: 2, change: '=' }
        ],
        trips: [
          { rank: 1, username: 'DailyCommuter', trips: 28, avatar: '🔄', level: 4 },
          { rank: 2, username: 'BusyBee', trips: 25, avatar: '🐝', level: 3 },
          { rank: 3, username: 'You', trips: 18, avatar: '🎯', level: 3, isCurrentUser: true },
          { rank: 4, username: 'WeekendWarrior', trips: 15, avatar: '⚡', level: 2 }
        ]
      }
    }

    return baseData[timeframe][category] || baseData.weekly.points
  }

  const leaderboardData = generateLeaderboard()

  // Privacy anonymization
  const getDisplayName = (user) => {
    if (user.isCurrentUser) return 'You'
    if (isPrivacyMode) {
      return `User${user.rank.toString().padStart(3, '0')}`
    }
    return user.username
  }

  const timeframes = [
    { id: 'weekly', name: 'This Week', icon: '📅' },
    { id: 'monthly', name: 'This Month', icon: '🗓️' },
    { id: 'all-time', name: 'All Time', icon: '🏆' }
  ]

  const categories = [
    { id: 'points', name: 'Points', icon: Star, suffix: 'pts' },
    { id: 'trips', name: 'Trips', icon: Target, suffix: 'trips' },
    { id: 'distance', name: 'Distance', icon: TrendingUp, suffix: 'km' },
    { id: 'eco', name: 'Eco Score', icon: '🌱', suffix: 'eco' }
  ]

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Crown size={20} className="text-yellow-500" />
      case 2: return <Medal size={20} className="text-gray-400" />
      case 3: return <Medal size={20} className="text-amber-600" />
      default: return <span className="text-gray-500 font-bold">#{rank}</span>
    }
  }

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1: return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 2: return 'bg-gray-100 text-gray-800 border-gray-200'
      case 3: return 'bg-amber-100 text-amber-800 border-amber-200'
      default: return 'bg-blue-50 text-blue-800 border-blue-200'
    }
  }

  const getTrendIcon = (change) => {
    if (change.startsWith('+')) return '↗️'
    if (change.startsWith('-')) return '↘️'
    return '➡️'
  }

  const currentUserRank = leaderboardData.find(user => user.isCurrentUser)

  return (
    <div className="space-y-6">
      {/* Header with Privacy Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Leaderboard</h2>
          <p className="text-sm text-gray-600">See how you compare with others</p>
        </div>
        
        <button
          onClick={onPrivacyToggle}
          className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          {isPrivacyMode ? <EyeOff size={16} /> : <Eye size={16} />}
          <span className="text-sm">
            {isPrivacyMode ? 'Anonymous' : 'Show Names'}
          </span>
        </button>
      </div>

      {/* Privacy Notice */}
      {isPrivacyMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <div className="text-blue-500 mt-0.5">🔐</div>
            <div>
              <div className="text-sm font-medium text-blue-900">Privacy Mode Active</div>
              <div className="text-xs text-blue-700 mt-1">
                Usernames are anonymized. Only your own position is shown.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="space-y-4">
        {/* Timeframe Filter */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {timeframes.map((tf) => (
            <button
              key={tf.id}
              onClick={() => setTimeframe(tf.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                timeframe === tf.id
                  ? 'bg-primary-100 text-primary-700 border border-primary-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{tf.icon}</span>
              <span>{tf.name}</span>
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map((cat) => {
            const IconComponent = typeof cat.icon === 'string' ? null : cat.icon
            return (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  category === cat.id
                    ? 'bg-secondary-100 text-secondary-700 border border-secondary-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {IconComponent ? (
                  <IconComponent size={16} />
                ) : (
                  <span>{cat.icon}</span>
                )}
                <span>{cat.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Current User Highlight */}
      {currentUserRank && (
        <div className="card bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${getRankBadge(currentUserRank.rank)}`}>
                {getRankIcon(currentUserRank.rank)}
              </div>
              <div>
                <div className="font-semibold text-gray-900">Your Rank</div>
                <div className="text-sm text-gray-600">
                  #{currentUserRank.rank} this {timeframe}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-primary-600">
                {currentUserRank[category] || currentUserRank.points}
                <span className="text-sm text-gray-500 ml-1">
                  {categories.find(c => c.id === category)?.suffix}
                </span>
              </div>
              {currentUserRank.change && (
                <div className="text-sm text-gray-600">
                  {getTrendIcon(currentUserRank.change)} {currentUserRank.change}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard List */}
      <div className="space-y-2">
        {leaderboardData.slice(0, 10).map((user, index) => (
          <div
            key={`${user.rank}-${user.username}`}
            className={`flex items-center justify-between p-4 rounded-lg border transition-all hover:shadow-sm ${
              user.isCurrentUser 
                ? 'bg-primary-50 border-primary-200 ring-2 ring-primary-100' 
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center space-x-3">
              {/* Rank */}
              <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-sm font-medium ${
                user.rank <= 3 ? getRankBadge(user.rank) : 'bg-gray-50 border-gray-200 text-gray-600'
              }`}>
                {user.rank <= 3 ? getRankIcon(user.rank) : `#${user.rank}`}
              </div>

              {/* Avatar & Info */}
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{user.avatar}</div>
                <div>
                  <div className={`font-medium ${user.isCurrentUser ? 'text-primary-700' : 'text-gray-900'}`}>
                    {getDisplayName(user)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Level {user.level}
                  </div>
                </div>
              </div>
            </div>

            {/* Score & Change */}
            <div className="text-right">
              <div className="font-semibold text-gray-900">
                {user[category] || user.points}
                <span className="text-sm text-gray-500 ml-1">
                  {categories.find(c => c.id === category)?.suffix}
                </span>
              </div>
              {user.change && (
                <div className="text-sm text-gray-500">
                  {getTrendIcon(user.change)} {user.change}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Community Stats */}
      <div className="card bg-gray-50">
        <div className="text-center">
          <Users size={24} className="text-gray-400 mx-auto mb-2" />
          <h3 className="font-semibold text-gray-700 mb-1">Community Stats</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-bold text-gray-900">1,247</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div>
              <div className="font-bold text-gray-900">15,632</div>
              <div className="text-gray-600">Total Trips</div>
            </div>
            <div>
              <div className="font-bold text-gray-900">42,891</div>
              <div className="text-gray-600">km Tracked</div>
            </div>
          </div>
        </div>
      </div>

      {/* Participation Opt-out */}
      <div className="text-center">
        <button className="text-gray-500 text-sm hover:text-gray-700 transition-colors">
          Opt out of leaderboards
        </button>
      </div>
    </div>
  )
}

export default Leaderboard