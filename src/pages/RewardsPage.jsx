import { useState } from 'react'
import { Gift, Trophy, Star, Target, Users, Calendar, TrendingUp } from 'lucide-react'
import { RewardsDashboard, AchievementModal, BadgeGallery, WeeklyChallenges, Leaderboard } from '../components/rewards'

function RewardsPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedAchievement, setSelectedAchievement] = useState(null)
  const [showAchievementModal, setShowAchievementModal] = useState(false)
  const [isPrivacyMode, setIsPrivacyMode] = useState(true)

  // Mock user data
  const userStats = {
    currentLevel: 3,
    currentLevelName: 'Explorer',
    currentPoints: 245,
    nextLevelPoints: 300,
    totalPoints: 1245
  }

  const handleAchievementClick = (achievement) => {
    setSelectedAchievement(achievement)
    setShowAchievementModal(true)
  }

  const handleRedeemRewards = () => {
    // Implement reward redemption logic
    console.log('Redeem rewards clicked')
  }

  const handleChallengeClick = (challenge) => {
    // Implement challenge detail view
    console.log('Challenge clicked:', challenge)
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
          />
        )
    }
  }
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Rewards Center</h1>
          <p className="text-sm text-gray-600">Track progress and earn rewards</p>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="px-4">
          <div className="flex space-x-1 overflow-x-auto py-2">
            {tabs.map((tab) => {
              const IconComponent = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700 border border-primary-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <IconComponent size={16} />
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
        onClose={() => setShowAchievementModal(false)}
        achievement={selectedAchievement}
        points={selectedAchievement?.points || 0}
      />
    </div>
  )
}

export default RewardsPage