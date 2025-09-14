import React, { useState, useEffect } from 'react'
import { Target, Clock, Star, Zap, Trophy, ChevronRight, Calendar, Gift } from 'lucide-react'
import { useNotifications, NOTIFICATION_TYPES, NOTIFICATION_PRIORITY } from './NotificationProvider'

function ChallengeNotification({ challenge, onAccept, onDecline, onViewProgress }) {
  const { addNotification } = useNotifications()
  const [timeLeft, setTimeLeft] = useState(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (challenge) {
      setIsVisible(true)
      
      // Send push notification for new challenge
      if (challenge.isNew) {
        addNotification({
          type: NOTIFICATION_TYPES.CHALLENGE,
          priority: NOTIFICATION_PRIORITY.MEDIUM,
          title: '🎯 New Challenge Available!',
          message: `${challenge.name} - Earn ${challenge.reward} points`,
          actionText: 'View Challenge',
          data: { challengeId: challenge.id }
        })
      }
      
      // Send progress update notification
      if (challenge.progressUpdate) {
        addNotification({
          type: NOTIFICATION_TYPES.CHALLENGE,
          priority: NOTIFICATION_PRIORITY.LOW,
          title: 'Challenge Progress',
          message: `${challenge.name}: ${challenge.progress}/${challenge.target} completed`,
          data: { challengeId: challenge.id, progress: challenge.progress }
        })
      }
      
      // Send completion notification
      if (challenge.completed) {
        addNotification({
          type: NOTIFICATION_TYPES.CHALLENGE,
          priority: NOTIFICATION_PRIORITY.HIGH,
          title: '🎉 Challenge Complete!',
          message: `You completed "${challenge.name}" and earned ${challenge.reward} points!`,
          actionText: 'Claim Reward',
          data: { challengeId: challenge.id, completed: true }
        })
      }
    }
  }, [challenge, addNotification])

  // Calculate time left for challenge
  useEffect(() => {
    if (challenge?.endDate) {
      const updateTimeLeft = () => {
        const now = new Date()
        const endDate = new Date(challenge.endDate)
        const remaining = endDate - now
        
        if (remaining <= 0) {
          setTimeLeft('Expired')
        } else {
          const days = Math.floor(remaining / (1000 * 60 * 60 * 24))
          const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          
          if (days > 0) {
            setTimeLeft(`${days}d ${hours}h`)
          } else {
            setTimeLeft(`${hours}h`)
          }
        }
      }
      
      updateTimeLeft()
      const interval = setInterval(updateTimeLeft, 60000) // Update every minute
      
      return () => clearInterval(interval)
    }
  }, [challenge?.endDate])

  const getChallengeIcon = () => {
    switch (challenge?.type) {
      case 'distance':
        return <Target size={24} className="text-blue-600" />
      case 'frequency':
        return <Calendar size={24} className="text-green-600" />
      case 'streak':
        return <Zap size={24} className="text-orange-600" />
      case 'environmental':
        return <Star size={24} className="text-green-600" />
      default:
        return <Trophy size={24} className="text-purple-600" />
    }
  }

  const getDifficultyColor = () => {
    switch (challenge?.difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'hard':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getProgressPercentage = () => {
    if (!challenge?.target) return 0
    return Math.min((challenge.progress / challenge.target) * 100, 100)
  }

  const handleAccept = () => {
    onAccept?.(challenge)
    setIsVisible(false)
  }

  const handleDecline = () => {
    onDecline?.(challenge)
    setIsVisible(false)
  }

  if (!challenge) return null

  return (
    <div className={`fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ${
      isVisible ? 'translate-y-0' : 'translate-y-full'
    }`}>
      <div className="bg-white border-t border-gray-200 shadow-2xl max-w-sm mx-auto">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              {getChallengeIcon()}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900">
                  {challenge.isNew ? 'New Challenge!' : 'Challenge Update'}
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getDifficultyColor()}`}>
                  {challenge.difficulty || 'Medium'}
                </span>
              </div>
              {timeLeft && (
                <p className="text-sm text-orange-600">
                  ⏰ {timeLeft} remaining
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Challenge Content */}
        <div className="p-4 space-y-4">
          {/* Challenge Details */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">
              {challenge.name}
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              {challenge.description}
            </p>

            {/* Reward Display */}
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
              <div className="flex items-center space-x-2">
                <Gift size={16} className="text-yellow-600" />
                <span className="text-sm font-medium text-yellow-700">
                  Reward
                </span>
              </div>
              <span className="font-bold text-yellow-700">
                +{challenge.reward} points
              </span>
            </div>
          </div>

          {/* Progress Bar (if challenge is active) */}
          {challenge.progress !== undefined && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium text-gray-900">
                  {challenge.progress} / {challenge.target}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-700 ${
                    challenge.completed 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 animate-level-up'
                      : 'bg-gradient-to-r from-purple-500 to-blue-500'
                  }`}
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
              {challenge.completed && (
                <div className="text-center text-sm font-medium text-green-600 animate-bounce-in">
                  🎉 Challenge Complete!
                </div>
              )}
            </div>
          )}

          {/* Challenge Milestones */}
          {challenge.milestones && challenge.milestones.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-gray-900">Milestones</h5>
              <div className="space-y-1">
                {challenge.milestones.map((milestone, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-2 text-xs p-2 rounded ${
                      milestone.completed
                        ? 'bg-green-50 text-green-700'
                        : 'bg-gray-50 text-gray-600'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      milestone.completed ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                    <span>{milestone.description}</span>
                    {milestone.completed && <span>✅</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            {challenge.isNew && !challenge.accepted ? (
              <div className="flex space-x-3">
                <button
                  onClick={handleDecline}
                  className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Maybe Later
                </button>
                <button
                  onClick={handleAccept}
                  className="flex-1 btn-primary"
                >
                  Accept Challenge
                </button>
              </div>
            ) : challenge.completed ? (
              <button
                onClick={() => onViewProgress?.(challenge)}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                <Gift size={16} />
                <span>Claim Reward</span>
              </button>
            ) : (
              <button
                onClick={() => onViewProgress?.(challenge)}
                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-sm font-medium text-gray-900">
                  View Full Challenge
                </span>
                <ChevronRight size={16} className="text-gray-600" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChallengeNotification