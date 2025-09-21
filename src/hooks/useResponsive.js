import { useState, useEffect } from 'react'

/**
 * Custom hook for responsive design
 * Provides device information and responsive breakpoints
 */
export const useResponsive = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isPortrait: true,
    screenSize: 'md',
    isTouchDevice: false
  })

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      
      // Determine device type based on screen width
      const isMobile = width < 768
      const isTablet = width >= 768 && width < 1024
      const isDesktop = width >= 1024
      const isPortrait = height > width
      
      // Determine screen size category
      let screenSize = 'sm' // default
      if (width < 640) {
        screenSize = 'sm'
      } else if (width < 768) {
        screenSize = 'md'
      } else if (width < 1024) {
        screenSize = 'lg'
      } else {
        screenSize = 'xl'
      }
      
      setDeviceInfo({
        width,
        height,
        isMobile,
        isTablet,
        isDesktop,
        isPortrait,
        screenSize,
        isTouchDevice
      })
    }

    // Initial call
    updateDeviceInfo()
    
    // Add event listeners
    window.addEventListener('resize', updateDeviceInfo)
    window.addEventListener('orientationchange', updateDeviceInfo)
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', updateDeviceInfo)
      window.removeEventListener('orientationchange', updateDeviceInfo)
    }
  }, [])

  // Utility functions for responsive design
  const isSmallScreen = deviceInfo.screenSize === 'sm'
  const isMediumScreen = deviceInfo.screenSize === 'md'
  const isLargeScreen = deviceInfo.screenSize === 'lg'
  const isExtraLargeScreen = deviceInfo.screenSize === 'xl'
  
  // Responsive padding utilities
  const getResponsivePadding = () => {
    if (deviceInfo.width < 360) return 'px-2'
    if (deviceInfo.width < 414) return 'px-3'
    if (deviceInfo.width < 640) return 'px-4'
    if (deviceInfo.width < 768) return 'px-5'
    if (deviceInfo.width < 1024) return 'px-6'
    return 'px-8'
  }
  
  // Responsive container max width
  const getContainerMaxWidth = () => {
    if (deviceInfo.isMobile) return 'max-w-md'
    if (deviceInfo.isTablet) return 'max-w-lg'
    return 'max-w-2xl'
  }
  
  // Touch-friendly sizing
  const getTouchTargetSize = () => {
    if (deviceInfo.isTouchDevice) {
      if (deviceInfo.width < 360) return 'min-h-10 min-w-10' // 40px
      if (deviceInfo.width < 414) return 'min-h-11 min-w-11' // 44px
      return 'min-h-12 min-w-12' // 48px
    }
    return 'min-h-8 min-w-8' // 32px for non-touch devices
  }

  return {
    ...deviceInfo,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    isExtraLargeScreen,
    getResponsivePadding,
    getContainerMaxWidth,
    getTouchTargetSize
  }
}

export default useResponsive