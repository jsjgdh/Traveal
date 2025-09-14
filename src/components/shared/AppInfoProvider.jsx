import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { APP_CONFIG, useAppUpdates } from '../../utils/appUtils'
import { AccessibleModal, AccessibleButton, AccessibleHeading } from './AccessibilityProvider'
import { useHaptic } from './HapticProvider'
import { Download, AlertCircle, CheckCircle, Info, X, Smartphone } from 'lucide-react'

const AppInfoContext = createContext()

// App version and build info component
export const AppVersionInfo = ({ detailed = false, className = '' }) => {
  const buildDate = new Date().toLocaleDateString()
  const environment = APP_CONFIG.environment

  if (!detailed) {
    return (
      <div className={`text-xs text-gray-500 ${className}`}>
        v{APP_CONFIG.version}
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Version:</span>
          <span className="ml-2 font-medium">{APP_CONFIG.version}</span>
        </div>
        <div>
          <span className="text-gray-600">Build:</span>
          <span className="ml-2 font-medium">{APP_CONFIG.buildNumber}</span>
        </div>
        <div>
          <span className="text-gray-600">Environment:</span>
          <span className={`ml-2 font-medium ${
            environment === 'production' ? 'text-green-600' : 
            environment === 'development' ? 'text-yellow-600' : 'text-blue-600'
          }`}>
            {environment}
          </span>
        </div>
        <div>
          <span className="text-gray-600">Build Date:</span>
          <span className="ml-2 font-medium">{buildDate}</span>
        </div>
      </div>
    </div>
  )
}

// Update notification banner
export const UpdateNotificationBanner = () => {
  const { updateAvailable, updateInfo, dismissUpdate } = useAppUpdates()
  const { notification: hapticNotification } = useHaptic()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (updateAvailable) {
      setIsVisible(true)
      hapticNotification()
    }
  }, [updateAvailable, hapticNotification])

  const handleDismiss = useCallback(() => {
    setIsVisible(false)
    setTimeout(() => {
      dismissUpdate()
    }, 300)
  }, [dismissUpdate])

  const handleUpdate = useCallback(() => {
    // In a real app, this would trigger the update process
    window.location.reload()
  }, [])

  if (!updateAvailable || !isVisible) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-40 animate-slide-in-down">
      <div className="bg-blue-600 text-white px-4 py-3 shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Download className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Update Available</p>
              <p className="text-xs text-blue-100 truncate">
                Version {updateInfo?.newVersion} is ready to install
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <AccessibleButton
              variant="ghost"
              size="small"
              onClick={handleUpdate}
              className="text-white hover:bg-blue-500 text-xs px-2 py-1"
              ariaLabel="Install update"
            >
              Update
            </AccessibleButton>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-blue-500 rounded focus:ring-2 focus:ring-blue-300"
              aria-label="Dismiss update notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Detailed update modal
