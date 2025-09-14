import { useState, useEffect } from 'react'
import { Gift, Trophy, Star, Target, Users, Calendar, TrendingUp, Sparkles } from 'lucide-react'
import { RewardsDashboard, AchievementModal, BadgeGallery, WeeklyChallenges, Leaderboard } from '../components/rewards'
import { useNotifications, NOTIFICATION_TYPES, NOTIFICATION_PRIORITY, AchievementNotification, ChallengeNotification } from '../components/notifications'

function RewardsPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedAchievement, setSelectedAchievement] = useState(null)
  const [showAchievementModal, setShowAchievementModal] = useState(false)
  const [isPrivacyMode, setIsPrivacyMode] = useState(true)
  const [showLevelUpAnimation, setShowLevelUpAnimation] = useState(false)
  const [recentlyEarnedPoints, setRecentlyEarnedPoints] = useState(0)
  const [achievementNotification, setAchievementNotification] = useState(null)
  const [challengeNotification, setChallengeNotification] = useState(null)
  
  const { addNotification } = useNotifications()

  // Mock user data with enhanced features
  const userStats = {
    currentLevel: 3,
    currentLevelName: 'Explorer',
    currentPoints: 245,
    nextLevelPoints: 300,
    totalPoints: 1245,
    levelUpAnimation: showLevelUpAnimation,
    pointsGained: recentlyEarnedPoints,
    achievements: [
      { 
        id: 'first-trip', 
        name: 'First Journey', 
        icon: '🚗', 
        description: 'Complete your first trip',
        earned: true, 
        date: '2024-01-15',
        points: 10,
        type: 'first',
        isNew: false
      },
      { 
        id: 'week-streak', 
        name: 'Week Warrior', 
        icon: '🔥', 
        description: '7 days of consistent tracking',
        earned: true, 
        date: '2024-02-01',
        points: 25,
        type: 'streak',
        isNew: true
      },
      { 
        id: 'eco-champion', 
        name: 'Eco Champion', 
        icon: '🌱', 
        description: 'Use sustainable transport 10 times',
        earned: true, 
        date: '2024-02-10',
        points: 50,
        type: 'milestone',
        isNew: false
      }
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

  const handleAchievementClick = (achievement) => {
    setSelectedAchievement(achievement)
    setShowAchievementModal(true)
  }

  const handleShowAchievementModal = (achievement) => {
    setSelectedAchievement(achievement)
    setShowAchievementModal(true)
  }

  const handleRedeemRewards = () => {
    // Simulate reward redemption with level up
    setRecentlyEarnedPoints(75)
    setShowLevelUpAnimation(true)
    
    // Create achievement notification
    const levelUpAchievement = {
      id: 'level-up-' + Date.now(),
      name: 'Level Up!',
      description: `Congratulations! You've reached Level ${userStats.currentLevel + 1}!`,
      category: 'level',
      rarity: 'epic',
      points: 75,
      earnedAt: new Date().toISOString()
    }
    
    // Show achievement notification
    setAchievementNotification(levelUpAchievement)
    
    // Add to notification center
    addNotification({
      type: NOTIFICATION_TYPES.ACHIEVEMENT,
      priority: NOTIFICATION_PRIORITY.HIGH,
      title: '🎉 Level Up!',
      message: `Congratulations! You've reached Level ${userStats.currentLevel + 1}!`,
      data: levelUpAchievement
    })
    
    // Reset animation after 3 seconds
    setTimeout(() => {
      setShowLevelUpAnimation(false)
    }, 4000)
  }

  const handleChallengeClick = (challenge) => {
    // Simulate challenge completion
    if (challenge.progress >= challenge.target) {
      const completedChallenge = {
        ...challenge,
        completed: true,
        completedAt: new Date().toISOString()
      }
      
      // Show challenge completion notification
      setChallengeNotification(completedChallenge)
      
      // Add to notification center
      addNotification({
        type: NOTIFICATION_TYPES.CHALLENGE,
        priority: NOTIFICATION_PRIORITY.HIGH,
        title: '🎆 Challenge Complete!',
        message: `You completed the ${challenge.name} and earned ${challenge.reward} points!`,
        data: completedChallenge
      })
    } else {
      // Show challenge progress
      setChallengeNotification({
        ...challenge,
        progressUpdate: true
      })
    }
  }

  const handlePrivacyToggle = () => {
    setIsPrivacyMode(!isPrivacyMode)
  }

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: Trophy },
    { id: 'achievements', name: 'Badges', icon: Star },
    { id: 'challenges', name: 'Challenges', icon: Target },
    { id: 'leaderboard', name: 'Leaderboard', icon: Users }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'achievements':
        return (
          <BadgeGallery
            onAchievementClick={handleAchievementClick}
            showAll={true}
          />
        )
      case 'challenges':
        return (
          <WeeklyChallenges
            onChallengeClick={handleChallengeClick}
          />
        )
      case 'leaderboard':
        return (
          <Leaderboard
            isPrivacyMode={isPrivacyMode}
            onPrivacyToggle={handlePrivacyToggle}
          />
        )
      case 'dashboard':
      default:
        return (
          <RewardsDashboard
            userStats={userStats}
            onRedeemRewards={handleRedeemRewards}
            onAchievementClick={handleAchievementClick}
            onShowAchievementModal={handleShowAchievementModal}
          />
        )
    }
  }
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg sticky top-0 z-40">
        <div className="px-4 py-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <Trophy size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Rewards Center</h1>
              <p className="text-primary-100 text-sm">Track progress and earn amazing rewards</p>
            </div>
            <div className="ml-auto">
              <Sparkles size={20} className="text-yellow-300 animate-sparkle" />
            </div>
          </div>
          
          {/* Quick stats */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <Star size={14} className="text-yellow-300" />
              <span>{userStats.totalPoints} points</span>
            </div>
            <div className="flex items-center space-x-1">
              <Target size={14} className="text-green-300" />
              <span>Level {userStats.currentLevel}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Gift size={14} className="text-pink-300" />
              <span>{userStats.achievements?.filter(a => a.earned).length || 0} badges</span>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-100 sticky top-28 z-30 shadow-sm">
        <div className="px-4">
          <div className="flex space-x-1 overflow-x-auto py-3">
            {tabs.map((tab) => {
              const IconComponent = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 hover:scale-105 ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700 border border-primary-200 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <IconComponent size={16} className={activeTab === tab.id ? 'animate-bounce' : ''} />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="px-4 py-6">
        <div className="animate-fade-in">
          {renderTabContent()}
        </div>
      </main>

      {/* Achievement Modal */}
      <AchievementModal
        isOpen={showAchievementModal}
        onClose={() => {
          setShowAchievementModal(false)
          setSelectedAchievement(null)
        }}
        achievement={selectedAchievement}
        points={selectedAchievement?.points || 0}
        isLevelUp={selectedAchievement?.type === 'level'}
        showCelebration={true}
      />
      
      {/* Achievement Notification */}
      {achievementNotification && (
        <AchievementNotification
          achievement={achievementNotification}
          onDismiss={() => setAchievementNotification(null)}
          onViewRewards={() => {
            setAchievementNotification(null)
            setActiveTab('dashboard')
          }}
        />
      )}
      
      {/* Challenge Notification */}
      {challengeNotification && (
        <ChallengeNotification
          challenge={challengeNotification}
          onAccept={(challenge) => {
            console.log('Challenge accepted:', challenge)
            setChallengeNotification(null)
          }}
          onDecline={() => setChallengeNotification(null)}
          onViewProgress={(challenge) => {
            console.log('View challenge progress:', challenge)
            setChallengeNotification(null)
            setActiveTab('challenges')
          }}
        />
      )}
    </div>
  )
}

export default RewardsPage