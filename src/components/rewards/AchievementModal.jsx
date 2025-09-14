import { useState, useEffect } from 'react'
import { X, Trophy, Star, Gift, Zap, Crown, Award, Target } from 'lucide-react'

function AchievementModal({ isOpen, onClose, achievement, points = 0, isLevelUp = false, showCelebration: propShowCelebration = true }) {
  const [showCelebration, setShowCelebration] = useState(false)
  const [pointsAnimation, setPointsAnimation] = useState(false)
  const [displayPoints, setDisplayPoints] = useState(0)
  const [confettiPieces, setConfettiPieces] = useState([])
  const [showFullCelebration, setShowFullCelebration] = useState(false)

  useEffect(() => {
    if (isOpen && achievement && propShowCelebration) {
      // Create confetti pieces
      const pieces = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        emoji: ['⭐', '🎉', '✨', '🏆', '🎊', '💫'][Math.floor(Math.random() * 6)],
        left: Math.random() * 100,
        animationDelay: Math.random() * 1000,
        duration: 2000 + Math.random() * 1000
      }))
      setConfettiPieces(pieces)
      
      setShowCelebration(true)
      setShowFullCelebration(true)
      
      // Start points animation after trophy animation
      setTimeout(() => {
        setPointsAnimation(true)
        animatePoints()
      }, 800)
      
      // Stop full celebration after 3 seconds
      setTimeout(() => {
        setShowFullCelebration(false)
      }, 3000)
    } else {
      setShowCelebration(false)
      setPointsAnimation(false)
      setDisplayPoints(0)
      setConfettiPieces([])
      setShowFullCelebration(false)
    }
  }, [isOpen, achievement, points, propShowCelebration])

  const animatePoints = () => {
    if (points > 0) {
      let currentPoints = 0
      const increment = Math.ceil(points / 30) // Slower animation for better effect
      const timer = setInterval(() => {
        currentPoints += increment
        if (currentPoints >= points) {
          currentPoints = points
          clearInterval(timer)
        }
        setDisplayPoints(currentPoints)
      }, 40) // Slightly slower increment
    }
  }

  if (!isOpen || !achievement) return null

  const achievementTypes = {
    first: { bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600', icon: Trophy, particles: '🌟' },
    streak: { bgColor: 'bg-gradient-to-br from-orange-500 to-red-500', icon: Zap, particles: '🔥' },
    social: { bgColor: 'bg-gradient-to-br from-purple-500 to-pink-500', icon: Star, particles: '✨' },
    milestone: { bgColor: 'bg-gradient-to-br from-green-500 to-emerald-500', icon: Target, particles: '🎯' },
    level: { bgColor: 'bg-gradient-to-br from-yellow-500 to-amber-500', icon: Crown, particles: '👑' },
    special: { bgColor: 'bg-gradient-to-br from-indigo-500 to-purple-600', icon: Award, particles: '🏆' }
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

          {/* Celebration Background with Enhanced Confetti */}
          <div className={`${config.bgColor} relative p-8 text-center overflow-hidden`}>
            {/* Enhanced Confetti Animation */}
            {showFullCelebration && (
              <div className="absolute inset-0 pointer-events-none">
                {confettiPieces.map((piece) => (
                  <div
                    key={piece.id}
                    className="absolute text-2xl animate-bounce-in opacity-90"
                    style={{
                      left: `${piece.left}%`,
                      top: `${Math.random() * 80}%`,
                      animationDelay: `${piece.animationDelay}ms`,
                      animationDuration: `${piece.duration}ms`,
                      transform: `rotate(${Math.random() * 360}deg)`
                    }}
                  >
                    {piece.emoji}
                  </div>
                ))}
                
                {/* Particle effects specific to achievement type */}
                {[...Array(8)].map((_, i) => (
                  <div
                    key={`particle-${i}`}
                    className="absolute text-3xl animate-float opacity-80"
                    style={{
                      left: `${10 + (i * 10)}%`,
                      top: `${20 + (i % 3) * 20}%`,
                      animationDelay: `${i * 200}ms`,
                      animationDuration: `${2000 + Math.random() * 1000}ms`
                    }}
                  >
                    {config.particles}
                  </div>
                ))}
              </div>
            )}

            {/* Trophy Icon with Enhanced Celebration Animation */}
            <div className="relative z-10">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-white bg-opacity-20 mb-4 relative ${
                showCelebration ? 'animate-celebration-bounce animate-glow' : ''
              }`}>
                <IconComponent size={40} className="text-white drop-shadow-lg" />
                
                {/* Glow ring effect */}
                {showFullCelebration && (
                  <div className="absolute inset-0 rounded-full bg-white opacity-30 animate-ping" />
                )}
              </div>
              
              {/* Enhanced Level Up Badge */}
              {isLevelUp && (
                <div className="absolute -top-2 -right-2 animate-bounce-in">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
                    🚀 LEVEL UP!
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

          {/* Enhanced Points Animation */}
          {points > 0 && (
            <div className={`inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-50 to-secondary-50 text-primary-700 rounded-full mb-4 relative overflow-hidden ${
              pointsAnimation ? 'animate-points-earned animate-glow' : 'opacity-0'
            }`}>
              {/* Animated background shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer" />
              
              <Star size={16} className="text-primary-500 animate-sparkle" />
              <span className="font-bold relative z-10">
                +{displayPoints} points earned!
              </span>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
            </div>
          )}

          {/* Achievement Date */}
          {achievement.date && (
            <div className="text-sm text-gray-500 mb-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              Earned on {new Date(achievement.date).toLocaleDateString()}
            </div>
          )}

          {/* Enhanced Action Buttons */}
          <div className="flex space-x-3 mb-4 animate-fade-in" style={{ animationDelay: '0.8s' }}>
            <button className="flex-1 btn-secondary text-sm py-2 hover:animate-scale-bounce transition-all duration-200 hover:shadow-md">
              📤 Share Achievement
            </button>
            <button className="flex-1 btn-primary text-sm py-2 hover:animate-scale-bounce transition-all duration-200 hover:shadow-lg">
              📊 View Progress
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