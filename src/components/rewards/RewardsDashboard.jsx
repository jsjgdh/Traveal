import { useState, useEffect } from 'react'
import { Gift, Trophy, Star, Target, Calendar, Zap, Map, Users, Clock, ChevronRight, Award, TrendingUp } from 'lucide-react'

function RewardsDashboard({ userStats, onRedeemRewards, onAchievementClick, onShowAchievementModal }) {
  const [selectedLevel, setSelectedLevel] = useState(null)
  const [showLevelUpAnimation, setShowLevelUpAnimation] = useState(false)
  const [pointsGained, setPointsGained] = useState(0)

  // Default user stats if not provided
  const defaultStats = {
    currentLevel: 3,
    currentLevelName: 'Explorer',
    currentPoints: 245,
    nextLevelPoints: 300,
    totalPoints: 1245,
    achievements: [
      { id: 'first-trip', name: 'First Journey', icon: '🚗', description: 'Complete your first trip', earned: true, date: '2024-01-15' },
      { id: 'week-streak', name: 'Week Warrior', icon: '🔥', description: '7 days of consistent tracking', earned: true, date: '2024-02-01' },
      { id: 'eco-champion', name: 'Eco Champion', icon: '🌱', description: 'Use sustainable transport 10 times', earned: true, date: '2024-02-10' },
      { id: 'data-contributor', name: 'Data Contributor', icon: '📊', description: 'Share 50 trips', earned: false, progress: 32 },
      { id: 'social-explorer', name: 'Social Explorer', icon: '👥', description: 'Invite 3 friends', earned: false, progress: 1 },
      { id: 'distance-master', name: 'Distance Master', icon: '🎯', description: 'Travel 1000km', earned: false, progress: 650 }
    ],
    weeklyChallenge: {
      name: 'Green Week Challenge',
      description: 'Use public transport or bike for 5 trips',
      progress: 3,
      target: 5,
      reward: 50,
      timeLeft: '4 days',
      icon: '🚲'
    }
  }

  const stats = { ...defaultStats, ...userStats }
  const progressPercentage = (stats.currentPoints / stats.nextLevelPoints) * 100
  const earnedAchievements = stats.achievements.filter(a => a.earned)
  const recentAchievements = earnedAchievements.slice(-3)

  // Check for level up animation
  useEffect(() => {
    if (userStats?.levelUpAnimation) {
      setShowLevelUpAnimation(true)
      setPointsGained(userStats.pointsGained || 0)
      setTimeout(() => setShowLevelUpAnimation(false), 3000)
    }
  }, [userStats?.levelUpAnimation])

  const levelBenefits = {
    1: ['Basic tracking', 'Weekly summaries'],
    2: ['Achievement badges', 'Monthly reports'],
    3: ['Leaderboards', 'Custom goals', 'Priority support'],
    4: ['Advanced analytics', 'Export data', 'Beta features'],
    5: ['VIP rewards', 'Personal insights', 'Expert consultation']
  }

  return (
    <div className="space-y-6">
      {/* Level Progress Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Level {stats.currentLevel} {stats.currentLevelName}
            </h2>
            <p className="text-sm text-gray-600">
              {stats.nextLevelPoints - stats.currentPoints} points to next level
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary-600">
              {stats.currentPoints}
            </div>
            <div className="text-sm text-gray-500">
              /{stats.nextLevelPoints} pts
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progress to Level {stats.currentLevel + 1}</span>
            <span className="text-primary-600 font-medium">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
            <div
              className={`bg-gradient-to-r from-primary-500 to-secondary-500 h-3 rounded-full transition-all duration-700 ease-out ${
                showLevelUpAnimation ? 'animate-level-up animate-glow' : 'animate-pulse-slow'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
            {/* Sparkle effect for level progress */}
            {progressPercentage > 50 && (
              <div className="absolute top-0 left-1/2 w-2 h-2 bg-yellow-300 rounded-full animate-sparkle opacity-70" />
            )}
          </div>
          {/* Level up notification */}
          {showLevelUpAnimation && (
            <div className="animate-bounce-in bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-bold py-2 px-4 rounded-lg text-center">
              🎉 Level Up! You reached Level {stats.currentLevel}! +{pointsGained} points!
            </div>
          )}
        </div>

        {/* Level Benefits */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Level {stats.currentLevel} Benefits:</h4>
          <div className="flex flex-wrap gap-2">
            {levelBenefits[stats.currentLevel]?.map((benefit, index) => (
              <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-700">
                {benefit}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Achievements</h3>
          <button 
            onClick={() => onAchievementClick && onAchievementClick('all')}
            className="text-primary-600 text-sm font-medium hover:text-primary-700 transition-colors"
          >
            View All
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {recentAchievements.map((achievement, index) => (
            <button
              key={achievement.id}
              onClick={() => {
                onAchievementClick && onAchievementClick(achievement)
                onShowAchievementModal && onShowAchievementModal(achievement)
              }}
              className="flex flex-col items-center p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg hover:from-primary-50 hover:to-secondary-50 hover:scale-105 transition-all duration-300 animate-fade-in group relative"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Achievement glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              
              <div className="text-2xl mb-2 group-hover:animate-bounce">{achievement.icon}</div>
              <div className="text-xs font-medium text-gray-900 text-center group-hover:text-primary-700 transition-colors">
                {achievement.name}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(achievement.date).toLocaleDateString()}
              </div>
              
              {/* New achievement indicator */}
              {achievement.isNew && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Weekly Challenge */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{stats.weeklyChallenge.icon}</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {stats.weeklyChallenge.name}
              </h3>
              <p className="text-sm text-gray-600">
                {stats.weeklyChallenge.description}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-primary-600">
              +{stats.weeklyChallenge.reward}
            </div>
            <div className="text-xs text-gray-500">points</div>
          </div>
        </div>

        {/* Challenge Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              {stats.weeklyChallenge.progress} / {stats.weeklyChallenge.target} completed
            </span>
            <span className="text-orange-600 font-medium animate-pulse">
              ⏰ {stats.weeklyChallenge.timeLeft} left
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 relative overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-400 to-yellow-500 h-2 rounded-full transition-all duration-500 ease-out animate-pulse-slow"
              style={{ 
                width: `${(stats.weeklyChallenge.progress / stats.weeklyChallenge.target) * 100}%` 
              }}
            />
            {/* Progress sparkle */}
            {stats.weeklyChallenge.progress > 0 && (
              <div className="absolute top-0 right-2 w-1 h-1 bg-yellow-300 rounded-full animate-sparkle" />
            )}
          </div>
        </div>

        {/* Challenge Status */}
        {stats.weeklyChallenge.progress >= stats.weeklyChallenge.target ? (
          <div className="mt-3 p-2 bg-green-50 text-green-700 rounded-lg text-sm text-center font-medium">
            🎉 Challenge Complete! Claim your reward
          </div>
        ) : (
          <div className="mt-3 p-2 bg-blue-50 text-blue-700 rounded-lg text-sm text-center">
            Keep going! You're almost there
          </div>
        )}
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card text-center">
          <div className="text-2xl text-purple-600 mb-2">🏆</div>
          <div className="text-lg font-bold text-gray-900">{earnedAchievements.length}</div>
          <div className="text-sm text-gray-600">Achievements</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl text-blue-600 mb-2">⭐</div>
          <div className="text-lg font-bold text-gray-900">{stats.totalPoints}</div>
          <div className="text-sm text-gray-600">Total Points</div>
        </div>
      </div>

      {/* Redeem Rewards Button */}
      <button
        onClick={onRedeemRewards}
        className="w-full btn-primary flex items-center justify-center space-x-2 animate-bounce-in hover:animate-scale-bounce relative overflow-hidden group"
      >
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-secondary-500 to-primary-600 bg-size-200 animate-shimmer group-hover:animate-pulse opacity-0 group-hover:opacity-20 transition-opacity" />
        
        <Gift size={20} className="group-hover:animate-bounce" />
        <span className="font-semibold">Redeem Rewards</span>
        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
        
        {/* Reward count indicator */}
        {earnedAchievements.length > 0 && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
            {earnedAchievements.length}
          </div>
        )}
      </button>
    </div>
  )
}

export default RewardsDashboard