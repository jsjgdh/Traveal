import { render, screen } from '@testing-library/react'
import { useResponsiveDesign } from '../utils/appUtils'

// Mock window resize event
const resizeEvent = new Event('resize', { bubbles: true })
const orientationEvent = new Event('orientationchange', { bubbles: true })

// Mock window dimensions
const mockWindowDimensions = (width, height) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width
  })
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height
  })
}

// Mock touch support
const mockTouchSupport = (hasTouch) => {
  Object.defineProperty(navigator, 'maxTouchPoints', {
    writable: true,
    configurable: true,
    value: hasTouch ? 1 : 0
  })
}

// Test component that uses the hook
const TestComponent = () => {
  const { 
    deviceInfo, 
    getResponsivePadding, 
    getContainerMaxWidth, 
    getTouchTargetSize,
    getResponsiveTextSize
  } = useResponsiveDesign()
  
  return (
    <div>
      <div data-testid="device-info">
        {JSON.stringify(deviceInfo)}
      </div>
      <div data-testid="responsive-padding">
        {getResponsivePadding()}
      </div>
      <div data-testid="container-width">
        {getContainerMaxWidth()}
      </div>
      <div data-testid="touch-target-size">
        {getTouchTargetSize()}
      </div>
      <div data-testid="text-size-base">
        {getResponsiveTextSize('base')}
      </div>
    </div>
  )
}

describe('Responsive Design Utilities', () => {
  beforeEach(() => {
    // Reset mocks
    mockWindowDimensions(375, 667)
    mockTouchSupport(true)
  })

  test('detects mobile device correctly', () => {
    mockWindowDimensions(375, 667)
    window.dispatchEvent(resizeEvent)
    
    render(<TestComponent />)
    
    const deviceInfo = JSON.parse(screen.getByTestId('device-info').textContent)
    expect(deviceInfo.isMobile).toBe(true)
    expect(deviceInfo.isTablet).toBe(false)
    expect(deviceInfo.isDesktop).toBe(false)
    expect(deviceInfo.screenSize).toBe('sm')
  })

  test('detects tablet device correctly', () => {
    mockWindowDimensions(768, 1024)
    window.dispatchEvent(resizeEvent)
    
    render(<TestComponent />)
    
    const deviceInfo = JSON.parse(screen.getByTestId('device-info').textContent)
    expect(deviceInfo.isMobile).toBe(false)
    expect(deviceInfo.isTablet).toBe(true)
    expect(deviceInfo.isDesktop).toBe(false)
    expect(deviceInfo.screenSize).toBe('lg')
  })

  test('detects desktop device correctly', () => {
    mockWindowDimensions(1200, 800)
    window.dispatchEvent(resizeEvent)
    
    render(<TestComponent />)
    
    const deviceInfo = JSON.parse(screen.getByTestId('device-info').textContent)
    expect(deviceInfo.isMobile).toBe(false)
    expect(deviceInfo.isTablet).toBe(false)
    expect(deviceInfo.isDesktop).toBe(true)
    expect(deviceInfo.screenSize).toBe('xl')
  })

  test('provides correct responsive padding for small screens', () => {
    mockWindowDimensions(320, 568)
    window.dispatchEvent(resizeEvent)
    
    render(<TestComponent />)
    
    expect(screen.getByTestId('responsive-padding').textContent).toBe('px-2')
  })

  test('provides correct responsive padding for large screens', () => {
    mockWindowDimensions(1200, 800)
    window.dispatchEvent(resizeEvent)
    
    render(<TestComponent />)
    
    expect(screen.getByTestId('responsive-padding').textContent).toBe('px-8')
  })

  test('provides correct touch target sizes', () => {
    mockWindowDimensions(375, 667)
    mockTouchSupport(true)
    window.dispatchEvent(resizeEvent)
    
    render(<TestComponent />)
    
    expect(screen.getByTestId('touch-target-size').textContent).toBe('min-h-11 min-w-11')
  })

  test('handles orientation changes', () => {
    mockWindowDimensions(667, 375) // Landscape
    window.dispatchEvent(orientationEvent)
    
    render(<TestComponent />)
    
    const deviceInfo = JSON.parse(screen.getByTestId('device-info').textContent)
    expect(deviceInfo.orientation).toBe('landscape')
  })

  test('provides correct text sizes', () => {
    mockWindowDimensions(375, 667)
    window.dispatchEvent(resizeEvent)
    
    render(<TestComponent />)
    
    expect(screen.getByTestId('text-size-base').textContent).toBe('text-base')
  })
})