import { useState, useEffect } from 'react'
import { X, Trophy, Star, Gift, Zap } from 'lucide-react'

function AchievementModal({ isOpen, onClose, achievement, points = 0, isLevelUp = false }) {
  const [showCelebration, setShowCelebration] = useState(false)
  const [pointsAnimation, setPointsAnimation] = useState(false)
  const [displayPoints, setDisplayPoints] = useState(0)

  useEffect(() => {
    if (isOpen && achievement) {
      setShowCelebration(true)
      // Start points animation after trophy animation
      setTimeout(() => {
        setPointsAnimation(true)
        animatePoints()
      }, 800)
    } else {
      setShowCelebration(false)
      setPointsAnimation(false)
      setDisplayPoints(0)
    }
  }, [isOpen, achievement, points])

  const animatePoints = () => {
    if (points > 0) {
      let currentPoints = 0
      const increment = Math.ceil(points / 20) // Animate over ~1 second
      const timer = setInterval(() => {
        currentPoints += increment
        if (currentPoints >= points) {
          currentPoints = points
          clearInterval(timer)
        }
        setDisplayPoints(currentPoints)
      }, 50)
    }
  }

  if (!isOpen || !achievement) return null

  const achievementTypes = {
    first: { bgColor: 'bg-blue-500', icon: Trophy },
    streak: { bgColor: 'bg-orange-500', icon: Zap },
    social: { bgColor: 'bg-purple-500', icon: Star },
    milestone: { bgColor: 'bg-green-500', icon: Gift },
    level: { bgColor: 'bg-yellow-500', icon: Trophy }
  }

  const type = achievement.type || 'milestone'
  const config = achievementTypes[type]
  const IconComponent = config.icon

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full mx-4 overflow-hidden animate-bounce-in">
        {/* Header */}
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white bg-opacity-20 text-white hover:bg-opacity-30 transition-all"
          >
            <X size={16} />
          </button>

          {/* Celebration Background */}
          <div className={`${config.bgColor} relative p-8 text-center overflow-hidden`}>
            {/* Confetti Animation */}
            {showCelebration && (
              <div className="absolute inset-0">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute animate-bounce-in"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 0.5}s`,
                      animationDuration: `${1 + Math.random()}s`
                    }}
                  >
                    {['⭐', '🎉', '✨', '🏆'][Math.floor(Math.random() * 4)]}
                  </div>
                ))}
              </div>
            )}

            {/* Trophy Icon with Celebration Animation */}
            <div className="relative z-10">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-white bg-opacity-20 mb-4 ${showCelebration ? 'animate-celebration-bounce' : ''}`}>
                <IconComponent size={40} className="text-white" />
              </div>
              
              {isLevelUp && (
                <div className="absolute -top-2 -right-2 animate-pulse">
                  <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                    LEVEL UP!
                  </div>
                </div>
              )}
            </div>

            {/* Achievement Icon */}
            {achievement.icon && (
              <div className="text-4xl mb-2 animate-bounce-in" style={{ animationDelay: '0.3s' }}>
                {achievement.icon}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2 animate-slide-up">
            {isLevelUp ? 'Level Up!' : 'Achievement Unlocked!'}
          </h2>
          
          <h3 className="text-lg font-semibold text-gray-800 mb-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {achievement.name}
          </h3>
          
          <p className="text-gray-600 mb-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            {achievement.description}
          </p>

          {/* Points Animation */}
          {points > 0 && (
            <div className={`inline-flex items-center space-x-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-full mb-4 ${pointsAnimation ? 'animate-points-earned' : 'opacity-0'}`}>
              <Star size={16} className="text-primary-500" />
              <span className="font-bold">
                +{displayPoints} points earned!
              </span>
            </div>
          )}

          {/* Achievement Date */}
          {achievement.date && (
            <div className="text-sm text-gray-500 mb-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              Earned on {new Date(achievement.date).toLocaleDateString()}
            </div>
          )}

          {/* Share Options */}
          <div className="flex space-x-3 mb-4 animate-fade-in" style={{ animationDelay: '0.8s' }}>
            <button className="flex-1 btn-secondary text-sm py-2">
              Share Achievement
            </button>
            <button className="flex-1 btn-primary text-sm py-2">
              View Progress
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full text-gray-500 text-sm hover:text-gray-700 transition-colors animate-fade-in"
            style={{ animationDelay: '1s' }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}

export default AchievementModal