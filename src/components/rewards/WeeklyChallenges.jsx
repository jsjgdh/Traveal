import { useState, useEffect } from 'react'
import { Calendar, Clock, Star, Target, Zap, CheckCircle, Gift, ChevronRight } from 'lucide-react'

function WeeklyChallenges({ challenges, onChallengeClick, userProgress }) {
  const [timeLeft, setTimeLeft] = useState('')

  // Default challenges if not provided
  const defaultChallenges = [
    {
      id: 'green-week',
      name: 'Green Week Challenge',
      description: 'Use public transport or bike for 5 trips',
      type: 'environmental',
      target: 5,
      progress: 3,
      reward: 50,
      icon: '🚲',
      difficulty: 'medium',
      isActive: true,
      endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000) // 4 days from now
    },
    {
      id: 'early-commuter',
      name: 'Early Commuter',
      description: 'Start 3 trips before 8 AM',
      type: 'timing',
      target: 3,
      progress: 1,
      reward: 30,
      icon: '🌅',
      difficulty: 'easy',
      isActive: true,
      endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000) // 6 days from now
    },
    {
      id: 'social-sharer',
      name: 'Social Sharer',
      description: 'Share your achievements 2 times',
      type: 'social',
      target: 2,
      progress: 0,
      reward: 25,
      icon: '📱',
      difficulty: 'easy',
      isActive: true,
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
    },
    {
      id: 'distance-warrior',
      name: 'Distance Warrior',
      description: 'Travel a total of 100km this week',
      type: 'distance',
      target: 100,
      progress: 65,
      reward: 75,
      icon: '🎯',
      difficulty: 'hard',
      isActive: true,
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
    }
  ]

  const allChallenges = challenges || defaultChallenges
  const activeChallenges = allChallenges.filter(c => c.isActive)

  // Calculate time remaining for the week
  useEffect(() => {
    const updateTimeLeft = () => {
      const now = new Date()
      const endOfWeek = new Date(now)
      endOfWeek.setDate(now.getDate() + (7 - now.getDay())) // End of current week
      endOfWeek.setHours(23, 59, 59, 999)
      
      const diff = endOfWeek - now
      
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        
        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h left`)
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m left`)
        } else {
          setTimeLeft(`${minutes}m left`)
        }
      } else {
        setTimeLeft('Expired')
      }
    }

    updateTimeLeft()
    const timer = setInterval(updateTimeLeft, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [])

  const difficultyColors = {
    easy: 'bg-green-100 text-green-700 border-green-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    hard: 'bg-red-100 text-red-700 border-red-200'
  }

  const typeIcons = {
    environmental: '🌱',
    timing: '⏰',
    social: '👥',
    distance: '📏',
    frequency: '🔄'
  }

  const getTotalPossibleRewards = () => {
    return activeChallenges.reduce((total, challenge) => total + challenge.reward, 0)
  }

  const getTotalEarnedRewards = () => {
    return activeChallenges.reduce((total, challenge) => {
      return total + (challenge.progress >= challenge.target ? challenge.reward : 0)
    }, 0)
  }

  const getCompletedChallenges = () => {
    return activeChallenges.filter(challenge => challenge.progress >= challenge.target).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Weekly Challenges</h2>
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Clock size={16} />
            <span>{timeLeft}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Target size={16} />
            <span>{getCompletedChallenges()}/{activeChallenges.length} completed</span>
          </div>
        </div>
      </div>

      {/* Weekly Progress Overview */}
      <div className="card bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-100">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">This Week's Progress</h3>
            <p className="text-sm text-gray-600">
              Complete challenges to earn rewards
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-primary-600">
              {getTotalEarnedRewards()}/{getTotalPossibleRewards()}
            </div>
            <div className="text-xs text-gray-500">points</div>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-500"
            style={{ 
              width: `${(getTotalEarnedRewards() / getTotalPossibleRewards()) * 100}%` 
            }}
          />
        </div>
      </div>

      {/* Challenge List */}
      <div className="space-y-4">
        {activeChallenges.map((challenge) => {
          const progressPercentage = Math.min((challenge.progress / challenge.target) * 100, 100)
          const isCompleted = challenge.progress >= challenge.target
          
          return (
            <button
              key={challenge.id}
              onClick={() => onChallengeClick && onChallengeClick(challenge)}
              className="w-full card hover:shadow-lg transition-all duration-200 text-left"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{challenge.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{challenge.name}</h3>
                      {isCompleted && (
                        <CheckCircle size={16} className="text-green-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {challenge.description}
                    </p>
                    
                    {/* Challenge Tags */}
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded-full border ${difficultyColors[challenge.difficulty]}`}>
                        {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                        {typeIcons[challenge.type]} {challenge.type}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right ml-4">
                  <div className="flex items-center space-x-1 text-primary-600 font-semibold">
                    <Star size={14} />
                    <span className="text-sm">+{challenge.reward}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {Math.floor((challenge.endDate - new Date()) / (1000 * 60 * 60 * 24))}d left
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {challenge.progress} / {challenge.target}
                    {challenge.type === 'distance' ? ' km' : 
                     challenge.type === 'timing' ? ' trips' : 
                     challenge.type === 'social' ? ' shares' : ' times'}
                  </span>
                  <span className={`font-medium ${isCompleted ? 'text-green-600' : 'text-primary-600'}`}>
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      isCompleted 
                        ? 'bg-gradient-to-r from-green-400 to-green-500 animate-pulse-slow' 
                        : 'bg-gradient-to-r from-primary-400 to-secondary-500'
                    }`}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Completion Status */}
              {isCompleted && (
                <div className="mt-3 p-2 bg-green-50 text-green-700 rounded-lg text-sm text-center font-medium animate-bounce-in">
                  🎉 Challenge Complete! Tap to claim reward
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Next Week Preview */}
      <div className="card bg-gray-50 border-dashed border-2 border-gray-300">
        <div className="text-center">
          <Calendar size={32} className="text-gray-400 mx-auto mb-2" />
          <h3 className="font-semibold text-gray-700 mb-1">Next Week's Challenges</h3>
          <p className="text-sm text-gray-500 mb-3">
            Complete this week's challenges to unlock next week's rewards
          </p>
          <button className="text-primary-600 text-sm font-medium hover:text-primary-700 transition-colors">
            Preview Challenges <ChevronRight size={14} className="inline ml-1" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default WeeklyChallenges