export const UpdateModal = ({ isOpen, onClose, updateInfo }) => {
  const { success: hapticSuccess } = useHaptic()
  
  const handleInstall = useCallback(() => {
    hapticSuccess()
    // In a real app, this would start the update process
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }, [hapticSuccess])

  const formatFeatures = (features) => {
    if (!features || !Array.isArray(features)) return []
    return features.slice(0, 5) // Limit to 5 features
  }

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title="App Update Available"
      size="medium"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Download className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">
              Traveal {updateInfo?.newVersion}
            </h4>
            <p className="text-sm text-gray-600">
              Ready to install
            </p>
          </div>
        </div>

        {updateInfo?.features && updateInfo.features.length > 0 && (
          <div>
            <h5 className="font-medium text-gray-900 mb-3">What's New:</h5>
            <ul className="space-y-2">
              {formatFeatures(updateInfo.features).map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Government Security Notice</p>
              <p className="mt-1">
                This update includes important security improvements and bug fixes. 
                We recommend installing it as soon as possible.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <AccessibleButton
            variant="outline"
            size="medium"
            onClick={onClose}
            className="flex-1"
          >
            Later
          </AccessibleButton>
          <AccessibleButton
            variant="primary"
            size="medium"
            onClick={handleInstall}
            className="flex-1"
          >
            Install Update
          </AccessibleButton>
        </div>
      </div>
    </AccessibleModal>
  )
}

// PWA install prompt
export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const { notification: hapticNotification } = useHaptic()

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault()
      setDeferredPrompt(event)
      
      // Show prompt after a delay if user hasn't dismissed it before
      const dismissed = localStorage.getItem('pwa_install_dismissed')
      if (!dismissed) {
        setTimeout(() => {
          setShowPrompt(true)
          hapticNotification()
        }, 5000)
      }
    }

    const handleAppInstalled = () => {
      setDeferredPrompt(null)
      setShowPrompt(false)
      localStorage.setItem('pwa_installed', 'true')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [hapticNotification])

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return

    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('PWA install accepted')
      } else {
        console.log('PWA install dismissed')
        localStorage.setItem('pwa_install_dismissed', Date.now().toString())
      }
      
      setDeferredPrompt(null)
      setShowPrompt(false)
    } catch (error) {
      console.error('PWA install failed:', error)
    }
  }, [deferredPrompt])

  const handleDismiss = useCallback(() => {
    setShowPrompt(false)
    localStorage.setItem('pwa_install_dismissed', Date.now().toString())
  }, [])

  if (!showPrompt || !deferredPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 animate-slide-in-up">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-5 h-5 text-blue-600" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 text-sm">
              Install Traveal App
            </h4>
            <p className="text-xs text-gray-600 mt-1">
              Add to your home screen for quick access and offline use
            </p>
            
            <div className="flex gap-2 mt-3">
              <AccessibleButton
                variant="primary"
                size="small"
                onClick={handleInstall}
                className="text-xs px-3 py-1.5"
              >
                Install
              </AccessibleButton>
              <AccessibleButton
                variant="ghost"
                size="small"
                onClick={handleDismiss}
                className="text-xs px-3 py-1.5 text-gray-600"
              >
                Not now
              </AccessibleButton>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-gray-100 rounded focus:ring-2 focus:ring-gray-300"
            aria-label="Close install prompt"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  )
}

// System status indicator
export const SystemStatusIndicator = ({ className = '' }) => {
  const [status, setStatus] = useState('checking')
  const [lastCheck, setLastCheck] = useState(null)

  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        // In a real app, this would check backend health
        setStatus('checking')
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock status check
        const isOnline = navigator.onLine
        setStatus(isOnline ? 'operational' : 'offline')
        setLastCheck(new Date())
      } catch (error) {
        setStatus('degraded')
        setLastCheck(new Date())
      }
    }

    checkSystemStatus()
    const interval = setInterval(checkSystemStatus, 60000) // Check every minute

    // Listen for online/offline events
    const handleOnline = () => checkSystemStatus()
    const handleOffline = () => setStatus('offline')

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      clearInterval(interval)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const getStatusInfo = () => {
    switch (status) {
      case 'operational':
        return { color: 'bg-green-500', text: 'All systems operational', icon: CheckCircle }
      case 'degraded':
        return { color: 'bg-yellow-500', text: 'Some services may be slow', icon: AlertCircle }
      case 'offline':
        return { color: 'bg-red-500', text: 'You are offline', icon: AlertCircle }
      case 'checking':
        return { color: 'bg-gray-400 animate-pulse', text: 'Checking status...', icon: Info }
      default:
        return { color: 'bg-gray-400', text: 'Unknown status', icon: Info }
    }
  }

  const statusInfo = getStatusInfo()
  const Icon = statusInfo.icon

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`w-2 h-2 rounded-full ${statusInfo.color}`} />
      <span className="text-xs text-gray-600">{statusInfo.text}</span>
      {lastCheck && (
        <span className="text-xs text-gray-400">
          • {lastCheck.toLocaleTimeString()}
        </span>
      )}
    </div>
  )
}

// App info provider
export const AppInfoProvider = ({ children }) => {
  const { updateAvailable, updateInfo } = useAppUpdates()
  const [showUpdateModal, setShowUpdateModal] = useState(false)

  const contextValue = {
    version: APP_CONFIG.version,
    buildNumber: APP_CONFIG.buildNumber,
    environment: APP_CONFIG.environment,
    updateAvailable,
    updateInfo,
    showUpdateModal: () => setShowUpdateModal(true),
    hideUpdateModal: () => setShowUpdateModal(false)
  }

  return (
    <AppInfoContext.Provider value={contextValue}>
      {children}
      
      <UpdateNotificationBanner />
      <PWAInstallPrompt />
      
      <UpdateModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        updateInfo={updateInfo}
      />
    </AppInfoContext.Provider>
  )
}

// Hook to use app info
export const useAppInfo = () => {
  const context = useContext(AppInfoContext)
  if (!context) {
    throw new Error('useAppInfo must be used within AppInfoProvider')
  }
  return context
}