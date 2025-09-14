import React, { useState, useEffect } from 'react'
import { Trophy, Star, Gift, Sparkles, Crown, Award, Zap, Target } from 'lucide-react'
import { useNotifications, NOTIFICATION_TYPES, NOTIFICATION_PRIORITY } from './NotificationProvider'

function AchievementNotification({ achievement, onDismiss, onShare, onViewRewards }) {
  const { addNotification } = useNotifications()
  const [isVisible, setIsVisible] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    if (achievement) {
      setIsVisible(true)
      setShowConfetti(true)
      
      // Send push notification
      addNotification({
        type: NOTIFICATION_TYPES.ACHIEVEMENT,
        priority: NOTIFICATION_PRIORITY.HIGH,
        title: '🎉 Achievement Unlocked!',
        message: `You earned "${achievement.name}" - ${achievement.description}`,
        actionText: 'View Rewards',
        showBanner: false,
        onAction: onViewRewards,
        data: { achievementId: achievement.id }
      })

      // Auto-hide confetti after animation
      setTimeout(() => setShowConfetti(false), 3000)
    }
  }, [achievement, addNotification, onViewRewards])

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(() => onDismiss?.(), 300)
  }

  const getAchievementIcon = () => {
    if (achievement?.category) {
      switch (achievement.category) {
        case 'distance':
          return <Target size={32} className="text-yellow-500" />
        case 'streak':
          return <Zap size={32} className="text-orange-500" />
        case 'social':
          return <Crown size={32} className="text-purple-500" />
        case 'environmental':
          return <Star size={32} className="text-green-500" />
        default:
          return <Trophy size={32} className="text-yellow-500" />
      }
    }
    return <Trophy size={32} className="text-yellow-500" />
  }

  const getRarityColor = () => {
    switch (achievement?.rarity) {
      case 'legendary':
        return 'from-purple-500 to-pink-500'
      case 'epic':
        return 'from-purple-500 to-blue-500'
      case 'rare':
        return 'from-blue-500 to-green-500'
      case 'common':
        return 'from-green-500 to-yellow-500'
      default:
        return 'from-yellow-500 to-orange-500'
    }
  }

  const getPointsReward = () => {
    switch (achievement?.rarity) {
      case 'legendary':
        return 500
      case 'epic':
        return 200
      case 'rare':
        return 100
      case 'common':
        return 50
      default:
        return achievement?.points || 100
    }
  }

  if (!achievement) return null

  return (
    <>
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 rounded-full animate-confetti`}
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: `hsl(${Math.random() * 360}, 70%, 60%)`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Achievement Modal */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleDismiss}
      >
        <div 
          className={`bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl transform transition-all duration-500 ${
            isVisible ? 'scale-100 animate-achievement-unlock' : 'scale-95'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Gradient Background */}
          <div className={`bg-gradient-to-br ${getRarityColor()} p-6 text-white text-center relative overflow-hidden`}>
            {/* Sparkle animations */}
            <div className="absolute inset-0 opacity-30">
              {[...Array(6)].map((_, i) => (
                <Sparkles
                  key={i}
                  size={16}
                  className={`absolute animate-sparkle`}
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${i * 0.5}s`
                  }}
                />
              ))}
            </div>
            
            <div className="relative z-10">
              <div className="mb-4 animate-bounce-in">
                {getAchievementIcon()}
              </div>
              
              <h2 className="text-xl font-bold mb-2 animate-level-up-text">
                🎉 Achievement Unlocked!
              </h2>
              
              <div className="bg-white bg-opacity-20 rounded-full px-3 py-1 inline-block">
                <span className="text-sm font-medium uppercase tracking-wide">
                  {achievement.rarity || 'Achievement'}
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Achievement Info */}
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {achievement.name}
              </h3>
              <p className="text-gray-600 mb-4">
                {achievement.description}
              </p>
              
              {/* Points Earned */}
              <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-4 animate-points-earned">
                <div className="flex items-center justify-center space-x-2">
                  <Star size={20} className="text-yellow-600" />
                  <span className="text-lg font-bold text-yellow-700">
                    +{getPointsReward()} Points
                  </span>
                </div>
                <p className="text-sm text-yellow-600 mt-1">
                  Added to your rewards balance
                </p>
              </div>
            </div>

            {/* Achievement Details Toggle */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              {showDetails ? 'Hide details' : 'Show details'}
            </button>

            {/* Expanded Details */}
            {showDetails && (
              <div className="space-y-3 animate-slide-down">
                <div className="border-t pt-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="font-medium text-gray-900">Category</div>
                      <div className="text-gray-600 capitalize">
                        {achievement.category || 'General'}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="font-medium text-gray-900">Earned</div>
                      <div className="text-gray-600">
                        {achievement.earnedAt ? 
                          new Date(achievement.earnedAt).toLocaleDateString() : 
                          'Just now'
                        }
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress towards next achievement */}
                {achievement.nextAchievement && (
                  <div className="border-t pt-3">
                    <h4 className="font-medium text-gray-900 mb-2">Up Next</h4>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {achievement.nextAchievement.name}
                      </div>
                      <div className="text-xs text-gray-600 mb-2">
                        {achievement.nextAchievement.description}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${achievement.nextAchievement.progress || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              {onShare && (
                <button
                  onClick={() => {
                    onShare(achievement)
                    handleDismiss()
                  }}
                  className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  📤 Share
                </button>
              )}
              
              <button
                onClick={() => {
                  onViewRewards?.()
                  handleDismiss()
                }}
                className="flex-1 btn-primary flex items-center justify-center space-x-2"
              >
                <Gift size={16} />
                <span>View Rewards</span>
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default AchievementNotification